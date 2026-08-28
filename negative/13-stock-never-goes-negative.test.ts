/**
 * The reproduction issues/13-stock-goes-negative.md asks for, run.
 *
 * The report says checking out the last copy twice drives `available` to -1.
 * This file asserts exactly that, and the assertion does not hold: the second
 * checkout is refused and the count stays at zero. Nothing is wrong with the
 * repository, and a run that establishes that is a success -- it is what
 * Credda calls NO_CHANGE_REQUIRED.
 */
import { describe, expect, it } from 'vitest';
import { createItem } from '../src/catalog.js';
import { checkout, resetLoanIds } from '../src/loans.js';
import { ToolshedError } from '../src/types.js';
import { utcMember } from '../test/fixtures.js';

describe('issue 13: the reported failure does not occur', () => {
  it('does not drive the shelf count below zero', () => {
    resetLoanIds();
    const item = createItem({ id: 'TS-001', name: 'claw hammer', copies: 1 });
    checkout(item, utcMember, '2026-06-01');

    let refused: unknown = null;
    try {
      checkout(item, utcMember, '2026-06-01');
    } catch (error) {
      refused = error;
    }

    expect(refused).toBeInstanceOf(ToolshedError);
    expect((refused as ToolshedError).code).toBe('OUT_OF_STOCK');
    expect(item.available).toBe(0);
    expect(item.available).toBeGreaterThanOrEqual(0);
  });
});
