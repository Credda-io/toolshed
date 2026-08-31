/**
 * SEEDED.md is the whole point of this repository: it is the answer key, and a
 * tool is judged against it. Nothing checked that it still described the files
 * on disk.
 *
 * CI already proves the seeded defects are still defects -- `repro/` must be
 * red, `negative/` must be green. That catches a bug being FIXED. It cannot
 * catch a case being ADDED, renamed or removed without the answer key moving
 * with it, and an answer key that has quietly stopped listing a report is worse
 * than a missing one, because the report is still in `issues/` for a tool to
 * pick up and nothing says what the right answer is.
 *
 * So this checks the three things the file asserts about the tree:
 *
 *   1. every report in `issues/` is named by a row in SEEDED.md, and every
 *      report SEEDED.md names exists;
 *   2. the counts in the file's own summary -- nineteen, ten, four, five --
 *      match the numbers in it;
 *   3. the suite sizes it publishes under "How to check this file is still
 *      true" -- BOTH the file counts and the test counts -- match `test/`,
 *      `repro/` and `negative/`.
 *
 * The test counts were the gap. Only the `(\d+) files` capture was read, so
 * `56 tests` and `3 tests` were prose: adding `.skip` to the single `it` in
 * `negative/19-search-has-no-database.test.ts`, or deleting an `it` from
 * `test/`, left every file count right, every suite exiting 0, and this script
 * green, while SEEDED.md and README.md ("56 green, 28 red, 3 green -- is
 * checked by CI on every push") had both become false. Only the 28 was
 * checked, by `check-repro-red.mjs`, which counts what it collects.
 *
 * The counts come from `vitest list`, which COLLECTS without running -- so
 * `repro/`, whose whole purpose is to fail, can be counted here as cheaply as
 * the two suites that pass, and a skipped test is still absent from the list.
 *
 * It is a script rather than a test in `test/` on purpose. `test/` is this
 * repository's ordinary-looking application suite -- it is part of what a tool
 * reads here -- and a meta-test about the documentation does not belong in it.
 *
 * Exits non-zero on any mismatch, and prints every one rather than the first.
 */

import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFileSync(join(root, name), 'utf8');
const list = (dir, suffix) => readdirSync(join(root, dir)).filter((f) => f.endsWith(suffix)).sort();

const seeded = read('SEEDED.md');
const problems = [];

// 1. Reports and rows.
const reports = list('issues', '.md');
const named = new Set(seeded.match(/issues\/[a-z0-9-]+\.md/g) ?? []);
for (const report of reports) {
  if (!named.has(`issues/${report}`)) problems.push(`issues/${report} has no row in SEEDED.md`);
}
for (const reference of named) {
  if (!reports.includes(reference.slice('issues/'.length))) {
    problems.push(`SEEDED.md names ${reference}, which does not exist`);
  }
}

