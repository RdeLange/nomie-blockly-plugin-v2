// The templates are where people start: each one must be ready to run, and its stored code must be the code of its
// blocks (it goes into exported files).
import { describe, expect, it } from 'vitest';
import templates from './templates.json';
import { compileWorkspace } from '../blockly/compile';
import { runWorkspace } from '../runtime/run';
import type { NomieApi } from '../nomie/api';

const api: NomieApi = {
  searchNotes: async () => [],
  getTracker: async () => null,
  getTrackerValues: async () => [],
  createNote: () => undefined,
  alert: () => undefined,
  prompt: async () => 'Amsterdam',
};

describe('the templates', () => {
  for (const template of templates as Array<{ displayName: string; workspaceBlocks: string; jscode: string; schedule: string }>) {
    it(`${template.displayName} has a Scheduler block and no problems`, () => {
      const compiled = compileWorkspace(template.workspaceBlocks, { highlight: true });
      expect(compiled.frame).toBe(true);
      expect(compiled.problems).toEqual([]);
      expect(template.schedule).toBe(compiled.schedule);
    });
  }

  it('Kick Start runs and shows the meaning of life', async () => {
    const kickStart = (templates as Array<{ displayName: string; workspaceBlocks: string }>).find((t) => t.displayName === 'Kick Start')!;
    const lines: string[] = [];
    const result = await runWorkspace({
      api,
      jscode: compileWorkspace(kickStart.workspaceBlocks, { highlight: false }).code,
      scheduled: false,
      schedule: { active: false, start: new Date(), end: new Date() },
      output: (t) => lines.push(t),
    });
    expect(result.ok).toBe(true);
    expect(lines[0]).toBe('42');
  });
});
