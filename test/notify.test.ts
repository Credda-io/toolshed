import { describe, expect, it } from 'vitest';
import { memorySink, overdueLoans } from '../src/notify.js';
import type { Loan } from '../src/types.js';
import { utcMember } from './fixtures.js';

function loan(id: string, dueOn: string, returnedOn: string | null): Loan {
  return {
    id,
    itemId: 'TS-001',
    memberId: utcMember.id,
    checkedOutOn: '2026-06-01',
    dueOn,
    returnedOn,
    renewals: 0,
  };
}

describe('overdueLoans', () => {
  it('picks out loans past their due date', () => {
    const loans = [loan('L-1', '2026-06-15', null), loan('L-2', '2026-06-30', null)];
    expect(overdueLoans(loans, [utcMember], '2026-06-20').map((l) => l.id)).toEqual(['L-1']);
  });

  it('leaves out loans that came back', () => {
    const loans = [loan('L-1', '2026-06-15', '2026-06-18')];
    expect(overdueLoans(loans, [utcMember], '2026-06-20')).toEqual([]);
  });

  it('leaves out a loan due today', () => {
    const loans = [loan('L-1', '2026-06-20', null)];
    expect(overdueLoans(loans, [utcMember], '2026-06-20')).toEqual([]);
  });
});

describe('memorySink', () => {
  it('records what it is handed', async () => {
    const sink = memorySink();
    await sink.send({ to: 'rae@example.org', loanId: 'L-1', daysLate: 5 });
    expect(sink.sent).toHaveLength(1);
  });
});
