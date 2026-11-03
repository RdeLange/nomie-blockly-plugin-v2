# Nomie Blockly v2: implementation plan

Status: agreed 3 November 2026. Source documents:

- Code review: "Nomie Blockly v2 – code review & robustness plan" (claude.ai doc). The findings are repeated here
  with their ids (C1–C4, H1–H6, M1–M8, L1–L4), so this file is complete on its own.
- Mockups: "Nomie Blockly v2 – canvas look & feel proposals" (claude.ai design canvas). The chosen direction is
  **desktop D1 (rail, canvas, right panel) with the right panel split into tabs as in D4**, using the **icon rail from
  mobile mockup 1** and the **outline "notebook" canvas from mobile mockup 3**. On a phone the same editor collapses to
  mockup 1's layout with mockup 3's canvas.

The work is split into phases. Each phase is one branch or one commit series, ends with all checks green, and is
reviewed before the next starts.

| Phase | What | Findings |
| --- | --- | --- |
| 0 | Baseline: branch, Playwright as dev dependency, screenshot script | – |
| 1 | Runtime safety: sliced runner, timeouts, value conversion | C1, C2, H4 |
| 2 | Code you can trust: regenerate code, escape fields, default inputs, pre-run check | C3, H2, H3, M6, L1 |
| 3 | Replace the legacy blocks with modern ones, without losing anything | H1 |
| 4 | Scheduler: one day per run, progress per day, safe start, note trigger | H5, H6, M1–M5 |
| 5 | Look: notebook theme for blocks and canvas, icon rail, grouped drawer, search | design |
| 6 | Layout: D1 with tabbed right panel, phone layout, resizing | design |
| 7 | Editor performance, permissions summary for imported workspaces | M7, M8, C4 |
| 8 | Per-day run view in the Run tab | design (D4) |
| 9 | Clean-up: README, remove dead code, final test pass | L2–L4 |

Phases 1–4 change behaviour and come first, because the new screens in 5–8 build on them. If you want a visible
result early, phase 5 can run before phase 4: it touches different files.

---

## Phase 0 – Baseline

1. Create the branch `feature/v2-hardening-and-redesign`.
2. Add `playwright` as a dev dependency, and change the `*-check.mjs` scripts to `import { chromium } from
   'playwright'` instead of the absolute path into another project. Move them to `scripts/ui/`.
3. Add `scripts/ui/screenshots.mjs`: start from the dev server, open the list, open the "Retrieve Data Example"
   template in the editor, and save `screenshots/editor-desktop.png` (1440×900) and `screenshots/editor-phone.png`
   (390×844). Add `screenshots/` to `.gitignore`.
4. Run `npm test`, `npm run check`, `npm run build`, and note the baseline (95 tests at the time of the review).

Done when: the screenshot script runs from a clean clone, and all checks pass.

---

## Phase 1 – Runtime safety

### C1. A long or endless loop freezes the page, and Stop never fires

`runtime/run.ts` calls `interpreter.run()`, which only returns when the program ends or waits on an async host call.
A `while(true)` freezes Nomie, and the stop flag is never read. This was confirmed: the test process had to be killed.

Replace the body of `runWorkspace` with a runner that steps in slices and yields to the page between them. This code
was tested against the current repo: all 95 tests still passed, and Stop ended `while(true){}` after 101 ms.

```ts
const SLICE_MS = 8;
const MAX_STEPS = 5_000_000;      // about 10–30 s of work on a phone
const MAX_RUN_MS = 5 * 60_000;    // includes waiting on Nomie and the network

export const runWorkspace = (o: RunOptions): Promise<RunResult> =>
  new Promise((resolve) => {
    const output = o.output ?? (() => {});
    let interpreter: any;
    try {
      interpreter = createInterpreter(o.jscode, {
        api: o.api, scheduled: o.scheduled, schedule: o.schedule, output,
        highlight: o.highlight ?? (() => undefined),
      });
    } catch (e) {
      return resolve({ ok: false, error: `Could not start: ${e}` });
    }
    const started = Date.now();
    let steps = 0;
    const finish = (r: RunResult) => { if (!r.ok) output(`Error: ${r.error}`); resolve(r); };
    const slice = () => {
      if (o.stop?.stopped) return finish({ ok: false, error: 'stopped' });
      if (Date.now() - started > MAX_RUN_MS) return finish({ ok: false, error: 'ran longer than 5 minutes' });
      const sliceEnd = performance.now() + SLICE_MS;
      try {
        while (performance.now() < sliceEnd) {
          if (interpreter.paused_) return void setTimeout(slice, 10); // waiting on a host call
          if (!interpreter.step()) { output('<< Program complete >>'); return resolve({ ok: true }); }
          if (++steps > MAX_STEPS) return finish({ ok: false, error: 'too many steps (endless loop?)' });
        }
      } catch (e) {
        return finish({ ok: false, error: String(e) });
      }
      setTimeout(slice, 0); // give the page a turn, then continue
    };
    slice();
  });
```

