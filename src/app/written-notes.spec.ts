// The notes the plugin wrote are known for two minutes, so a note run never starts itself (phase 14).
import { describe, expect, it } from 'vitest';
import { rememberWritten, wasWrittenHere } from './written-notes';

describe('the notes this plugin wrote', () => {
  it('are known for two minutes', () => {
    const at = Date.UTC(2026, 10, 2, 20);
    rememberWritten('#run(1)', at);
    expect(wasWrittenHere('#run(1)', at + 60_000)).toBe(true);
    expect(wasWrittenHere('#run(1)', at + 3 * 60_000)).toBe(false);
    expect(wasWrittenHere('#other', at)).toBe(false);
  });
});
