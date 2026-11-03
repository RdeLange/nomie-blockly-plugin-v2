// The widget builder (phase 20): the blocks build the widget a run keeps, and the old "show on widget" block is
// converted when a workspace loads, so the same value still shows on the dashboard.
import { describe, expect, it } from 'vitest';
import Interpreter from 'js-interpreter';
import { generateCode } from './setup';
import { migrateShowOnWidget } from './widget-builder';
import { runWorkspace } from '../runtime/run';
import type { NomieApi, NoteLike } from '../nomie/api';
import { parseDayKey } from '../runtime/dates';

const xml = (inner: string) => `<xml xmlns="https://developers.google.com/blockly/xml">${inner}</xml>`;
const frame = (script: string) => `<block type="s4eblocklyframe"><field name="NAME">none</field><statement name="script">${script}</statement></block>`;
const NUMBER = (n: number) => `<block type="math_number"><field name="NUM">${n}</field></block>`;
const TRACKER = (tag: string) => `<block type="s4e_trackers"><field name="Trackers">${tag}</field></block>`;
const DASHBOARD = (content: string, name = 'Mood', emoji = '😊') =>
  `<block type="s4e_dashboard"><field name="NAME">${name}</field><field name="EMOJI">${emoji}</field><statement name="CONTENT">${content}</statement></block>`;

// the days of the chart are counted back from today, so the notes are placed relative to today too
const dayKey = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const moodOn = (day: string, value: number): NoteLike => {
  const at = parseDayKey(day);
  at.setHours(13);
  return { note: `#mood(${value})`, end: at.toISOString(), elements: [{ type: 'tracker', id: 'mood', prefix: '#', value }] };
};
const api = (notes: NoteLike[] = []): NomieApi => ({
  searchNotes: async (term, date, daysBack) => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - daysBack);
    start.setHours(0, 0, 0, 0);
    return notes.filter((n) => new Date(n.end) >= start && new Date(n.end) <= end && n.elements.some((e) => `${e.prefix ?? ''}${e.id}` === term));
  },
  getTracker: async () => null,
  getTrackerValues: async () => [],
  createNote: () => undefined,
  alert: () => undefined,
  prompt: async () => null,
  getLocation: async () => null,
  openURL: () => undefined,
  pickTracker: async () => null,
});

const runXml = async (blocks: string, notes: NoteLike[] = []) => {
  const lines: string[] = [];
  const result = await runWorkspace({
    api: api(notes),
    jscode: generateCode(xml(frame(blocks))),
    scheduled: false,
    schedule: { active: false, start: new Date(), end: new Date() },
    output: (t) => lines.push(t),
  });
  return { result, lines };
};

describe('the widget builder', () => {
  it('builds the widget with its header, its value and its footer', async () => {
    const { result } = await runXml(
      DASHBOARD(
        `<block type="s4e_wvalue"><field name="LABEL">7-day mood</field><value name="Value">${NUMBER(4)}</value><next><block type="s4e_wfooter"><field name="TEXT">updated daily</field></block></next></block>`
      )
    );
    expect(result.ok && result.widget).toEqual({
      name: 'Mood',
      emoji: '😊',
      components: [{ kind: 'value', label: '7-day mood', value: '4' }],
      footer: 'updated daily',
    });
  });

  it('a chart of a tracker over days, a day without a note is a gap', async () => {
    const { result } = await runXml(
      DASHBOARD(
        `<block type="s4e_wchart"><value name="Tracker">${TRACKER('#mood')}</value><field name="DAYS">3</field><field name="COLOUR">#1E9E55</field><field name="LABEL">Mood</field></block>`
      ),
      [moodOn(dayKey(2), 4), moodOn(dayKey(0), 6)]
    );
    expect(result.ok && result.widget?.components[0]).toMatchObject({ kind: 'chart', label: 'Mood', colour: '#1E9E55' });
  });

  it('the widget blocks generate code that the sandbox can parse', () => {
    expect(() => new Interpreter(generateCode(xml(frame(DASHBOARD(`<block type="s4e_wtrend"><field name="LABEL">Trend</field></block>`)))))).not.toThrow();
  });
});

