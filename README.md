# toolshed

[![Apache-2.0](https://img.shields.io/badge/licence-Apache--2.0-informational)](LICENSE)
[![defects: deliberate](https://img.shields.io/badge/defects-deliberate-critical)](SEEDED.md)
[![do not deploy](https://img.shields.io/badge/do%20not-deploy-critical)](SECURITY.md)

**A repository with known defects in it, and a filed report for each one, so you
can check what a tool does with the report.**

Toolshed is a small community tool-lending library, in TypeScript. Members
borrow tools, tools come back late, somebody queues for the good router. It is
an ordinary-looking application with an ordinary-looking green test suite, and
**every defect in it is deliberate**: ten bugs, four exploitable
vulnerabilities, and five reports that should not produce a patch at all.

It exists because evaluating a tool of this kind on your own repository is
circular -- you do not know what is in there either. Here you do. There are
nineteen bug reports in [`issues/`](issues/), and
[`SEEDED.md`](SEEDED.md) says, for every one of them, what the defect is, where
it lives, what a correct reproduction asserts, and what the right answer is
including when the right answer is "nothing".

**This is not a library, a starter, or anything to copy code out of.** It is
wrong on purpose.

## What it has to do with Credda

[Credda](https://credda.io) takes a bug report or security vulnerability a
customer has labelled, reproduces the failure, diagnoses the cause, writes the
patch, proves it with a test that fails before and passes after, and hands back
a diff. It runs in your own CI. Whether that diff becomes a
pull request depends on which mechanism delivered it, and the two answer
differently: the **GitHub App** path opens one with no flag and no switch, for a
run that reaches `READY_FOR_REVIEW` with a proven verdict; the **GitHub Action**
opens none unless you set its `open-pull-request` input, which defaults to
`false`, **and** add `contents: write` and `pull-requests: write` to your own
workflow's `permissions:` block, which a default install does not grant. Turning
the input on without both scopes fails at that step rather than opening
anything -- and at `Credda-io/action@v1`, the tag this repository pins, that
input does not exist on any reachable version, so here there is nothing yet to
turn on. How often a run reaches a proven fix at all has not been measured. It
proposes and never merges.

Toolshed is the repository you point it at when you want to see that for
yourself, on defects whose answers are written down in advance.

**Status, 2026-08-28.** The reporting stages -- triage, reproduction,
diagnosis -- run today. The fix stage runs when a model-backed provider is
configured; without one, the deterministic heuristic provider reproduces and
reports and cannot reason over prose. Several of the reports here are
deliberately prose-heavy, which is where the difference between the two
providers is easiest to see.

This paragraph said, on 2026-08-27, that pull request authoring was not wired up
and that a run here comments rather than opening a PR. Some of that has moved:
the delivery path was wired on 2026-08-28, and the GitHub Action grows an
`open-pull-request` input which, when a caller turns it on, commits a verified
patch and opens a pull request. As of 2026-08-29 that input lives on the
action's unmerged branch -- not at `@v1` and not on its default branch -- so no
version this workflow can reach accepts it. It is off by default in any case, a
default install asks for no write scopes and still comments, and it has not yet
run against a real repository, this one included. So a run here leaves a comment unless you
deliberately turned delivery on, and that is worth knowing before you read a
result as a verdict on the engine.

## Why the corpus is shaped the way it is

Three things, and the third is the one that makes it useful.

**Reports, not bugs.** Every defect arrives the way defects actually arrive: as
somebody's prose. A wall calendar and a hunch about the clocks
([`issues/02`](issues/02-due-date-a-day-early-in-november.md)), a joke that
stopped being funny ([`issues/18`](issues/18-inventory-export-runs-a-formula-in-excel.md)),
a complaint that is really a compliment ([`issues/03`](issues/03-i-have-four-holds.md)).
Getting from that to a runnable assertion is the job.

**Vulnerabilities as well as bugs.** Four of the nineteen are exploitable:
broken access control, reflected XSS, regex injection with a denial of service
behind it, and CSV formula injection. They are written for this repository and
marked as deliberate in the source. **No dependency here has been pinned to a
vulnerable version, and none ever will be** -- seeding a real CVE into a real
package would make this repository a distribution channel for it. `npm audit` is
clean and is meant to stay clean; the findings are in the code.

**Five reports that should produce nothing.** A demo where the tool wins every
time is a lie. One report has nothing runnable in it at all. One imports a
module that does not exist. One describes behaviour the repository's own green
suite asserts is correct. One is a member misremembering. One is a careful
security report with no vulnerability behind it. Declining these is the harder
half of the work, and `SEEDED.md` states which decline each one deserves.

## What this is for, now that there is a real corpus

Credda is measured against a harvested corpus: real defects taken from real
repositories, each pinned to the commit before its fix, each admitted only after
the reported expression was executed at that commit and at the fix and behaved
differently. That corpus is much larger than this one and every case in it is
real. It is the honest measurement, and this repository is not a substitute for
it.

So the question this section exists to answer is whether nineteen hand-written
cases still teach anything. They do, and it is worth being specific about what,
because "we also have a demo repo" is not a reason.

**Four things this corpus holds that a harvested one structurally cannot:**

1. **The outcomes that are not reproductions.** A harvested corpus is built by
   admitting cases where the defect is present, so every case in it is a defect.
   `NO_RUNNABLE_CHECK`, `NO_CHANGE_REQUIRED` and `CONTRADICTS_SPECIFICATION` have
   no cases there by construction — a report with nothing runnable in it never
   survives an admission gate that requires something runnable. Five of the
   nineteen here are exactly those, and three of them ship a passing proof.
2. **Reports that should produce nothing at all.** Same reason, stated as the
   thing that matters: a corpus of confirmed defects can measure how often
   Credda reproduces one, and cannot measure how often it invents one. That is the
   failure this product cannot afford, and `negative/` is where it is measured.
3. **Vulnerabilities.** Four, each with a CWE, each reachable from text a member
   of the public can supply, and each filed by a reporter who does not know what
   they have found. A harvested corpus of library defects contains bugs in
   security-adjacent code; it does not contain reachable vulnerabilities with the
   severity deliberately left out of the report.
4. **Defect shapes that are not one expression.** A harvested case is admitted by
   executing an expression and comparing values, so what it can hold is what one
   expression can show. Async ordering
   ([`issues/05`](issues/05-nightly-reminders-report-zero.md)), a missing sort
   comparator ([`issues/09`](issues/09-annual-report-largest-bin-wrong.md)) and a
   shared mutable default that only appears across two objects
   ([`issues/10`](issues/10-tagging-one-tool-tags-all-of-them.md)) each need
   several calls and some state before they say anything.

**And one thing that is about cost rather than coverage.** Running the harvested
corpus clones repositories, installs their dependency trees at commits from
several years ago, and spends real money on a model provider. Running this one
needs none of that. `npm test`, `npm run repro` and `npm run negative` are local
`vitest`, this repository has no runtime dependencies, and its ground truth —
56 green, 28 red, 3 green — is checked by CI on every push for free. That is
what makes it usable as a demonstration and as a smoke test, and it is a real
answer rather than a consolation one.

**What it cannot do, and what the harvested corpus is for.** Every expectation
in `SEEDED.md` was written by the same people who wrote the defects, which makes
it a test of whether Credda agrees with them rather than a test of whether it is
right. Nothing here measures how often real inbound is gradeable at all, and
nothing here is prose from somebody with no idea Credda exists. Those are
measurements, and they need real reports and a fix commit nobody here authored.
This repository is not evidence about Credda's accuracy and should never be
quoted as any.

## Five minutes

```bash
git clone <this repo> && cd toolshed
npm install

npm test          # the repository's own suite. 56 tests. Green.
npm run repro     # the seeded failures. 28 assertions. ALL RED, on purpose.
npm run negative  # the three refusals that can be shown by running code. 3 tests. Green.
```

Then open two files side by side:

- [`issues/02-due-date-a-day-early-in-november.md`](issues/02-due-date-a-day-early-in-november.md)
  -- a real report, written the way a real person writes one: prose, a wall
  calendar, a hunch about the clocks, no stack trace.
- [`repro/02-due-date-clock-change.repro.test.ts`](repro/02-due-date-clock-change.repro.test.ts)
  -- what a correct reproduction of that report looks like. It fails.

Getting from the first to the second is the entire job.

Then read [`issues/11-catalogue-feels-slow.md`](issues/11-catalogue-feels-slow.md)
and ask what a tool should honestly do with it. The answer this repository
asserts is: nothing, and say so. That is `NO_RUNNABLE_CHECK`, and it is not a
success.

Then read [`issues/17-tag-filter-hangs-the-browser-tab.md`](issues/17-tag-filter-hangs-the-browser-tab.md),
which is filed as a slow page by somebody who does not know what a catastrophic
backtrack is. Reproducing the symptom and reporting "the tag filter is slow"
would be reproducing it and missing what it is.

## Layout

| Path | What it holds |
| --- | --- |
| `src/` | The application. Ten seeded defects and four seeded vulnerabilities live in here. |
| `test/` | The repository's own suite. Green, and green honestly -- it simply does not cover the defective paths, which is why the defects survive it. |
| `repro/` | One reproduction per real defect. **Red on purpose.** Not run by `npm test`. |
| `negative/` | Reproductions for the three of the five refusals that *have* one to write. (11 and 12 have nothing runnable in them at all — that is the point of those two.) Green. |
| `issues/` | Nineteen bug reports, one per case. |
| `SEEDED.md` | The manifest: defect, report, correct reproduction, expected Credda outcome. |

## Running Credda against it

[`.github/workflows/credda.yml`](.github/workflows/credda.yml) is ready to run:
a `triage` job on opened issues and an `investigate` job on the `credda` label,
`contents: read` and `issues: write` and `id-token: write` and nothing else.
The third mints the OIDC token the action's launcher fetches the engine with;
it grants no access to anything of this repository's.

> **The action reference, as of 2026-08-30.** Both `uses:` lines point at
> `Credda-io/action@v1`, and that resolves: the repository is public and the
> `v1` tag exists. It previously said `codereefai/codereef-action@v1`, which was
> never a real repository under either organisation -- the action lives in a
> repository called `action`, not `codereef-action`, so that reference was wrong
> in the name as well as the owner and would not have resolved even before the
> rename.
>
> Both `uses:` lines also pass `label: credda` explicitly rather than relying
> on the action's default. At `@v1` that default is `codereef`, and the action
> re-checks the applied label against it, so a job triggered by the `credda`
> label would enter the action, fail that re-check, and **exit 0** -- green,
> and having done nothing. Copy the `label:` line along with the rest.
>
> That line was missing here until 2026-08-29, which means **every green run in
> this workflow's history was that no-op**. Nothing in this repository has been
> exercised end to end by it, so read its run history as evidence of nothing.
>
> Two more things are worth knowing rather than assuming. The action carries no
> published GitHub Release, only the tag, so `@v1` is a moving reference: **pin
> a commit SHA** if you need this workflow to keep meaning one thing. And by its
> own README the install path is proven end to end while `investigate` --
> sandbox, reproduction, report -- is not proven outside Credda's own
> repositories. Treat the first investigation here as an experiment rather than
> a service.

To try it: paste the body of any file in `issues/` into a new issue in **your
own fork**, then add the `credda` label.

Applying that label now starts a real investigation -- checkout, sandbox,
reproduction -- where before the fix above it started nothing at all. If the
fork has an `ANTHROPIC_API_KEY` secret set, the label also spends against that
key, once per label applied. Do it deliberately, and on your fork rather than
on `Credda-io/toolshed`.

```bash
gh label create credda \
  --description 'Credda reproduces this bug in a sandbox and comments what it established.'
```

An `ANTHROPIC_API_KEY` secret is optional; see the status note above for what
changes with and without one.

## Please do not

- **Copy any of `src/` into something real.** It is wrong on purpose, and four
  of the wrong parts are exploitable.
- **Fix a seeded defect and merge it.** CI has a job that fails if `repro/` ever
  goes green, and `SEEDED.md` would then be lying. If you have found a defect
  that is *not* in `SEEDED.md`, that is a different and genuinely welcome thing
  -- see [CONTRIBUTING.md](CONTRIBUTING.md).
- **Read the reports as a style guide for filing issues.** They are deliberately
  uneven: some are vague, one references a module that does not exist, one is
  about behaviour that is working as designed, and one is a security report with
  nothing behind it.
- **Report the seeded vulnerabilities as a security finding against Credda.**
  They are the exhibit. [SECURITY.md](SECURITY.md) says what to do with a
  vulnerability that is genuinely ours.

## Licence

Apache-2.0. See [`LICENSE`](LICENSE).
