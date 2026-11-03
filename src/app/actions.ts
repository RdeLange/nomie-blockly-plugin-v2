// What the screens can do: run a workspace, run the schedule, react to a note. They change the app state and save it.
import type { NomieApi } from '../nomie/api';
import type { Workspace } from '../domain/workspace';
import { createRunQueue, runWorkspace, RUN_DEADLINE_MS, type RunResult } from '../runtime/run';
import { MAX_CATCH_UP_DAYS, runSchedule, type ScheduledWorkspace, type ScheduleOutcome } from '../runtime/scheduler';
import type { ScheduleWindow } from '../runtime/host';
import { compileWorkspace, hasErrors, workspaceInfo, type CompiledWorkspace } from '../blockly/compile';
import { localDayKey, parseDayKey } from '../runtime/dates';
import { appState } from './state.svelte';

export type Deps = {
  api: NomieApi;
  // saves the app state; false (or a rejected promise) when it was not saved
  save: () => Promise<boolean> | boolean | void;
};

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
  const days = outcome.days ?? [];
  const failed = days.find((d) => !d.result.ok);
  let head: string;
  if (outcome.result.ok) head = `${outcome.displayName}: ran ${outcome.from} to ${outcome.to}`;
  else if (failed) {
    const done = days.length - 1;
    const before = done ? `ran ${done} day${done === 1 ? '' : 's'}, then ` : '';
    head = `${outcome.displayName}: ${before}failed on ${failed.day} (${outcome.result.error}); the next run starts at ${failed.day}`;
  } else head = `${outcome.displayName}: failed (${outcome.result.error})`;
  return [head, ...shown].join('\n');
};

// Runs the daily workspaces, one day at a time. A workspace's latestrun moves on after each day that ran well and is
// saved straight away, so a failure later on (or Nomie closing) does not run that day again.
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
  const progress = (id: string, nextDay: string) => {
    const workspace = appState.workspaces.find((w) => w.id === id);
    if (!workspace) return;
    workspace.latestrun = parseDayKey(nextDay).toISOString();
    void deps.save();
  };
  const ran = await queue(
    () => runSchedule(deps.api, runnable, now, undefined, progress),
    (error): ScheduleOutcome[] => [{ id: '', displayName: 'Schedule', result: { ok: false, error } }],
    // the schedule runs every workspace in one task, so it gets a full run's time for every day it may catch up;
    // each run ends on its own long before that, this only guards against something outside the runs being stuck
    RUN_DEADLINE_MS * Math.max(1, runnable.length) * MAX_CATCH_UP_DAYS
  );
  const outcomes = [...ran, ...broken];
  const lines = outcomes.map(describe);
  appState.lastCentralSchedule = now.toISOString();
  if (lines.length) {
    const entry = `Schedule finished ${now.toString()}\n${lines.join('\n')}`;
    appState.centralLog = [entry, ...appState.centralLog.split('\n\n')].slice(0, LOG_ENTRIES).join('\n\n');
  }
  await deps.save();
  return outcomes;
};

// Due once per calendar day: when the last schedule ran on an earlier day than today (or never ran). A last run in
// the future (the clock went back) is not due. v1 waited 24 hours, so the time of day drifted from day to day.
export const isScheduleDue = (lastCentralSchedule: string, now: Date): boolean => {
  if (!lastCentralSchedule) return true;
  const last = new Date(lastCentralSchedule);
  if (isNaN(last.getTime())) return true;
  return localDayKey(last) < localDayKey(now);
};

// Runs the schedule when it is due. Called when the plugin starts, and every hour after. Nothing happens before the
// stored state is loaded: a schedule then would run no workspaces and save an empty list over the stored one.
export const scheduleIfDue = (deps: Deps, now = new Date()) => {
  if (!appState.loaded) return undefined;
  if (isScheduleDue(appState.lastCentralSchedule, now)) return scheduleNow(deps, now);
  return undefined;
};

const NOTE_TRIGGER = /Run Blockly Workspace:[ \t]*([^\n\r]+)/i;

// A note with the line "Run Blockly Workspace: <name>" runs the workspace with exactly that name (any case).
export const runFromNote = (deps: Deps, noteText: string): Workspace[] => {
  const name = NOTE_TRIGGER.exec(noteText)?.[1].trim().toLowerCase();
  if (!name) return [];
  const matches = appState.workspaces.filter((w) => w.name.trim().toLowerCase() === name);
  for (const workspace of matches) {
    void runNow(deps, workspace);
  }
  return matches;
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
  void deps.save();
  return count;
};
