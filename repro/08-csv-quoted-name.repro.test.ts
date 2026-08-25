/**
 * Reproduction for issues/08-inventory-import-mangles-a-row.md
 *
 * Spreadsheets quote a field that contains a comma. The importer has to read
 * the quotes.
 */
import { describe, expect, it } from 'vitest';
import { parseInventory } from '../src/csv.js';

const EXPORT = ['id,name,tags,copies', 'TS-001,Claw hammer,hand;carpentry,6', 'TS-014,"Wrench, adjustable",plumbing;hand,4'].join(
  '\n',
);

describe('issue 08: quoted fields survive the import', () => {
  it('keeps a comma inside a quoted name', () => {
    const rows = parseInventory(EXPORT);
    expect(rows[1]?.name).toBe('Wrench, adjustable');
  });

  it('keeps the copy count in the right column', () => {
    const rows = parseInventory(EXPORT);
    expect(rows[1]?.copies).toBe(4);
  });
});
