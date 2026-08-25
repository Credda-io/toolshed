import { describe, expect, it } from 'vitest';
import { feeForLoan, isBorrowingBlocked, lateFee } from '../src/fees.js';
import type { Loan } from '../src/types.js';
import { utcMember } from './fixtures.js';

describe('fees', () => {
  it('forgives a return inside the grace period', () => {
    expect(lateFee(2)).toBe(0);
    expect(lateFee(0)).toBe(0);
  });

  it('charges per day after the grace period', () => {
    // 7 days late, 2 forgiven, 5 chargeable at 35c.
    expect(lateFee(7)).toBe(1.75);
  });

  it('charges nothing on a loan that is still out', () => {
    const loan: Loan = {
      id: 'L-1',
      itemId: 'TS-001',
      memberId: utcMember.id,
      checkedOutOn: '2026-06-01',
      dueOn: '2026-06-15',
      returnedOn: null,
      renewals: 0,
    };
    expect(feeForLoan(loan, utcMember)).toBe(0);
  });

  it('charges nothing on an on-time return', () => {
    const loan: Loan = {
      id: 'L-2',
      itemId: 'TS-001',
      memberId: utcMember.id,
      checkedOutOn: '2026-06-01',
      dueOn: '2026-06-15',
      returnedOn: '2026-06-15',
      renewals: 0,
    };
    expect(feeForLoan(loan, utcMember)).toBe(0);
  });

  it('blocks borrowing only above the posted balance', () => {
    expect(isBorrowingBlocked(10)).toBe(false);
    expect(isBorrowingBlocked(10.35)).toBe(true);
  });
});
