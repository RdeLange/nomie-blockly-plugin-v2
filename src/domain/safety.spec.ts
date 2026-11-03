// The safety nets of phase 17: the previous version of a workspace, its copy, and what an export leaves out.
import { describe, expect, it } from 'vitest';
import { copyOfWorkspace, normaliseWorkspace, restoredWorkspace, savedWithBlocks, workspaceToFile } from './workspace';

const base = normaliseWorkspace({ id: 'a', name: 'Mood', displayName: 'Mood', workspaceBlocks: '<xml>v1</xml>', jscode: '' });

describe('the previous version', () => {
  it('a save with changed blocks keeps the blocks it replaces, and the time they were saved', () => {
    const first = savedWithBlocks(base, '<xml>v2</xml>', '2026-11-02T09:02:00.000Z');
    expect(first.workspaceBlocks).toBe('<xml>v2</xml>');
    expect(first.savedAt).toBe('2026-11-02T09:02:00.000Z');
    expect(first.previous).toEqual({ workspaceBlocks: '<xml>v1</xml>', savedAt: '' });

    const second = savedWithBlocks(first, '<xml>v3</xml>', '2026-11-03T10:00:00.000Z');
    expect(second.previous).toEqual({ workspaceBlocks: '<xml>v2</xml>', savedAt: '2026-11-02T09:02:00.000Z' });
  });

  it('a save without changes keeps the previous version as it was', () => {
    const first = savedWithBlocks(base, '<xml>v2</xml>', '2026-11-02T09:02:00.000Z');
    const again = savedWithBlocks(first, '<xml>v2</xml>', '2026-11-03T10:00:00.000Z');
    expect(again.previous).toEqual(first.previous);
    expect(again.savedAt).toBe('2026-11-02T09:02:00.000Z');
  });

  it('restoring brings back the previous blocks, and a workspace without one is unchanged', () => {
    const first = savedWithBlocks(base, '<xml>v2</xml>', '2026-11-02T09:02:00.000Z');
    expect(restoredWorkspace(first).workspaceBlocks).toBe('<xml>v1</xml>');
    expect(restoredWorkspace(base)).toBe(base);
  });
});

describe('a copy', () => {
  it('has the same blocks, a " (copy)" name, and no history', () => {
    const edited = savedWithBlocks(base, '<xml>v2</xml>', '2026-11-02T09:02:00.000Z');
    const copy = copyOfWorkspace(edited);
    expect(copy.displayName).toBe('Mood (copy)');
    expect(copy.name).toBe('Mood (copy)');
    expect(copy.workspaceBlocks).toBe('<xml>v2</xml>');
    expect(copy).not.toHaveProperty('previous');
    expect(copy).not.toHaveProperty('savedAt');
  });
});

describe('an export of one workspace', () => {
  it('is a list of that workspace, without the previous version', () => {
    const edited = savedWithBlocks(base, '<xml>v2</xml>', '2026-11-02T09:02:00.000Z');
    const file = JSON.parse(workspaceToFile([edited]));
    expect(file).toHaveLength(1);
    expect(file[0].workspaceBlocks).toBe('<xml>v2</xml>');
    expect(file[0]).not.toHaveProperty('previous');
  });
});
