/**
 * Reproduction for issues/06-renewed-a-loan-nine-times.md
 *
 * The poster caps renewals at two. `POSTED_MAX_RENEWALS` is that number.
 */
import { describe, expect, it } from 'vitest';
import { createItem } from '../src/catalog.js';
import { checkout, renew, resetLoanIds } from '../src/loans.js';
import { POSTED_MAX_RENEWALS } from '../src/policy.js';
import { utcMember } from '../test/fixtures.js';

describe('issue 06: renewals are capped', () => {
  it('refuses the renewal after the cap', () => {
    resetLoanIds();
    const item = createItem({ id: 'TS-001', name: 'claw hammer' });
    const loan = checkout(item, utcMember, '2026-06-01');
    for (let i = 0; i < POSTED_MAX_RENEWALS; i += 1) {
      renew(loan, utcMember);
    }
    expect(() => renew(loan, utcMember)).toThrow(/renewals/);
  });

  it('never lets a loan run past the cap', () => {
    resetLoanIds();
    const item = createItem({ id: 'TS-002', name: 'hand saw' });
    const loan = checkout(item, utcMember, '2026-06-01');
    for (let i = 0; i < 9; i += 1) {
      try {
        renew(loan, utcMember);
      } catch {
        /* the cap is what we are measuring */
      }
    }
    expect(loan.renewals).toBe(POSTED_MAX_RENEWALS);
  });
});