`paused_` is an internal field of js-interpreter. Pin `js-interpreter` to an exact version in `package.json`, and
keep the endless-loop test as the guard.

Make the limits options of `RunOptions` (`maxSteps`, `maxRunMs`) with these defaults, so tests can use small values.
Return the step count in the result (`{ ok: true, steps }`) for the run panel in phase 8.

### C2. A Nomie call that never answers blocks every later run

`asyncFn` in `runtime/host.ts` waits for ever. Because runs are queued, one stuck call blocks the editor, the widget,
note triggers and the scheduler. Give every async host call a timeout, and make sure the program always resumes:

```ts
const toNative = (v: unknown) => interpreter.pseudoToNative(v);
const toPseudo = (v: unknown) => interpreter.nativeToPseudo(v ?? null);

const native = (name: string, fn: (...a: any[]) => unknown) =>
  interpreter.setProperty(scope, name,
    interpreter.createNativeFunction((...a: any[]) => toPseudo(fn(...a.map(toNative)))));

const asyncFn = (name: string, fn: (...a: any[]) => Promise<unknown>, arity: number, timeoutMs = 20_000) => {
  const wrapper = (...a: any[]) => {
    const callback = a.pop();
    let settled = false;
    const settle = (v: unknown) => { if (settled) return; settled = true; clearTimeout(timer); callback(toPseudo(v)); };
    const timer = setTimeout(() => { ctx.output(`Error: ${name} did not answer in ${timeoutMs / 1000} s`); settle(null); }, timeoutMs);
    fn(...a.map(toNative)).then(settle, (e) => { ctx.output(`Error in ${name}: ${e}`); settle(null); });
  };
  Object.defineProperty(wrapper, 'length', { value: arity + 1 });
  interpreter.setProperty(scope, name, interpreter.createAsyncFunction(wrapper));
};
```

Timeouts: Nomie data calls 20 s, `prompt` 10 minutes (a person is typing), `httpRequest` 15 s (keep the
AbortController), `waitForSeconds` has no timeout but its argument is capped at 600 s. Also give each task in
`createRunQueue` a deadline (`MAX_RUN_MS` + 30 s): when it passes, the queue moves on and the late result is ignored.

### H4. Lists and objects arrive as `[object Object]`

With the `native` and `asyncFn` above, values cross the sandbox wall as plain JavaScript. Then:

- `display`, `alert` (Push to Console) and `logValue` format values with one helper `formatValue(v)`: strings as is,
  numbers and booleans with `String`, `null` as an empty string, arrays joined with `,` (what v2 writes today, so a
  list logs the same as before), objects as `JSON.stringify`.
- `dateFrom` in `host.ts` and `clean()` in `runtime/nomie-data.ts` no longer need to read `.data` or strip brackets
  for values from the sandbox. Keep the bracket stripping for one release, because v1 code passes `("sum")`; it is
  harmless.

### Tests for phase 1

- `while(true){}` ends with `{ ok: false }` within 2 s when `maxSteps` is small, and a Stop set after 100 ms ends it.
- A host call whose promise never resolves ends the call with a timeout (use a 50 ms timeout in the test), the program
  continues, and a second queued run still starts.
- `logValue([1,2], '#m', day)` writes `#m(1,2)`; `logValue({a:1}, …)` writes `#m({"a":1})`; `display({a:1})` shows
  `{"a":1}`.
- All existing tests still pass, including the scheduled-range test (dates still cross the wall correctly).

---

## Phase 2 – Code you can trust

