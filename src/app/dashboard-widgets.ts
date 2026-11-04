// The widgets of the DailyNomie dashboard (phase 20). Each workspace that shows a value on the Nomie widget can be a
// dashboard widget of its own. The plugin lists them in its `widgets` storage key (the list format of Nomie Lab v3);
// DailyNomie opens the widget frame with &widgetid=<the widget id>, which here is the workspace id.
import type { Workspace } from '../domain/workspace';
import type { WidgetEntry } from '../runtime/widget';

export type DashboardWidget = { widgetid: string; name: string; emoji: string; config: Record<string, unknown> };

// A workspace that builds a widget (the widget builder, or the "show on widget" block it replaced) can be placed on
// the dashboard
const showsOnWidget = (w: Pick<Workspace, 'workspaceBlocks'>) => /<block type="s4e_(dashboard|widget)"/.test(w.workspaceBlocks);

// The name and emoji the widget gives itself in its header (empty when it has none)
const headerOf = (xml: string): { name: string; emoji: string } => {
  const match = /<block type="s4e_dashboard"[^>]*>\s*<field name="NAME">([^<]*)<\/field>(?:\s*<field name="EMOJI">([^<]*)<\/field>)?/.exec(xml);
  return { name: (match?.[1] ?? '').trim(), emoji: (match?.[2] ?? '').trim() };
};

export const dashboardWidgets = (list: Workspace[]): DashboardWidget[] =>
  list.filter(showsOnWidget).map((w) => {
    const header = headerOf(w.workspaceBlocks);
    return {
      widgetid: w.id,
      name: header.name || w.displayName || 'Workspace',
      emoji: header.emoji || w.emoji || '🧱',
      config: {},
    };
  });

// The widget DailyNomie picked, from the address of the widget frame; undefined for the one widget of phase 15
// Nomie passes the widget id as widgetid, as its plugin SDK documents; widgetindex is read too, as before
export const widgetIndexOf = (search: string): string | undefined => {
  const params = new URLSearchParams(search);
  return params.get('widgetid') ?? params.get('widgetindex') ?? undefined;
};

export type WidgetTile = { workspace: Workspace; shown?: WidgetEntry };

// The tiles a widget frame draws. With an index, that workspace only (none when it was removed). Without one, every
// workspace that has a value on the widget.
export const widgetTiles = (list: Workspace[], values: Record<string, WidgetEntry>, index: string | undefined): WidgetTile[] => {
  if (index !== undefined) {
    const workspace = list.find((w) => w.id === index);
    return workspace ? [{ workspace, shown: values[workspace.id] }] : [];
  }
  return list.filter((w) => values[w.id] !== undefined).map((workspace) => ({ workspace, shown: values[workspace.id] }));
};
