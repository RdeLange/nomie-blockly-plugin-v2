// The app's state. The storage key and the fields are the same as in v1, so a backup or a stored state moves across.
import type { Workspace } from '../domain/workspace';
import { normaliseWorkspace } from '../domain/workspace';

export type StoredState = {
  workspaces: Workspace[];
  // ISO date of the last scheduler run ('' when it never ran)
  lastcentralschedule: string;
  // the log of the scheduler runs, newest first
  centralscheduleslist: string;
};

export const STORAGE_KEY = 'blockly';

// '' when there is no date: the schedule then counts as never run, and runs on the first day
const toIso = (value: unknown): string => {
  if (value === undefined || value === null || value === '') return '';
  const date = new Date(typeof value === 'number' ? value : String(value));
  return isNaN(date.getTime()) ? '' : date.toISOString();
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
  };
};

class AppState {
  workspaces = $state<Workspace[]>([]);
  lastCentralSchedule = $state('');
  centralLog = $state('');
  loaded = $state(false);

  load(stored: unknown) {
    const state = readState(stored);
    this.workspaces = state.workspaces;
    this.lastCentralSchedule = state.lastcentralschedule;
    this.centralLog = state.centralscheduleslist;
    this.loaded = true;
  }

  toStored(): StoredState {
    return {
      workspaces: $state.snapshot(this.workspaces) as Workspace[],
      lastcentralschedule: this.lastCentralSchedule,
      centralscheduleslist: this.centralLog,
    };
  }
}

export const appState = new AppState();
