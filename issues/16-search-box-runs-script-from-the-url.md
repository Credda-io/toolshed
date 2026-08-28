**Title:** Reflected XSS in the shelf browser search results (security)

The shelf browser echoes the search term into the results heading without
encoding it. Anything in the `q` parameter is inserted into the page as HTML.

Proof of concept -- a link a member could be sent, which runs script in their
session on your origin:

    /shelf?q=%3Cimg%20src%3Dx%20onerror%3Dalert(document.cookie)%3E

The rendered page contains, verbatim:

    <h1>Results for "<img src=x onerror=alert(document.cookie)>"</h1>

Because the same page is served to a signed-in member, and the session cookie
is what the portal uses to decide who you are, this is enough to take over an
account with one link. The "nothing matches" branch reflects the term a second
time, so an empty result set does not save you.

Reported under your security policy. Happy to hold off publishing.
