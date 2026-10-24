// Registers the plugin with Nomie, and connects the Nomie events to the app.
import { createNomieApi, type NomieApi, type TrackerInfo } from './api';
import { appState } from '../app/state.svelte';
import { ui } from '../app/ui.svelte';
import { trackerChoices, trackerOptionsNow } from '../app/trackers.svelte';
import { STORAGE_KEY } from '../app/state.svelte';
import { scheduleIfDue, runFromNote } from '../app/actions';
import { setupBlockly } from '../blockly/setup';

declare const NomiePlugin: any;

export type NomieHandle = { api: NomieApi; save: () => void; plugin: any };

let handle: NomieHandle | undefined;
// the connection to Nomie, once the plugin has started (undefined when the page runs outside Nomie)
export const nomie = (): NomieHandle | undefined => handle;

const USES = ['createNote', 'searchNotes', 'getTrackable', 'getTrackableUsage', 'confirm', 'prompt', 'alert', 'onNote'];

// The dropdown lists the trackers of the last 30 days. Refreshed when the plugin starts and when a workspace opens.
export const refreshTrackers = async (api: NomieApi) => {
  const notes = await api.searchNotes('', new Date(), 30);
  const tags = new Map<string, true>();
  for (const note of notes) {
    for (const element of note.elements) {
      if (element.type === 'tracker') tags.set(`#${element.id}`, true);
    }
  }
  const infos: Array<TrackerInfo | null> = await Promise.all([...tags.keys()].map((tag) => api.getTracker(tag)));
  trackerChoices.list = infos
    .map((info, i) => {
      const tag = [...tags.keys()][i];
      return info ? [`${info.emoji} ${info.label}`.trim(), tag] : [tag, tag];
    })
    .sort((a, b) => a[0].localeCompare(b[0])) as Array<[string, string]>;
};

const applyTheme = (plugin: any) => {
  const theme = plugin?.prefs?.theme;
  ui.theme = theme === 'dark' ? 'dark' : 'light';
};

export const startNomie = (): NomieHandle | undefined => {
  if (typeof NomiePlugin === 'undefined') {
    ui.ready = true;
    return undefined;
  }
  const plugin = new NomiePlugin({
    name: 'Nomie Blockly',
    emoji: '🧱',
    description: 'Build small automations from blocks, and run them against your notes.',
    uses: USES,
    version: '2.0',
    addToCaptureMenu: true,
    addToMoreMenu: true,
    addToWidgets: true,
  });
  const api = createNomieApi(plugin);
  const save = () => {
    void plugin.storage.setItem(STORAGE_KEY, appState.toStored());
  };
  const deps = { api, save };
  setupBlockly(trackerOptionsNow);

  plugin.onRegistered(async () => {
    applyTheme(plugin);
    await plugin.storage.init();
    appState.load(plugin.storage.getItem(STORAGE_KEY));
    ui.ready = true;
    void refreshTrackers(api);
  });
  plugin.onUIOpened(() => {
    applyTheme(plugin);
    ui.mode = 'modal';
    void refreshTrackers(api);
  });
  plugin.onWidget(() => {
    applyTheme(plugin);
    ui.mode = 'widget';
  });
  plugin.onLaunch(() => {
    void scheduleIfDue(deps);
    setInterval(() => void scheduleIfDue(deps), 60 * 60 * 1000);
  });
  plugin.onNote((note: { note: string }) => {
    if (note?.note?.includes('Run Blockly Workspace:')) runFromNote(deps, note.note);
  });
  handle = { api, save, plugin };
  return handle;
};
