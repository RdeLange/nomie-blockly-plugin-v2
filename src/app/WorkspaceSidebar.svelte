<script lang="ts">
  // The list of workspaces beside the editor, from 1200 px wide (phase 19). Switching asks first when the editor has
  // changes that are not saved, as Back does.
  import { appState } from './state.svelte';
  import { ui } from './ui.svelte';
  import { askConfirm } from './dialogs';
  import { addWorkspaces, newWorkspaceFromBlocks } from './editing';
  import { healthOf } from './health';
  import { filterWorkspaces } from './workspace-filter';
  import { t, tf } from './i18n.svelte';

  let query = $state('');
  const shown = $derived(filterWorkspaces(appState.workspaces, query));

  // Leaving the open workspace: unsaved changes are asked about first
  const mayLeave = async (): Promise<boolean> =>
    !ui.editorDirty || (await askConfirm('Leave without saving?', 'Your changes are not saved yet.'));

  const open = async (id: string) => {
    if (id === ui.editingId || !(await mayLeave())) return;
    ui.editorDirty = false;
    ui.editingId = id;
  };

  const addNew = async () => {
    if (!(await mayLeave())) return;
    ui.editorDirty = false;
    const [added] = await addWorkspaces([newWorkspaceFromBlocks()]);
    ui.editingId = added.id;
  };
</script>

<aside class="ws-side" aria-label="Workspaces">
  <div class="ws-side-head">
    <input class="input" type="search" placeholder={t('Search')} aria-label={t('Search')} bind:value={query} />
    <button class="button" onclick={addNew}>{t('Add')}</button>
  </div>
  <ul class="ws-side-list">
    {#each shown as workspace (workspace.id)}
      {@const health = healthOf(workspace, appState.scheduleDays[workspace.id], appState.lastTrigger[workspace.id])}
      <li>
        <button class="ws-item" class:selected={workspace.id === ui.editingId} aria-current={workspace.id === ui.editingId ? 'true' : undefined} onclick={() => open(workspace.id)}>
          <span class="emoji" style="background: {workspace.color}">{workspace.emoji}</span>
          <span class="ws-item-text">
            <strong>{workspace.displayName}</strong>
            <span class="muted">{workspace.schedule === 'daily' ? t('Daily') : workspace.note ? tf('Runs when {tracker} is logged', { tracker: workspace.note }) : t('Not scheduled')}</span>
            {#if health}
              <span class="health" class:failed={health.failed}>{health.text}</span>
            {/if}
          </span>
        </button>
      </li>
    {:else}
      <li class="muted ws-side-empty">{query ? '' : t('No workspaces yet. Add one above, or start from a template.')}</li>
    {/each}
  </ul>
</aside>
