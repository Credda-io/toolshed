/**
 * Reproduction for issues/05-nightly-reminders-report-zero.md
 *
 * `sendReminders` promises to resolve once the reminders have gone out, and to
 * report how many did.
 */
import { describe, expect, it } from 'vitest';
import { memorySink, sendReminders } from '../src/notify.js';
import type { Loan } from '../src/types.js';
import { utcMember } from '../test/fixtures.js';

function overdue(id: string): Loan {
  return {
    id,
    itemId: 'TS-001',
    memberId: utcMember.id,
    checkedOutOn: '2026-06-01',
    dueOn: '2026-06-15',
    returnedOn: null,
    renewals: 0,
  };
}

describe('issue 05: the nightly job reports what it sent', () => {
  it('counts the reminders it sent', async () => {
    const sink = memorySink();
    const result = await sendReminders([overdue('L-1'), overdue('L-2'), overdue('L-3')], [utcMember], '2026-06-20', sink);
    expect(result.sent).toBe(3);
  });

  it('resolves only once the sink has them', async () => {
    const sink = memorySink();
    await sendReminders([overdue('L-1'), overdue('L-2'), overdue('L-3')], [utcMember], '2026-06-20', sink);
    expect(sink.sent).toHaveLength(3);
  });
});
