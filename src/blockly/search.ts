// Searching the palette. The Search tile on the rail opens the drawer with the blocks that match what is typed in the
// search field (the editor shows that field over the top of the drawer, see WorkspaceEditor.svelte).
// Blockly's search plugin puts its field inside the category row, which is too narrow on a rail, so this is our own:
// a dynamic category whose contents follow the query.
import * as Blockly from 'blockly';
import { setupBlockly } from './setup';

export const SEARCH_CATEGORY = 'NOMIE_SEARCH';
// room at the top of the drawer for the search field
const FIELD_ROOM = 64;
const MAX_RESULTS = 30;

type FlyoutItem = Blockly.utils.toolbox.FlyoutItemInfo;
type Entry = { item: FlyoutItem; text: string };

type ToolboxLike = { contents: Array<{ kind: string; name?: string; contents?: Array<Record<string, unknown>> }> };

// The words a block can be found by: its category, its type and the text on the block.
export const indexBlocks = (toolbox: ToolboxLike): Entry[] => {
  setupBlockly();
  const workspace = new Blockly.Workspace();
  const entries: Entry[] = [];
  try {
    for (const category of toolbox.contents) {
      for (const item of category.contents ?? []) {
        if (item.kind !== 'block') continue;
        let text = '';
        try {
          const block = item.blockxml
            ? Blockly.Xml.domToBlock(Blockly.utils.xml.textToDom(String(item.blockxml)), workspace)
            : workspace.newBlock(String(item.type));
          text = block.toString();
        } catch {
          // a block that cannot be built headless is still found by its type and category
        }
        const type = String(item.type ?? /type="([^"]+)"/.exec(String(item.blockxml))?.[1] ?? '');
        entries.push({ item: item as unknown as FlyoutItem, text: `${category.name ?? ''} ${type.replace(/_/g, ' ')} ${text}`.toLowerCase() });
      }
    }
  } finally {
    workspace.dispose();
  }
  return entries;
};

// The blocks whose words contain every word of the query
export const searchBlocks = (entries: Entry[], query: string): FlyoutItem[] => {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return entries.filter((e) => words.every((w) => e.text.includes(w))).map((e) => e.item);
};

// What the drawer shows for a query
export const searchContents = (entries: Entry[], query: string): FlyoutItem[] => {
  const head: FlyoutItem[] = [{ kind: 'sep', gap: String(FIELD_ROOM) } as FlyoutItem];
  const trimmed = query.trim();
  if (!trimmed) return [...head, { kind: 'label', text: 'Type to search all blocks' } as FlyoutItem];
  const found = searchBlocks(entries, trimmed);
  if (!found.length) return [...head, { kind: 'label', text: `No blocks match "${trimmed}"` } as FlyoutItem];
  return [...head, ...found.slice(0, MAX_RESULTS)];
};

// Connects the Search category of an editor workspace to the query the editor holds. Returns a function that shows
// the results in the drawer: Blockly 13 deselects the category (and closes the drawer) when the keyboard focus moves
// to the search field, so while someone types, the editor fills the drawer itself.
export const attachSearch = (workspace: Blockly.WorkspaceSvg, toolbox: ToolboxLike, query: () => string) => {
  let entries: Entry[] | undefined;
  const contents = () => {
    entries ??= indexBlocks(toolbox);
    return searchContents(entries, query());
  };
  workspace.registerToolboxCategoryCallback(SEARCH_CATEGORY, contents);
  return () => workspace.getToolbox()?.getFlyout()?.show(contents());
};