### C3 and M6. Run code generated from the blocks, never stored code

Today `jscode` from a file or from storage is what runs. A shared `.wsp` can show harmless blocks and run anything.

1. Add `src/blockly/compile.ts` with
   `compileWorkspace(xml: string, opts: { highlight: boolean }): { code: string; frame: boolean; schedule: 'none' | 'daily'; problems: Problem[] }`.
   It loads the XML into a headless `Blockly.Workspace`, reads the frame block's `NAME` field for the schedule,
   runs the pre-run check (below), and generates the code. With `highlight: false` it sets
   `javascriptGenerator.STATEMENT_PREFIX = null` for this call and restores it afterwards (see M7).
2. `canRun` and `isDailyWorkspace` use `frame` and `schedule` from this result, not `jscode.includes(...)`.
3. Every run (`runNow`, `runRange`, the scheduler, the widget, note triggers) compiles from `workspaceBlocks` first.
   If compiling fails, the run does not start and the error says why.
4. `jscode` stays in the stored data and in exported files, for v1 compatibility, and is refreshed on save. It is never
   executed.

### H3. Escape field values in generated code

Use `JSON.stringify(value)` for every string literal built from a field in `src/blockly/nomie-blocks.ts`
(`s4e_trackers`, `s4e_daypicker`, `s4e_periodpicker`, `s4e_statspicker`, `s4eblocklyframe`'s schedule, the legacy
`tracker` block). For normal values this gives the same text, so the v1 equality tests keep passing. `s4e_datepicker`
uses single quotes today (`'2026-10-01'`); keep single quotes for that one block, with a value validated as
`YYYY-MM-DD`, so the v1 output stays identical.

### H2. Empty inputs default to a safe value

An empty socket now produces `fetchDayValue(,,)`, a syntax error that stops the whole program. Give every input of the
Nomie generators a default: `g.valueToCode(block, 'Day', Order.NONE) || '"today"'` and so on (Value → `''`,
Tracker → `'""'`, Statistics → `'"sum"'`, Period → `'"LAST7DAYS"'`, Date → `'"today"'`). Generated code changes only
for blocks with empty inputs, so the v1 tests still pass.

### L1. A pre-run check, and errors that point at a block

`compileWorkspace` returns `problems` before anything runs:

- a Nomie data block with an empty Tracker input (error)
- blocks outside the frame: they do not run (warning)
- no frame at all (error, same message as today)
- a block from the "never ran" list in phase 3 (error, with the replacement to use)

The editor shows problems in the Run tab, and selects and highlights the block when one is clicked.

At runtime, remember the id of the last highlighted block. When a run fails, report
`Error in "Fetch day value": TypeError: …` and select that block in the editor.

### Tests for phase 2

- An imported workspace whose `jscode` differs from its blocks runs the blocks' code.
- A tracker tag containing `"` generates code that parses.
- Every Nomie block with all inputs empty generates code that parses.
- The v1 equality tests in `generator.spec.ts` still pass unchanged.

---

## Phase 3 – Replace the legacy blocks without losing anything

`src/blockly/legacy-js-blocks.ts` (976 lines) is v1 code ported as is. v1 also ran js-interpreter (version 2, also
ES5-only), so the blocks that generate ES6 never ran in v1 either. Removing them loses nothing. The blocks that do work
get a modern implementation under the **same block type, field and input names**, so v1 files load unchanged and the
generated code stays identical.

### What each legacy block becomes

