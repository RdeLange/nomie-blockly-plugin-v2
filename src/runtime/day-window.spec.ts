// The value of a tracker on one day counts the notes of that day only (L3).
// Nomie's searchNotes(term, date, daysBack) returns the notes from the start of the day `daysBack` days before
// `date` up to the end of `date` (nomie6-oss, plugin-loader.svelte, pluginSearchNotes). The fake below does the same.
import { describe, expect, it } from 'vitest';
import type { NomieApi, NoteLike } from '../nomie/api';
import { notesOnDay } from '../nomie/api';
import { getDailyTrackerValue } from './nomie-data';
import { parseDayKey } from './dates';

const note = (day: string, hour: number, value: number): NoteLike => {
  const end = parseDayKey(day);
  end.setHours(hour);
  return { note: `#mood(${value})`, end: end.getTime(), elements: [{ type: 'tracker', id: 'mood', prefix: '#', value }] };
};

const nomieLike = (notes: NoteLike[]): NomieApi => ({
  searchNotes: async (term, date, daysBack) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - daysBack);
    start.setHours(0, 0, 0, 0);
    return notes.filter((n) => {
      const at = new Date(n.end).getTime();
      return at >= start.getTime() && at <= end.getTime() && n.note.includes(term);
    });
  },
  getTracker: async () => null,
  getTrackerValues: async () => [],
  createNote: () => undefined,
  alert: () => undefined,
  prompt: async () => null,
  getLocation: async () => null,
  openURL: () => undefined,
  pickTracker: async () => null,
});

describe('the notes of one day (L3)', () => {
  const notes = [note('2026-10-22', 23, 1), note('2026-10-23', 0, 3), note('2026-10-23', 23, 4), note('2026-10-24', 8, 5)];

  it('counts only the notes of that day, not the day after (v1 and v2 counted both)', async () => {
    expect(await getDailyTrackerValue(nomieLike(notes), '#mood', '2026-10-23', 'sum')).toBe(7);
  });

  it('keeps the notes at the very start and end of the day', async () => {
    const found = await notesOnDay(nomieLike(notes), '#mood', '2026-10-23');
    expect(found.map((n) => n.note)).toEqual(['#mood(3)', '#mood(4)']);
  });
});
