# Seeded defects

Every defect below is deliberate. Each one has a report in `issues/`, a
reproduction in `repro/` or `negative/`, and a stated expectation of what
Credda should do with it.

**The expectations are predictions, not measurements.** They say what a correct
run looks like. Where a run disagrees with this table, this table is the thing
that was wrong until somebody checks which.

## Outcome vocabulary

Credda's terminal outcomes, as used in the tables:

| Outcome | Means | Reads as |
| --- | --- | --- |
| `REPRODUCED_AND_DIAGNOSED` | The failure was reproduced and a cause was established from the evidence. | success |
| `REPRODUCED_NOT_DIAGNOSED` | The failure was reproduced. No cause was established. | success |
| `NO_CHANGE_REQUIRED` | A reproduction ran, asserted the reported thing, and the reported thing did not happen. | success |
| `CONTRADICTS_SPECIFICATION` | The reported behaviour occurred, and the repository's own green suite asserts it. No defect established. | neither -- it goes to a human |
| `NO_RUNNABLE_CHECK` | Nothing runnable could be derived from the report. Not a claim about this repository. | **not a success** |
| `INCONCLUSIVE` | Something ran and did not settle the question. | not a success |

## Real defects

Ten. Each fails today; `npm run repro` is the proof.

| # | Report | Defect | Where | Correct reproduction | Expected |
| --- | --- | --- | --- | --- | --- |
| 01 | `issues/01-late-fee-shows-too-many-decimals.md` | Floating point. `lateFee` accumulates `0.35` in a loop and never rounds, so ten days is `3.5000000000000004`. | `src/fees.ts` `lateFee` | Assert `lateFee(12) === 3.5`. | `REPRODUCED_AND_DIAGNOSED` |
| 02 | `issues/02-due-date-a-day-early-in-november.md` | Timezone. `addDays` adds `days * 86_400_000` ms to an instant, so a loan crossing the end of DST lands an hour before local midnight and formats as the previous calendar day. | `src/dates.ts` `addDays` | Assert `addDays('2026-10-25', 14, 'America/New_York') === '2026-11-08'`. Zone must be explicit; the bug is invisible in UTC. | `REPRODUCED_AND_DIAGNOSED` |
| 03 | `issues/03-i-have-four-holds.md` | Off-by-one. The hold cap is checked with `mine.length > maxHolds` instead of `>=`, so a member gets `maxHolds + 1`. | `src/holds.ts` `placeHold` | Place three holds, assert the fourth throws. | `REPRODUCED_AND_DIAGNOSED` |
| 04 | `issues/04-searching-hammer-finds-nothing.md` | Wrong comparison. `search` trims the query but folds neither side's case, so matching is exact-substring. Labels are capitalised; queries are not. | `src/catalog.ts` `search` | Search `'hammer'` over an item named `Hammer, claw`. | `REPRODUCED_AND_DIAGNOSED` |
| 05 | `issues/05-nightly-reminders-report-zero.md` | Async ordering. `sendReminders` uses `forEach(async ...)`, so the promise resolves before any send completes and `sent` is always 0. | `src/notify.ts` `sendReminders` | `await sendReminders(...)` over three overdue loans, assert `sent === 3` and that the sink holds three. | `REPRODUCED_AND_DIAGNOSED` |
| 06 | `issues/06-renewed-a-loan-nine-times.md` | Bad default. `renew` reads `policy.maxRenewals ?? Infinity`, and `DEFAULT_POLICY` omits the key, so renewals are unbounded. The posted cap is `POSTED_MAX_RENEWALS`. | `src/loans.ts` `renew`, `src/policy.ts` | Renew twice, assert the third throws. | `REPRODUCED_AND_DIAGNOSED` |
| 07 | `issues/07-dashboard-shows-nan.md` | Unhandled edge case. `averageLoanDays` divides by `closed.length` without guarding zero, so an empty ledger yields `NaN`. | `src/report.ts` `averageLoanDays` | Assert `averageLoanDays([], [member]) === 0`. | `REPRODUCED_AND_DIAGNOSED` |
| 08 | `issues/08-inventory-import-mangles-a-row.md` | Parsing edge case. `parseInventory` splits rows on `,` with no quote handling, so a quoted name containing a comma shifts every later column. | `src/csv.ts` `parseInventory` | Parse `TS-014,"Wrench, adjustable",plumbing;hand,4`, assert name and `copies: 4`. | `REPRODUCED_AND_DIAGNOSED` |
| 09 | `issues/09-annual-report-largest-bin-wrong.md` | Default sort. `copyCountsDescending` calls `.sort()` with no comparator, so numbers sort lexicographically and 10 lands after 9. | `src/report.ts` `copyCountsDescending` | Counts spanning one and two digits, e.g. `[4, 10, 9, 2]`; assert `[10, 9, 4, 2]`. Single-digit data hides it. | `REPRODUCED_AND_DIAGNOSED` |
| 10 | `issues/10-tagging-one-tool-tags-all-of-them.md` | Shared mutable default. `createItem` spreads `SHELF_DEFAULTS`, which copies the *reference* to one `tags` array; `tagItem` pushes onto it, so every default-tagged entry gains the tag, including ones created later. | `src/catalog.ts` `createItem`, `tagItem` | Create two default items, tag one, assert the other is untouched. | `REPRODUCED_AND_DIAGNOSED` |

