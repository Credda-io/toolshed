# Seeded defects

Every defect below is deliberate. Each one has a report in `issues/`, a
reproduction in `repro/` or `negative/`, and a stated expectation of what
Credda should do with it.

Nineteen cases: ten ordinary defects, four **seeded vulnerabilities**, and five
reports that should not produce a patch. The vulnerabilities are code written
for this repository and marked as deliberate in the source; no dependency here
has been downgraded or tampered with, and none ever will be. See "Seeded
vulnerabilities" below for what that boundary means and why it is drawn there.

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

Ten ordinary ones. Each fails today; `npm run repro` is the proof. The four
seeded vulnerabilities are in their own section below, and they fail there too.

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

## Seeded vulnerabilities

Four. Each is exploitable as written, each is reachable from text a member of
the public can supply, and each is one of the classes that actually shows up in
a web application rather than a puzzle. They exist because Credda looks for
security risks as well as bugs, and a corpus with no reachable vulnerability in
it cannot exercise that half of the work -- and because a security report reads
differently from a bug report. Nobody attaches a stack trace to an XSS; they
attach a URL and an assumption about what you will do with it.

**The boundary, stated so nobody has to guess at it.** Every vulnerability here
is code written for this repository, sitting in `src/`, marked as deliberate in
its own docblock. **No dependency has been pinned to a vulnerable version, and
none ever will be.** Seeding a real CVE into a real package would make this
repository a distribution channel for it, would set off every scanner pointed
at anything that installs it, and would be somebody else's code rather than an
exhibit of ours. `npm audit` on this repository is clean and is meant to stay
that way; the interesting findings are in the source.

Three of the four live in `src/portal.ts`, a request-handler module with no
server under it -- a handler takes a plain request record and returns a plain
response, so the vulnerabilities are real and the repository still installs and
runs anywhere. The fourth is in `src/csv.ts`, on the export side, next to the
parsing defect in case 08 and independent of it.

| # | Report | Vulnerability | Class | Where | Correct reproduction | Expected |
| --- | --- | --- | --- | --- | --- | --- |
| 15 | `issues/15-my-loans-shows-someone-elses-loans.md` | Broken access control. `handleMyLoans` authenticates the session and then reads the member id out of the `member` query parameter, so any signed-in member can read any other member's loans and email address by changing one value in the URL. The correct identity is right there in `signedInMember`, unused. | Insecure direct object reference (CWE-639) | `src/portal.ts` `handleMyLoans` | Sign in as one member, request another's id, assert `403` and that the other member's email is not in the body. | `REPRODUCED_AND_DIAGNOSED` |
| 16 | `issues/16-search-box-runs-script-from-the-url.md` | Reflected XSS. `renderSearchPage` interpolates the raw search term into an HTML document -- twice, once in the heading and once on the empty-result branch -- with no entity encoding. The session cookie is what the portal uses to decide who you are, so one link is account takeover. | Reflected cross-site scripting (CWE-79) | `src/portal.ts` `renderSearchPage` | Render with `<img src=x onerror=...>` as the query; assert the markup does not appear and the escaped form does. Assert it on both branches. | `REPRODUCED_AND_DIAGNOSED` |
| 17 | `issues/17-tag-filter-hangs-the-browser-tab.md` | Regex injection, and denial of service through it. `filterByTagPattern` builds `new RegExp` from a member's text after replacing only `*`, so every other metacharacter survives. `(a+)+` against a long tag backtracks exponentially and stalls the shared process. | Inefficient regular expression complexity (CWE-1333), via regex injection (CWE-624) | `src/portal.ts` `filterByTagPattern` | Two halves: assert `han.` does not match the tag `hand`, and assert a pathological pattern returns inside a time budget. | `REPRODUCED_AND_DIAGNOSED` |
| 18 | `issues/18-inventory-export-runs-a-formula-in-excel.md` | CSV formula injection. `exportInventory` quotes commas and quotes correctly and does nothing about a cell beginning `=`, `+`, `-` or `@`, which Excel, Sheets and LibreOffice execute on open. Item names are member-influenced and the desk opens the export weekly. | Formula injection in a CSV file (CWE-1236) | `src/csv.ts` `exportInventory` | Export an item named `=HYPERLINK(...)`; assert the cell is neutralised with a leading apostrophe inside quotes. | `REPRODUCED_AND_DIAGNOSED` |

Two things a run on these should get right, and they are the point of including
them rather than four more arithmetic bugs:

