// Values on the Nomie widget (phase 15): a workspace shows one value with a label, kept in the stored state.
import { describe, expect, it } from 'vitest';
import type { NomieApi } from '../nomie/api';
import { runWorkspace } from './run';
import { readWidgetMap } from './widget';
import { readState } from '../app/state.svelte';

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

const runCode = (jscode: string, test = false) =>
  runWorkspace({
    api,
    jscode,
    scheduled: false,
    schedule: { active: false, start: new Date(), end: new Date() },
    output: () => undefined,
    test,
  });

describe('a value on the widget', () => {
  it('a run sets the value, formatted as a message would show it', async () => {
    const result = await runCode("setWidget('7-day mood', 4.5);");
    expect(result.ok && result.widget).toEqual({ label: '7-day mood', value: '4.5' });
  });

  it('a later call in the same run replaces the value', async () => {
    const result = await runCode("setWidget('a', 1); setWidget('b', 'text');");
    expect(result.ok && result.widget).toEqual({ label: 'b', value: 'text' });
  });

  it('a run that does not set one has no widget value', async () => {
    const result = await runCode("var x = 1;");
    expect(result.ok && 'widget' in result).toBe(false);
  });

  it('a failed run keeps nothing for the widget', async () => {
    const result = await runCode("setWidget('a', 1); missingFunction();");
    expect(result.ok).toBe(false);
    expect('widget' in result).toBe(false);
  });

  it('a test run keeps nothing for the widget', async () => {
    const result = await runCode("setWidget('a', 1);", true);
    expect(result.ok).toBe(true);
    expect('widget' in result).toBe(false);
  });
});

describe('the widget values in the stored state', () => {
  it('a stored state without them reads as none', () => {
    expect(readState({ workspaces: [] }).widget).toEqual({});
    expect(readWidgetMap('nonsense')).toEqual({});
  });

  it('keeps a stored value, and drops one that is not a value', () => {
    const stored = { a: { label: 'Mood', value: '4', at: '2026-11-02T09:02:00.000Z' }, b: { label: 3 } };
    expect(readWidgetMap(stored)).toEqual({ a: { label: 'Mood', value: '4', at: '2026-11-02T09:02:00.000Z' } });
    expect(readState({ workspaces: [], widget: stored }).widget).toEqual(readWidgetMap(stored));
  });
});
