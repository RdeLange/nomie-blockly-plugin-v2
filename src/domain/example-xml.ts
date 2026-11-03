// Small helpers that write the Blockly XML of the example workspaces (see example-library.ts), so each example reads
// like its blocks. A script is a list of blocks, joined in order; the XML is what the editor saves, so an example
// loads and runs like any workspace.

export type Block = {
  type: string;
  inline?: boolean;
  mutation?: string;
  // a text field, by name
  fields: Record<string, string>;
  // a variable field: the variable it names is declared in the workspace (see workspaceXml)
  variables: Record<string, string>;
  // one block in each input
  values: Record<string, Block>;
  // the blocks of each statement input, in order
  statements: Record<string, Block[]>;
  // only a top-level block has a place on the canvas
  at?: { x: number; y: number };
};

export type BlockOptions = Partial<Omit<Block, 'type'>>;

const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// A variable keeps one id in the workspace, so every block that names it refers to the same variable.
const variableId = (name: string) => `var-${name.replace(/[^A-Za-z0-9]/g, '_')}`;

export const block = (type: string, options: BlockOptions = {}): Block => ({
  type,
  fields: {},
  variables: {},
  values: {},
  statements: {},
  ...options,
});

// One block and the blocks in its inputs, with no block after it
const renderOne = (b: Block, following = ''): string => {
  const attributes = [`type="${b.type}"`];
  if (b.inline) attributes.push('inline="true"');
  if (b.at) attributes.push(`x="${b.at.x}" y="${b.at.y}"`);
  const parts: string[] = [];
  if (b.mutation) parts.push(b.mutation);
  for (const [name, value] of Object.entries(b.fields)) parts.push(`<field name="${name}">${escape(value)}</field>`);
  for (const [name, value] of Object.entries(b.variables)) {
    parts.push(`<field name="${name}" id="${variableId(value)}">${escape(value)}</field>`);
  }
  for (const [name, value] of Object.entries(b.values)) parts.push(`<value name="${name}">${renderChain([value])}</value>`);
  for (const [name, blocks] of Object.entries(b.statements)) {
    parts.push(`<statement name="${name}">${renderChain(blocks)}</statement>`);
  }
  if (following) parts.push(`<next>${following}</next>`);
  return `<block ${attributes.join(' ')}>${parts.join('')}</block>`;
};

// Blocks one after the other: the first block's next is the second, and so on
export const renderChain = (blocks: Block[]): string =>
  blocks.reduceRight((following, b) => renderOne(b, following), '');

// The whole workspace: its top-level blocks, and the variables they use
export const workspaceXml = (tops: Block[], variables: string[] = []): string => {
  const declared = variables.map((name) => `<variable id="${variableId(name)}">${escape(name)}</variable>`).join('');
  const body = tops.map((b) => renderOne(b)).join('');
  return `<xml xmlns="https://developers.google.com/blockly/xml">${declared ? `<variables>${declared}</variables>` : ''}${body}</xml>`;
};

export const text = (value: string) => block('text', { fields: { TEXT: value } });
export const number = (value: number) => block('math_number', { fields: { NUM: String(value) } });
export const tracker = (tag: string) => block('s4e_trackers', { fields: { Trackers: tag } });
export const get = (name: string) => block('variables_get', { variables: { VAR: name } });
export const set = (name: string, value: Block) => block('variables_set', { variables: { VAR: name }, values: { VALUE: value } });
// a value written to the console, as a line of text
export const show = (value: Block) => block('pushto_console', { values: { Value: value } });
// a message shown in the run's output
export const message = (value: Block) => block('display', { values: { Value: value } });
// text joined from parts, in order
export const join = (...parts: Block[]) => {
  const values: Record<string, Block> = {};
  parts.forEach((part, i) => (values[`ADD${i}`] = part));
  return block('text_join', { inline: true, mutation: `<mutation items="${parts.length}"></mutation>`, values });
};
// the Scheduler block: its script runs once for each day of a scheduled run, or once for the day it is run by hand
export const schedule = (frequency: 'none' | 'daily', body: Block[], at = { x: 20, y: 20 }): Block =>
  block('s4eblocklyframe', { fields: { NAME: frequency }, statements: { script: body }, at });
// the When-note block: its script runs when a note with the tracker is saved
export const whenNote = (tag: string, body: Block[], at = { x: 20, y: 20 }): Block =>
  block('s4e_whennote', { values: { Tracker: tracker(tag) }, statements: { script: body }, at });
