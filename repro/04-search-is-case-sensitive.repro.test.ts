/**
 * Reproduction for issues/04-searching-hammer-finds-nothing.md
 *
 * The shelf browser is supposed to ignore case in both directions: the label
 * says "Claw hammer", the member types "hammer".
 */
import { describe, expect, it } from 'vitest';
import { createItem, search } from '../src/catalog.js';

const shelf = [
  createItem({ id: 'TS-001', name: 'Hammer, claw', tags: ['Hand', 'Carpentry'] }),
  createItem({ id: 'TS-002', name: 'Saw, hand', tags: ['Hand'] }),
];

describe('issue 04: search ignores case', () => {
  it('finds a capitalised name from a lowercase query', () => {
    expect(search(shelf, 'hammer').map((i) => i.id)).toEqual(['TS-001']);
  });

  it('finds a capitalised tag from a lowercase query', () => {
    expect(search(shelf, 'carpentry').map((i) => i.id)).toEqual(['TS-001']);
  });
});
