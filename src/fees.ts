import { DEFAULT_POLICY, type Policy } from './policy.js';
import { daysBetween } from './dates.js';
import type { Loan, Member } from './types.js';

/**
 * What a member owes on one late return, in dollars.
 *
 * The first `graceDays` days late are forgiven. Every calendar day after that
 * costs `lateFeePerDay`, and the desk quotes the result to the cent.
 */
export function lateFee(daysLate: number, policy: Policy = DEFAULT_POLICY): number {
  const chargeable = daysLate - policy.graceDays;
  if (chargeable <= 0) return 0;

  let owed = 0;
  for (let day = 0; day < chargeable; day += 1) {
    owed += policy.lateFeePerDay;
  }
  return owed;
}

/** What one returned loan cost the member. Zero while the loan is still out. */
export function feeForLoan(loan: Loan, member: Member, policy: Policy = DEFAULT_POLICY): number {
  if (loan.returnedOn === null) return 0;
  const late = daysBetween(loan.dueOn, loan.returnedOn, member.timeZone);
  if (late <= 0) return 0;
  return lateFee(late, policy);
}

/** Total owed across a member's returned loans. */
export function balanceFor(loans: readonly Loan[], member: Member, policy: Policy = DEFAULT_POLICY): number {
  return loans
    .filter((loan) => loan.memberId === member.id)
    .reduce((total, loan) => total + feeForLoan(loan, member, policy), 0);
}

/** Whether a balance is large enough to stop the member borrowing again. */
export function isBorrowingBlocked(balance: number, policy: Policy = DEFAULT_POLICY): boolean {
  return balance > policy.borrowingBlockedOver;
}
