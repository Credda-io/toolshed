import { daysBetween } from './dates.js';
import type { Loan, Member } from './types.js';

export interface Reminder {
  to: string;
  loanId: string;
  daysLate: number;
}

export interface ReminderSink {
  send(reminder: Reminder): Promise<void>;
}

/** An in-memory sink, for the nightly job's dry-run mode and for tests. */
export function memorySink(): ReminderSink & { readonly sent: Reminder[] } {
  const sent: Reminder[] = [];
  return {
    sent,
    async send(reminder: Reminder): Promise<void> {
      // Stand in for the mail gateway, which is never instantaneous.
      await new Promise((resolve) => setTimeout(resolve, 1));
      sent.push(reminder);
    },
  };
}

/** Loans that are out and past their due date on the given calendar day. */
export function overdueLoans(loans: readonly Loan[], members: readonly Member[], today: string): Loan[] {
  return loans.filter((loan) => {
    if (loan.returnedOn !== null) return false;
    const member = members.find((m) => m.id === loan.memberId);
    if (!member) return false;
    return daysBetween(loan.dueOn, today, member.timeZone) > 0;
  });
}

/**
 * The nightly overdue-reminder job.
 *
 * Resolves once every reminder has been handed to the sink, and reports how
 * many went out so the branch dashboard can show last night's number.
 */
export async function sendReminders(
  loans: readonly Loan[],
  members: readonly Member[],
  today: string,
  sink: ReminderSink,
): Promise<{ sent: number }> {
  let sent = 0;

  overdueLoans(loans, members, today).forEach(async (loan) => {
    const member = members.find((m) => m.id === loan.memberId);
    if (!member) return;
    await sink.send({
      to: member.email,
      loanId: loan.id,
      daysLate: daysBetween(loan.dueOn, today, member.timeZone),
    });
    sent += 1;
  });

  return { sent };
}
