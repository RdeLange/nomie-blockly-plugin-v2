// @ts-nocheck
// The generic JavaScript blocks (functions, objects, classes, try/catch, modules), ported from Nomie Blockly v1.
// The block types and the generated code are unchanged, so older workspaces that use them keep working.
// These blocks are typed loosely for now (see the TODO in the plugin's notes); they are checked by the generator tests.
import * as Blockly from 'blockly';
import { Order, type JavascriptGenerator } from 'blockly/javascript';

export const defineLegacyBlocks = (js: JavascriptGenerator) => {
  const legacyBlocks: Record<string, unknown> = {};
  const defineJsonBlocks = (items: unknown[]) => Blockly.defineBlocksWithJsonArray(items);
  // ---- functions_blocks.js

legacyBlocks['bi_function'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['function', 'function '], ['generator', 'function* '], ['method', '']]), 'function_type')
        .appendField(new Blockly.FieldTextInput('name'), 'name')
        .appendField('(')
        .appendField(new Blockly.FieldTextInput('arg1, arg2, etc'), 'args')
        .appendField(')');
    this.appendStatementInput('chain')
        .setCheck(null);
    //this.setOutput(true, null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

legacyBlocks['bi_function_return'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([['function', 'function'], ['generator', 'function*']]), 'function_type')
        .appendField(new Blockly.FieldTextInput(''), 'name')
        .appendField('(')
        .appendField(new Blockly.FieldTextInput('arg1, arg2, etc'), 'args')
        .appendField(')');
    this.appendStatementInput('chain')
        .setCheck(null);
    this.setOutput(true, null);
    this.setColour(290);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

legacyBlocks['bi_call'] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this Blockly.Block
   */
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('call1'), 'NAME')
        .appendField('(');
    this.setHelpUrl('');
    this.setColour(290);
   // this.appendAddSubNamed('', 'items',
   //                        null,
   //                        '');
    this.itemCount_ = 1;
  //  this.updateShape_();
    this.appendValueInput('chain')
        .appendField(')')
        .setCheck(null);  // (['Method', 'Field']);
    this.setInputsInline(true);
    //this.setOutput(true, null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip('Create a list with any number of items.');
  }
};

legacyBlocks['bi_call_editable'] = {
  /**
   * Block for ...
   * @this Blockly.Block
   */
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('fcall1'), 'NAME')
        .appendField('(');
    this.setHelpUrl('http://www.example.com/');
    this.setColour(290);
   // this.appendAddSubGroup('', 'items',
   //                          null,
   //                          '');
    this.appendValueInput('chain')
        .appendField(')')
        .setCheck(null); // (['Method', 'Field']);
    this.itemCount_ = 1;
   // this.updateShape_();
    this.setInputsInline(true);
    this.setPreviousStatement(true, null); // 'Method');
    this.setNextStatement(true, null); // 'Method');
    //this.setOutput(true, 'Array');
    this.setTooltip('');
  }
};

legacyBlocks['bi_call_editable_return'] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this Blockly.Block
   */
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('fcall1'), 'NAME')
        .appendField('(');
    this.setHelpUrl('http://www.example.com/');
    this.setColour(290);
   // this.appendAddSubGroup('', 'items',
   //                          null,
   //                          '');
    this.appendValueInput('chain')
        .appendField(')')
        .setCheck(null); // (['Method', 'Field']);
    this.itemCount_ = 1;
    // this.updateShape_();
    this.setInputsInline(true);
    //this.setPreviousStatement(true, null); // 'Method');
    //this.setNextStatement(true, null); // 'Method');
    this.setOutput(true, 'Array');
    this.setTooltip('');
  }
};

legacyBlocks['bi_direct_call_editable'] = {
  /**
   * Block for building anonymous call
   * @this Blockly.Block
   */
  init: function() {
    this.appendValueInput('function')
        .appendField('(');
    this.appendDummyInput()
        .appendField(')(');
    this.setHelpUrl('http://www.example.com/');
    this.setColour(290);
  //  this.appendAddSubGroup('', 'items',
  //                           null,
  //                           '');
    this.appendValueInput('chain')
        .appendField(')')
        .setCheck(null); // (['Method', 'Field']);
    this.itemCount_ = 1;
    // this.updateShape_();
    this.setInputsInline(true);
    this.setPreviousStatement(true, null); // 'Method');
    this.setNextStatement(true, null); // 'Method');
    //this.setOutput(true, 'Array');
    this.setTooltip('');
  }
};


