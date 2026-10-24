import { describe, expect, it } from 'vitest';
import { localDayKey } from './dates';
import { MAX_CATCH_UP_DAYS, parseTypedDay, scheduleWindow } from './scheduler';

const now = new Date(2026, 9, 24, 9);

describe('the scheduler window', () => {
  it('starts 30 days back when a workspace never ran, and ends yesterday', () => {
    const w = scheduleWindow(undefined, now);
    expect(localDayKey(w.start)).toBe('2026-09-24');
    expect(localDayKey(w.end)).toBe('2026-10-23');
  });

  it('starts on the day of the last run', () => {
    const w = scheduleWindow(new Date(2026, 9, 20, 13).toISOString(), now);
    expect(localDayKey(w.start)).toBe('2026-10-20');
  });

  it('never catches up more than the cap, after a long time off', () => {
    const w = scheduleWindow(new Date(2025, 0, 1).toISOString(), now);
    const days = Math.round((w.end.getTime() - w.start.getTime()) / 86400000) + 1;
    expect(days).toBe(MAX_CATCH_UP_DAYS);
    expect(localDayKey(w.end)).toBe('2026-10-23');
  });

  it('ignores a last run date that is not a date', () => {
    const w = scheduleWindow('not a date', now);
    expect(localDayKey(w.start)).toBe('2026-09-24');
  });
});

describe('a day typed in the settings', () => {
  it('accepts a real day', () => {
    expect(parseTypedDay('2026-10-01')).toBe('2026-10-01');
    expect(parseTypedDay(' 2026-02-28 ')).toBe('2026-02-28');
  });
  it('refuses a day that does not exist, or a wrong format', () => {
    expect(parseTypedDay('2026-02-30')).toBeUndefined();
    expect(parseTypedDay('01-10-2026')).toBeUndefined();
    expect(parseTypedDay('yesterday')).toBeUndefined();
  });
});
