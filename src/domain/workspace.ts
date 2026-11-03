// A workspace is one Blockly program. The shape is the same as in v1, so .wsp files and backups move between versions.
import templates from './templates.json';
import { readMemory, type Memory } from '../runtime/memory';

export type Workspace = {
  id: string;
  name: string;
  displayName: string;
  description: string;
  emoji: string;
  color: string;
  active: boolean;
  block: string;
  // the Blockly XML of the blocks, as saved by the editor
  workspaceBlocks: string;
  workspacePosition: { scrollX: number; scrollY: number; scale: number };
  // the JavaScript the blocks generate; the interpreter runs this
  jscode: string;
  // when the workspace last ran on schedule, as an ISO date (empty when it never did)
  latestrun: string;
  schedule: string;
  // set on a workspace from a backup, until its first real run in the editor: the editor then starts in test mode
  untested?: boolean;
  // the code of the blocks, and what it was compiled from (phase 16). Set by the app only (see app/compiler.ts): a
  // file never carries them, and an import is compiled again.
  compiledFrom?: string;
  runnable?: boolean;
  // the tracker of the When-note block: the workspace runs when a note with it is saved (phase 14)
  note?: string;
  // when the blocks were last saved (ISO time), and the blocks before that save (one level, phase 17)
  savedAt?: string;
  previous?: { workspaceBlocks: string; savedAt: string };
};

export const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `ws-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const DEFAULT_POSITION = { scrollX: 0, scrollY: 0, scale: 0.8 };

// Fills the fields a file might leave out, and rejects a file that cannot be a workspace.
export const normaliseWorkspace = (raw: unknown): Workspace => {
  if (!raw || typeof raw !== 'object') throw new Error('A workspace must be an object');
  const data = raw as Record<string, unknown>;
  if (typeof data.workspaceBlocks !== 'string' || typeof data.jscode !== 'string') {
    throw new Error('A workspace needs its blocks (workspaceBlocks) and its code (jscode)');
  }
  const text = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);
  return {
    id: text(data.id) || newId(),
    name: text(data.name),
    displayName: text(data.displayName, text(data.name, 'Workspace')),
    description: text(data.description),
    emoji: text(data.emoji, '🧱'),
    color: text(data.color, '#E3F2FD'),
    active: data.active !== false,
    block: text(data.block),
    workspaceBlocks: data.workspaceBlocks,
    workspacePosition: (data.workspacePosition as Workspace['workspacePosition']) ?? DEFAULT_POSITION,
    jscode: data.jscode,
    latestrun: text(data.latestrun ?? data.latesrun),
    schedule: text(data.schedule, 'none'),
    ...(data.untested === true ? { untested: true } : {}),
  };
};

// A .wsp file is a JSON array of workspaces. A single object is accepted too.
export const parseWorkspaceFile = (text: string): Workspace[] => {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('The file is not valid JSON');
  }
  const list = Array.isArray(data) ? data : [data];
  if (list.length === 0) throw new Error('The file has no workspaces');
  return list.map(normaliseWorkspace);
};

// A copy with a new id, so that importing a file twice gives two workspaces
export const withNewId = (workspace: Workspace): Workspace => ({ ...workspace, id: newId() });

// The file is a list of workspaces, as v1 wrote it. Remembered values are left out unless they are given: a backup
// carries them only when the user asks (phase 12). Secrets are never in a file. Each workspace with values gets a
// `memory` field, which v1 ignores.
export const workspaceToFile = (workspaces: Workspace[], remembered?: Record<string, Memory>): string =>
  JSON.stringify(
    workspaces.map((w) => {
      // the compiled code and its fingerprint stay in the app: an import compiles the blocks again. The previous
      // version is the user's own history, and stays out of a file too (phase 17).
      const { compiledFrom: _compiledFrom, runnable: _runnable, previous: _previous, ...shared } = w;
      const memory = remembered?.[w.id];
      return memory && Object.keys(memory).length ? { ...shared, memory } : shared;
    }),
    null,
    2
  );

// The remembered values in a backup, one entry per workspace in the same order (undefined where there are none).
export const readBackupMemory = (text: string): Array<Memory | undefined> => {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return [];
  }
  const list = Array.isArray(data) ? data : [data];
  return list.map((entry) => {
    const memory = (entry as Record<string, unknown> | null)?.memory;
    if (!memory) return undefined;
    const clean = readMemory(memory);
    return Object.keys(clean).length ? clean : undefined;
  });
};

export const templateWorkspaces = (): Workspace[] =>
  (templates as Array<Record<string, unknown>>).map((template) =>
    normaliseWorkspace({ ...template, id: newId(), latestrun: '' })
  );

// Saves new blocks for a workspace. When they differ, the blocks being replaced become the previous version, with the
// time they were saved: one level of history (phase 17).
export const savedWithBlocks = (w: Workspace, workspaceBlocks: string, savedAt: string): Workspace => {
  if (workspaceBlocks === w.workspaceBlocks) return w;
  return { ...w, workspaceBlocks, savedAt, previous: { workspaceBlocks: w.workspaceBlocks, savedAt: w.savedAt ?? '' } };
};

// The workspace with its previous blocks in place of the current ones. The editor shows them unsaved.
export const restoredWorkspace = (w: Workspace): Workspace =>
  w.previous ? { ...w, workspaceBlocks: w.previous.workspaceBlocks } : w;

// A copy under a new name, with no history: its own blocks, its own time of saving (phase 17)
export const copyOfWorkspace = (w: Workspace): Workspace => {
  const copy: Workspace = { ...w, displayName: `${w.displayName} (copy)`, name: w.name ? `${w.name} (copy)` : w.name };
  delete copy.previous;
  delete copy.savedAt;
  return copy;
};
