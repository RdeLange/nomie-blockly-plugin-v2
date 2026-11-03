// The data blocks: read a tracker's value for a day or a period, and write a value to a day.
// The arithmetic and the search windows are the same as in Nomie Blockly v1.
import { notesOnDay, type NomieApi, type NoteLike } from '../nomie/api';
import { resolveDay } from './dates';
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

// Writes a tracker value into the notes of a day, at 13:00 so that the day does not shift with the time zone.
export const logDailyTrackerValue = (api: NomieApi, value: unknown, tracker: string, rawDay: string): boolean => {
  try {
    const day = resolveDay(clean(rawDay), new Date());
    const [year, month, date] = day.split('-').map(Number);
    const end = new Date(year, month - 1, date, 13, 0, 0);
    api.createNote(`${clean(tracker)}(${formatValue(value)})`, end);
    return true;
  } catch {
    return false;
  }
};
