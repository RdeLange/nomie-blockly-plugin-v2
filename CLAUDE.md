# Nomie Blockly v2: notes for Claude

This repo is the Nomie Blockly plugin, v2. Users build small automations from blocks. The blocks become JavaScript,
and that JavaScript runs in a js-interpreter sandbox against the user's Nomie notes.

The current work is described in `docs/IMPLEMENTATION_PLAN.md`. Read it before you change anything, and work through
it one phase at a time.

## Commands

    npm install          # uses legacy-peer-deps (see .npmrc)
    npm test             # vitest: generator, blocks, runtime, scheduler
    npm run check        # svelte-check and TypeScript
    npm run build        # builds dist/
    npm run dev          # Vite dev server (the check scripts expect http://localhost:5010/)

A phase is done only when `npm test`, `npm run check` and `npm run build` all pass.

## Rules that must not be broken

1. **v1 compatibility.** Workspaces saved with v1 (`.wsp` files, backups, stored state under the storage key
   `blockly`) must keep loading and running. Do not rename block types, field names, input names or the stored-state
   fields. `src/blockly/generator.spec.ts` checks that the code generated from v1 workspaces equals the code v1 saved.
   That test must keep passing. Change it only where the plan says so.
2. **The sandbox runs ES5 only.** js-interpreter 6 parses ES5. Generated code must not use `let`, `const`, arrow
   functions, classes, spread, template literals, `import` or `export`. Every block in the palette must generate code
   that `new Interpreter(code)` can parse; there will be a test for this.
3. **Nothing from the page reaches the sandbox** except the host functions in `src/runtime/host.ts`. A new
   capability is a new host function, with a timeout, with its values converted with `pseudoToNative` /
   `nativeToPseudo`.
4. **No functionality is lost.** If a block is removed from the palette, old workspaces that use it must still load,
   and either run as before or be migrated to a modern block that does the same.
5. **Tests first for bugs.** For every bug in the plan, write the failing test, then fix it.

## Code style

- TypeScript, Svelte 5 runes, 2-space indent, single quotes, lines up to about 120 characters.
- Comments are short, plain sentences that say why, in the style already in the repo.
- Keep `src/nomie/api.ts` as the only file that knows the Nomie SDK shape.
- Small modules: `src/domain` (data), `src/runtime` (running code), `src/blockly` (blocks, theme, toolbox),
  `src/app` (screens).

## Checking the UI

The `*-check.mjs` scripts in the repo root drive the dev server with Playwright and take screenshots. They import
Playwright from a path on the maintainer's machine; phase 0 of the plan replaces that with a dev dependency. After a
UI change, take screenshots at 1440×900 (desktop) and 390×844 (phone), look at them, and compare with the mockups
described in the plan.
