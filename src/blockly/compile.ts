// Turns a workspace's blocks into the code that runs, and checks the blocks before a run.
// Every run compiles from the blocks: the jscode stored with a workspace is never run, because a shared .wsp file
// could carry code that does something else than its blocks show.
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { readBlocksInto, setupBlockly } from './setup';
import { NEVER_WORKED } from './unsupported';
import { COMPAT_BLOCKS } from './compat-blocks';
export { secretsUsedIn } from './nomie-blocks';

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
  // the tracker of the When-note block: the workspace runs when a note with it is saved (phase 14)
  note?: string;
};

const FRAME = 's4eblocklyframe';
const WHEN_NOTE = 's4e_whennote';
// the blocks that read the note which started a run: they give nothing outside a When-note block
const NOTE_VALUE_BLOCKS = new Set(['s4e_notevalue', 's4e_notetext', 's4e_noteday']);

const insideWhenNote = (block: Blockly.Block): boolean => {
  for (let b: Blockly.Block | null = block; b; b = b.getSurroundParent()) if (b.type === WHEN_NOTE) return true;
  return false;
};

// The tracker a When-note block names
const trackerOf = (block: Blockly.Block): string | undefined => {
  const target = block.getInputTargetBlock('Tracker');
  return target?.type === 's4e_trackers' ? String(target.getFieldValue('Trackers')) : undefined;
};
// Blocks that may sit outside the frame: they define something, and run nothing by themselves
const DEFINITIONS = new Set(['procedures_defnoreturn', 'procedures_defreturn', 'bi_function', 'bi_comment']);
// The data blocks that cannot do anything without a tracker, and the input that holds it
const NEEDS_TRACKER: Record<string, { input: string; name: string }> = {
  s4e_dayvalue: { input: 'Tracker', name: 'Fetch Day Value' },
  s4e_periodvalue: { input: 'Trackable', name: 'Fetch Period Value' },
  s4e_logvalue: { input: 'Tracker', name: 'Log Value' },
};

export const hasErrors = (problems: Problem[]) => problems.some((p) => p.level === 'error');

// The problems in a workspace that is loaded (headless here, or the editor's own workspace). knownSecrets are the
// secrets Settings has; a secret the workspace uses that is not among them is a warning before the run.
export const checkWorkspace = (workspace: Blockly.Workspace, knownSecrets?: string[]): Problem[] => {
  const problems: Problem[] = [];
  const top = workspace.getTopBlocks(true).filter((b) => b.isEnabled());
  const frames = top.filter((b) => b.type === FRAME);
  const whenNotes = top.filter((b) => b.type === WHEN_NOTE);
  // a workspace runs on days (the Scheduler block) or when a note is saved (the When-note block), not both
  if (frames.length && whenNotes.length) {
    problems.push({
      level: 'error',
      message: 'This workspace has a Scheduler block and a When-note block. Keep one: the Scheduler runs on days, the When-note block when a note is saved.',
    });
  } else if (frames.length === 0 && whenNotes.length === 0) {
    problems.push({ level: 'error', message: 'This workspace has no Scheduler block or When-note block. Add one, and put the script inside it.' });
  }
  for (const block of top) {
    if (block.type === FRAME || block.type === WHEN_NOTE || DEFINITIONS.has(block.type)) continue;
    problems.push({
      blockId: block.id,
      level: 'warning',
      message: 'This block is outside the Scheduler block. It still runs, but once, not for each day of a scheduled run.',
    });
  }
  for (const block of workspace.getAllBlocks(false)) {
    if (!block.isEnabled()) continue;
    if (NOTE_VALUE_BLOCKS.has(block.type) && !insideWhenNote(block)) {
      problems.push({
        blockId: block.id,
        level: 'warning',
        message: 'This block reads the note that started the run. Put it inside a When-note block; outside one it gives nothing.',
      });
    }
    const needs = NEEDS_TRACKER[block.type];
    if (needs && !block.getInputTargetBlock(needs.input)) {
      problems.push({ blockId: block.id, level: 'error', message: `"${needs.name}" has no tracker. Plug a tracker into it.` });
    }
    if (block.type === 's4e_secret' && knownSecrets) {
      const name = block.getFieldValue('NAME');
      if (name && !knownSecrets.includes(name)) {
        problems.push({
          blockId: block.id,
          level: 'warning',
          message: `This block uses the secret ${name}, which is not in Settings yet. Add it there before the run.`,
        });
      }
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
export const compileWorkspace = (
  workspaceBlocks: string,
  options: { highlight: boolean; knownSecrets?: string[] }
): CompiledWorkspace => {
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
    const whenNotes = workspace.getTopBlocks(true).filter((b) => b.type === WHEN_NOTE && b.isEnabled());
    const labels: Record<string, string> = {};
    for (const block of workspace.getAllBlocks(false)) labels[block.id] = labelOf(block);
    if (!options.highlight) javascriptGenerator.STATEMENT_PREFIX = null;
    return {
      code: javascriptGenerator.workspaceToCode(workspace),
      frame: frames.length > 0 || whenNotes.length > 0,
      schedule: frames.some((b) => b.getFieldValue('NAME') === 'daily') ? 'daily' : 'none',
      problems: checkWorkspace(workspace, options.knownSecrets),
      labels,
      note: whenNotes.length ? trackerOf(whenNotes[0]) : undefined,
    };
  } finally {
    javascriptGenerator.STATEMENT_PREFIX = previousPrefix;
    workspace.dispose();
  }
};

// The list and Settings show whether a workspace is daily. They ask often, so the answer is kept per block text.
const infoCache = new Map<string, { frame: boolean; schedule: 'none' | 'daily'; note?: string }>();
export const workspaceInfo = (workspaceBlocks: string) => {
  let info = infoCache.get(workspaceBlocks);
  if (!info) {
    const compiled = compileWorkspace(workspaceBlocks, { highlight: false });
    info = { frame: compiled.frame, schedule: compiled.schedule, note: compiled.note };
    if (infoCache.size > 100) infoCache.clear();
    infoCache.set(workspaceBlocks, info);
  }
  return info;
};
