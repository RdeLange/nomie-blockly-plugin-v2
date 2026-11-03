// The code a workspace runs, and the way to make it (phase 16). The compiler is Blockly, so it is loaded when it is
// needed, and not when the plugin starts: a launch whose workspaces are all compiled loads no Blockly at all.
//
// Stored code is used only when it was made from exactly these blocks, by this generator, without errors (C3). The
// editor always compiles, because it highlights the blocks as they run.
import type { Problem } from '../blockly/compile';
import type { Workspace } from '../domain/workspace';
import { fingerprint } from '../domain/fingerprint';
import { appState } from './state.svelte';

type Compiler = typeof import('../blockly/compile');
let compiler: Promise<Compiler> | undefined;
export const loadCompiler = (): Promise<Compiler> => (compiler ??= import('../blockly/compile'));

export const hasErrors = (problems: Problem[]) => problems.some((p) => p.level === 'error');

// What a run needs: the code, the schedule and the note, and the problems found while compiling. Stored code has none.
export type RunnableCode = {
  code: string;
  frame: boolean;
  schedule: 'none' | 'daily';
  note?: string;
  problems: Problem[];
  labels: Record<string, string>;
};

// The blocks were compiled by this generator, and compiled without errors
export const isCompiled = (w: Workspace): boolean => w.compiledFrom === fingerprint(w.workspaceBlocks);
export const isFresh = (w: Workspace): boolean => isCompiled(w) && w.runnable === true && typeof w.jscode === 'string' && w.jscode !== '';

// The code to run: the stored code when it is fresh and the run does not highlight blocks, otherwise compiled now
export const codeOf = async (w: Workspace, options: { highlight: boolean }): Promise<RunnableCode> => {
  if (!options.highlight && isFresh(w)) {
    return {
      code: w.jscode,
      frame: true,
      schedule: w.schedule === 'daily' ? 'daily' : 'none',
      note: w.note,
      problems: [],
      labels: {},
    };
  }
  const { compileWorkspace } = await loadCompiler();
  return compileWorkspace(w.workspaceBlocks, { highlight: options.highlight, knownSecrets: Object.keys(appState.secrets) });
};

// A copy of the workspace with the code of its blocks, the schedule, the note and the fingerprint of the blocks
export const refreshCompiled = async (w: Workspace): Promise<Workspace> => {
  const { compileWorkspace } = await loadCompiler();
  const compiled = compileWorkspace(w.workspaceBlocks, { highlight: false });
  const next: Workspace = { ...w };
  delete next.note;
  if (compiled.note) next.note = compiled.note;
  next.jscode = compiled.code;
  next.schedule = compiled.schedule;
  next.compiledFrom = fingerprint(w.workspaceBlocks);
  next.runnable = compiled.frame && !hasErrors(compiled.problems);
  return next;
};

// Puts a compiled copy's code and fields onto the workspace in the app's state
export const applyCompiled = (target: Workspace, compiled: Workspace) => {
  target.jscode = compiled.jscode;
  target.schedule = compiled.schedule;
  target.compiledFrom = compiled.compiledFrom;
  target.runnable = compiled.runnable;
  if (compiled.note) target.note = compiled.note;
  else delete target.note;
};
