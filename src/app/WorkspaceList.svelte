<script lang="ts">
  import { t, tf } from './i18n.svelte';
  import { appState } from './state.svelte';
  import { ui } from './ui.svelte';
  import { actionDeps, askConfirm, notify } from './dialogs';
  import { runNow } from './actions';
  const PAUSE_MS = 60_000;
  // a workspace paused for note runs says so for a minute
  const pausedByNotes = (w: Workspace) => {
    const at = appState.notePauses[w.id];
    return at !== undefined && Date.now() - at < PAUSE_MS;
  };
  import { newWorkspaceFromBlocks, addWorkspaces, importSummary } from './editing';
  import { copyOfWorkspace, exampleWorkspaces, parseWorkspaceFile, templateWorkspaces, workspaceToFile, type Workspace } from '../domain/workspace';
  import { healthOf } from './health';
  import { downloadText } from './download';

  // the example library: built once, from examples.json (see domain/example-library.ts)
  const examples = exampleWorkspaces();
  let adding = $state(false);
  let message = $state('');
  let fileInput: HTMLInputElement | undefined = $state();

  const dayText = (iso: string) => (iso ? new Date(iso).toLocaleDateString() : t('never'));
  // what the workspace was compiled to (see app/compiler.ts): a daily schedule and the note it runs on
  const isDaily = (w: Workspace) => w.schedule === 'daily';

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
    if (!result.ok) notify(workspace.displayName, lines.join('\n') || t('Stopped.'));
  };

  const info = (workspace: Workspace) => notify(workspace.displayName, workspace.description || t('No description yet.'));

  const remove = async (workspace: Workspace) => {
    if (!(await askConfirm(t('Delete workspace?'), tf('Delete "{name}"? This cannot be undone.', { name: workspace.displayName })))) return;
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
      // a shared workspace is code from someone else: say what it does before adding it
      const count = `${workspaces.length} workspace${workspaces.length === 1 ? '' : 's'}`;
      if (!(await askConfirm(tf('Add {count}?', { count: String(count) }), `${t('Only add workspaces you trust.')}\n\n${await importSummary(workspaces)}`))) return;
      await addWorkspaces(workspaces);
      message = `Added ${workspaces.length} workspace${workspaces.length === 1 ? '' : 's'}.`;
      adding = false;
    } catch (error) {
      message = `This file could not be read: ${(error as Error).message}`;
    }
  };

  // a workspace's file: that one workspace, with no remembered values, no secrets and no earlier version
  const exportOne = (workspace: Workspace) =>
    downloadText(`blockly-${workspace.displayName}.wsp`, workspaceToFile([workspace]));

  const duplicate = async (workspace: Workspace) => {
    const [added] = await addWorkspaces([copyOfWorkspace(workspace)]);
    message = `Copied as "${added.displayName}".`;
  };

  // a failed card opens the Run tab of its workspace, where the error is
  const showFailure = (id: string) => {
    ui.startTab = 'run';
    edit(id);
  };

  const addTemplate = async (template: Workspace) => {
    await addWorkspaces([template]);
    message = tf('Added "{name}".', { name: template.displayName });
  };

  const addNew = async () => {
    // the workspace is added with a new id, and the editor opens that one
    const [added] = await addWorkspaces([newWorkspaceFromBlocks()]);
    adding = false;
    edit(added.id);
  };
</script>

<div class="header">
  <h1 class="title">Blockly</h1>
  <div class="row">
    <button class="button plain" onclick={() => (ui.view = 'settings')}>{t('Settings')}</button>
    <button class="button plain" onclick={() => (ui.view = 'info')}>{t('About')}</button>
    <button class="button" onclick={() => (adding = !adding)}>{adding ? t('Close') : t('Add')}</button>
  </div>
</div>

{#if message}
  <p class="muted">{message}</p>
{/if}

{#if adding}
  <div class="card">
    <p class="muted">{t('Add a workspace')}</p>
    <div class="row">
      <button class="button" onclick={addNew}>{t('New workspace')}</button>
      <button class="button" onclick={() => fileInput?.click()}>{t('Import a .wsp file')}</button>
      <input bind:this={fileInput} type="file" accept=".wsp,.json,application/json" onchange={addFromFile} hidden />
    </div>
    <p class="muted" style="margin-top: 14px">{t('Templates')}</p>
    {#each templateWorkspaces() as template (template.name)}
      <div class="row" style="margin-top: 8px">
        <span class="emoji" style="background: {template.color}">{template.emoji}</span>
        <span class="grow">
          {template.displayName}
          <br /><span class="muted">{template.description}</span>
        </span>
        <button class="button plain" onclick={() => addTemplate(template)}>{t('Add')}</button>
      </div>
    {/each}
    <p class="muted" style="margin-top: 14px">{t('Examples')}</p>
    <p class="muted">{t('Each example is a short tutorial. Add one, open it, and read its Detailed tab.')}</p>
    {#each examples as example (example.name)}
      <div class="row" style="margin-top: 8px">
        <span class="emoji" style="background: {example.color}">{example.emoji}</span>
        <span class="grow">
          {example.displayName}
          <br /><span class="muted">{example.description}</span>
        </span>
        <button class="button plain" onclick={() => addTemplate(example)}>{t('Add')}</button>
      </div>
    {/each}
  </div>
{/if}

{#if appState.workspaces.length === 0}
  <div class="card">
    <p>{t('No workspaces yet. Add one above, or start from a template.')}</p>
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
          <span class="pill" class:on={isDaily(workspace)}>{isDaily(workspace) ? t('Daily') : t('Not scheduled')}</span>
          {#if workspace.note}
            <span class="pill on">{tf('Runs when {tracker} is logged', { tracker: workspace.note })}</span>
          {/if}
          <span class="muted">{t('Last run')}: {dayText(workspace.latestrun)}</span>
        </div>
        {#if pausedByNotes(workspace)}
          <div class="muted" style="margin-top: 6px">{t('Paused: it ran more than 5 times a minute from notes. It starts again shortly.')}</div>
        {/if}
      </div>
    </div>
    {#if healthOf(workspace, appState.scheduleDays[workspace.id], appState.lastTrigger[workspace.id])}
      {@const health = healthOf(workspace, appState.scheduleDays[workspace.id], appState.lastTrigger[workspace.id])}
      <div class="health" class:failed={health?.failed} style="margin-top: 8px">{health?.text}</div>
    {/if}
    <div class="row" style="margin-top: 10px; justify-content: flex-end">
      <button class="button plain" onclick={() => info(workspace)}>{t('Info')}</button>
      <button class="button plain" onclick={() => edit(workspace.id)}>{t('Edit')}</button>
      {#if healthOf(workspace, appState.scheduleDays[workspace.id], appState.lastTrigger[workspace.id])?.failed}
        <button class="button plain" onclick={() => showFailure(workspace.id)}>{t('Show')}</button>
      {/if}
      <button class="button plain" onclick={() => exportOne(workspace)}>{t('Export')}</button>
      <button class="button plain" onclick={() => duplicate(workspace)}>{t('Duplicate')}</button>
      <button class="button" onclick={() => run(workspace)}>{t('Run')}</button>
      <button class="button danger" onclick={() => remove(workspace)}>{t('Delete')}</button>
    </div>
  </div>
{/each}
