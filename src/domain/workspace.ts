// A workspace is one Blockly program. The shape is the same as in v1, so .wsp files and backups move between versions.
import templates from './templates.json';

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

export const workspaceToFile = (workspaces: Workspace[]): string => JSON.stringify(workspaces, null, 2);

export const templateWorkspaces = (): Workspace[] =>
  (templates as Array<Record<string, unknown>>).map((template) =>
    normaliseWorkspace({ ...template, id: newId(), latestrun: '' })
  );
