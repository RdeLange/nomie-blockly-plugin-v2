// Each workspace with a show-on-widget block can be a widget on the DailyNomie dashboard (phase 20). The plugin lists
// them in its `widgets` storage key; DailyNomie opens the widget frame with &widgetindex=<the workspace id>.
import { describe, expect, it } from 'vitest';
import { dashboardWidgets, widgetIndexOf, widgetTiles } from './dashboard-widgets';
import type { Workspace } from '../domain/workspace';

const WIDGET = '<block type="s4e_dashboard"><field name="NAME"></field><field name="EMOJI"></field><statement name="CONTENT"></statement></block>';
const NAMED = '<block type="s4e_dashboard"><field name="NAME">Mood</field><field name="EMOJI">😊</field><statement name="CONTENT"></statement></block>';
const PLAIN = '<block type="pushto_console"></block>';
const ws = (id: string, name: string, blocks: string, emoji = '📊'): Workspace => ({
  id,
  name,
  displayName: name,
  description: '',
  emoji,
  color: '#FDF0A4',
  active: true,
  block: '',
  workspaceBlocks: `<xml>${blocks}</xml>`,
  workspacePosition: { scrollX: 0, scrollY: 0, scale: 0.8 },
  jscode: '',
  latestrun: '',
  schedule: 'none',
});

const list = [ws('mood', 'Mood', NAMED), ws('plain', 'Plain', PLAIN, '🧱'), ws('water', 'Water', WIDGET, '💧')];

describe('the widgets a plugin lists on the dashboard', () => {
  it('lists each workspace that shows a value on the widget, with its name and emoji', () => {
    expect(dashboardWidgets(list)).toEqual([
      { widgetid: 'mood', name: 'Mood', emoji: '😊', config: {} },
      { widgetid: 'water', name: 'Water', emoji: '💧', config: {} },
    ]);
  });

  it('lists nothing when no workspace shows a value', () => {
    expect(dashboardWidgets([ws('plain', 'Plain', PLAIN)])).toEqual([]);
  });
});

describe('the widget index in the address of the widget frame', () => {
  it('is the widget id DailyNomie picked, and nothing when there is none', () => {
    expect(widgetIndexOf('?pid=abc&widgetindex=water')).toBe('water');
    // Nomie passes the widget id as widgetid (the SDK's documented parameter)
    expect(widgetIndexOf('?pid=abc&widgetid=water')).toBe('water');
    expect(widgetIndexOf('?pid=abc')).toBeUndefined();
    expect(widgetIndexOf('')).toBeUndefined();
  });
});

describe('the tiles a widget draws', () => {
  const entry = (label: string, value: string, at: string) => ({ name: '', emoji: '', footer: '', at, components: [{ kind: 'value' as const, label, value }] });
  const values = {
    mood: entry('7-day mood', '5.5', '2026-11-03T09:34:00.000Z'),
    water: entry('Glasses', '6', '2026-11-03T09:40:00.000Z'),
  };

  it('with a widget index, draws only that workspace', () => {
    const tiles = widgetTiles(list, values, 'water');
    expect(tiles.map((t) => t.workspace.id)).toEqual(['water']);
    expect(tiles[0].shown?.components[0]).toEqual({ kind: 'value', label: 'Glasses', value: '6' });
  });

  it('with a widget index of a workspace that was removed, draws nothing', () => {
    expect(widgetTiles(list, values, 'gone')).toEqual([]);
  });

  it('without an index, draws the workspaces that have a value (the single widget of phase 15)', () => {
    expect(widgetTiles(list, values, undefined).map((t) => t.workspace.id)).toEqual(['mood', 'water']);
  });
});
