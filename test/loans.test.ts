import { beforeEach, describe, expect, it } from 'vitest';
import { createItem } from '../src/catalog.js';
import { checkout, renew, resetLoanIds, returnLoan } from '../src/loans.js';
import { ToolshedError } from '../src/types.js';
import { utcMember } from './fixtures.js';

beforeEach(() => resetLoanIds());

describe('loans', () => {
  it('takes a copy off the shelf', () => {
    const item = createItem({ id: 'TS-001', name: 'claw hammer', copies: 2 });
    checkout(item, utcMember, '2026-06-01');
    expect(item.available).toBe(1);
  });

  it('uses the standard loan period when the desk does not pick one', () => {
    const item = createItem({ id: 'TS-001', name: 'claw hammer' });
    const loan = checkout(item, utcMember, '2026-06-01');
    expect(loan.dueOn).toBe('2026-06-15');
  });

  it('honours a shorter loan period', () => {
    const item = createItem({ id: 'TS-001', name: 'claw hammer' });
    const loan = checkout(item, utcMember, '2026-06-01', { days: 3 });
    expect(loan.dueOn).toBe('2026-06-04');
  });

  /*
   * The shed cannot lend a tool it does not physically have. `available` is a
   * count of objects on a shelf, and a negative one would mean somebody walked
   * out with a hammer that does not exist.
   */
  it('refuses to lend an item with nothing on the shelf', () => {
    const item = createItem({ id: 'TS-001', name: 'claw hammer', copies: 1 });
    checkout(item, utcMember, '2026-06-01');
    expect(item.available).toBe(0);
    expect(() => checkout(item, utcMember, '2026-06-02')).toThrow(ToolshedError);
    expect(item.available).toBe(0);
  });

  it('puts the copy back when the item comes home', () => {
    const item = createItem({ id: 'TS-001', name: 'claw hammer' });
    const loan = checkout(item, utcMember, '2026-06-01');
    returnLoan(loan, item, '2026-06-10');
    expect(item.available).toBe(1);
    expect(loan.returnedOn).toBe('2026-06-10');
  });

  it('refuses to renew a loan that is already closed', () => {
    const item = createItem({ id: 'TS-001', name: 'claw hammer' });
    const loan = checkout(item, utcMember, '2026-06-01');
    returnLoan(loan, item, '2026-06-10');
    expect(() => renew(loan, utcMember)).toThrow(ToolshedError);
  });

  it('pushes the due date out by a loan period on renewal', () => {
    const item = createItem({ id: 'TS-001', name: 'claw hammer' });
    const loan = checkout(item, utcMember, '2026-06-01');
    renew(loan, utcMember);
    expect(loan.dueOn).toBe('2026-06-29');
    expect(loan.renewals).toBe(1);
  });
});
