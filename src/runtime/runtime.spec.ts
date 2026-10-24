import { describe, expect, it } from 'vitest';
import type { NomieApi, NoteLike } from '../nomie/api';
import { getDailyTrackerValue, getPeriodTrackerValue, logDailyTrackerValue } from './nomie-data';
import { runWorkspace, canRun, createRunQueue } from './run';
import { scheduleWindow, runSchedule, isDailyWorkspace } from './scheduler';
import { localDayKey, parseDayKey, resolveDay } from './dates';
import { generateCode } from '../blockly/setup';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// A fake Nomie: notes are kept in memory, and every created note is recorded.
const fakeApi = (notes: NoteLike[] = [], trackerValues: number[] = []) => {
  const created: Array<{ note: string; end: Date }> = [];
  const alerts: string[] = [];
  const api: NomieApi = {
    searchNotes: async (term, date, daysBack) => {
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(start.getDate() - daysBack);
      start.setHours(0, 0, 0, 0);
      return notes.filter((n) => {
        const when = new Date(n.end);
        return when >= start && when <= end && (term === '' || n.note.includes(term) || n.elements.some((e) => `${e.prefix ?? ''}${e.id}` === term));
      });
    },
    getTracker: async () => null,
    getTrackerValues: async () => trackerValues,
    createNote: (note, end) => created.push({ note, end }),
    alert: (title, message) => alerts.push(`${title}: ${message}`),
    prompt: async () => 'typed',
  };
  return { api, created, alerts };
};

const moodNote = (day: string, value: number): NoteLike => ({
  note: `#mood(${value})`,
  end: parseDayKey(day).toISOString(),
  elements: [{ type: 'tracker', id: 'mood', prefix: '#', value }],
});

describe('dates', () => {
  it('resolves today and yesterday in local time', () => {
    const run = new Date(2026, 9, 24, 0, 30); // 24 October, 00:30 local
    expect(resolveDay('today', run)).toBe('2026-10-24');
    expect(resolveDay('yesterday', run)).toBe('2026-10-23');
    expect(resolveDay('2026-01-02', run)).toBe('2026-01-02');
    expect(localDayKey(parseDayKey('2026-03-05'))).toBe('2026-03-05');
  });
});

describe('data blocks', () => {
  it('sums a tracker on a day', async () => {
    const { api } = fakeApi([moodNote('2026-10-23', 3), moodNote('2026-10-23', 5)]);
    expect(await getDailyTrackerValue(api, '#mood', '2026-10-23', 'sum')).toBe(8);
  });

  it('averages a tracker, and an average of nothing is 0 (v1 gave NaN)', async () => {
    const { api } = fakeApi([moodNote('2026-10-23', 4)]);
    expect(await getDailyTrackerValue(api, '#mood', '2026-10-23', 'avg')).toBe(4);
    // the brackets that some generated code puts around a value are removed
    expect(await getDailyTrackerValue(api, '(#mood)', '2026-10-23', '(avg)')).toBe(4);
    const empty = fakeApi([]).api;
    expect(await getDailyTrackerValue(empty, '#mood', '2026-10-23', 'avg')).toBe(0);
  });

  it('reads min and max over a period from the tracker usage', async () => {
    const { api } = fakeApi([], [2, 9, 4]);
    expect(await getPeriodTrackerValue(api, '#mood', 'LAST7DAYS', 'Max')).toBe(9);
    expect(await getPeriodTrackerValue(api, '#mood', 'LAST7DAYS', 'Min')).toBe(2);
    expect(await getPeriodTrackerValue(api, '#mood', 'LAST7DAYS', 'avg')).toBeCloseTo(5);
  });

  it('counts the notes that mention a word', async () => {
    const { api } = fakeApi([
      { note: 'Grateful for: the sun', end: new Date().toISOString(), elements: [] },
      { note: 'Grateful for: coffee', end: new Date().toISOString(), elements: [] },
    ]);
    expect(await getPeriodTrackerValue(api, 'gratitude', 'LAST7DAYS', 'sum')).toBe(0);
    expect(await getPeriodTrackerValue(api, 'Grateful', 'LAST7DAYS', 'sum')).toBe(2);
  });

  it('writes a value at 13:00 on the day, so the day does not move with the time zone', () => {
    const { api, created } = fakeApi();
    expect(logDailyTrackerValue(api, 5, '#mood', '2026-10-20')).toBe(true);
    expect(created[0].note).toBe('#mood(5)');
    expect(localDayKey(created[0].end)).toBe('2026-10-20');
    expect(created[0].end.getHours()).toBe(13);
  });
});

