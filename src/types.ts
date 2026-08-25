/** Shared shapes for the Toolshed lending library. */

export interface Item {
  /** Stable catalogue id, e.g. "TS-014". */
  id: string;
  /** Display name as printed on the tool's label. */
  name: string;
  /** Free-form tags used by the shelf browser. */
  tags: string[];
  /** How many physical copies the shed owns. */
  copies: number;
  /** How many copies are on the shelf right now. */
  available: number;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  /** IANA time zone the member's branch keeps its calendar in. */
  timeZone: string;
}

export interface Loan {
  id: string;
  itemId: string;
  memberId: string;
  /** Calendar date the item left the shed, as YYYY-MM-DD in the branch zone. */
  checkedOutOn: string;
  /** Calendar date the item is due back, as YYYY-MM-DD in the branch zone. */
  dueOn: string;
  /** Calendar date the item came back, or null while it is still out. */
  returnedOn: string | null;
  renewals: number;
}

export interface Hold {
  itemId: string;
  memberId: string;
  /** Millisecond timestamp the hold was placed. Ties break by insertion order. */
  placedAt: number;
}

export class ToolshedError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = 'ToolshedError';
  }
}
