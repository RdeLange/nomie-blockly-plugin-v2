// Day arithmetic on 'YYYY-MM-DD' keys: whole days, not hours, so a daylight-saving change does not move a day (phase 13).
import { describe, expect, it } from 'vitest';
import { addDays, daysBetweenKeys, dayKeyBack, localDayKey, parseDayKey } from './dates';

describe('day arithmetic across a daylight-saving change', () => {
  // Europe moves its clocks on 29 March 2026
  it('counts whole days over the change', () => {
    expect(daysBetweenKeys('2026-03-28', '2026-03-30')).toBe(2);
    expect(daysBetweenKeys('2026-03-30', '2026-03-28')).toBe(-2);
    expect(daysBetweenKeys('2026-10-30', '2026-11-01')).toBe(2);
  });

  it('goes back whole days over the change', () => {
    expect(dayKeyBack('2026-03-30', 2)).toBe('2026-03-28');
    expect(dayKeyBack('2026-03-29', 1)).toBe('2026-03-28');
    expect(dayKeyBack('2026-11-01', 0)).toBe('2026-11-01');
  });

  it('adding days to a local midnight keeps it on midnight, and on the right day', () => {
    const start = parseDayKey('2026-03-28');
    const later = addDays(start, 2);
    expect(localDayKey(later)).toBe('2026-03-30');
    expect(later.getHours()).toBe(0);
  });
});
