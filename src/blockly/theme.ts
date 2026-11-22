// The "notebook" look of the blocks (mockup 3): each block is a light fill of its category colour with an outline in
// that colour, and ink text. One theme for light mode, one for dark. The CSS that goes with it is notebook.css.
import * as Blockly from 'blockly';

// The colour of each category: the block outline and the rail tile
export const CATEGORY_COLOURS = {
  nomie: '#0277BD',
  frame: '#0B4F8A',
  logic: '#3B5BDB',
  loops: '#2B8A3E',
  math: '#6741D9',
  text: '#0B7A6E',
  lists: '#9C36B5',
  variables: '#C2410C',
  functions: '#C2255C',
  objects: '#8D5A0B',
  advanced: '#495057',
  old: '#78716C',
} as const;

const LIGHT = { canvas: '#FFFDF8', grid: '#F0ECE4', surface: '#FFFFFF', control: '#D6D3D1', ink: '#1C1917' };
const DARK = { canvas: '#1C1917', grid: '#2A2623', surface: '#232020', control: '#57534E', ink: '#F5F5F4' };

// `colour` mixed `amount` (0 to 1) over `base`
export const mix = (colour: string, amount: number, base: string): string => {
  const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [c, b] = [rgb(colour), rgb(base)];
  return `#${c.map((v, i) => Math.round(b[i] + (v - b[i]) * amount).toString(16).padStart(2, '0')).join('')}`;
};

// The block style names: Blockly's own blocks use the built-in names, the plugin's blocks the nomie_ ones
const STYLE_COLOURS: Record<string, string> = {
  logic_blocks: CATEGORY_COLOURS.logic,
  loop_blocks: CATEGORY_COLOURS.loops,
  math_blocks: CATEGORY_COLOURS.math,
  text_blocks: CATEGORY_COLOURS.text,
  list_blocks: CATEGORY_COLOURS.lists,
  variable_blocks: CATEGORY_COLOURS.variables,
  variable_dynamic_blocks: CATEGORY_COLOURS.variables,
  procedure_blocks: CATEGORY_COLOURS.functions,
  colour_blocks: CATEGORY_COLOURS.advanced,
  hat_blocks: CATEGORY_COLOURS.frame,
  nomie_blocks: CATEGORY_COLOURS.nomie,
  nomie_frame: CATEGORY_COLOURS.frame,
  object_blocks: CATEGORY_COLOURS.objects,
  advanced_blocks: CATEGORY_COLOURS.advanced,
  old_blocks: CATEGORY_COLOURS.old,
};

const blockStyles = (base: string, fill: number, outline: (c: string) => string) =>
  Object.fromEntries(
    Object.entries(STYLE_COLOURS).map(([name, colour]) => [
      name,
      { colourPrimary: mix(colour, fill, base), colourSecondary: mix(colour, fill * 1.6, base), colourTertiary: outline(colour), hat: '' },
    ])
  ) as Record<string, Blockly.Theme.BlockStyle>;

const componentStyles = (c: typeof LIGHT): Blockly.Theme.ComponentStyle => ({
  workspaceBackgroundColour: c.canvas,
  toolboxBackgroundColour: c.surface,
  toolboxForegroundColour: c.ink,
  flyoutBackgroundColour: c.surface,
  flyoutForegroundColour: c.ink,
  flyoutOpacity: 1,
  scrollbarColour: c.control,
  scrollbarOpacity: 0.8,
  insertionMarkerColour: c.ink,
  insertionMarkerOpacity: 0.2,
  cursorColour: '#F59E0B',
});

// DailyNomie 7's font (--ios-font), as the rest of the plugin
const fontStyle = { family: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif", weight: '500', size: 11 };

// The canvas themes at the app's text size (PLG-13). Blockly lays blocks out with the font size of its theme, so the
// size is set in the theme: one theme per mode and size, built once. Blockly re-lays the blocks when the theme changes.
const BASE_FONT_SIZE = fontStyle.size;
const themes = new Map<string, Blockly.Theme>();
export const notebookTheme = (dark: boolean, scale = 1): Blockly.Theme => {
  const key = `${dark ? 'dark' : 'light'}-${scale}`;
  let theme = themes.get(key);
  if (!theme) {
    theme = Blockly.Theme.defineTheme(`nomie-notebook-${key}`, {
      name: `nomie-notebook-${key}`,
      base: Blockly.Themes.Classic,
      blockStyles: dark ? blockStyles(DARK.canvas, 0.18, (c) => mix(c, 0.7, '#FFFFFF')) : blockStyles(LIGHT.canvas, 0.1, (c) => c),
      categoryStyles: {},
      componentStyles: componentStyles(dark ? DARK : LIGHT),
      fontStyle: { ...fontStyle, size: BASE_FONT_SIZE * scale },
      startHats: false,
    });
    themes.set(key, theme);
  }
  return theme;
};

export const GRID = { light: LIGHT.grid, dark: DARK.grid };

// The plugin's style names also exist in Blockly's default theme, so a workspace without the notebook theme (headless
// runs, tests) has colours for them.
for (const [name, colour] of Object.entries(STYLE_COLOURS)) {
  if (!Blockly.Themes.Classic.blockStyles[name]) {
    Blockly.Themes.Classic.setBlockStyle(name, { colourPrimary: colour, colourSecondary: colour, colourTertiary: colour, hat: '' });
  }
}
