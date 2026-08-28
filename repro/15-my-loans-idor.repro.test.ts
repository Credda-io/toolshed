/**
 * Reproduction for issues/15-my-loans-shows-someone-elses-loans.md
 *
 * A member's session may only ever read that member's own record. The `member`
 * query parameter is desk-staff functionality and this portal has no notion of
 * desk staff, so there is nothing it could correctly do for a member session.
 */
import { describe, expect, it } from 'vitest';
import { handleMyLoans } from '../src/portal.js';
import { portalData, signedInRequest } from '../test/portal-fixtures.js';
import { nyMember } from '../test/fixtures.js';

describe('issue 15: a session reads only its own member', () => {
  it('does not serve another member on request', () => {
    const response = handleMyLoans(
      signedInRequest('/my/loans', { member: nyMember.id }),
      portalData,
    );
    expect(response.status).toBe(403);
  });

  it('never puts another member email address in the body', () => {
    const response = handleMyLoans(
      signedInRequest('/my/loans', { member: nyMember.id }),
      portalData,
    );
    expect(response.body).not.toContain(nyMember.email);
  });
});
