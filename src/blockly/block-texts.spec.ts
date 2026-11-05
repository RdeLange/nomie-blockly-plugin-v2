// The texts of the blocks and of the palette follow the language of the Nomie user (phase 22): every text the blocks
// and the palette use has a translation in each language, and a translation keeps the same placeholders.
import { describe, expect, it } from 'vitest';
import { setupBlockly } from './setup';
import { toolbox } from './toolbox';
import { BLOCK_TEXTS } from './block-text-table';
import { blockText, localiseBlockDef, SEEN_BLOCK_TEXTS } from './block-texts';
import { setLanguage } from '../app/i18n.svelte';

const placeholders = (text: string) => (text.match(/%\d/g) ?? []).sort().join(' ');

describe('the texts of the blocks follow the language', () => {
  it('every block text and palette label has a translation in Dutch, German and Italian', () => {
    setupBlockly();
    toolbox();
    expect(SEEN_BLOCK_TEXTS.size).toBeGreaterThan(100);
    for (const lang of ['nl', 'de', 'it', 'es'] as const) {
      const missing = [...SEEN_BLOCK_TEXTS].filter((text) => !BLOCK_TEXTS[lang]?.[text]);
      expect(missing, `${lang} is missing`).toEqual([]);
    }
  });

  it('a translation keeps the placeholders of its English text', () => {
    for (const lang of ['nl', 'de', 'it', 'es'] as const) {
      for (const [english, translated] of Object.entries(BLOCK_TEXTS[lang] ?? {})) {
        expect(placeholders(translated), `${lang}: ${english}`).toBe(placeholders(english));
      }
    }
  });

  it('a block shows its messages and tooltip in the language of the Nomie user', () => {
    setLanguage('nl');
    expect(blockText('show message %1')).toBe('toon bericht %1');
    const def = localiseBlockDef({ type: 'x', message0: 'show message %1', tooltip: 'Forget streak.', args0: [{ type: 'field_dropdown', options: [['Today', 'today']] }] });
    expect(def.message0).toBe('toon bericht %1');
    expect((def.args0 as Array<{ options: Array<[string, string]> }>)[0].options[0][0]).toBe('Vandaag');
    setLanguage('en');
    expect(blockText('show message %1')).toBe('show message %1');
  });

  it('the palette shows its group names in German', () => {
    setLanguage('de');
    expect(JSON.stringify(toolbox())).toContain('NOTIZEN LESEN');
    setLanguage('en');
    expect(JSON.stringify(toolbox())).toContain('READ YOUR NOTES');
  });
});
