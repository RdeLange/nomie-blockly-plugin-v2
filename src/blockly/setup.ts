// Registers the blocks and the code generator once. The editor and the tests both use this, so they generate the same code.
import * as Blockly from 'blockly';
// the language first: Blockly's built-in blocks take their texts when they are defined (see messages.ts)
import './messages';
import 'blockly/blocks';
import { javascriptGenerator } from 'blockly/javascript';
import '@blockly/field-date';
import { defineObjectBlocks } from './object-blocks';
import { defineAdvancedBlocks } from './advanced-blocks';
import { defineCompatBlocks } from './compat-blocks';
import { migrateWorkspaceXml } from './migrate';
import { defineWidgetBlocks, migrateShowOnWidget, registerWidgetGenerators, WIDGET_RESERVED_WORDS } from './widget-builder';
// registers the notebook themes and the plugin's style names
import './theme';
import {
  defineNomieBlocks,
  registerNomieGenerators,
  NOMIE_RESERVED_WORDS,
  rememberSavedTrackers,
  setTrackerOptions,
  type TrackerOption,
} from './nomie-blocks';

let registered = false;

export const setupBlockly = (trackers?: () => TrackerOption[]) => {
  if (trackers) setTrackerOptions(trackers);
  if (registered) return;
  registered = true;
  defineNomieBlocks();
  defineWidgetBlocks();
  registerNomieGenerators(javascriptGenerator);
  registerWidgetGenerators(javascriptGenerator);
  defineObjectBlocks(javascriptGenerator);
  defineAdvancedBlocks(javascriptGenerator);
  defineCompatBlocks(javascriptGenerator);
  // every statement is highlighted while it runs, as in v1
  javascriptGenerator.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
  for (const word of [...NOMIE_RESERVED_WORDS, ...WIDGET_RESERVED_WORDS, 'highlightBlock']) javascriptGenerator.addReservedWords(word);
};

// The JavaScript for a workspace, from its Blockly XML. Headless: no page is needed.
export const generateCode = (workspaceBlocks: string): string => {
  setupBlockly();
  const workspace = new Blockly.Workspace();
  try {
    readBlocksInto(workspace, workspaceBlocks);
    return javascriptGenerator.workspaceToCode(workspace);
  } finally {
    workspace.dispose();
  }
};

// Loads a saved workspace into a Blockly workspace: old function blocks become Functions blocks where that runs
// the same (migrate.ts), and the trackers it was saved with stay in its Tracker dropdowns, also when they are not
// in the recent notes. The editor, the compiler and the generator all load blocks this way.
export const readBlocksInto = (workspace: Blockly.Workspace, workspaceBlocks: string) => {
  setupBlockly();
  rememberSavedTrackers(workspace, workspaceBlocks);
  Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(migrateWorkspaceXml(migrateShowOnWidget(workspaceBlocks)).xml), workspace);
};

// The editor's name for it
export const loadWorkspace = readBlocksInto;

export { Blockly, javascriptGenerator };
