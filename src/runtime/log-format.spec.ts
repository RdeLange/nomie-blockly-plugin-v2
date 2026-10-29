// The note a Log Value block writes is "#tracker(value)", the same format a note uses in Nomie.
import { describe, expect, it } from 'vitest';
import { logDailyTrackerValue } from './nomie-data';

describe('logValue writes the note the way Nomie reads it', () => {
  it('writes #news(headline) on the given day, at 13:00', () => {
    const written: Array<{ text: string; date: Date }> = [];
    const api = { createNote: (text: string, date: Date) => written.push({ text, date }) } as any;
    const ok = logDailyTrackerValue(api, 'Headline', '#news', '2026-10-20');
    expect(ok).toBe(true);
    expect(written[0].text).toBe('#news(Headline)');
    expect(written[0].date.getFullYear()).toBe(2026);
    expect(written[0].date.getHours()).toBe(13);
  });
});
