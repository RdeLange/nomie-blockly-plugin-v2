// The stored form of the example library: the XML of each example, the code its blocks compile to, its level, its
// schedule and its tutorials. Used by the build script and by the test that checks examples.json is up to date.
import { workspaceXml } from './example-xml';
import type { Example, ExampleLevel } from './example-library';
import type { CompiledWorkspace } from '../blockly/compile';
import { EXAMPLE_TRANSLATIONS, type ExampleLanguage, type ExampleTranslation } from './example-translations';
import { TUTORIALS } from './example-tutorials';

const COLOURS = ['#E3F2FD', '#FDF0A4', '#C47ADA', '#EC9740', '#5E7ABC', '#34C759', '#FF3B30'];

// a language's card and tutorial (the tutorial is the Detailed tab's text)
export type StoredTranslation = ExampleTranslation & { detailedDescription: string };

export type StoredExample = {
  name: string;
  displayName: string;
  description: string;
  // the tutorial in English (the text the Detailed tab shows when the language has none)
  detailedDescription: string;
  level: ExampleLevel;
  color: string;
  emoji: string;
  active: true;
  block: string;
  workspaceBlocks: string;
  workspacePosition: { scrollX: number; scrollY: number; scale: number };
  jscode: string;
  schedule: 'none' | 'daily';
  // the card and the tutorial in the other languages
  translations: Partial<Record<ExampleLanguage, StoredTranslation>>;
};

const translationsOf = (name: string): Partial<Record<ExampleLanguage, StoredTranslation>> => {
  const out: Partial<Record<ExampleLanguage, StoredTranslation>> = {};
  for (const lang of ['nl', 'de', 'it', 'es'] as const) {
    const card = EXAMPLE_TRANSLATIONS[name]?.[lang];
    const tutorial = TUTORIALS[lang][name];
    if (card && tutorial) out[lang] = { ...card, detailedDescription: tutorial };
  }
  return out;
};

export const storedExamples = (examples: Example[], compile: (xml: string) => CompiledWorkspace): StoredExample[] => {
  const names = new Set<string>();
  return examples.map((example, i) => {
    if (names.has(example.name)) throw new Error(`Two examples are named ${example.name}`);
    names.add(example.name);
    const tutorial = TUTORIALS.en[example.name];
    if (!tutorial) throw new Error(`${example.name} has no tutorial`);
    const workspaceBlocks = workspaceXml(example.blocks, example.variables ?? []);
    const compiled = compile(workspaceBlocks);
    const errors = compiled.problems.filter((p) => p.level === 'error');
    if (errors.length) throw new Error(`${example.name} has a problem: ${errors.map((p) => p.message).join('; ')}`);
    return {
      name: example.name,
      displayName: example.displayName,
      description: example.description,
      detailedDescription: tutorial,
      level: example.level,
      color: COLOURS[i % COLOURS.length],
      emoji: example.emoji,
      active: true,
      block: '',
      workspaceBlocks,
      workspacePosition: { scrollX: 0, scrollY: 0, scale: 0.8 },
      jscode: compiled.code,
      schedule: compiled.schedule,
      translations: translationsOf(example.name),
    };
  });
};

export const examplesJson = (examples: Example[], compile: (xml: string) => CompiledWorkspace): string =>
  JSON.stringify(storedExamples(examples, compile), null, 2) + '\n';
