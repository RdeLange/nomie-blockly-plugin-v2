# Prompts for Claude in VS Code

Put `CLAUDE.md` in the repo root and `IMPLEMENTATION_PLAN.md` in `docs/`, commit them, then open the repo in VS Code
with the Claude extension. Paste the **start prompt** once. After each phase, review the result, then paste the
**next-phase prompt**. The other prompts are for when something goes wrong.

---

## Start prompt (paste once)

```
You are working on the Nomie Blockly v2 plugin in this repository. Read CLAUDE.md and docs/IMPLEMENTATION_PLAN.md
in full before doing anything else. The plan is agreed; your job is to carry it out, phase by phase, with care.

Context you need:
- Users build automations from Blockly blocks. The blocks generate ES5 JavaScript that runs in a js-interpreter
  sandbox (src/runtime) against the user's Nomie notes (src/nomie/api.ts is the only file that knows the Nomie SDK).
- v1 compatibility is a hard requirement: v1 .wsp files, backups and stored state must keep loading and running.
  Block type, field and input names do not change. src/blockly/generator.spec.ts must keep passing unchanged unless
  the plan says otherwise.
- No functionality may be lost. When the plan removes a legacy block from the palette, old workspaces that use it
  must still load and, where they ran before, still run (migration first, compat blocks second, as in phase 3).
- The sandbox parses ES5 only. Never generate let, const, arrow functions, classes, spread, template literals,
  import or export.

How to work:
1. Start with phase 0. Do only one phase at a time.
2. Before you change code in a phase, write a short plan for that phase in the chat: the files you will change, the
   tests you will add, and anything in the plan that does not match the code as you find it. If something in the plan
   is wrong or unclear, say so and propose the smallest change; do not silently do something else.
3. For every bug the phase fixes, first write a test that fails, run it to show it fails, then fix the code.
4. Keep commits small and named after the finding ids, for example "fix(runtime): run in slices so Stop works (C1)".
5. At the end of the phase run npm test, npm run check and npm run build. For phases that change the UI, start the
   dev server, run scripts/ui/screenshots.mjs, open the screenshots and look at them at 1440x900 and 390x844, and
   fix what does not match the plan's description.
6. Finish the phase with a summary: what changed, the test count before and after, anything left open, and what I
   should check by hand inside Nomie. Then stop and wait for me.

Do not push, open pull requests, or delete files outside the plan without asking me. Do not upgrade dependencies
except where the plan says so.

Begin with phase 0.
```

---

## Next-phase prompt (paste after reviewing each phase)

```
Phase <N> looks good. Continue with phase <N+1> of docs/IMPLEMENTATION_PLAN.md, working the same way: plan first,
failing tests first for bugs, all checks green, screenshots for UI phases, then a summary and stop.
```

If you want changes to the phase first:

```
Before moving on, change the following in phase <N>: <your notes>. Keep the tests green, then give me a short
summary of what you changed.
```

---

## Prompts for specific situations

**The v1 equality test fails**

```
generator.spec.ts fails. Do not change the test. Show me the first difference between the expected and the
generated code, explain which change caused it, and fix the generator so the output is identical again. If you
believe the difference is intended by the plan, quote the line of the plan and ask me before changing the test.
```

**A legacy workspace no longer loads or runs (phase 3)**

```
This workspace no longer loads or runs the same way: <attach the .wsp file or paste its XML>.
Add it as a fixture in src/test/fixtures, write a test that loads it, runs it with the fake Nomie API, and compares
the output with what the old code produced (check out the commit before phase 3 to get the old output). Then fix the
migration or the compat block so the test passes.
```

**The look does not match the mockups (phases 5 and 6)**

```
Compare screenshots/editor-desktop.png with this description from the plan: <paste the part>. List every
difference you see (colours, sizes, spacing, borders, fonts, text colour on blocks), fix them, take new screenshots,
and look at them again before you report back.
```

**Something works in tests but not inside Nomie**

```
In Nomie, <describe what happens>. The plugin runs in an iframe inside Nomie's /nomie-blockly page and talks to
Nomie through the plugin SDK (src/nomie/plugin.ts, src/nomie/api.ts). Add logging to the console where the plugin
starts, loads storage, and runs the scheduler, tell me what to look for in the browser console, and propose the
most likely causes in order.
```

**Run a final review before merging**

```
All phases are done. Review the whole branch against docs/IMPLEMENTATION_PLAN.md as a strict reviewer who did not
write the code: for every finding id (C1-C4, H1-H6, M1-M8, L1-L4) and every design item, say whether it is done,
where, and which test covers it. List anything missing or weaker than the plan, and any new risk the changes
introduced. Do not fix anything yet; give me the list.
```
