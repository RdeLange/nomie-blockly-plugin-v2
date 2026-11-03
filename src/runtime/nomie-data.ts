// The data blocks: read a tracker's value for a day or a period, and write a value to a day.
// The arithmetic and the search windows are the same as in Nomie Blockly v1.
import { notesOnDay, type NomieApi, type NoteLike } from '../nomie/api';
import { CHART_MAX_DAYS } from './widget';
import { dayKeyBack, daysBetweenKeys, localDayKey, resolveDay } from './dates';
import { formatValue } from './format';

// v1 read these period names as a number of days (TODAY counted as 1, the default is 7)
const PERIOD_DAYS: Record<string, string> = {
  TODAY: '1',
  LAST7DAYS: '7',
  LAST30DAYS: '30',
  LAST60DAYS: '60',
  LAST90DAYS: '90',
};

// The code v1 generated puts brackets around picker values, such as ("sum"), so they are removed here.
const clean = (value: unknown): string => String(value).replace(/[()]/g, '');

// min and max start from the first value, as in v1
const summarise = (values: number[]) => {
  let total = 0;
  let count = 0;
  let min = 0;
  let max = 0;
  for (const value of values) {
    total += value;
    count += 1;
    if (count === 1) min = value;
    if (value > max) max = value;
    if (value < min) min = value;
  }
  return { total, count, min, max };
};

const pick = (stat: string, s: { total: number; count: number; min: number; max: number }) => {
  if (stat === 'sum') return s.total;
  // an average of nothing is 0, not NaN (v1 showed NaN)
  if (stat === 'avg') return s.count ? s.total / s.count : 0;
  if (stat === 'Min') return s.min;
  if (stat === 'Max') return s.max;
  return 0;
};

// The value of a tracker on one day: the notes of that day, summed up with the statistic.
export const getDailyTrackerValue = async (api: NomieApi, rawTracker: string, rawDay: string, rawStats: string) => {
  const tracker = clean(rawTracker);
  const stats = clean(rawStats);
  const day = resolveDay(clean(rawDay), new Date());
  const notes: NoteLike[] = await notesOnDay(api, tracker, day);
  const values: number[] = [];
  for (const note of notes) {
    for (const element of note.elements) {
      if (`${element.prefix ?? ''}${element.id}` === tracker && typeof element.value === 'number') {
        values.push(element.value);
      }
    }
  }
  return pick(stats, summarise(values));
};

// The value of a tracker, or the count of notes that mention a word, over a period that ends on `day` (the day the
// run is for; today by default). v1 always counted back from now, so a catch-up run wrote today's value for every day.
export const getPeriodTrackerValue = async (
  api: NomieApi,
  rawTrackable: string,
  period: string,
  rawStats: string,
  day: Date = new Date()
) => {
  const trackable = clean(rawTrackable);
  const statistic = clean(rawStats);
  const days = parseInt(PERIOD_DAYS[clean(period)] ?? '7', 10);
  const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);

  if (trackable.startsWith('#') || trackable.startsWith('@')) {
    const values = await api.getTrackerValues(trackable, days, end);
    return pick(statistic, summarise(values));
  }

  // A word, not a tracker: the result is the number of notes that mention it
  const notes = await api.searchNotes(trackable, end, days);
  const total = notes.length;
  if (statistic === 'sum') return total;
  if (statistic === 'avg') return total / days;
  return 0;
};

// The note a logged value makes, and the day it goes on ('YYYY-MM-DD'). A test run shows this without writing it.
export const dailyTrackerNote = (value: unknown, tracker: string, rawDay: string) => {
  const day = resolveDay(clean(rawDay), new Date());
  return { day, note: `${clean(tracker)}(${formatValue(value)})` };
};

// Writes a tracker value into the notes of a day, at 13:00 so that the day does not shift with the time zone.
export const logDailyTrackerValue = (api: NomieApi, value: unknown, tracker: string, rawDay: string): boolean => {
  try {
    const { day, note } = dailyTrackerNote(value, tracker, rawDay);
    const [year, month, date] = day.split('-').map(Number);
    const end = new Date(year, month - 1, date, 13, 0, 0);
    api.createNote(note, end);
    return true;
  } catch {
    return false;
  }
};

