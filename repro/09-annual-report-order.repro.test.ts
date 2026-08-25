/**
 * Reproduction for issues/09-annual-report-largest-bin-wrong.md
 *
 * "What we own most of" has to be ordered by how many we own.
 */
import { describe, expect, it } from 'vitest';
import { createItem } from '../src/catalog.js';
import { copyCountsDescending } from '../src/report.js';

const shelf = [
  createItem({ id: 'TS-001', name: 'clamp', copies: 4 }),
  createItem({ id: 'TS-002', name: 'sledgehammer', copies: 10 }),
  createItem({ id: 'TS-003', name: 'chisel', copies: 9 }),
  createItem({ id: 'TS-004', name: 'router', copies: 2 }),
];

describe('issue 09: the annual report orders bins by size', () => {
  it('puts the largest bin first', () => {
    expect(copyCountsDescending(shelf)[0]).toBe(10);
  });

  it('orders every bin by size', () => {
    expect(copyCountsDescending(shelf)).toEqual([10, 9, 4, 2]);
  });
});
