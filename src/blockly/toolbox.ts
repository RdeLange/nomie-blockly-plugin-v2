// The palette, in the same categories as v1. The Nomie category is named after the plugin's own category.
import type { ToolboxDefinition } from 'blockly/core/utils/toolbox';

const block = (type: string) => ({ kind: 'block', type });
const xmlBlock = (blockxml: string) => ({ kind: 'block', blockxml });

export const NOMIE_CATEGORY = 'Nomie';

export const toolbox = (nomieName: string = NOMIE_CATEGORY): ToolboxDefinition =>
  ({
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Logic',
        colour: '#5B80A5',
        contents: ['controls_if', 'logic_compare', 'logic_operation', 'logic_negate', 'logic_boolean', 'logic_null', 'logic_ternary'].map(block),
      },
      {
        kind: 'category',
        name: 'Loops',
        colour: '#5CA65C',
        contents: [
          block('controls_repeat_ext'),
          block('controls_whileUntil'),
          xmlBlock(
            '<block type="controls_for"><field name="VAR">i</field><value name="FROM"><block type="math_number"><field name="NUM">1</field></block></value><value name="TO"><block type="math_number"><field name="NUM">10</field></block></value><value name="BY"><block type="math_number"><field name="NUM">1</field></block></value></block>'
          ),
          block('controls_forEach'),
          block('controls_flow_statements'),
        ],
      },
      {
        kind: 'category',
        name: 'Math',
        colour: '#5B67A5',
        contents: ['math_number', 'math_single', 'math_trig', 'math_constant', 'math_number_property', 'math_round', 'math_on_list', 'math_modulo', 'math_constrain', 'math_random_int', 'math_random_float', 'math_atan2'].map(block),
      },
      {
        kind: 'category',
        name: 'Text',
        colour: '#5CA68D',
        contents: [
          block('text'),
          xmlBlock('<block type="text_join" inline="true" />'),
          'text_append',
          'text_length',
          'text_isEmpty',
          'text_indexOf',
          'text_charAt',
          'text_getSubstring',
          'text_changeCase',
          'text_trim',
          'text_prompt_ext',
        ].map((t) => (typeof t === 'string' ? block(t) : t)),
      },
      {
        kind: 'category',
        name: 'Lists',
        colour: '#745BA5',
        contents: ['lists_create_empty', 'lists_create_with', 'lists_repeat', 'lists_length', 'lists_isEmpty', 'lists_indexOf', 'lists_getIndex', 'lists_setIndex'].map(block),
      },
      {
        kind: 'category',
        name: 'Variables',
        custom: 'VARIABLE',
        colour: '#A55B80',
      },
      { kind: 'sep' },
      {
        kind: 'category',
        name: 'Functions',
        colour: '#9A5CA6',
        contents: [
          'bi_function',
          'bi_function_return',
          'bi_call',
          'bi_call_editable',
          'bi_call_editable_return',
          'bi_direct_call_editable',
          'bi_direct_call_editable_return',
          'bi_return',
          'bi_spread',
        ].map(block),
      },
      {
        kind: 'category',
        name: 'Objects',
        colour: '#A5835B',
        contents: ['object_create', 'object_keys', 'object_from_json', 'object_to_json', 'value_from_json_key'].map(block),
      },
      {
        kind: 'category',
        name: 'Classes',
        colour: '#5BA5A5',
        contents: ['bi_new', 'bi_anonymous_class', 'bi_class', 'bi_static', 'bi_get', 'bi_set'].map(block),
      },
      {
        kind: 'category',
        name: 'Advanced',
        colour: '#88A464',
        contents: ['bi_try_catch', 'bi_catch', 'bi_export', 'bi_import', 'bi_import_as', 'bi_comment'].map(block),
      },
      { kind: 'sep' },
      {
        kind: 'category',
        name: nomieName,
        colour: '#0AB3F5',
        contents: [
          's4eblocklyframe',
          's4e_dayvalue',
          's4e_periodvalue',
          's4e_logvalue',
          'pushto_console',
          'pushto_webconsole',
          'wait_seconds',
          's4e_statspicker',
          'display',
          's4e_daypicker',
          's4e_periodpicker',
          's4e_datepicker',
          's4e_trackers',
          's4e_httprequest',
        ].map(block),
      },
    ],
  }) as unknown as ToolboxDefinition;
