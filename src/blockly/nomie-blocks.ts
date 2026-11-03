// The Nomie blocks: they read your notes, write to them, and show results.
// The block type names, field names and generated code are the same as in Nomie Blockly v1,
// so workspaces saved with v1 (.wsp files) load and run the same way.
import { Extensions } from 'blockly';
import { defineLocalisedBlocks } from './block-texts';
import type { Block, FieldDropdown } from 'blockly';
import { pickTracker } from '../nomie/picker';
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

// A tracker picked in Nomie is kept with its workspace, so it stays in that workspace's dropdowns (phase 13)
export const addSavedTracker = (workspace: object, tag: string) => {
  if (!tag) return;
  const known = savedTrackers.get(workspace) ?? [];
  if (!known.some(([, k]) => k === tag)) savedTrackers.set(workspace, [...known, [tag, tag]]);
};

// The last option of a Tracker dropdown: opens Nomie's tracker picker (editor only)
export const PICK_FROM_NOMIE = '__pick_from_nomie__';
const PICK_LABEL = 'Pick from Nomie…';

// The options of a Tracker dropdown for a workspace: the trackers of your recent notes, then the saved ones of the
// workspace, then the picker
export const trackerOptionsFor = (workspace: object | undefined): TrackerOption[] => {
  const recent = trackerOptions();
  const saved = workspace ? (savedTrackers.get(workspace) ?? []) : [];
  return [
    ...recent,
    ...saved.filter(([, tag]) => !recent.some(([, r]) => r === tag)),
    [PICK_LABEL, PICK_FROM_NOMIE],
  ];
};

function trackerDropdownOptions(this: { getSourceBlock(): { workspace: object } | null }): TrackerOption[] {
  return trackerOptionsFor(this.getSourceBlock?.()?.workspace);
}

