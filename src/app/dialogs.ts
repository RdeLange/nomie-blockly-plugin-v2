// Dialogs go through Nomie, so they look like Nomie's own. Outside Nomie a question uses the browser's dialog, and a
// notice does nothing.
import { nomie } from '../nomie/plugin';
import type { Deps } from './actions';

export const askConfirm = async (title: string, message: string): Promise<boolean> => {
  const handle = nomie();
  // outside Nomie (the dev server) the browser asks
  if (!handle) return typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`);
  const reply = await handle.plugin.confirm(title, message);
  return reply?.value === true;
};

export const notify = (title: string, message: string) => {
  nomie()?.plugin.alert(title, message);
};

// What the actions need from Nomie, or undefined outside Nomie
export const actionDeps = (): Deps | undefined => {
  const handle = nomie();
  return handle ? { api: handle.api, save: handle.save } : undefined;
};
