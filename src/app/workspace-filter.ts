// The filter of the list beside the editor (phase 19): the words typed must all appear in the name, the name used in
// notes or the description of a workspace (any case).
export const filterWorkspaces = <T extends { displayName: string; name: string; description: string }>(list: T[], query: string): T[] => {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return list;
  return list.filter((w) => {
    const text = `${w.displayName} ${w.name} ${w.description}`.toLowerCase();
    return words.every((word) => text.includes(word));
  });
};
