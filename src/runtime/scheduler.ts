// The daily scheduler: each workspace with a daily schedule runs for the days since its last successful run,
// up to yesterday. Workspaces run one after the other, and each workspace runs one day at a time: its progress is
// kept after every day, so a retry after a failure starts at the failed day and never writes a day twice.
import type { NomieApi } from '../nomie/api';
import { addDays, localDayKey, parseDayKey } from './dates';
import { canRun, runWorkspace, type RunResult } from './run';
import type { Memory } from './memory';
import type { WidgetLabelValue } from './widget';

export type ScheduledWorkspace = {
  id: string;
  displayName: string;
  jscode: string;
  latestrun?: string;
  // whether it runs daily, read from its blocks; without it, the code is searched as before
  daily?: boolean;
  // the values it remembers between runs; each day that runs well carries them to the next day
  memory?: Memory;
};

// One day of a scheduled run
export type DayOutcome = { day: string; result: RunResult; output: string[] };

export type ScheduleOutcome = {
  id: string;
  displayName: string;
  // the days that were run, as 'YYYY-MM-DD'
  from?: string;
  to?: string;
  result: RunResult | 'skipped';
  // what the run showed (display messages and errors), without the end markers
  output?: string[];
  // each day that ran, in order; the last one is the one that failed, if one did
  days?: DayOutcome[];
};

// The most days one scheduled run covers. After a long time off, the scheduler catches up this far, not further back.
export const MAX_CATCH_UP_DAYS = 60;

// The days to run: from the day of the last run to yesterday, both at local midnight. `latestrun` is the first day
// that has not run yet. A workspace that never ran starts at yesterday (it used to start 30 days back, which wrote
// a month of notes on the first run; Settings can still set an earlier start). The start never goes further back
// than MAX_CATCH_UP_DAYS.
export const scheduleWindow = (latestrun: string | undefined, now: Date) => {
  const end = parseDayKey(localDayKey(addDays(now, -1)));
  const earliest = addDays(end, -(MAX_CATCH_UP_DAYS - 1));
  const last = latestrun ? new Date(latestrun) : undefined;
  let start = last && !isNaN(last.getTime()) ? parseDayKey(localDayKey(last)) : end;
  if (start < earliest) start = earliest;
  return { start, end };
};

// A day typed in the settings, 'YYYY-MM-DD'. Undefined when it is not a real day.
export const parseTypedDay = (text: string): string | undefined => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!match) return undefined;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return undefined;
  return localDayKey(date);
};

export const isDailyWorkspace = (jscode: string): boolean =>
  jscode.includes('var schedule = "daily"') && canRun(jscode, true);

const MARKERS = new Set(['<< Program complete >>', '<< Stopped >>']);

// The schedule for the given workspaces, one at a time, one day at a time. Returns what happened to each one.
// onProgress gets the first day that has not run yet, and the remembered values, after every day that ran well;
// save both: the day is the latestrun, and the values are what the next day starts from.
export const runSchedule = async (
  api: NomieApi,
  workspaces: ScheduledWorkspace[],
  now: Date,
  onOutput?: (text: string) => void,
  onProgress?: (id: string, nextDay: string, memory: Memory, shown?: WidgetLabelValue) => void,
  secrets: Record<string, string> = {}
): Promise<ScheduleOutcome[]> => {
  const outcomes: ScheduleOutcome[] = [];
  for (const workspace of workspaces) {
    if (!(workspace.daily ?? isDailyWorkspace(workspace.jscode))) {
      outcomes.push({ id: workspace.id, displayName: workspace.displayName, result: 'skipped' });
      continue;
    }
    const { start, end } = scheduleWindow(workspace.latestrun, now);
    if (end < start) {
      outcomes.push({ id: workspace.id, displayName: workspace.displayName, result: 'skipped' });
      continue;
    }
    const days: DayOutcome[] = [];
    let result: RunResult = { ok: true, steps: 0 };
    let memory: Memory = { ...(workspace.memory ?? {}) };
    // the widget value of the last day that ran well
    let widgetShown: WidgetLabelValue | undefined;
    for (let day = start; day <= end; day = addDays(day, 1)) {
      // the window the Scheduler block loops over: this one day, at 13:00
      const at13 = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 13);
      const shown: string[] = [];
      const dayResult = await runWorkspace({
        api,
        jscode: workspace.jscode,
        scheduled: true,
        schedule: { active: true, start: at13, end: at13 },
        output: (text) => {
          shown.push(text);
          onOutput?.(text);
        },
        memory,
        secrets,
      });
      if (dayResult.ok && dayResult.memory) memory = dayResult.memory;
      if (dayResult.ok && dayResult.widget) widgetShown = dayResult.widget;
      days.push({ day: localDayKey(day), result: dayResult, output: shown.filter((text) => !MARKERS.has(text)) });
      if (!dayResult.ok) {
        result = dayResult;
        break;
      }
      result = { ok: true, steps: (result.ok ? result.steps : 0) + dayResult.steps };
      onProgress?.(workspace.id, localDayKey(addDays(day, 1)), memory, widgetShown);
    }
    outcomes.push({
      id: workspace.id,
      displayName: workspace.displayName,
      from: localDayKey(start),
      to: localDayKey(end),
      result,
      output: days.flatMap((d) => d.output),
      days,
    });
  }
  return outcomes;
};