legacyBlocks['bi_direct_call_editable_return'] = {
  /**
   * Block for building anonymous call with return
   * @this Blockly.Block
   */
  init: function() {
    this.appendValueInput('function')
        .appendField('(');
    this.appendDummyInput()
        .appendField(')(');
    this.setHelpUrl('http://www.example.com/');
    this.setColour(290);
  //  this.appendAddSubGroup('', 'items',
  //                           null,
  //                           '');
    this.appendValueInput('chain')
        .appendField(')')
        .setCheck(null); // (['Method', 'Field']);
    this.itemCount_ = 1;
   // this.updateShape_();
    this.setInputsInline(true);
    //this.setPreviousStatement(true, null); // 'Method');
    //this.setNextStatement(true, null); // 'Method');
    this.setOutput(true, 'Array');
    this.setTooltip('');
  }
};

legacyBlocks['bi_return'] = {
  init: function() {
    this.appendValueInput('ret')
        .setCheck(null)
        .appendField('return')
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

legacyBlocks['bi_spread'] = {
  init: function() {
    this.appendValueInput('arg_array')
        .setCheck(null)
        .appendField('...');
    this.setOutput(true, null);
    this.setColour(290);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

js.forBlock['bi_function'] = function(block, generator) {
  var text_name = block.getFieldValue('name');
  var function_type = block.getFieldValue('function_type');
  var text_args = block.getFieldValue('args');
  var statements_chain = generator.statementToCode(block, 'chain');
  var chain = statements_chain;
  var code = function_type+text_name+'(';    
  code += text_args + '){\n' + chain +'}\n';
  return code;
};


js.forBlock['bi_function_return'] = function(block, generator) {
  //var text_name = block.getFieldValue('name');
  var function_type = block.getFieldValue('function_type');
  var text_name = block.getFieldValue('name');
  var text_args = block.getFieldValue('args');
  var statements_chain = generator.statementToCode(block, 'chain');
  var chain = statements_chain;
  var code = function_type+text_name+'(';
  code += text_args + '){\n' + chain +'}\n';

  //return [code, Order.NONE];
  return [code, Order.ATOMIC];
  //return code;
};

js.forBlock['bi_call'] = function(block, generator) {
  // Create a list with any number of elements of any type.
  var text_name = block.getFieldValue('NAME');
  var value_chain = generator.valueToCode(block, 'chain', Order.ATOMIC);
  var codeArr = new Array(block.itemCount_-1);
  for (var n = 1; n < block.itemCount_; n++) {
    // code[n] = generator.valueToCode(block, 'ADD' + n,
    //     Order.COMMA) || 'null';
    // TODO: Fix the naming on the AddSubGroup block and use code above
    codeArr[n-1] = generator.valueToCode(block, 'items' + n,
        Order.COMMA) || 'null';
  }
  var chain = "";
  if(value_chain !== ""){
    chain = "."+value_chain.trim();
  }
  //var code = text_name.substr(1, text_name.length-2) + '(' + codeArr.join(', ') + ')' + chain;
  var code = text_name + '(' + codeArr.join(', ') + ')' + chain;
  // a statement uses the code alone (v1 took the code from the pair)
  return block.outputConnection ? [code, Order.ATOMIC] : code;
  //return code;
};

js.forBlock['bi_call_editable'] = function(block, generator) {
  var text_name = block.getFieldValue('NAME');
  var value_chain = generator.valueToCode(block, 'chain', Order.ATOMIC);
  var codeArr = new Array(block.itemCount_-1); // block.itemCount_);
  for (var n = 1; n < block.itemCount_; n++) {
    // code[n] = generator.valueToCode(block, 'ADD' + n,
    //     Order.COMMA) || 'null';
    // TODO: Fix the naming on the AddSubGroup block and use code above
    codeArr[n-1] = generator.valueToCode(block, 'items' + n,
        Order.COMMA) || 'null';
  }
  var chain = "";
  if(value_chain !== ""){
    chain = "\n  ."+value_chain.trim();
  }
  //var code = text_name.substr(1, text_name.length-2) + '(' + codeArr.join(', ') + ')' + chain;
  var code = text_name + '(' + codeArr.join(', ') + ')' + chain+'\n';
  //return [code, Order.ATOMIC];
  return code;
};

js.forBlock['bi_call_editable_return'] = function(block, generator) {
  var text_name = block.getFieldValue('NAME');
  var value_chain = generator.valueToCode(block, 'chain', Order.ATOMIC);
  var codeArr = new Array(block.itemCount_-1); // block.itemCount_);
  for (var n = 1; n < block.itemCount_; n++) {
    // code[n] = generator.valueToCode(block, 'ADD' + n,
    //     Order.COMMA) || 'null';
    // TODO: Fix the naming on the AddSubGroup block and use code above
    codeArr[n-1] = generator.valueToCode(block, 'items' + n,
        Order.COMMA) || 'null';
  }
  var chain = "";
  if(value_chain !== ""){
    chain = "\n  ."+value_chain.trim();
  }
  //var code = text_name.substr(1, text_name.length-2) + '(' + codeArr.join(', ') + ')' + chain;
  var code = text_name + '(' + codeArr.join(', ') + ')' + chain;
  return [code, Order.ATOMIC];
  //return code;
};

js.forBlock['bi_direct_call_editable'] = function(block, generator) {
  var value_function = generator.valueToCode(block, 'function', Order.ATOMIC);
  var value_chain = generator.valueToCode(block, 'chain', Order.ATOMIC);
  var codeArr = new Array(block.itemCount_-1); // block.itemCount_);
  for (var n = 1; n < block.itemCount_; n++) {
    // code[n] = generator.valueToCode(block, 'ADD' + n,
    //     Order.COMMA) || 'null';
    // TODO: Fix the naming on the AddSubGroup block and use code above
    codeArr[n-1] = generator.valueToCode(block, 'items' + n,
        Order.COMMA) || 'null';
  }
  var chain = "";
  if(value_chain !== ""){
    chain = "\n  ."+value_chain.trim();
  }
  //var code = text_name.substr(1, text_name.length-2) + '(' + codeArr.join(', ') + ')' + chain;
  var code = '(' + value_function + ')(' + codeArr.join(', ') + ')' + chain+'\n';
  //return [code, Order.ATOMIC];
  return code;
};

js.forBlock['bi_direct_call_editable_return'] = function(block, generator) {
  var value_function = generator.valueToCode(block, 'function', Order.ATOMIC);
  var value_chain = generator.valueToCode(block, 'chain', Order.ATOMIC);
  var codeArr = new Array(block.itemCount_-1); // block.itemCount_);
  for (var n = 1; n < block.itemCount_; n++) {
    // code[n] = generator.valueToCode(block, 'ADD' + n,
    //     Order.COMMA) || 'null';
    // TODO: Fix the naming on the AddSubGroup block and use code above
    codeArr[n-1] = generator.valueToCode(block, 'items' + n,
        Order.COMMA) || 'null';
  }
  var chain = "";
  if(value_chain !== ""){
    chain = "\n  ."+value_chain.trim();
  }
  //var code = text_name.substr(1, text_name.length-2) + '(' + codeArr.join(', ') + ')' + chain;
  var code = '(' + value_function + ')(' + codeArr.join(', ') + ')' + chain;
  return [code, Order.ATOMIC];
  //return code;
};

js.forBlock['bi_return'] = function(block, generator) {
  var value_ret = generator.valueToCode(block, 'ret', Order.ATOMIC);
  var code = 'return '+value_ret+'\n';
  //return [code, Order.ATOMIC];
  return code;
};

js.forBlock['bi_spread'] = function(block, generator) {
  var value_name = generator.valueToCode(block, 'arg_array', Order.ATOMIC);
  var code = '...'+value_name;
  return [code, Order.ATOMIC];
  //return [code, Order.NONE];
  //return code;
};


  // ---- objects_blocks.js

defineJsonBlocks([{
  
          "type": "object_from_json",
          "message0": "get object from JSON text %1",
          "args0": [
              {
                  "type": "input_value",
                  "name": "JSON",
                  "check": "String"
              }
          ],
          "inputsInline": true,
          "output": "Object",
          "colour": '#F99EA3',
          "tooltip": "Create an object from JSON formatted text string.",
          "helpUrl": "http://www.json.org/"
      
}]);

defineJsonBlocks([{
  
          "type": "object_to_json",
          "message0": "get JSON text from object %1",
          "args0": [
              {
                  "type": "input_value",
                  "name": "object",
                  "check": "Object"
              }
          ],
          "inputsInline": true,
          "output": null,
          "colour": '#F99EA3',
          "tooltip": "Create JSON formatted text string from an object.",
          "helpUrl": "http://www.json.org/"
      
}]);

defineJsonBlocks([{
  
          "type": "object_keys",
          "message0": "get keys from %1",
          "args0": [
              {
                  "type": "input_value",
                  "name": "object_input",
                  "check": "Object",
                  "align": "RIGHT"
              }
          ],
          "inputsInline": true,
          "output": "Array",
          "colour": '#F99EA3',
          "tooltip": "Get all keys from the object.",
          "helpUrl": ""
      
}]);  

defineJsonBlocks([{
  
          "type": "object_create",
          "message0": "create object",
          "output": "Object",
          "mutator": "controls_create_mutator",
          "colour": "#F99EA3",
          "tooltip": "Create a new object, optionally with some property values.",
          "helpUrl": ""
     
}]);

defineJsonBlocks([{
  "type": "value_from_json_key",
  "message0": "Get value from Key: %1 from JSON object: %2",
  "args0": [
    {
      "type": "input_value",
      "name": "Key",
      "check": "String"
    },
    {
      "type": "input_value",
      "name": "JSON object",
      "check": "Object"
    }
  ],
  "inputsInline": true,
  "output": null,
  "colour": "#F99EA3",
  "tooltip": "",
  "helpUrl": ""
}]);



js.forBlock['value_from_json_key'] = function(block, generator) {
  var value_key = generator.valueToCode(block, 'Key', Order.ATOMIC);
  var value_json_object = generator.valueToCode(block, 'JSON object', Order.ATOMIC);
  // TODO: Assemble JavaScript into code variable.
  var code = value_json_object+'['+value_key+']';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Order.NONE];
};

js.forBlock['object_from_json'] = function(block, generator) {
  const value_json = generator.valueToCode(block, 'JSON', Order.ATOMIC);
  const code = 'JSON.parse(' + value_json + ')';
  return [code, Order.NONE];
};

js.forBlock['object_to_json'] = function(block, generator) {
  const value_object = generator.valueToCode(block, 'object', Order.ATOMIC);
  const code = 'JSON.stringify(' + value_object + ')';
  return [code, Order.NONE];
};

js.forBlock['object_create'] = function(block, generator) {
  if (!block.numFields) {
      return ['{}', Order.NONE];
  }
  
  var fieldInitCode = '';
  for (var i = 1; i <= block.numFields; i++) {
      if (i > 1) { 
          fieldInitCode += ', '; 
      }
      
      const fieldName = block.getFieldValue('field' + i);
      const fieldValue = generator.valueToCode(block, 'field_input' + i, Order.ATOMIC);
      fieldInitCode += '"' + fieldName + '": ' + fieldValue;
  }
  var code = '{ ' + fieldInitCode + ' }';

  return [code, Order.NONE];
};

js.forBlock['object_keys'] = function(block, generator) {
  const value_object = generator.valueToCode(block, 'object_input', Order.ATOMIC);
  var code;
  
          code = 'Object.keys(' + value_object + ')';
  
  
  return [code, Order.ATOMIC];
};

//====================================================
var objectCreateMutator = {
  numFields: 0,
  fields: [],

  /**
   * Standard function for Mutator mixin. It's called to update the block based on contents of the mutator's XML
   * DOM element.
   */
  domToMutation: function(xmlElement) {
    this.fields = [];
    for (let i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
      if (childNode.nodeName.toLowerCase() == 'field') {
        this.fields.push(childNode.getAttribute('name'));
      }
    }
    this.numFields = this.fields.length;
    this.updateShape();
  },

  /**
   * Standard function for Mutator mixin. It's called to generate the mutator's XML DOM element based on the content
   * of the block.
   */
  mutationToDom: function() {
    if (!this.numFields) {
      return null;
    }
    const container = document.createElement('mutation');
    container.setAttribute('num_fields', '' + this.numFields);
    for (let i = 0; i < this.fields.length; i++) {
      const field = document.createElement('field');
      field.setAttribute('name', this.fields[i]);
      container.appendChild(field);
    }
    return container;
  },

  /**
   * Standard function for Mutator mixin when the mutator uses the standard mutator UI. It's called to update the
   * block based on changes to the mutator's UI.
   */
  compose: function(topBlock) {
    let fieldBlock = topBlock.nextConnection && topBlock.nextConnection.targetBlock();
    this.numFields = 0;
    this.fields = [];
    let connectionsToRestore = [null];
    while (fieldBlock) {
      this.fields.push(fieldBlock.getFieldValue('field_name'));
      this.numFields++;
      connectionsToRestore.push(fieldBlock.savedConnection);
      fieldBlock = fieldBlock.nextConnection && fieldBlock.nextConnection.targetBlock();
    }
    this.updateShape();
    // Reconnect any child blocks.
    for (let i = 1; i <= this.numFields; i++) {
      Blockly.Mutator.reconnect(connectionsToRestore[i], this, 'field_input' + i);
    }
  },

  /**
   * Standard function for Mutator mixin when the mutator uses the standard mutator UI.  It's called to populate the
   * mutator UI.
   */
  decompose: function(workspace) {
    const topBlock = workspace.newBlock('object_create_mutator_top');
    topBlock.initSvg();
    let connection = topBlock.nextConnection;
    for (let i = 0; i < this.fields.length; i++) {
      const fieldBlock = workspace.newBlock('object_field');
      fieldBlock.initSvg();
      fieldBlock.setFieldValue(this.fields[i], 'field_name');
      connection.connect(fieldBlock.previousConnection);
      connection = fieldBlock.nextConnection;
    }
    return topBlock;
  },

  /**
   * Standard function for Mutator mixin when the mutator uses the standard mutator UI.  It's called on any changes to
   * the block and is generally used to keep track of input connections (by saving them with their corresponding mutator
   * blocks), so that if the mutator later causes changes to the block it can restore those input connections.
   *
   * We're also using this function to update the mutator block field name values if the user changes the name in the
   * block.
   */
  saveConnections: function(topBlock) {
    let fieldBlock = topBlock.nextConnection && topBlock.nextConnection.targetBlock();
    let i = 1;
    while (fieldBlock) {
      const input = this.getInput('field_input' + i);
      fieldBlock.savedConnection = input && input.connection.targetConnection;
      // Set mutator block field name from the corresponding 'real' Object.create block
      fieldBlock.setFieldValue(this.getFieldValue('field' + i), 'field_name');
      i++;
      fieldBlock = fieldBlock.nextConnection &&
        fieldBlock.nextConnection.targetBlock();
    }
  },

  updateShape: function() {
    // Delete everything.
    if (this.getInput('with')) {
      this.removeInput('with');
    }
    let i = 1;
    while (this.getInput('field_input' + i)) {
      this.removeInput('field_input' + i);
      i++;
    }
    // Rebuild block.
    if (this.numFields > 0) {
      this.appendDummyInput('with')
      .setAlign(Blockly.inputs.Align.RIGHT)
      .appendField("with fields");
    }
    for (let i = 1; i <= this.numFields; i++) {
      const fieldName = this.fields[i - 1];
      this.appendValueInput("field_input" + i)
        .setCheck(null)
        .setAlign(Blockly.inputs.Align.RIGHT)
        .appendField(new Blockly.FieldTextInput(fieldName), "field" + i);
    }
  },
};

Blockly.Extensions.registerMutator('controls_create_mutator', objectCreateMutator, null, ['object_field']);

// Internally used in SWITCH_CASE block mutator (so not available in the toolbox)
legacyBlocks['object_field'] = {
    init: function () {
        this.jsonInit({
            "type": "object_field",
            "message0": "%1 %2",
            "args0": [
                {
                    "type": "field_input",
                    "name": "field_name",
                    "text": "property name"
                },
                {
                    "type": "input_value",
                    "name": "field_value"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#F99EA3",
            "tooltip": "",
            "helpUrl": ""
        });
    }
};

// Internally used in SWITCH_CASE block mutator (so not available in the toolbox)
legacyBlocks['object_create_mutator_top'] = {
    init: function () {
        this.jsonInit({
            "type": "object_create_mutator",
            "message0": 'create object',
            "nextStatement": null,
            "colour": "#F99EA3",
            "tooltip": 'Create an object.',
            "helpUrl": ""
        });
    }
};
  // ---- classes_blocks.js

legacyBlocks['bi_new'] = {
  init: function() {
    this.appendValueInput('chain')
        .appendField('new')
        .setCheck(null);
    //this.setPreviousStatement(true, null);
    this.setOutput(true, null);
    this.setColour('A49F64');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

legacyBlocks['bi_anonymous_class'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('class')
        .appendField(new Blockly.FieldTextInput(''), 'NAME');
    this.appendDummyInput()
        .appendField('extends')
        .appendField(new Blockly.FieldTextInput(''), 'extends');
    this.appendStatementInput('chain')
        .setCheck(null);
    this.setHelpUrl('http://www.example.com/');
    this.setColour('A49F64');
    //this.setPreviousStatement(true, null);
    //this.setNextStatement(true, null);
    this.setOutput(true, null);
    this.setTooltip('');
  }
};

legacyBlocks['bi_class'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('class')
        .appendField(new Blockly.FieldTextInput('Name'), 'NAME');
    this.appendDummyInput()
        .appendField('extends')
        .appendField(new Blockly.FieldTextInput(''), 'extends');
    this.appendStatementInput('chain')
        .setCheck(null);
    this.setHelpUrl('http://www.example.com/');
    this.setColour('A49F64');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    //this.setOutput(true, null);
    this.setTooltip('');
  }
};

legacyBlocks['bi_static'] = {
  init: function() {
    this.appendStatementInput('static')
        .setCheck(null)
        .appendField('static');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('A49F64');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

legacyBlocks['bi_get'] = {
  init: function() {
    this.appendStatementInput('get')
        .setCheck(null)
        .appendField('get');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('A49F64');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

legacyBlocks['bi_set'] = {
  init: function() {
    this.appendStatementInput('set')
        .setCheck(null)
        .appendField('set');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('A49F64');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

js.forBlock['bi_new'] = function(block, generator) {
  var value_chain = generator.valueToCode(block, 'chain', Order.ATOMIC);
  var chain = value_chain.trim();
  var code = "new "+chain;
  return [code, Order.ATOMIC];
  //return code;
};

js.forBlock['bi_anonymous_class'] = function(block, generator) {
  var text_name = block.getFieldValue('NAME');
  var text_extends = block.getFieldValue('extends');
  var statement_chain = generator.statementToCode(block, 'chain');
  var code = 'class '+text_name
  if(text_extends !== '')
    code += ' extends '+text_extends
  code += '{\n'+statement_chain+'}';
  return [code, Order.ATOMIC];
  //return code;
};

js.forBlock['bi_class'] = function(block, generator) {
  var text_name = block.getFieldValue('NAME');
  var text_extends = block.getFieldValue('extends');
  var statement_chain = generator.statementToCode(block, 'chain');
  var code = 'class '+text_name
  if(text_extends !== '')
    code += ' extends '+text_extends
  code += '{\n'+statement_chain+'}\n';
  //return [code, Order.ATOMIC];
  return code;
};

js.forBlock['bi_static'] = function(block, generator) {
  var statement_chain = generator.statementToCode(block, 'static');
  return 'static '+statement_chain
}

js.forBlock['bi_get'] = function(block, generator) {
  var statement_chain = generator.statementToCode(block, 'get');
  return 'get '+statement_chain
}

js.forBlock['bi_set'] = function(block, generator) {
  var statement_chain = generator.statementToCode(block, 'set');
  return 'set '+statement_chain
}
  // ---- advancedjs_blocks.js

legacyBlocks['bi_try_catch'] = {
  init: function() {
    this.appendStatementInput('try')
        .setCheck(null)
        .appendField('try');
    this.appendStatementInput('catch')
        .setCheck(null)
        .appendField('catch')
        .appendField(new Blockly.FieldTextInput(''), 'parameter');    
    this.appendStatementInput('finally')
        .setCheck(null)
        .appendField('finally');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('88A464');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

legacyBlocks['bi_catch'] = {
  init: function() {
    this.appendStatementInput('catch')
        .setCheck(null)
        .appendField('catch')
        .appendField(new Blockly.FieldTextInput(''), 'parameter');    
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('88A464');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

legacyBlocks['bi_export'] = {
  init: function() {
    this.appendStatementInput('export')
        .setCheck(null)
        .appendField('export');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('88A464');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

legacyBlocks['bi_import'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('import');
//    this.appendValueInput('import')
//        .setCheck(null)
//        .appendField('import');
    //this.appendAddSubGroup('', 'items',null,
    //                       '');
    this.itemCount_ = 2;
    //this.updateShape_();    
    this.appendValueInput('from')
        .setCheck(null)
        .appendField('from');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('88A464');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

legacyBlocks['bi_import_as'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput(''), 'input');
    this.appendDummyInput()
        .appendField('as')
        .appendField(new Blockly.FieldTextInput(''), 'as');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour('88A464');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

legacyBlocks['bi_comment'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('comment');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('88A464');
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

js.forBlock['bi_try_catch'] = function(block, generator) {
  var statement_try = generator.statementToCode(block, 'try');
  var statement_catch = generator.statementToCode(block, 'catch');
  var statement_finally = generator.statementToCode(block, 'finally');
  var text_parameter = block.getFieldValue('parameter');
  var code = 'try{\n'+statement_try+'\n} catch('+text_parameter+'){\n'+statement_catch+'\n} finally{\n'+statement_finally+"}\n";
  return code;
};

js.forBlock['bi_catch'] = function(block, generator) {
  var statement_catch = generator.statementToCode(block, 'catch');
  var text_parameter = block.getFieldValue('parameter');
  var code = 'catch('+text_parameter+'){\n'+statement_catch+'}\n';
  return code;
};

js.forBlock['bi_export'] = function(block, generator) {
  var statement_chain = generator.statementToCode(block, 'export');
  return 'export '+statement_chain
}

js.forBlock['bi_import'] = function(block, generator) {
//  var value_import = generator.valueToCode(block, 'import', Order.ATOMIC);
  var codeArr = new Array(block.itemCount_-1);
  for (var n = 1; n < block.itemCount_; n++) {
    codeArr[n-1] = (block.getInput('items' + n) ? generator.valueToCode(block, 'items' + n, Order.COMMA) : '') || 'null';    
  }
  var value_from = generator.valueToCode(block, 'from', Order.ATOMIC);
  var code = 'import '
  if(block.itemCount_ === 2){
    code += codeArr[0]
  } else{
    code += '{'+codeArr.join(',')+'}'
  }
  code += ' from '+value_from+'\n'
  return code
}

js.forBlock['bi_import_as'] = function(block, generator) {
  var text_import = block.getFieldValue('input');
  var text_as = block.getFieldValue('as');
  var code = text_import+' as '+text_as
  return [code, Order.ATOMIC];
}

js.forBlock['bi_comment'] = function(block, generator) {
  // TODO: Assemble JavaScript into code variable.
  var code = ''; // '...;\n';
  return code;
};
  Blockly.common.defineBlocks(legacyBlocks);
};
