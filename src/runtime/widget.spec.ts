// The dashboard widget a run builds (phase 20): its header, components and footer, with the chart and trend data from
// the notes. A failed or test run keeps nothing.
import { describe, expect, it } from 'vitest';
import type { NomieApi, NoteLike } from '../nomie/api';
import { runWorkspace } from './run';
import { readWidgetMap, headlineOf, TREND_DAYS } from './widget';
import { parseDayKey } from './dates';
import { readState } from '../app/state.svelte';

const moodOn = (day: string, value: number): NoteLike => {
  const at = parseDayKey(day);
  at.setHours(13);
  return { note: `#mood(${value})`, end: at.toISOString(), elements: [{ type: 'tracker', id: 'mood', prefix: '#', value }] };
};

const fakeNomie = (notes: NoteLike[] = []): NomieApi => ({
  searchNotes: async (term, date, daysBack) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - daysBack);
    start.setHours(0, 0, 0, 0);
    return notes.filter((n) => {
      const when = new Date(n.end);
      return when >= start && when <= end && n.elements.some((e) => `${e.prefix ?? ''}${e.id}` === term);
    });
  },
  getTracker: async () => null,
  getTrackerValues: async () => [],
  createNote: () => undefined,
  alert: () => undefined,
  prompt: async () => null,
  getLocation: async () => null,
  openURL: () => undefined,
  pickTracker: async () => null,
});

const LOOP = 'var loop = new Date(2026, 10, 3, 13);\n';
const runCode = (code: string, opts: { test?: boolean; api?: NomieApi } = {}) =>
  runWorkspace({
    api: opts.api ?? fakeNomie(),
    jscode: LOOP + code,
    scheduled: false,
    schedule: { active: false, start: new Date(), end: new Date() },
    output: () => undefined,
    test: opts.test ?? false,
  });

describe('a dashboard widget built by a run', () => {
  it('has the header, the components in order and the footer', async () => {
    const result = await runCode(
      "widgetStart('Mood', '😊'); widgetAdd({ kind: 'value', label: '7-day mood', value: 4.5 }); widgetAdd({ kind: 'value', label: 'Days', value: 'five' }); widgetFooter('updated daily'); widgetEnd();"
    );
    expect(result.ok && result.widget).toEqual({
      name: 'Mood',
      emoji: '😊',
      components: [
        { kind: 'value', label: '7-day mood', value: '4.5' },
        { kind: 'value', label: 'Days', value: 'five' },
      ],
      footer: 'updated daily',
    });
  });

  it('a chart holds one value a day, oldest first, and a day without a note is a gap', async () => {
    const api = fakeNomie([moodOn('2026-11-01', 4), moodOn('2026-11-03', 6), moodOn('2026-11-03', 2)]);
    const result = await runCode(
      "widgetStart('Mood', ''); widgetAdd({ kind: 'chart', label: 'Mood', colour: '#0A6CC9', points: chartPoints('#mood', 3) }); widgetEnd();",
      { api }
    );
    const chart = result.ok && result.widget?.components[0];
    expect(chart).toEqual({ kind: 'chart', label: 'Mood', colour: '#0A6CC9', points: [4, undefined, 8] });
  });

  it('a trend is the last days of a tracker', async () => {
    const api = fakeNomie([moodOn('2026-11-03', 5)]);
    const result = await runCode(
      `widgetStart('Mood', ''); widgetAdd({ kind: 'trend', label: 'Trend', points: chartPoints('#mood', ${TREND_DAYS}) }); widgetEnd();`,
      { api }
    );
    const trend = result.ok && result.widget?.components[0];
    expect(trend && trend.kind === 'trend' && trend.points).toHaveLength(TREND_DAYS);
    expect(trend && trend.kind === 'trend' && trend.points[TREND_DAYS - 1]).toBe(5);
  });

  it('a run that never ends its widget keeps none', async () => {
    const result = await runCode("widgetStart('Mood', ''); widgetAdd({ kind: 'value', label: 'a', value: 1 });");
    expect(result.ok && 'widget' in result).toBe(false);
  });

  it('a failed run keeps no widget, and a test run keeps none either', async () => {
    const failed = await runCode("widgetStart('Mood', ''); widgetAdd({ kind: 'value', label: 'a', value: 1 }); widgetEnd(); missingFunction();");
    expect('widget' in failed).toBe(false);
    const test = await runCode("widgetStart('Mood', ''); widgetAdd({ kind: 'value', label: 'a', value: 1 }); widgetEnd();", { test: true });
    expect(test.ok && 'widget' in test).toBe(false);
    // a test run shows its widget as a preview, which is not kept
    expect(test.ok && test.preview?.components).toEqual([{ kind: 'value', label: 'a', value: '1' }]);
  });
});

describe('the widgets in the stored state', () => {
  it('a stored state without them reads as none', () => {
    expect(readState({ workspaces: [] }).widget).toEqual({});
    expect(readWidgetMap('nonsense')).toEqual({});
  });

  it('a widget of the first version (one label and value) reads as a design with that value', () => {
    const map = readWidgetMap({ a: { label: 'Mood', value: '4', at: '2026-11-02T09:02:00.000Z' }, b: { label: 3 } });
    expect(map).toEqual({ a: { name: '', emoji: '', footer: '', at: '2026-11-02T09:02:00.000Z', components: [{ kind: 'value', label: 'Mood', value: '4' }] } });
    expect(headlineOf(map.a)).toEqual({ label: 'Mood', value: '4' });
  });

  it('a design keeps its components, and drops the ones that are not components', () => {
    const map = readWidgetMap({
      a: { name: 'Mood', emoji: '😊', footer: '', at: 'x', components: [{ kind: 'value', label: 'L', value: '1' }, { kind: 'pie' }] },
    });
    expect(map.a.components).toEqual([{ kind: 'value', label: 'L', value: '1' }]);
  });
});
