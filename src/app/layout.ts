// The layout by width (phase 19). Wide enough, the list of workspaces sits beside the editor; a phone (below 900 px)
// gets the phone layout of the editor, and the rail of the blocks shows labels for the selected tile only.
export const SIDE_BY_SIDE_MIN_WIDTH = 1200;
export const PHONE_MAX_WIDTH = 899;

export const sideBySide = (width: number): boolean => width >= SIDE_BY_SIDE_MIN_WIDTH;
export const isPhone = (width: number): boolean => width <= PHONE_MAX_WIDTH;
