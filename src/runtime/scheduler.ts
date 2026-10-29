// The daily scheduler: each workspace with a daily schedule runs for the days since its last successful run,
// up to yesterday. Workspaces run one after the other.
import type { NomieApi } from '../nomie/api';
import { addDays, localDayKey, parseDayKey } from './dates';
import { canRun, runWorkspace, type RunResult } from './run';

export type ScheduledWorkspace = {
  id: string;
  displayName: string;
  jscode: string;
  latestrun?: string;
};

export type ScheduleOutcome = {
  id: string;
  displayName: string;
  // the days that were run, as 'YYYY-MM-DD'
  from?: string;
  to?: string;
  result: RunResult | 'skipped';
  // what the run showed (display messages and errors), without the end marker
  output?: string[];
};

// The most days one scheduled run covers. After a long time off, the scheduler catches up this far, not further back.
export const MAX_CATCH_UP_DAYS = 60;

// The days to run: from the last run (or 30 days back, when there was none) to yesterday, both at local midnight.
// The start never goes further back than MAX_CATCH_UP_DAYS.
export const scheduleWindow = (latestrun: string | undefined, now: Date) => {
  const end = parseDayKey(localDayKey(addDays(now, -1)));
  const earliest = addDays(end, -(MAX_CATCH_UP_DAYS - 1));
  const last = latestrun ? new Date(latestrun) : undefined;
  let start = last && !isNaN(last.getTime()) ? parseDayKey(localDayKey(last)) : addDays(end, -29);
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

// The schedule for the given workspaces, one at a time. Returns what happened to each one.
export const runSchedule = async (
  api: NomieApi,
  workspaces: ScheduledWorkspace[],
  now: Date,
  onOutput?: (text: string) => void
): Promise<ScheduleOutcome[]> => {
  const outcomes: ScheduleOutcome[] = [];
  for (const workspace of workspaces) {
    if (!isDailyWorkspace(workspace.jscode)) {
      outcomes.push({ id: workspace.id, displayName: workspace.displayName, result: 'skipped' });
      continue;
    }
    const { start, end } = scheduleWindow(workspace.latestrun, now);
    if (end < start) {
      outcomes.push({ id: workspace.id, displayName: workspace.displayName, result: 'skipped' });
      continue;
    }
    // the same window the daily block uses: from the start day to the end day, both at 13:00
    const window = {
      active: true,
      start: new Date(start.getFullYear(), start.getMonth(), start.getDate(), 13),
      end: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 13),
    };
    const shown: string[] = [];
    const result = await runWorkspace({
      api,
      jscode: workspace.jscode,
      scheduled: true,
      schedule: window,
      output: (text) => {
        shown.push(text);
        onOutput?.(text);
      },
    });
    outcomes.push({
      id: workspace.id,
      displayName: workspace.displayName,
      from: localDayKey(start),
      to: localDayKey(end),
      result,
      output: shown.filter((text) => text !== '<< Program complete >>'),
    });
  }
  return outcomes;
};
