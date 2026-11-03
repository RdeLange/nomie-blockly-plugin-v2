// What runs is the code of the blocks, never the code stored next to them. Generated code always parses, also when a
// field holds a quote or an input is empty, and problems are found before a run starts.
import { describe, expect, it } from 'vitest';
import Interpreter from 'js-interpreter';
import { compileWorkspace } from './compile';
import { runNow } from '../app/actions';
import { withFreshCode } from '../app/editing';
import type { Workspace } from '../domain/workspace';
import type { NomieApi } from '../nomie/api';

const xml = (inner: string) => `<xml xmlns="https://developers.google.com/blockly/xml">${inner}</xml>`;
const frame = (script: string, schedule = 'none') =>
  `<block type="s4eblocklyframe" id="frame" x="0" y="0"><field name="NAME">${schedule}</field><statement name="script">${script}</statement></block>`;
const text = (value: string) => `<block type="text"><field name="TEXT">${value}</field></block>`;
const setVar = (value: string) => `<block type="variables_set"><field name="VAR">v</field><value name="VALUE">${value}</value></block>`;
const display = (value: string, id = 'show') => `<block type="display" id="${id}"><value name="Value">${value}</value></block>`;

const parses = (code: string) => () => new Interpreter(code);

const fakeApi = () => {
  const alerts: string[] = [];
  const api: NomieApi = {
    searchNotes: async () => [],
    getTracker: async () => null,
    getTrackerValues: async () => [],
    createNote: () => undefined,
    alert: (_t, m) => alerts.push(m),
    prompt: async () => null,
  };
  return { api, alerts };
};

const workspaceWith = (workspaceBlocks: string, jscode: string): Workspace => ({
  id: 'w1',
  name: 'Test',
  displayName: 'Test',
  description: '',
  emoji: '🧱',
  color: '#E3F2FD',
  active: true,
  block: '',
  workspaceBlocks,
  workspacePosition: { scrollX: 0, scrollY: 0, scale: 0.8 },
  jscode,
  latestrun: '',
  schedule: 'none',
});

describe('code that runs comes from the blocks (C3, M6)', () => {
  it('reads the frame and the schedule from the blocks', () => {
    const daily = compileWorkspace(xml(frame(display(text('hi')), 'daily')), { highlight: false });
    expect(daily.frame).toBe(true);
    expect(daily.schedule).toBe('daily');
    const none = compileWorkspace(xml(display(text('hi'))), { highlight: false });
    expect(none.frame).toBe(false);
  });

  it('runs the blocks, not a different stored jscode', async () => {
    const { api, alerts } = fakeApi();
    const workspace = workspaceWith(xml(frame(display(text('from the blocks')))), 's4eblocklyframe = "activated";\ndisplay("hidden code");');
    const result = await runNow({ api, save: () => undefined }, workspace);
    expect(result.ok).toBe(true);
    expect(alerts).toEqual(['from the blocks']);
  });

  it('does not run a workspace whose blocks have no frame, whatever its jscode says', async () => {
    const { api, alerts } = fakeApi();
    const lines: string[] = [];
    const workspace = workspaceWith(xml(display(text('loose'))), 's4eblocklyframe = "activated";\ndisplay("hidden code");');
    const result = await runNow({ api, save: () => undefined }, workspace, { output: (t) => lines.push(t) });
    expect(result.ok).toBe(false);
    expect(alerts).toEqual([]);
  });

  it('replaces the stored code of an imported workspace with the code of its blocks', () => {
    const fresh = withFreshCode(workspaceWith(xml(frame(display(text('real')), 'daily')), 'display("hidden code");'));
    expect(fresh.jscode).toContain('display(\'real\')');
    expect(fresh.jscode).not.toContain('hidden code');
    expect(fresh.schedule).toBe('daily');
  });

  it('leaves out the highlight calls when nobody watches', () => {
    const blocks = xml(frame(display(text('hi'))));
    expect(compileWorkspace(blocks, { highlight: true }).code).toContain('highlightBlock(');
    expect(compileWorkspace(blocks, { highlight: false }).code).not.toContain('highlightBlock(');
    // and the generator is back to normal afterwards
    expect(compileWorkspace(blocks, { highlight: true }).code).toContain('highlightBlock(');
  });
});

