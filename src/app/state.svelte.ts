// The app's state. The storage key and the fields are the same as in v1, so a backup or a stored state moves across.
import type { Workspace } from '../domain/workspace';
import { normaliseWorkspace } from '../domain/workspace';
import { readMemoryMap, type Memory } from '../runtime/memory';
import { readWidgetMap, type WidgetValue } from '../runtime/widget';

// One day of the last scheduled run of a workspace, as the Run tab shows it
export type DayRecord = { day: string; ok: boolean; error?: string; output: string[] };

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
  widget: Record<string, WidgetValue>;
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

// Reads what was stored. v1 stored the scheduler date as milliseconds, and some workspaces have no fields yet.
export const readState = (raw: unknown): StoredState => {
  const data = (raw ?? {}) as Record<string, unknown>;
  const list = Array.isArray(data.workspaces) ? data.workspaces : [];
  return {
    workspaces: list.flatMap((w) => {
      try {
        return [normaliseWorkspace(w)];
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
  widget = $state<Record<string, WidgetValue>>({});
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
    };
  }
}

export const appState = new AppState();