| Legacy block | Works today? | Plan |
| --- | --- | --- |
| `object_from_json`, `object_to_json`, `object_keys`, `value_from_json_key` | Yes (used by the "Retrieve Temperature" template) | Rewrite as JSON block definitions in `src/blockly/object-blocks.ts`, same names, same generated code. Stays in the palette. |
| `object_create` (with its `object_field` mutator) | Yes | Rewrite with a Blockly 13 mutator in `object-blocks.ts`. Keep `mutationToDom` / `domToMutation` with the same `num_fields` attribute and `field` children, so v1 XML loads; add `saveExtraState` / `loadExtraState` for JSON. Same generated code. Stays in the palette. |
| new: `object_get`, `object_set` | – | Add "get property *name* of *object*" (output) and "set property *name* of *object* to *value*" (statement). They cover what people used `value_from_json_key` and chained calls for. |
| `bi_try_catch` | Yes, if the catch name is filled in | Rewrite in `src/blockly/advanced-blocks.ts`, same name and inputs. The catch field defaults to `error` and is validated as an identifier (an empty name made `catch()`, a syntax error). Stays in the palette, in Advanced. |
| `bi_function`, `bi_function_return`, `bi_return`, `bi_call`, `bi_call_editable`, `bi_call_editable_return` | Partly: calls cannot pass arguments in v2 (the argument mutator was never ported), and the "generator" option (`function*`) never ran | Replace in the palette with Blockly's built-in **procedure blocks** (`procedures_defnoreturn`, `procedures_defreturn`, `procedures_callnoreturn`, `procedures_callreturn`, `procedures_ifreturn`) through the dynamic `PROCEDURE` category. They have parameters, return values and ES5 output. Old workspaces: see migration below. |
| `bi_direct_call_editable`, `bi_direct_call_editable_return` | Only with a function plugged in | Not in the palette. Kept for loading only (compat module). |
| `bi_comment` | Generates nothing | Not in the palette: Blockly's own block comments and workspace comments replace it. Migration turns it into a workspace comment. |
| `bi_new` | Only in odd combinations | Not in the palette. Kept for loading only. |
| `bi_class`, `bi_anonymous_class`, `bi_static`, `bi_get`, `bi_set`, `bi_import`, `bi_import_as`, `bi_export`, `bi_spread`, `bi_catch` (without try) | **Never** (ES6 or invalid) | Not in the palette. Kept for loading only, shown with a warning, and reported by the pre-run check as "this block never worked in Nomie Blockly; remove it". |

The Classes category is removed from the palette, because none of its blocks can run.

### Loading old workspaces: migration first, compat second

1. **Migration** (`src/blockly/migrate.ts`, run on the XML before it is loaded, in the editor and in
   `compileWorkspace`):
   - `bi_function` with type `function `, a valid identifier name and identifier arguments →
     `procedures_defnoreturn` with those parameters; `bi_function_return` the same → `procedures_defreturn`.
   - `bi_return` inside a migrated function → `procedures_ifreturn` with condition `true`, or the function's return
     input when it is the last statement.
   - `bi_call` / `bi_call_editable` with a name that matches a migrated function and an empty `chain` input →
     `procedures_callnoreturn`; `bi_call_editable_return` → `procedures_callreturn`.
   - Anything that does not match these patterns exactly stays as it is.
   - As built (phase 3): a function with arguments is only migrated when nothing calls it. The old call blocks
     could not pass arguments (neither in v1 nor in v2), so the function got `undefined`; Blockly's call blocks
     would pass `null`, which is not exactly the same. Such functions keep running through the compat blocks.
   - As built: `bi_comment` is not migrated. It generates nothing and keeps the block comment attached to it, and a
     block inside a stack has no position for a workspace comment. It loads as a compat block without a warning.
   The migration is pure (XML in, XML out) and has its own tests with before/after fixtures.
2. **Compat** (`src/blockly/compat-blocks.ts`): small, typed definitions of every legacy block type that is not in the
   palette, with the same fields and generators as today, registered for loading only. A migrated workspace never
   needs them; an unmigratable one still loads and, where it ran before, still runs. Each compat block shows a
   warning: "Old block. It still works, but use the Functions blocks for new work."
3. When phase 3 is done, delete `legacy-js-blocks.ts`.

### Tests for phase 3

- Every palette block parses in the interpreter (`new Interpreter(code)`) with default inputs plugged in.
- The v1 equality tests pass unchanged, including the "Retrieve Temperature" template.
- An XML file containing every legacy block type loads without an error.
- Migration fixtures: each migrated case runs and gives the same output before and after migration; a function with
  arguments that is called is left as it is and still runs.
- `object_create` with three fields round-trips through XML and JSON serialisation.

---

## Phase 4 – Scheduler and triggers

### H6. One day per run, and progress saved per day

A failed catch-up now writes duplicate notes on the retry, because `latestrun` moves only when the whole window
succeeds. Change `runSchedule` to run the window one day at a time: for each day, call `runWorkspace` with
`start = end = that day at 13:00`, and save `latestrun` after each day that succeeds. Stop that workspace at the first
failed day. Report per-day outcomes (`{ day, result, output }[]`) for the run panel in phase 8.

