// The fingerprint of a workspace's blocks, with the version of the generator: the code stored with a workspace is
// used only while its fingerprint matches (phase 16). Raise GENERATOR_VERSION whenever the generated code changes.
// The fingerprint is not a security check: a file's code is never kept, because an import is compiled again.
export const GENERATOR_VERSION = '2';

export const fingerprint = (workspaceBlocks: string): string => {
  const text = `${GENERATOR_VERSION}\n${workspaceBlocks}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `g${GENERATOR_VERSION}-${hash.toString(16)}`;
};
