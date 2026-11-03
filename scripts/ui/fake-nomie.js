// A stand-in for the Nomie plugin SDK, for the UI check scripts: injected into the page before the app starts, so
// the dev server can run workspaces, save, and show dialogs as it would inside Nomie. Notes live in memory.
// Dialogs are answered yes, and what they said is kept in window.__nomie.dialogs.
(() => {
  // a frame inside the page (the HTML widget's sandboxed frame) has no Nomie and no storage: nothing to stand in for
  if (window.top !== window) return;
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
  // kept in localStorage, so a reload of the page (a new launch of the plugin) finds what was saved
  const STORE_KEY = 'fake-nomie-store';
  const store = JSON.parse(window.localStorage.getItem(STORE_KEY) || '{}');
  const state = { notes, created: [], dialogs: [], saved: 0, pickers: [], opened: [], noteListeners: [], widgetListeners: [] };
  // a note saved in Nomie: the plugin's onNote listeners get it, as Nomie sends it (log.expanded())
  state.fireNote = (note) => state.noteListeners.forEach((fn) => fn(note));
  // the widget frame opens: the plugin's onWidget listeners run, as Nomie opens the widget
  state.fireWidget = () => state.widgetListeners.forEach((fn) => fn());
  window.__nomie = state;

  class FakeNomiePlugin {
    constructor(options) {
      this.options = options;
      // the language of the Nomie user, as Nomie sends it with `registered` (window.__fakeLanguage can set it)
      this.prefs = { theme: 'light', language: window.__fakeLanguage ?? 'en' };
      this.storage = {
        init: async () => undefined,
        getItem: (key) => store[key],
        setItem: async (key, value) => {
          store[key] = JSON.parse(JSON.stringify(value));
          window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
          state.saved += 1;
        },
      };
    }
    onRegistered(fn) {
      setTimeout(fn, 0);
    }
    onUIOpened(fn) {
      // the page opens as the modal, unless it is a dashboard widget (DailyNomie opens those with onWidget only)
      if (!window.location.search.includes('widgetindex=')) setTimeout(fn, 10);
    }
    onWidget(fn) {
      state.widgetListeners.push(fn);
    }
    onLaunch() {}
    onNote(fn) {
      state.noteListeners.push(fn);
    }
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
    // Nomie's tracker picker: answers with the tracker 'hydration' (a cancelled picker would never answer)
    async selectTrackables(type, multiple) {
      state.pickers.push({ type, multiple });
      return [{ type: 'tracker', id: '#hydration', tracker: { tag: 'hydration' } }];
    }
    async getLocation() {
      return { id: 'location', lat: 52.37, lng: 4.9 };
    }
    openURL(url, title) {
      state.opened.push({ url, title });
    }
    async confirm(title, message) {
      state.dialogs.push(`${title}: ${message}`);
      // yes, unless a check says no (window.__fakeConfirm = false)
      return { value: window.__fakeConfirm ?? true };
    }
    async prompt(title, message) {
      state.dialogs.push(`${title}: ${message}`);
      return { value: 'typed' };
    }
  }
  window.NomiePlugin = FakeNomiePlugin;
})();
