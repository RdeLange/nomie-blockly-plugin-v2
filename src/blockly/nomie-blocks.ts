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
const XML_ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };
export const trackersUsedIn = (workspaceBlocks: string): TrackerOption[] => {
  const found = [...workspaceBlocks.matchAll(/<field name="Trackers">([^<]*)<\/field>/g)].map((m) =>
    m[1].replace(/&(amp|lt|gt|quot|apos);/g, (entity) => XML_ENTITIES[entity])
  );
  return [...new Set(found)].map((tag) => [tag, tag] as TrackerOption);
};

// The secrets a workspace uses, by name, from its saved blocks (the value is never in the blocks)
export const secretsUsedIn = (workspaceBlocks: string): string[] => {
  const found = [...workspaceBlocks.matchAll(/<block type="s4e_secret"[^>]*>\s*<field name="NAME">([^<]*)<\/field>/g)].map((m) =>
    m[1].replace(/&(amp|lt|gt|quot|apos);/g, (entity) => XML_ENTITIES[entity])
  );
  return [...new Set(found.filter((name) => name !== ''))];
};

// The saved trackers of each workspace, offered in that workspace's dropdowns only. (They used to be added to the
// one list every workspace shares, and taken out again afterwards.)
const savedTrackers = new WeakMap<object, TrackerOption[]>();
export const rememberSavedTrackers = (workspace: object, workspaceBlocks: string) => {
  const known = savedTrackers.get(workspace) ?? [];
  const added = trackersUsedIn(workspaceBlocks).filter(([, tag]) => !known.some(([, k]) => k === tag));
  savedTrackers.set(workspace, [...known, ...added]);
};

// The options of a Tracker dropdown: the trackers of your recent notes, then the saved ones of its workspace
function trackerDropdownOptions(this: { getSourceBlock(): { workspace: object } | null }): TrackerOption[] {
  const recent = trackerOptions();
  const workspace = this.getSourceBlock?.()?.workspace;
  const saved = workspace ? (savedTrackers.get(workspace) ?? []) : [];
  return [...recent, ...saved.filter(([, tag]) => !recent.some(([, r]) => r === tag))];
}

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
      style: 'nomie_frame',
    },
    {
      type: 'display',
      message0: 'Display Value %1 %2',
      args0: [{ type: 'input_dummy' }, { type: 'input_value', name: 'Value', check: 'String' }],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_daypicker',
      message0: 'Day %1',
      args0: [{ type: 'field_dropdown', name: 'Day', options: DAY_OPTIONS }],
      output: 'Day',
      style: 'nomie_blocks',
    },
    {
      type: 's4e_periodpicker',
      message0: 'Period %1',
      args0: [{ type: 'field_dropdown', name: 'Period', options: PERIOD_OPTIONS }],
      output: 'Period',
      style: 'nomie_blocks',
    },
    {
      type: 's4e_statspicker',
      message0: 'Statistics %1',
      args0: [{ type: 'field_dropdown', name: 'Stats', options: STAT_OPTIONS }],
      output: 'Statistics',
      style: 'nomie_blocks',
    },
    {
      type: 's4e_datepicker',
      message0: 'date: %1',
      args0: [{ type: 'field_date', name: 'Date', date: new Date().toISOString().slice(0, 10) }],
      inputsInline: false,
      output: 'Day',
      style: 'nomie_blocks',
    },
    {
      type: 's4e_trackers',
      message0: 'T: %1',
      args0: [{ type: 'field_dropdown', name: 'Trackers', options: trackerDropdownOptions }],
      output: 'Tracker',
      style: 'nomie_blocks',
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
      style: 'nomie_blocks',
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
      style: 'nomie_blocks',
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
      // an action: it sits in a script stack, like wait and the console blocks
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_httprequest',
      message0: 'Fetch data from following API %1 API %2',
      args0: [{ type: 'input_dummy' }, { type: 'input_value', name: 'Value', check: 'String' }],
      inputsInline: false,
      output: null,
      style: 'nomie_blocks',
    },
    {
      type: 'wait_seconds',
      message0: ' wait %1 seconds',
      args0: [{ type: 'field_number', name: 'SECONDS', min: 0, max: 600, value: 1 }],
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
    {
      type: 'pushto_console',
      message0: 'Push to Console %1 %2',
      args0: [{ type: 'input_dummy' }, { type: 'input_value', name: 'Value' }],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
    {
      type: 'pushto_webconsole',
      message0: 'Push to Web Console %1 %2',
      args0: [{ type: 'input_dummy' }, { type: 'input_value', name: 'Value' }],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_remember',
      message0: 'remember %1 as %2',
      args0: [
        { type: 'field_input', name: 'NAME', text: 'name' },
        { type: 'input_value', name: 'VALUE' },
      ],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_recall',
      message0: 'recall %1 or %2',
      args0: [
        { type: 'field_input', name: 'NAME', text: 'name' },
        { type: 'input_value', name: 'DEFAULT' },
      ],
      inputsInline: true,
      output: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_forget',
      message0: 'forget %1',
      args0: [{ type: 'field_input', name: 'NAME', text: 'name' }],
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_secret',
      message0: 'secret %1',
      args0: [{ type: 'field_input', name: 'NAME', text: 'name' }],
      output: null,
      style: 'nomie_blocks',
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
      style: 'nomie_blocks',
    },
  ]);
};

