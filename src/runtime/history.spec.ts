// The history blocks: last value, days since, streak, log a note, my location and open link (phase 13).
// The stand-in Nomie keeps the search window of the SDK: from the start of the day `daysBack` before, to the end of the date.
import { describe, expect, it } from 'vitest';
import type { NomieApi, NoteLike } from '../nomie/api';
import { runWorkspace } from './run';
import { dayKeyBack, localDayKey, parseDayKey } from './dates';

const fakeNomie = (notes: NoteLike[] = []) => {
  const created: Array<{ note: string; end: Date }> = [];
  const opened: Array<{ url: string; title: string }> = [];
  const api: NomieApi = {
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
    createNote: (note, end) => created.push({ note, end }),
    alert: () => undefined,
    prompt: async () => null,
    getLocation: () => new Promise(() => undefined), // never answers
    openURL: (url, title) => opened.push({ url, title }),
    pickTracker: async () => null,
  };
  return { api, created, opened };
};

// a mood note on a day, at 13:00 local time
const moodOn = (day: string, value: number): NoteLike => {
  const at = parseDayKey(day);
  at.setHours(13);
  return { note: `#mood(${value})`, end: at.toISOString(), elements: [{ type: 'tracker', id: 'mood', prefix: '#', value }] };
};

// the loop day the run is for: the Scheduler block's loop variable, set by the code of these tests
const LOOP = "var loop = new Date(2026, 10, 3, 13);\n";
const runCode = (code: string, api: NomieApi, extra: Record<string, unknown> = {}) => {
  const lines: string[] = [];
  return runWorkspace({
    api,
    jscode: LOOP + code,
    scheduled: false,
    schedule: { active: false, start: new Date(), end: new Date() },
    output: (text) => lines.push(text),
    ...extra,
  }).then((result) => ({ result, lines: lines.filter((t) => !t.startsWith('<< ')) }));
};

describe('last value of a tracker', () => {
  it('gives the latest value within the days looked back, counting the loop day', async () => {
    const { api } = fakeNomie([moodOn('2026-11-01', 4), moodOn('2026-10-30', 7)]);
    expect((await runCode("alert(lastValue('#mood', 3));", api)).lines).toEqual(['4']);
    expect((await runCode("alert(lastValue('#mood', 1) === null ? 'none' : 'found');", api)).lines).toEqual(['none']);
  });
});

describe('days since a tracker was last logged', () => {
  it('counts the whole days from the last note to the loop day', async () => {
    const { api } = fakeNomie([moodOn('2026-10-31', 5)]);
    expect((await runCode("alert(daysSince('#mood'));", api)).lines).toEqual(['3']);
  });

  it('is null when there is no note in the 60 days looked back', async () => {
    const { api } = fakeNomie([moodOn('2026-08-01', 5)]);
    expect((await runCode("alert(daysSince('#mood') === null ? 'never' : 'some');", api)).lines).toEqual(['never']);
  });

  it('is 0 when it was logged on the loop day', async () => {
    const { api } = fakeNomie([moodOn('2026-11-03', 5)]);
    expect((await runCode("alert(daysSince('#mood'));", api)).lines).toEqual(['0']);
  });
});

describe('streak of a tracker', () => {
  const days = (count: number, from = '2026-11-03') => {
    const notes: NoteLike[] = [];
    for (let i = 0; i < count; i++) notes.push(moodOn(dayKeyBack(from, i), 5));
    return notes;
  };

  it('counts the days in a row up to the loop day', async () => {
    const { api } = fakeNomie(days(3));
    expect((await runCode("alert(streak('#mood'));", api)).lines).toEqual(['3']);
  });

  it('a gap breaks it', async () => {
    const { api } = fakeNomie([moodOn('2026-11-03', 5), moodOn('2026-11-01', 5)]);
    expect((await runCode("alert(streak('#mood'));", api)).lines).toEqual(['1']);
  });

  it('is 0 when the loop day has no note', async () => {
    const { api } = fakeNomie(days(3, '2026-11-02'));
    expect((await runCode("alert(streak('#mood'));", api)).lines).toEqual(['0']);
  });

  it('counts at most 60 days, as the tooltip says', async () => {
    const { api } = fakeNomie(days(75));
    expect((await runCode("alert(streak('#mood'));", api)).lines).toEqual(['60']);
  });
});

describe('log a note', () => {
  it('writes the text as a note at 13:00 on the day', async () => {
    const { api, created } = fakeNomie();
    await runCode("logNote('Felt good #mood(7)', '2026-11-02');", api);
    expect(created).toHaveLength(1);
    expect(created[0].note).toBe('Felt good #mood(7)');
    expect(localDayKey(created[0].end)).toBe('2026-11-02');
    expect(created[0].end.getHours()).toBe(13);
  });

  it('writes nothing in a test run, and says what it would write', async () => {
    const { api, created } = fakeNomie();
    const { lines } = await runCode("logNote('Felt good', '2026-11-02');", api, { test: true });
    expect(created).toEqual([]);
    expect(lines).toContain('Would write the note "Felt good" on 2026-11-02');
  });
});

describe('my location', () => {
  it('gives the location Nomie answers with', async () => {
    const { api } = fakeNomie();
    api.getLocation = async () => ({ lat: 52.37, lng: 4.9 });
    expect((await runCode("alert(myLocation().lat);", api)).lines).toEqual(['52.37']);
  });

  it('gives null when Nomie never answers, after the location timeout', async () => {
    const { api } = fakeNomie();
    const started = Date.now();
    const { result, lines } = await runCode("alert(myLocation() === null ? 'none' : 'found');", api, { timeouts: { location: 50 } });
    expect(result.ok).toBe(true);
    expect(lines).toContain('none');
    expect(Date.now() - started).toBeLessThan(5000);
  });
});

describe('open link', () => {
  it('opens the page in a manual run', async () => {
    const { api, opened } = fakeNomie();
    await runCode("openLink('https://example.com/a');", api);
    expect(opened).toEqual([{ url: 'https://example.com/a', title: 'https://example.com/a' }]);
  });

  it('a scheduled run only says what it would open', async () => {
    const { api, opened } = fakeNomie();
    const { lines } = await runCode("openLink('https://example.com/a');", api, { scheduled: true });
    expect(opened).toEqual([]);
    expect(lines).toContain('Would open https://example.com/a');
  });

  it('a test run only says what it would open', async () => {
    const { api, opened } = fakeNomie();
    const { lines } = await runCode("openLink('https://example.com/a');", api, { test: true });
    expect(opened).toEqual([]);
    expect(lines).toContain('Would open https://example.com/a');
  });

  it('refuses an address that is not a web address', async () => {
    const { api, opened } = fakeNomie();
    const { lines } = await runCode("openLink('file:///etc/passwd');", api);
    expect(opened).toEqual([]);
    expect(lines.join('\n')).toMatch(/only web addresses/);
  });
});

