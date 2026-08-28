/**
 * The reproduction issues/19-search-box-is-sql-injectable.md asks for, run.
 *
 * The report is careful and it is wrong, which is the useful combination. There
 * is no database in this repository: `search` filters an array the caller
 * already holds in memory, so there is no statement for a quote to escape from.
 *
 * This file asserts what the reporter actually observed -- that the two probe
 * strings return nothing -- and shows why. They return nothing because no tool
 * is named that, exactly as any other unmatched search does. Nothing is
 * mangled, nothing throws, and the catalogue is unchanged afterwards. That is
 * NO_CHANGE_REQUIRED, and it is a real answer rather than an abstention.
 */
import { describe, expect, it } from 'vitest';
import { search } from '../src/catalog.js';
import { portalItems } from '../test/portal-fixtures.js';

describe('issue 19: the reported injection cannot occur', () => {
  it('treats a SQL probe as an ordinary search term', () => {
    const before = JSON.stringify(portalItems);

    for (const probe of ["' OR 1=1 --", "hammer'; DROP TABLE items; --"]) {
      expect(() => search(portalItems, probe)).not.toThrow();
      expect(search(portalItems, probe)).toHaveLength(0);
    }

    // A term nothing matches behaves identically, which is the point: the empty
    // result is the search working, not a query being swallowed.
    expect(search(portalItems, 'anvil')).toHaveLength(0);
    // And a term something does match still comes back, so the filter is live.
    expect(search(portalItems, 'Circular').map((item) => item.id)).toEqual(['TS-002']);

    expect(JSON.stringify(portalItems)).toBe(before);
  });
});
