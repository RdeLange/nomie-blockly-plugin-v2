// The example library: workspaces that show what each part of the plugin does, one area at a time. Each example is a
// small tutorial: its blocks, in the order they are built, and a detailed description that walks through them. The
// library is built into examples.json (scripts/build-examples.ts), with the code of each workspace.
import { block, get, message, number, schedule, set, show, text, tracker, whenNote, join, type Block } from './example-xml';

export type Example = {
  // the workspace's name: unique, with no spaces (the note "Run Blockly Workspace: name" uses it)
  name: string;
  displayName: string;
  emoji: string;
  // one line on the card in the list
  description: string;
  // the tutorial, shown in the editor's Detailed tab: what the example builds, step by step, and what to try
  detailedDescription: string;
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

export const EXAMPLES: Example[] = [
  {
    name: 'example-hello',
    displayName: 'Example: Hello, console',
    emoji: '👋',
    description: 'The first workspace: lines in the console, and a notice from Nomie.',
    detailedDescription:
      'In this first example you build the smallest useful workspace: one line of text in the console. Start in the Nomie section of the drawer and drop the Scheduler block on the canvas. Its script is the part that runs, so put the next block inside it. Next, add the console block and plug a text block into its Value. Type a greeting in the text. Then add a second console line, and a message block that shows the same text as a notice. Press Run: the console shows each line in order, and the message appears as a notice from Nomie. Try changing the text and run again.',
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
    displayName: 'Example: Yesterday in one number',
    emoji: '🗓️',
    description: 'Reads one tracker for one day and shows the average.',
    detailedDescription:
      'This example reads your notes. It asks for the average mood of yesterday and shows the answer with a sentence around it. Begin with the Scheduler block. Inside it, add a show message block. Into the message, join two parts with a join block: a text that starts the sentence, and a day value block. The day value block takes three inputs: the tracker (#mood, from the tracker block), the day (yesterday, from the day picker) and the statistic (average, from the statistics picker). Run it in test mode first. The sentence shows the value your notes hold; without notes it shows a zero.',
    blocks: [
      schedule('none', [
        message(join(text('Your average mood yesterday was '), dayValue('#mood', 'yesterday', 'avg'))),
      ]),
    ],
  },
  {
    name: 'example-mood-period',
    displayName: 'Example: Mood over a period',
    emoji: '📈',
    description: 'A period value, rounded and shown as a sentence.',
    detailedDescription:
      'Here you read a longer period. Add the period value block, which works like the day value block but covers a range: pick Last 30 days in the period picker, and the average statistic. Wrap the period value in a round block, so the answer has no decimals. Show it with a message and a text in front. This is the pattern for weekly and monthly summaries: change the period and the statistic, and the same blocks answer a different question.',
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
    displayName: 'Example: Log a value each day',
    emoji: '✍️',
    description: 'Writes a note with a tracker value, for the day of the run.',
    detailedDescription:
      'This example writes to your notes, so it is best tried in test mode first: in test mode it only says what it would write. Put the log value block inside a daily Scheduler block, so it writes one note for each day of a scheduled run. Give it the tracker #goodday, a value of 1, and the day picker set to today. Try the test run: the console shows the line "Would log" with the day. Once you are happy, turn test mode off and run it for real.',
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
    displayName: 'Example: Wait between lines',
    emoji: '⏳',
    description: 'Waits a second between two console lines.',
    detailedDescription:
      'A workspace can pause. Build two console lines with a wait block between them: first the console line, then the wait block set to 1 second, then the second line. The run stops for the wait, and the console shows the first line before the second. Use waits sparingly: every second counts towards the time a run may take.',
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
    displayName: 'Example: The pickers',
    emoji: '🎛️',
    description: 'Tracker, day, period, statistic and date pickers in one place.',
    detailedDescription:
      'The pickers are the small blocks that choose a value: a tracker, a day, a period, a statistic and a date. In this example each picker is put into a show message, so you can see what it chooses. Build the message from join blocks, one for each picker. Change the picked value in the dropdown and run again to see the text change. Every block that reads or writes notes takes its tracker, day or period from these pickers.',
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
    displayName: 'Example: Last value and days since',
    emoji: '🕰️',
    description: 'The last logged value, and how many days ago it was logged.',
    detailedDescription:
      'The history blocks look back through your notes. The last value block finds the latest note with a tracker within a number of days, and the days since block counts the days from that note to today. Build them in a daily Scheduler block: a message with the last mood (looking back 14 days), and a second line with the days since #mood was logged. Both answers come from the same notes, so they agree with each other.',
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
    displayName: 'Example: A streak',
    emoji: '🔥',
    description: 'Counts the days in a row with a tracker, and congratulates you.',
    detailedDescription:
      'A streak counts the days in a row that a tracker was logged, up to the day of the run. Build an if block: when the streak is at least 3, show a congratulation message, otherwise show a short encouragement. The condition is a compare block, with the streak block on the left and the number 3 on the right. Try it with different trackers, and read the tooltip on the streak block: it counts at most 60 days.',
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
    displayName: 'Example: Write a note',
    emoji: '📝',
    description: 'Writes a free-text note on a day of your choice.',
    detailedDescription:
      'The log note block writes a free-text note, which can hold trackers, people and context as a Nomie note does. Build it inside a Scheduler block with the text "Reviewed the week #review" and the day picker on yesterday. Use test mode first: it shows the note it would write. This is the block to use for a weekly summary or a reminder that appears in your timeline.',
    blocks: [
      schedule('none', [
        block('s4e_lognote', { values: { Text: text('Reviewed the week #review'), Date: day('yesterday') } }),
      ]),
    ],
  },
  {
    name: 'example-location',
    displayName: 'Example: Where am I',
    emoji: '📍',
    description: 'Shows the location Nomie reports, if you allow it.',
    detailedDescription:
      'The my location block asks Nomie for your position, and it gives a latitude and a longitude, or nothing when the position is not known. Build it into a message, with a text in front. Nomie asks for permission the first time. Run it in test mode first, and see the position appear. If nothing appears, the position was not available, which is why every use of my location should have a fallback.',
    live: 'location',
    blocks: [schedule('none', [message(join(text('Your location: '), block('s4e_mylocation')))])],
  },
  {
    name: 'example-open-link',
    displayName: 'Example: Open a link',
    emoji: '🔗',
    description: 'Opens a web page in Nomie when you run it by hand.',
    detailedDescription:
      'The open link block opens a web page in a window inside Nomie. Build it with a text block holding the address. In a manual run the page opens; in a scheduled run the block only writes "Would open" to the output, so a schedule never opens a window. Use this for a page you check every day, such as a dashboard of your own.',
    live: 'network',
    blocks: [schedule('none', [block('s4e_openlink', { values: { Value: text('https://example.com') } })])],
  },
  {
    name: 'example-fetch-page',
    displayName: 'Example: Fetch a web page',
    emoji: '🌐',
    description: 'Fetches a web page and shows the start of its answer.',
    detailedDescription:
      'The fetch block calls a web address and gives the answer as text. Build it with a text block holding the address, and show the answer in the console. Most services answer with JSON; the object blocks in the Objects example show how to read one. Only addresses you trust should be called, because a workspace that is shared with you runs them too.',
    live: 'network',
    blocks: [
      schedule('none', [show(block('s4e_httprequest', { values: { Value: text('https://example.com') } }))]),
    ],
  },
  {
    name: 'example-widget-value',
    displayName: 'Example: Dashboard widget with a value',
    emoji: '🧩',
    description: 'A widget on the dashboard with a value, a trend and a footer.',
    detailedDescription:
      'A dashboard widget is built from the widget blocks, in order. Start with the dashboard block: it has a name and an emoji for the header. Inside it, show a value with the period value block, a trend of #mood over 14 days, and a footer line at the bottom. Run it once so the widget is kept, then look at the dashboard in Nomie. The Preview tab in the editor shows the widget as the dashboard will show it.',
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
    displayName: 'Example: Widget charts',
    emoji: '📊',
    description: 'A line chart and a bar chart on one widget.',
    detailedDescription:
      'A chart shows a tracker day by day. The line chart joins the days with a line, and a day without a note is a gap. The bar chart gives one bar for each day. Build both inside one dashboard block: a line chart of #mood over 30 days in blue, and a bar chart of the last 7 days in green. Each chart has its own label. Compare them in the Preview tab: they draw the same notes, in two ways.',
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
    displayName: 'Example: Widget with HTML',
    emoji: '🎨',
    description: 'A widget with your own HTML, filled with values from the blocks.',
    detailedDescription:
      'The HTML block shows your own HTML on a widget. Write the HTML in the text box, and put a placeholder such as {{mood}} where a value goes. Then add a parameter block for each placeholder: its name is the placeholder name, and its value is any block, here the average mood. The HTML is cleaned before it is shown: scripts and links are removed, and images must come from https. Change the HTML, run, and look at the Preview tab.',
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
    displayName: 'Example: Remember between runs',
    emoji: '🧠',
    description: 'Keeps a count from one run to the next.',
    detailedDescription:
      'A workspace forgets everything between runs, unless it remembers a value. In this example you count how many times it has run. Remember takes a name and a value. Recall takes a name and a default for the first run. Build it in order: recall the count (default 0), add 1 with an arithmetic block, remember the result under the same name, and show it. Run it three times: the count goes 1, 2, 3. On the third run an if block forgets the value with the forget block, so the next run starts again from 0.',
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
    displayName: 'Example: Keep a key in Settings',
    emoji: '🔑',
    description: 'Uses a secret from Settings, so the key is not in the blocks.',
    detailedDescription:
      'A workspace often needs a key. Instead of writing the key into a text block, where every shared file would carry it, use the secret block with the name of the key. Add the key in Settings under the same name. The run shows the secret as four dots, so it never appears in the output. If the secret is missing, the run stops and tells you which one to add. This example needs a key named EXAMPLE_KEY; a test run only checks that the block is set up.',
    live: 'secret',
    blocks: [schedule('none', [show(join(text('The key is '), block('s4e_secret', { fields: { NAME: 'EXAMPLE_KEY' } })))])],
  },
  {
    name: 'example-when-note',
    displayName: 'Example: When a note is saved',
    emoji: '⚡',
    description: 'Runs when a note with a tracker is saved, and reads that note.',
    detailedDescription:
      'Instead of a schedule, a When-note block runs the workspace when a note with its tracker is saved. Build it with the tracker #run. Inside it, read the note: the note value block gives the value of #mood in the note, the note text block gives the text, and the note day block gives the day. Show them in one message. Log a note with #run and #mood(4) to see them. Outside a note run these blocks give nothing, which the pre-run check tells you.',
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
    displayName: 'Example: Count with a loop',
    emoji: '🔁',
    description: 'Repeats a block a number of times, and counts with a for loop.',
    detailedDescription:
      'A loop repeats its blocks. The repeat block runs its inside a set number of times: here three. The for block counts with a variable: it starts at 1, stops at 5, and steps by 1, and the variable i holds the current number. Build a for loop with a message that joins "Step " and i. The console shows five lines. Loops are how a workspace covers many days or many notes at once.',
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
    displayName: 'Example: While and break',
    emoji: '🛑',
    description: 'Repeats while a condition holds, and stops early with break.',
    detailedDescription:
      'A while loop repeats as long as its condition is true, and a break stops the loop early. Build a counter: set the variable n to 0. Then a while loop with the condition n < 10, and inside it an if block: when n is 4, break out of the loop; otherwise, show n and add 1 to n. The console shows the numbers 0 to 3, then the loop stops. Be careful to change the variable inside the loop, or the loop never ends; the run also stops after a very large number of steps.',
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
    displayName: 'Example: Go through a list',
    emoji: '📋',
    description: 'Goes through each item of a list in turn.',
    detailedDescription:
      'A for-each block takes each item of a list in turn. Build a list of three days with a create list block, then a for-each block over the list, with the variable item. Inside, show the item. The console shows the three items in order. Lists are the way to hold several values, such as the moods of the last week, before the workspace works on them.',
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
    displayName: 'Example: Decide with logic',
    emoji: '⚖️',
    description: 'If, and, or, not, true and false, in one decision.',
    detailedDescription:
      'Logic blocks give a true or false answer, and an if block acts on it. Build a condition from two compare blocks joined with an and block, and negate the result with the not block. The if block shows a message when it is true, and an else branch shows another when it is not. Change the numbers in the compare blocks and run again to see both branches. The ternary block picks one of two values in a single line, as the last line shows.',
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
    displayName: 'Example: Numbers',
    emoji: '🔢',
    description: 'Arithmetic, powers, trigonometry, constants and number checks.',
    detailedDescription:
      'The math blocks work on numbers. This example builds a small calculator: an arithmetic block adds and multiplies, a single-number block takes a square root, a trig block gives a sine, and the constant pi comes from its block. A number property block checks whether a number is even, and a modulo block gives the remainder. Show each result on its own line, and read the labels in the console to match each line to its block.',
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
    displayName: 'Example: Random, rounding and averages',
    emoji: '🎲',
    description: 'Random numbers, rounding, an average of a list, and a change.',
    detailedDescription:
      'This example covers the blocks that round, pick at random and summarise a list. A random integer block picks a whole number between two limits, and a random fraction block picks a number between 0 and 1. A round block with the ROUNDUP option rounds up. An average block works on a list, and a constrain block keeps a value between a low and a high limit. Run it several times: the random values change, the rest stays the same.',
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
    displayName: 'Example: Text tools',
    emoji: '🔤',
    description: 'Length, case, trimming, search and cutting text.',
    detailedDescription:
      'Text blocks change and inspect words. This example shows the length of a text, changes its case, trims spaces at both ends, finds the position of a word, takes one letter, and cuts out a part. Each result goes to the console on its own line. Build them one after another, and compare each block with the line it produces.',
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
    displayName: 'Example: Lists',
    emoji: '📃',
    description: 'Create, read, change, search, split and sort lists.',
    detailedDescription:
      'A list holds several values in order. This example builds one list, then uses the list blocks on it: the length, a check for an empty list, the position of an item, the item at a position, and a change of an item. A split block cuts a text into a list, and a sort block orders the numbers. Each step shows its result in the console, so you can follow what the list looks like at each point.',
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
    displayName: 'Example: Functions with values',
    emoji: '🧮',
    description: 'Defines a function with a parameter and a result, and calls it.',
    detailedDescription:
      'A function is a set of blocks with a name that you can call again. This one takes a number and returns its double. Build the definition first: a function block with the name double, a parameter named n, and a return block that gives n times 2. Inside it, an if-return block comes first: when n is below 0 it returns 0 straight away, so the rest is skipped. Then call it with the number 21 in a show block. The console shows 42. Define a function once and call it wherever you need it.',
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
    displayName: 'Example: Objects and JSON',
    emoji: '🧾',
    description: 'Build an object, read and change its fields, and read JSON.',
    detailedDescription:
      'An object holds named fields, like a small record. Build one with the create object block: two fields, temp and mood. Read a field with the get block and change one with the set block. The JSON blocks go the other way: the from-JSON block reads a text of JSON into an object, and the value-from-key block takes one value out of it. Show each result in the console. Web services answer with JSON, so this is the pattern to read their answers.',
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
    displayName: 'Example: Try and catch',
    emoji: '🛟',
    description: 'Catches a problem, shows a friendly message, and always finishes.',
    detailedDescription:
      'Some steps can fail, for example when a text is not valid JSON. A try block runs its blocks; if one fails, the catch block runs and gets the error. The finally block runs in both cases. Build a try block with a from-JSON block that reads a broken text. In the catch block, show "Could not read the data" with the error. The run goes on after the catch, so a single problem does not stop the whole workspace.',
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
    displayName: 'Example: Ask a question',
    emoji: '❓',
    description: 'Asks you for a word when you run it by hand, and uses the answer.',
    detailedDescription:
      'A text prompt block asks you a question when you run the workspace by hand, and gives the answer as text. Build it into a message: "Your answer was " followed by the prompt block, with the question "What is your mood word?". In a scheduled run the question is not asked. Use a prompt for a choice you make each time, and a tracker for everything you want to keep.',
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
    displayName: 'Example: Keyword over a period',
    emoji: '🔎',
    description: 'Counts the notes that mention a word over the last 30 days, and sums their values.',
    detailedDescription:
      'Not every value is a tracker. A period value block can also take a word, and then it looks for that word in your notes over the period. In this example you search for the word exercise over the last 30 days, and ask for the sum. Build the period value block with a text block in its Trackable input, a period picker set to Last 30 days, and a statistics picker set to sum. Put the result in a message with a sentence in front. Change the word to anything you write about in your notes, and run again: the same blocks answer a different question.',
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
    displayName: 'Example: Read a web service',
    emoji: '🌡️',
    description: 'Calls a weather service with your key, and reads the temperature from its answer.',
    detailedDescription:
      'This example joins several parts in one flow. First the key: it is a secret, added in Settings under the name OPENWEATHER_KEY, so it is not written in the blocks. Next the request: a fetch block with a join of the address, the secret and the options. The answer is text in JSON, so it is read in two steps: the value from the key main gives an object, and the value from the key temp in that object is the temperature. The answer is kept in two variables, WeatherData and Temperature, and shown in a message. Without the secret, the run stops and names the secret to add.',
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
];
