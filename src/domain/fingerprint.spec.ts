// The fingerprint says which blocks a stored code was compiled from (phase 16). Any change to the blocks changes it.
import { describe, expect, it } from 'vitest';
import { fingerprint, GENERATOR_VERSION } from './fingerprint';

describe('the fingerprint of a workspace', () => {
  it('is the same for the same blocks, and different when a block changes', () => {
    expect(fingerprint('<xml><block type="text"/></xml>')).toBe(fingerprint('<xml><block type="text"/></xml>'));
    expect(fingerprint('<xml><block type="text"/></xml>')).not.toBe(fingerprint('<xml><block type="math_number"/></xml>'));
  });

  it('names the generator version it was made with', () => {
    expect(GENERATOR_VERSION).toMatch(/^\d+$/);
    expect(fingerprint('x')).toContain(GENERATOR_VERSION);
  });
});
