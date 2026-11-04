// What the screens can do: run a workspace, run the schedule, react to a note. They change the app state and save it.
import type { NomieApi } from '../nomie/api';
import type { Workspace } from '../domain/workspace';
import { createRunQueue, runWorkspace, RUN_DEADLINE_MS, type RunResult } from '../runtime/run';
import { MAX_CATCH_UP_DAYS, runSchedule, type DayOutcome, type ScheduledWorkspace, type ScheduleOutcome } from '../runtime/scheduler';
import type { ScheduleWindow } from '../runtime/host';
import type { Memory } from '../runtime/memory';
import { noteTags, triggerFromNote, triggerFromText, type NoteWithElements, type TriggerNote } from '../runtime/note-trigger';
import { wasWrittenHere } from './written-notes';
import type { WidgetDesign } from '../runtime/widget';
import { applyCompiled, codeOf, hasErrors, isCompiled, refreshCompiled, type RunnableCode } from './compiler';
import { addDays, localDayKey, parseDayKey } from '../runtime/dates';
import { appState, type DayRecord } from './state.svelte';

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
  onProgress?: (steps: number) => void;
  // a test run writes no notes. Only the editor's runs use it; the list, the schedule and note triggers never do.
  test?: boolean;
  // a quiet run writes no notes, and keeps its memory and its widget value: a dashboard widget's own run (phase 23)
  quiet?: boolean;
  // the note that started the run (a When-note workspace), or the note typed in Try with a note
  note?: TriggerNote;
};

// Writes the problems the pre-run check found to the run's output, with the block each one is about.
const reportProblems = (compiled: RunnableCode, hooks: RunHooks) => {
  for (const problem of compiled.problems) {
    const label = problem.blockId ? compiled.labels[problem.blockId] : undefined;
    const where = label ? ` (block "${label}")` : '';
    hooks.output?.(`${problem.level === 'error' ? 'Error' : 'Note'}: ${problem.message}${where}`);
  }
};

