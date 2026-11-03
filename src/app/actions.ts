// What the screens can do: run a workspace, run the schedule, react to a note. They change the app state and save it.
import type { NomieApi } from '../nomie/api';
import type { Workspace } from '../domain/workspace';
import { createRunQueue, runWorkspace, RUN_DEADLINE_MS, type RunResult } from '../runtime/run';
import { runSchedule, type ScheduledWorkspace, type ScheduleOutcome } from '../runtime/scheduler';
import type { ScheduleWindow } from '../runtime/host';
import { compileWorkspace, hasErrors, workspaceInfo, type CompiledWorkspace } from '../blockly/compile';
import { localDayKey, parseDayKey } from '../runtime/dates';
import { appState } from './state.svelte';

export type Deps = {
  api: NomieApi;
  save: () => void;
};

const DAY_MS = 24 * 60 * 60 * 1000;
// how many runs the log keeps
const LOG_ENTRIES = 40;
const runQueue = createRunQueue();
// A run the queue gave up on (see createRunQueue) is reported as a failed run, not as an exception.
const queue = <T>(task: () => Promise<T>, onLate: (error: string) => T, deadlineMs?: number): Promise<T> =>
  runQueue(task, deadlineMs).catch((error: unknown) => onLate(error instanceof Error ? error.message : String(error)));
const failedRun = (error: string): RunResult => ({ ok: false, error });

export type RunHooks = {
  output?: (text: string) => void;
  highlight?: (blockId: string) => void;
  stop?: { stopped: boolean };
};

// Writes the problems the pre-run check found to the run's output, with the block each one is about.
const reportProblems = (compiled: CompiledWorkspace, hooks: RunHooks) => {
  for (const problem of compiled.problems) {
    const label = problem.blockId ? compiled.labels[problem.blockId] : undefined;
    const where = label ? ` (block "${label}")` : '';
    hooks.output?.(`${problem.level === 'error' ? 'Error' : 'Note'}: ${problem.message}${where}`);
  }
};

const firstError = (compiled: CompiledWorkspace): RunResult => {
  const problem = compiled.problems.find((p) => p.level === 'error');
  return problem?.blockId
    ? { ok: false, error: problem.message, blockId: problem.blockId }
    : { ok: false, error: problem?.message ?? 'This workspace cannot run.' };
};

// After a failed run, say in which block it failed, when that is known.
const reportBlock = (result: RunResult, labels: Record<string, string>, hooks: RunHooks): RunResult => {
  if (!result.ok && result.blockId && labels[result.blockId]) {
    hooks.output?.(`This happened in block "${labels[result.blockId]}".`);
  }
  return result;
};

const runCompiled = (deps: Deps, workspace: Workspace, hooks: RunHooks, scheduled: boolean, schedule: ScheduleWindow) => {
  const compiled = compileWorkspace(workspace.workspaceBlocks, { highlight: Boolean(hooks.highlight) });
  reportProblems(compiled, hooks);
  if (hasErrors(compiled.problems)) return Promise.resolve(firstError(compiled));
  return runWorkspace({
    api: deps.api,
    jscode: compiled.code,
    scheduled,
    schedule,
    output: hooks.output,
    highlight: hooks.highlight,
    stop: hooks.stop,
  }).then((result) => reportBlock(result, compiled.labels, hooks));
};

// A manual run of the workspace's blocks, shown as the run goes on. It waits for any run that is already going.
export const runNow = (deps: Deps, workspace: Workspace, hooks: RunHooks = {}): Promise<RunResult> =>
  queue(() => runCompiled(deps, workspace, hooks, false, { active: false, start: new Date(), end: new Date() }), failedRun);

// A run over a range of days (the single iteration of v1). Dialogs stay quiet, as in a scheduled run.
export const runRange = (deps: Deps, workspace: Workspace, start: Date, end: Date, hooks: RunHooks = {}) =>
  queue(
    () =>
      runCompiled(deps, workspace, hooks, true, {
        active: true,
        start: new Date(start.getFullYear(), start.getMonth(), start.getDate(), 13),
        end: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 13),
      }),
    failedRun
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
  // the schedule runs the code of each workspace's blocks; a workspace whose blocks have errors does not run
  const compiled = appState.workspaces.map((w) => ({ workspace: w, compiled: compileWorkspace(w.workspaceBlocks, { highlight: false }) }));
  const broken: ScheduleOutcome[] = compiled
    .filter(({ compiled: c }) => c.schedule === 'daily' && c.frame && hasErrors(c.problems))
    .map(({ workspace: w, compiled: c }) => ({ id: w.id, displayName: w.displayName, result: firstError(c) }));
  const runnable: ScheduledWorkspace[] = compiled
    .filter(({ compiled: c }) => !hasErrors(c.problems))
    .map(({ workspace: w, compiled: c }) => ({
      id: w.id,
      displayName: w.displayName,
      jscode: c.code,
      latestrun: w.latestrun,
      daily: c.frame && c.schedule === 'daily',
    }));
  const ran = await queue(
    () => runSchedule(deps.api, runnable, now),
    (error): ScheduleOutcome[] => [{ id: '', displayName: 'Schedule', result: { ok: false, error } }],
    // the schedule runs every workspace in one task, so each one gets a full run's time
    RUN_DEADLINE_MS * Math.max(1, runnable.length)
  );
  const outcomes = [...ran, ...broken];
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
    const info = workspaceInfo(workspace.workspaceBlocks);
    if (!info.frame || info.schedule !== 'daily') continue;
    workspace.latestrun = start.toISOString();
    count += 1;
  }
  appState.centralLog = [`Next run starts from ${day} (${count} workspace${count === 1 ? '' : 's'})`, ...appState.centralLog.split('\n\n')].slice(0, LOG_ENTRIES).join('\n\n');
  deps.save();
  return count;
};
