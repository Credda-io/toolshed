/**
 * Calendar-date helpers.
 *
 * Every date the shed cares about is a *calendar* date in a *branch's* zone --
 * "due back Saturday" means Saturday at that branch, not an instant. The zone
 * is always passed in explicitly so nothing here depends on the machine the
 * code happens to run on.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function assertIsoDate(date: string): void {
  if (!ISO_DATE.test(date)) {
    throw new TypeError(`expected a YYYY-MM-DD calendar date, got ${JSON.stringify(date)}`);
  }
}

/** The calendar date an instant falls on, in the given zone. */
export function formatInZone(instant: Date, timeZone: string): string {
  // en-CA renders as YYYY-MM-DD, which is the format the shed stores.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
}

/** The zone's UTC offset, in minutes, at a given instant. */
function offsetMinutes(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);

  const get = (type: string): number => Number(parts.find((p) => p.type === type)?.value);
  // Intl renders midnight as hour 24 in some locales; normalise it.
  const hour = get('hour') % 24;
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), hour, get('minute'), get('second'));
  return (asUtc - instant.getTime()) / 60_000;
}

/** The instant at which a calendar date begins in the given zone. */
export function startOfDayInZone(date: string, timeZone: string): Date {
  assertIsoDate(date);
  const guess = new Date(`${date}T00:00:00Z`);
  const firstPass = new Date(guess.getTime() - offsetMinutes(guess, timeZone) * 60_000);
  // One correction pass is enough for every real zone: the offset can only
  // change by an hour or so between the guess and the answer.
  return new Date(guess.getTime() - offsetMinutes(firstPass, timeZone) * 60_000);
}

/**
 * The calendar date `days` after `date`, in the given branch zone.
 *
 * Used for due dates, renewal dates and reminder scheduling.
 */
export function addDays(date: string, days: number, timeZone: string): string {
  const start = startOfDayInZone(date, timeZone);
  const shifted = new Date(start.getTime() + days * 86_400_000);
  return formatInZone(shifted, timeZone);
}

/** Whole calendar days from `from` to `to`, in the given branch zone. */
export function daysBetween(from: string, to: string, timeZone: string): number {
  const a = startOfDayInZone(from, timeZone);
  const b = startOfDayInZone(to, timeZone);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}
