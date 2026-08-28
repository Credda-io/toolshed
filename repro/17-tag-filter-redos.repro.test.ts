/**
 * Reproduction for issues/17-tag-filter-hangs-the-browser-tab.md
 *
 * Two halves of one defect. The pattern is a member's text and it is compiled
 * as a regular expression, so it both means more than the help text says and
 * can be made to run for an unbounded time on a process every member shares.
 */
import { describe, expect, it } from 'vitest';
import { filterByTagPattern } from '../src/portal.js';
import type { Item } from '../src/types.js';

const item = (tag: string): Item => ({
  id: 'TS-001',
  name: 'Claw hammer',
  tags: [tag],
  copies: 1,
  available: 1,
});

describe('issue 17: a tag pattern is a glob, not a regular expression', () => {
  it('treats regex metacharacters as literal text', () => {
    // `*` is the only wildcard the help text mentions, so `han.` names a tag
    // nothing has -- it is not a four-character match for `hand`.
    expect(filterByTagPattern([item('hand')], 'han.')).toHaveLength(0);
  });

  it('answers a pathological pattern promptly rather than not at all', () => {
    const items = [item(`${'a'.repeat(26)}b`)];
    const started = Date.now();
    filterByTagPattern(items, '(a+)+');
    expect(Date.now() - started).toBeLessThan(100);
  });
});
