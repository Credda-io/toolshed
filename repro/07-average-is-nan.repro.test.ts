/**
 * Reproduction for issues/07-dashboard-shows-nan.md
 *
 * A branch that has not had a return yet has an average loan length of zero
 * days, not "NaN".
 */
import { describe, expect, it } from 'vitest';
import { averageLoanDays } from '../src/report.js';
import type { Loan } from '../src/types.js';
import { utcMember } from '../test/fixtures.js';

describe('issue 07: the average tile survives an empty branch', () => {
  it('averages an empty ledger to zero', () => {
    expect(averageLoanDays([], [utcMember])).toBe(0);
  });

  it('averages a ledger with nothing returned yet to zero', () => {
    const stillOut: Loan = {
      id: 'L-1',
      itemId: 'TS-001',
      memberId: utcMember.id,
      checkedOutOn: '2026-06-01',
      dueOn: '2026-06-15',
      returnedOn: null,
      renewals: 0,
    };
    expect(averageLoanDays([stillOut], [utcMember])).toBe(0);
  });
});
