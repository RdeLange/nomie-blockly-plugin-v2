// A stand-in for the Nomie plugin SDK, for the UI check scripts: injected into the page before the app starts, so
// the dev server can run workspaces, save, and show dialogs as it would inside Nomie. Notes live in memory.
// Dialogs are answered yes, and what they said is kept in window.__nomie.dialogs.
(() => {
  const day = (offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    d.setHours(12, 0, 0, 0);
    return d;
  };
  // a mood note for each of the last 10 days
  const notes = Array.from({ length: 10 }, (_, i) => ({
    note: `#mood(${4 + (i % 5)})`,
    end: day(-i).getTime(),
    elements: [{ type: 'tracker', id: 'mood', prefix: '#', value: 4 + (i % 5) }],
  }));
  const store = {};
  const state = { notes, created: [], dialogs: [], saved: 0 };
  window.__nomie = state;

  class FakeNomiePlugin {
    constructor(options) {
      this.options = options;
      this.prefs = { theme: 'light' };
      this.storage = {
        init: async () => undefined,
        getItem: (key) => store[key],
        setItem: async (key, value) => {
          store[key] = JSON.parse(JSON.stringify(value));
          state.saved += 1;
        },
      };
    }
    onRegistered(fn) {
      setTimeout(fn, 0);
    }
    onUIOpened(fn) {
      setTimeout(fn, 10);
    }
    onWidget() {}
    onLaunch() {}
    onNote() {}
    async searchNotes(term, date, daysBack) {
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      const start = new Date(end);
      start.setDate(start.getDate() - daysBack);
      start.setHours(0, 0, 0, 0);
      return state.notes.filter((n) => n.end >= start.getTime() && n.end <= end.getTime() && (n.note.includes(term) || term === ''));
    }
    async getTrackable(tag) {
      return { known: true, trackable: { tracker: { tag, label: tag.slice(1), emoji: '', type: 'value' } } };
    }
    async getTrackableUsage() {
      return { usage: { values: [4, 5, 6, 7] } };
    }
    createNote({ note, end }) {
      state.created.push({ note, end: new Date(end).toISOString() });
    }
    alert(title, message) {
      state.dialogs.push(`${title}: ${message}`);
    }
    async confirm(title, message) {
      state.dialogs.push(`${title}: ${message}`);
      return { value: true };
    }
    async prompt(title, message) {
      state.dialogs.push(`${title}: ${message}`);
      return { value: 'typed' };
    }
  }
  window.NomiePlugin = FakeNomiePlugin;
})();