`REPRODUCED_NOT_DIAGNOSED` is an acceptable outcome for any of these ten. It
means the failure was captured and no cause was established from it, which is
still a report about this repository. `NO_CHANGE_REQUIRED` or `NO_RUNNABLE_CHECK`
on any of them would be wrong.

## Deliberate refusals and non-defects

Four. **These matter more than the ten above.** A demo where the tool wins every
time is a lie, and Credda's whole position is that it declines when it cannot
show something.

| # | Report | What it is | Expected | Why |
| --- | --- | --- | --- | --- |
| 11 | `issues/11-catalogue-feels-slow.md` | **Nothing reproducible.** "Slow sometimes, especially after lunch." No operation, no number, no input, no threshold, no environment. | `NO_RUNNABLE_CHECK` | There is no assertion to write. A tool that returned anything else here invented it. In `triage` mode this is a good candidate for a decline reply naming what is missing -- an operation and a measured time. |
| 12 | `issues/12-fee-rounding-in-pricing-module.md` | **Snippet references what does not exist.** It imports `../src/pricing.js` and calls `buildLoanFixture()` and `priceLoan()`. None of the three exist anywhere in this repository, and the reporter says the numbers came from a spreadsheet. | `NO_RUNNABLE_CHECK` | The snippet cannot be executed and nothing else in the report is runnable. The correct decline names the missing module and helper. Guessing at what `priceLoan` "would have been" is the failure mode this case exists to catch. |
| 13 | `issues/13-stock-goes-negative.md` | **No defect present.** The reporter believes `available` reached -1. `checkout` refuses at zero and throws `OUT_OF_STOCK`; the reporter says themselves it was a busy day and they may have misread. | `NO_CHANGE_REQUIRED` | The reproduction runs, asserts the reported thing, and the reported thing does not happen. That is a success and a real answer. `negative/13-stock-never-goes-negative.test.ts` is that reproduction, and it passes. |
| 14 | `issues/14-cannot-hold-a-tool-i-already-have.md` | **Intended behaviour reported as a bug.** A hold on an item you already have on loan is rejected on purpose. | `CONTRADICTS_SPECIFICATION` | The reported behaviour *does* occur, and the repository's own green suite asserts it is correct -- `test/holds.test.ts`, "refuses a hold on an item the member already has on loan". Not an abstention and not a defect: it escalates to a human, because if the behaviour is wrong then the specification is wrong too. `negative/14-hold-on-own-loan-is-specified.test.ts` shows both halves. |

## How to check this file is still true

```
npm test        # 8 files, 41 tests, all pass. The repository's own suite.
npm run repro   # 10 files, 20 tests, ALL FAIL. One file per real defect.
npm run negative  # 2 files, 2 tests, both pass. Cases 13 and 14.
```

`.github/workflows/ci.yml` enforces all three, including that `repro/` stays
red. If a seeded defect is ever fixed, that job fails and this file has to be
updated to match.
