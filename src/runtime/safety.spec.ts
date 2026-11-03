// A run must always end: an endless loop, a Stop, or a Nomie call that never answers cannot hang the page or the
// run queue. Values from the sandbox reach Nomie as real values, not as interpreter objects.
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NomieApi } from '../nomie/api';
import { createRunQueue, runWorkspace } from './run';

const FRAME = 's4eblocklyframe = "activated";\n';
const window = { active: false, start: new Date(), end: new Date() };

const fakeApi = (overrides: Partial<NomieApi> = {}) => {
  const created: string[] = [];
  const alerts: string[] = [];
  const api: NomieApi = {
    searchNotes: async () => [],
    getTracker: async () => null,
    getTrackerValues: async () => [],
    createNote: (note) => created.push(note),
    alert: (_title, message) => alerts.push(message),
    prompt: async () => 'typed',
    ...overrides,
  };
  return { api, created, alerts };
};

const never = () => new Promise<never>(() => undefined);

describe('a run always ends (C1)', () => {
  it('stops an endless loop when it reaches the step limit', async () => {
    const started = Date.now();
    const result = await runWorkspace({
      api: fakeApi().api,
      jscode: FRAME + 'while (true) {}',
      scheduled: false,
      schedule: window,
      maxSteps: 50_000,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/too many steps/);
    expect(Date.now() - started).toBeLessThan(2000);
  });

  it('stops an endless loop when Stop is pressed', async () => {
    const stop = { stopped: false };
    setTimeout(() => (stop.stopped = true), 100);
    const started = Date.now();
    const result = await runWorkspace({
      api: fakeApi().api,
      jscode: FRAME + 'while (true) {}',
      scheduled: false,
      schedule: window,
      stop,
    });
    expect(result).toEqual({ ok: false, error: 'stopped' });
    expect(Date.now() - started).toBeLessThan(1000);
  });

  it('stops a run that takes longer than the time limit', async () => {
    const result = await runWorkspace({
      api: fakeApi().api,
      jscode: FRAME + 'while (true) {}',
      scheduled: false,
      schedule: window,
      maxRunMs: 150,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/longer than/);
  });

  it('counts the steps of a run that completes', async () => {
    const result = await runWorkspace({ api: fakeApi().api, jscode: FRAME + 'var a = 1 + 2;', scheduled: false, schedule: window });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.steps).toBeGreaterThan(0);
  });
});

describe('a Nomie call that never answers (C2)', () => {
  it('times out, and the program goes on', async () => {
    const lines: string[] = [];
    const { api, alerts } = fakeApi({ searchNotes: never });
    const result = await runWorkspace({
      api,
      jscode: FRAME + 'var v = fetchDayValue("#mood", "2026-10-01", "sum");\ndisplay("after " + v);',
      scheduled: false,
      schedule: window,
      output: (t) => lines.push(t),
      timeouts: { nomie: 50 },
    });
    expect(result.ok).toBe(true);
    expect(lines.join('\n')).toMatch(/fetchDayValue did not answer/);
    expect(alerts).toEqual(['after null']);
  });

  it('times out a prompt that is never answered', async () => {
    const lines: string[] = [];
    const result = await runWorkspace({
      api: fakeApi({ prompt: never }).api,
      jscode: FRAME + 'var a = prompt("Your name?");\nalert("got " + a);',
      scheduled: false,
      schedule: window,
      output: (t) => lines.push(t),
      timeouts: { prompt: 50 },
    });
    expect(result.ok).toBe(true);
    expect(lines).toContain('got null');
  });

  it('lets the next queued run start when a run is stuck', async () => {
    const queue = createRunQueue(100);
    const order: string[] = [];
    const stuck = queue(() => never());
    const next = queue(async () => {
      order.push('next ran');
      return 'done';
    });
    await expect(next).resolves.toBe('done');
    await expect(stuck).rejects.toThrow(/did not finish/);
    expect(order).toEqual(['next ran']);
  });
});

describe('values cross the sandbox wall as real values (H4)', () => {
  it('logs a list the way v2 does today, and an object as JSON', async () => {
    const { api, created } = fakeApi();
    await runWorkspace({
      api,
      jscode: FRAME + 'logValue([1, 2], "#m", "2026-10-01");\nlogValue({a: 1}, "#m", "2026-10-01");',
      scheduled: false,
      schedule: window,
    });
    expect(created).toEqual(['#m(1,2)', '#m({"a":1})']);
  });

  it('shows an object as JSON in a message and in the console', async () => {
    const lines: string[] = [];
    const { api, alerts } = fakeApi();
    await runWorkspace({
      api,
      jscode: FRAME + 'display({a: 1});\nalert({b: [1, 2]});\nalert(null);',
      scheduled: false,
      schedule: window,
      output: (t) => lines.push(t),
    });
    expect(alerts).toEqual(['{"a":1}']);
    expect(lines.slice(0, 2)).toEqual(['{"b":[1,2]}', '']);
  });
});

describe('web requests (C4)', () => {
  afterEach(() => vi.unstubAllGlobals());

  const request = async (url: string) => {
    const asked: string[] = [];
    vi.stubGlobal('fetch', async (address: string) => {
      asked.push(address);
      return { ok: true, text: async () => 'reply' };
    });
    const lines: string[] = [];
    await runWorkspace({
      api: fakeApi().api,
      jscode: FRAME + `alert(httpRequest(${JSON.stringify(url)}));`,
      scheduled: false,
      schedule: window,
      output: (t) => lines.push(t),
    });
    return { asked, lines };
  };

  it('asks https addresses as they are, and says which host it called', async () => {
    const { asked, lines } = await request('https://api.example.com/x');
    expect(asked).toEqual(['https://api.example.com/x']);
    expect(lines).toContain('Request to api.example.com');
    expect(lines).toContain('reply');
  });

  it('upgrades an http address to https (Nomie runs on https, which blocks http requests)', async () => {
    const { asked } = await request('http://api.example.com/x');
    expect(asked).toEqual(['https://api.example.com/x']);
  });

  it('refuses other kinds of address', async () => {
    const { asked, lines } = await request('file:///etc/passwd');
    expect(asked).toEqual([]);
    expect(lines.join('\n')).toMatch(/only web addresses/);
  });
});
