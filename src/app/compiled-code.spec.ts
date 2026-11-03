// The code a run uses (phase 16). Stored code is used only when this plugin compiled exactly these blocks (C3); an
// import is always compiled again, so a file cannot bring its own code; a v1 state is compiled once and stored.
import { beforeEach, describe, expect, it } from 'vitest';
import type { NomieApi } from '../nomie/api';
import type { Workspace } from '../domain/workspace';
import { workspaceToFile } from '../domain/workspace';
import { fingerprint } from '../domain/fingerprint';
import { appState, readState } from './state.svelte';
import { codeOf, isFresh, refreshCompiled } from './compiler';
import { addWorkspaces } from './editing';
import { compileStale, runNow } from './actions';

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
const deps = { api, save: () => true };

const SHOW = '<block type="pushto_console"><value name="Value"><block type="text"><field name="TEXT">from the blocks</field></block></value></block>';
const BLOCKS = `<xml xmlns="https://developers.google.com/blockly/xml"><block type="s4eblocklyframe"><field name="NAME">none</field><statement name="script">${SHOW}</statement></block></xml>`;
const FORGED = 'alert("forged");';

const workspace = (patch: Partial<Workspace> = {}): Workspace => ({
  id: 'w',
  name: 'w',
  displayName: 'w',
  description: '',
  emoji: '🧱',
  color: '#E3F2FD',
  active: true,
  block: '',
  workspaceBlocks: BLOCKS,
  workspacePosition: { scrollX: 0, scrollY: 0, scale: 0.8 },
  jscode: '',
  latestrun: '',
  schedule: 'none',
  ...patch,
});

beforeEach(() => {
  appState.loaded = true;
  appState.workspaces = [];
  appState.memory = {};
  appState.widget = {};
});

describe('stored code', () => {
  it('is used when this plugin compiled exactly these blocks', async () => {
    const stored = workspace({ jscode: FORGED, compiledFrom: fingerprint(BLOCKS), runnable: true });
    expect(isFresh(stored)).toBe(true);
    expect((await codeOf(stored, { highlight: false })).code).toBe(FORGED);
  });

  it('is not used when the blocks changed since it was compiled', async () => {
    const stale = workspace({ jscode: FORGED, compiledFrom: fingerprint('<xml/>'), runnable: true });
    expect(isFresh(stale)).toBe(false);
    expect((await codeOf(stale, { highlight: false })).code).not.toBe(FORGED);
  });

  it('is never used by the editor, which highlights the blocks as it runs them', async () => {
    const stored = workspace({ jscode: FORGED, compiledFrom: fingerprint(BLOCKS), runnable: true });
    const { code } = await codeOf(stored, { highlight: true });
    expect(code).not.toBe(FORGED);
    expect(code).toContain('highlightBlock');
  });

  it('is never used for a workspace that had errors when it was compiled', async () => {
    const broken = workspace({ jscode: FORGED, compiledFrom: fingerprint(BLOCKS), runnable: false });
    expect(isFresh(broken)).toBe(false);
  });
});

describe('an import is compiled again', () => {
  it('a forged code and fingerprint in a file are replaced by the code of its blocks', async () => {
    await addWorkspaces([workspace({ jscode: FORGED, compiledFrom: fingerprint(BLOCKS), runnable: true })]);
    const added = appState.workspaces[0];
    expect(added.jscode).not.toBe(FORGED);
    expect(added.jscode).toContain('from the blocks');
    expect(added.compiledFrom).toBe(fingerprint(BLOCKS));
  });

  it('a file never carries the fingerprint or the code', () => {
    const file = JSON.parse(workspaceToFile([workspace({ compiledFrom: fingerprint(BLOCKS), runnable: true })]));
    expect(file[0]).not.toHaveProperty('compiledFrom');
    expect(file[0]).not.toHaveProperty('runnable');
  });
});

describe('a v1 state is compiled once and stored', () => {
  it('a workspace without a fingerprint is compiled when the plugin starts, and then it is used as stored', async () => {
    const v1 = { workspaces: [{ id: 'v', name: 'Old', workspaceBlocks: BLOCKS, jscode: FORGED, schedule: 'none' }] };
    appState.load(v1);
    expect(isFresh(appState.workspaces[0])).toBe(false);
    await compileStale(deps);
    expect(isFresh(appState.workspaces[0])).toBe(true);
    expect(appState.workspaces[0].jscode).toContain('from the blocks');
    // the stored state keeps the fingerprint, so the next launch reads it back
    expect(readState(appState.toStored()).workspaces[0].compiledFrom).toBe(fingerprint(BLOCKS));
  });

  it('a stored state without the new fields reads as it did before', () => {
    expect(readState({ workspaces: [{ id: 'v', workspaceBlocks: BLOCKS, jscode: '' }] }).workspaces[0].compiledFrom).toBeUndefined();
  });
});

describe('runs without the editor', () => {
  it('a list run uses the stored code, and the result is the same as a compiled run', async () => {
    const compiled = await refreshCompiled(workspace());
    appState.workspaces = [compiled];
    const lines: string[] = [];
    await runNow(deps, appState.workspaces[0], { output: (t) => lines.push(t) });
    expect(lines).toContain('from the blocks');
  });
});
