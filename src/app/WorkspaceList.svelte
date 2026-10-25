<script lang="ts">
  import { appState } from './state.svelte';
  import { ui } from './ui.svelte';
  import { actionDeps, askConfirm, notify } from './dialogs';
  import { runNow } from './actions';
  import { newWorkspaceFromBlocks, addWorkspaces } from './editing';
  import { parseWorkspaceFile, templateWorkspaces, type Workspace } from '../domain/workspace';
  import { generateCode } from '../blockly/setup';

  let adding = $state(false);
  let message = $state('');
  let fileInput: HTMLInputElement | undefined = $state();

  const dayText = (iso: string) => (iso ? new Date(iso).toLocaleDateString() : 'never');
  const isDaily = (w: Workspace) => w.jscode.includes('var schedule = "daily"');

  const edit = (id: string) => {
    ui.editingId = id;
    ui.view = 'editor';
  };

  const run = async (workspace: Workspace) => {
    const deps = actionDeps();
    if (!deps) return;
    const lines: string[] = [];
    const result = await runNow(deps, workspace, { output: (text) => lines.push(text) });
    // a successful run is quiet, as in the editor: the list shows its last run. A failure still says why.
    if (!result.ok) notify(workspace.displayName, lines.join('\n') || 'Stopped.');
  };

  const info = (workspace: Workspace) => notify(workspace.displayName, workspace.description || 'No description yet.');

  const remove = async (workspace: Workspace) => {
    if (!(await askConfirm('Delete workspace?', `Delete "${workspace.displayName}"? This cannot be undone.`))) return;
    appState.workspaces = appState.workspaces.filter((w) => w.id !== workspace.id);
    actionDeps()?.save();
  };

  const addFromFile = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      const workspaces = parseWorkspaceFile(await file.text());
      addWorkspaces(workspaces);
      message = `Added ${workspaces.length} workspace${workspaces.length === 1 ? '' : 's'}.`;
      adding = false;
    } catch (error) {
      message = `This file could not be read: ${(error as Error).message}`;
    }
  };

  const addTemplate = (template: Workspace) => {
    addWorkspaces([template]);
    message = `Added "${template.displayName}".`;
  };

  const addNew = () => {
    const workspace = newWorkspaceFromBlocks();
    addWorkspaces([workspace]);
    adding = false;
    edit(workspace.id);
  };
</script>

<div class="header">
  <h1 class="title">Blockly</h1>
  <div class="row">
    <button class="button plain" onclick={() => (ui.view = 'settings')}>Settings</button>
    <button class="button plain" onclick={() => (ui.view = 'info')}>About</button>
    <button class="button" onclick={() => (adding = !adding)}>{adding ? 'Close' : 'Add'}</button>
  </div>
</div>

{#if message}
  <p class="muted">{message}</p>
{/if}

{#if adding}
  <div class="card">
    <p class="muted">Add a workspace</p>
    <div class="row">
      <button class="button" onclick={addNew}>New workspace</button>
      <button class="button" onclick={() => fileInput?.click()}>Import a .wsp file</button>
      <input bind:this={fileInput} type="file" accept=".wsp,.json,application/json" onchange={addFromFile} hidden />
    </div>
    <p class="muted" style="margin-top: 14px">Templates</p>
    {#each templateWorkspaces() as template (template.name)}
      <div class="row" style="margin-top: 8px">
        <span class="emoji" style="background: {template.color}">{template.emoji}</span>
        <span class="grow">
          {template.displayName}
          <br /><span class="muted">{template.description}</span>
        </span>
        <button class="button plain" onclick={() => addTemplate(template)}>Add</button>
      </div>
    {/each}
  </div>
{/if}

{#if appState.workspaces.length === 0}
  <div class="card">
    <p>No workspaces yet. Add one above, or start from a template.</p>
  </div>
{/if}

{#each appState.workspaces as workspace (workspace.id)}
  <div class="card">
    <div class="row">
      <span class="emoji" style="background: {workspace.color}">{workspace.emoji}</span>
      <div class="grow">
        <strong>{workspace.displayName}</strong>
        <div class="muted">{workspace.description}</div>
        <div class="row" style="margin-top: 6px">
          <span class="pill" class:on={isDaily(workspace)}>{isDaily(workspace) ? 'Daily' : 'Not scheduled'}</span>
          <span class="muted">Last run: {dayText(workspace.latestrun)}</span>
        </div>
      </div>
    </div>
    <div class="row" style="margin-top: 10px; justify-content: flex-end">
      <button class="button plain" onclick={() => info(workspace)}>Info</button>
      <button class="button plain" onclick={() => edit(workspace.id)}>Edit</button>
      <button class="button" onclick={() => run(workspace)}>Run</button>
      <button class="button danger" onclick={() => remove(workspace)}>Delete</button>
    </div>
  </div>
{/each}
