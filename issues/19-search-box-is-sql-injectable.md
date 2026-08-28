**Title:** SQL injection in the shelf browser search (security)

Standard test string in the search box:

    ' OR 1=1 --

The page came back with no results at all, which is what made me suspicious --
a correctly escaped search for that string should just find nothing, but a
broken query would also show nothing if it errored and got swallowed.

I also tried

    hammer'; DROP TABLE items; --

and nothing appeared to happen, which could mean the statement was rejected or
could mean it ran on a table that doesn't exist yet.

Filing it because the behaviour is ambiguous from the outside and I would rather
be wrong loudly than quiet. Please confirm the search query is parameterised.
