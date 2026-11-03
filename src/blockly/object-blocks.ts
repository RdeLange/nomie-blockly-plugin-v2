// The object blocks: read JSON, turn an object into JSON, list its keys, read and set a property, and build an
// object from named fields. The block types, field and input names are those of Nomie Blockly v1, and so is the
// generated code, so v1 workspaces (and the Retrieve Temperature example) load and run the same.
// An empty input gets a default, so the code always parses.
import * as Blockly from 'blockly';
import type { Block } from 'blockly';
import { Order, type JavascriptGenerator } from 'blockly/javascript';

export const OBJECT_COLOUR = '#F99EA3';

const quote = (value: unknown) => JSON.stringify(String(value ?? ''));

// The object_create block keeps the names of its fields; the mutator dialog adds, removes and reorders them.
type ObjectCreateBlock = Blockly.BlockSvg & {
  fields: string[];
  updateShape(): void;
};
type FieldBlock = Blockly.Block & { savedConnection?: Blockly.Connection | null };

const objectCreateMutator = {
  fields: [] as string[],

  // XML, as v1 saved it: <mutation num_fields="2"><field name="a"></field><field name="b"></field></mutation>
  mutationToDom(this: ObjectCreateBlock): Element | null {
    if (!this.fields.length) return null;
    const container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('num_fields', String(this.fields.length));
    for (const name of this.fields) {
      const field = Blockly.utils.xml.createElement('field');
      field.setAttribute('name', name);
      container.appendChild(field);
    }
    return container;
  },

  domToMutation(this: ObjectCreateBlock, xml: Element) {
    this.fields = [];
    for (const child of Array.from(xml.childNodes)) {
      if (child.nodeName.toLowerCase() === 'field') this.fields.push((child as Element).getAttribute('name') ?? '');
    }
    this.updateShape();
  },

  // JSON (copy and paste in Blockly 13 uses this)
  saveExtraState(this: ObjectCreateBlock) {
    return this.fields.length ? { fields: [...this.fields] } : null;
  },

  loadExtraState(this: ObjectCreateBlock, state: { fields?: string[] } | null) {
    this.fields = [...(state?.fields ?? [])];
    this.updateShape();
  },

  decompose(this: ObjectCreateBlock, workspace: Blockly.Workspace) {
    const top = workspace.newBlock('object_create_mutator_top') as Blockly.BlockSvg;
    top.initSvg();
    let connection = top.nextConnection;
    this.fields.forEach((name, i) => {
      const fieldBlock = workspace.newBlock('object_field') as Blockly.BlockSvg;
      fieldBlock.initSvg();
      // the name as it is now on the block, which the user may have edited
      fieldBlock.setFieldValue(this.getFieldValue(`field${i + 1}`) ?? name, 'field_name');
      connection?.connect(fieldBlock.previousConnection!);
      connection = fieldBlock.nextConnection;
    });
    return top;
  },

  compose(this: ObjectCreateBlock, top: Blockly.Block) {
    const connections: Array<Blockly.Connection | null | undefined> = [];
    this.fields = [];
    let fieldBlock = top.nextConnection?.targetBlock() as FieldBlock | null;
    while (fieldBlock) {
      if (!fieldBlock.isInsertionMarker()) {
        this.fields.push(String(fieldBlock.getFieldValue('field_name') ?? ''));
        connections.push(fieldBlock.savedConnection);
      }
      fieldBlock = fieldBlock.nextConnection?.targetBlock() as FieldBlock | null;
    }
    this.updateShape();
    connections.forEach((connection, i) => {
      const input = this.getInput(`field_input${i + 1}`);
      if (connection && input?.connection && !connection.isConnected()) input.connection.connect(connection);
    });
  },

  // remembers which block is plugged into each field, so reordering in the dialog keeps them
  saveConnections(this: ObjectCreateBlock, top: Blockly.Block) {
    let fieldBlock = top.nextConnection?.targetBlock() as FieldBlock | null;
    let i = 1;
    while (fieldBlock) {
      if (!fieldBlock.isInsertionMarker()) {
        fieldBlock.savedConnection = this.getInput(`field_input${i}`)?.connection?.targetConnection ?? null;
        i += 1;
      }
      fieldBlock = fieldBlock.nextConnection?.targetBlock() as FieldBlock | null;
    }
  },

  updateShape(this: ObjectCreateBlock) {
    if (this.getInput('with')) this.removeInput('with');
    for (let i = 1; this.getInput(`field_input${i}`); i++) this.removeInput(`field_input${i}`);
    if (this.fields.length) {
      this.appendDummyInput('with').setAlign(Blockly.inputs.Align.RIGHT).appendField('with fields');
    }
    this.fields.forEach((name, i) => {
      this.appendValueInput(`field_input${i + 1}`)
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(new Blockly.FieldTextInput(name), `field${i + 1}`);
    });
  },
};

let registered = false;

