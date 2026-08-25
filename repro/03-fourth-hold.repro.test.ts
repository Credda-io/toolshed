/**
 * Reproduction for issues/03-i-have-four-holds.md
 *
 * The poster caps holds at three per member.
 */
import { describe, expect, it } from 'vitest';
import { placeHold } from '../src/holds.js';
import type { Hold } from '../src/types.js';
import { utcMember } from '../test/fixtures.js';

describe('issue 03: the hold cap is three', () => {
  it('refuses a fourth hold', () => {
    const holds: Hold[] = [];
    placeHold(holds, [], utcMember, 'TS-001', 100);
    placeHold(holds, [], utcMember, 'TS-002', 101);
    placeHold(holds, [], utcMember, 'TS-003', 102);
    expect(() => placeHold(holds, [], utcMember, 'TS-004', 103)).toThrow(/already has 3 holds/);
  });

  it('never lets a member hold more than three items', () => {
    const holds: Hold[] = [];
    for (const id of ['TS-001', 'TS-002', 'TS-003', 'TS-004', 'TS-005']) {
      try {
        placeHold(holds, [], utcMember, id, 100);
      } catch {
        /* the cap is what we are measuring */
      }
    }
    expect(holds).toHaveLength(3);
  });
});
