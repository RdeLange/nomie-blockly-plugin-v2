// Running a workspace for a range of days from the editor, and keeping the per-day results of the schedule (phase 8).
import { beforeEach, describe, expect, it } from 'vitest';
import type { NomieApi } from '../nomie/api';
import { appState, readState } from './state.svelte';
import { runDays, scheduleNow } from './actions';
import { runWorkspace } from '../runtime/run';
import type { Workspace } from '../domain/workspace';

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

// A daily workspace that logs the day it runs, and fails on 2 November
const DAY = '<block type="s4e_daypicker"><field name="Day">today</field></block>';
const SCRIPT = `<block type="s4e_logvalue"><value name="Value">${DAY}</value><value name="Tracker"><block type="s4e_trackers"><field name="Trackers">#ran</field></block></value><value name="Date">${DAY}</value>
  <next><block type="controls_if"><value name="IF0"><block type="logic_compare"><field name="OP">EQ</field><value name="A">${DAY}</value><value name="B"><block type="text"><field name="TEXT">2026-11-02</field></block></value></block></value>
  <statement name="DO0"><block type="variables_set"><field name="VAR">x</field><value name="VALUE"><block type="object_from_json"><value name="JSON"><block type="text"><field name="TEXT">not json</field></block></value></block></value></block></statement></block></next></block>`;
const workspace: Workspace = {
  id: 'w',
  name: 'Days',
  displayName: 'Days',
  description: '',
  emoji: '🧱',
  color: '#E3F2FD',
  active: true,
  block: '',
  workspaceBlocks: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="s4eblocklyframe"><field name="NAME">daily</field><statement name="script">${SCRIPT}</statement></block></xml>`,
  workspacePosition: { scrollX: 0, scrollY: 0, scale: 0.8 },
  jscode: '',
  latestrun: '',
  schedule: 'daily',
};

beforeEach(() => {
  created.length = 0;
  appState.loaded = true;
  appState.workspaces = [{ ...workspace }];
  appState.scheduleDays = {};
});

describe('run for days', () => {
  it('runs each day of the range, in order', async () => {
    const seen: string[] = [];
    const days = await runDays(deps, workspace, '2026-10-30', '2026-11-01', { onDay: (day, i, n) => seen.push(`${day} ${i}/${n}`) });
    expect(days.map((d) => [d.day, d.result.ok])).toEqual([
      ['2026-10-30', true],
      ['2026-10-31', true],
      ['2026-11-01', true],
    ]);
    expect(seen).toEqual(['2026-10-30 1/3', '2026-10-31 2/3', '2026-11-01 3/3']);
    expect(created).toEqual(['#ran(2026-10-30)', '#ran(2026-10-31)', '#ran(2026-11-01)']);
  });

  it('stops at the first day that fails', async () => {
    const days = await runDays(deps, workspace, '2026-11-01', '2026-11-03');
    expect(days.map((d) => [d.day, d.result.ok])).toEqual([
      ['2026-11-01', true],
      ['2026-11-02', false],
    ]);
  });
});

describe('the per-day results of the schedule', () => {
  it('are kept per workspace and stored', async () => {
    appState.workspaces[0].latestrun = new Date(2026, 10, 1).toISOString();
    await scheduleNow(deps, new Date(2026, 10, 3, 9));
    const kept = appState.scheduleDays.w;
    expect(kept.map((d) => [d.day, d.ok])).toEqual([
      ['2026-11-01', true],
      ['2026-11-02', false],
    ]);
    expect(kept[1].error).toBeTruthy();
    const stored = appState.toStored();
    expect(readState(stored).scheduledays.w).toEqual(kept);
  });

  it('reads stored state without them, or with something else in their place', () => {
    expect(readState({ workspaces: [] }).scheduledays).toEqual({});
    expect(readState({ workspaces: [], scheduledays: 'nonsense' }).scheduledays).toEqual({});
  });
});

describe('a run reports its progress', () => {
  it('counts its steps as it goes', async () => {
    const steps: number[] = [];
    await runWorkspace({
      api,
      jscode: 'var n = 0; while (n < 20000) { n++; }',
      scheduled: false,
      schedule: { active: false, start: new Date(), end: new Date() },
      onProgress: (s) => steps.push(s),
    });
    expect(steps.length).toBeGreaterThan(1);
    expect(steps).toEqual([...steps].sort((a, b) => a - b));
  });
});

describe('a test run over days', () => {
  it('writes no notes, and lists the note each day would write', async () => {
    const days = await runDays(deps, workspace, '2026-10-30', '2026-11-01', { test: true });
    expect(days.map((d) => [d.day, d.result.ok])).toEqual([
      ['2026-10-30', true],
      ['2026-10-31', true],
      ['2026-11-01', true],
    ]);
    expect(created).toEqual([]);
    expect(days.map((d) => d.output.filter((t) => t.startsWith('Would log')))).toEqual([
      ['Would log #ran(2026-10-30) on 2026-10-30'],
      ['Would log #ran(2026-10-31) on 2026-10-31'],
      ['Would log #ran(2026-11-01) on 2026-11-01'],
    ]);
  });
});
