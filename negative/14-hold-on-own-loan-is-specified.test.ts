/**
 * The reproduction issues/14-cannot-hold-a-tool-i-already-have.md asks for, run.
 *
 * The reported behaviour DOES occur: a hold on an item the member already has
 * out is rejected. It is not a defect. The repository's own green suite asserts
 * it on purpose -- see the commented test in test/holds.test.ts, "refuses a
 * hold on an item the member already has on loan".
 *
 * That combination is Credda's CONTRADICTS_SPECIFICATION: the behaviour
 * reproduced, and the specification says it is correct. Neither green nor red;
 * it goes to a human, because if the reported behaviour is wrong then the
 * specification is wrong too, and no tool gets to decide that.
 */
import { describe, expect, it } from 'vitest';
import { placeHold } from '../src/holds.js';
import { ToolshedError, type Hold, type Loan } from '../src/types.js';
import { utcMember } from '../test/fixtures.js';

const openLoan: Loan = {
  id: 'L-1',
  itemId: 'TS-001',
  memberId: utcMember.id,
  checkedOutOn: '2026-06-01',
  dueOn: '2026-06-15',
  returnedOn: null,
  renewals: 0,
};

describe('issue 14: the reported behaviour occurs, and is specified', () => {
  it('rejects a hold on an item the member already has on loan', () => {
    const holds: Hold[] = [];
    let rejected: unknown = null;
    try {
      placeHold(holds, [openLoan], utcMember, 'TS-001', 100);
    } catch (error) {
      rejected = error;
    }

    expect(rejected).toBeInstanceOf(ToolshedError);
    expect((rejected as ToolshedError).code).toBe('HOLD_ON_OWN_LOAN');
  });
});
