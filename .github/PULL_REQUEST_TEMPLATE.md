<!--
This repository is an exhibit, so a pull request here means something unusual.

DO NOT FIX THE SEEDED DEFECTS. Nineteen cases in `issues/` are deliberate — ten
bugs, four vulnerabilities, five reports that should produce nothing — and
`.github/workflows/ci.yml` has a job that PASSES when `npm run repro` FAILS. A
pull request that fixes one turns CI red and SEEDED.md into a lie. It will be
declined. That includes the four vulnerabilities; SECURITY.md says why the line
is where it is.

What is welcome is a defect nobody intended, a report that reads like it was
written by somebody who already knew the answer, and a new case — and cases that
produce NOTHING are worth more than cases that produce a patch. There are five
and the corpus would be better with six.

The line that does not move: never a dependency pinned to a vulnerable version.
Every seeded vulnerability is code written for this repository, in `src/`, marked
deliberate in its own docblock. `npm audit` here is clean and stays clean.
-->

**Which of these is it?**

- [ ] A defect nobody intended
- [ ] A report that reads badly
- [ ] A new deliberate case
- [ ] Something else <!-- say what -->

**What this changes, and why.**

- [ ] `npm test` is green, `npm run repro` is red, `npm run negative` is green, and `npm run typecheck` passes.
- [ ] This does not fix a defect listed in `SEEDED.md`.
- [ ] No dependency was pinned to a vulnerable version, and `npm audit` is clean.
- [ ] If the file, test or assertion counts changed, `SEEDED.md`, `README.md` and `CONTRIBUTING.md` were all updated together — all three state them.

**For a new case only:**

- [ ] A report in `issues/`, written as a person would write it, allowed to be wrong about the cause.
- [ ] A reproduction in `repro/` (red) or `negative/` (green), asserting what the report *claims*, not what the code does.
- [ ] A row in `SEEDED.md`: defect, location, correct reproduction, expected outcome, and why that outcome and not another.
- [ ] The green suite still passes and still does not cover it.
- [ ] If it is a vulnerability, it is code written here, in `src/`, marked deliberate in its docblock.
