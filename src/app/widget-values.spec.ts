// A run that ended well sets the workspace's value on the widget, with the time; a failed or test run does not (phase 15).
import { beforeEach, describe, expect, it } from 'vitest';
import type { NomieApi } from '../nomie/api';
import type { Workspace } from '../domain/workspace';
import { appState } from './state.svelte';
import { previewWidget, runNow } from './actions';

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

const SHOW = '<block type="s4e_dashboard"><field name="NAME">7-day mood</field><field name="EMOJI">📊</field><statement name="CONTENT"><block type="s4e_wvalue"><field name="LABEL">7-day mood</field><value name="Value"><block type="math_number"><field name="NUM">4</field></block></value></block></statement></block>';
// sets the value, then fails: remember cannot keep NaN
const NAN_REMEMBER = '<block type="s4e_remember"><field name="NAME">n</field><value name="VALUE"><block type="math_arithmetic"><field name="OP">DIVIDE</field><value name="A"><block type="math_number"><field name="NUM">0</field></block></value><value name="B"><block type="math_number"><field name="NUM">0</field></block></value></block></value></block>';
const FAILS = SHOW.replace('7-day mood', 'broken').replace(/<\/block>$/, `<next>${NAN_REMEMBER}</next></block>`);

const workspace = (id: string, script: string): Workspace => ({
  id,
  name: id,
  displayName: id,
  description: '',
  emoji: '🧱',
  color: '#E3F2FD',
  active: true,
  block: '',
  workspaceBlocks: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="s4eblocklyframe"><field name="NAME">none</field><statement name="script">${script}</statement></block></xml>`,
  workspacePosition: { scrollX: 0, scrollY: 0, scale: 0.8 },
  jscode: '',
  latestrun: '',
  schedule: 'none',
});

beforeEach(() => {
  appState.loaded = true;
  appState.widget = {};
});

describe('a run puts its value on the widget', () => {
  it('a run that ended well keeps the value, its label and the time', async () => {
    const before = Date.now();
    await runNow(deps, workspace('w', SHOW));
    const entry = appState.widget.w;
    expect(entry.components).toEqual([{ kind: 'value', label: '7-day mood', value: '4' }]);
    expect(Date.parse(entry.at)).toBeGreaterThanOrEqual(before);
  });

  it('a failed run leaves the value as it was', async () => {
    await runNow(deps, workspace('w', SHOW));
    const kept = appState.widget.w;
    const failed = await runNow(deps, workspace('w', FAILS));
    expect(failed.ok).toBe(false);
    expect(appState.widget.w).toEqual(kept);
  });

  it('a test run does not change the value', async () => {
    await runNow(deps, workspace('t', SHOW), { test: true });
    expect(appState.widget.t).toBeUndefined();
  });
});

describe('the preview of a widget', () => {
  it('shows the widget a workspace builds, and keeps nothing', async () => {
    const before = appState.widget.p;
    const result = await previewWidget(deps, workspace('p', SHOW));
    expect(result.ok && result.preview?.components).toEqual([{ kind: 'value', label: '7-day mood', value: '4' }]);
    expect(appState.widget.p).toBe(before);
  });
});
