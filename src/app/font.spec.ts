// The font of the plugin is the standard font of DailyNomie 7 (phase 19): a system stack, passed by no parameter, so
// there is no web font to load.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
// --ios-font in DailyNomie 7's src/style/main.css
const DAILYNOMIE_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif";

describe('the font of the plugin', () => {
  it('is the font DailyNomie 7 uses', () => {
    expect(read('src/app/tokens.css')).toContain(`--nb-font: ${DAILYNOMIE_FONT};`);
    expect(read('src/blockly/theme.ts')).toContain(DAILYNOMIE_FONT);
  });

  it('loads no web font of its own', () => {
    const tokens = read('src/app/tokens.css');
    expect(tokens).not.toMatch(/@import .*@fontsource/);
    expect(read('package.json')).not.toContain('@fontsource');
    for (const file of ['src/app/tokens.css', 'src/app/styles.css', 'src/app/editor.css', 'src/blockly/theme.ts', 'src/blockly/notebook.css']) {
      expect(read(file), file).not.toMatch(/Fraunces|JetBrains|'Inter'/);
    }
  });
});
