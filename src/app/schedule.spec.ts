// The schedule starts only after the stored state is loaded, is due once per calendar day, and a note runs the
// workspace whose name it gives exactly.
import { beforeEach, describe, expect, it } from 'vitest';
import type { NomieApi } from '../nomie/api';
import { appState, readState } from './state.svelte';
import { runFromNote, scheduleIfDue, isScheduleDue } from './actions';
import type { Workspace } from '../domain/workspace';

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

const FRAME =
  '<xml xmlns="https://developers.google.com/blockly/xml"><block type="s4eblocklyframe"><field name="NAME">none</field></block></xml>';
const workspace = (name: string): Workspace => ({
  id: name,
  name,
  displayName: name,
  description: '',
  emoji: '🧱',
  color: '#E3F2FD',
  active: true,
  block: '',
  workspaceBlocks: FRAME,
  workspacePosition: { scrollX: 0, scrollY: 0, scale: 0.8 },
  jscode: '',
  latestrun: '',
  schedule: 'none',
});

beforeEach(() => {
  appState.loaded = false;
  appState.workspaces = [];
  appState.lastCentralSchedule = '';
});

describe('a safe start (M1, M2)', () => {
  it('does nothing before the stored state is loaded, and never saves', async () => {
    let saves = 0;
    const result = scheduleIfDue({ api, save: () => void (saves += 1) }, new Date(2026, 9, 24, 9));
    expect(result).toBeUndefined();
    await new Promise((r) => setTimeout(r, 20));
    expect(saves).toBe(0);
  });

  it('is due once per calendar day, not after 24 hours', () => {
    const lateYesterday = new Date(2026, 9, 23, 23).toISOString();
    expect(isScheduleDue(lateYesterday, new Date(2026, 9, 24, 1))).toBe(true);
    const earlyToday = new Date(2026, 9, 24, 1).toISOString();
    expect(isScheduleDue(earlyToday, new Date(2026, 9, 24, 23))).toBe(false);
  });

  it('is due on the first day of a new install', () => {
    const state = readState({ workspaces: [] });
    expect(state.lastcentralschedule).toBe('');
    expect(isScheduleDue(state.lastcentralschedule, new Date())).toBe(true);
  });

  it('is not due when the clock went back', () => {
    expect(isScheduleDue(new Date(2026, 9, 25, 9).toISOString(), new Date(2026, 9, 24, 9))).toBe(false);
  });
});

describe('the note trigger (M4)', () => {
  beforeEach(() => {
    appState.loaded = true;
    appState.workspaces = [workspace('Mood'), workspace('Mood report')];
  });

  it('runs the workspace whose name the note gives, exactly', () => {
    const deps = { api, save: () => undefined };
    expect(runFromNote(deps, 'Run Blockly Workspace: Mood').map((w) => w.name)).toEqual(['Mood']);
    expect(runFromNote(deps, 'Run Blockly Workspace: mood report\nmore text').map((w) => w.name)).toEqual(['Mood report']);
    expect(runFromNote(deps, 'Mood report is done')).toEqual([]);
  });
});
