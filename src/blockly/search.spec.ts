// The block search finds blocks by the words on them, their type and their category.
import { describe, expect, it } from 'vitest';
import { indexBlocks, searchBlocks, searchContents } from './search';
import { toolbox } from './toolbox';

const entries = indexBlocks(toolbox() as never);
const types = (query: string) => searchBlocks(entries, query).map((item) => (item as { type?: string }).type);

describe('the block search', () => {
  it('finds the Nomie blocks by the words on them', () => {
    expect(types('fetch')).toEqual(['s4e_dayvalue', 's4e_periodvalue', 's4e_httprequest']);
    expect(types('log value')).toContain('s4e_logvalue');
  });

  it('finds blocks by their category', () => {
    expect(types('objects').length).toBeGreaterThanOrEqual(7);
  });

  it('needs every word of the query', () => {
    expect(types('fetch period')).toEqual(['s4e_periodvalue']);
  });

  it('shows a hint for an empty query, and says when nothing matches', () => {
    expect(searchContents(entries, '  ').map((i) => (i as { text?: string }).text)).toContain('Type to search all blocks');
    expect(searchContents(entries, 'zzz').map((i) => (i as { text?: string }).text)).toContain('No blocks match "zzz"');
  });

  it('leaves room at the top of the drawer for the search field', () => {
    expect(searchContents(entries, 'fetch')[0]).toMatchObject({ kind: 'sep' });
  });
});
