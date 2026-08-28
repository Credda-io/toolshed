/**
 * The portal's green suite.
 *
 * Like the rest of `test/`, it is green and it is green honestly: it covers the
 * paths the portal gets right and does not reach the four seeded
 * vulnerabilities underneath them. Those are asserted in `repro/`, which is red
 * on purpose. See ../SEEDED.md, cases 15 to 18.
 */
import { describe, expect, it } from 'vitest';
import {
  filterByTagPattern,
  handleMyLoans,
  handleQueuePosition,
  renderSearchPage,
  signedInMember,
} from '../src/portal.js';
import { portalData, portalItems, signedInRequest } from './portal-fixtures.js';
import { nyMember, utcMember } from './fixtures.js';

describe('signedInMember', () => {
  it('resolves a live session to its member', () => {
    expect(signedInMember(signedInRequest('/my/loans'), portalData)?.id).toBe(utcMember.id);
  });

  it('is null for no cookie and for a cookie nobody issued', () => {
    expect(signedInMember({ path: '/my/loans', query: {}, sessionToken: null }, portalData)).toBeNull();
    expect(
      signedInMember({ path: '/my/loans', query: {}, sessionToken: 'made-up' }, portalData),
    ).toBeNull();
  });
});

describe('handleMyLoans', () => {
  it('refuses a signed-out caller', () => {
    const response = handleMyLoans({ path: '/my/loans', query: {}, sessionToken: null }, portalData);
    expect(response.status).toBe(401);
  });

  it('returns the signed-in member their own loans', () => {
    const response = handleMyLoans(signedInRequest('/my/loans'), portalData);
    expect(response.status).toBe(200);
    const body = JSON.parse(response.body) as { member: { id: string }; loans: unknown[] };
    expect(body.member.id).toBe(utcMember.id);
    expect(body.loans).toHaveLength(0);
  });

  it('404s for a member id nobody has', () => {
    expect(handleMyLoans(signedInRequest('/my/loans', { member: 'M-999' }), portalData).status).toBe(404);
  });
});

describe('handleQueuePosition', () => {
  it('reports where the signed-in member stands', () => {
    const response = handleQueuePosition(signedInRequest('/my/queue', { item: 'TS-002' }), portalData);
    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ item: 'TS-002', position: 1, queueLength: 1 });
  });

  it('404s for an item that is not in the catalogue', () => {
    expect(
      handleQueuePosition(signedInRequest('/my/queue', { item: 'TS-404' }), portalData).status,
    ).toBe(404);
  });

  it('refuses a signed-out caller', () => {
    expect(
      handleQueuePosition({ path: '/my/queue', query: { item: 'TS-002' }, sessionToken: null }, portalData)
        .status,
    ).toBe(401);
  });
});

describe('renderSearchPage', () => {
  it('lists what is on the shelf', () => {
    const saw = portalItems.filter((item) => item.id === 'TS-002');
    const response = renderSearchPage('saw', saw);
    expect(response.status).toBe(200);
    expect(response.contentType).toMatch(/text\/html/);
    expect(response.body).toContain('Circular saw');
    expect(response.body).toContain('0 of 2 on the shelf');
  });

  it('says so when nothing matches', () => {
    expect(renderSearchPage('anvil', []).body).toContain('Nothing on the shelf matches');
  });
});

describe('filterByTagPattern', () => {
  it('matches a whole tag', () => {
    expect(filterByTagPattern(portalItems, 'power').map((item) => item.id)).toEqual(['TS-002']);
  });

  it('treats * as the wildcard', () => {
    expect(filterByTagPattern(portalItems, 'carp*').map((item) => item.id)).toEqual([
      'TS-001',
      'TS-002',
    ]);
  });

  it('returns everything for an empty pattern', () => {
    expect(filterByTagPattern(portalItems, '   ')).toHaveLength(2);
  });

  it('matches without regard to case', () => {
    expect(filterByTagPattern(portalItems, 'HAND').map((item) => item.id)).toEqual(['TS-001']);
  });
});

describe('the fixtures describe two different members', () => {
  it('has a loan belonging to somebody other than the signed-in member', () => {
    expect(nyMember.id).not.toBe(utcMember.id);
  });
});
