// The part of the Nomie plugin SDK this plugin uses, behind one interface. The runtime and the tests use this
// interface, so they do not need the SDK, and a change to the SDK changes only this file.

export type NoteElement = {
  type: 'tracker' | 'person' | 'context' | 'pointer' | string;
  id: string;
  prefix?: string;
  value?: number;
};

export type NoteLike = {
  note: string;
  // when the note was made: Nomie sends a timestamp
  end: string | number | Date;
  elements: NoteElement[];
};

export type TrackerInfo = {
  tag: string;
  label: string;
  emoji: string;
  type: string;
  color: string;
};

export interface NomieApi {
  // notes that match the term, from `date` back over `daysBack` days (the SDK's own search)
  searchNotes(term: string, date: Date, daysBack: number): Promise<NoteLike[]>;
  // the trackers Nomie has for this tag, or null when Nomie does not have the tracker
  getTracker(tag: string): Promise<TrackerInfo | null>;
  // the values of a tracker, one per day, going back `daysBack` days from `end` (default: now)
  getTrackerValues(tag: string, daysBack: number, end?: Date): Promise<number[]>;
  createNote(note: string, end: Date): void;
  alert(title: string, message: string): void;
  prompt(title: string, message: string): Promise<string | null>;
}

// Adapts the SDK object (window.NomiePlugin instance) to NomieApi. The SDK wraps some replies, such as
// { trackable } and { usage }, so the adapter unwraps them here.
export const createNomieApi = (plugin: any): NomieApi => ({
  searchNotes: async (term, date, daysBack) => {
    const results = await plugin.searchNotes(term, date, daysBack);
    return results || [];
  },
  getTracker: async (tag) => {
    const reply = await plugin.getTrackable(tag);
    if (!reply || reply.known === false || !reply.trackable) return null;
    const tracker = reply.trackable.tracker || {};
    return {
      tag: tracker.tag,
      label: tracker.label || tracker.tag,
      emoji: tracker.emoji || '',
      type: tracker.type || 'tick',
      color: tracker.color || '',
    };
  },
  getTrackerValues: async (tag, daysBack, end) => {
    // Nomie counts back from `date` (and caps daysBack at 90)
    const reply = await plugin.getTrackableUsage(end ? { tag, daysBack, date: end } : { tag, daysBack });
    return (reply && reply.usage && reply.usage.values) || [];
  },
  createNote: (note, end) => plugin.createNote({ note, end }),
  alert: (title, message) => plugin.alert(title, message),
  prompt: async (title, message) => {
    const reply = await plugin.prompt(title, message, 'text');
    return reply && reply.value != null ? String(reply.value) : null;
  },
});

// The notes of one day ('YYYY-MM-DD', local time) that match the term. Nomie's search runs from the start of the day
// `daysBack` days before the date to the end of the date, so it cannot ask for exactly one day; this asks for that
// day and the one before, and keeps the notes made on the day. (v1 asked for the day after, which also counted the
// notes of the next day.)
export const notesOnDay = async (api: NomieApi, term: string, day: string): Promise<NoteLike[]> => {
  const [year, month, date] = day.split('-').map(Number);
  const notes = await api.searchNotes(term, new Date(year, month - 1, date, 12), 1);
  return notes.filter((note) => {
    const at = new Date(note.end);
    return at.getFullYear() === year && at.getMonth() === month - 1 && at.getDate() === date;
  });
};
