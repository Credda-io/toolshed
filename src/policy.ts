/**
 * The lending rules, in one place, so a branch can print them on a poster.
 *
 * These values are the specification. If code and poster disagree, the poster
 * is right.
 */

export interface Policy {
  /** Days an item is lent for when the desk does not pick a shorter period. */
  loanDays: number;
  /** How many times one loan may be renewed before the item must come back. */
  maxRenewals?: number;
  /** How many items one member may have on hold at once. */
  maxHolds: number;
  /** Charged per calendar day, after the grace period, in dollars. */
  lateFeePerDay: number;
  /** Days late that are forgiven entirely. */
  graceDays: number;
  /** A member owing more than this may not take anything else out. */
  borrowingBlockedOver: number;
}

export const DEFAULT_POLICY: Policy = {
  loanDays: 14,
  maxHolds: 3,
  lateFeePerDay: 0.35,
  graceDays: 2,
  borrowingBlockedOver: 10,
};

/** The renewal cap the poster states. Two renewals, then it comes back. */
export const POSTED_MAX_RENEWALS = 2;
