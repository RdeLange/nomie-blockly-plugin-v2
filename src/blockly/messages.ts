// Blockly's own texts (menus, standard blocks) in the language of the Nomie user (phase 18). Blockly defines its
// built-in blocks, with their texts, when 'blockly/blocks' is first imported; so this module applies the language when
// it loads, and setup.ts imports it before those blocks. The language is set at registration, before any of this runs.
import * as Blockly from 'blockly';
import * as dutch from 'blockly/msg/nl';
import { i18n } from '../app/i18n.svelte';

export const applyBlocklyLanguage = (lang: 'en' | 'nl') => {
  if (lang !== 'nl') return;
  for (const [key, value] of Object.entries(dutch)) {
    if (typeof value === 'string') Blockly.Msg[key] = value;
  }
};

applyBlocklyLanguage(i18n.lang);
