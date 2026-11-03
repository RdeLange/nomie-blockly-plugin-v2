// The note that started a run (a saved note, or one typed in Try with a note): its text, its day, and the values of
// its trackers, as the When-note blocks read them.
import { localDayKey } from './dates';

export type TriggerNote = {
  text: string;
  // the day the note was saved, 'YYYY-MM-DD'
  day: string;
  // the numbers of the trackers in the note, by tag ('#mood' → 6)
  values: Record<string, number>;
};

// The part of a saved note that the trigger reads (see api.ts NoteLike)
export type NoteWithElements = {
  note: string;
  end: string | number | Date;
  elements: Array<{ type: string; id: string; prefix?: string; value?: number }>;
};

// The tags of the trackers in a note: '#run', '#mood'
export const noteTags = (note: Pick<NoteWithElements, 'elements'>): string[] =>
  note.elements.filter((e) => e.type === 'tracker').map((e) => `${e.prefix ?? ''}${e.id}`);

export const triggerFromNote = (note: NoteWithElements): TriggerNote => {
  const values: Record<string, number> = {};
  for (const element of note.elements) {
    if (element.type === 'tracker' && typeof element.value === 'number') values[`${element.prefix ?? ''}${element.id}`] = element.value;
  }
  return { text: note.note, day: localDayKey(new Date(note.end)), values };
};

// A note typed in Try with a note: '#mood(2) #run' on a day. Trackers take their values in brackets.
export const triggerFromText = (text: string, day: string): TriggerNote => {
  const values: Record<string, number> = {};
  for (const match of text.matchAll(/#([\w-]+)(?:\((-?\d+(?:\.\d+)?)\))?/g)) {
    if (match[2] !== undefined) values[`#${match[1]}`] = Number(match[2]);
  }
  return { text, day, values };
};
