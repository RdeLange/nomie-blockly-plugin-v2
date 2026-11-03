// The daily schedule runs one day at a time and keeps its progress per day, so a retry never writes a day twice.
// Period values follow the day being run, not today.
import { describe, expect, it } from 'vitest';
import type { NomieApi, NoteLike } from '../nomie/api';
import { runSchedule } from './scheduler';
import { runWorkspace } from './run';
import { localDayKey } from './dates';

const now = new Date(2026, 9, 24, 9); // 24 October 2026, 09:00

const fakeApi = () => {
  const created: Array<{ note: string; day: string }> = [];
  const usage: Array<{ tag: string; daysBack: number; end?: string }> = [];
  const searches: Array<{ term: string; day: string; daysBack: number }> = [];
  const api: NomieApi = {
    searchNotes: async (term, date, daysBack) => {
      searches.push({ term, day: localDayKey(date), daysBack });
      return [] as NoteLike[];
    },
    getTracker: async () => null,
    getTrackerValues: async (tag, daysBack, end) => {
      usage.push({ tag, daysBack, end: end ? `${localDayKey(end)} ${end.getHours()}:${end.getMinutes()}` : undefined });
      return [1];
    },
    createNote: (note, end) => created.push({ note, day: localDayKey(end) }),
    alert: () => undefined,
    prompt: async () => null,
  };
  return { api, created, usage, searches };
};

// The code a daily Scheduler block generates, with a script that logs one note per day and fails on 23 October
const FAILS_ON_23 = `s4eblocklyframe = "activated";
var schedule = "daily";
if (schedule == "daily") {
var scheduler = scheduler_activated();
var schedulerstart = scheduler_start();
var schedulerend = scheduler_end();
}
else {var scheduler = false;
var schedulerstart = new Date();
var schedulerend = new Date();}
var loop = new Date(schedulerstart);
while(loop <= schedulerend){
var day = getdate("today", loop);
logValue(1, "#ran", day);
if (day == "2026-10-23") { notAFunction(); }
var newDate = loop.setDate(loop.getDate() + 1);
loop = new Date(newDate);}
`;

describe('one day at a time (H6)', () => {
  it('saves the progress of each day that ran, and stops at the first day that fails', async () => {
    const { api, created } = fakeApi();
    const progress: string[] = [];
    const [outcome] = await runSchedule(
      api,
      [{ id: 'a', displayName: 'A', jscode: FAILS_ON_23, latestrun: new Date(2026, 9, 21).toISOString(), daily: true }],
      now,
      undefined,
      (id, nextDay) => progress.push(`${id} ${nextDay}`)
    );
    expect(outcome.days?.map((d) => [d.day, d.result.ok])).toEqual([
      ['2026-10-21', true],
      ['2026-10-22', true],
      ['2026-10-23', false],
    ]);
    expect(outcome.result).toMatchObject({ ok: false });
    // after day 22, the next run starts at day 23
    expect(progress).toEqual(['a 2026-10-22', 'a 2026-10-23']);
    expect(created.map((c) => c.day)).toEqual(['2026-10-21', '2026-10-22', '2026-10-23']);
  });

  it('runs only the failed day again on a retry', async () => {
    const { api, created } = fakeApi();
    const [outcome] = await runSchedule(
      api,
      [{ id: 'a', displayName: 'A', jscode: FAILS_ON_23, latestrun: new Date(2026, 9, 23).toISOString(), daily: true }],
      now
    );
    expect(outcome.days?.map((d) => d.day)).toEqual(['2026-10-23']);
    expect(created.map((c) => c.day)).toEqual(['2026-10-23']);
  });

  it('starts a new daily workspace at yesterday, not 30 days back', async () => {
    const { api, created } = fakeApi();
    const ok = FAILS_ON_23.replace('if (day == "2026-10-23") { notAFunction(); }', '');
    const [outcome] = await runSchedule(api, [{ id: 'a', displayName: 'A', jscode: ok, daily: true }], now);
    expect(outcome.from).toBe('2026-10-23');
    expect(outcome.to).toBe('2026-10-23');
    expect(created.map((c) => c.day)).toEqual(['2026-10-23']);
    expect(outcome.result).toMatchObject({ ok: true });
  });
});

describe('period values follow the day being run (H5)', () => {
  const periodCode = (trackable: string) => `s4eblocklyframe = "activated";
var schedule = "daily";
var schedulerstart = scheduler_start();
var schedulerend = scheduler_end();
var loop = new Date(schedulerstart);
while(loop <= schedulerend){
var v = fetchPeriodValue("${trackable}", ("LAST7DAYS"), ("sum"));
var newDate = loop.setDate(loop.getDate() + 1);
loop = new Date(newDate);}
`;

  it('counts a tracker back from the day being run', async () => {
    const { api, usage } = fakeApi();
    await runWorkspace({
      api,
      jscode: periodCode('#mood'),
      scheduled: true,
      schedule: { active: true, start: new Date(2026, 9, 20, 13), end: new Date(2026, 9, 21, 13) },
    });
    expect(usage).toEqual([
      { tag: '#mood', daysBack: 7, end: '2026-10-20 23:59' },
      { tag: '#mood', daysBack: 7, end: '2026-10-21 23:59' },
    ]);
  });

  it('counts a word back from the day being run', async () => {
    const { api, searches } = fakeApi();
    await runWorkspace({
      api,
      jscode: periodCode('walk'),
      scheduled: true,
      schedule: { active: true, start: new Date(2026, 9, 20, 13), end: new Date(2026, 9, 20, 13) },
    });
    expect(searches).toEqual([{ term: 'walk', day: '2026-10-20', daysBack: 7 }]);
  });

  it('counts back from today when there is no loop day (a block outside the Scheduler block)', async () => {
    const { api, usage } = fakeApi();
    await runWorkspace({
      api,
      jscode: 'var v = fetchPeriodValue("#mood", "LAST7DAYS", "sum");',
      scheduled: false,
      schedule: { active: false, start: new Date(), end: new Date() },
    });
    expect(usage[0].end?.startsWith(localDayKey(new Date()))).toBe(true);
  });
});