describe('running a workspace', () => {
  const example = JSON.parse(readFileSync(join(__dirname, '../test/fixtures/retrieve-data-example.wsp'), 'utf8'))[0];
  const window = { active: false, start: new Date(), end: new Date() };

  it('runs the example and shows its message, without a dialog when not scheduled', async () => {
    const day = localDayKey(new Date(Date.now() - 86400000));
    const { api, alerts } = fakeApi([moodNote(day, 6)]);
    const lines: string[] = [];
    const highlights: string[] = [];
    const result = await runWorkspace({
      api,
      jscode: example.jscode,
      scheduled: false,
      schedule: window,
      output: (t) => lines.push(t),
      highlight: (id) => highlights.push(id),
    });
    expect(result).toEqual({ ok: true });
    expect(alerts.join('\n')).toContain('Your average mood score yesterday was 6');
    expect(lines).toContain('<< Program complete >>');
    expect(highlights.length).toBeGreaterThan(0);
  });

  it('stays quiet about display() when scheduled', async () => {
    const { api, alerts } = fakeApi([]);
    await runWorkspace({ api, jscode: example.jscode, scheduled: true, schedule: window });
    expect(alerts).toEqual([]);
  });

  it('reports a runtime error instead of stalling', async () => {
    const { api } = fakeApi();
    const lines: string[] = [];
    const result = await runWorkspace({
      api,
      jscode: 's4eblocklyframe = "activated";\nundefinedFunction();',
      scheduled: false,
      schedule: window,
      output: (t) => lines.push(t),
    });
    expect(result.ok).toBe(false);
    expect(lines.some((l) => l.startsWith('Error'))).toBe(true);
  });

  it('can be stopped between steps', async () => {
    const { api } = fakeApi();
    const stop = { stopped: true };
    const result = await runWorkspace({ api, jscode: example.jscode, scheduled: false, schedule: window, stop });
    expect(result).toEqual({ ok: false, error: 'stopped' });
  });

  it('runs a queued task only after the one before it', async () => {
    const queue = createRunQueue();
    const order: string[] = [];
    await Promise.all([
      queue(async () => { order.push('a-start'); await new Promise((r) => setTimeout(r, 20)); order.push('a-end'); }),
      queue(async () => { order.push('b'); }),
    ]);
    expect(order).toEqual(['a-start', 'a-end', 'b']);
  });

  it('decides which workspaces can run', () => {
    expect(canRun(example.jscode, false)).toBe(true);
    expect(canRun(example.jscode, true)).toBe(false); // the example has no daily schedule
    expect(canRun('var x = 1;', false)).toBe(false);
  });
});

describe('the scheduler', () => {
  const daily = JSON.parse(readFileSync(join(__dirname, '../test/fixtures/retrieve-data-example.wsp'), 'utf8'))[0];
  const dailyCode = daily.jscode.replace('var schedule = "none";', 'var schedule = "daily";');

  it('runs from the last run to yesterday, and starts 30 days back when it never ran', () => {
    const now = new Date(2026, 9, 24, 9);
    const never = scheduleWindow(undefined, now);
    expect(localDayKey(never.start)).toBe('2026-09-24');
    expect(localDayKey(never.end)).toBe('2026-10-23');
    const lastRun = scheduleWindow(new Date(2026, 9, 20).toISOString(), now);
    expect(localDayKey(lastRun.start)).toBe('2026-10-20');
  });

  it('only schedules workspaces with a daily frame', () => {
    expect(isDailyWorkspace(dailyCode)).toBe(true);
    expect(isDailyWorkspace(daily.jscode)).toBe(false);
  });

  it('skips a workspace that is not daily, and runs the daily one', async () => {
    const { api } = fakeApi([]);
    const outcomes = await runSchedule(
      api,
      [
        { id: 'a', displayName: 'Not daily', jscode: daily.jscode },
        { id: 'b', displayName: 'Daily', jscode: dailyCode },
      ],
      new Date(2026, 9, 24, 9)
    );
    expect(outcomes[0].result).toBe('skipped');
    expect(outcomes[1].result).toEqual({ ok: true });
    expect(outcomes[1].to).toBe('2026-10-23');
  });
});

describe('generated code runs as well as it generates', () => {
  it('compiles a blank frame', async () => {
    const xml = '<xml xmlns="https://developers.google.com/blockly/xml"><block type="s4eblocklyframe"><field name="NAME">none</field></block></xml>';
    const code = generateCode(xml);
    expect((await runWorkspace({ api: fakeApi().api, jscode: code, scheduled: false, schedule: { active: false, start: new Date(), end: new Date() } })).ok).toBe(true);
  });
});
