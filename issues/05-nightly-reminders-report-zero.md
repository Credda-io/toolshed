**Title:** Overdue reminder job always reports 0 sent (but people do get the emails)

The branch dashboard has a tile that says how many overdue reminders went out
last night. It has said **0** every single morning since we turned it on.

Members definitely receive them, so it isn't that nothing is being sent. It's
the number that's wrong.

I put a `console.log` in the nightly script:

```js
const result = await sendReminders(loans, members, today, sink);
console.log('sent', result.sent);   // sent 0
```

There were eleven overdue loans that night.

Something else that may or may not be related: our dry-run mode collects the
reminders into an array instead of mailing them, and prints the array at the
end. That prints `[]`. If I put a `setTimeout` around the print it shows all
eleven. So the function seems to come back before it's actually finished?
