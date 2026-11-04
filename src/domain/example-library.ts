// The example library: workspaces that show what each part of the plugin does, one area at a time. Each example is a
// tutorial for the user: its blocks, in the order they are built here, and a step-by-step text in the tutorials of
// example-tutorials.ts (the Detailed tab). The library is built into examples.json (see examples-build.ts).
import { block, get, message, number, schedule, set, show, text, tracker, whenNote, join, type Block } from './example-xml';

// the four steps of the library, from one block to a small program (see the Add screen)
export type ExampleLevel = 'easy' | 'moderate' | 'complex' | 'expert';
export const EXAMPLE_LEVELS: ExampleLevel[] = ['easy', 'moderate', 'complex', 'expert'];

export type Example = {
  // the workspace's name: unique, with no spaces (the note "Run Blockly Workspace: name" uses it)
  name: string;
  displayName: string;
  emoji: string;
  // one line on the card in the list
  description: string;
  level: ExampleLevel;
  blocks: Block[];
  variables?: string[];
  // the example needs something a test run cannot give it (a secret, the network, a location or a prompt)
  live?: 'secret' | 'network' | 'location' | 'prompt';
};

const day = (value: string) => block('s4e_daypicker', { fields: { Day: value } });
const period = (value: string) => block('s4e_periodpicker', { fields: { Period: value } });
const stats = (value: string) => block('s4e_statspicker', { fields: { Stats: value } });
const dayValue = (tag: string, dayName: string, statistic: string) =>
  block('s4e_dayvalue', { values: { Tracker: tracker(tag), Day: day(dayName), Statistics: stats(statistic) } });
const periodValue = (tag: string, periodName: string, statistic: string) =>
  block('s4e_periodvalue', { values: { Trackable: tracker(tag), Period: period(periodName), Statistics: stats(statistic) } });
const compare = (a: Block, op: string, b: Block) => block('logic_compare', { fields: { OP: op }, values: { A: a, B: b } });
const arithmetic = (a: Block, op: string, b: Block) => block('math_arithmetic', { fields: { OP: op }, values: { A: a, B: b } });
const list = (...items: Block[]) => {
  const values: Record<string, Block> = {};
  items.forEach((item, i) => (values[`ADD${i}`] = item));
  return block('lists_create_with', { mutation: `<mutation items="${items.length}"></mutation>`, values });
};
const dashboard = (name: string, emoji: string, content: Block[]) =>
  block('s4e_dashboard', { fields: { NAME: name, EMOJI: emoji }, statements: { CONTENT: content } });

const recall = (name: string, fallback: Block) => block('s4e_recall', { fields: { NAME: name }, values: { DEFAULT: fallback } });
const remember = (name: string, value: Block) => block('s4e_remember', { fields: { NAME: name }, values: { VALUE: value } });
// a procedure call, with the names of its arguments as the definition has them
const callReturn = (name: string, argNames: string[], args: Block[]) => {
  const values: Record<string, Block> = {};
  args.forEach((arg, i) => (values[`ARG${i}`] = arg));
  return block('procedures_callreturn', {
    mutation: `<mutation name="${name}">${argNames.map((a) => `<arg name="${a}"></arg>`).join('')}</mutation>`,
    values,
  });
};
const callNoReturn = (name: string, argNames: string[], args: Block[]) => {
  const values: Record<string, Block> = {};
  args.forEach((arg, i) => (values[`ARG${i}`] = arg));
  return block('procedures_callnoreturn', {
    mutation: `<mutation name="${name}">${argNames.map((a) => `<arg name="${a}"></arg>`).join('')}</mutation>`,
    values,
  });
};
// one ledger entry: an object with an item and a cost
const entry = (item: string, cost: number) =>
  block('object_create', {
    mutation: '<mutation num_fields="2"><field name="item"></field><field name="cost"></field></mutation>',
    fields: { field1: 'item', field2: 'cost' },
    values: { field_input1: text(item), field_input2: number(cost) },
  });

