// Registers the blocks and the code generator once. The editor and the tests both use this, so they generate the same code.
import * as Blockly from 'blockly';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import '@blockly/field-date';
import { defineLegacyBlocks } from './legacy-js-blocks';
import {
  defineNomieBlocks,
  registerNomieGenerators,
  NOMIE_RESERVED_WORDS,
  currentTrackerOptions,
  setTrackerOptions,
  trackersUsedIn,
  type TrackerOption,
} from './nomie-blocks';

let registered = false;

export const setupBlockly = (trackers?: () => TrackerOption[]) => {
  if (trackers) setTrackerOptions(trackers);
  if (registered) return;
  registered = true;
  defineNomieBlocks();
  registerNomieGenerators(javascriptGenerator);
  defineLegacyBlocks(javascriptGenerator);
  // every statement is highlighted while it runs, as in v1
  javascriptGenerator.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
  for (const word of [...NOMIE_RESERVED_WORDS, 'highlightBlock']) javascriptGenerator.addReservedWords(word);
};

// The JavaScript for a workspace, from its Blockly XML. Headless: no page is needed.
export const generateCode = (workspaceBlocks: string): string => {
  setupBlockly();
  const workspace = new Blockly.Workspace();
  // the saved trackers stay valid for this workspace, even when they are not in the recent notes
  const previous = currentTrackerOptions();
  setTrackerOptions(() => [...previous(), ...trackersUsedIn(workspaceBlocks)]);
  try {
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(workspaceBlocks), workspace);
    return javascriptGenerator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
    setTrackerOptions(previous);
  }
};

// Loads a saved workspace into a Blockly workspace (the editor uses this too). The trackers the workspace was saved with
// stay in the Tracker dropdowns while it is loaded, so a tracker missing from the recent notes is not replaced.
// The returned function puts the previous options back; the editor calls it when it closes.
export const loadWorkspace = (workspace: Blockly.Workspace, workspaceBlocks: string): (() => void) => {
  setupBlockly();
  const previous = currentTrackerOptions();
  setTrackerOptions(() => [...previous(), ...trackersUsedIn(workspaceBlocks)]);
  Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(workspaceBlocks), workspace);
  return () => setTrackerOptions(previous);
};

export { Blockly, javascriptGenerator };