// The generator writes JavaScript for the interpreter. Each host function it calls is provided in runtime/host.ts.
// Field values go into the code with JSON.stringify, so a quote in a tracker name cannot break the code; for the
// values the blocks offer this gives the same text as v1. An empty input gets a default, so one empty socket does not
// stop the whole program with a syntax error (the pre-run check in compile.ts still reports the ones that matter).
const quote = (value: unknown) => JSON.stringify(String(value ?? ''));

export const registerNomieGenerators = (js: JavascriptGenerator) => {
  const input = (block: Block, g: JavascriptGenerator, name: string, fallback: string) =>
    g.valueToCode(block, name, Order.ATOMIC) || fallback;

  js.forBlock['s4eblocklyframe'] = (block: Block, g) => {
    const schedule = block.getFieldValue('NAME') === 'daily' ? 'daily' : 'none';
    const script = g.statementToCode(block, 'script');
    let code = 's4eblocklyframe = "activated";\n';
    code += `var schedule = ${quote(schedule)};\n`;
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

  js.forBlock['display'] = (block: Block, g) => `display(${input(block, g, 'Value', "''")});`;

  js.forBlock['s4e_daypicker'] = (block: Block) => [`getdate(${quote(block.getFieldValue('Day'))},loop)`, Order.NONE];
  js.forBlock['s4e_periodpicker'] = (block: Block) => [quote(block.getFieldValue('Period')), Order.NONE];
  js.forBlock['s4e_statspicker'] = (block: Block) => [quote(block.getFieldValue('Stats')), Order.NONE];
  // single quotes, as v1 generated; the value is checked to be a day first, so it cannot hold a quote
  js.forBlock['s4e_datepicker'] = (block: Block) => {
    const value = String(block.getFieldValue('Date') ?? '');
    return [/^\d{4}-\d{2}-\d{2}$/.test(value) ? `'${value}'` : '"today"', Order.NONE];
  };
  js.forBlock['s4e_trackers'] = (block: Block) => [quote(block.getFieldValue('Trackers')), Order.NONE];

  js.forBlock['s4e_dayvalue'] = (block: Block, g) => {
    const tracker = input(block, g, 'Tracker', '""');
    const day = input(block, g, 'Day', '"today"');
    const stats = input(block, g, 'Statistics', '"sum"');
    return [`fetchDayValue(${tracker},${day},${stats})`, Order.NONE];
  };

  js.forBlock['s4e_periodvalue'] = (block: Block, g) => {
    const tracker = input(block, g, 'Trackable', '""');
    const period = input(block, g, 'Period', '"LAST7DAYS"');
    const stats = input(block, g, 'Statistics', '"sum"');
    return [`fetchPeriodValue(${tracker},${period},${stats})`, Order.NONE];
  };

  js.forBlock['s4e_logvalue'] = (block: Block, g) => {
    const value = input(block, g, 'Value', "''");
    const tracker = input(block, g, 'Tracker', '""');
    const date = input(block, g, 'Date', '"today"');
    return `logValue(${value},${tracker},${date});\n`;
  };

  js.forBlock['s4e_httprequest'] = (block: Block, g) => [`httpRequest(${input(block, g, 'Value', "''")})`, Order.NONE];

  // Remembered values and secrets: the names go in with JSON.stringify, and a secret's value is never in the code
  js.forBlock['s4e_remember'] = (block: Block, g) =>
    `remember(${quote(block.getFieldValue('NAME'))}, ${input(block, g, 'VALUE', 'null')});\n`;
  js.forBlock['s4e_recall'] = (block: Block, g) =>
    [`recall(${quote(block.getFieldValue('NAME'))}, ${input(block, g, 'DEFAULT', 'null')})`, Order.NONE];
  js.forBlock['s4e_forget'] = (block: Block) => `forget(${quote(block.getFieldValue('NAME'))});\n`;
  js.forBlock['s4e_secret'] = (block: Block) => [`secret(${quote(block.getFieldValue('NAME'))})`, Order.NONE];

  js.forBlock['wait_seconds'] = (block: Block) => `waitForSeconds(${Number(block.getFieldValue('SECONDS')) || 0});\n`;
  js.forBlock['pushto_console'] = (block: Block, g) => `alert(${input(block, g, 'Value', "''")});`;
  js.forBlock['pushto_webconsole'] = (block: Block, g) => `consolelog(${input(block, g, 'Value', "''")});\n`;
  js.forBlock['tracker'] = (block: Block) => [`getPromise(${quote(block.getFieldValue('NAME'))})`, Order.NONE];
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
  'forget',
  'recall',
  'remember',
  'secret',
  'scheduler_activated',
  'scheduler_end',
  'scheduler_start',
  'waitForSeconds',
];
