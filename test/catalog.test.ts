import { describe, expect, it } from 'vitest';
import { createItem, findAvailable, requireItem, search } from '../src/catalog.js';
import { ToolshedError } from '../src/types.js';

describe('catalog', () => {
  it('gives a new entry one copy, on the shelf', () => {
    const item = createItem({ id: 'TS-001', name: 'claw hammer' });
    expect(item.copies).toBe(1);
    expect(item.available).toBe(1);
  });

  it('finds an item by a lowercase word in its name', () => {
    const items = [createItem({ id: 'TS-001', name: 'claw hammer' }), createItem({ id: 'TS-002', name: 'hand saw' })];
    expect(search(items, 'hammer').map((i) => i.id)).toEqual(['TS-001']);
  });

  it('finds an item by tag', () => {
    const items = [createItem({ id: 'TS-003', name: 'pipe cutter', tags: ['plumbing'] })];
    expect(search(items, 'plumbing')).toHaveLength(1);
  });

  it('returns everything for an empty query', () => {
    const items = [createItem({ id: 'TS-001', name: 'a' }), createItem({ id: 'TS-002', name: 'b' })];
    expect(search(items, '   ')).toHaveLength(2);
  });

  it('lists only what is on the shelf', () => {
    const out = createItem({ id: 'TS-004', name: 'router', copies: 2 });
    out.available = 0;
    expect(findAvailable([out, createItem({ id: 'TS-005', name: 'clamp' })]).map((i) => i.id)).toEqual(['TS-005']);
  });

  it('refuses an unknown catalogue id', () => {
    expect(() => requireItem([], 'TS-999')).toThrow(ToolshedError);
  });
});
