// The health line of a workspace's card (phase 17): its last scheduled run, or else its last note run.
import type { DayRecord, TriggerRecord } from './state.svelte';

export type Health = { failed: boolean; text: string };

const dayText = (iso: string) => new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// undefined when the workspace has not run yet
export const healthOf = (
  workspace: { schedule: string },
  days: DayRecord[] | undefined,
  trigger: TriggerRecord | undefined
): Health | undefined => {
  const last = days?.[days.length - 1];
  if (last) {
    return last.ok ? { failed: false, text: `Ran ${last.day}` } : { failed: true, text: `Failed on ${last.day}: ${last.error ?? 'stopped'}` };
  }
  if (trigger) {
    const when = dayText(trigger.at);
    return trigger.ok
      ? { failed: false, text: `Ran for ${trigger.label} on ${when}` }
      : { failed: true, text: `Failed on ${when}: ${trigger.error ?? 'stopped'}` };
  }
  return undefined;
};