A new daily workspace (empty `latestrun`) starts from **yesterday**, not 30 days back. The Settings field "Next run
starts from" stays the way to back-fill.

### H5. Period values follow the day being run

`fetchPeriodValue` counts back from now, so a catch-up writes today's 7-day average for every missed day. Generate
`fetchPeriodValue(t, p, s, loop)` and add an optional fourth argument to the host function: the end of the window.
Keep the three-argument form working for v1 code. Do the same for `getPromise` (the legacy `tracker` block).

As built (phase 4): no fourth argument is generated, because that would change the code of v1 workspaces (the v1
equality tests). The host function reads the sandbox's `loop` variable (the Scheduler block's day) instead, so v1
workspaces get the fix too. Nomie's `getTrackableUsage` takes the end date as `date`. Note: Nomie caps a word search
at 60 days back, so "Last 90 days" for a word counts 60 days; this is Nomie's limit, not the plugin's.

### M1–M3. Safe and predictable start

- `scheduleIfDue` does nothing until `appState.loaded` is true, and `save()` refuses to write before load. This
  removes the risk of writing an empty workspace list over the stored one.
- "Due" means `localDayKey(lastCentralSchedule) < localDayKey(now)`. A missing value is stored as empty, not as now,
  so a new install runs on its first day.
- Keep one interval timer; clear it before creating another in `onLaunch`.

### M4. Note trigger matches exactly

Parse the text after `Run Blockly Workspace:` up to the end of the line, trim it, and compare it with each
workspace's `name` exactly (case-insensitive). Ignore notes that a running workspace has just written (keep a short
list of notes created by the current run).

### M5. Saving is checked

Await `plugin.storage.setItem`. On failure, show a short message and keep the editor's unsaved state.

### Tests for phase 4

- A 3-day window that fails on day 3 saves progress for days 1 and 2; the retry runs day 3 only.
- `fetchPeriodValue` in a catch-up uses the loop day as the end of its window.
- `scheduleIfDue` before load does nothing and never calls `save`.
- "Run Blockly Workspace: Mood" runs "Mood" and not "Mood report".

---

## Phase 5 – The look: notebook theme and icon rail

### Design tokens (`src/app/tokens.css` and `src/blockly/theme.ts`)

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--nb-canvas` | `#FFFDF8` | `#1C1917` | canvas and editor background |
| `--nb-grid` | `#F0ECE4` | `#2A2623` | grid lines, 24 px, 1 px |
| `--nb-ink` | `#1C1917` | `#F5F5F4` | text on blocks and in the editor |
| `--nb-muted` | `#57534E` | `#A8A29E` | secondary text |
| `--nb-line` | `#E7E5E4` | `#3A3532` | panel borders |
| `--nb-control` | `#D6D3D1` | `#57534E` | field and button borders |
| `--nb-surface` | `#FFFFFF` | `#232020` | rail, panels, fields on blocks |
| `--nb-run` | `#22C55E` | `#22C55E` | Run button |

Category colours (the block outline and the rail tile):

| Category | Colour | Block style name |
| --- | --- | --- |
| Nomie | `#0277BD` | `nomie_blocks` |
| Scheduler frame | `#0B4F8A` | `nomie_frame` |
| Logic | `#3B5BDB` | `logic_blocks` |
| Loops | `#2B8A3E` | `loop_blocks` |
| Math | `#6741D9` | `math_blocks` |
| Text | `#0B7A6E` | `text_blocks` |
| Lists | `#9C36B5` | `list_blocks` |
| Variables | `#C2410C` | `variable_blocks`, `variable_dynamic_blocks` |
| Functions | `#C2255C` | `procedure_blocks` |
| Objects | `#8D5A0B` | `object_blocks` |
| Advanced | `#495057` | `advanced_blocks` |

Fonts: Inter for the UI and the blocks (500, 13 px on blocks), Fraunces 600 for the workspace title, JetBrains Mono
for the console. Self-host them (or use the system UI font as a fallback); the plugin runs inside Nomie and should not
depend on Google Fonts at runtime.

### The block look (mockup 3)

