import { describe, expect, it } from 'vitest';
import { parseInventory } from '../src/csv.js';

describe('parseInventory', () => {
  it('reads a plain export', () => {
    const rows = parseInventory(['id,name,tags,copies', 'TS-001,Claw hammer,hand;carpentry,6'].join('\n'));
    expect(rows).toEqual([{ id: 'TS-001', name: 'Claw hammer', tags: ['hand', 'carpentry'], copies: 6 }]);
  });

  it('ignores blank lines and trailing newlines', () => {
    const rows = parseInventory('id,name,tags,copies\nTS-001,Clamp,hand,2\n\n');
    expect(rows).toHaveLength(1);
  });

  it('returns nothing for an empty file', () => {
    expect(parseInventory('')).toEqual([]);
  });

  it('returns nothing for a header with no rows', () => {
    expect(parseInventory('id,name,tags,copies')).toEqual([]);
  });
});
