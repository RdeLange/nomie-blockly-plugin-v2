// The tutorials of the example library, in English (the Detailed tab of each example). Each one says what the example
// builds, what the user needs first, and then the steps, with the exact blocks and where to find them. The steps are
// numbered in the text, so the Detailed tab reads like a lesson. The keys are the names of the examples.
export const TUTORIAL_EN: Record<string, string> = {
  'example-hello': `What you build: a workspace that writes two lines to the console and one message from Nomie.

Step 1: Open the Nomie group. In the block drawer on the left, open the Nomie group. Find the Scheduler block and drag it onto the empty canvas.

Step 2: Add the console line. Open the Write and show section and drag the console block into the Scheduler, into its script. The Scheduler is the part that runs, so every block you want to run goes inside it.

Step 3: Give the line some text. Open the Text group and drag a text block into the Value of the console block. Click the text and type: Hello from the console.

Step 4: Add a second line. Drag another console block under the first one, and plug a text block into it with the text Hello from the browser console. The console will show the lines in the order they come.

Step 5: Show a message from Nomie. Drag a message block under the second line and give it a text block with Hello from a message.

Check it: press Run. The Console tab in the panel shows the two lines, one after the other. The message appears as a notice from Nomie.

Try next: change the texts and run again. Notice that the console keeps the lines from the last run only.`,

  'example-yesterday-mood': `What you build: one sentence that tells you the average mood of yesterday, read from your notes.

What you need: a tracker in Nomie called #mood, with some notes on yesterday. Without notes the sentence shows a zero, which is correct.

Step 1: Add the Scheduler. In the Nomie group, drag the Scheduler onto the canvas.

Step 2: Add a message. Inside the Scheduler, put a message block from the Nomie group. The message is what Nomie shows you when the run ends.

Step 3: Join two parts. Drag a join block into the message. A join glues several texts and values together, and it has as many inputs as you need. Use the mutator (the small gear on the block) to add a third input if you want more parts.

Step 4: Write the first part. Plug a text block into the first input of the join, and type: Your average mood yesterday was.

Step 5: Read the value. Drag a day value block into the second input of the join. Fill its three inputs: plug a tracker block into Tracker and type #mood, plug a day picker into Day and choose yesterday, and plug a statistics picker into Statistics and choose average.

Check it: press Run. The message reads your sentence and the number. Change the day picker to today and run again.

Try next: add a text block with a full stop at the end, or use the round block from the Math group to remove the decimals.`,

  'example-mood-period': `What you build: a sentence with the average mood of the last 30 days, rounded to a whole number.

Step 1: Start from the yesterday example. If you have it, copy its Scheduler with its message. If not, add a Scheduler and a message from the Nomie group.

Step 2: Add a period value. Open the Nomie group and find the period value block. It works like the day value block, but it covers a range of days. Put it in the message's join.

Step 3: Choose the tracker and the period. Plug a tracker block with #mood into Trackable. Plug a period picker into Period and choose Last 30 days. Plug a statistics picker into Statistics and choose average.

Step 4: Round the number. Drag a round block from the Math group, and put the period value in its number input. Leave the round option as it is: this removes the decimals.

Step 5: Write the sentence. Put a text block in front of the round block that reads: Your average mood over the last 30 days is.

Check it: press Run. The message shows the sentence with a whole number at the end.

Try next: change the period picker to Last 7 days, and the sentence changes with it. This is the pattern for weekly and monthly summaries: change the period and the statistic, and the same blocks answer a different question.`,

  'example-log-value': `What you build: a note in your Nomie timeline for each day that the workspace runs, with a value for the tracker #goodday.

What you need: a daily schedule. This example writes to your notes, so you test it first.

Step 1: Add the Scheduler and set it to daily. In the Nomie group, drag the Scheduler onto the canvas. In the Details tab of the panel, choose Daily. The workspace then runs once a day.

Step 2: Add the log value block. Inside the Scheduler, drag the log value block from the Nomie group.

Step 3: Give it a value. Drag a number block into its Value input and type 1.

Step 4: Choose the tracker. Drag a tracker block into the Tracker input and type #goodday. Nomie creates the tracker if it does not exist yet.

Step 5: Choose the day. Drag a day picker into the Date input and choose today.

Step 6: Test it first. Turn on the Test switch in the Run tab. Press Run. The Console shows the line Would log, with the day, and no note is written.

Check it: when you turn the Test switch off and press Run, a note with #goodday(1) appears in your timeline for today.

Try next: use a text block and a join block to write the day into the message as well, or use the Yesterday button to see how a run for yesterday works.`,

  'example-wait': `What you build: two console lines, with a pause of one second between them.

Step 1: Add the Scheduler. Drag the Scheduler from the Nomie group onto the canvas.

Step 2: Add the first line. Inside the Scheduler, drag a console block from the Write and show section, and plug a text block into it: First line.

Step 3: Add the pause. Under the first line, drag the wait block (type wait in the search at the top of the drawer to find it). Set its seconds to 1.

Step 4: Add the second line. Under the wait block, add another console block with the text: Second line, one second later.

Check it: press Run. The console shows the first line, and the second one appears a second later. The run stops during the wait, and you can see it in the status above the canvas.

Try next: change the wait to 3 seconds. Use waits sparingly: every second counts towards the time a run may take, and a run is stopped after five minutes.`,

  'example-pickers': `What you build: one message that shows what each picker chooses, so you can see the picker values before you use them.

What you need: nothing else. The pickers are the small blocks that choose a value: a tracker, a day, a period, a statistic and a date.

Step 1: Add the Scheduler and a message. From the Nomie group, drag the Scheduler onto the canvas, and put a message block inside it.

Step 2: Add a join. Drag a join block into the message. You will fill it with texts and pickers, one after the other.

Step 3: Add the tracker. Put a text block with Tracker: first. Then drag a tracker block with #mood beside it.

Step 4: Add the day and the period. Add a text block with | Day: , then a day picker set to yesterday. Add the text | Period: , then a period picker set to Last 7 days.

Step 5: Add the statistic and the date. Add the text | Statistic: and a statistics picker set to average. Finish with | Date: and a date picker, where you type a date such as 2026-11-01.

Check it: press Run. The message lists each picker with its value.

Try next: change a picker in its dropdown and run again. Every block that reads or writes notes takes its tracker, day or period from pickers like these.`,

  'example-history': `What you build: two lines from your notes. The first gives your last mood value, from the last 14 days. The second counts the days since #mood was last logged.

What you need: a tracker #mood in Nomie, with some notes. The history looks back in your notes, so a new account shows nothing yet.

Step 1: Add the Scheduler. Drag it from the Nomie group onto the canvas, and set it to daily in the Details tab.

Step 2: Add the last value. Inside the Scheduler, add a message. In its join, drag a last value block from the Nomie group. Plug #mood into its Tracker input, and set the number of days to 14. The block finds the latest note with that tracker, in the last 14 days.

Step 3: Write the first line. Put a text block before the last value, with the words: Last mood:.

Step 4: Add the second line. Under the message, add a second message. Drag a days since block into its join, with a tracker #mood in its input.

Step 5: Write its text. Before the days since block, add a text block with the words: Days since #mood was logged:.

Check it: press Run. Both messages come from the same notes, so they agree with each other. Without notes, the first line is empty and the second counts from zero.

Try next: change the 14 to 60 days, and see how the last value changes.`,

  'example-streak': `What you build: a streak counter. It shows how many days in a row a tracker was logged, and it congratulates you when the streak is three days or more.

What you need: a tracker #habit in Nomie, logged on some days.

Step 1: Add the Scheduler and a message. From the Nomie group, drag the Scheduler onto the canvas and put a message inside it.

Step 2: Add an if block. Drag an if block from the Logic group into the Scheduler, above the message.

Step 3: Build the condition. Drag a compare block from the Logic group into the if input. Put the streak block from the Nomie group on the left, and a number block with 3 on the right. Choose the operator greater than or equal.

Step 4: Set the tracker. Plug a tracker block with #habit into the streak block. Read its tooltip: the streak counts at most 60 days, up to the day of the run.

Step 5: Add the two messages. Inside the if, add a message with: Three days in a row, well done! Click the gear on the if block, add an else branch, and put a message in it with: Keep going.

Check it: press Run. Without a streak, the else message shows. Try the example with notes on three days in a row to see the first message.

Try next: change the number 3 to 7, and turn the streak into a weekly goal.`,

  'example-write-note': `What you build: a free-text note in your Nomie timeline, written for yesterday. It is a simple way to write a summary or a reminder.

What you need: a daily schedule. The example writes to your notes, so test it first.

Step 1: Add the Scheduler and set it to daily. Drag the Scheduler from the Nomie group onto the canvas, and choose Daily in the Details tab.

Step 2: Add the log note block. Inside the Scheduler, drag the log note block from the Nomie group.

Step 3: Write the text. Plug a text block into the note's Text input, with the words: Reviewed the week #review. The hashtag makes Nomie create the tracker #review if it does not exist.

Step 4: Set the day. Plug a day picker into the Date input and choose yesterday. The note is written for yesterday.

Step 5: Test first. Turn on the Test switch in the Run tab and press Run. The console shows the note it would write, and no note is saved.

Check it: turn the Test switch off and press Run. The note appears in your timeline for yesterday, with the review tag.

Try next: write a weekly summary with a join block and a period value block, so the note tells you your average for the week.`,

  'example-location': `What you build: a message with your position, or a clear message when the position is not known.

What you need: location permission for Nomie. Nomie asks the first time, and you can change it later in your device's settings.

Step 1: Add the Scheduler and a message. Drag the Scheduler from the Nomie group onto the canvas, and put a message inside it.

Step 2: Add the my location block. Drag it from the Nomie group into the message.

Step 3: Add a text in front. Put a join block in the message, a text block with the words: You are at, and the my location block after it.

Step 4: Run it as a test. Turn on the Test switch in the Run tab and press Run. Nomie asks for permission the first time: allow it to see the position.

Check it: the message shows a latitude and a longitude. If nothing appears, the position was not available. That is why each use of my location should have a fallback, such as a text that says the position is unknown.

Try next: add an if block that checks whether the result is empty, and show a text in the else branch instead.`,

  'example-open-link': `What you build: a block that opens a web page inside Nomie, such as a dashboard of your own.

Step 1: Add the Scheduler. Drag it from the Nomie group onto the canvas.

Step 2: Add the open link block. Inside the Scheduler, drag the open link block from the Nomie group.

Step 3: Give it an address. Plug a text block into the link input, with the full address of the page, starting with https.

Step 4: Test it. Press Run from the editor. A manual run opens the page in a window inside Nomie.

Check it: the window opens with the page. If you run the workspace on a schedule, the block only writes Would open to the output, so a schedule never opens a window.

Try next: keep the address in a secret or a text you can change, and only use addresses you trust. A workspace shared with someone else runs the same address on their device.`,

  'example-fetch-page': `What you build: a call to a web address, with the answer shown in the console.

What you need: an internet connection, and an address you trust. The example uses a public address, and a shared workspace runs its addresses on the device of whoever adds it.

Step 1: Add the Scheduler. Drag it from the Nomie group onto the canvas.

Step 2: Add the fetch block. Inside the Scheduler, drag the request block from the Nomie group.

Step 3: Give it an address. Plug a text block into the address input, with a page you trust. Start with https.

Step 4: Show the answer. Drag a console block from the Write and show section below the fetch, and plug the request block into its Value.

Check it: press Run. The console shows the answer as text, often the start of a web page or a list in JSON.

Try next: most services answer with JSON. The object blocks in the Objects example show how to read one, step by step.`,

  'example-widget-value': `What you build: a dashboard widget with a number, a small trend and a footer.

What you need: nothing special. The widget is kept after a run, so you must run the workspace once.

Step 1: Add the Scheduler and set it to daily. From the Nomie group, drag the Scheduler onto the canvas, and choose Daily in the Details tab.

Step 2: Add the dashboard block. Inside the Scheduler, drag the dashboard block from the Nomie group. Give it a name, such as Mood, and an emoji, such as a smiley. The name and the emoji show in the header of the widget.

Step 3: Add the value. Inside the dashboard, drag the value block from the dashboard widget section. Put a period value block into it, with the tracker #mood, the period Last 7 days and the statistic average. Give the value a label: 7-day average.

Step 4: Add the trend. Under the value, drag the trend block. Plug in #mood, and give it the label Last 14 days.

Step 5: Add the footer. Last, drag the footer block and type: Updated every morning.

Check it: press Run once. Then open the Preview section at the bottom of the Run tab. It shows the widget as the dashboard will show it. A preview is a test run, so no notes are written.

Try next: change the label of the value, or the period, and preview again.`,

  'example-widget-charts': `What you build: a dashboard with two charts of the same tracker. The first is a line chart over 30 days, the second a bar chart over 7 days.

What you need: a tracker #mood in Nomie, with notes on several days, so the charts have something to draw.

Step 1: Add the Scheduler and set it to daily. From the Nomie group, drag the Scheduler onto the canvas.

Step 2: Add the dashboard. Inside the Scheduler, drag the dashboard block, and give it the name Mood charts and an emoji such as a chart.

Step 3: Add the line chart. Inside the dashboard, drag the line chart block from the dashboard widget section. Plug #mood into its Tracker input. Set the days to 30, the colour to blue and the label to Last 30 days.

Step 4: Add the bar chart. Under the line chart, drag the bar chart block. Plug in #mood again, set the days to 7, the colour to green and the label to Last 7 days.

Step 5: Preview it. Press Run once, then open the Preview section in the Run tab.

Check it: the line joins the days with a line, and a day without a note is a gap. The bars show one bar for each of the last 7 days. Both come from the same notes, drawn in two ways.

Try next: change the colour of the bars to see how the widget looks in your Nomie theme.`,

  'example-widget-html': `What you build: a dashboard widget with your own HTML, filled with a value from your notes.

What you need: a tracker #mood with notes on some days, for the value to show.

Step 1: Add the Scheduler and set it to daily. Drag the Scheduler from the Nomie group onto the canvas.

Step 2: Add the dashboard. Inside the Scheduler, drag a dashboard block and give it the name Mood HTML.

Step 3: Add the HTML block. Inside the dashboard, drag the HTML block from the dashboard widget section. In its text box, write: <p>Average mood: <b>{{mood}}</b></p>. The placeholder {{mood}} is replaced by a value when the widget runs.

Step 4: Add a parameter. Under the HTML block, in its parameters, drag a parameter block. Its name is mood, the same as the placeholder. Its value is a period value block with #mood, the period Last 7 days and the average statistic.

Step 5: Preview it. Press Run once and open the Preview section in the Run tab.

Check it: the widget shows the average mood in bold. The HTML is cleaned before it is shown: scripts and links are removed, and images must come from https.

Try next: add a second placeholder, such as {{count}}, with another parameter block that counts the notes.`,

  'example-remember': `What you build: a workspace that counts its own runs. It keeps the count from one run to the next, and it forgets the count on the third run.

What you need: nothing. This example only uses the workspace's own memory.

Step 1: Add the Scheduler and set it to daily. Drag the Scheduler from the Nomie group onto the canvas.

Step 2: Remember a new count. Inside the Scheduler, drag a remember block. Name it runs. Its value is an arithmetic block with the add operator: on the left a recall block named runs with the default 0, and on the right the number 1.

Step 3: Show the count. Drag a message block below, with a join: the text This workspace has run, a recall block named runs with the default 0, and the text times.

Step 4: Forget on the third run. Add an if block. Its condition is a compare block: the recall block named runs equal to 3. Inside the if, add a forget block named runs, and a message that says the count is forgotten.

Check it: press Run three times. The count goes 1, 2, 3, and on the third run the message says the count is forgotten. The next run starts again from 0.

Try next: change the number 3 to 5 to remember a longer streak.`,

  'example-secret': `What you build: a workspace that uses a key from Settings, without writing the key into the blocks.

What you need: a secret named EXAMPLE_KEY in Settings. Open Settings in the plugin, and add the secret with that name and your key.

Step 1: Add the key to Settings. Open Settings, and add a secret named EXAMPLE_KEY. The key itself is never shown in the blocks.

Step 2: Add the Scheduler. From the Nomie group, drag the Scheduler onto the canvas.

Step 3: Add the secret block. Inside the Scheduler, add a message. Drag a secret block from the Nomie group into it, and choose EXAMPLE_KEY.

Step 4: Run it. Press Run. The message shows the secret as four dots, so the key never appears in the output.

Check it: if the secret is missing, the run stops and tells you which one to add. Test it by renaming the secret in Settings and running again.

Try next: use the secret in a web address, with a join block. Shared files never carry your key, so you can send the workspace to someone else safely.`,

  'example-when-note': `What you build: a workspace that runs when a note with a certain tracker is saved, instead of on a schedule.

What you need: a tracker #run in Nomie. Any note with that tracker starts the workspace.

Step 1: Add the When-note block. In the Nomie group, drag the when-note block onto the canvas, and type the tracker #run in its field.

Step 2: Add a message. Inside the when-note block, add a message from the Nomie group.

Step 3: Read the note. In the message, join three blocks from the Nomie group: a note value block with #mood, a note text block, and a note day block. Put a text in front of each, so the message reads clearly.

Step 4: Try it. In Nomie, write a note with #run and #mood(4). Save it.

Check it: Nomie runs the workspace, and the message shows the mood value 4, the text of the note and its day. Outside a note run, these blocks give nothing, and the pre-run check tells you so.

Try next: add an if block that checks the mood value, and show a different message when it is below 3.`,

  'example-loop-days': `What you build: loops in two forms. A repeat block runs its blocks a set number of times, and a for block counts with a variable.

Step 1: Add the Scheduler. From the Nomie group, drag the Scheduler onto the canvas.

Step 2: Add a repeat block. In the Loops group, drag the repeat block into the Scheduler. Set its number of times to 3. Inside it, add a console block with the text Repeated.

Step 3: Add a for block. Under the repeat block, drag a for block from the Loops group. Its variable is i, its start is 1, its end is 5, and its step is 1.

Step 4: Show the counter. Inside the for block, add a message: join a text block with Step and the variable i from the Variables group.

Check it: press Run. The console shows Repeated three times, and then five lines Step 1 to Step 5. Loops are how a workspace covers many days or notes in one run.

Try next: change the end of the for block to 30, and count days with a daily schedule.`,

  'example-while-break': `What you build: a counter that repeats while a condition holds, and stops early with a break.

Step 1: Set the variable. Add a set block from the Variables group, with the variable n and the number 0.

Step 2: Add a while loop. Drag a while loop from the Loops group under the set block. Keep it on while, and build the condition with a compare block: n less than 10.

Step 3: Add the if inside the loop. Inside the while loop, drag an if block. Its condition is a compare block: n equal to 4.

Step 4: Break out of the loop. Inside the if, add a break block from the Loops group.

Step 5: Show and count. Under the if, inside the loop, add a console block with n, and a change block that adds 1 to n.

Check it: press Run. The console shows the numbers 0 to 3, and then the loop stops at 4.

Try next: move the break to a different number. Be careful to change the variable inside the loop, or it never ends. The run also stops after a very large number of steps, so it cannot hang forever.`,

  'example-list-loop': `What you build: a for-each loop that goes through a list of three days, one item at a time.

Step 1: Add the for-each block. In the Loops group, drag a for-each block onto the canvas. Set its variable to item.

Step 2: Add the list. Drag a create list block from the Lists group into the for-each's list input. Add three text blocks to it, with the words Monday, Tuesday and Wednesday. Use the gear on the list block to add the inputs.

Step 3: Show each item. Inside the for-each, add a console block, and put the item variable in it.

Check it: press Run. The console shows the three items in order.

Try next: put a list of numbers in the list, and use a sum block from the Math group to add them up.`,

  'example-decide': `What you build: a decision with an if block, an else branch and logic blocks, plus a ternary block that picks a value in one line.

Step 1: Add the if block. Drag an if block from the Logic group onto the canvas, and click its gear to add an else branch.

Step 2: Build the condition. Drag an and block into the if input. Into its left side, put a compare block: 3 less than 5. Into its right side, put a not block, with a compare block inside it: 2 greater than 7.

Step 3: Add the two messages. Inside the if, add a message with Both are true. Inside the else branch, add a message with Something is not right.

Step 4: Pick a value in one line. Below the if, drag a ternary block into a console block. Its condition is the true block, and it picks yes for the then value and no for the else value.

Check it: press Run. The first message shows the else text, because the not block makes the condition false. Change the numbers in the compare blocks and run again to see both branches.

Try next: add a second compare block to the and, and use an or block for a different condition.`,

  'example-numbers': `What you build: a small calculator. Each line of the console shows one of the math blocks at work.

Step 1: Add a console block for each sum. Drag a console block from the Write and show section onto the canvas, and put an arithmetic block in it: 2 plus 3.

Step 2: Add more operations. Add more console blocks, each with one block from the Math group: a multiply block, a square root block, a sine block from the trigonometry block, and the constant pi.

Step 3: Check whether a number is even. Add a number property block with the even option, and a number block with 4 in it.

Step 4: Add a modulo. Use the modulo block to get the remainder of 17 divided by 5.

Check it: press Run. Each line shows its result. Read the console labels to match each line to its block.

Try next: put the results into variables, and combine them in a single message.`,

  'example-random-average': `What you build: a set of values that change on each run: random numbers, a rounded value, the average of a list, and a constrained value.

Step 1: Add the random blocks. Drag a random integer block from the Math group into a console block. Set its limits to 1 and 10. Add a random fraction block next, which gives a number between 0 and 1.

Step 2: Round up. Put a round block with the option round up around a number block, and show it.

Step 3: Find the average of a list. Use a list of numbers in a create list block, and the average option of the list math block.

Step 4: Keep a value in range. Use a constrain block with the value 15, the low limit 0 and the high limit 10. The result is 10.

Check it: run the workspace several times. The random values change each time, and the rest stays the same.

Try next: use the random integer block to pick a day from a list, with the index of the list.`,

  'example-text-tools': `What you build: a set of text blocks at work. Each result goes to the console on its own line.

Step 1: Add the length. Drag a length block from the Text group onto a console block, and put a text block in it with the word Nomie.

Step 2: Change the case. Add a change-case block and a text block. Choose upper case.

Step 3: Trim the spaces. Add a trim block with a text that has spaces at both ends.

Step 4: Find a word. Add an index-of block that finds the position of the word blue in a text.

Step 5: Take a part. Add a get-substring block that cuts out the first five letters of a text.

Check it: press Run. Each line shows its result. Compare each block with the line it produces.

Try next: join two texts with a join block, and show the length of the result.`,

  'example-lists': `What you build: a list, and the list blocks at work on it: the length, an empty check, the position of an item, the item at a position, a change, and sorting.

Step 1: Add the length. Drag a length block from the Lists group into a console block, and put a create list block in it, with the texts a, b and c.

Step 2: Check if it is empty. Add an is-empty block with an empty create list block, and show the result.

Step 3: Find a position. Add a find-position block that finds the first b in a list of a and b.

Step 4: Get an item. Add a get-item block for the first item, and a get-from-end block for the item at position 1 from the end.

Step 5: Change an item. Set the variable days to a list of Mon and Tue. Use a set-item block to change the first item to Sun, then show days.

Step 6: Split and sort. Split the text mon,tue,wed with a comma into a list, and sort a list of numbers 3, 1 and 2.

Check it: press Run. Each step shows its result, so you can follow what the list looks like at each point.

Try next: put the sorted numbers into a message with a join block.`,

  'example-functions': `What you build: two functions, one that returns a value and one that does something. A function is a set of blocks with a name that you can call again.

What you need: nothing. The example is a complete small program in one workspace.

Step 1: Define the double function. In the Functions group, drag a function block with a result onto the canvas. Name it double, and add a parameter n with the gear.

Step 2: Add the early return. Inside the function, add an if-return block. Its condition is n less than 0, and its value is 0. When n is below zero, the function stops there, and the rest is skipped.

Step 3: Return the result. Under the if-return, put the return block with the value n multiplied by 2.

Step 4: Define the greet function. Drag a function block without a result, name it greet and add the parameter who. Inside it, show a message that joins Hello and who.

Step 5: Call them. Below the definitions, in the Scheduler, show a call to double with the number 21, and a call to greet with the text Nomie.

Check it: press Run. The console shows 42, and then Hello Nomie.

Try next: define a function that calls double, so one function uses another.`,

  'example-objects': `What you build: a small record, and the blocks that read and change it. Objects hold named fields, and the JSON blocks read and write text in the same shape.

Step 1: Create an object. In the Objects group, drag a create object block onto a console block. Add two fields with the gear: temp, with the number 18, and mood, with the number 7.

Step 2: Read a field. Add a get block that reads temp from an object made from JSON text. Use the text {"temp": 18, "mood": 7} in a from-JSON block.

Step 3: List the keys. Add a keys block on the same object, and show the result.

Step 4: Read a value from JSON. Add a value-from-key block, with the key mood and the from-JSON object.

Step 5: Write JSON. Add an object-to-JSON block that turns an object back into text.

Step 6: Change a field. Use the set block with the field mood and the number 9.

Check it: press Run. Each console line shows its result. Web services answer with JSON, so this is the pattern to read their answers.

Try next: read the mood from the object and show it in a sentence.`,

  'example-try-catch': `What you build: a block that tries to read bad data, and catches the error without stopping the run.

Step 1: Add a try block. In the Advanced group, drag a try and catch block onto the canvas. Its parameter is error.

Step 2: Put a risky block in try. Inside try, add a console block with a from-JSON block that reads the text {not json, which is not valid JSON.

Step 3: Catch the error. Inside catch, add a message: join the text Could not read the data with the error variable.

Step 4: Add a finally. Click the gear on the block and add a finally part. Put a console block in it with the text Done either way.

Check it: press Run. The try part fails, and the message shows the error. The finally line still runs. Without the try block, the whole run would stop at the bad data.

Try next: use the same pattern with a web address that might be down, and show a friendly message in the catch.`,

  'example-ask': `What you build: a question that asks you a word, and shows your answer in a sentence.

What you need: nothing. The question appears when you run the workspace by hand. A scheduled run has nobody to answer, so the example is for test runs.

Step 1: Add the Scheduler. From the Nomie group, drag the Scheduler onto the canvas.

Step 2: Add a message. Inside the Scheduler, drag a message block from the Nomie group.

Step 3: Join the answer. In the message, add a join block. Its first part is a text block: Your answer was.

Step 4: Ask the question. Drag a prompt block from the Text group into the second part of the join. In its text, type: What is your mood word?

Check it: press Run. Nomie shows the question. Type a word, and the message shows your answer.

Try next: ask for a number instead, and use the number in a calculation. Remember that a prompt only works when someone is there to answer.`,

  'example-keyword-statistics': `What you build: the count of notes that mention a word over the last 30 days, and the sum of their values.

What you need: some notes in Nomie that mention the word exercise, so the answers are not zero.

Step 1: Add the Scheduler and a message. From the Nomie group, drag the Scheduler onto the canvas, and put a message inside it.

Step 2: Start the sentence. In the message, add a join block. Its first part is a text block: Found "exercise" in.

Step 3: Add the period value. Drag a period value block into the join. Its trackable is the text exercise, not a tracker, so it finds the word in the notes. Its period is Last 30 days, and its statistic is the count.

Step 4: Finish the sentence. Add the text log entries over the last 30 days after the period value.

Step 5: Add the sum. Add a second message, with a period value block using the statistic sum. This adds up the values of the notes that mention the word.

Check it: press Run. The first message shows how many notes mention exercise, and the second shows the sum of their values.

Try next: change the word, or change the period to Last 90 days. The same two blocks answer a different question.`,

  'example-web-service': `What you build: a weather reading from a web service, with your key kept in Settings. It shows how a real flow works: a key, a request, the answer as JSON, and the values read out of it.

What you need: an account with a weather service that gives you a key. Add the key in Settings under the name OPENWEATHER_KEY. Without it, the run stops and names the secret to add.

Step 1: Add the key. In Settings, add a secret named OPENWEATHER_KEY with your key.

Step 2: Store the answer. Add a set block with the variable WeatherData. Its value is a request block. Build the address with a join block: the start of the address, then a secret block with OPENWEATHER_KEY, then the rest of the address with the language and units.

Step 3: Read the temperature. Add a set block with the variable Temperature. Its value is a value-from-key block with the key temp, reading from an object. That object comes from a value-from-key block with the key main, reading from the object made from the WeatherData variable.

Step 4: Show the result. Add a message: join the text It is, the variable Temperature and the text degrees in Amsterdam.

Check it: press Run. The message shows the temperature. If the key is missing, the run tells you which secret to add.

Try next: change the city in the address, and read the humidity from the same answer.`,

  'example-expert-mood-analyst': `What you build: a small statistics program in one workspace. It reads a list of moods, works out the mean, the best and the worst day with the list blocks, counts the low days with a function that gives each day a verdict, and shows the results.

What you need: nothing. The list of moods is typed into the example, so you can see every step. Later you can replace it with your own notes.

Step 1: Define the verdict function. In the Functions group, drag a function with a result and name it verdict, with a parameter score. Inside it, add two if-return blocks: when score is 7 or more, return good; when it is 5 or more, return okay. The return block at the end gives low.

Step 2: Define the mean function. Add a second function with a result named meanOf, with the parameter values. Its result is the average option of the list math block, with values as the list.

Step 3: Read the moods. In the Scheduler, set the variable moods to a split block. Its input is the text 6,7,4,8,5,9,7, and its delimiter is a comma. This turns the text into a list.

Step 4: Work out the numbers. Set mean to a call of meanOf with moods. Set best and worst to the maximum and minimum options of the list math block on moods.

Step 5: Count the low days. Set lowDays to 0. Add a for-each over moods, with the variable day. Inside it, an if block: when the verdict of day equals the text low, change lowDays by 1.

Step 6: Show the results. Add a message that joins the mean, the best, the worst and the low days. Add a console line that shows the verdict for the mean.

Check it: press Run. The message gives the numbers, and the console gives the verdict. Change the list of moods, and the verdict and the count change with it.

Try next: change the thresholds in verdict, or add a verdict for each day in the console.`,

  'example-expert-habit-engine': `What you build: a habit engine that keeps its state between runs. Each morning it looks at yesterday: if the habit was done, the streak goes up by one; if not, it resets to zero. It celebrates a week, and it shows the streak on a widget.

What you need: a tracker #habit in Nomie, logged on the days you do the habit. The streak starts at zero the first time.

Step 1: Set the schedule. Add the Scheduler from the Nomie group and choose Daily in the Details tab.

Step 2: Check yesterday. Inside the Scheduler, add an if block with an else branch. Its condition is a compare block: a day value block for #habit, the day yesterday and the statistic sum, greater than 0.

Step 3: Update the streak. In the if branch, add a remember block named streak, with the value of a recall block named streak with default 0, plus 1. In the else branch, add a remember block named streak with the number 0.

Step 4: Celebrate a week. Add another if block: when a recall of streak with default 0 equals 7, show a message: A week in a row!

Step 5: Keep a record, and show the widget. Add an if block: when recall of streak is greater than recall of best (default 0), remember best with the streak, and show a message: New record. Then add a dashboard named Habit with the fire emoji. Inside it, add two value blocks: Best streak (the recall of best) and Days in a row (the recall of streak), a trend of #habit and a footer.

Check it: press Run, and then open the Preview section in the Run tab. The first run shows zero days in a row, because nothing is remembered yet. Tomorrow's run keeps counting from today's value.

Try next: change the milestone to 30 days, and show a different message after the first day of a new streak.`,

  'example-expert-budget-ledger': `What you build: a budget ledger. It keeps a list of entries as objects, adds up the costs with a function, warns when you go over the budget, reads bad data safely with try and catch, and shows the spending on a widget.

What you need: nothing. The entries are in the example, so you can see every step. Later you can change them, or read them from a web service.

Step 1: Define the cost function. In the Functions group, add a function with a result named costOf, with the parameter entry. Its result is an object-get block for the field cost, of entry.

Step 2: Start the day. In the Scheduler, set budget to 20 and spent to 0.

Step 3: Make the ledger. Set ledger to a create list block with three entries. Each entry is a create object block with two fields: item and cost. Use coffee with 3, lunch with 9 and books with 12.

Step 4: Add up the entries. Add a for-each over ledger, with the variable entry. Inside it, change spent by the result of costOf with entry. Then show a line: the item of the entry, a colon, and the result of costOf.

Step 5: Warn when over budget. Add an if block: when spent is greater than budget, show a message that joins Over budget by with spent minus budget.

Step 6: Read bad data safely. Add a try and catch block. In try, read a text that is not valid JSON, such as {not json, with a from-JSON block. In catch, show a message with the error. Add a finally line.

Step 7: Show the widget. Add a dashboard named Budget. Inside, a value block for spent, and an HTML block with the text Spent {{spent}} of {{budget}}, with two parameters.

Check it: press Run. The console lists the entries, the message reports the overspend, and the try block reports the bad data without stopping the run.

Try next: raise the budget to 15, and the overspend message disappears.`,

  'example-expert-command-interpreter': `What you build: a tiny command interpreter. It reads a list of commands, runs each one through a function with an if chain, and keeps a counter between runs. Unknown commands are reported, not ignored.

What you need: nothing. The commands are typed in the example, so you can change them and run again.

Step 1: Define the runCommand function. In the Functions group, add a function without a result named runCommand, with the parameter command. Inside it, add an if block with three else-if branches and an else branch: up adds 1 to counter; down subtracts 1; reset sets counter to 0; show prints Counter is and the counter. The else branch prints Unknown command and the command.

Step 2: Load the counter. In the Scheduler, set counter to a recall block named counter with the default 0. This value is kept from earlier runs.

Step 3: Split the commands. Set commands to a split block on the text up,up,down,show,reset,up,bogus,show, with a comma as the delimiter.

Step 4: Run each command. Add a for-each over commands, with the variable command. Inside it, call runCommand with command.

Step 5: Keep the counter. Add a remember block named counter, with the value of the counter variable, after the loop.

Step 6: Show the widget. Add a dashboard named Counter, with a value block of the counter and a footer.

Check it: press Run. The console shows the counter after show commands, and the unknown command bogus is reported. Run it again: the counter starts from where the last run stopped.

Try next: add a command double that multiplies the counter by 2, as one more else-if branch.`,
};
