// Dialogs go through Nomie, so they look like Nomie's own. Outside Nomie there is no dialog: the action does nothing.
import { nomie } from '../nomie/plugin';
import type { Deps } from './actions';

export const askConfirm = async (title: string, message: string): Promise<boolean> => {
  const handle = nomie();
  if (!handle) return false;
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
