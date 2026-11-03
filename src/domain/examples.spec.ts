// The example library (the examples.json the Add screen lists): each example compiles without a problem, its stored code
// is the code of its blocks, it runs unless it needs a secret, the network, a location or a prompt, and every block of
// the palette is in at least one example. Run `WRITE_EXAMPLES=1 npx vitest run src/domain/examples.spec.ts` to rebuild
// examples.json after a change to the library.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXAMPLES } from './example-library';
import { examplesJson } from './examples-build';
import { exampleWorkspaces } from './workspace';
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

type Stored = { name: string; displayName: string; detailedDescription: string; workspaceBlocks: string; jscode: string; schedule: string };
const stored = JSON.parse(readFileSync(FILE, 'utf8')) as Stored[];

describe('the example library', () => {
  it('examples.json is the library as it is built (run the rebuild command after a change)', () => {
    expect(readFileSync(FILE, 'utf8')).toBe(fresh);
  });

  it('has at least 25 examples, each with a name, a card line and a tutorial', () => {
    expect(stored.length).toBeGreaterThanOrEqual(25);
    for (const example of stored) {
      expect(example.displayName, example.name).toMatch(/^Example: /);
      expect(example.detailedDescription.length, `${example.name} tutorial`).toBeGreaterThan(250);
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
