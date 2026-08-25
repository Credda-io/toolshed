# Toolshed

A small community tool-lending library, in TypeScript. Members borrow tools,
tools come back late, somebody queues for the good router.

**Every bug in this repository is deliberate.** There are fourteen bug reports
in [`issues/`](issues/) and ten seeded defects behind them. It is a demo and a
teaching corpus for [CodeReef](https://github.com/codereefai), and it is not a
library, a starter, or anything you should copy code out of.

## What CodeReef does, and therefore what this repo is shaped like

CodeReef takes a bug **report** -- a GitHub issue -- runs inside the repository's
own CI, tries to **reproduce** the reported failure, and comments on what it
established, leading with what it did not. **It writes no code and opens no pull
request.** V1 is reproduce-and-report.

So this repository is built around *reports*, not just bugs. The seeded defects
exist so that there is something to report, reproduce, and then confirm or
refuse. Four of the fourteen reports are cases CodeReef should **decline or find
nothing in**, and those are the interesting ones -- see
[`SEEDED.md`](SEEDED.md).

## Five minutes

```bash
git clone <this repo> && cd toolshed
npm install

npm test          # the repository's own suite. 41 tests. Green.
npm run repro     # the seeded failures. 20 assertions. ALL RED, on purpose.
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

## Layout

| Path | What it holds |
| --- | --- |
| `src/` | The application. Ten seeded defects live in here. |
| `test/` | The repository's own suite. Green, and green honestly -- it simply does not cover the buggy paths, which is why the bugs are there. |
| `repro/` | One reproduction per real defect. **Red on purpose.** Not run by `npm test`. |
| `negative/` | The reproductions for the two cases with no defect in them. Green. |
| `issues/` | Fourteen bug reports, one per case. |
| `SEEDED.md` | The manifest: defect, report, correct reproduction, expected CodeReef outcome. |

## Running CodeReef against it

[`.github/workflows/codereef.yml`](.github/workflows/codereef.yml) is ready to
run: a `triage` job on opened issues and an `investigate` job on the `codereef`
label, `contents: read` and `issues: write` and nothing else.

> **The action reference needs updating.** Both `uses:` lines point at
> `codereefai/codereef-action@v1`, which is the intended public home of the
> action and **does not exist yet**. Until it is published the workflow cannot
> resolve, and you should pin a tag or a commit SHA rather than a branch when it
> is.

To try it once that exists: paste the body of any file in `issues/` into a new
issue in your fork, then add the `codereef` label.

```bash
gh label create codereef \
  --description 'CodeReef reproduces this bug in a sandbox and comments what it established.'
```

An `ANTHROPIC_API_KEY` secret is optional. Without one the deterministic
heuristic provider runs: it reproduces and reports, and cannot reason over
prose. Several reports here are deliberately prose-heavy, so the difference is
visible.

## Please do not

- Copy any of `src/` into something real. It is wrong on purpose.
- Fix a seeded defect and merge it. CI has a job that fails if `repro/` ever
  goes green, and `SEEDED.md` would then be lying.
- Read the reports as a style guide for filing issues. They are deliberately
  uneven -- some are vague, one references a module that does not exist, and one
  is about behaviour that is working as designed.

## Licence

Apache-2.0. See [`LICENSE`](LICENSE).
