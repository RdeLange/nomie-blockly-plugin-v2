// The stored form of the example library: the XML of each example, the code its blocks compile to, and its schedule.
// Used by the build script and by the test that checks examples.json is up to date.
import { workspaceXml } from './example-xml';
import type { Example } from './example-library';
import type { CompiledWorkspace } from '../blockly/compile';

const COLOURS = ['#E3F2FD', '#FDF0A4', '#C47ADA', '#EC9740', '#5E7ABC', '#34C759', '#FF3B30'];

export type StoredExample = {
  name: string;
  displayName: string;
  description: string;
  detailedDescription: string;
  color: string;
  emoji: string;
  active: true;
  block: string;
  workspaceBlocks: string;
  workspacePosition: { scrollX: number; scrollY: number; scale: number };
  jscode: string;
  schedule: 'none' | 'daily';
};

export const storedExamples = (examples: Example[], compile: (xml: string) => CompiledWorkspace): StoredExample[] => {
  const names = new Set<string>();
  return examples.map((example, i) => {
    if (names.has(example.name)) throw new Error(`Two examples are named ${example.name}`);
    names.add(example.name);
    const workspaceBlocks = workspaceXml(example.blocks, example.variables ?? []);
    const compiled = compile(workspaceBlocks);
    const errors = compiled.problems.filter((p) => p.level === 'error');
    if (errors.length) throw new Error(`${example.name} has a problem: ${errors.map((p) => p.message).join('; ')}`);
    return {
      name: example.name,
      displayName: example.displayName,
      description: example.description,
      detailedDescription: example.detailedDescription,
      color: COLOURS[i % COLOURS.length],
      emoji: example.emoji,
      active: true,
      block: '',
      workspaceBlocks,
      workspacePosition: { scrollX: 0, scrollY: 0, scale: 0.8 },
      jscode: compiled.code,
      schedule: compiled.schedule,
    };
  });
};

export const examplesJson = (examples: Example[], compile: (xml: string) => CompiledWorkspace): string =>
  JSON.stringify(storedExamples(examples, compile), null, 2) + '\n';
