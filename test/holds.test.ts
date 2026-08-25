import { describe, expect, it } from 'vitest';
import { placeHold, positionOf, queueFor, releaseHold } from '../src/holds.js';
import type { Hold, Loan } from '../src/types.js';
import { nyMember, utcMember } from './fixtures.js';

function openLoan(memberId: string, itemId: string): Loan {
  return {
    id: `L-${memberId}-${itemId}`,
    itemId,
    memberId,
    checkedOutOn: '2026-06-01',
    dueOn: '2026-06-15',
    returnedOn: null,
    renewals: 0,
  };
}

describe('holds', () => {
  it('queues holds oldest first', () => {
    const holds: Hold[] = [];
    placeHold(holds, [], nyMember, 'TS-001', 200);
    placeHold(holds, [], utcMember, 'TS-001', 100);
    expect(queueFor(holds, 'TS-001').map((h) => h.memberId)).toEqual([utcMember.id, nyMember.id]);
  });

  it('numbers the queue from one', () => {
    const holds: Hold[] = [];
    placeHold(holds, [], utcMember, 'TS-001', 100);
    placeHold(holds, [], nyMember, 'TS-001', 200);
    expect(positionOf(holds, 'TS-001', utcMember.id)).toBe(1);
    expect(positionOf(holds, 'TS-001', nyMember.id)).toBe(2);
    expect(positionOf(holds, 'TS-001', 'M-999')).toBe(0);
  });

  it('refuses the same hold twice', () => {
    const holds: Hold[] = [];
    placeHold(holds, [], utcMember, 'TS-001', 100);
    expect(() => placeHold(holds, [], utcMember, 'TS-001', 101)).toThrow(/already holds/);
  });

  /*
   * POSTED RULE, and it is the one members are most often surprised by:
   * you cannot hold a tool you currently have out. A hold would put you in a
   * queue behind your own loan and would never come up; renewing is the thing
   * that actually extends your turn. The desk says this out loud, and this test
   * is what says it in code.
   */
  it('refuses a hold on an item the member already has on loan', () => {
    const holds: Hold[] = [];
    const loans = [openLoan(utcMember.id, 'TS-001')];
    expect(() => placeHold(holds, loans, utcMember, 'TS-001', 100)).toThrow(/renew it instead/);
    expect(holds).toHaveLength(0);
  });

  it('lets a member hold an item somebody else has out', () => {
    const holds: Hold[] = [];
    const loans = [openLoan(nyMember.id, 'TS-001')];
    expect(() => placeHold(holds, loans, utcMember, 'TS-001', 100)).not.toThrow();
  });

  it('drops a hold once the item is collected', () => {
    const holds: Hold[] = [];
    placeHold(holds, [], utcMember, 'TS-001', 100);
    releaseHold(holds, 'TS-001', utcMember.id);
    expect(holds).toHaveLength(0);
  });
});