const firstError = (compiled: RunnableCode): RunResult => {
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

// The remembered values of a workspace. A workspace with none has no entry.
const keepMemory = (deps: Deps, id: string, memory: Memory) => {
  if (Object.keys(memory).length) appState.memory[id] = memory;
  else delete appState.memory[id];
  void deps.save();
};

// The value a workspace shows on the widget, with the time it was set (phase 15)
const keepWidget = (deps: Deps, id: string, shown: WidgetDesign) => {
  appState.widget[id] = { ...shown, at: new Date().toISOString() };
  void deps.save();
};

// The secret names Settings has: a workspace that uses another one gets a warning before the run
const runCompiled = async (deps: Deps, workspace: Workspace, hooks: RunHooks, scheduled: boolean, schedule: ScheduleWindow) => {
  const compiled = await codeOf(workspace, { highlight: Boolean(hooks.highlight) });
  reportProblems(compiled, hooks);
  if (hasErrors(compiled.problems)) return firstError(compiled);
  return runWorkspace({
    api: deps.api,
    jscode: compiled.code,
    scheduled,
    schedule,
    output: hooks.output,
    highlight: hooks.highlight,
    stop: hooks.stop,
    onProgress: hooks.onProgress,
    test: hooks.test,
    quiet: hooks.quiet,
    memory: appState.memory[workspace.id],
    secrets: { ...appState.secrets },
    note: hooks.note,
  }).then((result) => {
    // a run that ended well keeps what it remembered; a failed or test run keeps nothing
    if (result.ok && result.memory && !hooks.test) keepMemory(deps, workspace.id, result.memory);
    if (result.ok && result.widget && !hooks.test) keepWidget(deps, workspace.id, result.widget);
    return reportBlock(result, compiled.labels, hooks);
  });
};

// A manual run of the workspace's blocks, shown as the run goes on. It waits for any run that is already going.
export const runNow = (deps: Deps, workspace: Workspace, hooks: RunHooks = {}): Promise<RunResult> =>
  queue(() => runCompiled(deps, workspace, hooks, false, { active: false, start: new Date(), end: new Date() }), failedRun);

// A dashboard widget runs its workspace on its own when it has no value, or an old one: no notes are written
export const runWidget = (deps: Deps, workspace: Workspace): Promise<RunResult> =>
  runNow(deps, workspace, { quiet: true });

export type DayHooks = RunHooks & {
  // before each day runs: the day, which one it is (from 1) and how many there are
  onDay?: (day: string, index: number, total: number) => void;
};

// Runs a workspace for each day from `from` to `to` ('YYYY-MM-DD'), as the schedule would, one day at a time. It
// stops at the first day that fails. Nothing is saved: this is for trying a workspace out (the Run tab).
export const runDays = (deps: Deps, workspace: Workspace, from: string, to: string, hooks: DayHooks = {}): Promise<DayOutcome[]> => {
  let start = parseDayKey(from);
  let end = parseDayKey(to);
  if (end < start) [start, end] = [end, start];
  const keys: string[] = [];
  for (let day = start; day <= end && keys.length < MAX_CATCH_UP_DAYS; day = addDays(day, 1)) keys.push(localDayKey(day));
  return queue(
    async () => {
      const compiled = await codeOf(workspace, { highlight: Boolean(hooks.highlight) });
      reportProblems(compiled, hooks);
      if (hasErrors(compiled.problems)) return [{ day: keys[0], result: firstError(compiled), output: [] }];
      const days: DayOutcome[] = [];
      // each day starts from what the day before remembered
      const before = appState.memory[workspace.id] ?? {};
      let memory: Memory = { ...before };
      let widgetShown: WidgetDesign | undefined;
      for (const [i, key] of keys.entries()) {
        hooks.onDay?.(key, i + 1, keys.length);
        hooks.output?.(`— ${key} —`);
        const shown: string[] = [];
        const at13 = new Date(parseDayKey(key).getTime());
        at13.setHours(13);
        const result = await runWorkspace({
          api: deps.api,
          jscode: compiled.code,
          scheduled: true,
          schedule: { active: true, start: at13, end: at13 },
          output: (text) => {
            shown.push(text);
            hooks.output?.(text);
          },
          highlight: hooks.highlight,
          stop: hooks.stop,
          onProgress: hooks.onProgress,
          test: hooks.test,
          memory,
          secrets: { ...appState.secrets },
        });
        if (result.ok && result.memory) memory = result.memory;
        if (result.ok && result.widget) widgetShown = result.widget;
        reportBlock(result, compiled.labels, hooks);
        days.push({ day: key, result, output: shown.filter((t) => !t.startsWith('<< ')) });
        if (!result.ok) break;
      }
      // the values are kept once the whole range has run well, and never by a test run
      const allWell = days.length > 0 && days.every((d) => d.result.ok);
      if (allWell && !hooks.test && JSON.stringify(memory) !== JSON.stringify(before)) keepMemory(deps, workspace.id, memory);
      if (allWell && !hooks.test && widgetShown) keepWidget(deps, workspace.id, widgetShown);
      return days;
    },
    (error): DayOutcome[] => [{ day: keys[0], result: { ok: false, error }, output: [] }],
    RUN_DEADLINE_MS * keys.length
  );
};

// What the Run tab keeps of a scheduled day: its result and the first lines it showed
const DAY_OUTPUT_LINES = 30;
const toRecord = (day: DayOutcome): DayRecord => ({
  day: day.day,
  ok: day.result.ok,
  ...(day.result.ok ? {} : { error: day.result.error }),
  output: day.output.slice(0, DAY_OUTPUT_LINES),
});

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
  const compiled = await Promise.all(
    appState.workspaces.map(async (w) => ({ workspace: w, compiled: await codeOf(w, { highlight: false }) }))
  );
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
      memory: appState.memory[w.id],
    }));
  // after each day that ran well: the day it starts from next, and what the day remembered
  const progress = (id: string, nextDay: string, memory: Memory, shown?: WidgetDesign) => {
    const workspace = appState.workspaces.find((w) => w.id === id);
    if (!workspace) return;
    workspace.latestrun = parseDayKey(nextDay).toISOString();
    keepMemory(deps, id, memory);
    if (shown) keepWidget(deps, id, shown);
  };
  const ran = await queue(
    () => runSchedule(deps.api, runnable, now, undefined, progress, { ...appState.secrets }),
    (error): ScheduleOutcome[] => [{ id: '', displayName: 'Schedule', result: { ok: false, error } }],
    // the schedule runs every workspace in one task, so it gets a full run's time for every day it may catch up;
    // each run ends on its own long before that, this only guards against something outside the runs being stuck
    RUN_DEADLINE_MS * Math.max(1, runnable.length) * MAX_CATCH_UP_DAYS
  );
  const outcomes = [...ran, ...broken];
  // the days of each workspace's run, for its Run tab (only workspaces that still exist)
  const kept = Object.fromEntries(Object.entries(appState.scheduleDays).filter(([id]) => appState.workspaces.some((w) => w.id === id)));
  for (const outcome of ran) if (outcome.days?.length) kept[outcome.id] = outcome.days.map(toRecord);
  appState.scheduleDays = kept;
  // the remembered values of workspaces that were deleted are dropped
  appState.memory = Object.fromEntries(Object.entries(appState.memory).filter(([id]) => appState.workspaces.some((w) => w.id === id)));
  const lines = outcomes.map(describe);
  appState.lastCentralSchedule = now.toISOString();
  if (lines.length) {
    const entry = `Schedule finished ${now.toString()}\n${lines.join('\n')}`;
    appState.centralLog = [entry, ...appState.centralLog.split('\n\n')].slice(0, LOG_ENTRIES).join('\n\n');
  }
  await deps.save();
  return outcomes;
};