export const defineObjectBlocks = (js: JavascriptGenerator) => {
  if (!registered) {
    registered = true;
    Blockly.Extensions.registerMutator('controls_create_mutator', objectCreateMutator, undefined, ['object_field']);
  }

  Blockly.defineBlocksWithJsonArray([
    {
      type: 'object_from_json',
      message0: 'get object from JSON text %1',
      args0: [{ type: 'input_value', name: 'JSON', check: 'String' }],
      inputsInline: true,
      output: 'Object',
      style: 'object_blocks',
      tooltip: 'Create an object from JSON formatted text.',
    },
    {
      type: 'object_to_json',
      message0: 'get JSON text from object %1',
      args0: [{ type: 'input_value', name: 'object', check: 'Object' }],
      inputsInline: true,
      output: null,
      style: 'object_blocks',
      tooltip: 'Create JSON formatted text from an object.',
    },
    {
      type: 'object_keys',
      message0: 'get keys from %1',
      args0: [{ type: 'input_value', name: 'object_input', check: 'Object', align: 'RIGHT' }],
      inputsInline: true,
      output: 'Array',
      style: 'object_blocks',
      tooltip: 'Get all keys of the object.',
    },
    {
      type: 'object_create',
      message0: 'create object',
      output: 'Object',
      mutator: 'controls_create_mutator',
      style: 'object_blocks',
      tooltip: 'Create a new object, with property values if you add fields (click the gear).',
    },
    {
      type: 'value_from_json_key',
      message0: 'Get value from Key: %1 from JSON object: %2',
      args0: [
        { type: 'input_value', name: 'Key', check: 'String' },
        { type: 'input_value', name: 'JSON object', check: 'Object' },
      ],
      inputsInline: true,
      output: null,
      style: 'object_blocks',
      tooltip: 'The value of a key in an object.',
    },
    {
      type: 'object_get',
      message0: 'get property %1 of %2',
      args0: [
        { type: 'field_input', name: 'NAME', text: 'name' },
        { type: 'input_value', name: 'OBJECT' },
      ],
      inputsInline: true,
      output: null,
      style: 'object_blocks',
      tooltip: 'The value of a property of an object, such as "temp" of a weather reply.',
    },
    {
      type: 'object_set',
      message0: 'set property %1 of %2 to %3',
      args0: [
        { type: 'field_input', name: 'NAME', text: 'name' },
        { type: 'input_value', name: 'OBJECT' },
        { type: 'input_value', name: 'VALUE' },
      ],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      style: 'object_blocks',
      tooltip: 'Set a property of an object.',
    },
    // the blocks inside the object_create mutator dialog
    {
      type: 'object_field',
      message0: '%1 %2',
      args0: [
        { type: 'field_input', name: 'field_name', text: 'property name' },
        { type: 'input_value', name: 'field_value' },
      ],
      previousStatement: null,
      nextStatement: null,
      style: 'object_blocks',
    },
    {
      type: 'object_create_mutator_top',
      message0: 'create object',
      nextStatement: null,
      style: 'object_blocks',
      tooltip: 'Add a field for each property.',
    },
  ]);

  const value = (block: Block, g: JavascriptGenerator, name: string, fallback: string) =>
    g.valueToCode(block, name, Order.ATOMIC) || fallback;

  js.forBlock['object_from_json'] = (block: Block, g) => [`JSON.parse(${value(block, g, 'JSON', "'{}'")})`, Order.NONE];
  js.forBlock['object_to_json'] = (block: Block, g) => [`JSON.stringify(${value(block, g, 'object', 'null')})`, Order.NONE];
  js.forBlock['object_keys'] = (block: Block, g) => [`Object.keys(${value(block, g, 'object_input', '{}')})`, Order.ATOMIC];
  js.forBlock['value_from_json_key'] = (block: Block, g) => [
    `${value(block, g, 'JSON object', '{}')}[${value(block, g, 'Key', "''")}]`,
    Order.NONE,
  ];
  js.forBlock['object_create'] = (block: Block, g) => {
    const fields = (block as unknown as ObjectCreateBlock).fields ?? [];
    if (!fields.length) return ['{}', Order.NONE];
    const parts = fields.map((_, i) => `${quote(block.getFieldValue(`field${i + 1}`))}: ${value(block, g, `field_input${i + 1}`, 'null')}`);
    return [`{ ${parts.join(', ')} }`, Order.NONE];
  };
  js.forBlock['object_get'] = (block: Block, g) => [
    `${value(block, g, 'OBJECT', '{}')}[${quote(block.getFieldValue('NAME'))}]`,
    Order.MEMBER,
  ];
  // brackets around the empty default: a statement that starts with {} would be read as a block of code
  js.forBlock['object_set'] = (block: Block, g) =>
    `${value(block, g, 'OBJECT', '({})')}[${quote(block.getFieldValue('NAME'))}] = ${value(block, g, 'VALUE', 'null')};\n`;
  // the dialog blocks generate nothing
  js.forBlock['object_field'] = () => '';
  js.forBlock['object_create_mutator_top'] = () => '';
};
