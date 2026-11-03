// Old blocks that are no longer in the palette. They are defined here only so that workspaces saved with them
// still load, and (where they ran before) still run. The block types, fields, inputs and generated code are those of
// Nomie Blockly v1. New work uses the Functions, Objects and Advanced categories instead.
//
// - Functions and calls: the Functions category (Blockly's own procedure blocks) replaces them. migrate.ts turns the
//   ones it can into those blocks when a workspace loads; the rest keep working through these definitions.
// - Classes, import, export, spread and a lone catch never worked (the sandbox runs ES5); see unsupported.ts.
// - The comment block generates nothing; Blockly's own comments (right-click a block) replace it.
import * as Blockly from 'blockly';
import type { Block } from 'blockly';
import { Order, type JavascriptGenerator } from 'blockly/javascript';


// Every compat block type. The editor marks these blocks as old (see compile.ts).
export const COMPAT_BLOCKS = [
  'bi_function',
  'bi_function_return',
  'bi_call',
  'bi_call_editable',
  'bi_call_editable_return',
  'bi_direct_call_editable',
  'bi_direct_call_editable_return',
  'bi_return',
  'bi_spread',
  'bi_new',
  'bi_anonymous_class',
  'bi_class',
  'bi_static',
  'bi_get',
  'bi_set',
  'bi_catch',
  'bi_export',
  'bi_import',
  'bi_import_as',
  'bi_comment',
] as const;

const statement = { previousStatement: null, nextStatement: null };

