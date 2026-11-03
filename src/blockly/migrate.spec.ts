// Old function blocks become Functions blocks only when the workspace then runs exactly the same. Every test runs a
// workspace twice, without and with the migration, and compares what it showed.
import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { setupBlockly } from './setup';
import { migrateWorkspaceXml } from './migrate';
import { compileWorkspace } from './compile';
import { COMPAT_BLOCKS } from './compat-blocks';
import { runWorkspace } from '../runtime/run';
import type { NomieApi } from '../nomie/api';

const xml = (inner: string) => `<xml xmlns="https://developers.google.com/blockly/xml">${inner}</xml>`;
const frame = (script: string) =>
  `<block type="s4eblocklyframe" x="0" y="300"><field name="NAME">none</field><statement name="script">${script}</statement></block>`;
const text = (value: string) => `<block type="text"><field name="TEXT">${value}</field></block>`;
const say = (value: string, next = '') => `<block type="pushto_console"><value name="Value">${value}</value>${next}</block>`;
const fn = (name: string, args: string, body: string) =>
  `<block type="bi_function" x="0" y="0"><field name="function_type">function </field><field name="name">${name}</field><field name="args">${args}</field><statement name="chain">${body}</statement></block>`;
const call = (name: string, next = '') => `<block type="bi_call_editable"><field name="NAME">${name}</field>${next}</block>`;
const callValue = (name: string) => `<block type="bi_call_editable_return"><field name="NAME">${name}</field></block>`;
const ret = (value: string, next = '') => `<block type="bi_return"><value name="ret">${value}</value>${next}</block>`;

const api = {
  searchNotes: async () => [],
  getTracker: async () => null,
  getTrackerValues: async () => [],
  createNote: () => undefined,
  alert: () => undefined,
  prompt: async () => null,
} as NomieApi;

// The code of the blocks as they are, without the migration
const codeWithoutMigration = (blocks: string) => {
  setupBlockly();
  const workspace = new Blockly.Workspace();
  try {
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(blocks), workspace);
    javascriptGenerator.STATEMENT_PREFIX = null;
    return javascriptGenerator.workspaceToCode(workspace);
  } finally {
    javascriptGenerator.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
    workspace.dispose();
  }
};

const run = async (code: string) => {
  const lines: string[] = [];
  const result = await runWorkspace({ api, jscode: code, scheduled: false, schedule: { active: false, start: new Date(), end: new Date() }, output: (t) => lines.push(t) });
  return { ok: result.ok, lines };
};

const sameRun = async (blocks: string) => {
  const before = await run(codeWithoutMigration(blocks));
  const after = await run(compileWorkspace(blocks, { highlight: false }).code);
  expect(before.ok).toBe(true);
  expect(after).toEqual(before);
  return after;
};

describe('old functions become Functions blocks where that runs the same', () => {
  it('moves a function without a return value, and its calls', async () => {
    const blocks = xml(fn('hello', '', say(text('hi'))) + frame(call('hello', `<next>${call('hello')}</next>`)));
    const { xml: migrated, migrated: names } = migrateWorkspaceXml(blocks);
    expect(names).toEqual(['hello']);
    expect(migrated).toContain('procedures_defnoreturn');
    expect(migrated).toContain('procedures_callnoreturn');
    expect(migrated).not.toContain('bi_function');
    const { lines } = await sameRun(blocks);
    expect(lines.slice(0, 2)).toEqual(['hi', 'hi']);
  });

  it('moves a function whose last block returns a value, and its value calls', async () => {
    const body = say(text('working'), `<next>${ret(text('done'))}</next>`);
    const blocks = xml(fn('work', '', body) + frame(say(callValue('work'))));
    const { xml: migrated, migrated: names } = migrateWorkspaceXml(blocks);
    expect(names).toEqual(['work']);
    expect(migrated).toContain('procedures_defreturn');
    expect(migrated).toContain('<value name="RETURN">');
    expect(migrated).not.toContain('bi_return');
    const { lines } = await sameRun(blocks);
    expect(lines.slice(0, 2)).toEqual(['working', 'done']);
  });

  it('moves a function with arguments that nothing calls', () => {
    const blocks = xml(fn('add', 'a, b', say(text('x'))) + frame(say(text('y'))));
    const { xml: migrated, migrated: names } = migrateWorkspaceXml(blocks);
    expect(names).toEqual(['add']);
    expect(migrated).toContain('<arg name="a"');
    expect(migrated).toContain('<arg name="b"');
  });

  it('keeps a function with arguments that is called (the old calls passed no arguments), and it still runs', async () => {
    const blocks = xml(fn('add', 'a, b', say(text('called'))) + frame(call('add')));
    expect(migrateWorkspaceXml(blocks).migrated).toEqual([]);
    const { lines } = await sameRun(blocks);
    expect(lines[0]).toBe('called');
  });

  it('keeps a function whose call has something chained onto it', () => {
    const chained = `<block type="bi_call_editable"><field name="NAME">hello</field><value name="chain">${callValue('other')}</value></block>`;
    expect(migrateWorkspaceXml(xml(fn('hello', '', say(text('hi'))) + frame(chained))).migrated).toEqual([]);
  });

  it('keeps a function with a return in the middle', () => {
    const body = ret(text('early'), `<next>${say(text('later'))}</next>`);
    expect(migrateWorkspaceXml(xml(fn('f', '', body) + frame(say(callValue('f'))))).migrated).toEqual([]);
  });

  it('keeps a generator function', () => {
    const generator = fn('g', '', say(text('x'))).replace('>function </field>', '>function* </field>');
    expect(migrateWorkspaceXml(xml(generator)).migrated).toEqual([]);
  });

  it('leaves a workspace without old functions untouched', () => {
    const blocks = xml(frame(say(text('hi'))));
    expect(migrateWorkspaceXml(blocks)).toEqual({ xml: blocks, migrated: [] });
  });
});

