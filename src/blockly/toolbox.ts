// The palette, shown as an icon rail (rail.ts). Search first, then Nomie (the blocks people use most), then the
// general blocks. Each category has a toolboxitemid, which picks its rail icon, and its colour from theme.ts.
// The Nomie category is named after the plugin's own category.
import type * as Blockly from 'blockly';
import { CATEGORY_COLOURS } from './theme';
import { SEARCH_CATEGORY } from './search';

type ToolboxDefinition = Blockly.utils.toolbox.ToolboxDefinition;

const block = (type: string) => ({ kind: 'block', type });
const xmlBlock = (blockxml: string) => ({ kind: 'block', blockxml });
// group headings in the drawer, in capitals (written so, because Blockly measures the text as written)
const label = (text: string) => ({ kind: 'label', text: text.toUpperCase() });

export const NOMIE_CATEGORY = 'Nomie';

export const toolbox = (nomieName: string = NOMIE_CATEGORY): ToolboxDefinition =>
  ({
    kind: 'categoryToolbox',
    contents: [
      {
        kind: 'category',
        name: 'Search',
        toolboxitemid: 'search',
        colour: '#1C1917',
        custom: SEARCH_CATEGORY,
      },
      {
        kind: 'category',
        name: nomieName,
        toolboxitemid: 'nomie',
        colour: CATEGORY_COLOURS.nomie,
        contents: [
          label('Read your notes'),
          block('s4e_dayvalue'),
          block('s4e_periodvalue'),
          block('s4e_httprequest'),
          label('Write and show'),
          block('s4e_logvalue'),
          block('display'),
          block('pushto_console'),
          block('pushto_webconsole'),
          block('wait_seconds'),
          label('Pickers'),
          block('s4e_trackers'),
          block('s4e_daypicker'),
          block('s4e_periodpicker'),
          block('s4e_statspicker'),
          block('s4e_datepicker'),
          label('History'),
          block('s4e_lastvalue'),
          block('s4e_dayssince'),
          block('s4e_streak'),
          label('Notes and places'),
          block('s4e_lognote'),
          block('s4e_mylocation'),
          block('s4e_openlink'),
          label('Memory and secrets'),
          block('s4e_remember'),
          block('s4e_recall'),
          block('s4e_forget'),
          block('s4e_secret'),
          label('Frame'),
          block('s4eblocklyframe'),
          block('s4e_whennote'),
          label('This note'),
          block('s4e_notevalue'),
          block('s4e_notetext'),
          block('s4e_noteday'),
        ],
      },
      {
        kind: 'category',
        name: 'Logic',
        toolboxitemid: 'logic',
        colour: CATEGORY_COLOURS.logic,
        contents: ['controls_if', 'logic_compare', 'logic_operation', 'logic_negate', 'logic_boolean', 'logic_null', 'logic_ternary'].map(block),
      },
      {
        kind: 'category',
        name: 'Loops',
        toolboxitemid: 'loops',
        colour: CATEGORY_COLOURS.loops,
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
        toolboxitemid: 'math',
        colour: CATEGORY_COLOURS.math,
        contents: ['math_number', 'math_single', 'math_trig', 'math_constant', 'math_number_property', 'math_round', 'math_on_list', 'math_modulo', 'math_constrain', 'math_random_int', 'math_random_float', 'math_atan2'].map(block),
      },
      {
        kind: 'category',
        name: 'Text',
        toolboxitemid: 'text',
        colour: CATEGORY_COLOURS.text,
        contents: [
          block('text'),
          xmlBlock('<block type="text_join" inline="true" />'),
          ...['text_append', 'text_length', 'text_isEmpty', 'text_indexOf', 'text_charAt', 'text_getSubstring', 'text_changeCase', 'text_trim', 'text_prompt_ext'].map(block),
        ],
      },
      {
        kind: 'category',
        name: 'Lists',
        toolboxitemid: 'lists',
        colour: CATEGORY_COLOURS.lists,
        contents: ['lists_create_empty', 'lists_create_with', 'lists_repeat', 'lists_length', 'lists_isEmpty', 'lists_indexOf', 'lists_getIndex', 'lists_setIndex'].map(block),
      },
      {
        kind: 'category',
        name: 'Variables',
        toolboxitemid: 'variables',
        custom: 'VARIABLE',
        colour: CATEGORY_COLOURS.variables,
      },
      {
        kind: 'category',
        name: 'Functions',
        toolboxitemid: 'functions',
        // Blockly's own function blocks: with parameters and a return value (the old function blocks could not
        // pass arguments). Old workspaces keep their old blocks, see compat-blocks.ts and migrate.ts.
        custom: 'PROCEDURE',
        colour: CATEGORY_COLOURS.functions,
      },
      {
        kind: 'category',
        name: 'Objects',
        toolboxitemid: 'objects',
        colour: CATEGORY_COLOURS.objects,
        contents: ['object_create', 'object_get', 'object_set', 'object_keys', 'object_from_json', 'object_to_json', 'value_from_json_key'].map(block),
      },
      {
        kind: 'category',
        name: 'Advanced',
        toolboxitemid: 'advanced',
        colour: CATEGORY_COLOURS.advanced,
        contents: ['bi_try_catch'].map(block),
      },
    ],
  }) as unknown as ToolboxDefinition;
