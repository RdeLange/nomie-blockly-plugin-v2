// The filter field of the list beside the editor (phase 19): a name, a description or the name used in notes.
import { describe, expect, it } from 'vitest';
import { filterWorkspaces } from './workspace-filter';

const list = [
  { id: 'a', displayName: 'Mood', name: 'Mood', description: 'daily check-in' },
  { id: 'b', displayName: 'Temperature', name: 'Get Temperature', description: 'weather from the web' },
  { id: 'c', displayName: 'Water', name: 'Water count', description: 'glasses a day' },
];

describe('the filter of the workspaces', () => {
  it('shows all workspaces for an empty filter', () => {
    expect(filterWorkspaces(list, '   ').map((w) => w.id)).toEqual(['a', 'b', 'c']);
  });

  it('matches the name, the name used in notes and the description, in any case', () => {
    expect(filterWorkspaces(list, 'TEMP').map((w) => w.id)).toEqual(['b']);
    expect(filterWorkspaces(list, 'count').map((w) => w.id)).toEqual(['c']);
    expect(filterWorkspaces(list, 'glasses').map((w) => w.id)).toEqual(['c']);
  });

  it('shows nothing when no workspace matches', () => {
    expect(filterWorkspaces(list, 'zzz')).toEqual([]);
  });
});
