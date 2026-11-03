// Remembered values: kept per workspace between runs, JSON values only, with limits (phase 12).
import { describe, expect, it } from 'vitest';
import type { NomieApi } from '../nomie/api';
import { runWorkspace } from './run';
import { isJsonValue, MAX_MEMORY_NAMES, readMemory, type Memory } from './memory';

const api: NomieApi = {
  searchNotes: async () => [],
  getTracker: async () => null,
  getTrackerValues: async () => [],
  createNote: () => undefined,
  alert: () => undefined,
  prompt: async () => null,
};

const runCode = (jscode: string, extra: { memory?: Memory; test?: boolean } = {}) => {
  const lines: string[] = [];
  const promise = runWorkspace({
    api,
    jscode,
    scheduled: false,
    schedule: { active: false, start: new Date(), end: new Date() },
    output: (text) => lines.push(text),
    ...extra,
  });
  return promise.then((result) => ({ result, lines }));
};

describe('remembered values', () => {
  it('a value remembered in one run is recalled in the next', async () => {
    const first = await runCode("remember('streak', 3);", { memory: {} });
    expect(first.result.ok).toBe(true);
    expect(first.result.ok && first.result.memory).toEqual({ streak: 3 });

    const second = await runCode("alert(recall('streak', 0));", { memory: { streak: 3 } });
    expect(second.lines).toContain('3');
  });

  it('recall gives the fallback when nothing is remembered, and a run that changes nothing returns no memory', async () => {
    const { result, lines } = await runCode("alert(recall('missing', 'none'));", { memory: {} });
    expect(lines).toContain('none');
    expect(result.ok && 'memory' in result).toBe(false);
  });

  it('forget removes a value', async () => {
    const { result } = await runCode("forget('streak');", { memory: { streak: 3 } });
    expect(result.ok && result.memory).toEqual({});
  });

  it('remembers lists and objects as they are', async () => {
    const { result } = await runCode("remember('list', [1, 'a', true]); remember('obj', { mood: 6 });", { memory: {} });
    expect(result.ok && result.memory).toEqual({ list: [1, 'a', true], obj: { mood: 6 } });
  });

  it('refuses a value that is not JSON (NaN here), and says what can be remembered', async () => {
    const { result } = await runCode("remember('n', 0 / 0);", { memory: {} });
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toMatch(/can be remembered/);
  });

  it('a failed run saves nothing', async () => {
    const { result } = await runCode("remember('a', 1); var x = missingFunction();", { memory: {} });
    expect(result.ok).toBe(false);
    expect('memory' in result).toBe(false);
  });

  it('a test run saves nothing', async () => {
    const { result } = await runCode("remember('a', 1);", { memory: {}, test: true });
    expect(result.ok).toBe(true);
    expect('memory' in result).toBe(false);
  });

  it('a workspace can remember at most 100 names', async () => {
    const full = Object.fromEntries(Array.from({ length: MAX_MEMORY_NAMES }, (_, i) => [`n${i}`, i]));
    const { result } = await runCode("remember('one more', 1);", { memory: full });
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toMatch(/at most 100 names/);
  });

  it('the values of a workspace are kept to 10 KB', async () => {
    const code = "var s = ''; for (var i = 0; i < 11000; i++) { s += 'x'; } remember('big', s);";
    const { result } = await runCode(code, { memory: {} });
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toMatch(/10 KB/);
  });

  it('changing a name that is already there does not count as a new name', async () => {
    const full = Object.fromEntries(Array.from({ length: MAX_MEMORY_NAMES }, (_, i) => [`n${i}`, i]));
    const { result } = await runCode("remember('n0', 99);", { memory: full });
    expect(result.ok && result.memory?.n0).toBe(99);
  });
});

describe('what counts as a remembered value', () => {
  it('accepts JSON values and nothing else', () => {
    expect(isJsonValue({ a: [1, 'x', null, true] })).toBe(true);
    expect(isJsonValue(NaN)).toBe(false);
    expect(isJsonValue(Infinity)).toBe(false);
    expect(isJsonValue(undefined)).toBe(false);
    expect(isJsonValue(() => 1)).toBe(false);
  });

  it('reads a stored memory, and drops what is not a JSON value', () => {
    expect(readMemory(undefined)).toEqual({});
    expect(readMemory('nonsense')).toEqual({});
    expect(readMemory({ ok: 1, bad: () => 1 })).toEqual({ ok: 1 });
  });
});
