// Runs one workspace. Only one run goes at a time: the queue makes a scheduled run wait for a manual run, and
// the other way round. v1 polled with timers for that, and two runs could still overlap.
import type { NomieApi } from '../nomie/api';
import { createInterpreter, type ScheduleWindow } from './host';

export type RunOptions = {
  api: NomieApi;
  jscode: string;
  // a scheduled run (daily schedule, or a single iteration over a date range) shows no dialogs
  scheduled: boolean;
  schedule: ScheduleWindow;
  output?: (text: string) => void;
  highlight?: (blockId: string) => void;
  // set to true to stop the run after its current step
  stop?: { stopped: boolean };
};

export type RunResult = { ok: true } | { ok: false; error: string };

// A workspace runs when it has a frame ("activated"). A scheduled run also needs a schedule that is not "none".
export const canRun = (jscode: string, scheduled: boolean): boolean => {
  if (!jscode.includes('s4eblocklyframe = "activated"')) return false;
  return scheduled ? !jscode.includes('var schedule = "none"') : true;
};

export const runWorkspace = (options: RunOptions): Promise<RunResult> =>
  new Promise((resolve) => {
    const output = options.output ?? (() => undefined);
    const context = {
      api: options.api,
      scheduled: options.scheduled,
      schedule: options.schedule,
      output,
      highlight: options.highlight ?? (() => undefined),
    };
    let interpreter;
    try {
      interpreter = createInterpreter(options.jscode, context);
    } catch (error) {
      resolve({ ok: false, error: String(error) });
      return;
    }

    const step = () => {
      if (options.stop?.stopped) {
        output('<< Stopped >>');
        resolve({ ok: false, error: 'stopped' });
        return;
      }
      let waiting: boolean;
      try {
        waiting = interpreter.run();
      } catch (error) {
        // a runtime error (v1 stopped without a message and the program looked like it was still running)
        const message = String(error);
        output(`Error: ${message}`);
        resolve({ ok: false, error: message });
        return;
      }
      if (waiting) {
        // a block is waiting for Nomie, the network or a timer
        setTimeout(step, 10);
        return;
      }
      output('<< Program complete >>');
      resolve({ ok: true });
    };
    step();
  });

// Runs are queued, so only one is active at a time.
export const createRunQueue = () => {
  let tail: Promise<unknown> = Promise.resolve();
  return <T>(task: () => Promise<T>): Promise<T> => {
    const next = tail.then(task, task);
    tail = next.catch(() => undefined);
    return next;
  };
};
