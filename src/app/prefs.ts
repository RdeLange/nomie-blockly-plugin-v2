// The preferences Nomie sends the plugin (phase 19): with `registered` when the plugin opens, and with `prefsChanged`
// when the theme, the colours or the language change while it is open. The SDK client does not pass on prefsChanged,
// so the plugin listens for it itself.
import { setLanguage } from './i18n.svelte';
import { ui } from './ui.svelte';

// The colours a plugin receives (DailyNomie 7's src/style/plugin-colours.ts, PluginPalette): the roles of the app
export type Palette = Partial<Record<'page' | 'card' | 'cardInner' | 'text' | 'textSecondary' | 'separator' | 'fill' | 'tint' | 'onTint' | 'tintSoft' | 'good' | 'danger' | 'switchOn', string>>;

// The colour each role takes in the plugin's own tokens (src/app/tokens.css)
const ROLE_TO_VARIABLE: Array<[keyof Palette, string]> = [
  ['page', '--nb-canvas'],
  ['card', '--nb-surface'],
  ['cardInner', '--nb-grid'],
  ['text', '--nb-ink'],
  ['textSecondary', '--nb-muted'],
  ['separator', '--nb-line'],
  ['separator', '--nb-control'],
  ['tint', '--nb-accent'],
  ['good', '--nb-run'],
  ['danger', '--nb-danger'],
  ['danger', '--ios-danger'],
];

// The CSS variables for a palette; a colour the app did not send keeps the plugin's own
export const paletteVariables = (palette: Palette): Record<string, string> => {
  const vars: Record<string, string> = {};
  for (const [role, variable] of ROLE_TO_VARIABLE) {
    const value = palette[role];
    if (typeof value === 'string' && value !== '') vars[variable] = value;
  }
  return vars;
};

// Applies the user preferences Nomie sent: the theme (light or dark), the colours and the language
export const applyUserPrefs = (user: unknown) => {
  if (!user || typeof user !== 'object') return;
  const prefs = user as { theme?: unknown; language?: unknown; colours?: { mode?: unknown; current?: Palette } };
  const mode = prefs.colours?.mode ?? prefs.theme;
  ui.theme = mode === 'dark' ? 'dark' : 'light';
  setLanguage(prefs.language);
  if (typeof document !== 'undefined' && prefs.colours?.current) {
    for (const [variable, value] of Object.entries(paletteVariables(prefs.colours.current))) {
      document.documentElement.style.setProperty(variable, value);
    }
  }
};

// The window's message handler for prefsChanged. Other messages are the SDK's, and are left to it.
export const onPrefsChanged = (event: MessageEvent) => {
  const message = event?.data as { action?: unknown; data?: { user?: unknown } } | undefined;
  if (message?.action !== 'prefsChanged') return;
  applyUserPrefs(message.data?.user);
};
