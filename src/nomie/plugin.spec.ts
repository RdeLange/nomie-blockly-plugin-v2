// The connection to Nomie, with a stand-in for the Nomie plugin SDK: nothing is saved before the stored state is
// loaded, a failed save is reported, and a note the plugin wrote itself does not start a run.
import { afterEach, describe, expect, it } from 'vitest';
import { startNomie } from './plugin';
import { appState } from '../app/state.svelte';

type Handlers = Record<string, (arg?: any) => unknown>;

const FRAME_SAYS = (text: string) =>
  `<xml xmlns="https://developers.google.com/blockly/xml"><block type="s4eblocklyframe"><field name="NAME">none</field><statement name="script"><block type="display"><value name="Value"><block type="text"><field name="TEXT">${text}</field></block></value></block></statement></block></xml>`;

const installFakeSdk = (options: { failSave?: boolean } = {}) => {
  const handlers: Handlers = {};
  const alerts: string[] = [];
  const saved: unknown[] = [];
  const stored = {
    blockly: {
      workspaces: [
        { id: 'echo', name: 'Echo', displayName: 'Echo', workspaceBlocks: FRAME_SAYS('echo ran'), jscode: '' },
      ],
    },
  };
  class FakePlugin {
    prefs = { theme: 'light' };
    storage = {
      init: async () => undefined,
      getItem: (key: keyof typeof stored) => stored[key],
      setItem: async (_key: string, value: unknown) => {
        if (options.failSave) throw new Error('disk full');
        saved.push(value);
      },
    };
    constructor() {}
    onRegistered(fn: () => unknown) { handlers.registered = fn; }
    onUIOpened(fn: () => unknown) { handlers.opened = fn; }
    onWidget(fn: () => unknown) { handlers.widget = fn; }
    onLaunch(fn: () => unknown) { handlers.launch = fn; }
    onNote(fn: (note: { note: string }) => unknown) { handlers.note = fn; }
    alert(_title: string, message: string) { alerts.push(message); }
    searchNotes = async () => [];
    getTrackable = async () => null;
    getTrackableUsage = async () => ({ usage: { values: [] } });
    createNote() {}
  }
  (globalThis as any).NomiePlugin = FakePlugin;
  return { handlers, alerts, saved };
};

const settle = () => new Promise((r) => setTimeout(r, 400));

afterEach(() => {
  delete (globalThis as any).NomiePlugin;
  appState.loaded = false;
  appState.workspaces = [];
});

describe('the connection to Nomie', () => {
  it('saves nothing before the stored state is loaded (M1)', async () => {
    const { saved } = installFakeSdk();
    const handle = startNomie()!;
    expect(await handle.save()).toBe(false);
    expect(saved).toEqual([]);
  });

  it('reports a save that failed (M5)', async () => {
    const { handlers, alerts } = installFakeSdk({ failSave: true });
    const handle = startNomie()!;
    await handlers.registered();
    expect(await handle.save()).toBe(false);
    expect(alerts.join()).toMatch(/could not save/);
  });

  it('runs a workspace from a note, but not from a note it wrote itself (M4)', async () => {
    const { handlers, alerts } = installFakeSdk();
    const handle = startNomie()!;
    await handlers.registered();

    handle.api.createNote('Run Blockly Workspace: Echo', new Date());
    handlers.note({ note: 'Run Blockly Workspace: Echo' });
    await settle();
    expect(alerts).toEqual([]);

    handlers.note({ note: 'Run Blockly Workspace: Echo\nwritten by me' });
    await settle();
    expect(alerts).toEqual(['echo ran']);
  });
});
