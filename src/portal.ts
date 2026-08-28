/**
 * The member self-service portal, as request handlers.
 *
 * Members look up their own loans, browse the shelf and see where they stand in
 * a queue, without queueing at the desk. There is no server in this repository:
 * a handler takes a plain `PortalRequest` record and returns a plain
 * `PortalResponse`, so the routing, the sockets and the TLS are somebody else's
 * problem and the behaviour is testable without any of them.
 *
 * FOUR OF THE SEEDED DEFECTS LIVE IN THIS FILE AND ARE EXPLOITABLE. They are
 * listed in ../SEEDED.md with the reports that describe them. This module is
 * here because a lending library that only gets arithmetic wrong is a thin
 * exhibit: Credda looks for security risks as well as bugs, and a corpus with
 * no reachable vulnerability in it cannot show that half of the work.
 *
 * As with everything in `src/`, do not copy any of it.
 */

import { requireItem } from './catalog.js';
import { ToolshedError, type Hold, type Item, type Loan, type Member } from './types.js';
import { positionOf, queueFor } from './holds.js';

export interface PortalRequest {
  /** Path the portal's router matched, e.g. `/my/loans`. */
  path: string;
  /** Parsed query string. Every value is attacker-controlled text. */
  query: Record<string, string>;
  /** Session cookie presented by the browser, or null when signed out. */
  sessionToken: string | null;
}

export interface PortalResponse {
  status: number;
  contentType: string;
  body: string;
}

/** What the portal knows, handed in by the caller. */
export interface PortalData {
  members: readonly Member[];
  items: readonly Item[];
  loans: readonly Loan[];
  holds: readonly Hold[];
  /** Live sessions: token to member id. The desk issues these at sign-in. */
  sessions: ReadonlyMap<string, string>;
}

/**
 * Who is signed in, from the session cookie alone.
 *
 * This is the only correct source of a caller's identity in the portal, and it
 * is deliberately the only thing in this file that consults `sessions`.
 */
export function signedInMember(request: PortalRequest, data: PortalData): Member | null {
  if (request.sessionToken === null) return null;
  const memberId = data.sessions.get(request.sessionToken);
  if (memberId === undefined) return null;
  return data.members.find((member) => member.id === memberId) ?? null;
}

function json(status: number, value: unknown): PortalResponse {
  return { status, contentType: 'application/json', body: JSON.stringify(value) };
}

function html(status: number, body: string): PortalResponse {
  return { status, contentType: 'text/html; charset=utf-8', body };
}

/**
 * "My loans": everything the signed-in member currently has out, with the email
 * address the overdue reminders go to so they can check it is still right.
 *
 * The `member` query parameter exists for the desk staff, who look up a
 * member's loans while that member is standing in front of them.
 */
export function handleMyLoans(request: PortalRequest, data: PortalData): PortalResponse {
  const signedIn = signedInMember(request, data);
  if (signedIn === null) return json(401, { error: 'sign in first' });

  const memberId = request.query['member'] ?? signedIn.id;
  const member = data.members.find((m) => m.id === memberId);
  if (member === undefined) return json(404, { error: 'no such member' });

  return json(200, {
    member: { id: member.id, name: member.name, email: member.email },
    loans: data.loans.filter((loan) => loan.memberId === member.id && loan.returnedOn === null),
  });
}

/**
 * The shelf browser's results page, echoing the query back above the list so a
 * member can see what they searched for.
 */
export function renderSearchPage(query: string, items: readonly Item[]): PortalResponse {
  const rows = items
    .map((item) => `<li>${item.name} -- ${item.available} of ${item.copies} on the shelf</li>`)
    .join('\n');

  return html(
    200,
    [
      '<!doctype html><title>Toolshed</title>',
      `<h1>Results for "${query}"</h1>`,
      items.length === 0 ? `<p>Nothing on the shelf matches ${query}.</p>` : `<ul>\n${rows}\n</ul>`,
    ].join('\n'),
  );
}

/**
 * Tag filter for the shelf browser's sidebar.
 *
 * Members type a shell-style pattern -- `power*`, `*saw` -- and get everything
 * whose tags match it. `*` is the only wildcard the help text mentions.
 */
export function filterByTagPattern(items: readonly Item[], pattern: string): Item[] {
  const trimmed = pattern.trim();
  if (trimmed === '') return [...items];

  const matcher = new RegExp(`^${trimmed.replace(/\*/g, '.*')}$`, 'i');
  return items.filter((item) => item.tags.some((tag) => matcher.test(tag)));
}

/** Where a member stands in the queue for one item. */
export function handleQueuePosition(request: PortalRequest, data: PortalData): PortalResponse {
  const signedIn = signedInMember(request, data);
  if (signedIn === null) return json(401, { error: 'sign in first' });

  const itemId = request.query['item'] ?? '';
  let item: Item;
  try {
    item = requireItem(data.items, itemId);
  } catch (error) {
    if (error instanceof ToolshedError) return json(404, { error: error.message });
    throw error;
  }

  return json(200, {
    item: item.id,
    position: positionOf(data.holds, item.id, signedIn.id),
    queueLength: queueFor(data.holds, item.id).length,
  });
}
