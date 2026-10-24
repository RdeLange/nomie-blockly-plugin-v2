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
};

// The days to run: from the last run (or 30 days back, when there was none) to yesterday, both at 13:00
export const scheduleWindow = (latestrun: string | undefined, now: Date) => {
  const last = latestrun ? new Date(latestrun) : addDays(now, -30);
  const start = parseDayKey(localDayKey(isNaN(last.getTime()) ? addDays(now, -30) : last));
  const end = parseDayKey(localDayKey(addDays(now, -1)));
  return { start, end };
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
    const result = await runWorkspace({
      api,
      jscode: workspace.jscode,
      scheduled: true,
      schedule: window,
      output: onOutput,
    });
    outcomes.push({
      id: workspace.id,
      displayName: workspace.displayName,
      from: localDayKey(start),
      to: localDayKey(end),
      result,
    });
  }
  return outcomes;
};
