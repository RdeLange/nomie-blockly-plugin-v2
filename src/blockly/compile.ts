// Turns a workspace's blocks into the code that runs, and checks the blocks before a run.
// Every run compiles from the blocks: the jscode stored with a workspace is never run, because a shared .wsp file
// could carry code that does something else than its blocks show.
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { readBlocksInto, setupBlockly } from './setup';
import { NEVER_WORKED } from './unsupported';
import { COMPAT_BLOCKS } from './compat-blocks';

const OLD_BLOCKS = new Set<string>(COMPAT_BLOCKS);

export type Problem = { blockId?: string; level: 'error' | 'warning'; message: string };

export type CompiledWorkspace = {
  code: string;
  // the workspace has a Scheduler block (v1 called it the frame)
  frame: boolean;
  schedule: 'none' | 'daily';
  problems: Problem[];
  // a short text for each block, to say where a run failed
  labels: Record<string, string>;
};

const FRAME = 's4eblocklyframe';
// Blocks that may sit outside the frame: they define something, and run nothing by themselves
const DEFINITIONS = new Set(['procedures_defnoreturn', 'procedures_defreturn', 'bi_function', 'bi_comment']);
// The data blocks that cannot do anything without a tracker, and the input that holds it
const NEEDS_TRACKER: Record<string, { input: string; name: string }> = {
  s4e_dayvalue: { input: 'Tracker', name: 'Fetch Day Value' },
  s4e_periodvalue: { input: 'Trackable', name: 'Fetch Period Value' },
  s4e_logvalue: { input: 'Tracker', name: 'Log Value' },
};

export const hasErrors = (problems: Problem[]) => problems.some((p) => p.level === 'error');

// The problems in a workspace that is loaded (headless here, or the editor's own workspace).
export const checkWorkspace = (workspace: Blockly.Workspace): Problem[] => {
  const problems: Problem[] = [];
  const top = workspace.getTopBlocks(true).filter((b) => b.isEnabled());
  const frames = top.filter((b) => b.type === FRAME);
  if (frames.length === 0) {
    problems.push({ level: 'error', message: 'This workspace has no Scheduler block. Add one, and put the script inside it.' });
  }
  for (const block of top) {
    if (block.type === FRAME || DEFINITIONS.has(block.type)) continue;
    problems.push({
      blockId: block.id,
      level: 'warning',
      message: 'This block is outside the Scheduler block. It still runs, but once, not for each day of a scheduled run.',
    });
  }
  for (const block of workspace.getAllBlocks(false)) {
    if (!block.isEnabled()) continue;
    const needs = NEEDS_TRACKER[block.type];
    if (needs && !block.getInputTargetBlock(needs.input)) {
      problems.push({ blockId: block.id, level: 'error', message: `"${needs.name}" has no tracker. Plug a tracker into it.` });
    }
    const never = NEVER_WORKED[block.type];
    if (never) problems.push({ blockId: block.id, level: 'error', message: never });
    else if (OLD_BLOCKS.has(block.type) && block.type !== 'bi_comment') {
      problems.push({
        blockId: block.id,
        level: 'warning',
        message: 'This is an old block. It still works, but use the Functions blocks for new work.',
      });
    }
  }
  return problems;
};

const labelOf = (block: Blockly.Block) => block.toString(60).replace(/\s+/g, ' ').trim();

// Compiles the blocks of a workspace. With highlight, every statement first calls highlightBlock(id), so the editor
// can show which block runs; runs nobody watches leave that out, which makes them about twice as fast.
export const compileWorkspace = (workspaceBlocks: string, options: { highlight: boolean }): CompiledWorkspace => {
  setupBlockly();
  const workspace = new Blockly.Workspace();
  const previousPrefix = javascriptGenerator.STATEMENT_PREFIX;
  try {
    try {
      readBlocksInto(workspace, workspaceBlocks);
    } catch (error) {
      return {
        code: '',
        frame: false,
        schedule: 'none',
        problems: [{ level: 'error', message: `The blocks of this workspace could not be read: ${String(error)}` }],
        labels: {},
      };
    }
    const frames = workspace.getTopBlocks(true).filter((b) => b.type === FRAME && b.isEnabled());
    const labels: Record<string, string> = {};
    for (const block of workspace.getAllBlocks(false)) labels[block.id] = labelOf(block);
    if (!options.highlight) javascriptGenerator.STATEMENT_PREFIX = null;
    return {
      code: javascriptGenerator.workspaceToCode(workspace),
      frame: frames.length > 0,
      schedule: frames.some((b) => b.getFieldValue('NAME') === 'daily') ? 'daily' : 'none',
      problems: checkWorkspace(workspace),
      labels,
    };
  } finally {
    javascriptGenerator.STATEMENT_PREFIX = previousPrefix;
    workspace.dispose();
  }
};

// The list and Settings show whether a workspace is daily. They ask often, so the answer is kept per block text.
const infoCache = new Map<string, { frame: boolean; schedule: 'none' | 'daily' }>();
export const workspaceInfo = (workspaceBlocks: string) => {
  let info = infoCache.get(workspaceBlocks);
  if (!info) {
    const compiled = compileWorkspace(workspaceBlocks, { highlight: false });
    info = { frame: compiled.frame, schedule: compiled.schedule };
    if (infoCache.size > 100) infoCache.clear();
    infoCache.set(workspaceBlocks, info);
  }
  return info;
};