export const defineCompatBlocks = (js: JavascriptGenerator) => {
  Blockly.defineBlocksWithJsonArray([
    {
      type: 'bi_function',
      message0: '%1 %2 ( %3 ) %4',
      args0: [
        { type: 'field_dropdown', name: 'function_type', options: [['function', 'function '], ['generator', 'function* '], ['method', '']] },
        { type: 'field_input', name: 'name', text: 'name' },
        { type: 'field_input', name: 'args', text: 'arg1, arg2, etc' },
        { type: 'input_statement', name: 'chain' },
      ],
      ...statement,
      style: 'old_blocks',
    },
    {
      type: 'bi_function_return',
      message0: '%1 %2 ( %3 ) %4',
      args0: [
        { type: 'field_dropdown', name: 'function_type', options: [['function', 'function'], ['generator', 'function*']] },
        { type: 'field_input', name: 'name', text: '' },
        { type: 'field_input', name: 'args', text: 'arg1, arg2, etc' },
        { type: 'input_statement', name: 'chain' },
      ],
      output: null,
      style: 'old_blocks',
    },
    {
      type: 'bi_call',
      message0: '%1 ( ) %2',
      args0: [
        { type: 'field_input', name: 'NAME', text: 'call1' },
        { type: 'input_value', name: 'chain' },
      ],
      inputsInline: true,
      ...statement,
      style: 'old_blocks',
    },
    {
      type: 'bi_call_editable',
      message0: '%1 ( ) %2',
      args0: [
        { type: 'field_input', name: 'NAME', text: 'fcall1' },
        { type: 'input_value', name: 'chain' },
      ],
      inputsInline: true,
      ...statement,
      style: 'old_blocks',
    },
    {
      type: 'bi_call_editable_return',
      message0: '%1 ( ) %2',
      args0: [
        { type: 'field_input', name: 'NAME', text: 'fcall1' },
        { type: 'input_value', name: 'chain' },
      ],
      inputsInline: true,
      output: 'Array',
      style: 'old_blocks',
    },
    {
      type: 'bi_direct_call_editable',
      message0: '( %1 ) ( ) %2',
      args0: [
        { type: 'input_value', name: 'function' },
        { type: 'input_value', name: 'chain' },
      ],
      inputsInline: true,
      ...statement,
      style: 'old_blocks',
    },
    {
      type: 'bi_direct_call_editable_return',
      message0: '( %1 ) ( ) %2',
      args0: [
        { type: 'input_value', name: 'function' },
        { type: 'input_value', name: 'chain' },
      ],
      inputsInline: true,
      output: 'Array',
      style: 'old_blocks',
    },
    {
      type: 'bi_return',
      message0: 'return %1',
      args0: [{ type: 'input_value', name: 'ret' }],
      ...statement,
      style: 'old_blocks',
    },
    {
      type: 'bi_spread',
      message0: '... %1',
      args0: [{ type: 'input_value', name: 'arg_array' }],
      output: null,
      style: 'old_blocks',
    },
    {
      type: 'bi_new',
      message0: 'new %1',
      args0: [{ type: 'input_value', name: 'chain' }],
      output: null,
      style: 'old_blocks',
    },
    {
      type: 'bi_anonymous_class',
      message0: 'class %1 %2 extends %3 %4',
      args0: [
        { type: 'field_input', name: 'NAME', text: '' },
        { type: 'input_dummy' },
        { type: 'field_input', name: 'extends', text: '' },
        { type: 'input_statement', name: 'chain' },
      ],
      output: null,
      style: 'old_blocks',
    },
    {
      type: 'bi_class',
      message0: 'class %1 %2 extends %3 %4',
      args0: [
        { type: 'field_input', name: 'NAME', text: 'Name' },
        { type: 'input_dummy' },
        { type: 'field_input', name: 'extends', text: '' },
        { type: 'input_statement', name: 'chain' },
      ],
      ...statement,
      style: 'old_blocks',
    },
    ...(['static', 'get', 'set'] as const).map((word) => ({
      type: `bi_${word}`,
      message0: `${word} %1`,
      args0: [{ type: 'input_statement', name: word }],
      ...statement,
      style: 'old_blocks',
    })),
    {
      type: 'bi_catch',
      message0: 'catch %1 %2',
      args0: [
        { type: 'field_input', name: 'parameter', text: '' },
        { type: 'input_statement', name: 'catch' },
      ],
      ...statement,
      style: 'old_blocks',
    },
    {
      type: 'bi_export',
      message0: 'export %1',
      args0: [{ type: 'input_statement', name: 'export' }],
      ...statement,
      style: 'old_blocks',
    },
    {
      type: 'bi_import',
      message0: 'import %1 from %2',
      args0: [{ type: 'input_dummy' }, { type: 'input_value', name: 'from' }],
      ...statement,
      style: 'old_blocks',
    },
    {
      type: 'bi_import_as',
      message0: '%1 as %2',
      args0: [
        { type: 'field_input', name: 'input', text: '' },
        { type: 'field_input', name: 'as', text: '' },
      ],
      inputsInline: true,
      output: null,
      style: 'old_blocks',
    },
    {
      type: 'bi_comment',
      message0: 'comment',
      inputsInline: true,
      ...statement,
      style: 'old_blocks',
    },
  ]);

  const value = (block: Block, g: JavascriptGenerator, name: string) => g.valueToCode(block, name, Order.ATOMIC);
  // v1 chained a call onto the result of another: name().other()
  const chain = (block: Block, g: JavascriptGenerator, separator: string) => {
    const next = value(block, g, 'chain');
    return next ? `${separator}.${next.trim()}` : '';
  };
  const fn = (block: Block, g: JavascriptGenerator) =>
    `${block.getFieldValue('function_type')}${block.getFieldValue('name')}(${block.getFieldValue('args')}){\n${g.statementToCode(block, 'chain')}}\n`;

  js.forBlock['bi_function'] = (block: Block, g) => fn(block, g);
  js.forBlock['bi_function_return'] = (block: Block, g) => [fn(block, g), Order.ATOMIC];
  // v1 left out the line break after this call, which broke the code when another block followed it
  js.forBlock['bi_call'] = (block: Block, g) => `${block.getFieldValue('NAME')}()${chain(block, g, '')}\n`;
  js.forBlock['bi_call_editable'] = (block: Block, g) => `${block.getFieldValue('NAME')}()${chain(block, g, '\n  ')}\n`;
  js.forBlock['bi_call_editable_return'] = (block: Block, g) => [
    `${block.getFieldValue('NAME')}()${chain(block, g, '\n  ')}`,
    Order.ATOMIC,
  ];
  js.forBlock['bi_direct_call_editable'] = (block: Block, g) => `(${value(block, g, 'function')})()${chain(block, g, '\n  ')}\n`;
  js.forBlock['bi_direct_call_editable_return'] = (block: Block, g) => [
    `(${value(block, g, 'function')})()${chain(block, g, '\n  ')}`,
    Order.ATOMIC,
  ];
  js.forBlock['bi_return'] = (block: Block, g) => `return ${value(block, g, 'ret')}\n`;
  js.forBlock['bi_spread'] = (block: Block, g) => [`...${value(block, g, 'arg_array')}`, Order.ATOMIC];
  js.forBlock['bi_new'] = (block: Block, g) => [`new ${value(block, g, 'chain').trim()}`, Order.ATOMIC];
  const classCode = (block: Block, g: JavascriptGenerator) => {
    const extend = block.getFieldValue('extends');
    return `class ${block.getFieldValue('NAME')}${extend ? ` extends ${extend}` : ''}{\n${g.statementToCode(block, 'chain')}}`;
  };
  js.forBlock['bi_anonymous_class'] = (block: Block, g) => [classCode(block, g), Order.ATOMIC];
  js.forBlock['bi_class'] = (block: Block, g) => `${classCode(block, g)}\n`;
  for (const word of ['static', 'get', 'set']) {
    js.forBlock[`bi_${word}`] = (block: Block, g) => `${word} ${g.statementToCode(block, word)}`;
  }
  js.forBlock['bi_catch'] = (block: Block, g) => `catch(${block.getFieldValue('parameter')}){\n${g.statementToCode(block, 'catch')}}\n`;
  js.forBlock['bi_export'] = (block: Block, g) => `export ${g.statementToCode(block, 'export')}`;
  js.forBlock['bi_import'] = (block: Block, g) => `import null from ${value(block, g, 'from')}\n`;
  js.forBlock['bi_import_as'] = (block: Block) => [`${block.getFieldValue('input')} as ${block.getFieldValue('as')}`, Order.ATOMIC];
  js.forBlock['bi_comment'] = () => '';
};
