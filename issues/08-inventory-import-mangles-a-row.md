**Title:** Inventory import breaks on any tool with a comma in its name

Re-imported the shed inventory this morning from the spreadsheet export and
came out with one very strange entry.

The row in the CSV is:

    TS-014,"Wrench, adjustable",plumbing;hand,4

After importing, the catalogue shows a tool called `"Wrench` — with the quote
mark and everything — and its copy count is blank on screen. When I looked at
the JSON the count is `NaN`.

The adjustable wrench is the only tool we own with a comma in its name, which
is presumably why nobody has hit this before. The next row down
(`TS-001,Claw hammer,hand;carpentry,6`) came through perfectly.

Excel and LibreOffice both write it with the quotes like that, so I don't think
I can just export it differently.
