// Creating and adding workspaces. Shared by the list and the editor.
import { newId, withNewId, type Workspace } from '../domain/workspace';
import { appState } from './state.svelte';
import { actionDeps } from './dialogs';
import { generateCode } from '../blockly/setup';
import { compileWorkspace } from '../blockly/compile';

const FRAME_XML =
  '<xml xmlns="https://developers.google.com/blockly/xml"><block type="s4eblocklyframe" x="20" y="20"><field name="NAME">none</field></block></xml>';

export const newWorkspaceFromBlocks = (): Workspace => ({
  id: newId(),
  name: '',
  displayName: 'New workspace',
  description: '',
  emoji: '🧱',
  color: '#E3F2FD',
  active: true,
  block: '',
  workspaceBlocks: FRAME_XML,
  workspacePosition: { scrollX: 0, scrollY: 0, scale: 0.8 },
  jscode: generateCode(FRAME_XML),
  latestrun: '',
  schedule: 'none',
});

// The stored code of an imported workspace is replaced with the code of its blocks. It is never run (runs compile
// the blocks), but it goes into exported files and backups, so it should match what the blocks do.
export const withFreshCode = (workspace: Workspace): Workspace => {
  const compiled = compileWorkspace(workspace.workspaceBlocks, { highlight: true });
  const unreadable = compiled.problems.some((p) => /could not be read/.test(p.message));
  return unreadable ? workspace : { ...workspace, jscode: compiled.code, schedule: compiled.schedule };
};

// Adds workspaces with new ids, so the same file can be added twice
export const addWorkspaces = (workspaces: Workspace[]) => {
  appState.workspaces = [...appState.workspaces, ...workspaces.map((w) => withFreshCode(withNewId(w)))];
  actionDeps()?.save();
};
