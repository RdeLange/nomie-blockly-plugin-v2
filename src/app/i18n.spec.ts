// The languages of the plugin (phase 18): the ones DailyNomie 7 ships, and every one says the same things.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DICTIONARIES, i18n, LANGUAGES, setLanguage, t } from './i18n.svelte';

describe('the language of the Nomie user', () => {
  it('takes the first two letters of what Nomie sends, and falls back to English', () => {
    setLanguage('de-DE');
    expect(i18n.lang).toBe('de');
    setLanguage('it_IT');
    expect(i18n.lang).toBe('it');
    setLanguage('nl');
    expect(i18n.lang).toBe('nl');
    setLanguage('fr');
    expect(i18n.lang).toBe('en');
    setLanguage(undefined);
    expect(i18n.lang).toBe('en');
  });

  it('offers the languages DailyNomie 7 ships', () => {
    expect([...LANGUAGES].sort()).toEqual(['de', 'en', 'es', 'it', 'nl']);
  });

  it('translates the words the screens show, and keeps English where there is no translation', () => {
    setLanguage('de');
    expect(t('Save')).toBe('Speichern');
    expect(t('Not a screen word')).toBe('Not a screen word');
    setLanguage('it');
    expect(t('Export')).toBe('Esporta');
    setLanguage('en');
    expect(t('Save')).toBe('Save');
  });

  it('every language says the same things, so no screen falls back to English by accident', () => {
    const dutch = Object.keys(DICTIONARIES.nl ?? {}).sort();
    expect(dutch.length).toBeGreaterThan(50);
    for (const lang of ['de', 'it', 'es'] as const) {
      const words = DICTIONARIES[lang] ?? {};
      expect(Object.keys(words).sort()).toEqual(dutch);
      for (const [key, value] of Object.entries(words)) expect(value.trim(), `${lang}: ${key}`).not.toBe('');
    }
  });

  it('every word the screens and dialogs ask for is translated in each language', () => {
    // the strings passed to t() and tf() in the app's screens and helpers (not the tests)
    const dir = join(process.cwd(), 'src/app');
    const keys = new Set<string>();
    for (const file of readdirSync(dir)) {
      if (!/\.(svelte|ts)$/.test(file) || /\.spec\.ts$/.test(file)) continue;
      const source = readFileSync(join(dir, file), 'utf8');
      for (const m of source.matchAll(/\btf?\('((?:[^'\\]|\\.)*)'/g)) keys.add(m[1].replace(/\\'/g, "'"));
    }
    expect(keys.size).toBeGreaterThan(100);
    for (const lang of ['nl', 'de', 'it', 'es'] as const) {
      const words = DICTIONARIES[lang] ?? {};
      const missing = [...keys].filter((key) => !(words[key] ?? '').trim());
      expect(missing, `${lang} is missing`).toEqual([]);
    }
  });
});
