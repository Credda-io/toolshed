**Title:** Everything checked out in late October comes due a day early

This is the third year in a row and I finally have a clean example.

Riverside branch (we're on New York time). Member checks a tool out on
**25 October 2026**. Standard 14-day loan. The slip prints **7 November**.
Every other branch that day printed 8 November for the same loan.

I counted it out on the wall calendar. 25 October plus fourteen days is
8 November. It is not 7 November.

```js
addDays('2026-10-25', 14, 'America/New_York')   // '2026-11-08' surely?
```

Our sister branch in Reykjavik doesn't have this and their clocks don't move,
which is why I think it's the clocks. It only ever seems to happen for loans
that straddle the first weekend of November. In March everything is fine.

The knock-on is that the overdue emails go out a day early too, and then people
turn up cross having been told they're late when they aren't.
