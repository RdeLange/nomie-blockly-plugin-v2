// Every block the toolbox can offer must exist, and must generate code without an error.
import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import Interpreter from 'js-interpreter';
import { setupBlockly } from './setup';
import { toolbox } from './toolbox';
import { COMPAT_BLOCKS } from './compat-blocks';
import { NEVER_WORKED } from './unsupported';

// The block types the palette offers, read from the toolbox, plus the blocks of the two dynamic categories
// (Variables and Functions build their blocks when they open).
const paletteTypes = (): string[] => {
  const types: string[] = [];
  for (const category of (toolbox() as { contents: Array<{ contents?: Array<{ type?: string; blockxml?: string }> }> }).contents) {
    for (const item of category.contents ?? []) {
      const type = item.type ?? /type="([^"]+)"/.exec(item.blockxml ?? '')?.[1];
      if (type) types.push(type);
    }
  }
  return [...types, 'variables_get', 'variables_set', 'procedures_defnoreturn', 'procedures_defreturn', 'procedures_callnoreturn', 'procedures_callreturn', 'procedures_ifreturn'];
};

describe('the palette', () => {
  setupBlockly();
  const PALETTE = paletteTypes();

  it('offers no block that cannot run (H1)', () => {
    for (const type of PALETTE) expect(NEVER_WORKED[type], type).toBeUndefined();
    for (const type of COMPAT_BLOCKS) expect(PALETTE, type).not.toContain(type);
  });

  for (const type of PALETTE) {
    it(`${type} generates code that the sandbox can parse`, () => {
      const workspace = new Blockly.Workspace();
      try {
        // a value block on its own becomes an expression statement; a variable block needs a variable
        const xml =
          type === 'variables_get' || type === 'variables_set'
            ? `<block type="${type}"><field name="VAR">v</field></block>`
            : type.startsWith('procedures_call')
              ? `<block type="${type.replace('call', 'def')}"><field name="NAME">f</field></block><block type="${type}" y="200"><mutation name="f"></mutation></block>`
              : type === 'procedures_ifreturn'
                ? '<block type="procedures_defreturn"><field name="NAME">f</field><statement name="STACK"><block type="procedures_ifreturn"><mutation value="1"></mutation></block></statement></block>'
                : type === 'controls_flow_statements'
                  ? `<block type="controls_whileUntil"><statement name="DO"><block type="${type}"></block></statement></block>`
                  : `<block type="${type}"></block>`;
        Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(`<xml xmlns="https://developers.google.com/blockly/xml">${xml}</xml>`), workspace);
        expect(workspace.getAllBlocks(false).some((b) => b.type === type)).toBe(true);
        const code = javascriptGenerator.workspaceToCode(workspace);
        expect(() => new Interpreter(code)).not.toThrow();
      } finally {
        workspace.dispose();
      }
    });
  }
});

describe('old blocks still load (compat)', () => {
  setupBlockly();
  for (const type of COMPAT_BLOCKS) {
    it(`${type} exists and generates code`, () => {
      const workspace = new Blockly.Workspace();
      try {
        const block = workspace.newBlock(type);
        expect(block.type).toBe(type);
        expect(() => javascriptGenerator.blockToCode(block)).not.toThrow();
      } finally {
        workspace.dispose();
      }
    });
  }
});

// Actions (they do something, like waiting or logging) sit in a script stack, so they need a previous and a next
// statement connection. Values (they give a result) need an output connection, so they fit into an input.
describe('the Nomie blocks have the connections they need', () => {
  setupBlockly();
  const ACTIONS = ['wait_seconds', 'pushto_console', 'pushto_webconsole', 'display', 's4e_logvalue'];
  const VALUES = ['s4e_dayvalue', 's4e_periodvalue', 's4e_daypicker', 's4e_periodpicker', 's4e_statspicker', 's4e_datepicker', 's4e_trackers', 's4e_httprequest'];
  for (const type of ACTIONS) {
    it(`${type} is a statement: it has a previous and a next connection`, () => {
      const workspace = new Blockly.Workspace();
      try {
        const block = workspace.newBlock(type);
        expect(Boolean(block.previousConnection && block.nextConnection)).toBe(true);
      } finally {
        workspace.dispose();
      }
    });
  }
  for (const type of VALUES) {
    it(`${type} is a value: it has an output connection`, () => {
      const workspace = new Blockly.Workspace();
      try {
        const block = workspace.newBlock(type);
        expect(Boolean(block.outputConnection)).toBe(true);
      } finally {
        workspace.dispose();
      }
    });
  }
});
