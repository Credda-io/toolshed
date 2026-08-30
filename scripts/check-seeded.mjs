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
