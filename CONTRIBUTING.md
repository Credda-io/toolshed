# Contributing

This repository is an exhibit, so "contributing" means something slightly
unusual here. Read [SEEDED.md](SEEDED.md) first.

## Do not fix the defects

The nineteen cases in `issues/` are the point. `.github/workflows/ci.yml` has a
job that **passes when `npm run repro` fails**, so a pull request that fixes a
seeded defect turns CI red and `SEEDED.md` into a lie. It will be declined.

That includes the four vulnerabilities. They are marked as deliberate in the
source and listed by class and location in `SEEDED.md`. See
[SECURITY.md](SECURITY.md).

## What is genuinely welcome

**A defect that is not in `SEEDED.md`.** If the application is wrong in a way
nobody intended, that is a real bug in a repository whose whole claim is that it
knows what is wrong with it. Open an issue. It is one of the more useful things
anyone could send.

**A report that reads badly.** These are meant to read like reports real people
write -- uneven, partial, occasionally mistaken about the cause. If one reads
like it was written by somebody who already knew the answer, that weakens the
corpus, and saying so is worth more than a patch.

**A new case.** The bar is high and it is the same bar the existing ones met:

- It comes with a **report** in `issues/`, written as a person would write it,
  not as a specification. The reporter is allowed to be wrong about the cause.
- It comes with a **reproduction** in `repro/` (red) or `negative/` (green), and
  the reproduction asserts what the report *claims*, not what the code does.
- It comes with a **row in `SEEDED.md`**: defect, location, correct
  reproduction, expected outcome, and why that outcome and not another.
- The **green suite still passes and still does not cover it.** `test/` is green
  honestly. If your defect is caught by the repository's own tests, it is not
  seeded, it is broken.
- If it is a vulnerability, it is **code you wrote**, in `src/`, marked as
  deliberate in its docblock. Never a dependency pinned to a vulnerable version
  -- that line is explained in SECURITY.md and it does not move.

Cases that produce **nothing** are worth more than cases that produce a patch.
There are five and the corpus would be better with six. A report with nothing
runnable in it, a report about intended behaviour, a report that is simply
mistaken -- those are the hard half.

## Run it

```bash
npm install
npm test          # 9 files, 56 tests. Green.
npm run repro     # 14 files, 28 assertions. ALL RED, on purpose.
npm run negative  # 3 files, 3 tests. Green.
npm run typecheck
```

If any of those three counts is wrong after your change, `SEEDED.md`,
`README.md` and this file all state them and all need updating together.

## Licence

Contributions are accepted under Apache-2.0, the same licence as the repository.
