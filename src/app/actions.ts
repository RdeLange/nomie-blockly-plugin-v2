// What the screens can do: run a workspace, run the schedule, react to a note. They change the app state and save it.
import type { NomieApi } from '../nomie/api';
import type { Workspace } from '../domain/workspace';
import { createRunQueue, runWorkspace, canRun, type RunResult } from '../runtime/run';
import { isDailyWorkspace, runSchedule, type ScheduleOutcome } from '../runtime/scheduler';
import { localDayKey, parseDayKey } from '../runtime/dates';
import { appState } from './state.svelte';

export type Deps = {
  api: NomieApi;
  save: () => void;
};

const DAY_MS = 24 * 60 * 60 * 1000;
// how many runs the log keeps
const LOG_ENTRIES = 40;
const queue = createRunQueue();

export type RunHooks = {
  output?: (text: string) => void;
  highlight?: (blockId: string) => void;
  stop?: { stopped: boolean };
};

// A manual run: the workspace's code, shown as the run goes on. It waits for any run that is already going.
export const runNow = (deps: Deps, workspace: Workspace, hooks: RunHooks = {}): Promise<RunResult> =>
  queue(async () => {
    if (!canRun(workspace.jscode, false)) {
      hooks.output?.('This workspace has no frame. Add the "Scheduler" block to run it.');
      return { ok: false, error: 'no frame' } as RunResult;
    }
    return runWorkspace({
      api: deps.api,
      jscode: workspace.jscode,
      scheduled: false,
      schedule: { active: false, start: new Date(), end: new Date() },
      output: hooks.output,
      highlight: hooks.highlight,
      stop: hooks.stop,
    });
  });

// A run over a range of days (the single iteration of v1). Dialogs stay quiet, as in a scheduled run.
export const runRange = (deps: Deps, workspace: Workspace, start: Date, end: Date, hooks: RunHooks = {}) =>
  queue(() =>
    runWorkspace({
      api: deps.api,
      jscode: workspace.jscode,
      scheduled: true,
      schedule: {
        active: true,
        start: new Date(start.getFullYear(), start.getMonth(), start.getDate(), 13),
        end: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 13),
      },
      output: hooks.output,
      highlight: hooks.highlight,
      stop: hooks.stop,
    })
  );

// One entry in the schedule log: the result, then what the run showed, indented.
const describe = (outcome: ScheduleOutcome): string => {
  if (outcome.result === 'skipped') return `${outcome.displayName}: not scheduled`;
  const shown = (outcome.output ?? []).map((text) => `  ${text}`);
  const head = outcome.result.ok
    ? `${outcome.displayName}: ran ${outcome.from} to ${outcome.to}`
    : `${outcome.displayName}: failed (${outcome.result.error})`;
  return [head, ...shown].join('\n');
};

// Runs the daily workspaces. A workspace's last run moves on only when its run succeeded.
export const scheduleNow = async (deps: Deps, now = new Date()): Promise<ScheduleOutcome[]> => {
  const outcomes = await queue(() =>
    runSchedule(deps.api, appState.workspaces, now)
  );
  for (const outcome of outcomes) {
    if (outcome.result !== 'skipped' && outcome.result.ok) {
      const workspace = appState.workspaces.find((w) => w.id === outcome.id);
      if (workspace) workspace.latestrun = now.toISOString();
    }
  }
  const lines = outcomes.map(describe);
  appState.lastCentralSchedule = now.toISOString();
  if (lines.length) {
    const entry = `Schedule finished ${now.toString()}\n${lines.join('\n')}`;
    appState.centralLog = [entry, ...appState.centralLog.split('\n\n')].slice(0, LOG_ENTRIES).join('\n\n');
  }
  deps.save();
  return outcomes;
};

// Runs the schedule when the last one is more than a day old. Called when the plugin starts, and every hour after.
export const scheduleIfDue = (deps: Deps, now = new Date()) => {
  const last = new Date(appState.lastCentralSchedule).getTime();
  if (Math.abs(now.getTime() - last) / DAY_MS > 1) return scheduleNow(deps, now);
  return undefined;
};

// A note that says "Run Blockly Workspace: <name>" runs that workspace.
export const runFromNote = (deps: Deps, noteText: string) => {
  const matches = appState.workspaces.filter((w) => w.name && noteText.includes(w.name));
  for (const workspace of matches) {
    void runNow(deps, workspace);
  }
  return matches.length;
};

// Sets the day the next scheduled run starts from, for every daily workspace. Nothing runs now.
export const setScheduleStart = (deps: Deps, day: string) => {
  const start = parseDayKey(day);
  let count = 0;
  for (const workspace of appState.workspaces) {
    if (!isDailyWorkspace(workspace.jscode)) continue;
    workspace.latestrun = start.toISOString();
    count += 1;
  }
  appState.centralLog = [`Next run starts from ${day} (${count} workspace${count === 1 ? '' : 's'})`, ...appState.centralLog.split('\n\n')].slice(0, LOG_ENTRIES).join('\n\n');
  deps.save();
  return count;
};
