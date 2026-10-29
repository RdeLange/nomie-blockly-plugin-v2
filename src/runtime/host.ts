// The functions a workspace can call. They run inside the js-interpreter sandbox, and each one is a bridge to
// Nomie or to the browser. Nothing else from the page is visible to the workspace.
import Interpreter from 'js-interpreter';
import type { NomieApi } from '../nomie/api';
import { getDailyTrackerValue, getPeriodTrackerValue, logDailyTrackerValue } from './nomie-data';
import { localDayKey, resolveDay } from './dates';

export type ScheduleWindow = { active: boolean; start: Date; end: Date };

export type HostContext = {
  api: NomieApi;
  // true when the run comes from the scheduler: no dialogs are shown for display()
  scheduled: boolean;
  schedule: ScheduleWindow;
  output: (text: string) => void;
  highlight: (blockId: string) => void;
};

// `window.prompt` is what the Text prompt block generates. It is provided here, so workspaces saved with it still run.
export const PRELUDE = 'var window = { prompt: prompt };\n';

const HTTP_TIMEOUT_MS = 15000;

// The date a getdate() call starts from. Blocks pass the loop date as an interpreter object, so read its value.
const dateFrom = (value: unknown): Date => {
  if (value instanceof Date) return value;
  const data = (value as { data?: unknown } | null)?.data;
  if (data instanceof Date) return data;
  const parsed = new Date(value as string);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

export const installHost = (interpreter: any, scope: any, ctx: HostContext) => {
  const native = (name: string, fn: (...args: any[]) => unknown) =>
    interpreter.setProperty(scope, name, interpreter.createNativeFunction(fn));
  // js-interpreter reads the number of arguments from the function's length, and the callback is the last one.
  // A rest-parameter wrapper has length 0, so the length is set to the arguments the block passes, plus the callback.
  const asyncFn = (name: string, fn: (...args: any[]) => Promise<unknown>, arity: number) => {
    const wrapper = (...args: any[]) => {
      const callback = args.pop();
      fn(...args).then(
        (value) => callback(value),
        (error) => {
          ctx.output(`Error: ${String(error)}`);
          callback(null);
        }
      );
    };
    Object.defineProperty(wrapper, 'length', { value: arity + 1 });
    interpreter.setProperty(scope, name, interpreter.createAsyncFunction(wrapper));
  };

  // output that shows in the console of the workspace
  native('alert', (text) => ctx.output(String(text ?? '')));
  // output that goes to the browser console
  native('consolelog', (text) => console.log(text));
  native('highlightBlock', (id) => ctx.highlight(String(id ?? '')));
  // a message to the user. A manual run shows it in a dialog. A scheduled run has no dialog (as in v1), so the
  // message goes to the run's output, and the scheduler puts it in the schedule log in Settings.
  native('display', (text) => {
    if (ctx.scheduled) ctx.output(String(text ?? ''));
    else ctx.api.alert('Message', String(text ?? ''));
  });
  asyncFn('prompt', (text) => ctx.api.prompt('Message', String(text ?? '')), 1);

  native('getdate', (daypicked, date) => resolveDay(String(daypicked), dateFrom(date)));
  native('scheduler_activated', () => ctx.schedule.active);
  native('scheduler_start', () => ctx.schedule.start);
  native('scheduler_end', () => ctx.schedule.end);

  asyncFn('waitForSeconds', (seconds) => new Promise((resolve) => setTimeout(resolve, Number(seconds) * 1000)), 1);

  asyncFn('fetchDayValue', (tracker, day, stats) => getDailyTrackerValue(ctx.api, tracker, day, stats), 3);
  asyncFn('fetchPeriodValue', (trackable, period, stats) => getPeriodTrackerValue(ctx.api, trackable, period, stats), 3);
  asyncFn('logValue', async (value, tracker, day) => logDailyTrackerValue(ctx.api, value, tracker, day), 3);
  // the trackervalue block (kept for older workspaces): today's total
  asyncFn('getPromise', (tracker) => getDailyTrackerValue(ctx.api, tracker, localDayKey(new Date()), 'sum'), 1);

  asyncFn('httpRequest', async (url) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
    try {
      const response = await fetch(String(url), { signal: controller.signal });
      if (!response.ok) return `Error ${response.status}: ${response.statusText}`;
      return await response.text();
    } catch {
      return 'Request failed';
    } finally {
      clearTimeout(timer);
    }
  }, 1);
};

export const createInterpreter = (code: string, ctx: HostContext) =>
  new Interpreter(PRELUDE + code, (interpreter: any, scope: any) => installHost(interpreter, scope, ctx));