// Picking a tracker: the Tracker field keeps its value until a tracker is picked; cancelling keeps it too
const pickInto = async (block: Block) => {
  const tag = await pickTracker();
  if (!tag || !block.workspace) return;
  addSavedTracker(block.workspace, tag);
  const field = block.getField('Trackers') as FieldDropdown | null;
  // Blockly checks a value against the options it cached before the pick: regenerate them first
  field?.getOptions(false);
  field?.setValue(tag);
};
const TRACKER_PICKER = 's4e_tracker_picker';
const registerTrackerPicker = () => {
  if (Extensions.isRegistered(TRACKER_PICKER)) return;
  Extensions.register(TRACKER_PICKER, function (this: Block) {
    (this.getField('Trackers') as FieldDropdown | null)?.setValidator((value: string) => {
      if (value !== PICK_FROM_NOMIE) return value;
      void pickInto(this);
      // reject the choice: the field keeps its tracker, and the pick sets the new one
      return null;
    });
  });
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
  registerTrackerPicker();
  defineLocalisedBlocks([
    {
      type: 's4eblocklyframe',
      tooltip: "Runs the blocks inside it once for each day of a scheduled run, or once for the day you run it by hand. Example: put show message inside it to show a message each day.",
      message0: 'Run: %1 %2 do %3 %4',
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
      tooltip: "Shows a message: in a manual run in a dialog, in a scheduled run in the run's output. Example: show message \"Good morning\".",
      message0: 'show message %1',
      args0: [{ type: 'input_value', name: 'Value', check: 'String' }],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_daypicker',
      tooltip: "A day, relative to the day the run is for: today or yesterday. Example: Yesterday.",
      message0: 'Day %1',
      args0: [{ type: 'field_dropdown', name: 'Day', options: DAY_OPTIONS }],
      output: 'Day',
      style: 'nomie_blocks',
    },
    {
      type: 's4e_periodpicker',
      tooltip: "A period of days that ends on the day the run is for. Example: Last 7 Days.",
      message0: 'Period %1',
      args0: [{ type: 'field_dropdown', name: 'Period', options: PERIOD_OPTIONS }],
      output: 'Period',
      style: 'nomie_blocks',
    },
    {
      type: 's4e_statspicker',
      tooltip: "How values are combined: the average, the sum, the maximum or the minimum. Example: Average.",
      message0: 'Statistics %1',
      args0: [{ type: 'field_dropdown', name: 'Stats', options: STAT_OPTIONS }],
      output: 'Statistics',
      style: 'nomie_blocks',
    },
    {
      type: 's4e_datepicker',
      tooltip: "A fixed date, picked from a calendar. Example: date 11/03/2026.",
      message0: 'date: %1',
      args0: [{ type: 'field_date', name: 'Date', date: new Date().toISOString().slice(0, 10) }],
      inputsInline: false,
      output: 'Day',
      style: 'nomie_blocks',
    },
    {
      type: 's4e_trackers',
      tooltip: "A tracker from your notes, such as mood. Pick from Nomie opens Nomie's own picker. Example: T: mood.",
      message0: 'T: %1',
      args0: [{ type: 'field_dropdown', name: 'Trackers', options: trackerDropdownOptions }],
      output: 'Tracker',
      extensions: [TRACKER_PICKER],
      style: 'nomie_blocks',
    },
    {
      type: 's4e_dayvalue',
      tooltip: "Fetches the value of a tracker on a day, combined with a statistic. Example: average of mood on yesterday.",
      message0: '%1 of %2 on %3',
      args0: [
        { type: 'input_value', name: 'Statistics', check: 'Statistics' },
        { type: 'input_value', name: 'Tracker', check: 'Tracker' },
        { type: 'input_value', name: 'Day', check: 'Day' },
      ],
      inputsInline: true,
      output: 'Number',
      style: 'nomie_blocks',
    },
    {
      type: 's4e_periodvalue',
      tooltip: "Fetches the value of a tracker over a period, or counts the notes that mention a word. Example: average of mood over Last 7 Days.",
      message0: '%1 of %2 over %3',
      args0: [
        { type: 'input_value', name: 'Statistics', check: 'Statistics' },
        // v1 had check: "Tracker" | "String", which evaluates to no check at all. Kept as no check, so
        // a text value (a search term) and a tracker are both accepted.
        { type: 'input_value', name: 'Trackable' },
        { type: 'input_value', name: 'Period', check: 'Period' },
      ],
      inputsInline: true,
      output: 'Number',
      style: 'nomie_blocks',
    },
    {
      type: 's4e_logvalue',
      tooltip: "Logs a value to a tracker, as a note at 13:00 on the day. Example: log 6 to mood on today.",
      message0: 'log %1 to %2 on %3',
      args0: [
        { type: 'input_value', name: 'Value' },
        { type: 'input_value', name: 'Tracker', check: 'Tracker' },
        { type: 'input_value', name: 'Date', check: 'Day' },
      ],
      inputsInline: true,
      // an action: it sits in a script stack, like wait and the console blocks
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_httprequest',
      tooltip: "Fetches the page at a web address (https) and gives its text. Example: fetch the page at https://example.com.",
      message0: 'fetch the page at %1',
      args0: [{ type: 'input_value', name: 'Value', check: 'String' }],
      inputsInline: true,
      output: null,
      style: 'nomie_blocks',
    },
    {
      type: 'wait_seconds',
      tooltip: "Waits before the next block runs, up to 600 seconds. Example: wait 2 seconds.",
      message0: ' wait %1 seconds',
      args0: [{ type: 'field_number', name: 'SECONDS', min: 0, max: 600, value: 1 }],
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
    {
      type: 'pushto_console',
      tooltip: "Shows a value in the run's output, the Console tab. Example: show in console \"Done\".",
      message0: 'show in console %1',
      args0: [{ type: 'input_value', name: 'Value' }],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
    {
      type: 'pushto_webconsole',
      tooltip: "Writes a value to the browser's developer console. Example: log to browser console 42.",
      message0: 'log to browser console %1',
      args0: [{ type: 'input_value', name: 'Value' }],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
    // A value on the Nomie widget, under the label (phase 15): the widget shows the last value a run set
    // A workspace has a Scheduler block (it runs on days) or a When-note block (it runs when a note with the tracker
    // is saved). The block is a hat: it has no connection above it.
    {
      type: 's4e_whennote',
      tooltip: "Runs the blocks inside it when a note with this tracker is saved, for the day of that note. Example: when a note with run is saved.",
      message0: 'When a note with %1 is saved %2 %3',
      args0: [
        { type: 'input_value', name: 'Tracker', check: 'Tracker' },
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'script' },
      ],
      style: 'nomie_frame',
    },
    // What the note that started a run holds. Outside a note run they give null.
    {
      type: 's4e_notevalue',
      tooltip: "The value of a tracker in the note that started the run, or nothing outside a note run. Example: value of mood in this note.",
      message0: 'value of %1 in this note',
      args0: [{ type: 'input_value', name: 'Tracker', check: 'Tracker' }],
      inputsInline: true,
      output: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_notetext',
      tooltip: "The text of the note that started the run. Example: text of this note.",
      message0: 'text of this note',
      args0: [],
      output: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_noteday',
      tooltip: "The day the note that started the run was saved. Example: day of this note.",
      message0: 'day of this note',
      args0: [],
      output: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_lastvalue',
      tooltip: "Gives the latest value of a tracker in the days looked back, the loop day included (at most 60), or nothing. Example: last value of mood looking back 7 days.",
      message0: 'last value of %1 looking back %2 days',
      args0: [
        { type: 'input_value', name: 'Tracker', check: 'Tracker' },
        { type: 'input_value', name: 'Days', check: 'Number' },
      ],
      inputsInline: false,
      output: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_dayssince',
      tooltip: "Gives the whole days since a tracker was last logged, within 60 days. Example: days since exercise was last logged.",
      message0: 'days since %1 was last logged',
      args0: [{ type: 'input_value', name: 'Tracker', check: 'Tracker' }],
      inputsInline: true,
      output: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_streak',
      tooltip: "Gives the days in a row, up to the loop day, with the tracker logged (at most 60 days). Example: streak of mood.",
      message0: 'streak of %1',
      args0: [{ type: 'input_value', name: 'Tracker', check: 'Tracker' }],
      inputsInline: true,
      output: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_lognote',
      tooltip: "Writes a note with this text at 13:00 on the day. Trackers in it are logged like in any note. Example: log a note \"Felt good #mood(7)\" on today.",
      message0: 'log a note %1 on %2',
      args0: [
        { type: 'input_value', name: 'Text', check: 'String' },
        { type: 'input_value', name: 'Date', check: 'Day' },
      ],
      inputsInline: false,
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_mylocation',
      tooltip: "Gives your location as lat and lng, or nothing when Nomie cannot find it within 15 seconds. Example: my location.",
      message0: 'my location',
      args0: [],
      output: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_openlink',
      tooltip: "Opens a web page inside Nomie in a manual run. A scheduled or test run only says what it would open. Example: open link https://example.com.",
      message0: 'open link %1',
      args0: [{ type: 'input_value', name: 'Value', check: 'String' }],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_remember',
      tooltip: "Keeps a value for the next run of this workspace. Example: remember streak as 3.",
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
      tooltip: "Gives the value kept under a name, or the default when nothing is kept. Example: recall streak or 0.",
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
      tooltip: "Removes a value kept under a name. Example: forget streak.",
      message0: 'forget %1',
      args0: [{ type: 'field_input', name: 'NAME', text: 'name' }],
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_secret',
      tooltip: "Gives a secret from Settings by its name, such as an API key. Example: secret OPENWEATHER_KEY.",
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

  // History and places (phase 13). The day arithmetic is in runtime/dates.ts; the host functions do the lookups.
  js.forBlock['s4e_lastvalue'] = (block: Block, g) =>
    [`lastValue(${input(block, g, 'Tracker', '""')},${input(block, g, 'Days', '7')})`, Order.NONE];
  js.forBlock['s4e_dayssince'] = (block: Block, g) => [`daysSince(${input(block, g, 'Tracker', '""')})`, Order.NONE];
  js.forBlock['s4e_streak'] = (block: Block, g) => [`streak(${input(block, g, 'Tracker', '""')})`, Order.NONE];
  js.forBlock['s4e_lognote'] = (block: Block, g) =>
    `logNote(${input(block, g, 'Text', "''")},${input(block, g, 'Date', '"today"')});\n`;
  js.forBlock['s4e_mylocation'] = () => ['myLocation()', Order.NONE];

  // A When-note block runs its script once, for the day of the note: the same loop as the Scheduler block, over one
  // day. The day comes from triggerStart(), so the day pickers in the script work as they do in a scheduled run.
  js.forBlock['s4e_whennote'] = (block: Block, g) => {
    const script = g.statementToCode(block, 'script');
    let code = 's4eblocklyframe = "activated";\n';
    code += 'var schedule = "none";\nvar scheduler = false;\n';
    code += 'var schedulerstart = triggerStart();\nvar schedulerend = triggerStart();\n';
    code += 'var loop = new Date(schedulerstart);\nwhile(loop <= schedulerend){\n';
    code += script;
    code += 'var newDate = loop.setDate(loop.getDate() + 1);\nloop = new Date(newDate);}\n';
    return code;
  };
  js.forBlock['s4e_notevalue'] = (block: Block, g) => [`noteValue(${input(block, g, 'Tracker', '""')})`, Order.NONE];
  js.forBlock['s4e_notetext'] = () => ['noteText()', Order.NONE];
  js.forBlock['s4e_noteday'] = () => ['noteDay()', Order.NONE];
  js.forBlock['s4e_openlink'] = (block: Block, g) => `openLink(${input(block, g, 'Value', "''")});\n`;

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
  'daysSince',
  'noteDay',
  'noteText',
  'noteValue',
  'triggerStart',
  'lastValue',
  'logNote',
  'myLocation',
  'openLink',
  'streak',
  'forget',
  'recall',
  'remember',
  'secret',
  'scheduler_activated',
  'scheduler_end',
  'scheduler_start',
  'waitForSeconds',
];
