// A saved note starts the When-note workspaces with its tracker, once per note, at most 5 times a minute, and never
// for a note the plugin wrote itself. Try with a note runs in test mode (phase 14).
import { beforeEach, describe, expect, it } from 'vitest';
import type { NomieApi } from '../nomie/api';
import type { Workspace } from '../domain/workspace';
import { appState } from './state.svelte';
import { runFromNotes, tryWithNote, NOTE_RUNS_PER_MINUTE } from './actions';
import { rememberWritten } from './written-notes';

const created: string[] = [];
const api: NomieApi = {
  searchNotes: async () => [],
  getTracker: async () => null,
  getTrackerValues: async () => [],
  createNote: (note) => created.push(note),
  alert: () => undefined,
  prompt: async () => null,
  getLocation: async () => null,
  openURL: () => undefined,
  pickTracker: async () => null,
};
const deps = { api, save: () => true };

const TRACKER = (tag: string) => `<block type="s4e_trackers"><field name="Trackers">${tag}</field></block>`;
const SHOW_MOOD = `<block type="pushto_console"><value name="Value"><block type="s4e_notevalue"><value name="Tracker">${TRACKER('#mood')}</value></block></value></block>`;
const WHEN_RUN = `<xml xmlns="https://developers.google.com/blockly/xml"><block type="s4e_whennote" x="20" y="20"><value name="Tracker">${TRACKER('#run')}</value><statement name="script">${SHOW_MOOD}</statement></block></xml>`;

// a saved note as Nomie sends it: its text, its time and its elements
const savedNote = (id: string, text: string, at = new Date(2026, 10, 2, 20)) => {
  const elements = [...text.matchAll(/([#@])([\w-]+)(?:\((-?\d+(?:\.\d+)?)\))?/g)].map((m) => ({
    type: m[1] === '#' ? 'tracker' : 'person',
    id: m[2],
    prefix: m[1],
    ...(m[3] !== undefined ? { value: Number(m[3]) } : {}),
  }));
  return { id, note: text, end: at.toISOString(), elements };
};

const workspace = (id: string, blocks: string): Workspace => ({
  id,
  name: id,
  displayName: id,
  description: '',
  emoji: '🧱',
  color: '#E3F2FD',
  active: true,
  block: '',
  workspaceBlocks: blocks,
  workspacePosition: { scrollX: 0, scrollY: 0, scale: 0.8 },
  jscode: '',
  latestrun: '',
  schedule: 'none',
});

// a When-note workspace as the app keeps it: the tracker it runs on is stored with it
const whenRun = (id: string): Workspace => ({ ...workspace(id, WHEN_RUN), note: '#run' });

let n = 0;
// each test uses its own workspace ids and note ids, so the runs of one test never count against another
const uniq = (label: string) => `${label}-${++n}`;

beforeEach(() => {
  created.length = 0;
  appState.loaded = true;
  appState.notePauses = {};
});

describe('saved notes start When-note workspaces', () => {
  it('a note with the tracker runs the workspace once, with its values', async () => {
    const id = uniq('w');
    appState.workspaces = [whenRun(id)];
    const runs = await runFromNotes(deps, savedNote(uniq('note'), '#run #mood(6)'));
    expect(runs.map((r) => [r.id, r.result.ok, r.output])).toEqual([[id, true, ['6']]]);
  });

  it('a note without the tracker does not run it', async () => {
    appState.workspaces = [whenRun(uniq('w'))];
    expect(await runFromNotes(deps, savedNote(uniq('note'), '#mood(6)'))).toEqual([]);
  });

  it('a note the plugin wrote itself does not start it again', async () => {
    appState.workspaces = [whenRun(uniq('w'))];
    const event = savedNote(uniq('note'), '#run #mood(1)');
    rememberWritten(event.note);
    expect(await runFromNotes(deps, event)).toEqual([]);
  });

  it('the same saved note runs a workspace once', async () => {
    appState.workspaces = [whenRun(uniq('w'))];
    const event = savedNote(uniq('note'), '#run #mood(2)');
    expect(await runFromNotes(deps, event)).toHaveLength(1);
    expect(await runFromNotes(deps, event)).toEqual([]);
  });

  it(`at most ${NOTE_RUNS_PER_MINUTE} runs a minute: the next one is skipped, and the workspace says it is paused`, async () => {
    const id = uniq('w');
    appState.workspaces = [whenRun(id)];
    const now = Date.UTC(2026, 10, 2, 20, 0, 0);
    let ran = 0;
    for (let i = 0; i < NOTE_RUNS_PER_MINUTE + 1; i++) {
      ran += (await runFromNotes(deps, savedNote(uniq('note'), '#run #mood(3)'), now + i * 1000)).length;
    }
    expect(ran).toBe(NOTE_RUNS_PER_MINUTE);
    expect(appState.notePauses[id]).toBeDefined();
  });
});

describe('Try with a note', () => {
  it('runs the workspace in test mode, as if the note was saved', async () => {
    const lines: string[] = [];
    const result = await tryWithNote(deps, whenRun(uniq('w')), '#run #mood(2)', { output: (t) => lines.push(t) });
    expect(result.ok).toBe(true);
    expect(lines.filter((t) => !t.startsWith('<< '))).toEqual(['2']);
    expect(created).toEqual([]);
  });
});
