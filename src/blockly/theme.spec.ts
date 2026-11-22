// The canvas text follows the app's text size (PLG-13): the notebook theme carries the scaled font size, built once per mode and size.
import { describe, expect, it } from 'vitest';
import { notebookTheme } from './theme';

describe('the notebook canvas theme', () => {
  it('uses the base font size at the default scale', () => {
    expect(notebookTheme(false).fontStyle.size).toBe(11);
  });

  it('scales the font size with the app text size', () => {
    expect(notebookTheme(false, 1.25).fontStyle.size).toBeCloseTo(13.75);
    expect(notebookTheme(true, 1.25).fontStyle.size).toBeCloseTo(13.75);
  });

  it('builds each mode and size once', () => {
    expect(notebookTheme(false, 1.25)).toBe(notebookTheme(false, 1.25));
    expect(notebookTheme(false, 1.25)).not.toBe(notebookTheme(true, 1.25));
  });
});
