import { daysBetween } from './dates.js';
import type { Item, Loan, Member } from './types.js';

/**
 * How long the average returned loan actually lasted, in days.
 *
 * A branch with no returns yet has an average of zero, which is what the
 * dashboard tile prints on its first day.
 */
export function averageLoanDays(loans: readonly Loan[], members: readonly Member[]): number {
  const closed = loans.filter((loan) => loan.returnedOn !== null);

  const total = closed.reduce((sum, loan) => {
    const member = members.find((m) => m.id === loan.memberId);
    const zone = member?.timeZone ?? 'UTC';
    return sum + daysBetween(loan.checkedOutOn, loan.returnedOn as string, zone);
  }, 0);

  return total / closed.length;
}

/**
 * Copy counts across the shelf, largest bin first, for the annual report's
 * "what we own most of" table.
 */
export function copyCountsDescending(items: readonly Item[]): number[] {
  return items.map((item) => item.copies).sort().reverse();
}

/** How many loans each member took out, for the noticeboard leaderboard. */
export function loanCounts(loans: readonly Loan[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const loan of loans) {
    counts.set(loan.memberId, (counts.get(loan.memberId) ?? 0) + 1);
  }
  return counts;
}

/** Loans still out on a given calendar day. */
export function stillOut(loans: readonly Loan[]): Loan[] {
  return loans.filter((loan) => loan.returnedOn === null);
}
