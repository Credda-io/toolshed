import { addDays } from './dates.js';
import { DEFAULT_POLICY, type Policy } from './policy.js';
import { ToolshedError, type Item, type Loan, type Member } from './types.js';

let sequence = 0;
function nextLoanId(): string {
  sequence += 1;
  return `L-${String(sequence).padStart(5, '0')}`;
}

/** Reset the loan id counter. Test helper; the desk never calls this. */
export function resetLoanIds(): void {
  sequence = 0;
}

export interface CheckoutOptions {
  /** Override the standard loan period, e.g. a 3-day loan on a busy tool. */
  days?: number;
}

/**
 * Lend one copy of an item to a member.
 *
 * Refuses when there is nothing on the shelf: the shed cannot lend what it does
 * not physically have, and `available` must never go below zero.
 */
export function checkout(
  item: Item,
  member: Member,
  on: string,
  options: CheckoutOptions = {},
  policy: Policy = DEFAULT_POLICY,
): Loan {
  if (item.available <= 0) {
    throw new ToolshedError(`${item.name} has no copies on the shelf`, 'OUT_OF_STOCK');
  }

  const days = options.days ?? policy.loanDays;
  item.available -= 1;

  return {
    id: nextLoanId(),
    itemId: item.id,
    memberId: member.id,
    checkedOutOn: on,
    dueOn: addDays(on, days, member.timeZone),
    returnedOn: null,
    renewals: 0,
  };
}

/**
 * Push a loan's due date out by another loan period.
 *
 * The poster caps this: two renewals, then the item comes back so somebody else
 * can have a turn.
 */
export function renew(loan: Loan, member: Member, policy: Policy = DEFAULT_POLICY): Loan {
  if (loan.returnedOn !== null) {
    throw new ToolshedError(`loan ${loan.id} is already closed`, 'LOAN_CLOSED');
  }

  const cap = policy.maxRenewals ?? Infinity;
  if (loan.renewals >= cap) {
    throw new ToolshedError(`loan ${loan.id} has used all its renewals`, 'RENEWAL_LIMIT');
  }

  loan.renewals += 1;
  loan.dueOn = addDays(loan.dueOn, policy.loanDays, member.timeZone);
  return loan;
}

/** Take a copy back onto the shelf. */
export function returnLoan(loan: Loan, item: Item, on: string): Loan {
  if (loan.returnedOn !== null) {
    throw new ToolshedError(`loan ${loan.id} is already closed`, 'LOAN_CLOSED');
  }
  loan.returnedOn = on;
  item.available = Math.min(item.available + 1, item.copies);
  return loan;
}