describe('generated code always parses (H2, H3)', () => {
  it('escapes a tracker tag with a quote in it', () => {
    const tracker = '<block type="s4e_trackers"><field name="Trackers">#a"b</field></block>';
    const log = `<block type="s4e_logvalue"><value name="Value">${text('1')}</value><value name="Tracker">${tracker}</value></block>`;
    const { code } = compileWorkspace(xml(frame(log)), { highlight: false });
    expect(parses(code)).not.toThrow();
    expect(code).toContain('"#a\\"b"');
  });

  const CALLS: Record<string, string> = {
    s4e_dayvalue: 'fetchDayValue(',
    s4e_periodvalue: 'fetchPeriodValue(',
    s4e_httprequest: 'httpRequest(',
    s4e_logvalue: 'logValue(',
    display: 'display(',
    pushto_console: 'alert(',
    pushto_webconsole: 'consolelog(',
  };
  for (const [type, call] of Object.entries(CALLS)) {
    it(`${type} with empty inputs generates code that parses`, () => {
      const isValue = ['s4e_dayvalue', 's4e_periodvalue', 's4e_httprequest'].includes(type);
      const block = isValue ? setVar(`<block type="${type}"></block>`) : `<block type="${type}"></block>`;
      const { code, problems } = compileWorkspace(xml(frame(block)), { highlight: false });
      expect(problems.some((p) => /could not be read/.test(p.message))).toBe(false);
      expect(code).toContain(call);
      expect(parses(code)).not.toThrow();
    });
  }
});

describe('problems are found before a run (L1)', () => {
  it('reports a missing frame as an error', () => {
    const { problems } = compileWorkspace(xml(display(text('hi'))), { highlight: false });
    expect(problems.some((p) => p.level === 'error' && /Scheduler block/.test(p.message))).toBe(true);
  });

  it('reports a data block without a tracker as an error, on that block', () => {
    const fetch = '<block type="s4e_dayvalue" id="fetch"></block>';
    const { problems } = compileWorkspace(xml(frame(setVar(fetch))), { highlight: false });
    expect(problems).toContainEqual(expect.objectContaining({ blockId: 'fetch', level: 'error' }));
  });

  it('warns about a block outside the frame', () => {
    const loose = `<block type="display" id="loose" x="400" y="0"><value name="Value">${text('x')}</value></block>`;
    const { problems } = compileWorkspace(xml(frame(display(text('in'))) + loose), { highlight: false });
    expect(problems).toContainEqual(expect.objectContaining({ blockId: 'loose', level: 'warning' }));
  });

  it('reports a block that never worked as an error', () => {
    const cls = '<block type="bi_class" id="cls"><field name="NAME">A</field><field name="extends"></field></block>';
    const { problems } = compileWorkspace(xml(frame(cls)), { highlight: false });
    expect(problems).toContainEqual(expect.objectContaining({ blockId: 'cls', level: 'error' }));
  });

  it('does not start a run that has errors, and says why', async () => {
    const { api, alerts } = fakeApi();
    const lines: string[] = [];
    const fetch = '<block type="s4e_dayvalue" id="fetch"></block>';
    const result = await runNow({ api, save: () => undefined }, workspaceWith(xml(frame(setVar(fetch))), ''), {
      output: (t) => lines.push(t),
    });
    expect(result.ok).toBe(false);
    expect(alerts).toEqual([]);
    expect(lines.join('\n')).toMatch(/Fetch Day Value/);
  });

  it('names the block where a run failed', async () => {
    const { api } = fakeApi();
    const lines: string[] = [];
    // JSON.parse of text that is not JSON throws inside the sandbox
    const parse = `<block type="object_from_json" id="parse"><value name="JSON">${text('not json')}</value></block>`;
    const set = `<block type="variables_set" id="set"><field name="VAR">x</field><value name="VALUE">${parse}</value></block>`;
    const result = await runNow({ api, save: () => undefined }, workspaceWith(xml(frame(set)), ''), {
      output: (t) => lines.push(t),
      highlight: () => undefined,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.blockId).toBe('set');
    expect(lines.join('\n')).toMatch(/in block "set x to/i);
  });
});
