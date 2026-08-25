import { ToolshedError, type Item } from './types.js';

/**
 * What a tool gets when the desk adds it without filling anything in: one copy,
 * on the shelf, filed under "uncategorised" until somebody sorts the bin.
 */
const SHELF_DEFAULTS = {
  tags: ['uncategorised'],
  copies: 1,
};

export interface ItemSeed {
  id: string;
  name: string;
  tags?: string[];
  copies?: number;
}

/** Build a catalogue entry, filling in whatever the desk left blank. */
export function createItem(seed: ItemSeed): Item {
  const merged = { ...SHELF_DEFAULTS, ...seed };
  return {
    id: merged.id,
    name: merged.name,
    tags: merged.tags,
    copies: merged.copies,
    available: merged.copies,
  };
}

/** File an item under one more tag. */
export function tagItem(item: Item, tag: string): Item {
  if (!item.tags.includes(tag)) {
    item.tags.push(tag);
  }
  return item;
}

/**
 * Shelf browser search. Matches on name and tags, and is meant to ignore case
 * -- members type "hammer" and the label says "Hammer".
 */
export function search(items: readonly Item[], query: string): Item[] {
  const needle = query.trim();
  if (needle === '') return [...items];
  return items.filter((item) => item.name.includes(needle) || item.tags.some((tag) => tag.includes(needle)));
}

/** Everything with at least one copy on the shelf. */
export function findAvailable(items: readonly Item[]): Item[] {
  return items.filter((item) => item.available > 0);
}

export function requireItem(items: readonly Item[], itemId: string): Item {
  const found = items.find((item) => item.id === itemId);
  if (!found) {
    throw new ToolshedError(`no catalogue entry ${itemId}`, 'UNKNOWN_ITEM');
  }
  return found;
}
