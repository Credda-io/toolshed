/**
 * Reproduction for issues/18-inventory-export-runs-a-formula-in-excel.md
 *
 * A cell that begins `=`, `+`, `-` or `@` is executed on open by Excel, Google
 * Sheets and LibreOffice. Item names come from a form members can reach, so the
 * export has to neutralise the leading character -- the usual fix is a leading
 * apostrophe, inside quotes -- rather than pass it through.
 */
import { describe, expect, it } from 'vitest';
import { exportInventory } from '../src/csv.js';
import type { ItemSeed } from '../src/catalog.js';

const named = (name: string): ItemSeed => ({ id: 'TS-001', name, tags: ['hand'], copies: 1 });

const dataRow = (name: string): string =>
  exportInventory([named(name)]).split('\n')[1] ?? '';

describe('issue 18: the export does not hand a spreadsheet a formula', () => {
  it('neutralises a name beginning with =', () => {
    const row = dataRow('=HYPERLINK("http://attacker.example","click")');
    expect(row).not.toMatch(/,=HYPERLINK/);
    expect(row).toMatch(/,"'=HYPERLINK/);
  });

  it('neutralises the other three formula leaders', () => {
    for (const leader of ['+', '-', '@']) {
      expect(dataRow(`${leader}1+1`), `leader ${leader}`).toMatch(/,"'/);
    }
  });
});
