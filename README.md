# Nomie Blockly v2

A modern rebuild of the Nomie Blockly plugin: build small automations from blocks, and run them against your Nomie
notes, by hand, from a note, or every day on a schedule.

Status: the blocks, the code generator, the runtime, the scheduler, the editor (icon rail, notebook canvas, panel
with Details, Run and Console) and the plugin connection are done and tested. What was changed and why is in
`docs/IMPLEMENTATION_PLAN.md`.

## Compatibility with v1

Workspaces saved with Nomie Blockly v1 keep working: `.wsp` files, backups and the stored state (storage key
`blockly`). The block types, field names and generated code are the same; `src/blockly/generator.spec.ts` checks that
the code generated from v1 workspaces equals the code v1 saved.

- Old function blocks become Blockly's own Functions blocks when a workspace loads, where that runs exactly the same
  (`src/blockly/migrate.ts`). The others keep working through compatibility blocks (`src/blockly/compat-blocks.ts`).
- Blocks that never worked (classes, import, export, spread: the sandbox runs ES5) still load, and the editor marks
  them as errors.
- New in the stored state: `scheduledays` (the per-day results of the last schedule). v1 ignores it.

## The blocks

- **Nomie**: Fetch day value, Fetch period value, Fetch data from API, Log value, Display value, Push to console, Push
  to web console, Wait, and the pickers (Tracker, Day, Period, Statistic, Date). The Scheduler block holds the script.
- **General**: Logic, Loops, Math, Text, Lists, Variables, Functions (parameters and return values), Objects (create,
  get and set a property, keys, JSON), Advanced (try / catch / finally).
- **Search**: the Search tile on the rail finds a block by the words on it, its type or its category.

## How a workspace runs

The blocks are compiled to ES5 JavaScript and run in a [js-interpreter](https://github.com/NeilFraser/JS-Interpreter)
sandbox. Nothing from the page is visible to a workspace except the host functions in `src/runtime/host.ts`.

- Every run compiles the blocks; the `jscode` stored with a workspace is never run.
- A pre-run check stops a run with errors (no Scheduler block, a data block without a tracker, a block that never
  worked) and names the block.
- Limits: a run stops after 5,000,000 steps or 5 minutes; a Nomie call waits at most 20 seconds, a prompt 10
  minutes, a web request 15 seconds; Wait waits at most 600 seconds. Stop works within one 8 ms slice, also inside
  a loop.
- Fetch data calls https addresses (http is upgraded to https); the run's output names each host.
- The daily schedule runs once per calendar day, one day at a time, and saves its progress after each day, so a
  retry never writes a day twice. A new daily workspace starts at yesterday.
- Importing a `.wsp` file or a backup first shows what each workspace does: the trackers it reads and writes, and the
  web hosts it calls.

## Stack

- Svelte 5 (runes), Vite, TypeScript
- Blockly 13 (thrasos renderer, a custom theme and toolbox category), `javascriptGenerator`
- js-interpreter 6 (pinned: the runner reads its `paused_` field)
- Vitest (jsdom) for the tests, Playwright for the UI checks

## Commands

    npm install     # uses legacy-peer-deps (see .npmrc)
    npm test        # the tests: generator, blocks, migration, runtime, scheduler, app, plugin connection
    npm run check   # svelte-check and TypeScript
    npm run build   # builds dist/
    npm run dev     # the dev server on http://localhost:5010/

## Checking the UI

The scripts in `scripts/ui/` start their own dev server and save screenshots in `screenshots/` (not committed):

    node scripts/ui/screenshots.mjs [suffix]   # the editor at 1440x900, 1100x800 and 390x844
    node scripts/ui/drawer-check.mjs           # the Nomie drawer and a block search
    node scripts/ui/panel-check.mjs            # the Run tab with a problem, and the panel on a phone
    node scripts/ui/run-check.mjs              # real runs with a stand-in for Nomie (fake-nomie.js)

## Tests that matter most

- `src/blockly/generator.spec.ts`: the code generated from v1's saved workspaces equals the code v1 saved.
- `src/blockly/blocks.spec.ts`: every palette block exists and generates code the sandbox can parse.
- `src/blockly/migrate.spec.ts`: old function blocks are migrated only where the workspace runs the same.
- `src/runtime/safety.spec.ts`: a run always ends (loops, Stop, Nomie calls that never answer).
- `src/runtime/schedule-days.spec.ts`: the schedule runs one day at a time and never writes a day twice.
