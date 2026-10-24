// The code the blocks generate must match the code v1 saved with each workspace. These tests load the saved
// Blockly XML, generate the code again, and compare it with the saved jscode.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateCode } from './setup';
import templates from '../domain/templates.json';

const fixture = (name: string) => JSON.parse(readFileSync(join(__dirname, '../test/fixtures', name), 'utf8'));

describe('generated code matches the code saved by v1', () => {
  const example = fixture('retrieve-data-example.wsp')[0];

  it('Retrieve Data Example (a .wsp file from v1)', () => {
    expect(generateCode(example.workspaceBlocks)).toBe(example.jscode);
  });

  it('the search workspace (a .wsp file made for this plugin)', () => {
    const search = fixture('search-notes-test.wsp')[0];
    const code = generateCode(search.workspaceBlocks);
    // the generator quotes a text value with single quotes and wraps the pickers in brackets, as v1 did
    expect(code).toContain(`fetchPeriodValue('gratitude',("LAST7DAYS"),("sum"))`);
    expect(code).toContain(`fetchPeriodValue('walk',("LAST30DAYS"),("sum"))`);
  });

  it('template: Retrieve Statistics Example', () => {
    const template = templates.find((t) => t.displayName === 'Retrieve Statistics Example')!;
    expect(generateCode(template.workspaceBlocks)).toBe(template.jscode);
  });

  it('template: Retrieve Data Example', () => {
    const template = templates.find((t) => t.displayName === 'Retrieve Data Example')!;
    expect(generateCode(template.workspaceBlocks)).toBe(template.jscode);
  });

  it('template: Get Temperature (uses the generic JavaScript blocks)', () => {
    const template = templates.find((t) => t.displayName === 'Retrieve Temperature')!;
    expect(generateCode(template.workspaceBlocks)).toBe(template.jscode);
  });

  // The saved jscode of this template was typed by hand and does not match its blocks (v1 never regenerated it).
  // The blocks are the source, so the test checks the generated variable and the sum, not the old text.
  it('template: Kick Start generates from its blocks', () => {
    const template = templates.find((t) => t.displayName === 'Kick Start')!;
    expect(generateCode(template.workspaceBlocks)).toContain('Meaning_of_Life = 40 + 2;');
  });
});
