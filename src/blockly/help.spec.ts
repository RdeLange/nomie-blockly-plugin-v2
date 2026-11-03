// Every block of the Nomie category says what it does, in one sentence, with an example (phase 18).
import { describe, expect, it } from 'vitest';
import * as Blockly from 'blockly';
import { setupBlockly } from './setup';
import { toolbox, NOMIE_CATEGORY } from './toolbox';

type Item = { kind?: string; type?: string };
const nomieTypes = (): string[] => {
  const category = (toolbox() as unknown as { contents: Array<{ name?: string; contents?: Item[] }> }).contents.find(
    (c) => c.name === NOMIE_CATEGORY
  );
  return (category?.contents ?? []).filter((item) => item.kind === 'block' && item.type).map((item) => item.type as string);
};

describe('the help of the Nomie blocks', () => {
  setupBlockly();
  const types = nomieTypes();

  it('the category has blocks', () => {
    expect(types.length).toBeGreaterThan(20);
  });

  for (const type of types) {
    it(`${type} has a tooltip with an example`, () => {
      const workspace = new Blockly.Workspace();
      try {
        const block = workspace.newBlock(type);
        const tip = String(block.tooltip ?? '');
        expect(tip.length).toBeGreaterThan(40);
        expect(tip).toContain('Example:');
      } finally {
        workspace.dispose();
      }
    });
  }
});
