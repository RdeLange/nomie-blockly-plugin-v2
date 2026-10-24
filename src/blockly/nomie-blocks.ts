// The Nomie blocks: they read your notes, write to them, and show results.
// The block type names, field names and generated code are the same as in Nomie Blockly v1,
// so workspaces saved with v1 (.wsp files) load and run the same way.
import { defineBlocksWithJsonArray } from 'blockly';
import type { Block } from 'blockly';
import { Order, type JavascriptGenerator } from 'blockly/javascript';

export const NOMIE_COLOUR = '#0AB3F5';
export const FRAME_COLOUR = '#0070C0';

// The tracker dropdown is filled from the trackers in your notes, so it is a function.
export type TrackerOption = [label: string, value: string];
let trackerOptions: () => TrackerOption[] = () => [['—', '#none']];
export const setTrackerOptions = (fn: () => TrackerOption[]) => (trackerOptions = fn);
export const currentTrackerOptions = () => trackerOptions;

// A workspace keeps the tracker it was saved with. A dropdown only accepts values in its options, so a tracker
// that is not in the recent notes would be replaced with the first option. These are the trackers a workspace uses.
export const trackersUsedIn = (workspaceBlocks: string): TrackerOption[] => {
  const found = [...workspaceBlocks.matchAll(/<field name="Trackers">([^<]*)<\/field>/g)].map((m) => m[1]);
  return [...new Set(found)].map((tag) => [tag, tag] as TrackerOption);
};

const DAY_OPTIONS = [
  ['Today', 'today'],
  ['Yesterday', 'yesterday'],
];
const PERIOD_OPTIONS = [
  ['Today', 'TODAY'],
  ['Last 7 Days', 'LAST7DAYS'],
  ['Last 30 Days', 'LAST30DAYS'],
  ['Last 60 Days', 'LAST60DAYS'],
  ['Last 90 Days', 'LAST90DAYS'],
];
const STAT_OPTIONS = [
  ['Average', 'avg'],
  ['Sum', 'sum'],
  ['Maximum', 'Max'],
  ['Minimum', 'Min'],
];

export const defineNomieBlocks = () => {
  defineBlocksWithJsonArray([
    {
      type: 's4eblocklyframe',
      message0: 'Scheduler: %1 %2 Blockly Script %3 %4',
      args0: [
        {
          type: 'field_dropdown',
          name: 'NAME',
          options: [
            ['No Schedule', 'none'],
            ['Daily', 'daily'],
          ],
        },
        { type: 'input_dummy' },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'script' },
      ],
      colour: FRAME_COLOUR,
    },
    {
      type: 'display',
      message0: 'Display Value %1 %2',
      args0: [{ type: 'input_dummy' }, { type: 'input_value', name: 'Value', check: 'String' }],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: NOMIE_COLOUR,
    },
    {
      type: 's4e_daypicker',
      message0: 'Day %1',
      args0: [{ type: 'field_dropdown', name: 'Day', options: DAY_OPTIONS }],
      output: 'Day',
      colour: NOMIE_COLOUR,
    },
    {
      type: 's4e_periodpicker',
      message0: 'Period %1',
      args0: [{ type: 'field_dropdown', name: 'Period', options: PERIOD_OPTIONS }],
      output: 'Period',
      colour: NOMIE_COLOUR,
    },
    {
      type: 's4e_statspicker',
      message0: 'Statistics %1',
      args0: [{ type: 'field_dropdown', name: 'Stats', options: STAT_OPTIONS }],
      output: 'Statistics',
      colour: NOMIE_COLOUR,
    },
    {
      type: 's4e_datepicker',
      message0: 'date: %1',
      args0: [{ type: 'field_date', name: 'Date', date: new Date().toISOString().slice(0, 10) }],
      inputsInline: false,
      output: 'Day',
      colour: NOMIE_COLOUR,
    },
    {
      type: 's4e_trackers',
      message0: 'T: %1',
      args0: [{ type: 'field_dropdown', name: 'Trackers', options: () => trackerOptions() }],
      output: 'Tracker',
      colour: NOMIE_COLOUR,
    },
    {
      type: 's4e_dayvalue',
      message0: 'Fetch Day Value %1 Tracker %2 Day %3 Statistic %4',
      args0: [
        { type: 'input_dummy' },
        { type: 'input_value', name: 'Tracker', check: 'Tracker' },
        { type: 'input_value', name: 'Day', check: 'Day' },
        { type: 'input_value', name: 'Statistics', check: 'Statistics' },
      ],
      output: 'Number',
      colour: NOMIE_COLOUR,
    },
    {
      type: 's4e_periodvalue',
      message0: 'Fetch Period Value %1 Trackable %2 Period %3 Statistic %4',
      args0: [
        { type: 'input_dummy' },
        // v1 had check: "Tracker" | "String", which evaluates to no check at all. Kept as no check, so
        // a text value (a search term) and a tracker are both accepted.
        { type: 'input_value', name: 'Trackable' },
        { type: 'input_value', name: 'Period', check: 'Period' },
        { type: 'input_value', name: 'Statistics', check: 'Statistics' },
      ],
      output: 'Number',
      colour: NOMIE_COLOUR,
    },
    {
      type: 's4e_logvalue',
      message0: 'Log Value for Tracker %1 Value %2 to Tracker %3 On the following Date %4',
      args0: [
        { type: 'input_dummy' },
        { type: 'input_value', name: 'Value' },
        { type: 'input_value', name: 'Tracker', check: 'Tracker' },
        { type: 'input_value', name: 'Date', check: 'Day' },
      ],
      inputsInline: false,
      output: null,
      colour: NOMIE_COLOUR,
    },
    {
      type: 's4e_httprequest',
      message0: 'Fetch data from following API %1 API %2',
      args0: [{ type: 'input_dummy' }, { type: 'input_value', name: 'Value', check: 'String' }],
      inputsInline: false,
      output: null,
      colour: NOMIE_COLOUR,
    },
    {
      type: 'wait_seconds',
      message0: ' wait %1 seconds',
      args0: [{ type: 'field_number', name: 'SECONDS', min: 0, max: 600, value: 1 }],
      previousStatement: null,
      nextStatement: null,
      colour: '#86D8F9',
    },
    {
      type: 'pushto_console',
      message0: 'Push to Console %1 %2',
      args0: [{ type: 'input_dummy' }, { type: 'input_value', name: 'Value' }],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: NOMIE_COLOUR,
    },
    {
      type: 'pushto_webconsole',
      message0: 'Push to Web Console %1 %2',
      args0: [{ type: 'input_dummy' }, { type: 'input_value', name: 'Value' }],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      colour: NOMIE_COLOUR,
    },
    // Kept so that older workspaces that use it still load. It is not in the palette.
    {
      type: 'tracker',
      message0: 'trackervalue %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'NAME',
          options: [
            ['Input1', 'Value1'],
            ['Input2', 'Value2'],
            ['Input3', 'Value3'],
          ],
        },
      ],
      inputsInline: true,
      output: 'attribute',
      colour: NOMIE_COLOUR,
    },
  ]);
};

