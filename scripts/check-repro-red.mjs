/**
 * Every seeded defect is still seeded -- one file at a time.
 *
 * CI used to prove this by running `npm run repro` and requiring a non-zero
 * exit. A non-zero exit means *at least one* of the fourteen reproductions
 * failed. It does not mean all fourteen did, so a seeded defect could be fixed
 * -- by a refactor, by a dependency bump, by somebody being helpful -- and the
 * suite would stay red on the other thirteen while the answer key went on
 * claiming a defect that is no longer there. The subject of that check was the
 * whole directory; what it needed to be was each file in it.
 *
 * So this runs the same suite, reads the per-file results, and requires that
 * EVERY reproduction in `repro/` still fails, that no test in it is skipped,
 * and that the set of files vitest reported is the set on disk -- a file vitest
 * never collected would otherwise pass by being absent.
 *
 * It prints every problem rather than the first, and exits non-zero on any.
 * `negative/` is the other half and is checked by running it normally: those
 * are the reports that must produce nothing, so they are green.
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const onDisk = readdirSync(join(root, 'repro'))
  .filter((name) => name.endsWith('.repro.test.ts'))
  .sort();

if (onDisk.length === 0) {
  console.error('repro/ holds no reproductions at all; there is nothing to prove.');
  process.exit(1);
}

const scratch = mkdtempSync(join(tmpdir(), 'toolshed-repro-'));
const output = join(scratch, 'results.json');
let report;
try {
  spawnSync(
    process.execPath,
    [join(root, 'node_modules', 'vitest', 'vitest.mjs'), 'run', '--dir', 'repro', '--reporter=json', `--outputFile=${output}`],
    { cwd: root, stdio: ['ignore', 'ignore', 'inherit'] },
  );
  report = JSON.parse(readFileSync(output, 'utf8'));
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

/** file name -> { failed, passed, skipped } */
const seen = new Map();
for (const file of report.testResults ?? []) {
  const name = file.name.split('/').pop();
  const tally = seen.get(name) ?? { failed: 0, passed: 0, skipped: 0 };
  for (const assertion of file.assertionResults ?? []) {
    if (assertion.status === 'failed') tally.failed += 1;
    else if (assertion.status === 'passed') tally.passed += 1;
    else tally.skipped += 1;
  }
  seen.set(name, tally);
}

const problems = [];
for (const name of onDisk) {
  const tally = seen.get(name);
  if (tally === undefined) {
    problems.push(`repro/${name} was never run -- vitest collected no tests from it`);
    continue;
  }
  if (tally.failed + tally.passed + tally.skipped === 0) {
    problems.push(`repro/${name} contains no tests`);
    continue;
  }
  if (tally.skipped > 0) problems.push(`repro/${name} skips ${tally.skipped} test(s); a skipped reproduction proves nothing`);
  if (tally.failed === 0) {
    problems.push(
      `repro/${name} passed. The defect it reproduces has been fixed; update SEEDED.md and issues/ to match, or remove the case.`,
    );
  }
}
for (const name of seen.keys()) {
  if (!onDisk.includes(name)) problems.push(`vitest reported ${name}, which is not a .repro.test.ts file in repro/`);
}

/*
 * SEEDED.md publishes the size of this suite as "14 files, 28 tests, ALL FAIL".
 * `check-seeded.mjs` can count the files from the directory listing; only a run
 * knows how many tests there are, so the second number is checked here.
 */
const totalTests = [...seen.values()].reduce((n, t) => n + t.failed + t.passed + t.skipped, 0);
const claimed = readFileSync(join(root, 'SEEDED.md'), 'utf8').match(/npm\s+run\s+repro\s+#[^\n]*?(\d+) tests/);
if (claimed === null) {
  problems.push('SEEDED.md no longer publishes a test count for `npm run repro`');
} else if (Number(claimed[1]) !== totalTests) {
  problems.push(`repro/ holds ${String(totalTests)} tests; SEEDED.md says ${claimed[1]}`);
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`::error::${problem}`);
  process.exit(1);
}
console.log(`All ${String(onDisk.length)} reproductions still fail, as designed.`);
