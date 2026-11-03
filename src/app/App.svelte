<script lang="ts">
  import { onMount } from 'svelte';
  import './tokens.css';
  import './styles.css';
  import { ui } from './ui.svelte';
  import { appState } from './state.svelte';
  import WorkspaceList from './WorkspaceList.svelte';
  import WorkspaceEditor from './WorkspaceEditor.svelte';
  import SettingsView from './SettingsView.svelte';
  import { startNomie } from '../nomie/plugin';
  import { actionDeps, notify } from './dialogs';
  import { runNow } from './actions';

  onMount(() => {
    startNomie();
    if (!ui.ready) ui.ready = true;
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
    <p class="muted">Loading…</p>
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
          <button class="button" onclick={() => runFromWidget(workspace.id)}>Run</button>
        </div>
      {/each}
      {#each appState.workspaces.filter((w) => !appState.widget[w.id]).slice(0, 4) as workspace (workspace.id)}
        <div class="row" style="margin-top: 10px">
          <span class="emoji" style="background: {workspace.color}">{workspace.emoji}</span>
          <span class="grow">{workspace.displayName}</span>
          <button class="button" onclick={() => runFromWidget(workspace.id)}>Run</button>
        </div>
      {/each}
    </div>
  {:else if ui.view === 'list'}
    <WorkspaceList />
  {:else if ui.view === 'editor' && ui.editingId}
    <WorkspaceEditor id={ui.editingId} />
  {:else if ui.view === 'settings'}
    <SettingsView />
  {:else if ui.view === 'info'}
    <div class="header">
      <button class="button plain" onclick={() => (ui.view = 'list')}>Back</button>
      <h1 class="title">About</h1>
    </div>
    <div class="card">
      <p>Nomie Blockly builds small automations from blocks. A workspace can read your notes, count trackers, fetch a web page, and write values into your notes.</p>
      <p class="muted">The Scheduler block runs a workspace every day, for the days since its last run, up to yesterday.</p>
    </div>
  {/if}
</div>
