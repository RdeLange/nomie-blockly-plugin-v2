// Blocks that never worked: they generate modern JavaScript (classes, import, export, spread), and the sandbox runs
// ES5 only. Nomie Blockly v1 had the same sandbox, so no workspace ever ran with them. They still load, so an old
// workspace opens, and the pre-run check says what to do.
const NEVER = 'This block never worked in Nomie Blockly: the sandbox runs ES5 JavaScript, and this block needs a newer kind. Remove it.';

export const NEVER_WORKED: Record<string, string> = {
  bi_class: NEVER,
  bi_anonymous_class: NEVER,
  bi_static: NEVER,
  bi_get: NEVER,
  bi_set: NEVER,
  bi_import: NEVER,
  bi_import_as: NEVER,
  bi_export: NEVER,
  bi_spread: NEVER,
  bi_catch: 'A catch block only works inside a try block. Use the "try / catch" block instead.',
};
