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
 *      true" match the files in `test/`, `repro/` and `negative/`.
 *
 * It is a script rather than a test in `test/` on purpose. `test/` is this
 * repository's ordinary-looking application suite -- it is part of what a tool
 * reads here -- and a meta-test about the documentation does not belong in it.
 *
 * Exits non-zero on any mismatch, and prints every one rather than the first.
 */

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

// 3. The published suite sizes.
for (const [dir, suffix, label] of [
  ['test', '.test.ts', 'npm test'],
  ['repro', '.repro.test.ts', 'npm run repro'],
  ['negative', '.test.ts', 'npm run negative'],
]) {
  // `test/` also holds fixture modules, which are not suites.
  const files = list(dir, suffix).filter((f) => !f.includes('fixtures'));
  const line = seeded.match(new RegExp(`${label.replace(/ /g, '\\s+')}\\s+#\\s+(\\d+) files`));
  if (line === null) {
    problems.push(`SEEDED.md no longer publishes a file count for \`${label}\``);
  } else if (Number(line[1]) !== files.length) {
    problems.push(`${dir}/ holds ${files.length} suites; SEEDED.md says ${line[1]}`);
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`SEEDED.md is out of date: ${problem}`);
  process.exit(1);
}
console.log(`SEEDED.md describes the tree: ${String(reports.length)} reports, all accounted for.`);
