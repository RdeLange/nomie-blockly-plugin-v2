// The texts of the Nomie blocks and of the palette, in the language of the Nomie user (phase 22). The definitions keep
// their English text; when they are defined, and when the palette is made, each text is looked up in BLOCK_TEXTS. A
// text without a translation shows in English. Field and input names never change, so saved workspaces and the code
// they generate are the same in every language.
import * as Blockly from 'blockly';
import { i18n } from '../app/i18n.svelte';
import { BLOCK_TEXTS } from './block-text-table';

type Definition = Record<string, unknown>;

// every English text that was looked up (the spec checks each one has a translation)
export const SEEN_BLOCK_TEXTS = new Set<string>();

export const blockText = (text: string): string => {
  SEEN_BLOCK_TEXTS.add(text);
  return BLOCK_TEXTS[i18n.lang]?.[text] ?? text;
};

// A block definition with its messages, its tooltip and its dropdown options in the language of the user
export const localiseBlockDef = (def: Definition): Definition => {
  const out: Definition = { ...def };
  for (const [key, value] of Object.entries(def)) {
    if (/^message\d+$/.test(key) && typeof value === 'string') out[key] = blockText(value);
  }
  if (typeof def.tooltip === 'string') out.tooltip = blockText(def.tooltip);
  if (Array.isArray(def.args0)) {
    out.args0 = (def.args0 as Definition[]).map((arg) =>
      Array.isArray(arg.options)
        ? { ...arg, options: (arg.options as Array<[string, string]>).map(([label, value]) => [blockText(label), value]) }
        : arg
    );
  }
  return out;
};

// Defines the blocks in the language of the user (the Nomie blocks, the widget blocks and the object blocks)
export const defineLocalisedBlocks = (defs: Definition[]) =>
  Blockly.defineBlocksWithJsonArray(defs.map(localiseBlockDef) as Parameters<typeof Blockly.defineBlocksWithJsonArray>[0]);
