// What the screens can do: run a workspace, run the schedule, react to a note. They change the app state and save it.
import type { NomieApi } from '../nomie/api';
import type { Workspace } from '../domain/workspace';
import { createRunQueue, runWorkspace, canRun, type RunResult } from '../runtime/run';
import { runSchedule, type ScheduleOutcome } from '../runtime/scheduler';
import { appState } from './state.svelte';

export type Deps = {
  api: NomieApi;
  save: () => void;
};

const DAY_MS = 24 * 60 * 60 * 1000;
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

const describe = (outcome: ScheduleOutcome): string => {
  if (outcome.result === 'skipped') return `${outcome.displayName}: not scheduled`;
  if (outcome.result.ok) return `${outcome.displayName}: ran ${outcome.from} to ${outcome.to}`;
  return `${outcome.displayName}: failed (${outcome.result.error})`;
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
  if (lines.length) appState.centralLog = `Schedule finished ${now.toString()}\n${lines.join('\n')}\n\n${appState.centralLog}`;
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
