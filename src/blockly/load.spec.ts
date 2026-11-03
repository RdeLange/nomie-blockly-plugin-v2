// The editor and the generator must read a saved workspace the same way: the saved trackers stay in the dropdown,
// and a Log Value block sits inside a script and generates a statement.
import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { setupBlockly, loadWorkspace, generateCode } from './setup';
import { setTrackerOptions, currentTrackerOptions, PICK_FROM_NOMIE } from './nomie-blocks';

// a program: the script holds one Log Value block, which writes the headline to #news on today's date
const PROGRAM = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="s4eblocklyframe" id="frame" x="0" y="0">
    <statement name="script">
      <block type="s4e_logvalue" id="log">
        <value name="Value"><block type="text" id="t"><field name="TEXT">Headline</field></block></value>
        <value name="Tracker"><block type="s4e_trackers" id="tr"><field name="Trackers">#news</field></block></value>
        <value name="Date"><block type="s4e_daypicker" id="d"><field name="Day">today</field></block></value>
      </block>
    </statement>
  </block>
</xml>`;

describe('a saved workspace loads with its trackers and its blocks', () => {
  setupBlockly();

  it('keeps the saved tracker in the dropdown, even when the recent notes do not have it', () => {
    const previous = currentTrackerOptions();
    setTrackerOptions(() => [['#coffee', '#coffee']]);
    const workspace = new Blockly.Workspace();
    try {
      loadWorkspace(workspace, PROGRAM);
      const tracker = workspace.getBlockById('tr');
      expect(tracker?.getFieldValue('Trackers')).toBe('#news');
    } finally {
      workspace.dispose();
      setTrackerOptions(previous);
    }
  });

  it('offers the saved trackers of a workspace in that workspace only (L2)', () => {
    const previous = currentTrackerOptions();
    setTrackerOptions(() => [['#coffee', '#coffee']]);
    const open = new Blockly.Workspace();
    const other = new Blockly.Workspace();
    try {
      // the editor keeps its workspace open; meanwhile another workspace is compiled or built
      loadWorkspace(open, PROGRAM);
      const options = (workspace: Blockly.Workspace) =>
        (workspace.newBlock('s4e_trackers').getField('Trackers') as Blockly.FieldDropdown).getOptions(false).map((o) => o[1]);
      // the last option is the picker (phase 13); it is in every Tracker dropdown
      expect(options(open)).toEqual(['#coffee', '#news', PICK_FROM_NOMIE]);
      expect(options(other)).toEqual(['#coffee', PICK_FROM_NOMIE]);
    } finally {
      open.dispose();
      other.dispose();
      setTrackerOptions(previous);
    }
  });

  it('keeps the Log Value block connected inside the script', () => {
    const workspace = new Blockly.Workspace();
    try {
      loadWorkspace(workspace, PROGRAM);
      const log = workspace.getBlockById('log');
      expect(log?.getParent()?.type).toBe('s4eblocklyframe');
    } finally {
      workspace.dispose();
    }
  });

  it('generates the Log Value block as a statement that ends with a semicolon', () => {
    const code = generateCode(PROGRAM);
    expect(code).toMatch(/logValue\(.*\);/);
    expect(code).toContain('#news');
    expect(javascriptGenerator).toBeDefined();
  });
});
