// Turns the old function blocks of a saved workspace into Blockly's own function blocks (the Functions category),
// before the workspace loads. It only does so when the result runs exactly the same; anything else is left as it is
// and keeps working through the compat blocks (compat-blocks.ts).
//
// A function and all its calls move together, or not at all:
// - the function is a top-level "function" block (not a generator or method, not nested, nothing attached below it)
//   with a valid name and valid argument names;
// - its body has no return, or exactly one return as its last block (that becomes the function's return value);
// - every call to it has nothing chained onto it, and calls it the right way: as a statement for a function
//   without a return value, as a value for one with a return value;
// - a function with arguments is only moved when nothing calls it, because the old call blocks could not pass
//   arguments (it got undefined, the new blocks would pass null).
import * as Blockly from 'blockly';

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const STATEMENT_CALLS = new Set(['bi_call', 'bi_call_editable']);
const VALUE_CALLS = new Set(['bi_call_editable_return']);

const children = (element: Element, tag: string, name?: string) =>
  Array.from(element.children).filter(
    (child) => child.tagName.toLowerCase() === tag && (name === undefined || child.getAttribute('name') === name)
  );
const child = (element: Element, tag: string, name?: string) => children(element, tag, name)[0];
const fieldText = (block: Element, name: string) => child(block, 'field', name)?.textContent ?? '';
const blocksIn = (element: Element) => Array.from(element.getElementsByTagName('block'));

// The blocks of a statement stack, top to bottom
const stack = (first: Element | undefined): Element[] => {
  const blocks: Element[] = [];
  let block = first;
  while (block) {
    blocks.push(block);
    const next = child(block, 'next');
    block = next ? child(next, 'block') : undefined;
  }
  return blocks;
};

const create = (doc: Document, tag: string, attributes: Record<string, string> = {}, text?: string) => {
  const element = doc.createElementNS(doc.documentElement.namespaceURI, tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  if (text !== undefined) element.textContent = text;
  return element;
};

// A new block element that takes the place of an old one, with its id, position and comment
const replaceBlock = (old: Element, type: string, content: Element[]) => {
  const doc = old.ownerDocument;
  const block = create(doc, 'block', { type });
  for (const attribute of ['id', 'x', 'y', 'disabled', 'collapsed']) {
    const value = old.getAttribute(attribute);
    if (value !== null) block.setAttribute(attribute, value);
  }
  for (const element of content) block.appendChild(element);
  for (const kept of [...children(old, 'comment'), ...children(old, 'next')]) block.appendChild(kept);
  old.parentNode?.replaceChild(block, old);
  return block;
};

export type MigrationReport = { xml: string; migrated: string[] };

export const migrateWorkspaceXml = (xml: string): MigrationReport => {
  if (!xml.includes('bi_function')) return { xml, migrated: [] };
  let root: Element;
  try {
    root = Blockly.utils.xml.textToDom(xml);
  } catch {
    return { xml, migrated: [] };
  }
  const doc = root.ownerDocument;
  const all = blocksIn(root);
  const functions = children(root, 'block').filter((b) => b.getAttribute('type') === 'bi_function');
  const nameCount = new Map<string, number>();
  for (const f of functions) nameCount.set(fieldText(f, 'name'), (nameCount.get(fieldText(f, 'name')) ?? 0) + 1);
  const migrated: string[] = [];

  for (const definition of functions) {
    const name = fieldText(definition, 'name').trim();
    const args = fieldText(definition, 'args').split(',').map((a) => a.trim()).filter(Boolean);
    if (fieldText(definition, 'function_type').trim() !== 'function') continue;
    if (!IDENTIFIER.test(name) || nameCount.get(fieldText(definition, 'name')) !== 1) continue;
    if (!args.every((a) => IDENTIFIER.test(a))) continue;
    if (child(definition, 'next')) continue;

    const body = child(definition, 'statement', 'chain');
    const bodyBlocks = body ? blocksIn(body) : [];
    if (bodyBlocks.some((b) => ['bi_function', 'bi_function_return'].includes(b.getAttribute('type') ?? ''))) continue;
    const returns = bodyBlocks.filter((b) => b.getAttribute('type') === 'bi_return');
    const main = stack(body ? child(body, 'block') : undefined);
    const last = main[main.length - 1];
    if (returns.length > 1 || (returns.length === 1 && returns[0] !== last)) continue;
    const withReturn = returns.length === 1;

    const calls = all.filter((b) => {
      const type = b.getAttribute('type') ?? '';
      return (STATEMENT_CALLS.has(type) || VALUE_CALLS.has(type)) && fieldText(b, 'NAME').trim() === name;
    });
    const callsFit = calls.every((call) => {
      const type = call.getAttribute('type') ?? '';
      if (child(call, 'value', 'chain')) return false;
      return withReturn ? VALUE_CALLS.has(type) : STATEMENT_CALLS.has(type);
    });
    if (!callsFit || (calls.length > 0 && args.length > 0)) continue;

    // the return value, and the body without its return block
    let returnValue: Element | undefined;
    if (withReturn) {
      returnValue = child(last, 'value', 'ret') ? child(child(last, 'value', 'ret'), 'block') : undefined;
      const before = main[main.length - 2];
      if (before) before.removeChild(child(before, 'next'));
      else body!.removeChild(last);
    }
    const mutation = create(doc, 'mutation');
    for (const arg of args) mutation.appendChild(create(doc, 'arg', { name: arg }));
    const content = [mutation, create(doc, 'field', { name: 'NAME' }, name)];
    const remainingFirst = body ? child(body, 'block') : undefined;
    if (remainingFirst) {
      const statement = create(doc, 'statement', { name: 'STACK' });
      statement.appendChild(remainingFirst);
      content.push(statement);
    }
    if (returnValue) {
      const value = create(doc, 'value', { name: 'RETURN' });
      value.appendChild(returnValue);
      content.push(value);
    }
    replaceBlock(definition, withReturn ? 'procedures_defreturn' : 'procedures_defnoreturn', content);
    for (const call of calls) {
      replaceBlock(call, withReturn ? 'procedures_callreturn' : 'procedures_callnoreturn', [create(doc, 'mutation', { name })]);
    }
    migrated.push(name);
  }

  return migrated.length ? { xml: Blockly.utils.xml.domToText(root), migrated } : { xml, migrated };
};
