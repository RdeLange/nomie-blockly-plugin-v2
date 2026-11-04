// A quiet run (a dashboard widget's own run, phase 23) writes no notes, but it runs like any other run: the value it
// shows is kept, and a manual or scheduled run still writes its notes.
import { describe, expect, it } from 'vitest';
import { generateCode } from '../blockly/setup';
import { runWorkspace } from './run';
import type { NomieApi } from '../nomie/api';

const xml = `<xml xmlns="https://developers.google.com/blockly/xml"><block type="s4eblocklyframe"><field name="NAME">none</field><statement name="script"><block type="s4e_logvalue"><value name="Value"><block type="math_number"><field name="NUM">5</field></block></value><value name="Tracker"><block type="s4e_trackers"><field name="Trackers">#mood</field></block></value><value name="Date"><block type="s4e_daypicker"><field name="Day">today</field></block></value></block></statement></block></xml>`;

const runWith = async (options: { quiet?: boolean; test?: boolean }) => {
  const created: string[] = [];
  const api: NomieApi = {
    searchNotes: async () => [],
    getTracker: async () => null,
    getTrackerValues: async () => [],
    createNote: (note: string) => {
      created.push(note);
      return 1;
    },
    alert: () => undefined,
    prompt: async () => null,
    getLocation: async () => null,
    openURL: () => undefined,
    pickTracker: async () => null,
  };
  const result = await runWorkspace({
    api,
    jscode: generateCode(xml),
    scheduled: false,
    schedule: { active: false, start: new Date(), end: new Date() },
    output: () => undefined,
    ...options,
  });
  return { result, created };
};

describe('a quiet run', () => {
  it('writes no note', async () => {
    const { result, created } = await runWith({ quiet: true });
    expect(result.ok).toBe(true);
    expect(created).toEqual([]);
  });

  it('a manual run still writes its note', async () => {
    const { result, created } = await runWith({});
    expect(result.ok).toBe(true);
    expect(created.length).toBe(1);
  });
});
