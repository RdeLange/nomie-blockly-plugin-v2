// The widget builder (phase 20): the blocks that build a dashboard widget. It replaces "show on widget" (s4e_widget),
// whose workspaces are converted when they load, so they show the same value. The blocks follow Nomie Lab v3's widget
// (a header, the content in order, and a footer), in the plugin's own blocks.
import * as Blockly from 'blockly';
import type { Block } from 'blockly';
import { Order, type JavascriptGenerator } from 'blockly/javascript';
import { CHART_COLOURS, CHART_MAX_DAYS, TREND_DAYS } from '../runtime/widget';

export const WIDGET_BLOCKS = ['s4e_dashboard', 's4e_wvalue', 's4e_wtrend', 's4e_wchart', 's4e_wbars', 's4e_wfooter'];
const COLOUR_NAMES = ['Blue', 'Green', 'Purple', 'Orange', 'Pink', 'Slate'];
const COLOUR_OPTIONS = CHART_COLOURS.map((colour, i) => [COLOUR_NAMES[i], colour]);

// The names used in the generated code are the same as the host functions (see runtime/host.ts)
const quote = (value: unknown) => JSON.stringify(String(value ?? ''));

export const defineWidgetBlocks = () => {
  Blockly.defineBlocksWithJsonArray([
    {
      // the widget: its name and emoji (the header), and the content blocks inside it
      type: 's4e_dashboard',
      tooltip: 'Builds a widget for the Nomie dashboard from the blocks inside it, in order. Example: a widget named Mood with a value and a chart inside.',
      message0: 'Dashboard widget named %1 emoji %2 with %3',
      args0: [
        { type: 'field_input', name: 'NAME', text: 'Mood' },
        { type: 'field_input', name: 'EMOJI', text: '📊' },
        { type: 'input_statement', name: 'CONTENT' },
      ],
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_frame',
    },
    {
      type: 's4e_wvalue',
      tooltip: 'Shows a value on the widget under a label, as a number or a word. Example: show value of 7-day average mood as "7-day mood".',
      message0: 'show value %1 as %2',
      args0: [
        { type: 'input_value', name: 'Value' },
        { type: 'field_input', name: 'LABEL', text: 'label' },
      ],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_wtrend',
      tooltip: `Shows the last ${TREND_DAYS} days of a tracker as a small line, with no axes. Example: trend of mood as "Mood trend".`,
      message0: 'trend of %1 as %2',
      args0: [
        { type: 'input_value', name: 'Tracker', check: 'Tracker' },
        { type: 'field_input', name: 'LABEL', text: 'trend' },
      ],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_wchart',
      tooltip: `Shows a line chart of a tracker over the last days (at most ${CHART_MAX_DAYS}); a day without a note is a gap. Example: chart of mood over 30 days in Blue as "Mood".`,
      message0: 'chart of %1 over %2 days in %3 as %4',
      args0: [
        { type: 'input_value', name: 'Tracker', check: 'Tracker' },
        { type: 'field_number', name: 'DAYS', value: 30, min: 1, max: CHART_MAX_DAYS, precision: 1 },
        { type: 'field_dropdown', name: 'COLOUR', options: COLOUR_OPTIONS },
        { type: 'field_input', name: 'LABEL', text: 'chart' },
      ],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_wbars',
      tooltip: `Shows a bar chart of a tracker over the last days (at most ${CHART_MAX_DAYS}), one bar a day; a day without a note has no bar. Example: bars of mood over 7 days in Green as "Mood bars".`,
      message0: 'bar chart of %1 over %2 days in %3 as %4',
      args0: [
        { type: 'input_value', name: 'Tracker', check: 'Tracker' },
        { type: 'field_number', name: 'DAYS', value: 7, min: 1, max: CHART_MAX_DAYS, precision: 1 },
        { type: 'field_dropdown', name: 'COLOUR', options: COLOUR_OPTIONS },
        { type: 'field_input', name: 'LABEL', text: 'bars' },
      ],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
    {
      type: 's4e_wfooter',
      tooltip: 'A line of text at the foot of the widget. Example: footer "updated every morning".',
      message0: 'footer %1',
      args0: [{ type: 'field_input', name: 'TEXT', text: '' }],
      inputsInline: true,
      previousStatement: null,
      nextStatement: null,
      style: 'nomie_blocks',
    },
  ]);
};

export const registerWidgetGenerators = (js: JavascriptGenerator) => {
  const input = (block: Block, g: JavascriptGenerator, name: string, fallback: string) => g.valueToCode(block, name, Order.ATOMIC) || fallback;

  js.forBlock['s4e_dashboard'] = (block: Block, g) =>
    `widgetStart(${quote(block.getFieldValue('NAME'))}, ${quote(block.getFieldValue('EMOJI'))});\n` +
    g.statementToCode(block, 'CONTENT') +
    'widgetEnd();\n';
  js.forBlock['s4e_wvalue'] = (block: Block, g) =>
    `widgetAdd({kind: "value", label: ${quote(block.getFieldValue('LABEL'))}, value: ${input(block, g, 'Value', "''")}});\n`;
  js.forBlock['s4e_wtrend'] = (block: Block, g) =>
    `widgetAdd({kind: "trend", label: ${quote(block.getFieldValue('LABEL'))}, points: chartPoints(${input(block, g, 'Tracker', '""')}, ${TREND_DAYS})});\n`;
  js.forBlock['s4e_wchart'] = (block: Block, g) => {
    const days = Math.min(CHART_MAX_DAYS, Math.max(1, Math.round(Number(block.getFieldValue('DAYS')) || 30)));
    return (
      `widgetAdd({kind: "chart", label: ${quote(block.getFieldValue('LABEL'))}, colour: ${quote(block.getFieldValue('COLOUR'))}, ` +
      `points: chartPoints(${input(block, g, 'Tracker', '""')}, ${days})});\n`
    );
  };
  js.forBlock['s4e_wbars'] = (block: Block, g) => {
    const days = Math.min(CHART_MAX_DAYS, Math.max(1, Math.round(Number(block.getFieldValue('DAYS')) || 7)));
    return (
      `widgetAdd({kind: "bars", label: ${quote(block.getFieldValue('LABEL'))}, colour: ${quote(block.getFieldValue('COLOUR'))}, ` +
      `points: chartPoints(${input(block, g, 'Tracker', '""')}, ${days})});\n`
    );
  };
  js.forBlock['s4e_wfooter'] = (block: Block) => `widgetFooter(${quote(block.getFieldValue('TEXT'))});\n`;
};

// The names the generated code calls, which a workspace variable must not hide (see nomie-blocks.ts)
export const WIDGET_RESERVED_WORDS = ['widgetStart', 'widgetAdd', 'widgetFooter', 'widgetEnd', 'chartPoints'];

// "show on widget" (s4e_widget, phase 15) becomes a widget with one value: the same value on the dashboard. The block
// after it stays after the new one. Only the old block's own value is moved; nothing else changes.
export const migrateShowOnWidget = (xml: string): string => {
  if (!xml.includes('s4e_widget')) return xml;
  let root: Element;
  try {
    root = Blockly.utils.xml.textToDom(xml);
  } catch {
    return xml;
  }
  const doc = root.ownerDocument;
  const ns = doc.documentElement.namespaceURI;
  const el = (tag: string, attrs: Record<string, string> = {}) => {
    const e = doc.createElementNS(ns, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  };
  const olds = Array.from(root.getElementsByTagName('block')).filter((b) => b.getAttribute('type') === 's4e_widget');
  for (const old of olds) {
    const label = Array.from(old.children).find((c) => c.tagName === 'field' && c.getAttribute('name') === 'LABEL')?.textContent ?? 'label';
    const value = Array.from(old.children).find((c) => c.tagName === 'value' && c.getAttribute('name') === 'Value');
    const dashboard = el('block', { type: 's4e_dashboard' });
    if (old.getAttribute('id')) dashboard.setAttribute('id', old.getAttribute('id') as string);
    // no name and no emoji: the widget takes the name and the emoji of its workspace
    const name = el('field', { name: 'NAME' });
    const emoji = el('field', { name: 'EMOJI' });
    const content = el('statement', { name: 'CONTENT' });
    const shown = el('block', { type: 's4e_wvalue' });
    const shownLabel = el('field', { name: 'LABEL' });
    shownLabel.textContent = label;
    shown.appendChild(shownLabel);
    if (value) {
      const moved = el('value', { name: 'Value' });
      for (const child of Array.from(value.children)) moved.appendChild(child.cloneNode(true));
      shown.appendChild(moved);
    }
    content.appendChild(shown);
    dashboard.appendChild(name);
    dashboard.appendChild(emoji);
    dashboard.appendChild(content);
    const next = Array.from(old.children).find((c) => c.tagName === 'next');
    if (next) dashboard.appendChild(next.cloneNode(true));
    old.parentNode?.replaceChild(dashboard, old);
  }
  return olds.length ? Blockly.utils.xml.domToText(root) : xml;
};
