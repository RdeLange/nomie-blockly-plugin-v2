// Creating and adding workspaces. Shared by the list and the editor.
import { newId, withNewId, type Workspace } from '../domain/workspace';
import { appState } from './state.svelte';
import { actionDeps } from './dialogs';
import { refreshCompiled } from './compiler';

const FRAME_XML =
  '<xml xmlns="https://developers.google.com/blockly/xml"><block type="s4eblocklyframe" x="20" y="20"><field name="NAME">none</field></block></xml>';

// A new workspace. Its code is made when it is saved, or when it is added (see addWorkspaces).
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
  jscode: '',
  latestrun: '',
  schedule: 'none',
});

export { FRAME_XML };

// Adds workspaces with new ids, so the same file can be added twice. Each one is compiled from its blocks: a file's
// code is never kept (phase 16).
// Returns the workspaces as they were added, with their new ids.
export const addWorkspaces = async (workspaces: Workspace[]): Promise<Workspace[]> => {
  const added = await Promise.all(workspaces.map((w) => refreshCompiled(withNewId(w))));
  appState.workspaces = [...appState.workspaces, ...added];
  void actionDeps()?.save();
  return added;
};

// What the workspaces in a file do, one line each, for the question before they are added (review finding C4). The
// capability reader is Blockly, so it is loaded when the question is asked.
export const importSummary = async (workspaces: Workspace[]): Promise<string> => {
  const { capabilityText, describeCapabilities } = await import('../blockly/capabilities');
  return workspaces.map((w) => `${w.displayName}: ${capabilityText(describeCapabilities(w.workspaceBlocks))}`).join('\n');
};