// Compiles the workspaces that have no fingerprint of their blocks yet (a v1 state, or one from before phase 16), and
// stores their code. Runs when the plugin starts, so that the next start can use the stored code.
export const compileStale = async (deps: Deps) => {
  const stale = appState.workspaces.filter((w) => !isCompiled(w));
  if (stale.length === 0) return;
  for (const workspace of stale) {
    const compiled = await refreshCompiled(workspace);
    const target = appState.workspaces.find((w) => w.id === workspace.id);
    if (target) applyCompiled(target, compiled);
  }
  await deps.save();
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
    if (workspace.schedule !== 'daily') continue;
    workspace.latestrun = start.toISOString();
    count += 1;
  }
  appState.centralLog = [`Next run starts from ${day} (${count} workspace${count === 1 ? '' : 's'})`, ...appState.centralLog.split('\n\n')].slice(0, LOG_ENTRIES).join('\n\n');
  void deps.save();
  return count;
};

// ---- note triggers (phase 14): a saved note starts the When-note workspaces with its tracker

// A workspace runs at most this many times a minute from notes; past that it is paused, and the list says so
export const NOTE_RUNS_PER_MINUTE = 5;
const MINUTE_MS = 60_000;
// a note runs a workspace once; this is how long the plugin remembers that it did
const NOTE_MEMORY_MS = 10 * MINUTE_MS;
// workspace id → when its note runs started (in the last minute)
const noteRuns = new Map<string, number[]>();
// workspace id and note → when it ran for that note
const seenNotes = new Map<string, number>();

// A saved note as Nomie sends it. A note with an id runs a workspace once; without one, its time and text do.
export type NoteEvent = NoteWithElements & { id?: string };

export type NoteRunOutcome = { id: string; name: string; result: RunResult; output: string[] };

