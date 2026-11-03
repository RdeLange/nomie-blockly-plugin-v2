// The geometry of a widget's line chart and trend (phase 20). Pure: the view draws the paths in an SVG.
// A day without a value breaks the line; a day on its own is drawn as a dot.
export type LinePaths = { paths: string[]; dots: Array<{ x: number; y: number }> };

export const linePaths = (points: Array<number | undefined>, width: number, height: number, pad = 4): LinePaths => {
  const values = points.filter((v): v is number => typeof v === 'number');
  if (values.length === 0) return { paths: [], dots: [] };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const x = (i: number) => (points.length === 1 ? width / 2 : pad + (i * (width - 2 * pad)) / (points.length - 1));
  const y = (v: number) => (max === min ? height / 2 : height - pad - ((v - min) / (max - min)) * (height - 2 * pad));
  const paths: string[] = [];
  const dots: Array<{ x: number; y: number }> = [];
  let run: Array<{ x: number; y: number }> = [];
  const flush = () => {
    if (run.length === 1) dots.push(run[0]);
    else if (run.length > 1) paths.push(`M${run.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L')}`);
    run = [];
  };
  points.forEach((v, i) => {
    if (typeof v === 'number') run.push({ x: x(i), y: y(v) });
    else flush();
  });
  flush();
  return { paths, dots };
};

// The bars of a bar chart: one bar for each day with a value, as tall as its value above the lowest one (a bar is never
// taller than the chart). A day without a value has no bar.
export type Bar = { x: number; y: number; w: number; h: number };

export const barRects = (points: Array<number | undefined>, width: number, height: number, pad = 4): Bar[] => {
  const values = points.filter((v): v is number => typeof v === 'number');
  if (values.length === 0) return [];
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const slot = (width - 2 * pad) / points.length;
  const gap = Math.min(slot * 0.25, 6);
  const bars: Bar[] = [];
  points.forEach((v, i) => {
    if (typeof v !== 'number') return;
    const h = Math.max(1, ((v - min) / span) * (height - 2 * pad));
    bars.push({ x: pad + i * slot + gap / 2, y: height - pad - h, w: slot - gap, h });
  });
  return bars;
};
