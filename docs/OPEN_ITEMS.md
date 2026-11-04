# Open items (Nomie Blockly v2)

Where things stand on `main` after phases 10–19 and the follow-up work (phases 20–22: widgets, the HTML widget, the
detailed description, the example library, the translations). Local checks are green: `npm test` (508 tests),
`npm run check` (the only errors are in the stray `… 2.ts` iCloud copies, see below), `npm run build`, and the 18
browser checks in `scripts/ui/` listed in `.github/workflows/check.yml`.

## Decisions to make

1. **Full-screen toggle for the canvas** (phase 19). Not built. The plan suggests hiding the panel and the toolbar title.
2. **Focus mode** (phase 19, mockup D5). Needs Nomie to collapse its own sidebar. The plan says to propose that to Nomie
   separately; I don't know whether that was sent.
3. **Width of the widget block on the canvas.** The widget blocks are wide because the period-value expression sits
   inline. Stacking the data blocks would make them narrower. Not answered yet.
4. **"My location" in the Retrieve Temperature template.** Decided: not in the template (the block is in the palette
   and in the examples). Confirm or change.
5. **Text print (`text_print`).** It is not in the palette, but its generated code calls `window.alert`, which the
   sandbox does not provide. Check whether any old workspace uses it; if so, map it to the Nomie message block.

## Not verified yet

6. **Phase 10 gate on GitHub.** A deliberately broken test makes `npm test` exit 1 locally. I have not seen the GitHub
   check turn red on a broken test.
7. **Live DailyNomie.** The widget storage key (`widgets`), the widget frame (`widgetid`, the parameter the Nomie
   plugin SDK documents; `widgetindex` is still read) and the widget preview have only been checked against
   `scripts/ui/fake-nomie.js`, not in the real DailyNomie. The widget picker in DailyNomie needs `addToWidgets: true`
   and a non-empty `widgets` list; confirm both in a live run.
8. **Examples that need something a test run cannot give** (`live` in `src/domain/example-library.ts`: a secret, the
   network, a location, a prompt). They are compiled and checked in the tests, but never run.
9. **Phase 16 size.** Measured once (first JavaScript file 1,042,723 → 200,975 bytes); no size budget in CI.

## Translations

10. **Native-speaker review** of the Dutch, German and Italian texts: the screens, the block labels and tooltips
    (`src/blockly/block-text-table.ts`), and the examples (`src/domain/example-translations.ts`, the tutorials in
    particular). I wrote them; they have not been checked by a native speaker.
11. **Language changes mid-session.** The block texts are applied when the blocks are defined, so a change of the
    Nomie language takes effect for the blocks when the plugin is reopened. The screens follow at once.
12. **The legacy JavaScript blocks** (catch, class, import and so on, `compat-blocks.ts`) stay in English. They are not
    in the palette.
13. **Workspace names of the examples** stay English on purpose: the note "Run Blockly Workspace: name" uses them. The
    displayed name and tutorial are in the user's language when the example is added.

## Housekeeping

14. **Stray iCloud copies.** About 40 files named like `something 2.ts` in the working tree (not in git). They cause
    the 10 type-check errors on a local checkout. Delete them after checking; I have not deleted them.
15. **Date-dependent tests.** Most specs use fixed calendar dates as data, which is fine. The widget chart tests counted
    back from the current day and broke on 4 Nov 2026; they now count from today. Check any new spec that relies on
    "today" before it lands.
16. **The plan still names removed templates** (the Retrieve Temperature template in the phase 12 and 13 notes). The
    templates were replaced by the example library (phase 21). Update the plan text.
17. **Phone-only code.** On a phone the plugin shows the list only (phone-list-check.mjs), so the phone rail
    (long press, one label, the rail rules below 900 px in notebook.css and rail.ts) is no longer reachable. Remove it.
18. **DailyNomie 7 radial menu** (`dailynomie7` branch `dev`, commit e4abdd40): Blockly replaces Pointers. Its
    guardrail check and build pass, but it is not checked at 390 px in a browser, and it is committed, not pushed.
19. **Publishing.** The plugin is published from `dailynomie/nomie-blockly-plugin-v2`: its workflow "Deploy Nomie
    Blockly v2 to GitHub Pages" checks out `RdeLange/nomie-blockly-plugin-v2` at `main`, builds it and deploys `dist/`.
    It runs on pushes to that repository's own `main` and on manual dispatch, not on pushes to the source repository.
    So after a push to `main` here, run the workflow:
    `gh workflow run "Deploy Nomie Blockly v2 to GitHub Pages" -R dailynomie/nomie-blockly-plugin-v2`.
