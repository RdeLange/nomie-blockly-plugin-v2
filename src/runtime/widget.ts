// The dashboard widget a workspace builds (phase 20, replacing the single value of phase 15): a header, the content
// components in order, and a footer. A run sets it with the widget blocks; it is stored with the time of the run.
// Modelled on Nomie Lab v3's widget (its header, value, line chart and footer), in the plugin's own blocks.

export const CHART_COLOURS = ['#0A6CC9', '#1E9E55', '#8E5CF7', '#FF9F0A', '#FF375F', '#34495E'];
// The longest chart: the notes are searched 60 days back, as the history blocks do (see runtime/nomie-data.ts)
export const CHART_MAX_DAYS = 60;
export const TREND_DAYS = 14;

export type WidgetComponent =
  // a label and a value, as text (a number or a word)
  | { kind: 'value'; label: string; value: string }
  // the last days of a tracker as a small line, with no axes
  | { kind: 'trend'; label: string; points: Array<number | undefined> }
  // a line chart of a tracker, oldest day first; a day without a value is a gap
  | { kind: 'chart'; label: string; points: Array<number | undefined>; colour: string };

export type WidgetDesign = {
  name: string;
  emoji: string;
  components: Array<WidgetComponent>;
  footer: string;
};

export type WidgetEntry = WidgetDesign & { at: string };

// What the dashboard list and the widget frame show as the headline of a widget: its first value, if it has one
export const headlineOf = (entry: WidgetDesign): { label: string; value: string } | undefined => {
  const first = entry.components.find((c): c is Extract<WidgetComponent, { kind: 'value' }> => c.kind === 'value');
  return first ? { label: first.label, value: first.value } : undefined;
};

// A stored widget. The first version of the widget stored one label and value: it becomes a design with that value.
const readEntry = (raw: unknown): WidgetEntry | undefined => {
  const v = raw as Record<string, unknown> | null;
  if (!v || typeof v !== 'object' || typeof v.at !== 'string') return undefined;
  if (Array.isArray(v.components)) {
    const components = v.components.filter((c): c is WidgetComponent => {
      const k = (c as WidgetComponent | null)?.kind;
      return k === 'value' || k === 'trend' || k === 'chart';
    });
    return {
      at: v.at,
      name: typeof v.name === 'string' ? v.name : '',
      emoji: typeof v.emoji === 'string' ? v.emoji : '',
      footer: typeof v.footer === 'string' ? v.footer : '',
      components,
    };
  }
  if (typeof v.label === 'string' && typeof v.value === 'string') {
    return { at: v.at, name: '', emoji: '', footer: '', components: [{ kind: 'value', label: v.label, value: v.value }] };
  }
  return undefined;
};

// The stored widgets, by workspace id. Anything that is not a widget is dropped.
export const readWidgetMap = (raw: unknown): Record<string, WidgetEntry> => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const map: Record<string, WidgetEntry> = {};
  for (const [id, entry] of Object.entries(raw as Record<string, unknown>)) {
    const widget = readEntry(entry);
    if (widget) map[id] = widget;
  }
  return map;
};

// A component as a widget block passes it (a plain object from the sandbox). Anything else is left out.
export const componentOf = (raw: unknown, formatValue: (value: unknown) => string): WidgetComponent | undefined => {
  const c = raw as Record<string, unknown> | null;
  if (!c || typeof c !== 'object') return undefined;
  const label = String(c.label ?? '');
  const points = (): Array<number | undefined> =>
    Array.isArray(c.points) ? c.points.map((p) => (typeof p === 'number' && Number.isFinite(p) ? p : undefined)) : [];
  if (c.kind === 'value') return { kind: 'value', label, value: formatValue(c.value) };
  if (c.kind === 'trend') return { kind: 'trend', label, points: points() };
  if (c.kind === 'chart') {
    const colour = CHART_COLOURS.includes(String(c.colour)) ? String(c.colour) : CHART_COLOURS[0];
    return { kind: 'chart', label, points: points(), colour };
  }
  return undefined;
};
