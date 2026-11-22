// The text size of the app (prefs.fontScale) reaches every font size of the plugin (PLG-13): each size is multiplied
// by --font-scale, which the prefs set from the app.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');
const FILES = ['src/app/styles.css', 'src/app/editor.css', 'src/app/WorkspaceList.svelte', 'src/app/SettingsView.svelte', 'src/blockly/notebook.css'];

describe('the text size of the app reaches the plugin', () => {
  it('the prefs set --font-scale from fontScale', () => {
    const prefs = read('src/app/prefs.ts');
    expect(prefs).toContain("setProperty('--font-scale', String(prefs.fontScale))");
  });

  it('no font size is a fixed pixel size: each one multiplies by --font-scale', () => {
    const bare: string[] = [];
    for (const file of FILES) {
      read(file)
        .split('\n')
        .forEach((line, i) => {
          const sized = /font-size:|(^|[\s;{])font:\s/.test(line);
          if (sized && /(?<![\w.-])\d+(\.\d+)?px/.test(line) && !line.includes('--font-scale')) bare.push(`${file}:${i + 1}`);
        });
    }
    expect(bare).toEqual([]);
  });
});
