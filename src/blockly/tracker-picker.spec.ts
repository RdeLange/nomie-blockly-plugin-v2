// The Tracker dropdown: a tracker picked in Nomie is kept with its workspace, and "Pick from Nomie" is its last option (phase 13).
import { describe, expect, it } from 'vitest';
import { addSavedTracker, PICK_FROM_NOMIE, trackerOptionsFor } from './nomie-blocks';

describe('the Tracker dropdown', () => {
  it('lists a tracker picked in Nomie with its workspace, and only with it', () => {
    const workspace = {};
    const other = {};
    addSavedTracker(workspace, '#hydration');
    expect(trackerOptionsFor(workspace).map(([, value]) => value)).toContain('#hydration');
    expect(trackerOptionsFor(other).map(([, value]) => value)).not.toContain('#hydration');
  });

  it('keeps a tracker once, and ignores an empty pick', () => {
    const workspace = {};
    addSavedTracker(workspace, '#hydration');
    addSavedTracker(workspace, '#hydration');
    addSavedTracker(workspace, '');
    const values = trackerOptionsFor(workspace).map(([, value]) => value);
    expect(values.filter((v) => v === '#hydration')).toHaveLength(1);
    expect(values).not.toContain('');
  });

  it('offers "Pick from Nomie" as the last option', () => {
    const options = trackerOptionsFor({});
    expect(options[options.length - 1][1]).toBe(PICK_FROM_NOMIE);
  });
});
