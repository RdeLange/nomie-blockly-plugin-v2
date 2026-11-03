import { describe, expect, it } from 'vitest';
import { normaliseWorkspace, parseWorkspaceFile, readBackupMemory, workspaceToFile } from './workspace';
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

describe('backups and remembered values (phase 12)', () => {
  const ws = normaliseWorkspace({ id: 'a', name: 'Mood', workspaceBlocks: '<xml/>', jscode: '' });
  const other = normaliseWorkspace({ id: 'b', name: 'Water', workspaceBlocks: '<xml/>', jscode: '' });

  it('a backup leaves remembered values out unless they are asked for', () => {
    const file = workspaceToFile([ws, other]);
    expect(file).not.toContain('memory');
    expect(JSON.parse(file)).toHaveLength(2);
  });

  it('with the option, a workspace carries its remembered values, and the others carry none', () => {
    const file = workspaceToFile([ws, other], { a: { streak: 3 } });
    const list = JSON.parse(file);
    expect(list[0].memory).toEqual({ streak: 3 });
    expect('memory' in list[1]).toBe(false);
    expect(parseWorkspaceFile(file).map((w) => w.name)).toEqual(['Mood', 'Water']);
  });

  it('reads back the remembered values of a backup, in the order of its workspaces', () => {
    const file = workspaceToFile([ws, other], { b: { days: 2 } });
    expect(readBackupMemory(file)).toEqual([undefined, { days: 2 }]);
  });

  it('reads a v1 backup, which has no remembered values', () => {
    expect(readBackupMemory(JSON.stringify([{ id: 'a', name: 'Mood', workspaceBlocks: '<xml/>', jscode: '' }]))).toEqual([undefined]);
  });
});

describe('the detailed description of a workspace', () => {
  const base = { id: 'a', name: 'Mood', workspaceBlocks: '<xml/>', jscode: '' };

  it('is kept when a workspace is read, and a workspace without it has none', () => {
    expect(normaliseWorkspace({ ...base, detailedDescription: 'Logs mood every morning.' }).detailedDescription).toBe(
      'Logs mood every morning.'
    );
    expect(normaliseWorkspace(base).detailedDescription).toBeUndefined();
  });

  it('is in the file a workspace is exported to, so it goes with a backup too', () => {
    const ws = normaliseWorkspace({ ...base, detailedDescription: 'Logs mood.' });
    const [back] = parseWorkspaceFile(workspaceToFile([ws]));
    expect(back.detailedDescription).toBe('Logs mood.');
  });
});
