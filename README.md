# Nomie Blockly v2

A modern rebuild of the Nomie Blockly plugin: build small automations from blocks, and run them against your Nomie
notes. Workspaces (`.wsp` files) saved with Nomie Blockly v1 keep working: the block types, field names and generated
code are the same.

Status: the blocks, the code generator, the runtime (interpreter, data functions, runner, daily scheduler) and their
tests are in place. The editor, the screens and the Nomie plugin registration are not yet rebuilt.

## Stack

- Svelte 5 (runes), Vite, TypeScript
- Blockly 13 with `javascriptGenerator`
- js-interpreter 6 for the sandbox that runs a workspace
- Vitest (jsdom) for the tests

## Commands

    npm install     # uses legacy-peer-deps (see .npmrc): the Blockly 13 peers are not all installed by npm
    npm test        # the generator, block and runtime tests
    npm run build   # builds dist/

## Tests that matter most

- `src/blockly/generator.spec.ts`: the code generated from v1's saved workspaces equals the code v1 saved.
- `src/blockly/blocks.spec.ts`: every block in the palette exists and generates code.
- `src/runtime/runtime.spec.ts`: the data blocks, a run of the example workspace, the scheduler window and skips.
