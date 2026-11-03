// The geometry of a widget's line (phase 20): a gap in the data breaks the line, and a lone day is a dot.
import { describe, expect, it } from 'vitest';
import { linePaths } from './widget-chart';

describe('the line of a chart', () => {
  it('has nothing for no data', () => {
    expect(linePaths([], 300, 80)).toEqual({ paths: [], dots: [] });
  });

  it('draws a line through the days, lowest value at the bottom and highest at the top', () => {
    const { paths, dots } = linePaths([1, 2, 3], 300, 80, 4);
    expect(dots).toEqual([]);
    expect(paths).toHaveLength(1);
    const points = paths[0].replace(/^M/, '').split(' L');
    expect(points).toHaveLength(3);
    const ys = points.map((p) => Number(p.split(' ')[1]));
    expect(ys[0]).toBeGreaterThan(ys[1]);
    expect(ys[1]).toBeGreaterThan(ys[2]);
  });

  it('a day without a value breaks the line, and a day on its own is a dot', () => {
    const { paths, dots } = linePaths([1, undefined, 3], 300, 80);
    expect(paths).toEqual([]);
    expect(dots).toHaveLength(2);
    const two = linePaths([1, 2, undefined, 4, 5], 300, 80);
    expect(two.paths).toHaveLength(2);
  });

  it('a flat line is drawn in the middle', () => {
    const { paths } = linePaths([5, 5, 5], 300, 80, 4);
    const ys = paths[0].replace(/^M/, '').split(' L').map((p) => Number(p.split(' ')[1]));
    expect(new Set(ys).size).toBe(1);
    expect(ys[0]).toBe(40);
  });
});
