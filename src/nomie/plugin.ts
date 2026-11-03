// Registers the plugin with Nomie, and connects the Nomie events to the app.
import { createNomieApi, type NomieApi, type TrackerInfo } from './api';
import { appState } from '../app/state.svelte';
import { ui } from '../app/ui.svelte';
import { trackerChoices, trackerOptionsNow } from '../app/trackers.svelte';
import { STORAGE_KEY } from '../app/state.svelte';
import { scheduleIfDue, runFromNote } from '../app/actions';
import { setupBlockly } from '../blockly/setup';

declare const NomiePlugin: any;

export type NomieHandle = { api: NomieApi; save: () => Promise<boolean>; plugin: any };

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
    name: 'Nomie Blockly v2',
    emoji: '🧱',
    description: 'Build small automations from blocks, and run them against your notes.',
    uses: USES,
    version: '2.0',
    addToCaptureMenu: true,
    addToMoreMenu: true,
    addToWidgets: true,
  });
  // Notes this plugin wrote in the last two minutes. A workspace that logs "Run Blockly Workspace: X" must not start
  // itself again through the note trigger.
  const written = new Map<string, number>();
  const nomieApi = createNomieApi(plugin);
  const api: NomieApi = {
    ...nomieApi,
    createNote: (note, end) => {
      written.set(note, Date.now());
      nomieApi.createNote(note, end);
    },
  };
  const writtenByUs = (note: string) => {
    const now = Date.now();
    for (const [text, at] of written) if (now - at > 2 * 60_000) written.delete(text);
    return written.has(note);
  };

  // Saving waits for Nomie and says when it failed. Before the stored state is loaded nothing is saved: that would
  // write an empty list of workspaces over the stored one.
  const save = async (): Promise<boolean> => {
    if (!appState.loaded) return false;
    try {
      await plugin.storage.setItem(STORAGE_KEY, appState.toStored());
      return true;
    } catch (error) {
      plugin.alert('Not saved', `Nomie Blockly could not save your workspaces: ${String(error)}`);
      return false;
    }
  };
  const deps = { api, save };
  let launched = false;
  let timer: ReturnType<typeof setInterval> | undefined;
  setupBlockly(trackerOptionsNow);

  plugin.onRegistered(async () => {
    applyTheme(plugin);
    await plugin.storage.init();
    appState.load(plugin.storage.getItem(STORAGE_KEY));
    ui.ready = true;
    void refreshTrackers(api);
    // Nomie may launch the plugin before its storage is ready; the schedule then starts here
    if (launched) void scheduleIfDue(deps);
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
    launched = true;
    void scheduleIfDue(deps);
    // one timer, also when Nomie launches the plugin more than once
    if (timer) clearInterval(timer);
    timer = setInterval(() => void scheduleIfDue(deps), 60 * 60 * 1000);
  });
  plugin.onNote((note: { note: string }) => {
    const text = note?.note ?? '';
    if (text.includes('Run Blockly Workspace:') && !writtenByUs(text)) runFromNote(deps, text);
  });
  handle = { api, save, plugin };
  return handle;
};
