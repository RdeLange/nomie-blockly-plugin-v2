// What a workspace does with your notes and the network, read from its blocks: shown before an import (C4).
import { describe, expect, it } from 'vitest';
import { describeCapabilities, capabilityText } from './capabilities';
import templates from '../domain/templates.json';

const xml = (inner: string) => `<xml xmlns="https://developers.google.com/blockly/xml">${inner}</xml>`;
const tracker = (tag: string) => `<block type="s4e_trackers"><field name="Trackers">${tag}</field></block>`;
const text = (value: string) => `<block type="text"><field name="TEXT">${value}</field></block>`;

describe('what a workspace does (C4)', () => {
  it('lists the trackers it reads and writes', () => {
    const blocks = xml(
      `<block type="variables_set"><field name="VAR">v</field><value name="VALUE"><block type="s4e_dayvalue"><value name="Tracker">${tracker('#mood')}</value></block></value></block>` +
        `<block type="s4e_logvalue" y="200"><value name="Tracker">${tracker('#goodday')}</value></block>`
    );
    const caps = describeCapabilities(blocks);
    expect(caps.readsNotes).toBe(true);
    expect(caps.reads).toEqual(['#mood']);
    expect(caps.writes).toEqual(['#goodday']);
    expect(capabilityText(caps)).toBe('Reads your notes (#mood) · Writes to #goodday');
  });

  it('says when a widget shows HTML, and which hosts its images come from', () => {
    const html = (template: string) =>
      `<block type="s4e_dashboard"><field name="NAME">Mood</field><field name="EMOJI">x</field><statement name="CONTENT"><block type="s4e_whtml"><field name="HTML">${template}</field></block></statement></block>`;
    const withImage = html('&lt;img src=&quot;https://images.example.com/a.png&quot;&gt;&lt;p&gt;hi&lt;/p&gt;');
    expect(capabilityText(describeCapabilities(xml(withImage)))).toBe('Shows HTML on the widget, with images from images.example.com');
    expect(capabilityText(describeCapabilities(xml(html('&lt;p&gt;hi&lt;/p&gt;'))))).toBe('Shows HTML on the widget');
  });

  it('names the web hosts it calls, and says when an address is built while it runs', () => {
    const fixed = `<block type="s4e_httprequest"><value name="Value">${text('https://api.example.com/data?x=1')}</value></block>`;
    const built = `<block type="s4e_httprequest" y="100"><value name="Value"><block type="variables_get"><field name="VAR">url</field></block></value></block>`;
    const caps = describeCapabilities(xml(fixed + built));
    expect(caps.hosts).toEqual(['api.example.com']);
    expect(caps.dynamicRequests).toBe(true);
    expect(capabilityText(caps)).toBe('Calls api.example.com · Calls web addresses it builds while it runs');
  });

  it('reads the Retrieve Temperature template', () => {
    const template = (templates as Array<{ displayName: string; workspaceBlocks: string }>).find((t) => /Temperature/.test(t.displayName))!;
    expect(describeCapabilities(template.workspaceBlocks).hosts).toEqual(['api.openweathermap.org']);
  });

  it('says so when a workspace touches neither notes nor the network', () => {
    expect(capabilityText(describeCapabilities(xml(`<block type="pushto_console"><value name="Value">${text('hi')}</value></block>`)))).toBe(
      'Does not read or write notes, and does not use the network'
    );
  });
});
