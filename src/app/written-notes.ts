// The notes this plugin wrote in the last two minutes. Nomie sends every saved note to the plugin, including the ones
// a run wrote, so a note run would start itself again without this (phase 14).
const WINDOW_MS = 2 * 60_000;
const written = new Map<string, number>();

export const rememberWritten = (text: string, now = Date.now()) => {
  written.set(text, now);
};

export const wasWrittenHere = (text: string, now = Date.now()): boolean => {
  for (const [known, at] of written) if (now - at > WINDOW_MS) written.delete(known);
  return written.has(text);
};
