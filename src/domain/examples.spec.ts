// The example library (the examples.json the Add screen lists): each example compiles without a problem, its stored code
// is the code of its blocks, it runs unless it needs a secret, the network, a location or a prompt, and every block of
// the palette is in at least one example. Run `WRITE_EXAMPLES=1 npx vitest run src/domain/examples.spec.ts` to rebuild
// examples.json after a change to the library.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXAMPLES, EXAMPLE_LEVELS } from './example-library';
import { EXAMPLE_TRANSLATIONS } from './example-translations';
import { TUTORIALS } from './example-tutorials';
import { examplesJson } from './examples-build';
import { exampleLevelOf, exampleWorkspaces } from './workspace';
import { compileWorkspace } from '../blockly/compile';
import { runWorkspace } from '../runtime/run';
import type { NomieApi } from '../nomie/api';

const FILE = join(process.cwd(), 'src/domain/examples.json');
const compile = (xml: string) => compileWorkspace(xml, { highlight: false });
const fresh = examplesJson(EXAMPLES, compile);
if (process.env.WRITE_EXAMPLES) writeFileSync(FILE, fresh);

const api: NomieApi = {
  searchNotes: async () => [],
  getTracker: async () => null,
  getTrackerValues: async () => [],
  createNote: () => undefined,
  alert: () => undefined,
  prompt: async () => 'a word',
  getLocation: async () => null,
  openURL: () => undefined,
  pickTracker: async () => null,
};

type Stored = {
  name: string;
  displayName: string;
  detailedDescription: string;
  level: string;
  workspaceBlocks: string;
  jscode: string;
  schedule: string;
  translations: Record<string, { detailedDescription: string }>;
};
const stored = JSON.parse(readFileSync(FILE, 'utf8')) as Stored[];

// the word each language uses for a step, as in "Step 1:" (see tutorials/)
const STEP_WORD = { en: 'Step', nl: 'Stap', de: 'Schritt', it: 'Passo', es: 'Paso' } as const;
const stepsIn = (tutorial: string, lang: keyof typeof STEP_WORD) =>
  tutorial.match(new RegExp(`^${STEP_WORD[lang]} \\d+:`, 'gm'))?.length ?? 0;

