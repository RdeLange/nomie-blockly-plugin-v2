// The widgets of the DailyNomie dashboard (phase 20). Each workspace that shows a value on the Nomie widget can be a
// dashboard widget of its own. The plugin lists them in its `widgets` storage key (the list format of Nomie Lab v3);
// DailyNomie opens the widget frame with &widgetindex=<the widget id>, which here is the workspace id.
import type { Workspace } from '../domain/workspace';
import type { WidgetValue } from '../runtime/widget';

export type DashboardWidget = { widgetid: string; name: string; emoji: string; config: Record<string, unknown> };

// A workspace that shows a value on the widget can be placed on the dashboard
const showsOnWidget = (w: Pick<Workspace, 'workspaceBlocks'>) => /<block type="s4e_widget"/.test(w.workspaceBlocks);

export const dashboardWidgets = (list: Workspace[]): DashboardWidget[] =>
  list.filter(showsOnWidget).map((w) => ({ widgetid: w.id, name: w.displayName || 'Workspace', emoji: w.emoji || '🧱', config: {} }));

// The widget DailyNomie picked, from the address of the widget frame; undefined for the one widget of phase 15
export const widgetIndexOf = (search: string): string | undefined => new URLSearchParams(search).get('widgetindex') ?? undefined;

export type WidgetTile = { workspace: Workspace; shown?: WidgetValue };

// The tiles a widget frame draws. With an index, that workspace only (none when it was removed). Without one, every
// workspace that has a value on the widget.
export const widgetTiles = (list: Workspace[], values: Record<string, WidgetValue>, index: string | undefined): WidgetTile[] => {
  if (index !== undefined) {
    const workspace = list.find((w) => w.id === index);
    return workspace ? [{ workspace, shown: values[workspace.id] }] : [];
  }
  return list.filter((w) => values[w.id] !== undefined).map((workspace) => ({ workspace, shown: values[workspace.id] }));
};
