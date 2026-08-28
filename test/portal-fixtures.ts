import type { Hold, Item, Loan, Member } from '../src/types.js';
import type { PortalData } from '../src/portal.js';
import { nyMember, utcMember } from './fixtures.js';

export const portalItems: Item[] = [
  { id: 'TS-001', name: 'Hammer, claw', tags: ['hand', 'carpentry'], copies: 6, available: 5 },
  { id: 'TS-002', name: 'Circular saw', tags: ['power', 'carpentry'], copies: 2, available: 0 },
];

export const portalLoans: Loan[] = [
  {
    id: 'L-00001',
    itemId: 'TS-002',
    memberId: nyMember.id,
    checkedOutOn: '2026-06-01',
    dueOn: '2026-06-15',
    returnedOn: null,
    renewals: 0,
  },
];

export const portalHolds: Hold[] = [
  { itemId: 'TS-002', memberId: utcMember.id, placedAt: 100 },
];

export const portalMembers: readonly Member[] = [utcMember, nyMember];

/** `utcMember` is signed in; nobody else is. */
export const portalData: PortalData = {
  members: portalMembers,
  items: portalItems,
  loans: portalLoans,
  holds: portalHolds,
  sessions: new Map([['session-for-rae', utcMember.id]]),
};

export const signedInRequest = (path: string, query: Record<string, string> = {}) => ({
  path,
  query,
  sessionToken: 'session-for-rae',
});
