// The preferences Nomie sends the plugin: the theme, the colours and the language, when the plugin opens and when they
// change while it is open (prefsChanged). The colours of the app are the palette DailyNomie 7 passes (phase 19).
import { beforeEach, describe, expect, it } from 'vitest';
import { applyUserPrefs, onPrefsChanged, paletteVariables } from './prefs';
import { i18n } from './i18n.svelte';
import { ui } from './ui.svelte';

// the palette DailyNomie 7 passes for light (src/style/plugin-colours.ts): a sample, as the app sends it
const LIGHT = { page: '#F2F2F7', card: '#FFFFFF', cardInner: '#F2F2F7', text: '#000000', textSecondary: '#636368', separator: '#D8D8DC', fill: '#E5E5EA', tint: '#0A6CC9', danger: '#D70015', good: '#1E7A34' };
const DARK = { page: '#000000', card: '#1C1C1E', cardInner: '#2C2C2E', text: '#FFFFFF', textSecondary: '#AEAEB2', separator: '#48484A', fill: '#2C2C2E', tint: '#4DB3FF', danger: '#FF6961', good: '#30D158' };
const user = (mode: 'light' | 'dark', palette: object, language = 'en-us') => ({
  theme: mode,
  language,
  colours: { mode, current: palette, light: LIGHT, dark: DARK },
});

beforeEach(() => {
  document.documentElement.removeAttribute('style');
  ui.theme = 'light';
  i18n.lang = 'en';
});

describe('the palette of the app', () => {
  it('maps the roles of DailyNomie 7 onto the colours of the editor and the list', () => {
    const vars = paletteVariables(DARK);
    expect(vars['--nb-canvas']).toBe('#000000');
    expect(vars['--nb-surface']).toBe('#1C1C1E');
    expect(vars['--nb-ink']).toBe('#FFFFFF');
    expect(vars['--nb-muted']).toBe('#AEAEB2');
    expect(vars['--nb-line']).toBe('#48484A');
    expect(vars['--nb-accent']).toBe('#4DB3FF');
    expect(vars['--nb-run']).toBe('#30D158');
    expect(vars['--nb-danger']).toBe('#FF6961');
  });

  it('leaves out a colour the app did not send', () => {
    expect(paletteVariables({ text: '#111111' })).toEqual({ '--nb-ink': '#111111' });
  });
});

describe('the theme, the colours and the language', () => {
  it('apply when the plugin opens: the theme of the app, its colours, and the language of the user', () => {
    applyUserPrefs(user('dark', DARK, 'de-DE'));
    expect(ui.theme).toBe('dark');
    expect(i18n.lang).toBe('de');
    expect(document.documentElement.style.getPropertyValue('--nb-canvas')).toBe('#000000');
  });

  it('follow a change made while the plugin is open (prefsChanged), without a reload', () => {
    applyUserPrefs(user('dark', DARK, 'en-us'));
    onPrefsChanged(new MessageEvent('message', { data: { action: 'prefsChanged', data: { user: user('light', LIGHT, 'it') } } }));
    expect(ui.theme).toBe('light');
    expect(i18n.lang).toBe('it');
    expect(document.documentElement.style.getPropertyValue('--nb-canvas')).toBe('#F2F2F7');
  });

  it('ignores other messages, and a change with no user', () => {
    applyUserPrefs(user('light', LIGHT, 'en-us'));
    onPrefsChanged(new MessageEvent('message', { data: { action: 'alertReply', data: { user: user('dark', DARK, 'nl') } } }));
    onPrefsChanged(new MessageEvent('message', { data: { action: 'prefsChanged', data: {} } }));
    expect(ui.theme).toBe('light');
    expect(i18n.lang).toBe('en');
  });
});
