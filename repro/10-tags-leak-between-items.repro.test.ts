/**
 * Reproduction for issues/10-tagging-one-tool-tags-all-of-them.md
 *
 * Two catalogue entries are two objects. Filing one under a tag says nothing
 * about the other.
 */
import { describe, expect, it } from 'vitest';
import { createItem, tagItem } from '../src/catalog.js';

describe('issue 10: tags belong to one item', () => {
  it('does not put a tag on an unrelated entry', () => {
    const hammer = createItem({ id: 'TS-001', name: 'claw hammer' });
    const saw = createItem({ id: 'TS-002', name: 'hand saw' });
    tagItem(hammer, 'carpentry');
    expect(saw.tags).toEqual(['uncategorised']);
  });

  it('does not put a tag on entries created afterwards', () => {
    const drill = createItem({ id: 'TS-003', name: 'cordless drill' });
    tagItem(drill, 'power');
    const level = createItem({ id: 'TS-004', name: 'spirit level' });
    expect(level.tags).not.toContain('power');
  });
});
