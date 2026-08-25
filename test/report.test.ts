import { describe, expect, it } from 'vitest';
import { averageLoanDays, loanCounts, stillOut } from '../src/report.js';
import type { Loan } from '../src/types.js';
import { utcMember } from './fixtures.js';

function loan(id: string, checkedOutOn: string, returnedOn: string | null): Loan {
  return {
    id,
    itemId: 'TS-001',
    memberId: utcMember.id,
    checkedOutOn,
    dueOn: '2026-06-15',
    returnedOn,
    renewals: 0,
  };
}

describe('report', () => {
  it('averages the loans that came back', () => {
    const loans = [loan('L-1', '2026-06-01', '2026-06-05'), loan('L-2', '2026-06-01', '2026-06-11')];
    expect(averageLoanDays(loans, [utcMember])).toBe(7);
  });

  it('ignores loans that are still out when averaging', () => {
    const loans = [loan('L-1', '2026-06-01', '2026-06-05'), loan('L-2', '2026-06-01', null)];
    expect(averageLoanDays(loans, [utcMember])).toBe(4);
  });

  it('counts loans per member', () => {
    const loans = [loan('L-1', '2026-06-01', null), loan('L-2', '2026-06-02', null)];
    expect(loanCounts(loans).get(utcMember.id)).toBe(2);
  });

  it('lists what is still out', () => {
    const loans = [loan('L-1', '2026-06-01', '2026-06-05'), loan('L-2', '2026-06-02', null)];
    expect(stillOut(loans).map((l) => l.id)).toEqual(['L-2']);
  });
});
