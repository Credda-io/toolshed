**Title:** Can't place a hold on a tool I currently have out

I have the tile saw out at the moment and I'd like to keep it for another
fortnight, so I went to put a hold on it for when it comes back. The site
refuses:

    Dai Fletcher already has TS-001 on loan -- renew it instead of holding it

Every other lending system I've used lets you queue for something regardless of
who has it, including you. It feels like the site is second-guessing me.

Reproduces every time:

```js
placeHold(holds, loans, me, 'TS-001', Date.now());
// throws HOLD_ON_OWN_LOAN
```

Please just let the hold go through. If I end up behind myself in the queue
that's my problem.
