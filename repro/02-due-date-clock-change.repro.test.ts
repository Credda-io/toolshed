/**
 * Reproduction for issues/02-due-date-a-day-early-in-november.md
 *
 * A 14-day loan taken out on 25 October at a branch that changes its clocks is
 * due back on 8 November, the same as everywhere else. The clock change is not
 * a day.
 */
import { describe, expect, it } from 'vitest';
import { createItem } from '../src/catalog.js';
import { checkout, resetLoanIds } from '../src/loans.js';
import { addDays } from '../src/dates.js';
import { nyMember } from '../test/fixtures.js';

describe('issue 02: due dates survive a clock change', () => {
  it('adds 14 calendar days across the November change', () => {
    expect(addDays('2026-10-25', 14, 'America/New_York')).toBe('2026-11-08');
  });

  it('gives the same due date as a UTC branch', () => {
    resetLoanIds();
    const item = createItem({ id: 'TS-001', name: 'claw hammer' });
    const loan = checkout(item, nyMember, '2026-10-25');
    expect(loan.dueOn).toBe('2026-11-08');
  });
});
