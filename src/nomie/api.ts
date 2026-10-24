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
  end: string | Date;
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
  // the values of a tracker, one per day, going back `daysBack` days
  getTrackerValues(tag: string, daysBack: number): Promise<number[]>;
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
  getTrackerValues: async (tag, daysBack) => {
    const reply = await plugin.getTrackableUsage({ tag, daysBack });
    return (reply && reply.usage && reply.usage.values) || [];
  },
  createNote: (note, end) => plugin.createNote({ note, end }),
  alert: (title, message) => plugin.alert(title, message),
  prompt: async (title, message) => {
    const reply = await plugin.prompt(title, message, 'text');
    return reply && reply.value != null ? String(reply.value) : null;
  },
});