// The generator writes JavaScript for the interpreter. Each host function it calls is provided in runtime/host.ts.
export const registerNomieGenerators = (js: JavascriptGenerator) => {
  js.forBlock['s4eblocklyframe'] = (block: Block, g) => {
    const schedule = block.getFieldValue('NAME');
    const script = g.statementToCode(block, 'script');
    let code = 's4eblocklyframe = "activated";\n';
    code += `var schedule = "${schedule}";\n`;
    code += 'if (schedule == "daily") {\n';
    code += 'var scheduler = scheduler_activated();\n';
    code += 'var schedulerstart = scheduler_start();\n';
    code += 'var schedulerend = scheduler_end();\n';
    code += '}\n';
    code += 'else {var scheduler = false;\nvar schedulerstart = new Date();\nvar schedulerend = new Date();}\n';
    code += 'var loop = new Date(schedulerstart);\nwhile(loop <= schedulerend){\n';
    code += script;
    code += 'var newDate = loop.setDate(loop.getDate() + 1);\nloop = new Date(newDate);}\n';
    return code;
  };

  js.forBlock['display'] = (block: Block, g) => `display(${g.valueToCode(block, 'Value', Order.ATOMIC)});`;

  js.forBlock['s4e_daypicker'] = (block: Block) => [`getdate("${block.getFieldValue('Day')}",loop)`, Order.NONE];
  js.forBlock['s4e_periodpicker'] = (block: Block) => [`"${block.getFieldValue('Period')}"`, Order.NONE];
  js.forBlock['s4e_statspicker'] = (block: Block) => [`"${block.getFieldValue('Stats')}"`, Order.NONE];
  js.forBlock['s4e_datepicker'] = (block: Block) => [`'${block.getFieldValue('Date')}'`, Order.NONE];
  js.forBlock['s4e_trackers'] = (block: Block) => [`"${block.getFieldValue('Trackers')}"`, Order.NONE];

  js.forBlock['s4e_dayvalue'] = (block: Block, g) => {
    const tracker = g.valueToCode(block, 'Tracker', Order.ATOMIC);
    const day = g.valueToCode(block, 'Day', Order.ATOMIC);
    const stats = g.valueToCode(block, 'Statistics', Order.ATOMIC);
    return [`fetchDayValue(${tracker},${day},${stats})`, Order.NONE];
  };

  js.forBlock['s4e_periodvalue'] = (block: Block, g) => {
    const tracker = g.valueToCode(block, 'Trackable', Order.ATOMIC);
    const period = g.valueToCode(block, 'Period', Order.ATOMIC);
    const stats = g.valueToCode(block, 'Statistics', Order.ATOMIC);
    return [`fetchPeriodValue(${tracker},${period},${stats})`, Order.NONE];
  };

  js.forBlock['s4e_logvalue'] = (block: Block, g) => {
    const value = g.valueToCode(block, 'Value', Order.ATOMIC);
    const tracker = g.valueToCode(block, 'Tracker', Order.ATOMIC);
    const date = g.valueToCode(block, 'Date', Order.ATOMIC);
    return [`logValue(${value},${tracker},${date})`, Order.NONE];
  };

  js.forBlock['s4e_httprequest'] = (block: Block, g) => [
    `httpRequest(${g.valueToCode(block, 'Value', Order.ATOMIC)})`,
    Order.NONE,
  ];

  js.forBlock['wait_seconds'] = (block: Block) => `waitForSeconds(${Number(block.getFieldValue('SECONDS'))});\n`;
  js.forBlock['pushto_console'] = (block: Block, g) => `alert(${g.valueToCode(block, 'Value', Order.ATOMIC)});`;
  js.forBlock['pushto_webconsole'] = (block: Block, g) =>
    `consolelog(${g.valueToCode(block, 'Value', Order.ATOMIC)});\n`;
  js.forBlock['tracker'] = (block: Block) => [`getPromise("${block.getFieldValue('NAME')}")`, Order.NONE];
};

// Every name the generated code calls. The generator must not let a workspace variable hide one of them.
export const NOMIE_RESERVED_WORDS = [
  'alert',
  'consolelog',
  'display',
  'fetchDayValue',
  'fetchPeriodValue',
  'getdate',
  'getPromise',
  'highlightBlock',
  'httpRequest',
  'logValue',
  'scheduler_activated',
  'scheduler_end',
  'scheduler_start',
  'waitForSeconds',
];
