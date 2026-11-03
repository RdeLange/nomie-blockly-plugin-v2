// The note that started a run: its text, its day and the values of its trackers (phase 14).
import { describe, expect, it } from 'vitest';
import type { NomieApi } from '../nomie/api';
import { runWorkspace } from './run';
import { triggerFromNote, triggerFromText } from './note-trigger';

const api: NomieApi = {
  searchNotes: async () => [],
  getTracker: async () => null,
  getTrackerValues: async () => [],
  createNote: () => undefined,
  alert: () => undefined,
  prompt: async () => null,
  getLocation: async () => null,
  openURL: () => undefined,
  pickTracker: async () => null,
};

const note = {
  note: '#run #mood(6) @ana',
  end: new Date(2026, 10, 2, 20).toISOString(),
  elements: [
    { type: 'tracker', id: 'run', prefix: '#' },
    { type: 'tracker', id: 'mood', prefix: '#', value: 6 },
    { type: 'person', id: 'ana', prefix: '@' },
  ],
};

describe('the note that started a run', () => {
  it('has its text, the day it was saved, and the values of its trackers', () => {
    expect(triggerFromNote(note)).toEqual({ text: '#run #mood(6) @ana', day: '2026-11-02', values: { '#mood': 6 } });
  });

  it('a typed note reads its trackers and their values', () => {
    expect(triggerFromText('#mood(2) #run', '2026-11-02')).toEqual({ text: '#mood(2) #run', day: '2026-11-02', values: { '#mood': 2 } });
  });

  it('the blocks read it: text, day, a tracker value, and the start of the day (13:00)', async () => {
    const lines: string[] = [];
    const result = await runWorkspace({
      api,
      jscode: 'alert(noteText()); alert(noteDay()); alert(noteValue("#mood")); alert(noteValue("#sleep") === null ? "none" : "x"); alert(triggerStart().getHours());',
      scheduled: false,
      schedule: { active: false, start: new Date(), end: new Date() },
      output: (t) => lines.push(t),
      note: triggerFromNote(note),
    });
    expect(result.ok).toBe(true);
    expect(lines.filter((t) => !t.startsWith('<< '))).toEqual(['#run #mood(6) @ana', '2026-11-02', '6', 'none', '13']);
  });

  it('outside a note run the blocks give null, and the start is the scheduled day', async () => {
    const lines: string[] = [];
    const day = new Date(2026, 10, 1, 13);
    await runWorkspace({
      api,
      jscode: 'alert(noteText() === null ? "none" : "x"); alert(triggerStart().getDate());',
      scheduled: true,
      schedule: { active: true, start: day, end: day },
      output: (t) => lines.push(t),
    });
    expect(lines.filter((t) => !t.startsWith('<< '))).toEqual(['none', '1']);
  });
});
