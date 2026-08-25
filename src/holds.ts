import { DEFAULT_POLICY, type Policy } from './policy.js';
import { ToolshedError, type Hold, type Loan, type Member } from './types.js';

/**
 * Put a member in the queue for an item.
 *
 * Two rules, both from the poster:
 *
 *  1. A member may hold at most `maxHolds` items at once, so one person cannot
 *     reserve the whole shed.
 *  2. A member who already has that item on loan may not also hold it. Holding
 *     your own loan puts you behind yourself in the queue, and the renewal is
 *     what you actually want. This one surprises people and is deliberate.
 */
export function placeHold(
  holds: Hold[],
  loans: readonly Loan[],
  member: Member,
  itemId: string,
  placedAt: number,
  policy: Policy = DEFAULT_POLICY,
): Hold {
  const alreadyOnLoan = loans.some(
    (loan) => loan.memberId === member.id && loan.itemId === itemId && loan.returnedOn === null,
  );
  if (alreadyOnLoan) {
    throw new ToolshedError(
      `${member.name} already has ${itemId} on loan -- renew it instead of holding it`,
      'HOLD_ON_OWN_LOAN',
    );
  }

  const mine = holds.filter((hold) => hold.memberId === member.id);
  if (mine.length > policy.maxHolds) {
    throw new ToolshedError(`${member.name} already has ${policy.maxHolds} holds`, 'HOLD_LIMIT');
  }

  if (holds.some((hold) => hold.memberId === member.id && hold.itemId === itemId)) {
    throw new ToolshedError(`${member.name} already holds ${itemId}`, 'DUPLICATE_HOLD');
  }

  const hold: Hold = { itemId, memberId: member.id, placedAt };
  holds.push(hold);
  return hold;
}

/** The queue for one item, oldest hold first. */
export function queueFor(holds: readonly Hold[], itemId: string): Hold[] {
  return holds.filter((hold) => hold.itemId === itemId).sort((a, b) => a.placedAt - b.placedAt);
}

/** Where a member stands in an item's queue. 1 is next. 0 means not queued. */
export function positionOf(holds: readonly Hold[], itemId: string, memberId: string): number {
  const index = queueFor(holds, itemId).findIndex((hold) => hold.memberId === memberId);
  return index === -1 ? 0 : index + 1;
}

/** Drop a member's hold once they have the item in hand. */
export function releaseHold(holds: Hold[], itemId: string, memberId: string): void {
  const index = holds.findIndex((hold) => hold.itemId === itemId && hold.memberId === memberId);
  if (index !== -1) holds.splice(index, 1);
}
