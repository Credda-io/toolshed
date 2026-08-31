# Security

## Read this before reporting anything

**This repository contains vulnerabilities on purpose.** Four of them, listed by
name, class and location in [SEEDED.md](SEEDED.md): broken access control in
`handleMyLoans`, reflected XSS in `renderSearchPage`, regex injection with a
denial of service behind it in `filterByTagPattern`, and CSV formula injection
in `exportInventory`. They are the exhibit. They are not going to be fixed, and
reporting them is not a finding.

Nothing here is deployed anywhere. There is no server, no database and no
network call in this repository; the "portal" is a set of pure functions that
take a request record and return a response record. Nobody's data is at risk.

**Do not copy any of `src/` into something real.**

## The line we do not cross

Every seeded vulnerability is **code written for this repository**, in `src/`,
marked as deliberate in its own docblock and listed in `SEEDED.md`.

**No dependency has been pinned to a vulnerable version, and none ever will
be.** Seeding a real CVE into a real package would make this repository a
distribution channel for it, would fire every scanner pointed at anything that
installs it, and would be somebody else's code rather than an exhibit of ours.
`npm audit` on this repository is clean and is meant to stay clean.

If `npm audit` here is not clean, that is a genuine problem and we want to hear
about it.

## Reporting a vulnerability that is genuinely ours

Two kinds count:

- A vulnerability in this repository that is **not** in `SEEDED.md`. That is a
  defect we did not intend, and it is welcome -- open a normal issue, since
  nothing here is deployed.
- A vulnerability in Credda itself, or in one of the other Credda repositories.
  Use **GitHub's private vulnerability reporting** on the repository concerned:
  the Security tab, then "Report a vulnerability". Please do not open a public
  issue for something exploitable. If you would rather not use GitHub, email
  [security@credda.io](mailto:security@credda.io?subject=Security%20disclosure),
  the address published at
  [credda.io/.well-known/security.txt](https://credda.io/.well-known/security.txt).
  Expect acknowledgement within 3 business days and an initial severity call
  within 10. There is no paid bounty programme. The org-wide policy is
  [`Credda-io/.github/SECURITY.md`](https://github.com/Credda-io/.github/blob/main/SECURITY.md).
