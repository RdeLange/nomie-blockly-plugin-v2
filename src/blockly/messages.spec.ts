// Blockly's own texts follow the language of the Nomie user (phase 18).
import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly';
import { applyBlocklyLanguage } from './messages';

describe('the language of Blockly', () => {
  it('German and Italian texts replace the English ones, and English keeps them', () => {
    applyBlocklyLanguage('de');
    expect(Blockly.Msg.CONTROLS_REPEAT_TITLE).toBe('wiederhole %1-mal:');
    applyBlocklyLanguage('it');
    expect(Blockly.Msg.CONTROLS_REPEAT_TITLE).toBe('ripeti %1 volte');
    applyBlocklyLanguage('en');
    expect(Blockly.Msg.CONTROLS_REPEAT_TITLE).toBe('ripeti %1 volte');
  });
});
