// The functions a workspace can call. They run inside the js-interpreter sandbox, and each one is a bridge to
// Nomie or to the browser. Nothing else from the page is visible to the workspace.
//
// Every value crosses the sandbox wall through pseudoToNative / nativeToPseudo, so the host functions see plain
// JavaScript values (a list is an array, not an interpreter object), and the workspace gets real values back.
// Every call that waits has a timeout, so a Nomie call that never answers cannot hang the run.
import Interpreter from 'js-interpreter';
import type { NomieApi } from '../nomie/api';
import { getDailyTrackerValue, getPeriodTrackerValue, logDailyTrackerValue } from './nomie-data';
import { localDayKey, resolveDay } from './dates';
import { formatValue } from './format';

export type ScheduleWindow = { active: boolean; start: Date; end: Date };

// How long a call may wait, in milliseconds
export type HostTimeouts = { nomie: number; prompt: number; http: number };

export const DEFAULT_TIMEOUTS: HostTimeouts = {
  nomie: 20_000,
  // a person is typing
  prompt: 10 * 60_000,
  http: 15_000,
};

// The longest a Wait block may wait
export const MAX_WAIT_SECONDS = 600;

export type HostContext = {
  api: NomieApi;
  // true when the run comes from the scheduler: no dialogs are shown for display()
  scheduled: boolean;
  schedule: ScheduleWindow;
  output: (text: string) => void;
  highlight: (blockId: string) => void;
  timeouts?: Partial<HostTimeouts>;
};

// `window.prompt` is what the Text prompt block generates. It is provided here, so workspaces saved with it still run.
export const PRELUDE = 'var window = { prompt: prompt };\n';

// The date a getdate() call starts from: the loop date of the frame block, or a date text.
const dateFrom = (value: unknown): Date => {
  if (value instanceof Date) return value;
  const parsed = new Date(value as string);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

// The address a Fetch data block may call: https, or http upgraded to https (Nomie runs on https, where the browser
// blocks plain http requests anyway). Anything else (file:, data:, a relative path) is refused.
export const webAddress = (text: string): URL | undefined => {
  let url: URL;
  try {
    url = new URL(text.trim());
  } catch {
    return undefined;
  }
  if (url.protocol === 'http:') url.protocol = 'https:';
  return url.protocol === 'https:' ? url : undefined;
};

export const installHost = (interpreter: any, scope: any, ctx: HostContext) => {
  const timeouts = { ...DEFAULT_TIMEOUTS, ...ctx.timeouts };
  const toNative = (value: unknown) => interpreter.pseudoToNative(value);
  const toPseudo = (value: unknown) => interpreter.nativeToPseudo(value ?? null);

  const native = (name: string, fn: (...args: any[]) => unknown) =>
    interpreter.setProperty(
      scope,
      name,
      interpreter.createNativeFunction((...args: unknown[]) => toPseudo(fn(...args.map(toNative))))
    );

  // js-interpreter reads the number of arguments from the function's length, and the callback is the last one.
  // A rest-parameter wrapper has length 0, so the length is set to the arguments the block passes, plus the callback.
  // The callback is called exactly once: with the value, with null after an error, or with null after the timeout.
  const asyncFn = (name: string, fn: (...args: any[]) => Promise<unknown>, arity: number, timeoutMs?: number) => {
    const wrapper = (...args: unknown[]) => {
      const callback = args.pop() as (value: unknown) => void;
      let settled = false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const settle = (value: unknown) => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        callback(toPseudo(value));
      };
      if (timeoutMs !== undefined) {
        timer = setTimeout(() => {
          ctx.output(`Error: ${name} did not answer in ${Math.round(timeoutMs / 1000)} s`);
          settle(null);
        }, timeoutMs);
      }
      let pending: Promise<unknown>;
      try {
        pending = Promise.resolve(fn(...args.map(toNative)));
      } catch (error) {
        pending = Promise.reject(error);
      }
      pending.then(settle, (error) => {
        ctx.output(`Error in ${name}: ${String(error)}`);
        settle(null);
      });
    };
    Object.defineProperty(wrapper, 'length', { value: arity + 1 });
    interpreter.setProperty(scope, name, interpreter.createAsyncFunction(wrapper));
  };

  // output that shows in the console of the workspace
  native('alert', (value) => ctx.output(formatValue(value)));
  // output that goes to the browser console
  native('consolelog', (value) => console.log(value));
  native('highlightBlock', (id) => ctx.highlight(String(id ?? '')));
  // a message to the user. A manual run shows it in a dialog. A scheduled run has no dialog (as in v1), so the
  // message goes to the run's output, and the scheduler puts it in the schedule log in Settings.
  native('display', (value) => {
    if (ctx.scheduled) ctx.output(formatValue(value));
    else ctx.api.alert('Message', formatValue(value));
  });
  asyncFn('prompt', (text) => ctx.api.prompt('Message', formatValue(text)), 1, timeouts.prompt);

  // The day the run is at: the Scheduler block's loop variable. Read from the sandbox, so the code v1 generated
  // (which does not pass it) gets the right day too. Undefined outside a Scheduler block.
  const loopDay = (): Date | undefined => {
    const loop = toNative(interpreter.getProperty(scope, 'loop'));
    return loop instanceof Date && !isNaN(loop.getTime()) ? loop : undefined;
  };

  native('getdate', (daypicked, date) => resolveDay(String(daypicked), dateFrom(date)));
  native('scheduler_activated', () => ctx.schedule.active);
  native('scheduler_start', () => ctx.schedule.start);
  native('scheduler_end', () => ctx.schedule.end);

  asyncFn(
    'waitForSeconds',
    (seconds) => {
      const wait = Math.min(Math.max(Number(seconds) || 0, 0), MAX_WAIT_SECONDS);
      return new Promise((resolve) => setTimeout(resolve, wait * 1000));
    },
    1
  );

  asyncFn('fetchDayValue', (tracker, day, stats) => getDailyTrackerValue(ctx.api, tracker, day, stats), 3, timeouts.nomie);
  asyncFn(
    'fetchPeriodValue',
    (trackable, period, stats) => getPeriodTrackerValue(ctx.api, trackable, period, stats, loopDay()),
    3,
    timeouts.nomie
  );
  asyncFn('logValue', async (value, tracker, day) => logDailyTrackerValue(ctx.api, value, tracker, day), 3, timeouts.nomie);
  // the trackervalue block (kept for older workspaces): the total of the day the run is at
  asyncFn('getPromise', (tracker) => getDailyTrackerValue(ctx.api, tracker, localDayKey(loopDay() ?? new Date()), 'sum'), 1, timeouts.nomie);

  asyncFn(
    'httpRequest',
    async (url) => {
      const address = webAddress(String(url));
      if (!address) return 'Error: only web addresses (https://) can be fetched';
      // the run's output names every host a workspace talks to
      ctx.output(`Request to ${address.host}`);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeouts.http);
      try {
        const response = await fetch(address.href, { signal: controller.signal });
        if (!response.ok) return `Error ${response.status}: ${response.statusText}`;
        return await response.text();
      } catch {
        return 'Request failed';
      } finally {
        clearTimeout(timer);
      }
    },
    1,
    // the request aborts itself at the http timeout; this is the backstop
    timeouts.http + 1000
  );
};

export const createInterpreter = (code: string, ctx: HostContext) =>
  new Interpreter(PRELUDE + code, (interpreter: any, scope: any) => installHost(interpreter, scope, ctx));
