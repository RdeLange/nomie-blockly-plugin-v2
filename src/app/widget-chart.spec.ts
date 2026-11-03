// The geometry of a widget's line (phase 20): a gap in the data breaks the line, and a lone day is a dot.
import { describe, expect, it } from 'vitest';
import { barRects, linePaths } from './widget-chart';

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

describe('the bars of a bar chart', () => {
  it('has one bar a day, as tall as its value, and none for a day without a value', () => {
    const bars = barRects([2, undefined, 4], 300, 80, 4);
    expect(bars).toHaveLength(2);
    expect(bars[1].h).toBeGreaterThan(bars[0].h);
    expect(bars[0].x).toBeLessThan(bars[1].x);
  });

  it('the bars are inside the chart, and a flat series has equal bars', () => {
    const bars = barRects([5, 5, 5], 300, 80, 4);
    expect(new Set(bars.map((b) => b.h)).size).toBe(1);
    for (const b of bars) {
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.y + b.h).toBeLessThanOrEqual(80);
    }
  });

  it('has no bars for no data', () => {
    expect(barRects([], 300, 80)).toEqual([]);
  });
});