- Renderer: `thrasos`. It draws one outline per block, which the outline look needs.
- Theme: `Blockly.Theme.defineTheme('nomie-notebook', …)` with, per block style, `colourPrimary` = the category colour
  mixed 10% over `--nb-canvas` (fill), `colourSecondary` = the same at 16% (shadow blocks), and `colourTertiary` = the
  category colour (outline). Add a `nomie-notebook-dark` theme with the fill at 18% over the dark canvas.
- `componentStyles`: `workspaceBackgroundColour` `--nb-canvas`, `toolboxBackgroundColour` `--nb-surface`,
  `flyoutBackgroundColour` `--nb-surface`, `flyoutOpacity` 1, `scrollbarColour` `--nb-control`.
- CSS, scoped to the injected workspace: block text in `--nb-ink` (Blockly draws white text by default), outline
  1.5 px, dropdown and text fields as white chips with a `--nb-control` border and 6 px radius.
- Change the Nomie block definitions and the rewritten object and advanced blocks from `colour: '#…'` to
  `style: '…_blocks'`, so the theme controls them. This does not change the XML or the generated code.
- Grid: `grid: { spacing: 24, length: 24, colour: <--nb-grid>, snap: true }` draws lines, as in the mockup.
- Check the contrast of block text on every fill (4.5:1 or better). The fills are light, so ink text passes easily.

### The icon rail (mockup 1)

- A custom category class `NomieRailCategory extends Blockly.ToolboxCategory`, registered with
  `Blockly.registry.register(Blockly.registry.Type.TOOLBOX_ITEM, Blockly.ToolboxCategory.registrationName,
  NomieRailCategory, true)`.
- Each category shows a 40×40 tile with a 12 px radius and a 20 px stroke icon, and an 11 px label under it. Tile
  background: the category colour at 12% (not selected), or the full colour with a white icon (selected). Rail width:
  76 px on desktop, 68 px on a phone.
- Icons are inline SVG, chosen per category through `toolboxitemid` (`nomie`, `logic`, `loops`, `math`, `text`,
  `lists`, `variables`, `functions`, `objects`, `advanced`). Use the same simple stroke icons as the mockups, or a
  small icon set added as a dependency.