describe('old blocks still load', () => {
  it('loads a workspace that holds every old block type', () => {
    setupBlockly();
    const all = COMPAT_BLOCKS.map((type, i) => `<block type="${type}" x="0" y="${i * 80}"></block>`).join('');
    const workspace = new Blockly.Workspace();
    try {
      Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml(all)), workspace);
      expect(workspace.getAllBlocks(false).map((b) => b.type).sort()).toEqual([...COMPAT_BLOCKS].sort());
    } finally {
      workspace.dispose();
    }
  });

  it('marks an old block that still works as a warning, and one that never worked as an error', () => {
    const { problems } = compileWorkspace(
      xml(frame(`<block type="bi_call" id="old"><field name="NAME">x</field><next><block type="bi_export" id="never"></block></next></block>`)),
      { highlight: false }
    );
    expect(problems).toContainEqual(expect.objectContaining({ blockId: 'old', level: 'warning' }));
    expect(problems).toContainEqual(expect.objectContaining({ blockId: 'never', level: 'error' }));
  });
});

describe('the object blocks', () => {
  const create = `<block type="object_create" id="obj"><mutation num_fields="3"><field name="a"></field><field name="b"></field><field name="c"></field></mutation>
    <field name="field1">a</field><field name="field2">b</field><field name="field3">c</field>
    <value name="field_input1"><block type="math_number"><field name="NUM">1</field></block></value>
    <value name="field_input3">${text('three')}</value></block>`;

  it('builds an object from its fields, as v1 did', async () => {
    const blocks = xml(frame(`<block type="pushto_console"><value name="Value"><block type="object_to_json"><value name="object">${create}</value></block></value></block>`));
    const { code } = compileWorkspace(blocks, { highlight: false });
    expect(code).toContain(`{ "a": 1, "b": null, "c": 'three' }`);
    const { lines } = await run(code);
    expect(lines[0]).toBe('{"a":1,"b":null,"c":"three"}');
  });

  it('keeps its fields through XML and JSON', () => {
    setupBlockly();
    const workspace = new Blockly.Workspace();
    try {
      Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml(create)), workspace);
      const block = workspace.getBlockById('obj')!;
      const again = Blockly.Xml.domToText(Blockly.Xml.blockToDom(block));
      expect(again).toContain('num_fields="3"');
      const json = Blockly.serialization.blocks.save(block)!;
      expect(json.extraState).toEqual({ fields: ['a', 'b', 'c'] });
      const copy = Blockly.serialization.blocks.append(json, workspace);
      expect(copy.getFieldValue('field3')).toBe('c');
      expect(copy.getInputTargetBlock('field_input1')?.getFieldValue('NUM')).toBe(1);
    } finally {
      workspace.dispose();
    }
  });

  it('reads and sets a property', async () => {
    const parse = `<block type="object_from_json"><value name="JSON">${text('{"temp":21}')}</value></block>`;
    const setObj = `<block type="variables_set"><field name="VAR">o</field><value name="VALUE">${parse}</value><next>
      <block type="object_set"><field name="NAME">unit</field><value name="OBJECT"><block type="variables_get"><field name="VAR">o</field></block></value><value name="VALUE">${text('C')}</value><next>
      ${say(`<block type="object_get"><field name="NAME">temp</field><value name="OBJECT"><block type="variables_get"><field name="VAR">o</field></block></value></block>`,
        `<next>${say(`<block type="object_to_json"><value name="object"><block type="variables_get"><field name="VAR">o</field></block></value></block>`)}</next>`)}
      </next></block></next></block>`;
    const { lines } = await run(compileWorkspace(xml(frame(setObj)), { highlight: false }).code);
    expect(lines.slice(0, 2)).toEqual(['21', '{"temp":21,"unit":"C"}']);
  });
});
