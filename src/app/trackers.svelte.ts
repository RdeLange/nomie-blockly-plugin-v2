// The trackers the Tracker dropdown offers: the trackers in the notes of the last 30 days, with their names.
import type { TrackerOption } from '../blockly/nomie-blocks';

class TrackerChoices {
  list = $state<TrackerOption[]>([]);
}

export const trackerChoices = new TrackerChoices();

// A dropdown with no options throws in Blockly, so an empty list shows one placeholder option
export const trackerOptionsNow = (): TrackerOption[] =>
  trackerChoices.list.length ? trackerChoices.list.map((option) => [...option] as TrackerOption) : [['No trackers yet', '#none']];