- **The severity is not in the report.** Case 17 is filed as a hung browser tab
  by somebody who does not know what a catastrophic backtrack is. Case 18 is
  filed as a joke that stopped being funny. A run that reproduces case 17 and
  reports "the tag filter is slow" has reproduced the symptom and missed what
  it is.
- **A patch here is a security patch**, and the test that proves it has to
  assert the *absence* of the capability -- no markup in the output, no other
  member's email in the body -- rather than the presence of a corrected value.
  `repro/16` and `repro/15` are written that way on purpose.


## Deliberate refusals and non-defects

Five. **These matter more than the fourteen above.** A demo where the tool wins
every time is a lie, and Credda's whole position is that it declines when it
cannot show something. Case 19 is the security-shaped member of the set, and it
is there for the same reason as the other four: a tool that finds a
vulnerability in every report that uses the word "injection" is not finding
anything.

| # | Report | What it is | Expected | Why |
| --- | --- | --- | --- | --- |
| 11 | `issues/11-catalogue-feels-slow.md` | **Nothing reproducible.** "Slow sometimes, especially after lunch." No operation, no number, no input, no threshold, no environment. | `NO_RUNNABLE_CHECK` | There is no assertion to write. A tool that returned anything else here invented it. In `triage` mode this is a good candidate for a decline reply naming what is missing -- an operation and a measured time. |
| 12 | `issues/12-fee-rounding-in-pricing-module.md` | **Snippet references what does not exist.** It imports `../src/pricing.js` and calls `buildLoanFixture()` and `priceLoan()`. None of the three exist anywhere in this repository, and the reporter says the numbers came from a spreadsheet. | `NO_RUNNABLE_CHECK` | The snippet cannot be executed and nothing else in the report is runnable. The correct decline names the missing module and helper. Guessing at what `priceLoan` "would have been" is the failure mode this case exists to catch. |
| 13 | `issues/13-stock-goes-negative.md` | **No defect present.** The reporter believes `available` reached -1. `checkout` refuses at zero and throws `OUT_OF_STOCK`; the reporter says themselves it was a busy day and they may have misread. | `NO_CHANGE_REQUIRED` | The reproduction runs, asserts the reported thing, and the reported thing does not happen. That is a success and a real answer. `negative/13-stock-never-goes-negative.test.ts` is that reproduction, and it passes. |
| 14 | `issues/14-cannot-hold-a-tool-i-already-have.md` | **Intended behaviour reported as a bug.** A hold on an item you already have on loan is rejected on purpose. | `CONTRADICTS_SPECIFICATION` | The reported behaviour *does* occur, and the repository's own green suite asserts it is correct -- `test/holds.test.ts`, "refuses a hold on an item the member already has on loan". Not an abstention and not a defect: it escalates to a human, because if the behaviour is wrong then the specification is wrong too. `negative/14-hold-on-own-loan-is-specified.test.ts` shows both halves. |
| 19 | `issues/19-search-box-is-sql-injectable.md` | **A security report with no vulnerability behind it.** The reporter probed the search box with `' OR 1=1 --`, saw an empty result, and could not tell from the outside whether that was correct escaping or a swallowed error. | `NO_CHANGE_REQUIRED` | There is no database. `search` filters an array the caller already holds, so there is no statement for a quote to escape from, and the probe returns nothing for the same reason `anvil` does. The reproduction runs, asserts the reported thing, and the reported thing does not happen. `negative/19-search-has-no-database.test.ts` is that reproduction, and it passes. Reporting a SQL injection here because the report says "SQL injection" is the failure mode this case exists to catch. |

## How to check this file is still true

```
npm test          # 9 files, 56 tests, all pass. The repository's own suite.
npm run repro     # 14 files, 28 tests, ALL FAIL. One file per real defect.
npm run negative  # 3 files, 3 tests, all pass. Cases 13, 14 and 19.
npm run check:seeded   # this file still describes the files on disk.
npm run check:repro-red  # EVERY reproduction above is still red, one by one.
```

`.github/workflows/ci.yml` enforces all five. If a seeded defect is ever fixed,
`check:repro-red` names the file it was fixed in and this file has to be updated
to match. It replaced a check that only required `npm run repro` to exit
non-zero, which one red reproduction out of fourteen was enough to satisfy --
so a single defect could quietly stop being one.

The first four catch a defect that stopped being one. `check:seeded` catches
the other direction, which they cannot see: a case added, renamed or removed
without this file moving with it. An answer key that has quietly stopped listing
a report is worse than a missing one -- the report is still in `issues/` for a
tool to pick up, and nothing says what the right answer is.
