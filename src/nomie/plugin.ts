// Registers the plugin with Nomie, and connects the Nomie events to the app.
import { createNomieApi, type NomieApi, type TrackerInfo } from './api';
import { appState } from '../app/state.svelte';
import { ui } from '../app/ui.svelte';
import { trackerChoices } from '../app/trackers.svelte';
import { setLanguage } from '../app/i18n.svelte';
import { STORAGE_KEY, readState } from '../app/state.svelte';
import { compileStale, scheduleIfDue, runFromNote, runFromNotes } from '../app/actions';
import { rememberWritten, wasWrittenHere } from '../app/written-notes';
import { setTrackerPicker } from './picker';

declare const NomiePlugin: any;

export type NomieHandle = { api: NomieApi; save: () => Promise<boolean>; plugin: any };

let handle: NomieHandle | undefined;
// the connection to Nomie, once the plugin has started (undefined when the page runs outside Nomie)
export const nomie = (): NomieHandle | undefined => handle;

// the calls this plugin makes to Nomie; Nomie refuses any other (see api.ts for each one's payload)
export const USES = [
  'createNote',
  'searchNotes',
  'getTrackable',
  'getTrackableUsage',
  'confirm',
  'prompt',
  'alert',
  'onNote',
  'getLocation',
  'openURL',
  'selectTrackables',
];

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
  const nomieApi = createNomieApi(plugin);
  // the Tracker dropdown's "Pick from Nomie" opens Nomie's own picker
  setTrackerPicker(() => nomieApi.pickTracker());
  const api: NomieApi = {
    ...nomieApi,
    createNote: (note, end) => {
      rememberWritten(note);
      nomieApi.createNote(note, end);
    },
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

  plugin.onRegistered(async () => {
    applyTheme(plugin);
    await plugin.storage.init();
    appState.load(plugin.storage.getItem(STORAGE_KEY));
    // the language of the Nomie user: the plugin's own text, and Blockly's (see blockly/messages.ts)
    setLanguage(plugin.prefs?.language);
    ui.ready = true;
    // a workspace from before the stored code was kept is compiled once, and stored (see compiler.ts)
    void compileStale(deps);
    void refreshTrackers(api);
    // Nomie may launch the plugin before its storage is ready; the schedule then starts here
    if (launched) void scheduleIfDue(deps);
  });
  plugin.onUIOpened(() => {
    applyTheme(plugin);
    ui.mode = 'modal';
    void refreshTrackers(api);
  });
  // The widget is its own frame, so it reads the stored values again when it opens, and every 5 minutes after that:
  // the schedule and the note runs happen in other frames (phase 15).
  const reloadWidget = async () => {
    await plugin.storage.init();
    appState.widget = readState(plugin.storage.getItem(STORAGE_KEY)).widget;
  };
  let widgetTimer: ReturnType<typeof setInterval> | undefined;
  plugin.onWidget(() => {
    applyTheme(plugin);
    ui.mode = 'widget';
    void reloadWidget();
    if (widgetTimer) clearInterval(widgetTimer);
    widgetTimer = setInterval(() => void reloadWidget(), 5 * 60 * 1000);
  });
  plugin.onLaunch(() => {
    launched = true;
    void scheduleIfDue(deps);
    // one timer, also when Nomie launches the plugin more than once
    if (timer) clearInterval(timer);
    timer = setInterval(() => void scheduleIfDue(deps), 60 * 60 * 1000);
  });
  plugin.onNote((note: { note: string; end?: unknown; elements?: unknown[]; id?: string }) => {
    const text = note?.note ?? '';
    // a note the plugin wrote does not start a workspace again (see written-notes.ts)
    if (wasWrittenHere(text)) return;
    if (text.includes('Run Blockly Workspace:')) runFromNote(deps, text);
    // a When-note workspace runs when a note with its tracker is saved
    void runFromNotes(deps, note as Parameters<typeof runFromNotes>[1]);
  });
  handle = { api, save, plugin };
  return handle;
};
