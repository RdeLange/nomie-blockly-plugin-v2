// Values on the Nomie widget (phase 15): what a workspace last showed there, with its label and the time it ran.

export type WidgetLabelValue = { label: string; value: string };
export type WidgetValue = WidgetLabelValue & { at: string };

// The stored values, by workspace id. A value that is not a label, a value and a time is dropped.
export const readWidgetMap = (raw: unknown): Record<string, WidgetValue> => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const map: Record<string, WidgetValue> = {};
  for (const [id, entry] of Object.entries(raw as Record<string, unknown>)) {
    const v = entry as Partial<WidgetValue> | null;
    if (v && typeof v.label === 'string' && typeof v.value === 'string' && typeof v.at === 'string') {
      map[id] = { label: v.label, value: v.value, at: v.at };
    }
  }
  return map;
};
