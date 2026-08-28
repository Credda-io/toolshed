**Title:** A tool name in the weekly inventory export executes as a formula (security)

We renamed one of the loaner laptops in the catalogue to

    =1+1

as a joke, and the weekly export opened in Excel with `2` in the name column
rather than the name.

That is funny. This is not: a member can set an item name through the "suggest a
correction" form, and the desk opens `inventory.csv` on the branch machine every
Monday. A cell beginning with `=`, `+`, `-` or `@` is executed by Excel, Google
Sheets and LibreOffice when the file is opened, and the formula languages in all
three can reach outside the sheet -- `=HYPERLINK` to exfiltrate, `=cmd|...` on
Windows to run a program.

So the export is a way of running something on the desk's machine, using a
field members can influence, once a week, reliably.

The quoting itself looks right -- names with commas come out correctly. It is
specifically that nothing is done about a leading formula character.
