// What the screen shows: the mode (the full page or the widget), the theme, and which view is open.
export type View = 'list' | 'editor' | 'settings' | 'info';

class UiState {
  mode = $state<'modal' | 'widget'>('modal');
  theme = $state<'light' | 'dark'>('light');
  view = $state<View>('list');
  editingId = $state<string | null>(null);
  // the dashboard widget the widget frame shows (a workspace id), when DailyNomie placed one (phase 20)
  widgetIndex = $state<string | undefined>(undefined);
  // the tab the editor opens on, once (a card's Show opens the Run tab of a failed workspace)
  startTab = $state<'details' | 'detailed' | 'run' | 'console' | 'preview' | undefined>(undefined);
  ready = $state(false);
  // the editor has changes that are not saved yet (the list beside it asks before it switches)
  editorDirty = $state(false);
}

export const ui = new UiState();