// One run for a note: it goes through the run queue, and its end is written to the log in Settings
const runForNote = (deps: Deps, workspace: Workspace, trigger: TriggerNote, label: string): Promise<NoteRunOutcome> => {
  const output: string[] = [];
  return queue(
    () =>
      runCompiled(deps, workspace, { output: (text) => output.push(text), note: trigger }, false, {
        active: false,
        start: new Date(),
        end: new Date(),
      }),
    failedRun
  ).then((result) => {
    const line = result.ok ? `ran for ${label}` : `failed for ${label} (${result.error})`;
    appState.centralLog = [`${workspace.displayName}: ${line}`, ...appState.centralLog.split('\n\n')].slice(0, LOG_ENTRIES).join('\n\n');
    // the card shows the last note run (phase 17)
    appState.lastTrigger[workspace.id] = {
      at: new Date().toISOString(),
      label,
      ok: result.ok,
      ...(result.ok ? {} : { error: result.error }),
    };
    void deps.save();
    return { id: workspace.id, name: workspace.displayName, result, output: output.filter((t) => !t.startsWith('<< ')) };
  });
};

// The When-note workspaces whose tracker is in a saved note run for it, once per note, and at most
// NOTE_RUNS_PER_MINUTE times a minute. A note the plugin wrote itself starts nothing.
export const runFromNotes = (deps: Deps, raw: NoteEvent, now = Date.now()): Promise<NoteRunOutcome[]> => {
  // a note without its elements or its time (not from Nomie) has no trackers, and is saved now
  const event: NoteEvent = {
    ...raw,
    note: raw.note ?? '',
    elements: Array.isArray(raw.elements) ? raw.elements : [],
    end: raw.end ?? new Date(now),
  };
  if (wasWrittenHere(event.note, now)) return Promise.resolve([]);
  const tags = noteTags(event);
  const trigger = triggerFromNote(event);
  const noteKey = event.id ?? `${String(event.end)}|${event.note}`;
  const starts: Promise<NoteRunOutcome>[] = [];
  for (const workspace of appState.workspaces) {
    const tracker = workspace.note;
    if (!tracker || !tags.includes(tracker)) continue;
    const seenKey = `${workspace.id}|${noteKey}`;
    const seenAt = seenNotes.get(seenKey);
    if (seenAt !== undefined && now - seenAt < NOTE_MEMORY_MS) continue;
    const recent = (noteRuns.get(workspace.id) ?? []).filter((at) => now - at < MINUTE_MS);
    if (recent.length >= NOTE_RUNS_PER_MINUTE) {
      noteRuns.set(workspace.id, recent);
      appState.notePauses[workspace.id] = now;
      continue;
    }
    seenNotes.set(seenKey, now);
    noteRuns.set(workspace.id, [...recent, now]);
    starts.push(runForNote(deps, workspace, trigger, tags.join(' ')));
  }
  for (const [key, at] of seenNotes) if (now - at >= NOTE_MEMORY_MS) seenNotes.delete(key);
  return Promise.all(starts);
};

// Try with a note: the workspace runs in test mode, as if the typed note ('#mood(2) #run') had been saved today
export const tryWithNote = (deps: Deps, workspace: Workspace, text: string, hooks: RunHooks = {}): Promise<RunResult> =>
  queue(
    () =>
      runCompiled(deps, workspace, { ...hooks, test: true, note: triggerFromText(text, localDayKey(new Date())) }, false, {
        active: false,
        start: new Date(),
        end: new Date(),
      }),
    failedRun
  );

// The widget a workspace builds, as a test run builds it: shown in the editor's preview, and kept nowhere (phase 20)
export const previewWidget = (deps: Deps, workspace: Workspace, hooks: RunHooks = {}): Promise<RunResult> =>
  queue(
    () =>
      runCompiled(deps, workspace, { ...hooks, test: true }, false, {
        active: false,
        start: new Date(),
        end: new Date(),
      }),
    failedRun
  );
