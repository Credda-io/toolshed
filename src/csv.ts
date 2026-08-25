import type { ItemSeed } from './catalog.js';

/**
 * Read the shed's inventory export.
 *
 * The file the desk exports has a header row and four columns:
 *
 *     id,name,tags,copies
 *     TS-001,Claw hammer,hand;carpentry,6
 *
 * Names with a comma in them are quoted, the way every spreadsheet writes them:
 *
 *     TS-014,"Wrench, adjustable",plumbing;hand,4
 */
export function parseInventory(text: string): ItemSeed[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '');

  const [header, ...rows] = lines;
  if (header === undefined) return [];

  return rows.map((row) => {
    const cells = row.split(',');
    const [id, name, tags, copies] = cells;
    return {
      id: (id ?? '').trim(),
      name: (name ?? '').trim(),
      tags: (tags ?? '')
        .split(';')
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ''),
      copies: Number(copies),
    };
  });
}