- Order: Nomie first, then Logic, Loops, Math, Text, Lists, Variables, Functions, Objects, Advanced.
- Rail buttons are at least 44 px tall and keyboard-reachable (Blockly's toolbox already handles focus and arrows).

### The drawer (mockup D2)

- Nomie category contents grouped with toolbox `label` items: "Read your notes" (Fetch day value, Fetch period value,
  Fetch data from API), "Write and show" (Log value, Display value, Push to console, Push to web console, Wait),
  "Pickers" (Tracker, Day, Period, Statistic, Date), "Frame" (Scheduler).
- Search: `@blockly/toolbox-search` (13.4.0, peer `blockly ^13.2.0`, compatible). It adds a search category; style
  it as the first item of the rail with a search icon.
  As built (phase 5): the plugin puts its text field inside the category row, which is about 50 px wide on a
  76 px rail. `src/blockly/search.ts` does the search instead: the Search tile opens a field over the top of the
  drawer, and the drawer lists the blocks whose text, type or category match every word typed. Blockly 13 closes
  the drawer when focus moves to the field, so the editor fills the drawer itself while someone types.
- Drawer background `--nb-surface`, a 1 px `--nb-line` border, and a soft shadow on the canvas side.

### Tests and checks for phase 5

- Screenshots at 1440×900 and 390×844 compared by eye with mockups D1 and mobile 1/3.
- Every palette block still exists and generates code (`blocks.spec.ts`, updated for the new palette).

---

## Phase 6 – The layout: D1 with a tabbed right panel

The plugin page runs inside Nomie's desktop page (`/nomie-blockly`: Nomie's 224 px sidebar, a page title, then the
plugin's iframe filling the rest). The plugin fills its iframe: no page scroll, `height: 100vh` on the editor.

### Desktop (iframe width 900 px and up)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Title (Fraunces) · status line             [Run] [Run for yesterday] [Stop] │ [Save]
├──────┬──────────────────────────────────────────────────┬────────────────────┤
│ rail │ canvas (notebook)                                │ Details│Run│Console│
│ 76px │                                                  │ 320 px panel       │
│      │                                           zoom ▢ │ (collapsible)      │
└──────┴──────────────────────────────────────────────────┴────────────────────┘
```

- **Toolbar**: workspace title and a status line ("Runs daily · last run 2 Nov · unsaved changes"), then Run
  (primary), Run for yesterday, Stop (enabled while running), a separator, Save (primary, enabled when dirty), and a
  button that shows or hides the right panel. A Back button returns to the list.
- **Right panel**, 320 px, with three tabs:
  - *Details*: name, description, name used in notes (with the trigger sentence), colour swatches, emoji, and a
    read-only "Schedule" summary (daily or not; which trackers it reads and writes, from the compile step).
  - *Run*: problems from the pre-run check, Run now / Stop, and (phase 8) the per-day results.
  - *Console*: the run output, in JetBrains Mono, newest at the bottom, with a Clear button.
  Running switches to the Console tab, unless the user is typing in Details.
- **Canvas**: fills the rest; zoom controls and trash at the bottom right, in a white control stack with a
  `--nb-control` border.
- Blockly must be resized when its container changes size: use a `ResizeObserver` on the host element that calls
  `Blockly.svgResize(workspace)`. Remove the fixed `60vh` / `80vh` heights.

### Phone (under 900 px)

- The toolbar becomes: Back, title with status, Save. Run, Run for yesterday, Stop and Console move to a floating bar
  at the bottom of the canvas (mockup 1), which leaves room for the rail.
- The right panel becomes a full-height sheet that slides over the canvas, opened by "Details" in the toolbar and by
  the Console button. It has the same three tabs.
- The rail is 68 px wide, with labels (mockup 1).

### Other screens

Apply the same tokens to the workspace list and Settings (cream background, white cards with `--nb-line` borders,
Fraunces titles), so the plugin feels like one product. Keep their structure; this is a restyle only.

### Checks for phase 6

- Screenshots at 1440×900, 1100×800 and 390×844: no page scroll, the canvas fills the space, nothing overlaps.
- Collapsing the right panel gives the canvas the space, and Blockly redraws to the new size.
- Keyboard: Tab reaches the toolbar, rail, canvas and panel tabs in order.

---

## Phase 7 – Editor performance and trust

- **M8**: the editor's change listener serialises the whole workspace on every non-UI event, including each drag step.
  Debounce it by 300 ms, and react only to create, delete, change and finished moves.
- **M7**: generate the `highlightBlock(...)` prefix only for runs started from the editor. In the editor, apply
  highlights at most once per animation frame, and do not put each highlight in Svelte state.
- **C4**: when a workspace is imported (file or backup), show a summary built from its blocks before adding it:
  "Reads notes · writes to #goodday · calls api.open-meteo.com". Ask once before the first run of an imported
  workspace. Limit `httpRequest` to `https:` URLs, and log the host of each request in the console.

---

## Phase 8 – Per-day run view (from mockup D4)

Uses the per-day outcomes from phase 4.

- The Run tab gets "Run for days" with two date fields (from, to) that runs the per-day loop for that range.
- A list of the last schedule's days for this workspace: date, status (ok, failed, skipped, next) and the first line
  of its output. Clicking a day shows its full output in the Console tab.
- While a run is going, a small status pill on the canvas: "Running · day 2 of 2 · step 214", and the running block
  is outlined.

---

## Phase 9 – Clean-up

- **L2**: replace the module-level tracker options in `nomie-blocks.ts` with a per-workspace object, or a dropdown
  validator that accepts any `#tag`.
- **L3**: wrap the "notes on one day" search in `NomieApi.notesOnDay(tag, day)` and pin it with a test.
- **L4**: Settings derives "now" when it renders.
- Update `README.md`: the status, the block list, the runtime limits, and the compatibility promise.
- Remove the root-level PNG screenshots from the repo (they belong in `screenshots/`, which is ignored).

---

## Definition of done (every phase)

- `npm test`, `npm run check`, `npm run build` pass.
- New behaviour has tests; fixed bugs have a test that failed before the fix.
- `generator.spec.ts` (v1 equality) passes unchanged, except where this plan says otherwise.
- UI phases: screenshots taken and looked at, desktop and phone.
- A short summary of what changed and what to check by hand in Nomie.
