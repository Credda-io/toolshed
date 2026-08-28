/**
 * Reproduction for issues/16-search-box-runs-script-from-the-url.md
 *
 * The search term is attacker-controlled and lands in an HTML document. It has
 * to be entity-encoded on the way in, on every branch that prints it.
 */
import { describe, expect, it } from 'vitest';
import { renderSearchPage } from '../src/portal.js';
import { portalItems } from '../test/portal-fixtures.js';

const PAYLOAD = '<img src=x onerror=alert(document.cookie)>';

describe('issue 16: the query is escaped before it reaches the page', () => {
  it('does not emit the payload as markup in the results heading', () => {
    const body = renderSearchPage(PAYLOAD, portalItems).body;
    expect(body).not.toContain('<img src=x');
    expect(body).toContain('&lt;img src=x');
  });

  it('escapes it on the empty-result branch too', () => {
    const body = renderSearchPage(PAYLOAD, []).body;
    expect(body).not.toContain('<img src=x');
  });
});
