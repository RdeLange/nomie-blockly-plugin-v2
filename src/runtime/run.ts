// Runs one workspace. Only one run goes at a time: the queue makes a scheduled run wait for a manual run, and
// the other way round. v1 polled with timers for that, and two runs could still overlap.
import type { NomieApi } from '../nomie/api';
import { createInterpreter, type HostTimeouts, type ScheduleWindow } from './host';

// The interpreter runs in slices of this many milliseconds, and the page gets a turn between slices. Without this,
// an endless loop froze Nomie, and Stop was never read.
const SLICE_MS = 8;
// The most steps one run may take: about 10 to 30 seconds of work on a phone.
export const MAX_STEPS = 5_000_000;
// The longest one run may take, waiting on Nomie and the network included.
export const MAX_RUN_MS = 5 * 60_000;

export type RunOptions = {
  api: NomieApi;
  jscode: string;
  // a scheduled run (daily schedule, or a single iteration over a date range) shows no dialogs
  scheduled: boolean;
  schedule: ScheduleWindow;
  output?: (text: string) => void;
  highlight?: (blockId: string) => void;
  // set to true to stop the run; it stops within one slice, also inside a loop
  stop?: { stopped: boolean };
  maxSteps?: number;
  maxRunMs?: number;
  // how long a host call may wait for Nomie, a prompt or the network (tests use short ones)
  timeouts?: Partial<HostTimeouts>;
  // the number of steps so far, after every slice (the editor shows it while a run goes on)
  onProgress?: (steps: number) => void;
  // a test run writes no notes (see HostContext.test)
  test?: boolean;
};

// blockId: the block that was running when the run failed (only known when the code highlights its blocks)
export type RunResult = { ok: true; steps: number } | { ok: false; error: string; blockId?: string };

// A workspace runs when it has a frame ("activated"). A scheduled run also needs a schedule that is not "none".
export const canRun = (jscode: string, scheduled: boolean): boolean => {
  if (!jscode.includes('s4eblocklyframe = "activated"')) return false;
  return scheduled ? !jscode.includes('var schedule = "none"') : true;
};

export const runWorkspace = (options: RunOptions): Promise<RunResult> =>
  new Promise((resolve) => {
    const output = options.output ?? (() => undefined);
    const maxSteps = options.maxSteps ?? MAX_STEPS;
    const maxRunMs = options.maxRunMs ?? MAX_RUN_MS;
    let lastBlock = '';
    const context = {
      api: options.api,
      scheduled: options.scheduled,
      schedule: options.schedule,
      output,
      highlight: (blockId: string) => {
        lastBlock = blockId;
        options.highlight?.(blockId);
      },
      timeouts: options.timeouts,
      test: options.test,
    };
    const fail = (error: string) => {
      output(`Error: ${error}`);
      resolve(lastBlock ? { ok: false, error, blockId: lastBlock } : { ok: false, error });
    };

    let interpreter: any;
    try {
      interpreter = createInterpreter(options.jscode, context);
    } catch (error) {
      // the code does not parse
      fail(String(error));
      return;
    }

    const started = Date.now();
    let steps = 0;
    const slice = () => {
      if (options.stop?.stopped) {
        output('<< Stopped >>');
        resolve({ ok: false, error: 'stopped' });
        return;
      }
      if (Date.now() - started > maxRunMs) {
        fail(`the run took longer than ${Math.round(maxRunMs / 1000)} seconds`);
        return;
      }
      const sliceEnd = performance.now() + SLICE_MS;
      try {
        while (performance.now() < sliceEnd) {
          // a block is waiting for Nomie, the network or a timer: look again shortly
          if (interpreter.paused_) {
            setTimeout(slice, 10);
            return;
          }
          if (!interpreter.step()) {
            output('<< Program complete >>');
            resolve({ ok: true, steps });
            return;
          }
          steps += 1;
          if (steps > maxSteps) {
            fail('the run took too many steps (is there an endless loop?)');
            return;
          }
        }
      } catch (error) {
        // a runtime error (v1 stopped without a message and the program looked like it was still running)
        fail(String(error));
        return;
      }
      options.onProgress?.(steps);
      // give the page a turn, so Stop and the rest of Nomie keep working, then go on
      setTimeout(slice, 0);
    };
    slice();
  });

// Runs are queued, so only one is active at a time. A run that has not finished after the deadline is given up
// on: the queue moves on, and the late run's result is ignored. Runs end on their own well before this, so the
// deadline only matters when something outside the run is stuck. A task that holds several runs (the daily
// schedule) passes its own, longer deadline.
export const RUN_DEADLINE_MS = MAX_RUN_MS + 30_000;

export const createRunQueue = (defaultDeadlineMs = RUN_DEADLINE_MS) => {
  let tail: Promise<unknown> = Promise.resolve();
  const withDeadline = <T>(task: () => Promise<T>, deadlineMs: number) => (): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`the run did not finish in ${Math.round(deadlineMs / 1000)} seconds`)), deadlineMs);
      task().then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        }
      );
    });
  return <T>(task: () => Promise<T>, deadlineMs = defaultDeadlineMs): Promise<T> => {
    const guarded = withDeadline(task, deadlineMs);
    const next = tail.then(guarded, guarded);
    tail = next.catch(() => undefined);
    return next;
  };
};
