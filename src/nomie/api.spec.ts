// The SDK adapter: each new call settles, even when Nomie sends no reply (a cancelled picker, a failed locate) (phase 13).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createNomieApi, LOCATE_MS, PICK_MS } from './api';

// a stand-in for the SDK object: replies are whatever each test sets, and a missing reply never comes
const fakePlugin = (replies: Record<string, unknown> = {}) => {
  const calls: Array<[string, unknown[]]> = [];
  const plugin = {
    getLocation: (...args: unknown[]) => {
      calls.push(['getLocation', args]);
      return 'getLocation' in replies ? Promise.resolve(replies.getLocation) : new Promise(() => undefined);
    },
    selectTrackables: (...args: unknown[]) => {
      calls.push(['selectTrackables', args]);
      return 'selectTrackables' in replies ? Promise.resolve(replies.selectTrackables) : new Promise(() => undefined);
    },
    openURL: (...args: unknown[]) => calls.push(['openURL', args]),
  };
  return { plugin, calls };
};

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('the SDK calls of phase 13', () => {
  it('a location that never comes resolves to null after the locate timeout', async () => {
    const { plugin } = fakePlugin();
    const pending = createNomieApi(plugin).getLocation();
    await vi.advanceTimersByTimeAsync(LOCATE_MS + 1);
    expect(await pending).toBe(null);
  });

  it('a location that comes is { lat, lng }', async () => {
    const { plugin } = fakePlugin({ getLocation: { id: 'x', lat: 52.37, lng: 4.9 } });
    expect(await createNomieApi(plugin).getLocation()).toEqual({ lat: 52.37, lng: 4.9 });
  });

  it('a cancelled picker resolves to null after the picker timeout', async () => {
    const { plugin } = fakePlugin();
    const pending = createNomieApi(plugin).pickTracker();
    await vi.advanceTimersByTimeAsync(PICK_MS + 1);
    expect(await pending).toBe(null);
  });

  it('a picked tracker is its tag: the id of a tracker trackable is #tag', async () => {
    const { plugin } = fakePlugin({ selectTrackables: [{ type: 'tracker', id: '#hydration', tracker: { tag: 'hydration' } }] });
    expect(await createNomieApi(plugin).pickTracker()).toBe('#hydration');
  });

  it('asks Nomie for one tracker, and opens a link with its title', () => {
    const { plugin, calls } = fakePlugin();
    const api = createNomieApi(plugin);
    api.pickTracker();
    api.openURL('https://example.com', 'Example');
    expect(calls).toContainEqual(['selectTrackables', ['tracker', false]]);
    expect(calls).toContainEqual(['openURL', ['https://example.com', 'Example']]);
  });
});
