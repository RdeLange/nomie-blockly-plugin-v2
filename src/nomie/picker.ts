// Nomie's tracker picker, for the Tracker dropdown of the blocks. The plugin sets it when it runs inside Nomie; outside
// Nomie nothing is picked. It lives here, not in the blocks, so the plugin's start does not load Blockly (phase 16).
let picker: () => Promise<string | null> = async () => null;

export const setTrackerPicker = (fn: () => Promise<string | null>) => {
  picker = fn;
};

export const pickTracker = (): Promise<string | null> => picker();
