**Title:** Late fee on the receipt has about fifteen decimal places

Had a member come to the desk on Saturday to pay off a hammer she'd had for
about two weeks past due. The receipt printed

    Late fee: $3.5000000000000004

and she quite reasonably asked what the last bit was for. I told her it was
four ten-thousandths of a trillionth of a cent and she did not laugh.

It's twelve days late, we forgive two, so ten days at 35c = $3.50. I checked
that on paper twice.

```js
import { lateFee } from './src/fees.js';
console.log(lateFee(12));   // 3.5000000000000004
```

It isn't every amount. `lateFee(7)` gives a clean 1.75. Five days gives
1.0499999999999998, which is worse because it rounds *down* to 1.04 if anyone
ever truncates it.

We take cash at the desk, so I can't actually charge four ten-thousandths of a
trillionth of a cent even if I wanted to.