// ---- history (phase 13): the notes of the days before the loop day, within the 60 days Nomie's search allows.

// The most days a history block looks back, the loop day included
export const MAX_HISTORY_DAYS = 60;

// The notes with the tracker in the `days` days that end on the loop day (the loop day included), latest first
const trackerNotes = async (api: NomieApi, tracker: string, loopDay: Date, days: number): Promise<NoteLike[]> => {
  const daysBack = Math.min(Math.max(days, 1), MAX_HISTORY_DAYS) - 1;
  const notes = await api.searchNotes(tracker, loopDay, daysBack);
  const hasTracker = (note: NoteLike) => note.elements.some((e) => `${e.prefix ?? ''}${e.id}` === tracker);
  return notes.filter(hasTracker).sort((a, b) => new Date(b.end).getTime() - new Date(a.end).getTime());
};

// The value of the latest note with the tracker in the days looked back, or null when there is none with a value
export const getLastTrackerValue = async (api: NomieApi, rawTracker: string, rawDays: unknown, loopDay: Date): Promise<number | null> => {
  const tracker = clean(rawTracker);
  const days = parseInt(clean(rawDays), 10) || 7;
  for (const note of await trackerNotes(api, tracker, loopDay, days)) {
    const element = note.elements.find((e) => `${e.prefix ?? ''}${e.id}` === tracker);
    if (element && typeof element.value === 'number') return element.value;
  }
  return null;
};

// The whole days from the last note with the tracker to the loop day (0 when it was logged that day), or null when
// there is none in the 60 days
export const getDaysSinceTracker = async (api: NomieApi, rawTracker: string, loopDay: Date): Promise<number | null> => {
  const notes = await trackerNotes(api, clean(rawTracker), loopDay, MAX_HISTORY_DAYS);
  if (notes.length === 0) return null;
  return daysBetweenKeys(localDayKey(new Date(notes[0].end)), localDayKey(loopDay));
};

// The days in a row, up to and including the loop day, with a note for the tracker. At most 60 days are counted.
export const getTrackerStreak = async (api: NomieApi, rawTracker: string, loopDay: Date): Promise<number> => {
  const tracker = clean(rawTracker);
  const loopKey = localDayKey(loopDay);
  const logged = new Set((await trackerNotes(api, tracker, loopDay, MAX_HISTORY_DAYS)).map((n) => localDayKey(new Date(n.end))));
  let streak = 0;
  while (streak < MAX_HISTORY_DAYS && logged.has(dayKeyBack(loopKey, streak))) streak += 1;
  return streak;
};

// The note a logNote block writes, and the day it goes on (text as the block gives it, the day 'YYYY-MM-DD')
export const logNoteOn = (api: NomieApi, rawText: unknown, rawDay: string, runDay: Date): boolean => {
  try {
    const day = resolveDay(clean(rawDay), runDay);
    const [year, month, date] = day.split('-').map(Number);
    api.createNote(String(rawText ?? ''), new Date(year, month - 1, date, 13, 0, 0));
    return true;
  } catch {
    return false;
  }
};

// ---- the chart and the trend of a widget (phase 20): one value a day, oldest first, with a gap for a day without a note.
// The notes of a day are summed, as a day value is. The count is capped at CHART_MAX_DAYS (the search goes 60 days back).
export const getDailySeries = async (api: NomieApi, rawTracker: string, days: number, loopDay: Date): Promise<Array<number | undefined>> => {
  const tracker = clean(rawTracker);
  const count = Math.min(Math.max(Math.round(days) || 1, 1), CHART_MAX_DAYS);
  const notes = await api.searchNotes(tracker, loopDay, count - 1);
  const sums = new Map<string, number>();
  for (const note of notes) {
    for (const element of note.elements) {
      if (`${element.prefix ?? ''}${element.id}` !== tracker || typeof element.value !== 'number') continue;
      const day = localDayKey(new Date(note.end));
      sums.set(day, (sums.get(day) ?? 0) + element.value);
    }
  }
  const last = localDayKey(loopDay);
  const points: Array<number | undefined> = [];
  for (let k = count - 1; k >= 0; k--) points.push(sums.get(dayKeyBack(last, k)));
  return points;
};
