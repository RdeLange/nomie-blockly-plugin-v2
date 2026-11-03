// The app's state. The storage key and the fields are the same as in v1, so a backup or a stored state moves across.
import type { Workspace } from '../domain/workspace';
import { normaliseWorkspace } from '../domain/workspace';
import { readMemoryMap, type Memory } from '../runtime/memory';
import { readWidgetMap, type WidgetEntry } from '../runtime/widget';

// One day of the last scheduled run of a workspace, as the Run tab shows it
export type DayRecord = { day: string; ok: boolean; error?: string; output: string[] };

// The last run a saved note started for a workspace: when, whether it ran well, and the tracker it ran for (phase 17)
export type TriggerRecord = { at: string; ok: boolean; error?: string; label: string };

const readTriggers = (raw: unknown): Record<string, TriggerRecord> => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, TriggerRecord> = {};
  for (const [id, entry] of Object.entries(raw as Record<string, unknown>)) {
    const t = entry as Partial<TriggerRecord> | null;
    if (t && typeof t.at === 'string' && typeof t.ok === 'boolean' && typeof t.label === 'string') {
      out[id] = { at: t.at, ok: t.ok, label: t.label, ...(typeof t.error === 'string' ? { error: t.error } : {}) };
    }
  }
  return out;
};

export type StoredState = {
  workspaces: Workspace[];
  // ISO date of the last scheduler run ('' when it never ran)
  lastcentralschedule: string;
  // the log of the scheduler runs, newest first
  centralscheduleslist: string;
  // per workspace id: the days of its last scheduled run (new in v2; v1 ignores it)
  scheduledays: Record<string, DayRecord[]>;
  // per workspace id: the values it remembers between runs (new in v2; v1 ignores it)
  memory: Record<string, Memory>;
  // the secrets from Settings, by name (new in v2; v1 ignores it)
  secrets: Record<string, string>;
  // per workspace id: the value it last showed on the Nomie widget (new in v2; v1 ignores it)
  widget: Record<string, WidgetEntry>;
  // per workspace id: the last run a saved note started (new in v2; v1 ignores it)
  lasttrigger: Record<string, TriggerRecord>;
};

export const STORAGE_KEY = 'blockly';

// '' when there is no date: the schedule then counts as never run, and runs on the first day
const toIso = (value: unknown): string => {
  if (value === undefined || value === null || value === '') return '';
  const date = new Date(typeof value === 'number' ? value : String(value));
  return isNaN(date.getTime()) ? '' : date.toISOString();
};

const isDayRecord = (value: unknown): value is DayRecord => {
  const d = value as DayRecord;
  return Boolean(d) && typeof d.day === 'string' && typeof d.ok === 'boolean' && Array.isArray(d.output);
};

const readScheduleDays = (raw: unknown): Record<string, DayRecord[]> => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const days: Record<string, DayRecord[]> = {};
  for (const [id, list] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(list)) days[id] = list.filter(isDayRecord);
  }
  return days;
};

const readSecrets = (raw: unknown): Record<string, string> => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const secrets: Record<string, string> = {};
  for (const [name, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'string' && name !== '') secrets[name] = value;
  }
  return secrets;
};

// The fields the app keeps with a workspace (phase 16, 14). Stored state is the app's own, so they are read back here;
// a file is read by normaliseWorkspace, which does not take them.
const keepStored = (raw: unknown, workspace: Workspace): Workspace => {
  const r = raw as Record<string, unknown>;
  const kept: Workspace = { ...workspace };
  if (typeof r.compiledFrom === 'string') kept.compiledFrom = r.compiledFrom;
  if (typeof r.runnable === 'boolean') kept.runnable = r.runnable;
  if (typeof r.note === 'string' && r.note !== '') kept.note = r.note;
  if (typeof r.savedAt === 'string') kept.savedAt = r.savedAt;
  const previous = r.previous as Record<string, unknown> | undefined;
  if (previous && typeof previous.workspaceBlocks === 'string' && typeof previous.savedAt === 'string') {
    kept.previous = { workspaceBlocks: previous.workspaceBlocks, savedAt: previous.savedAt };
  }
  return kept;
};

// Reads what was stored. v1 stored the scheduler date as milliseconds, and some workspaces have no fields yet.
export const readState = (raw: unknown): StoredState => {
  const data = (raw ?? {}) as Record<string, unknown>;
  const list = Array.isArray(data.workspaces) ? data.workspaces : [];
  return {
    workspaces: list.flatMap((w) => {
      try {
        return [keepStored(w, normaliseWorkspace(w))];
      } catch {
        return [];
      }
    }),
    lastcentralschedule: toIso(data.lastcentralschedule),
    centralscheduleslist: typeof data.centralscheduleslist === 'string' ? data.centralscheduleslist : '',
    scheduledays: readScheduleDays(data.scheduledays),
    memory: readMemoryMap(data.memory),
    secrets: readSecrets(data.secrets),
    widget: readWidgetMap(data.widget),
    lasttrigger: readTriggers(data.lasttrigger),
  };
};

class AppState {
  workspaces = $state<Workspace[]>([]);
  lastCentralSchedule = $state('');
  centralLog = $state('');
  scheduleDays = $state<Record<string, DayRecord[]>>({});
  memory = $state<Record<string, Memory>>({});
  // when a workspace was paused for running too often from notes (not saved: the pause is short)
  notePauses = $state<Record<string, number>>({});
  secrets = $state<Record<string, string>>({});
  widget = $state<Record<string, WidgetEntry>>({});
  lastTrigger = $state<Record<string, TriggerRecord>>({});
  loaded = $state(false);

  load(stored: unknown) {
    const state = readState(stored);
    this.workspaces = state.workspaces;
    this.lastCentralSchedule = state.lastcentralschedule;
    this.centralLog = state.centralscheduleslist;
    this.scheduleDays = state.scheduledays;
    this.memory = state.memory;
    this.secrets = state.secrets;
    this.widget = state.widget;
    this.lastTrigger = state.lasttrigger;
    this.loaded = true;
  }

  toStored(): StoredState {
    return {
      workspaces: $state.snapshot(this.workspaces) as Workspace[],
      lastcentralschedule: this.lastCentralSchedule,
      centralscheduleslist: this.centralLog,
      scheduledays: $state.snapshot(this.scheduleDays),
      memory: $state.snapshot(this.memory),
      secrets: $state.snapshot(this.secrets),
      widget: $state.snapshot(this.widget),
      lasttrigger: $state.snapshot(this.lastTrigger),
    };
  }
}

export const appState = new AppState();
