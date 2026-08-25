import type { Member } from '../src/types.js';

/** A branch that keeps its calendar in UTC. Nothing about it moves twice a year. */
export const utcMember: Member = {
  id: 'M-001',
  name: 'Rae Okonkwo',
  email: 'rae@example.org',
  timeZone: 'UTC',
};

/** A branch on the US east coast. */
export const nyMember: Member = {
  id: 'M-002',
  name: 'Dai Fletcher',
  email: 'dai@example.org',
  timeZone: 'America/New_York',
};
