// Remembered values in the app: a run keeps them for the next run, a failed or test run keeps nothing (phase 12).
import { beforeEach, describe, expect, it } from 'vitest';
import type { NomieApi } from '../nomie/api';
import type { Workspace } from '../domain/workspace';
import { appState } from './state.svelte';
import { runDays, runNow } from './actions';

const api: NomieApi = {
  searchNotes: async () => [],
  getTracker: async () => null,
  getTrackerValues: async () => [],
  createNote: () => undefined,
  alert: () => undefined,
  prompt: async () => null,
};
let saves = 0;
const deps = {
  api,
  save: () => {
    saves += 1;
    return true;
  },
};

const xml = (script: string) =>
  `<xml xmlns="https://developers.google.com/blockly/xml"><block type="s4eblocklyframe"><field name="NAME">none</field><statement name="script">${script}</statement></block></xml>`;
const REMEMBER =
  '<block type="s4e_remember"><field name="NAME">streak</field><value name="VALUE"><block type="math_number"><field name="NUM">3</field></block></value></block>';
const SHOW =
  '<block type="pushto_console"><value name="Value"><block type="s4e_recall"><field name="NAME">streak</field><value name="DEFAULT"><block type="math_number"><field name="NUM">0</field></block></value></block></value></block>';
// a remember that cannot be stored: NaN is not a JSON value
const FAILS =
  '<block type="s4e_remember"><field name="NAME">n</field><value name="VALUE"><block type="math_arithmetic"><field name="OP">DIVIDE</field><value name="A"><block type="math_number"><field name="NUM">0</field></block></value><value name="B"><block type="math_number"><field name="NUM">0</field></block></value></block></value></block>';

const workspace = (id: string, blocks: string): Workspace => ({
  id,
  name: id,
  displayName: id,
  description: '',
  emoji: '🧱',
  color: '#E3F2FD',
  active: true,
  block: '',
  workspaceBlocks: xml(blocks),
  workspacePosition: { scrollX: 0, scrollY: 0, scale: 0.8 },
  jscode: '',
  latestrun: '',
  schedule: 'none',
});

beforeEach(() => {
  saves = 0;
  appState.loaded = true;
  appState.workspaces = [];
  appState.memory = {};
  appState.secrets = {};
});

describe('remembered values in the app', () => {
  it('a value remembered in one run is recalled in the next, and is saved', async () => {
    await runNow(deps, workspace('w', REMEMBER));
    expect(appState.memory.w).toEqual({ streak: 3 });
    expect(saves).toBeGreaterThan(0);

    const lines: string[] = [];
    await runNow(deps, workspace('w', SHOW), { output: (t) => lines.push(t) });
    expect(lines).toContain('3');
  });

  it('a failed run keeps nothing', async () => {
    const result = await runNow(deps, workspace('w', FAILS));
    expect(result.ok).toBe(false);
    expect(appState.memory.w).toBeUndefined();
  });

  it('a test run keeps nothing', async () => {
    await runNow(deps, workspace('w', REMEMBER), { test: true });
    expect(appState.memory.w).toBeUndefined();
    expect(saves).toBe(0);
  });

  it('a run over days carries a value from one day to the next, and keeps it once the range has run well', async () => {
    // show the value (0 the first day), then remember 3 for the next day
    const showThenRemember = SHOW.replace(/<\/block>$/, `<next>${REMEMBER}</next></block>`);
    const days = await runDays(deps, workspace('d', showThenRemember), '2026-10-30', '2026-10-31');
    expect(days.map((d) => d.result.ok)).toEqual([true, true]);
    expect(days[0].output).toContain('0');
    expect(days[1].output).toContain('3');
    expect(appState.memory.d).toEqual({ streak: 3 });
  });

  it('a range that fails keeps nothing from its days', async () => {
    const remembersThenFails = REMEMBER.replace(/<\/block>$/, `<next>${FAILS}</next></block>`);
    const days = await runDays(deps, workspace('d', remembersThenFails), '2026-10-30', '2026-10-31');
    expect(days.some((d) => !d.result.ok)).toBe(true);
    expect(appState.memory.d).toBeUndefined();
  });
});