describe('the example library', () => {
  it('examples.json is the library as it is built (run the rebuild command after a change)', () => {
    expect(readFileSync(FILE, 'utf8')).toBe(fresh);
  });

  it('has 36 examples, each with a name, a card line, a level and a step-by-step tutorial', () => {
    expect(stored.length).toBeGreaterThanOrEqual(36);
    for (const example of stored) {
      expect(example.displayName, example.name).toMatch(/^Example: /);
      expect(EXAMPLE_LEVELS, example.name).toContain(example.level);
      expect(example.detailedDescription.length, `${example.name} tutorial`).toBeGreaterThan(400);
      expect(stepsIn(example.detailedDescription, 'en'), `${example.name} steps`).toBeGreaterThanOrEqual(3);
    }
  });

  it('is divided into easy, moderate, complex and expert, with at least four examples in each level', () => {
    expect(EXAMPLE_LEVELS).toEqual(['easy', 'moderate', 'complex', 'expert']);
    for (const level of EXAMPLE_LEVELS) {
      expect(stored.filter((e) => e.level === level).length, level).toBeGreaterThanOrEqual(4);
    }
    expect(exampleLevelOf('example-expert-mood-analyst')).toBe('expert');
    expect(exampleLevelOf('example-hello')).toBe('easy');
  });

  it('has four expert examples, and each one is a program of several parts (its blocks, not one line)', () => {
    const expert = stored.filter((e) => e.level === 'expert');
    expect(expert.length).toBe(4);
    for (const example of expert) {
      const blocks = [...example.workspaceBlocks.matchAll(/<block type="/g)].length;
      expect(blocks, `${example.name} blocks`).toBeGreaterThanOrEqual(30);
    }
  });

  for (const example of stored) {
    it(`${example.displayName} compiles without a problem, and its stored code is its blocks' code`, () => {
      const compiled = compile(example.workspaceBlocks);
      expect(compiled.problems.filter((p) => p.level === 'error')).toEqual([]);
      expect(example.jscode).toBe(compiled.code);
      expect(example.schedule).toBe(compiled.schedule);
    });
  }

  for (const example of EXAMPLES.filter((e) => !e.live)) {
    it(`${example.displayName} runs to the end`, async () => {
      const result = await runWorkspace({
        api,
        jscode: compile(stored.find((s) => s.name === example.name)!.workspaceBlocks).code,
        scheduled: false,
        schedule: { active: false, start: new Date(), end: new Date() },
        output: () => undefined,
        secrets: {},
      });
      expect(result.ok, result.ok ? '' : result.error).toBe(true);
    });
  }

  it('every example has a name, a card line and a step-by-step tutorial in Dutch, German and Italian', () => {
    for (const example of EXAMPLES) {
      for (const lang of ['nl', 'de', 'it', 'es'] as const) {
        const translated = EXAMPLE_TRANSLATIONS[example.name]?.[lang];
        expect(translated?.displayName, `${example.name} ${lang}`).toBeTruthy();
        expect(translated?.description, `${example.name} ${lang}`).toBeTruthy();
        const tutorial = TUTORIALS[lang][example.name];
        expect(tutorial?.length, `${example.name} ${lang} tutorial`).toBeGreaterThan(400);
        expect(stepsIn(tutorial, lang), `${example.name} ${lang} steps`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('the tutorials of the library are the ones in the stored examples, in each language', () => {
    for (const example of stored) {
      expect(example.detailedDescription).toBe(TUTORIALS.en[example.name]);
      for (const lang of ['nl', 'de', 'it', 'es'] as const) {
        expect(example.translations[lang]?.detailedDescription, `${example.name} ${lang}`).toBe(TUTORIALS[lang][example.name]);
      }
    }
  });

  it('the Add screen shows the examples in the language of the Nomie user', () => {
    const dutch = exampleWorkspaces('nl');
    expect(dutch[0].displayName).toBe(EXAMPLE_TRANSLATIONS[EXAMPLES[0].name].nl!.displayName);
    expect(dutch[0].detailedDescription).toBe(TUTORIALS.nl[EXAMPLES[0].name]);
    expect(dutch[0].name).toBe(EXAMPLES[0].name);
    expect(exampleWorkspaces('en')[0].displayName).toBe(EXAMPLES[0].displayName);
  });

  it('the Add screen gets each example as a workspace, with its tutorial and a new id', () => {
    const workspaces = exampleWorkspaces();
    expect(workspaces.length).toBe(stored.length);
    expect(new Set(workspaces.map((w) => w.id)).size).toBe(workspaces.length);
    expect(workspaces[0].detailedDescription).toBe(stored[0].detailedDescription);
    expect(workspaces.every((w) => w.latestrun === '' && w.workspaceBlocks.length > 0)).toBe(true);
  });

  it('every block of the palette is in at least one example', () => {
    const toolbox = readFileSync(join(process.cwd(), 'src/blockly/toolbox.ts'), 'utf8');
    const palette = new Set(
      [...toolbox.matchAll(/'((?:s4e_|s4eblocklyframe|controls_|logic_|math_|text(?:_|')|lists_|variables_|procedures_|object_|value_from_json_key|bi_|display|pushto_|wait_seconds)[A-Za-z0-9_]*)'/g)]
        .map((m) => m[1].replace(/'$/, ''))
        .filter((type) => type !== 'text_')
    );
    const used = new Set(stored.flatMap((s) => [...s.workspaceBlocks.matchAll(/<block type="([^"]+)"/g)].map((m) => m[1])));
    const missing = [...palette].filter((type) => !used.has(type));
    expect(missing).toEqual([]);
  });
});