export const EXAMPLES: Example[] = [
  {
    name: 'example-hello',
    level: 'easy',
    displayName: 'Example: Hello, console',
    emoji: '👋',
    description: 'The first workspace: lines in the console, and a notice from Nomie.',
    blocks: [
      schedule('none', [
        show(text('Hello from the console')),
        block('pushto_webconsole', { values: { Value: text('Hello from the browser console') } }),
        message(text('Hello from a message')),
      ]),
    ],
  },
  {
    name: 'example-yesterday-mood',
    level: 'easy',
    displayName: 'Example: Yesterday in one number',
    emoji: '🗓️',
    description: 'Reads one tracker for one day and shows the average.',
    blocks: [
      schedule('none', [
        message(join(text('Your average mood yesterday was '), dayValue('#mood', 'yesterday', 'avg'))),
      ]),
    ],
  },
  {
    name: 'example-mood-period',
    level: 'easy',
    displayName: 'Example: Mood over a period',
    emoji: '📈',
    description: 'A period value, rounded and shown as a sentence.',
    blocks: [
      schedule('none', [
        message(
          join(
            text('Your average mood over the last 30 days is '),
            block('math_round', { fields: { OP: 'ROUND' }, values: { NUM: periodValue('#mood', 'LAST30DAYS', 'avg') } })
          )
        ),
      ]),
    ],
  },
  {
    name: 'example-log-value',
    level: 'easy',
    displayName: 'Example: Log a value each day',
    emoji: '✍️',
    description: 'Writes a note with a tracker value, for the day of the run.',
    blocks: [
      schedule('daily', [
        block('s4e_logvalue', {
          values: { Value: number(1), Tracker: tracker('#goodday'), Date: day('today') },
        }),
      ]),
    ],
  },
  {
    name: 'example-wait',
    level: 'easy',
    displayName: 'Example: Wait between lines',
    emoji: '⏳',
    description: 'Waits a second between two console lines.',
    blocks: [
      schedule('none', [
        show(text('First line')),
        block('wait_seconds', { fields: { SECONDS: '1' } }),
        show(text('Second line, one second later')),
      ]),
    ],
  },
  {
    name: 'example-pickers',
    level: 'easy',
    displayName: 'Example: The pickers',
    emoji: '🎛️',
    description: 'Tracker, day, period, statistic and date pickers in one place.',
    blocks: [
      schedule('none', [
        message(
          join(
            text('Tracker: '),
            tracker('#mood'),
            text(' | Day: '),
            day('yesterday'),
            text(' | Period: '),
            period('LAST7DAYS'),
            text(' | Statistic: '),
            stats('avg'),
            text(' | Date: '),
            block('s4e_datepicker', { fields: { Date: '2026-11-01' } })
          )
        ),
      ]),
    ],
  },
  {
    name: 'example-history',
    level: 'moderate',
    displayName: 'Example: Last value and days since',
    emoji: '🕰️',
    description: 'The last logged value, and how many days ago it was logged.',
    blocks: [
      schedule('daily', [
        message(
          join(
            text('Last mood: '),
            block('s4e_lastvalue', { values: { Tracker: tracker('#mood'), Days: number(14) } }),
            text(' | Days since: '),
            block('s4e_dayssince', { values: { Tracker: tracker('#mood') } })
          )
        ),
      ]),
    ],
  },
  {
    name: 'example-streak',
    level: 'moderate',
    displayName: 'Example: A streak',
    emoji: '🔥',
    description: 'Counts the days in a row with a tracker, and congratulates you.',
    blocks: [
      schedule('daily', [
        block('controls_if', {
          mutation: '<mutation else="1"></mutation>',
          values: { IF0: compare(block('s4e_streak', { values: { Tracker: tracker('#mood') } }), 'GTE', number(3)) },
          statements: {
            DO0: [message(text('Three days in a row or more. Well done!'))],
            ELSE: [message(text('Every day counts. Log it again today.'))],
          },
        }),
      ]),
    ],
  },
  {
    name: 'example-write-note',
    level: 'easy',
    displayName: 'Example: Write a note',
    emoji: '📝',
    description: 'Writes a free-text note on a day of your choice.',
    blocks: [
      schedule('none', [
        block('s4e_lognote', { values: { Text: text('Reviewed the week #review'), Date: day('yesterday') } }),
      ]),
    ],
  },
  {
    name: 'example-location',
    level: 'moderate',
    displayName: 'Example: Where am I',
    emoji: '📍',
    description: 'Shows the location Nomie reports, if you allow it.',
    live: 'location',
    blocks: [schedule('none', [message(join(text('Your location: '), block('s4e_mylocation')))])],
  },
  {
    name: 'example-open-link',
    level: 'easy',
    displayName: 'Example: Open a link',
    emoji: '🔗',
    description: 'Opens a web page in Nomie when you run it by hand.',
    live: 'network',
    blocks: [schedule('none', [block('s4e_openlink', { values: { Value: text('https://example.com') } })])],
  },
  {
    name: 'example-fetch-page',
    level: 'moderate',
    displayName: 'Example: Fetch a web page',
    emoji: '🌐',
    description: 'Fetches a web page and shows the start of its answer.',
    live: 'network',
    blocks: [
      schedule('none', [show(block('s4e_httprequest', { values: { Value: text('https://example.com') } }))]),
    ],
  },
  {
    name: 'example-widget-value',
    level: 'easy',
    displayName: 'Example: Dashboard widget with a value',
    emoji: '🧩',
    description: 'A widget on the dashboard with a value, a trend and a footer.',
    blocks: [
      schedule('daily', [
        dashboard('Mood', '😊', [
          block('s4e_wvalue', {
            values: { Value: periodValue('#mood', 'LAST7DAYS', 'avg') },
            fields: { LABEL: '7-day average' },
          }),
          block('s4e_wtrend', { values: { Tracker: tracker('#mood') }, fields: { LABEL: 'Last 14 days' } }),
          block('s4e_wfooter', { fields: { TEXT: 'Updated every morning' } }),
        ]),
      ]),
    ],
  },
  {
    name: 'example-widget-charts',
    level: 'moderate',
    displayName: 'Example: Widget charts',
    emoji: '📊',
    description: 'A line chart and a bar chart on one widget.',
    blocks: [
      schedule('daily', [
        dashboard('Mood charts', '📈', [
          block('s4e_wchart', {
            values: { Tracker: tracker('#mood') },
            fields: { DAYS: '30', COLOUR: '#0A6CC9', LABEL: 'Last 30 days' },
          }),
          block('s4e_wbars', {
            values: { Tracker: tracker('#mood') },
            fields: { DAYS: '7', COLOUR: '#1E9E55', LABEL: 'Last 7 days' },
          }),
        ]),
      ]),
    ],
  },
  {
    name: 'example-widget-html',
    level: 'moderate',
    displayName: 'Example: Widget with HTML',
    emoji: '🎨',
    description: 'A widget with your own HTML, filled with values from the blocks.',
    blocks: [
      schedule('daily', [
        dashboard('Mood HTML', '🎨', [
          block('s4e_whtml', {
            fields: { HTML: '<p>Average mood: <b>{{mood}}</b></p>' },
            statements: {
              PARAMS: [
                block('s4e_wparam', {
                  fields: { NAME: 'mood' },
                  values: { VALUE: periodValue('#mood', 'LAST7DAYS', 'avg') },
                }),
              ],
            },
          }),
        ]),
      ]),
    ],
  },
  {
    name: 'example-remember',
    level: 'moderate',
    displayName: 'Example: Remember between runs',
    emoji: '🧠',
    description: 'Keeps a count from one run to the next.',
    blocks: [
      schedule('daily', [
        block('s4e_remember', {
          fields: { NAME: 'runs' },
          values: {
            VALUE: arithmetic(block('s4e_recall', { fields: { NAME: 'runs' }, values: { DEFAULT: number(0) } }), 'ADD', number(1)),
          },
        }),
        show(join(text('This workspace has run '), block('s4e_recall', { fields: { NAME: 'runs' }, values: { DEFAULT: number(0) } }), text(' times.'))),
        block('controls_if', {
          values: { IF0: compare(block('s4e_recall', { fields: { NAME: 'runs' }, values: { DEFAULT: number(0) } }), 'EQ', number(3)) },
          statements: {
            DO0: [
              block('s4e_forget', { fields: { NAME: 'runs' } }),
              message(text('Third run: the count is forgotten, and starts again.')),
            ],
          },
        }),
      ]),
    ],
  },
  {
    name: 'example-secret',
    level: 'easy',
    displayName: 'Example: Keep a key in Settings',
    emoji: '🔑',
    description: 'Uses a secret from Settings, so the key is not in the blocks.',
    live: 'secret',
    blocks: [schedule('none', [show(join(text('The key is '), block('s4e_secret', { fields: { NAME: 'EXAMPLE_KEY' } })))])],
  },
  {
    name: 'example-when-note',
    level: 'moderate',
    displayName: 'Example: When a note is saved',
    emoji: '⚡',
    description: 'Runs when a note with a tracker is saved, and reads that note.',
    blocks: [
      whenNote('#run', [
        message(
          join(
            text('Note text: '),
            block('s4e_notetext'),
            text(' | Mood in the note: '),
            block('s4e_notevalue', { values: { Tracker: tracker('#mood') } }),
            text(' | Day: '),
            block('s4e_noteday')
          )
        ),
      ]),
    ],
  },
  {
    name: 'example-loop-days',
    level: 'moderate',
    displayName: 'Example: Count with a loop',
    emoji: '🔁',
    description: 'Repeats a block a number of times, and counts with a for loop.',
    variables: ['i'],
    blocks: [
      schedule('none', [
        block('controls_repeat_ext', {
          values: { TIMES: number(3) },
          statements: { DO: [show(text('Repeated'))] },
        }),
        block('controls_for', {
          variables: { VAR: 'i' },
          values: { FROM: number(1), TO: number(5), BY: number(1) },
          statements: { DO: [show(join(text('Step '), get('i')))] },
        }),
      ]),
    ],
  },
  {
    name: 'example-while-break',
    level: 'moderate',
    displayName: 'Example: While and break',
    emoji: '🛑',
    description: 'Repeats while a condition holds, and stops early with break.',
    variables: ['n'],
    blocks: [
      schedule('none', [
        set('n', number(0)),
        block('controls_whileUntil', {
          fields: { MODE: 'WHILE' },
          values: { BOOL: compare(get('n'), 'LT', number(10)) },
          statements: {
            DO: [
              block('controls_if', {
                values: { IF0: compare(get('n'), 'EQ', number(4)) },
                statements: { DO0: [block('controls_flow_statements', { fields: { FLOW: 'BREAK' } })] },
              }),
              show(get('n')),
              block('math_change', { variables: { VAR: 'n' }, values: { DELTA: number(1) } }),
            ],
          },
        }),
      ]),
    ],
  },
  {
    name: 'example-list-loop',
    level: 'moderate',
    displayName: 'Example: Go through a list',
    emoji: '📋',
    description: 'Goes through each item of a list in turn.',
    variables: ['item'],
    blocks: [
      schedule('none', [
        block('controls_forEach', {
          variables: { VAR: 'item' },
          values: { LIST: list(text('Monday'), text('Tuesday'), text('Wednesday')) },
          statements: { DO: [show(get('item'))] },
        }),
      ]),
    ],
  },
  {
    name: 'example-decide',
    level: 'moderate',
    displayName: 'Example: Decide with logic',
    emoji: '⚖️',
    description: 'If, and, or, not, true and false, in one decision.',
    blocks: [
      schedule('none', [
        block('controls_if', {
          mutation: '<mutation else="1"></mutation>',
          values: {
            IF0: block('logic_operation', {
              fields: { OP: 'AND' },
              values: {
                A: compare(number(3), 'LT', number(5)),
                B: block('logic_negate', { values: { BOOL: compare(number(2), 'GT', number(7)) } }),
              },
            }),
          },
          statements: {
            DO0: [message(text('Both are true'))],
            ELSE: [message(text('Something is not right'))],
          },
        }),
        show(
          block('logic_ternary', {
            values: {
              IF: block('logic_boolean', { fields: { BOOL: 'TRUE' } }),
              THEN: text('yes'),
              ELSE: text('no'),
            },
          })
        ),
        show(block('logic_null')),
      ]),
    ],
  },
  {
    name: 'example-numbers',
    level: 'easy',
    displayName: 'Example: Numbers',
    emoji: '🔢',
    description: 'Arithmetic, powers, trigonometry, constants and number checks.',
    blocks: [
      schedule('none', [
        show(arithmetic(number(6), 'MULTIPLY', arithmetic(number(2), 'ADD', number(3)))),
        show(block('math_single', { fields: { OP: 'ROOT' }, values: { NUM: number(16) } })),
        show(block('math_trig', { fields: { OP: 'SIN' }, values: { NUM: number(0) } })),
        show(block('math_constant', { fields: { CONSTANT: 'PI' } })),
        show(block('math_number_property', { fields: { PROPERTY: 'EVEN' }, values: { NUMBER_TO_CHECK: number(4) } })),
        show(block('math_modulo', { values: { DIVIDEND: number(17), DIVISOR: number(5) } })),
        show(block('math_atan2', { values: { X: number(1), Y: number(1) } })),
      ]),
    ],
  },
  {
    name: 'example-random-average',
    level: 'moderate',
    displayName: 'Example: Random, rounding and averages',
    emoji: '🎲',
    description: 'Random numbers, rounding, an average of a list, and a change.',
    blocks: [
      schedule('none', [
        show(block('math_random_int', { values: { FROM: number(1), TO: number(6) } })),
        show(block('math_random_float')),
        show(block('math_round', { fields: { OP: 'ROUNDUP' }, values: { NUM: number(2.1) } })),
        show(block('math_on_list', { fields: { OP: 'AVERAGE' }, values: { LIST: list(number(4), number(6), number(8)) } })),
        show(block('math_constrain', { values: { VALUE: number(12), LOW: number(0), HIGH: number(10) } })),
      ]),
    ],
  },
  {
    name: 'example-text-tools',
    level: 'easy',
    displayName: 'Example: Text tools',
    emoji: '🔤',
    description: 'Length, case, trimming, search and cutting text.',
    blocks: [
      schedule('none', [
        show(block('text_length', { values: { VALUE: text('Nomie') } })),
        show(block('text_isEmpty', { values: { VALUE: text('') } })),
        show(block('text_changeCase', { fields: { CASE: 'UPPERCASE' }, values: { TEXT: text('mood') } })),
        show(block('text_trim', { fields: { MODE: 'BOTH' }, values: { TEXT: text('   spaced out   ') } })),
        show(block('text_indexOf', { fields: { END: 'FIRST' }, values: { VALUE: text('mood diary'), FIND: text('diary') } })),
        show(block('text_charAt', { fields: { WHERE: 'FIRST' }, values: { VALUE: text('Nomie') } })),
        show(
          block('text_getSubstring', {
            mutation: '<mutation at1="true" at2="true"></mutation>',
            fields: { WHERE1: 'FROM_START', WHERE2: 'FROM_END' },
            values: { STRING: text('Nomie Blockly'), AT1: number(1), AT2: number(1) },
          })
        ),
        set('greeting', text('Hi')),
        block('text_append', { variables: { VAR: 'greeting' }, values: { TEXT: text(' there') } }),
        show(get('greeting')),
      ]),
    ],
    variables: ['greeting'],
  },
  {
    name: 'example-lists',
    level: 'moderate',
    displayName: 'Example: Lists',
    emoji: '📃',
    description: 'Create, read, change, search, split and sort lists.',
    blocks: [
      schedule('none', [
        show(block('lists_length', { values: { VALUE: list(text('a'), text('b'), text('c')) } })),
        show(block('lists_isEmpty', { values: { VALUE: block('lists_create_empty') } })),
        show(block('lists_indexOf', { fields: { END: 'FIRST' }, values: { VALUE: list(text('a'), text('b')), FIND: text('b') } })),
        show(block('lists_getIndex', { fields: { MODE: 'GET', WHERE: 'FIRST' }, values: { VALUE: list(text('x'), text('y')) } })),
        show(
          block('lists_getIndex', {
            fields: { MODE: 'GET', WHERE: 'FROM_END' },
            values: { VALUE: list(text('x'), text('y')), AT: number(1) },
          })
        ),
        show(
          block('lists_getSublist', {
            fields: { WHERE1: 'FROM_START', WHERE2: 'FROM_END' },
            values: { LIST: list(number(1), number(2), number(3)), AT1: number(1), AT2: number(1) },
          })
        ),
        show(block('lists_repeat', { values: { ITEM: text('ok'), NUM: number(3) } })),
        set('days', list(text('Mon'), text('Tue'))),
        block('lists_setIndex', {
          fields: { MODE: 'SET', WHERE: 'FIRST' },
          values: { LIST: get('days'), TO: text('Sun') },
        }),
        show(get('days')),
        show(block('lists_split', { fields: { MODE: 'SPLIT' }, values: { INPUT: text('mon,tue,wed'), DELIM: text(',') } })),
        show(block('lists_sort', { fields: { TYPE: 'NUMERIC', DIRECTION: '1' }, values: { LIST: list(number(3), number(1), number(2)) } })),
      ]),
    ],
    variables: ['days'],
  },
  {
    name: 'example-functions',
    level: 'complex',
    displayName: 'Example: Functions with values',
    emoji: '🧮',
    description: 'Defines a function with a parameter and a result, and calls it.',
    blocks: [
      block('procedures_defreturn', {
        fields: { NAME: 'double' },
        mutation: '<mutation><arg name="n"></arg></mutation>',
        statements: {
          STACK: [
            block('procedures_ifreturn', {
              mutation: '<mutation value="1"></mutation>',
              values: { CONDITION: compare(get('n'), 'LT', number(0)), VALUE: number(0) },
            }),
          ],
        },
        values: { RETURN: arithmetic(get('n'), 'MULTIPLY', number(2)) },
        at: { x: 20, y: 20 },
      }),
      block('procedures_defnoreturn', {
        fields: { NAME: 'greet' },
        mutation: '<mutation><arg name="who"></arg></mutation>',
        statements: { STACK: [show(join(text('Hello '), get('who')))] },
        at: { x: 20, y: 200 },
      }),
      schedule('none', [
        show(
          block('procedures_callreturn', {
            mutation: '<mutation name="double"><arg name="n"></arg></mutation>',
            values: { ARG0: number(21) },
          })
        ),
        block('procedures_callnoreturn', {
          mutation: '<mutation name="greet"><arg name="who"></arg></mutation>',
          values: { ARG0: text('Nomie') },
        }),
      ], { x: 20, y: 380 }),
    ],
  },
  {
    name: 'example-objects',
    level: 'complex',
    displayName: 'Example: Objects and JSON',
    emoji: '🧾',
    description: 'Build an object, read and change its fields, and read JSON.',
    blocks: [
      schedule('none', [
        show(
          block('object_create', {
            mutation: '<mutation num_fields="2"><field name="temp"></field><field name="mood"></field></mutation>',
            fields: { field1: 'temp', field2: 'mood' },
            values: { field_input1: number(18), field_input2: number(7) },
          })
        ),
        show(block('object_get', { fields: { NAME: 'temp' }, values: { OBJECT: block('object_from_json', { values: { JSON: text('{"temp": 18, "mood": 7}') } }) } })),
        show(block('object_keys', { values: { object_input: block('object_from_json', { values: { JSON: text('{"temp": 18, "mood": 7}') } }) } })),
        show(
          block('value_from_json_key', {
            values: {
              Key: text('mood'),
              'JSON object': block('object_from_json', { values: { JSON: text('{"temp": 18, "mood": 7}') } }),
            },
          })
        ),
        show(block('object_to_json', { values: { object: block('object_from_json', { values: { JSON: text('{"a": 1}') } }) } })),
        block('object_set', {
          fields: { NAME: 'mood' },
          values: { OBJECT: block('object_from_json', { values: { JSON: text('{"mood": 1}') } }), VALUE: number(9) },
        }),
      ]),
    ],
  },
  {
    name: 'example-try-catch',
    level: 'complex',
    displayName: 'Example: Try and catch',
    emoji: '🛟',
    description: 'Catches a problem, shows a friendly message, and always finishes.',
    blocks: [
      schedule('none', [
        block('bi_try_catch', {
          statements: {
            try: [show(block('object_from_json', { values: { JSON: text('{not json') } }))],
            catch: [message(join(text('Could not read the data: '), get('error')))],
            finally: [show(text('Done either way'))],
          },
          fields: { parameter: 'error' },
        }),
      ]),
    ],
    variables: ['error'],
  },
  {
    name: 'example-ask',
    level: 'moderate',
    displayName: 'Example: Ask a question',
    emoji: '❓',
    description: 'Asks you for a word when you run it by hand, and uses the answer.',
    live: 'prompt',
    blocks: [
      schedule('none', [
        message(
          join(
            text('Your answer was: '),
            block('text_prompt_ext', { fields: { TYPE: 'TEXT' }, values: { TEXT: text('What is your mood word?') } })
          )
        ),
      ]),
    ],
  },
  {
    name: 'example-keyword-statistics',
    level: 'complex',
    displayName: 'Example: Keyword over a period',
    emoji: '🔎',
    description: 'Counts the notes that mention a word over the last 30 days, and sums their values.',
    blocks: [
      schedule('none', [
        message(
          join(
            text('Found "exercise" in '),
            block('s4e_periodvalue', {
              values: { Trackable: text('exercise'), Period: period('LAST30DAYS'), Statistics: stats('sum') },
            }),
            text(' log entries over the last 30 days.')
          )
        ),
      ]),
    ],
  },
  {
    name: 'example-web-service',
    level: 'complex',
    displayName: 'Example: Read a web service',
    emoji: '🌡️',
    description: 'Calls a weather service with your key, and reads the temperature from its answer.',
    variables: ['WeatherData', 'Temperature'],
    live: 'secret',
    blocks: [
      schedule('none', [
        set(
          'WeatherData',
          block('s4e_httprequest', {
            values: {
              Value: join(
                text('https://api.openweathermap.org/data/2.5/weather?q=Amsterdam&APPID='),
                block('s4e_secret', { fields: { NAME: 'OPENWEATHER_KEY' } }),
                text('&lang=en&units=metric')
              ),
            },
          })
        ),
        set(
          'Temperature',
          block('value_from_json_key', {
            values: {
              Key: text('temp'),
              'JSON object': block('value_from_json_key', {
                values: {
                  Key: text('main'),
                  'JSON object': block('object_from_json', { values: { JSON: get('WeatherData') } }),
                },
              }),
            },
          })
        ),
        message(join(text('It is '), get('Temperature'), text(' degrees in Amsterdam.'))),
      ]),
    ],
  },
  // The expert examples are small programs: functions that call each other, lists of records, loops and state kept
  // between runs. None needs a secret, so each one runs in the tests, with an empty Nomie.
  {
    name: 'example-expert-mood-analyst',
    level: 'expert',
    displayName: 'Example: Mood analyst',
    emoji: '🧪',
    description: 'Works out the mean, the best and worst day of a list of moods, and a verdict for each day.',
    variables: ['moods', 'mean', 'best', 'worst', 'lowDays', 'day'],
    blocks: [
      block('procedures_defreturn', {
        fields: { NAME: 'verdict' },
        mutation: '<mutation><arg name="score"></arg></mutation>',
        statements: {
          STACK: [
            block('procedures_ifreturn', {
              mutation: '<mutation value="1"></mutation>',
              values: { CONDITION: compare(get('score'), 'GTE', number(7)), VALUE: text('good') },
            }),
            block('procedures_ifreturn', {
              mutation: '<mutation value="1"></mutation>',
              values: { CONDITION: compare(get('score'), 'GTE', number(5)), VALUE: text('okay') },
            }),
          ],
        },
        values: { RETURN: text('low') },
        at: { x: 20, y: 20 },
      }),
      block('procedures_defreturn', {
        fields: { NAME: 'meanOf' },
        mutation: '<mutation><arg name="values"></arg></mutation>',
        values: { RETURN: block('math_on_list', { fields: { OP: 'AVERAGE' }, values: { LIST: get('values') } }) },
        at: { x: 20, y: 200 },
      }),
      schedule('none', [
        set('moods', block('lists_split', { fields: { MODE: 'SPLIT' }, values: { INPUT: text('6,7,4,8,5,9,7'), DELIM: text(',') } })),
        set('mean', callReturn('meanOf', ['values'], [get('moods')])),
        set('best', block('math_on_list', { fields: { OP: 'MAX' }, values: { LIST: get('moods') } })),
        set('worst', block('math_on_list', { fields: { OP: 'MIN' }, values: { LIST: get('moods') } })),
        set('lowDays', number(0)),
        block('controls_forEach', {
          variables: { VAR: 'day' },
          values: { LIST: get('moods') },
          statements: {
            DO: [
              block('controls_if', {
                values: { IF0: compare(callReturn('verdict', ['score'], [get('day')]), 'EQ', text('low')) },
                statements: { DO0: [block('math_change', { variables: { VAR: 'lowDays' }, values: { DELTA: number(1) } })] },
              }),
            ],
          },
        }),
        message(
          join(
            text('Mean '),
            get('mean'),
            text(', best '),
            get('best'),
            text(', worst '),
            get('worst'),
            text(', low days '),
            get('lowDays')
          )
        ),
        show(join(text('Verdict for the mean: '), callReturn('verdict', ['score'], [get('mean')]))),
      ], { x: 20, y: 380 }),
    ],
  },
  {
    name: 'example-expert-habit-engine',
    level: 'expert',
    displayName: 'Example: Habit engine',
    emoji: '🔥',
    description: 'Counts a streak across runs, celebrates a milestone, and shows the streak on a widget.',
    blocks: [
      schedule('daily', [
        block('controls_if', {
          mutation: '<mutation else="1"></mutation>',
          values: { IF0: compare(dayValue('#habit', 'yesterday', 'sum'), 'GT', number(0)) },
          statements: {
            DO0: [remember('streak', arithmetic(recall('streak', number(0)), 'ADD', number(1)))],
            ELSE: [remember('streak', number(0))],
          },
        }),
        block('controls_if', {
          values: { IF0: compare(recall('streak', number(0)), 'EQ', number(7)) },
          statements: { DO0: [message(text('A week in a row!'))] },
        }),
        block('controls_if', {
          values: { IF0: compare(recall('streak', number(0)), 'GT', recall('best', number(0))) },
          statements: {
            DO0: [
              remember('best', recall('streak', number(0))),
              message(join(text('New record: '), recall('streak', number(0)), text(' days in a row'))),
            ],
          },
        }),
        dashboard('Habit', '🔥', [
          block('s4e_wvalue', { values: { Value: recall('best', number(0)) }, fields: { LABEL: 'Best streak' } }),
          block('s4e_wvalue', { values: { Value: recall('streak', number(0)) }, fields: { LABEL: 'Days in a row' } }),
          block('s4e_wtrend', { values: { Tracker: tracker('#habit') }, fields: { LABEL: 'Last 14 days' } }),
          block('s4e_wfooter', { fields: { TEXT: 'Counted every morning' } }),
        ]),
      ]),
    ],
  },
  {
    name: 'example-expert-budget-ledger',
    level: 'expert',
    displayName: 'Example: Budget ledger',
    emoji: '💶',
    description: 'A ledger of entries as objects, added up with a function, with a try and catch for bad data.',
    variables: ['ledger', 'entry', 'spent', 'budget', 'error'],
    blocks: [
      block('procedures_defreturn', {
        fields: { NAME: 'costOf' },
        mutation: '<mutation><arg name="entry"></arg></mutation>',
        values: { RETURN: block('object_get', { fields: { NAME: 'cost' }, values: { OBJECT: get('entry') } }) },
        at: { x: 20, y: 20 },
      }),
      schedule('daily', [
        set('budget', number(20)),
        set('spent', number(0)),
        set('ledger', list(entry('coffee', 3), entry('lunch', 9), entry('books', 12))),
        block('controls_forEach', {
          variables: { VAR: 'entry' },
          values: { LIST: get('ledger') },
          statements: {
            DO: [
              block('math_change', {
                variables: { VAR: 'spent' },
                values: { DELTA: callReturn('costOf', ['entry'], [get('entry')]) },
              }),
              show(
                join(
                  block('object_get', { fields: { NAME: 'item' }, values: { OBJECT: get('entry') } }),
                  text(': '),
                  callReturn('costOf', ['entry'], [get('entry')])
                )
              ),
            ],
          },
        }),
        block('controls_if', {
          values: { IF0: compare(get('spent'), 'GT', get('budget')) },
          statements: {
            DO0: [message(join(text('Over budget by '), arithmetic(get('spent'), 'MINUS', get('budget'))))],
          },
        }),
        block('bi_try_catch', {
          statements: {
            try: [show(block('object_from_json', { values: { JSON: text('{not json') } }))],
            catch: [message(join(text('Could not read the data: '), get('error')))],
            finally: [show(text('Done either way'))],
          },
          fields: { parameter: 'error' },
        }),
        dashboard('Budget', '💶', [
          block('s4e_wvalue', { values: { Value: get('spent') }, fields: { LABEL: 'Spent this week' } }),
          block('s4e_whtml', {
            fields: { HTML: '<p>Spent <b>{{spent}}</b> of {{budget}}</p>' },
            statements: {
              PARAMS: [
                block('s4e_wparam', { fields: { NAME: 'spent' }, values: { VALUE: get('spent') } }),
                block('s4e_wparam', { fields: { NAME: 'budget' }, values: { VALUE: get('budget') } }),
              ],
            },
          }),
        ]),
      ]),
    ],
  },
  {
    name: 'example-expert-command-interpreter',
    level: 'expert',
    displayName: 'Example: Command interpreter',
    emoji: '🕹️',
    description: 'Reads a list of commands, runs each one through a function, and keeps the counter between runs.',
    variables: ['commands', 'command', 'counter'],
    blocks: [
      block('procedures_defnoreturn', {
        fields: { NAME: 'runCommand' },
        mutation: '<mutation><arg name="command"></arg></mutation>',
        statements: {
          STACK: [
            block('controls_if', {
              mutation: '<mutation elseif="3" else="1"></mutation>',
              values: {
                IF0: compare(get('command'), 'EQ', text('up')),
                IF1: compare(get('command'), 'EQ', text('down')),
                IF2: compare(get('command'), 'EQ', text('reset')),
                IF3: compare(get('command'), 'EQ', text('show')),
              },
              statements: {
                DO0: [block('math_change', { variables: { VAR: 'counter' }, values: { DELTA: number(1) } })],
                DO1: [block('math_change', { variables: { VAR: 'counter' }, values: { DELTA: number(-1) } })],
                DO2: [set('counter', number(0))],
                DO3: [show(join(text('Counter is '), get('counter')))],
                ELSE: [show(join(text('Unknown command: '), get('command')))],
              },
            }),
          ],
        },
        at: { x: 20, y: 20 },
      }),
      schedule('daily', [
        set('counter', recall('counter', number(0))),
        set(
          'commands',
          block('lists_split', {
            fields: { MODE: 'SPLIT' },
            values: { INPUT: text('up,up,down,show,reset,up,bogus,show'), DELIM: text(',') },
          })
        ),
        block('controls_forEach', {
          variables: { VAR: 'command' },
          values: { LIST: get('commands') },
          statements: { DO: [callNoReturn('runCommand', ['command'], [get('command')])] },
        }),
        remember('counter', get('counter')),
        dashboard('Counter', '🕹️', [
          block('s4e_wvalue', { values: { Value: get('counter') }, fields: { LABEL: 'Counter' } }),
          block('s4e_wfooter', { fields: { TEXT: 'Commands run each morning' } }),
        ]),
      ]),
    ],
  },
];
