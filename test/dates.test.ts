import { describe, expect, it } from 'vitest';
import { addDays, daysBetween, formatInZone, startOfDayInZone } from '../src/dates.js';

describe('dates', () => {
  it('adds a loan period inside a branch that keeps UTC', () => {
    expect(addDays('2026-10-25', 14, 'UTC')).toBe('2026-11-08');
  });

  it('adds days inside a month', () => {
    expect(addDays('2026-06-01', 7, 'America/New_York')).toBe('2026-06-08');
  });

  it('counts whole calendar days across a clock change', () => {
    expect(daysBetween('2026-10-25', '2026-11-08', 'America/New_York')).toBe(14);
  });

  it('starts a day at local midnight, not at UTC midnight', () => {
    expect(startOfDayInZone('2026-06-01', 'America/New_York').toISOString()).toBe('2026-06-01T04:00:00.000Z');
  });

  it('renders an instant as the calendar date of its zone', () => {
    expect(formatInZone(new Date('2026-01-01T02:00:00Z'), 'America/New_York')).toBe('2025-12-31');
  });
});
