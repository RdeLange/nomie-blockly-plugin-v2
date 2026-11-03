// The Advanced blocks: try / catch / finally. Same block type, inputs and code as Nomie Blockly v1, with one fix:
// the error name defaults to "error" and must be a name. v1 started it empty, which generated catch(), a syntax error.
import * as Blockly from 'blockly';
import type { Block } from 'blockly';
import type { JavascriptGenerator } from 'blockly/javascript';

export const ADVANCED_COLOUR = '#88A464';

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
// a validator: a name is kept, anything else is refused (the field keeps its old value)
const identifier = (text: string) => (IDENTIFIER.test(text.trim()) ? text.trim() : null);

export const defineAdvancedBlocks = (js: JavascriptGenerator) => {
  Blockly.Blocks['bi_try_catch'] = {
    init(this: Block) {
      this.appendStatementInput('try').appendField('try');
      this.appendStatementInput('catch')
        .appendField('catch')
        .appendField(new Blockly.FieldTextInput('error', identifier), 'parameter');
      this.appendStatementInput('finally').appendField('finally');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(ADVANCED_COLOUR);
      this.setTooltip('Runs the blocks in "try". If one fails, runs "catch" with the error. "finally" always runs.');
    },
  };

  js.forBlock['bi_try_catch'] = (block: Block, g) => {
    const tryCode = g.statementToCode(block, 'try');
    const catchCode = g.statementToCode(block, 'catch');
    const finallyCode = g.statementToCode(block, 'finally');
    // workspaces saved by v1 can hold an empty name
    const name = identifier(String(block.getFieldValue('parameter') ?? '')) ?? 'error';
    return `try{\n${tryCode}\n} catch(${name}){\n${catchCode}\n} finally{\n${finallyCode}}\n`;
  };
};
