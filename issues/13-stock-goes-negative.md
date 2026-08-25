**Title:** Checking out the last copy twice drives the shelf count to -1

We have one tile cutter. I'm fairly sure I saw the catalogue showing
`available: -1` on it last week after a busy Saturday, which would mean we lent
out a tile cutter we don't have.

I think what happens is two people check it out one after the other and the
count just keeps going down:

```js
const item = createItem({ id: 'TS-001', name: 'tile cutter', copies: 1 });
checkout(item, someone, '2026-06-01');
checkout(item, someoneElse, '2026-06-01');
console.log(item.available);   // -1
```

Haven't managed to make it happen again since, and the count is back to 1 now,
but a negative number of physical objects seems like the sort of thing worth
chasing down.

It's possible I misread the screen and it was a different tool. It was a busy
day.
