// The When-note block: a workspace has a Scheduler block or a When-note block, and the note's blocks run once (phase 14).
import { describe, expect, it } from 'vitest';
import Interpreter from 'js-interpreter';
import { compileWorkspace } from './compile';
import { runWorkspace } from '../runtime/run';
import { triggerFromText } from '../runtime/note-trigger';
import type { NomieApi } from '../nomie/api';

const xml = (inner: string) => `<xml xmlns="https://developers.google.com/blockly/xml">${inner}</xml>`;
const TRACKER = (tag: string) => `<block type="s4e_trackers"><field name="Trackers">${tag}</field></block>`;
const SHOW_MOOD = `<block type="pushto_console"><value name="Value"><block type="s4e_notevalue"><value name="Tracker">${TRACKER('#mood')}</value></block></value></block>`;
const whenNote = (script: string, tag = '#run') =>
  `<block type="s4e_whennote" x="20" y="20"><value name="Tracker">${TRACKER(tag)}</value><statement name="script">${script}</statement></block>`;
const scheduler = (script: string) =>
  `<block type="s4eblocklyframe" x="20" y="20"><field name="NAME">daily</field><statement name="script">${script}</statement></block>`;

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

describe('the When-note block', () => {
  it('is a workspace of its own: it names the tracker and has no problems', () => {
    const compiled = compileWorkspace(xml(whenNote(SHOW_MOOD)), { highlight: false });
    expect(compiled.problems.filter((p) => p.level === 'error')).toEqual([]);
    expect(compiled.frame).toBe(true);
    expect(compiled.schedule).toBe('none');
    expect(compiled.note).toBe('#run');
  });

  it('a workspace with both a Scheduler block and a When-note block is an error', () => {
    // two top-level blocks: a Scheduler block and a When-note block
    const compiled = compileWorkspace(xml(scheduler(SHOW_MOOD) + whenNote(SHOW_MOOD)), { highlight: false });
    expect(compiled.problems.some((p) => p.level === 'error' && /Scheduler block and a When-note/.test(p.message))).toBe(true);
  });

  it('a workspace with neither is an error that names both', () => {
    const compiled = compileWorkspace(xml(SHOW_MOOD), { highlight: false });
    expect(compiled.problems.some((p) => p.level === 'error' && /Scheduler block or When-note block/.test(p.message))).toBe(true);
  });

  it('the note value blocks outside a When-note block are a warning', () => {
    const compiled = compileWorkspace(xml(scheduler(SHOW_MOOD)), { highlight: false });
    const reads = (p: { message: string }) => /reads the note that started the run/.test(p.message);
    expect(compiled.problems.some((p) => p.level === 'warning' && reads(p))).toBe(true);
    const inside = compileWorkspace(xml(whenNote(SHOW_MOOD)), { highlight: false });
    expect(inside.problems.some(reads)).toBe(false);
  });

  it('runs its script once, for the day of the note', async () => {
    const compiled = compileWorkspace(xml(whenNote(SHOW_MOOD)), { highlight: false });
    const lines: string[] = [];
    const result = await runWorkspace({
      api,
      jscode: compiled.code,
      scheduled: false,
      schedule: { active: false, start: new Date(), end: new Date() },
      output: (t) => lines.push(t),
      note: triggerFromText('#run #mood(4)', '2026-11-02'),
    });
    expect(result.ok).toBe(true);
    expect(lines.filter((t) => !t.startsWith('<< '))).toEqual(['4']);
  });

  it('generated code parses in the sandbox', () => {
    const compiled = compileWorkspace(xml(whenNote(SHOW_MOOD)), { highlight: true });
    expect(() => new Interpreter(compiled.code)).not.toThrow();
  });
});