describe('the old "show on widget" block', () => {
  const OLD = `<block type="s4e_widget"><field name="LABEL">7-day mood</field><value name="Value">${NUMBER(4)}</value><next><block type="pushto_console"><value name="Value"><block type="text"><field name="TEXT">after</field></block></value></block></next></block>`;

  it('is converted to a widget with the same value, and the blocks after it stay after it', () => {
    const migrated = migrateShowOnWidget(xml(frame(OLD)));
    expect(migrated).not.toContain('s4e_widget');
    expect(migrated).toContain('s4e_dashboard');
    expect(migrated).toContain('s4e_wvalue');
    expect(migrated).toContain('pushto_console');
  });

  it('a workspace that had it shows the same value on the widget after the conversion', async () => {
    const { result, lines } = await runXml(
      `<block type="s4e_dashboard"><field name="NAME"></field><field name="EMOJI"></field><statement name="CONTENT"><block type="s4e_wvalue"><field name="LABEL">7-day mood</field><value name="Value">${NUMBER(4)}</value></block></statement><next><block type="pushto_console"><value name="Value"><block type="text"><field name="TEXT">after</field></block></value></block></next></block>`
    );
    expect(result.ok && result.widget?.components).toEqual([{ kind: 'value', label: '7-day mood', value: '4' }]);
    expect(lines).toContain('after');
  });

  it('a saved workspace with the old block runs as before: it loads converted', async () => {
    const { result, lines } = await runXml(OLD);
    expect(result.ok && result.widget?.components).toEqual([{ kind: 'value', label: '7-day mood', value: '4' }]);
    expect(lines).toContain('after');
  });

  it('a workspace without the old block is not changed', () => {
    const plain = xml(frame('<block type="pushto_console"></block>'));
    expect(migrateShowOnWidget(plain)).toBe(plain);
  });
});

describe('the bar chart block', () => {
  it('a bar chart of a tracker, a day without a note has no bar', async () => {
    const { result } = await runXml(
      DASHBOARD(
        `<block type="s4e_wbars"><value name="Tracker">${TRACKER('#mood')}</value><field name="DAYS">3</field><field name="COLOUR">#34495E</field><field name="LABEL">Mood bars</field></block>`
      ),
      [moodOn(dayKey(2), 4), moodOn(dayKey(0), 6)]
    );
    expect(result.ok && result.widget?.components[0]).toEqual({ kind: 'bars', label: 'Mood bars', colour: '#34495E', points: [4, undefined, 6] });
  });
});

// HTML widget (phase 20): the text box holds the HTML, the parameters are set with blocks, and the run fills them in
const TEXT = (text: string) => `<block type="text"><field name="TEXT">${text}</field></block>`;
const PARAM = (name: string, value: string) =>
  `<block type="s4e_wparam"><field name="NAME">${name}</field><value name="VALUE">${value}</value></block>`;
const HTML = (template: string, params: string) =>
  `<block type="s4e_whtml"><field name="HTML">${template}</field><statement name="PARAMS">${params}</statement></block>`;

describe('the HTML widget', () => {
  it('fills the placeholders with the parameters, and the value is a number as text', async () => {
    const { result } = await runXml(
      DASHBOARD(HTML('&lt;p&gt;Mood {{mood}}&lt;/p&gt;', PARAM('mood', NUMBER(6))))
    );
    expect(result.ok).toBe(true);
    expect(result.ok && result.widget?.components).toEqual([{ kind: 'html', html: '<p>Mood 6</p>' }]);
  });

  it('a parameter is written as text, so it cannot add markup', async () => {
    const { result } = await runXml(
      DASHBOARD(HTML('&lt;span&gt;{{word}}&lt;/span&gt;', PARAM('word', TEXT('&lt;img src=x onerror=alert(1)&gt;'))))
    );
    const html = result.ok ? result.widget?.components[0] : undefined;
    expect(html && html.kind === 'html' ? html.html : '').not.toContain('<img');
    expect(html && html.kind === 'html' ? html.html : '').toContain('&lt;img');
  });

  it('the HTML in the text box is cleaned when it runs: no script, no link', async () => {
    const { result } = await runXml(
      DASHBOARD(HTML('&lt;a href=&quot;https://x.example&quot;&gt;link&lt;/a&gt;&lt;script&gt;bad()&lt;/script&gt;&lt;p style=&quot;color: red&quot;&gt;hi&lt;/p&gt;', ''))
    );
    const html = result.ok && result.widget?.components[0];
    expect(html && html.kind === 'html' ? html.html : '').toBe('link<p style="color: red">hi</p>');
  });

  it('generated code for the HTML widget parses in the sandbox', () => {
    expect(() => generateCode(xml(frame(DASHBOARD(HTML('&lt;p&gt;{{a}}&lt;/p&gt;', PARAM('a', NUMBER(1)))))))).not.toThrow();
  });
});
