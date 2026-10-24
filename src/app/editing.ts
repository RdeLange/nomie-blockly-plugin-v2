// Creating and adding workspaces. Shared by the list and the editor.
import { newId, withNewId, type Workspace } from '../domain/workspace';
import { appState } from './state.svelte';
import { actionDeps } from './dialogs';
import { generateCode } from '../blockly/setup';

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

// Adds workspaces with new ids, so the same file can be added twice
export const addWorkspaces = (workspaces: Workspace[]) => {
  appState.workspaces = [...appState.workspaces, ...workspaces.map(withNewId)];
  actionDeps()?.save();
};
