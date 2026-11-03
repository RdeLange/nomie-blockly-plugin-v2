import { describe, expect, it } from 'vitest';
import { normaliseWorkspace } from './workspace';
import { readState } from '../app/state.svelte';

const v1 = { id: 'a', name: 'Mood', workspaceBlocks: '<xml/>', jscode: '' };

describe('the untested flag of an imported workspace', () => {
  it('is absent on a workspace from v1 or from before phase 11, so it is not a test run by default', () => {
    expect(normaliseWorkspace(v1).untested).toBeUndefined();
    expect(readState({ workspaces: [v1] }).workspaces[0].untested).toBeUndefined();
  });

  it('is kept when it is set, and survives a stored state', () => {
    const stored = { workspaces: [{ ...v1, untested: true }] };
    expect(normaliseWorkspace(stored.workspaces[0]).untested).toBe(true);
    expect(readState(stored).workspaces[0].untested).toBe(true);
  });
});
