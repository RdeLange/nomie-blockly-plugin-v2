// The layout by width (phase 19): the list beside the editor from 1200 px, the phone layout below 900 px.
import { describe, expect, it } from 'vitest';
import { isPhone, sideBySide, SIDE_BY_SIDE_MIN_WIDTH } from './layout';

describe('the layout by width', () => {
  it('shows the list beside the editor from 1200 px wide, and not below', () => {
    expect(SIDE_BY_SIDE_MIN_WIDTH).toBe(1200);
    expect(sideBySide(1199)).toBe(false);
    expect(sideBySide(1200)).toBe(true);
    expect(sideBySide(1440)).toBe(true);
    expect(sideBySide(1100)).toBe(false);
  });

  it('is the phone layout below 900 px', () => {
    expect(isPhone(390)).toBe(true);
    expect(isPhone(899)).toBe(true);
    expect(isPhone(900)).toBe(false);
  });
});