// 2. The summary's own arithmetic. The three groups are the three tables.
const rows = (heading) => {
  const start = seeded.indexOf(`## ${heading}`);
  if (start === -1) {
    problems.push(`SEEDED.md has no "## ${heading}" section`);
    return 0;
  }
  const next = seeded.indexOf('\n## ', start + 1);
  const section = seeded.slice(start, next === -1 ? undefined : next);
  return (section.match(/^\| \d\d \| `issues\//gm) ?? []).length;
};
const groups = {
  'Real defects': { count: rows('Real defects'), claimed: 10, word: 'ten ordinary defects' },
  'Seeded vulnerabilities': { count: rows('Seeded vulnerabilities'), claimed: 4, word: 'four **seeded vulnerabilities**' },
  'Deliberate refusals and non-defects': {
    count: rows('Deliberate refusals and non-defects'),
    claimed: 5,
    word: 'five\nreports that should not produce a patch',
  },
};
for (const [heading, { count, claimed, word }] of Object.entries(groups)) {
  if (count !== claimed) problems.push(`"${heading}" holds ${count} rows; the summary says ${claimed}`);
  if (!seeded.includes(word)) problems.push(`SEEDED.md no longer says "${word.replace(/\n/g, ' ')}"`);
}
const total = Object.values(groups).reduce((n, g) => n + g.count, 0);
if (total !== reports.length) problems.push(`${reports.length} reports in issues/, ${total} rows in SEEDED.md`);
if (!seeded.includes('Nineteen cases')) problems.push('SEEDED.md no longer opens with "Nineteen cases"');
if (reports.length !== 19) problems.push(`issues/ holds ${reports.length} reports; SEEDED.md says nineteen`);

// 3. The published suite sizes: files, and the tests inside them.
//
// `vitest list` collects and prints the tests it would run, without running
// any. A `.skip`ped test is not listed, which is the point: skipping is how a
// count falls silently while every suite still exits 0.
const collected = (dir) => {
  const out = execFileSync('npx', ['vitest', 'list', '--dir', dir, '--json'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    maxBuffer: 32 * 1024 * 1024,
  });
  const listed = JSON.parse(out);
  if (!Array.isArray(listed)) throw new Error(`vitest list --dir ${dir} did not answer an array`);
  return listed.length;
};

for (const [dir, suffix, label] of [
  ['test', '.test.ts', 'npm test'],
  ['repro', '.repro.test.ts', 'npm run repro'],
  ['negative', '.test.ts', 'npm run negative'],
]) {
  // The suffix already excludes `test/`'s fixture modules, which are plain
  // `.ts`. A `!f.includes('fixtures')` filter used to stand here as well and
  // could never fire -- a no-op reading as an exclusion.
  const files = list(dir, suffix);
  const line = seeded.match(new RegExp(`${label.replace(/ /g, '\\s+')}\\s+#\\s+(\\d+) files`));
  if (line === null) {
    problems.push(`SEEDED.md no longer publishes a file count for \`${label}\``);
  } else if (Number(line[1]) !== files.length) {
    problems.push(`${dir}/ holds ${files.length} suites; SEEDED.md says ${line[1]}`);
  }

  const claimed = seeded.match(new RegExp(`${label.replace(/ /g, '\\s+')}\\s+#[^\\n]*?(\\d+) tests`));
  if (claimed === null) {
    problems.push(`SEEDED.md no longer publishes a test count for \`${label}\``);
    continue;
  }
  const counted = collected(dir);
  if (counted === 0) {
    problems.push(`vitest collected no tests at all in ${dir}/, so this count checked nothing`);
  } else if (counted !== Number(claimed[1])) {
    problems.push(`${dir}/ collects ${counted} tests; SEEDED.md says ${claimed[1]}`);
  }
}

// 4. The pointers into the code, which were prose.
//
// Every row of the two defect tables carries a `Where` cell naming the file and
// the function the defect is in, several rows name a suite file, case 14 quotes
// the title of a test in `test/holds.test.ts`, and case 12's whole answer is
// the claim that `src/pricing.js`, `priceLoan` and `buildLoanFixture` exist
// nowhere here. None of that was checked. Renaming `lateFee`, moving a
// reproduction, retitling the holds test, or adding a `priceLoan` export would
// each leave the answer key confidently wrong with every suite still green --
// and case 12 is the one that fails quietly in the direction that matters: the
// moment something in this repository IS called `priceLoan`, the correct answer
// for that report stops being `NO_RUNNABLE_CHECK` and nothing would say so.

/** Every `dir/file` path SEEDED.md points at, whatever the directory. */
const referenced = new Set(
  (seeded.match(/`(?:src|test|repro|negative|scripts)\/[A-Za-z0-9._/-]+`/g) ?? []).map((m) => m.slice(1, -1)),
);
for (const path of referenced) {
  const [dir, name] = [path.slice(0, path.indexOf('/')), path.slice(path.indexOf('/') + 1)];
  // `repro/16` is the file whose name starts with 16; the prose uses that
  // shorthand deliberately, so a prefix counts as naming the file.
  const exists = readdirSync(join(root, dir)).some((entry) => entry === name || entry.startsWith(`${name}-`));
  if (!exists) problems.push(`SEEDED.md points at ${path}, which does not exist`);
}

/*
 * The `Where` cell of a defect row: backticked spans, the `src/...` ones being
 * files and the rest being names that file has to declare. `renew` in
 * `src/loans.ts` `renew`, `src/policy.ts` belongs to the file before it, which
 * is why the file is carried forward rather than assumed.
 */
for (const row of seeded.match(/^\| \d\d \|[^\n]*$/gm) ?? []) {
  const cells = row.split('|').map((cell) => cell.trim());
  const where = cells.find((cell) => /^`src\//.test(cell));
  if (where === undefined) continue; // A refusal row names no code, by design.
  let file = null;
  for (const span of where.match(/`[^`]+`/g) ?? []) {
    const text = span.slice(1, -1);
    if (text.startsWith('src/')) {
      file = text;
      continue;
    }
    if (file === null) continue;
    let source;
    try {
      source = readFileSync(join(root, file), 'utf8');
    } catch {
      continue; // Already reported above.
    }
    if (!new RegExp(`\\b(?:function|const|class|let)\\s+${text}\\b`).test(source)) {
      problems.push(`SEEDED.md says the defect is in \`${text}\` in ${file}, which declares no such name`);
    }
  }
}

/*
 * Case 12 is `NO_RUNNABLE_CHECK` because these three do not exist. If one ever
 * does, the report becomes runnable and the answer key is wrong about it.
 */
const sources = ['src', 'test', 'repro', 'negative']
  .flatMap((dir) => list(dir, '.ts').map((name) => `${dir}/${name}`))
  .map((path) => read(path))
  .join('\n');
for (const absent of ['priceLoan', 'buildLoanFixture', 'pricing']) {
  if (new RegExp(`\\b${absent}\\b`).test(sources)) {
    problems.push(
      `SEEDED.md answers case 12 with NO_RUNNABLE_CHECK because \`${absent}\` exists nowhere here; it now exists`,
    );
  }
}

/* Case 14's answer is a quotation from the green suite. */
const quoted = 'refuses a hold on an item the member already has on loan';
if (!seeded.includes(quoted)) {
  problems.push(`SEEDED.md no longer quotes the holds test by title, so case 14 cites nothing`);
} else if (!read('test/holds.test.ts').includes(quoted)) {
  problems.push(`SEEDED.md cites a test titled "${quoted}"; test/holds.test.ts has no such test`);
}

// README.md publishes the same three numbers as one sentence, and says CI
// checks them. It does now.
const ground = seeded.match(/npm test\s+#\s+\d+ files, (\d+) tests/);
const red = seeded.match(/npm run repro\s+#\s+\d+ files, (\d+) tests/);
const green = seeded.match(/npm run negative\s+#\s+\d+ files, (\d+) tests/);
if (ground && red && green) {
  const sentence = `${ground[1]} green, ${red[1]} red, ${green[1]} green`;
  if (!read('README.md').includes(sentence)) {
    problems.push(`README.md no longer says "${sentence}", which is what SEEDED.md publishes`);
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`SEEDED.md is out of date: ${problem}`);
  process.exit(1);
}
console.log(
  `SEEDED.md describes the tree: ${String(reports.length)} reports, all accounted for, and the ` +
    'three suite sizes it publishes -- files AND tests -- are the files and the tests on disk.',
);
