// The block picker as an icon rail (mockup 1): each category is a tile with an icon, tinted in the category colour,
// with a small label under it. The selected category's tile is filled. The look is in notebook.css.
import * as Blockly from 'blockly';

// Simple stroke icons, 24x24, one per category (by the category's toolboxitemid)
const ICONS: Record<string, string> = {
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  nomie: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  logic: '<path d="M6 4v6a4 4 0 0 0 4 4h8"/><path d="M15 11l3 3-3 3"/><path d="M6 20v-6"/>',
  loops: '<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12"/><path d="M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>',
  math: '<path d="M5 7h6M8 4v6"/><path d="M14 7h5"/><path d="M5 17h6"/><path d="M14.5 14.5l4 4M18.5 14.5l-4 4"/>',
  text: '<path d="M5 6h14"/><path d="M12 6v13"/><path d="M9 19h6"/>',
  lists: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
  variables: '<path d="M5 5l6 14M11 5L5 19"/><path d="M15 9c3 0 4 2 4 5s-1 5-4 5"/>',
  functions: '<path d="M14 4h-1a3 3 0 0 0-3 3v13"/><path d="M7 11h7"/><path d="M16 14l4 5M20 14l-4 5"/>',
  objects:
    '<path d="M8 4c-2 0-2 1-2 3v2c0 1.5-1 3-2 3 1 0 2 1.5 2 3v2c0 2 0 3 2 3"/><path d="M16 4c2 0 2 1 2 3v2c0 1.5 1 3 2 3-1 0-2 1.5-2 3v2c0 2 0 3-2 3"/>',
  advanced:
    '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
};

export const iconSvg = (id: string) =>
  `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[id] ?? ICONS.advanced}</svg>`;

export class NomieRailCategory extends Blockly.ToolboxCategory {
  protected createIconDom_(): Element {
    const tile = document.createElement('span');
    tile.className = 'nomie-rail-tile';
    tile.innerHTML = iconSvg(this.getId());
    return tile;
  }

  protected createLabelDom_(name: string): Element {
    const label = document.createElement('span');
    label.className = 'blocklyToolboxCategoryLabel nomie-rail-label';
    label.textContent = name;
    return label;
  }

  // The category colour goes into a CSS variable; notebook.css tints the tile with it. (Blockly draws a coloured
  // border on the left by default.)
  protected addColourBorder_(colour: string): void {
    this.rowDiv_?.style.setProperty('--category', colour);
  }

  // Blockly paints the whole row in the category colour when selected; the rail fills only the tile (CSS).
  setSelected(isSelected: boolean): void {
    super.setSelected(isSelected);
    if (this.rowDiv_) this.rowDiv_.style.backgroundColor = '';
  }

  // the category icon does not open and close like a folder
  protected openIcon_(): void {}
  protected closeIcon_(): void {}
}

let registered = false;
// Every category in the toolbox uses the rail look.
export const registerRail = () => {
  if (registered) return;
  registered = true;
  Blockly.registry.register(Blockly.registry.Type.TOOLBOX_ITEM, Blockly.ToolboxCategory.registrationName, NomieRailCategory, true);
};
