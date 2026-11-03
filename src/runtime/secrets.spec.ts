// Secrets: a workspace names a secret, the value comes from Settings, and it never shows in a run's output (phase 12).
import { describe, expect, it } from 'vitest';
import type { NomieApi } from '../nomie/api';
import { runWorkspace } from './run';

const api: NomieApi = {
  searchNotes: async () => [],
  getTracker: async () => null,
  getTrackerValues: async () => [],
  createNote: () => undefined,
  alert: () => undefined,
  prompt: async () => null,
};

const runCode = async (jscode: string, secrets: Record<string, string>) => {
  const lines: string[] = [];
  const result = await runWorkspace({
    api,
    jscode,
    scheduled: false,
    schedule: { active: false, start: new Date(), end: new Date() },
    output: (text) => lines.push(text),
    secrets,
  });
  return { result, lines };
};

describe('secrets', () => {
  it('a secret is used in the run, and its value is masked in the output', async () => {
    const { result, lines } = await runCode("alert('key is ' + secret('OPENWEATHER_KEY'));", { OPENWEATHER_KEY: 'abc123' });
    expect(result.ok).toBe(true);
    expect(lines).toContain('key is ••••');
    expect(lines.join('\n')).not.toContain('abc123');
  });

  it('a value that reaches an error message is masked too', async () => {
    const { result, lines } = await runCode("var k = secret('KEY'); missingFunction(k);", { KEY: 'supersecret' });
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).not.toContain('supersecret');
    expect(lines.join('\n')).not.toContain('supersecret');
  });

  it('a secret Settings does not have stops the run, and the message names it', async () => {
    const { result } = await runCode("secret('OPENWEATHER_KEY');", {});
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toBe('Add the secret OPENWEATHER_KEY in Settings');
  });
});
