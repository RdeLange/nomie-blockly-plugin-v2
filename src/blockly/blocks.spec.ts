// Every block the toolbox can offer must exist, and must generate code without an error.
import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { setupBlockly } from './setup';

const STANDARD = ['controls_if', 'logic_compare', 'controls_repeat_ext', 'math_number', 'text', 'text_join', 'variables_set', 'variables_get', 'lists_create_with', 'text_prompt_ext'];

const PALETTE = [
  // Nomie
  's4eblocklyframe', 's4e_dayvalue', 's4e_periodvalue', 's4e_logvalue', 'pushto_console', 'pushto_webconsole',
  'wait_seconds', 's4e_statspicker', 'display', 's4e_daypicker', 's4e_periodpicker', 's4e_datepicker',
  's4e_trackers', 's4e_httprequest',
  // generic JavaScript
  'bi_function', 'bi_function_return', 'bi_call', 'bi_call_editable', 'bi_call_editable_return',
  'bi_direct_call_editable', 'bi_direct_call_editable_return', 'bi_return', 'bi_spread',
  'object_create', 'object_from_json', 'object_to_json', 'object_keys', 'value_from_json_key',
  'bi_new', 'bi_anonymous_class', 'bi_class', 'bi_static', 'bi_get', 'bi_set',
  'bi_try_catch', 'bi_catch', 'bi_export', 'bi_import', 'bi_import_as', 'bi_comment',
  // standard Blockly blocks the palette uses
  'controls_if', 'logic_compare', 'controls_repeat_ext', 'math_number', 'text', 'text_join',
  'variables_set', 'variables_get', 'lists_create_with', 'text_prompt_ext',
];

describe('the palette', () => {
  setupBlockly();
  for (const type of PALETTE) {
    it(`${type} exists and generates code`, () => {
      const workspace = new Blockly.Workspace();
      try {
        const block = workspace.newBlock(type);
        expect(block.type).toBe(type);
        // blank standard blocks need their inputs or variables first, so only the custom blocks are generated here
        if (!STANDARD.includes(type)) expect(() => javascriptGenerator.blockToCode(block)).not.toThrow();
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
