**Title:** A member renewed one loan nine times

We have a chap who has had the good router since February. I assumed he'd been
coming in and checking it out again each time, but no — it's one loan with
`renewals: 9` on it.

The poster on the wall says two renewals and then it comes back. There's even a
`POSTED_MAX_RENEWALS` constant in `src/policy.ts` set to 2, so somebody meant
for this to be enforced.

I can do it on my own account too. Renew, renew, renew, renew. It never stops.
Never seen it throw the "used all its renewals" error at all, and that error
message is right there in `src/loans.ts`, so it must be reachable in principle.

`DEFAULT_POLICY` doesn't seem to mention renewals at all, if that helps.
