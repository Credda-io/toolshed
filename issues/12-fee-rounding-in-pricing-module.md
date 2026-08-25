**Title:** Rounding in the pricing module is wrong for members with a concession rate

Following on from the decimals thing. I think the actual rounding lives in the
pricing module and it's applying the concession discount before it rounds,
which gives a different answer from doing it the other way round.

Here's the case that shows it:

```js
import { priceLoan } from '../src/pricing.js';

const loan = buildLoanFixture({ daysLate: 12, concession: 'senior' });
const quoted = priceLoan(loan, { round: 'half-up' });

console.log(quoted.total);   // 2.62, desk charged 2.63
```

One cent, but it's one cent every time and the till doesn't balance at the end
of the week.

I got the fixture from the finance spreadsheet rather than the repo, so the
exact numbers might be slightly off, but the shape of it is right.
