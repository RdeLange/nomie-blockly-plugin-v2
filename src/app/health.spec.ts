// The health line on a card (phase 17): the last scheduled run, or the last note run, and whether it failed.
import { describe, expect, it } from 'vitest';
import { healthOf } from './health';
import { setLanguage } from './i18n.svelte';

const daily = { id: 'w', schedule: 'daily' };
const notes = { id: 'n', schedule: 'none' };

describe('the health of a workspace', () => {
  it('a scheduled run that ran says so', () => {
    expect(healthOf(daily, [{ day: '2026-11-02', ok: true, output: [] }], undefined)).toEqual({ failed: false, text: 'Ran 2026-11-02' });
  });

  it('a scheduled run that failed says the day and the error', () => {
    const days = [
      { day: '2026-11-01', ok: true, output: [] },
      { day: '2026-11-02', ok: false, error: 'the run took too many steps', output: [] },
    ];
    expect(healthOf(daily, days, undefined)).toEqual({ failed: true, text: 'Failed on 2026-11-02: the run took too many steps' });
  });

  it('a note run says when it ran, and whether it failed', () => {
    const at = '2026-11-02T20:00:00.000Z';
    expect(healthOf(notes, undefined, { at, ok: true, label: '#run' })?.failed).toBe(false);
    const failed = healthOf(notes, undefined, { at, ok: false, error: 'Add the secret X in Settings', label: '#run' });
    expect(failed?.failed).toBe(true);
    expect(failed?.text).toMatch(/^Failed on /);
    expect(failed?.text).toMatch(/Add the secret X in Settings$/);
  });

  it('a workspace that has not run has no health', () => {
    expect(healthOf(daily, undefined, undefined)).toBeUndefined();
  });

  it('the health line is in the language of the Nomie user', () => {
    setLanguage('nl');
    const days = [{ day: '2 Nov', ok: true }] as never;
    expect(healthOf(daily, days, undefined)?.text).toBe('Gedraaid op 2 Nov');
    setLanguage('en');
    expect(healthOf(daily, days, undefined)?.text).toBe('Ran 2 Nov');
  });
});
