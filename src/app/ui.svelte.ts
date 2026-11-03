// What the screen shows: the mode (the full page or the widget), the theme, and which view is open.
export type View = 'list' | 'editor' | 'settings' | 'info';

class UiState {
  mode = $state<'modal' | 'widget'>('modal');
  theme = $state<'light' | 'dark'>('light');
  view = $state<View>('list');
  editingId = $state<string | null>(null);
  // the tab the editor opens on, once (a card's Show opens the Run tab of a failed workspace)
  startTab = $state<'details' | 'run' | 'console' | undefined>(undefined);
  ready = $state(false);
}

export const ui = new UiState();
