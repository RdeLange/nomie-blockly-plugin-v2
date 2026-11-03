<script lang="ts">
  import { t } from './i18n.svelte';
  import { onMount } from 'svelte';
  import './tokens.css';
  import './styles.css';
  import { ui } from './ui.svelte';
  import { appState } from './state.svelte';
  import WorkspaceList from './WorkspaceList.svelte';
  import SettingsView from './SettingsView.svelte';
  import { compileStale } from './actions';
  // The editor is Blockly. It is loaded the first time it opens, so the plugin's start does not load it (phase 16).
  let editorModule = $state<{ default: any } | undefined>();
  $effect(() => {
    if (ui.view === 'editor' && !editorModule) void import('./WorkspaceEditor.svelte').then((m) => (editorModule = m));
  });
  import { startNomie } from '../nomie/plugin';
  import { actionDeps, notify } from './dialogs';
  import { runNow } from './actions';

  // The plugin marks the app ready once the stored state is loaded (or at once outside Nomie). Showing the lists
  // before that let a workspace added in the meantime be replaced by the stored state when it loads.
  onMount(() => {
    startNomie();
  });

  // the widget: a run button for each workspace, and the value a workspace last showed (see the widget view)
  const runFromWidget = (id: string) => {
    const deps = actionDeps();
    const workspace = appState.workspaces.find((w) => w.id === id);
    if (deps && workspace) void runNow(deps, workspace);
  };
  const updatedText = (at: string) =>
    new Date(at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
</script>

<div class="app" class:dark={ui.theme === 'dark'} class:editing={ui.view === 'editor' && ui.mode !== 'widget'}>
  {#if !ui.ready}
    <p class="muted">{t('Loading…')}</p>
  {:else if ui.mode === 'widget'}
    <div class="card">
      <div class="row">
        <span class="grow"><strong>Blockly</strong></span>
        <span class="muted">{appState.workspaces.length} workspaces</span>
      </div>
      {#each appState.workspaces.filter((w) => appState.widget[w.id]) as workspace (workspace.id)}
        {@const shown = appState.widget[workspace.id]}
        <div class="widget-tile">
          <span class="widget-label">{shown.label}</span>
          <span class="widget-value">{shown.value}</span>
          <span class="widget-time">updated {updatedText(shown.at)}</span>
          <button class="button" onclick={() => runFromWidget(workspace.id)}>{t('Run')}</button>
        </div>
      {/each}
      {#each appState.workspaces.filter((w) => !appState.widget[w.id]).slice(0, 4) as workspace (workspace.id)}
        <div class="row" style="margin-top: 10px">
          <span class="emoji" style="background: {workspace.color}">{workspace.emoji}</span>
          <span class="grow">{workspace.displayName}</span>
          <button class="button" onclick={() => runFromWidget(workspace.id)}>{t('Run')}</button>
        </div>
      {/each}
    </div>
  {:else if ui.view === 'list'}
    <WorkspaceList />
  {:else if ui.view === 'editor' && ui.editingId}
    {#if editorModule}
      {@const Editor = editorModule.default}
      <Editor id={ui.editingId} />
    {:else}
      <p class="muted">Loading the editor…</p>
    {/if}
  {:else if ui.view === 'settings'}
    <SettingsView />
  {:else if ui.view === 'info'}
    <div class="header">
      <button class="button plain" onclick={() => (ui.view = 'list')}>{t('Back')}</button>
      <h1 class="title">{t('About')}</h1>
    </div>
    <div class="card">
      <p>Nomie Blockly builds small automations from blocks. A workspace can read your notes, count trackers, fetch a web page, and write values into your notes.</p>
      <p class="muted">The Scheduler block runs a workspace every day, for the days since its last run, up to yesterday.</p>
    </div>
  {/if}
</div>
