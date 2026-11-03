// The health line of a workspace's card (phase 17): its last scheduled run, or else its last note run.
import type { DayRecord, TriggerRecord } from './state.svelte';
import { t, tf } from './i18n.svelte';

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
    return last.ok
      ? { failed: false, text: tf('Ran {day}', { day: last.day }) }
      : { failed: true, text: tf('Failed on {day}: {error}', { day: last.day, error: last.error ?? t('stopped') }) };
  }
  if (trigger) {
    const when = dayText(trigger.at);
    return trigger.ok
      ? { failed: false, text: tf('Ran for {label} on {when}', { label: trigger.label, when }) }
      : { failed: true, text: tf('Failed on {when}: {error}', { when, error: trigger.error ?? t('stopped') }) };
  }
  return undefined;
};
