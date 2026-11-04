<script lang="ts">
  import { i18n, t, tf } from './i18n.svelte';
  import { appState } from './state.svelte';
  import { ui } from './ui.svelte';
  import { actionDeps, askConfirm, notify } from './dialogs';
  import { runNow } from './actions';
  import { newWorkspaceFromBlocks, addWorkspaces, importSummary } from './editing';
  import {
    copyOfWorkspace,
    EXAMPLE_LEVEL_ORDER,
    exampleLevelOf,
    exampleWorkspaces,
    parseWorkspaceFile,
    templateWorkspaces,
    workspaceToFile,
    type ExampleLevel,
    type Workspace,
  } from '../domain/workspace';
  import { healthOf } from './health';
  import { downloadText } from './download';

  const PAUSE_MS = 60_000;
  // a workspace paused for note runs says so for a minute
  const pausedByNotes = (w: Workspace) => {
    const at = appState.notePauses[w.id];
    return at !== undefined && Date.now() - at < PAUSE_MS;
  };

  // the example library, in the language of the Nomie user (see domain/example-library.ts)
  const examples = $derived(exampleWorkspaces(i18n.lang));
  const levelName = (level: ExampleLevel) =>
    ({ easy: t('Easy'), moderate: t('Moderate'), complex: t('Complex'), expert: t('Expert') })[level];
  const levelHint = (level: ExampleLevel) =>
    ({
      easy: t('One block at a time, to see what each block does.'),
      moderate: t('Loops, conditions, lists and memory between runs.'),
      complex: t('Functions, objects and errors, put together.'),
      expert: t('Small programs of several parts. Read them, change them, and build on them.'),
    })[level];

  // the list has two tabs: the workspaces you have, and the examples. Without workspaces, the examples come first.
  let tab = $state<'workspaces' | 'examples' | 'templates'>(appState.workspaces.length === 0 ? 'examples' : 'workspaces');
  // the starting points: each one is added as a workspace of its own
  const templates = templateWorkspaces();
  let fileInput: HTMLInputElement | undefined = $state();
  // what just happened, at the top of the list. It stays for a while, or until it is closed.
  let notice = $state<{ id: number; text: string; action?: { label: string; run: () => void } } | undefined>();
  // the workspace that was just added: its card is highlighted for a moment
  let freshId = $state('');

  const say = (text: string, action?: { label: string; run: () => void }) => {
    const id = Date.now();
    notice = { id, text, action };
    setTimeout(() => {
      if (notice?.id === id) notice = undefined;
    }, 8000);
  };

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
      say(workspaces.length === 1 ? t('Added 1 workspace.') : tf('Added {count} workspaces.', { count: String(workspaces.length) }));
    } catch (error) {
      say(tf('This file could not be read: {error}', { error: (error as Error).message }));
    }
  };

  // a workspace's file: that one workspace, with no remembered values, no secrets and no earlier version
  const exportOne = (workspace: Workspace) =>
    downloadText(`blockly-${workspace.displayName}.wsp`, workspaceToFile([workspace]));

  const duplicate = async (workspace: Workspace) => {
    const [added] = await addWorkspaces([copyOfWorkspace(workspace)]);
    freshId = added.id;
    say(tf('Copied as "{name}".', { name: added.displayName }));
  };

  // a failed card opens the Run tab of its workspace, where the error is
  const showFailure = (id: string) => {
    ui.startTab = 'run';
    edit(id);
  };

  const addTemplate = async (template: Workspace) => {
    const [added] = await addWorkspaces([template]);
    freshId = added.id;
    say(tf('Added "{name}".', { name: template.displayName }), { label: t('Open'), run: () => edit(added.id) });
  };

  // an example is added once. Its card then says so, and opens the workspace it made.
  const addedWorkspace = (name: string) => appState.workspaces.find((w) => w.name === name);

  const addExample = async (example: Workspace) => {
    const [added] = await addWorkspaces([example]);
    freshId = added.id;
    say(tf('Added "{name}". Open it to read its tutorial.', { name: added.displayName }), {
      label: t('Open'),
      run: () => edit(added.id),
    });
  };

  const addNew = async () => {
    // the workspace is added with a new id, and the editor opens that one
    const [added] = await addWorkspaces([newWorkspaceFromBlocks()]);
    edit(added.id);
  };
</script>

<div class="header">
  <h1 class="title">Blockly</h1>
  <div class="row">
    <button class="button plain" onclick={() => (ui.view = 'settings')}>{t('Settings')}</button>
    {#if !ui.phone}
      <button class="button plain" onclick={() => (ui.view = 'info')}>{t('About')}</button>
    {/if}
  </div>
</div>

{#if !ui.phone}
<div class="segments" role="tablist">
  <button role="tab" aria-selected={tab === 'workspaces'} class:on={tab === 'workspaces'} onclick={() => (tab = 'workspaces')}>
    {t('Workspaces')}<span>{appState.workspaces.length}</span>
  </button>
  <button role="tab" aria-selected={tab === 'examples'} class:on={tab === 'examples'} onclick={() => (tab = 'examples')}>
    {t('Examples')}<span>{examples.length}</span>
  </button>
  <button role="tab" aria-selected={tab === 'templates'} class:on={tab === 'templates'} onclick={() => (tab = 'templates')}>
    {t('Templates')}<span>{templates.length}</span>
  </button>
</div>
{/if}

{#if notice}
  <div class="notice" role="status">
    <span class="grow">{notice.text}</span>
    {#if notice.action}
      <button class="button" onclick={() => { notice?.action?.run(); notice = undefined; }}>{notice.action.label}</button>
    {/if}
    <button class="button plain" onclick={() => (notice = undefined)} aria-label={t('Close')}>✕</button>
  </div>
{/if}

{#if tab === 'examples' && !ui.phone}
  <p class="muted lead">{t('Each example is a short tutorial. Add one, open it, and read its Detailed tab.')}</p>
  <p class="muted lead">{t('Start with the first level and work down: each level builds on the one before.')}</p>
  {#each EXAMPLE_LEVEL_ORDER as level, i (level)}
    <section class="level level-{level}">
      <h2 class="level-head">
        <span class="level-num">{i + 1}</span>
        {levelName(level)}
        <span class="muted">{levelHint(level)}</span>
      </h2>
      {#each examples.filter((example) => exampleLevelOf(example.name) === level) as example (example.name)}
        {@const added = addedWorkspace(example.name)}
        <div class="example level-{level}" class:added={Boolean(added)}>
          <span class="emoji" style="background: {example.color}">{example.emoji}</span>
          <div class="grow">
            <strong>{example.displayName}</strong>
            <div class="muted">{example.description}</div>
          </div>
          {#if added}
            <span class="tick">✓ {t('Added')}</span>
            <button class="button" onclick={() => edit(added.id)}>{t('Open')}</button>
          {:else}
            <button class="button" onclick={() => addExample(example)}>{t('Add')}</button>
          {/if}
        </div>
      {/each}
    </section>
  {/each}
{:else if tab === 'templates' && !ui.phone}
  <p class="muted lead">{t('Templates are starting points. Add one, then change it to fit your needs.')}</p>
  <div class="card">
    {#each templates as template (template.name)}
      <div class="row" style="margin-top: 8px">
        <span class="emoji" style="background: {template.color}">{template.emoji}</span>
        <span class="grow">
          {template.displayName}
          <br /><span class="muted">{template.description}</span>
        </span>
        <button class="button plain" onclick={() => addTemplate(template)}>{t('Add')}</button>
      </div>
    {/each}
  </div>
{:else}
  {#if !ui.phone}
    <div class="row actions">
      <button class="button" onclick={addNew}>{t('New workspace')}</button>
      <button class="button" onclick={() => fileInput?.click()}>{t('Import a .wsp file')}</button>
      <input bind:this={fileInput} type="file" accept=".wsp,.json,application/json" onchange={addFromFile} hidden />
    </div>
  {/if}
  {#if appState.workspaces.length === 0}
    <div class="card start">
      {#if ui.phone}
        <p>{t('No workspaces yet. Add them on a larger screen.')}</p>
      {:else}
        <p>{t('No workspaces yet. Add one with New workspace, or start from a template or an example.')}</p>
        <button class="button" onclick={() => (tab = 'examples')}>{t('Start with an example')}</button>
      {/if}
    </div>
  {/if}

  {#each appState.workspaces as workspace (workspace.id)}
    <div class="card" class:fresh={workspace.id === freshId}>
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
        {#if !ui.phone}
          <button class="button plain" onclick={() => info(workspace)}>{t('Info')}</button>
          <button class="button plain" onclick={() => edit(workspace.id)}>{t('Edit')}</button>
          {#if healthOf(workspace, appState.scheduleDays[workspace.id], appState.lastTrigger[workspace.id])?.failed}
            <button class="button plain" onclick={() => showFailure(workspace.id)}>{t('Show')}</button>
          {/if}
          <button class="button plain" onclick={() => exportOne(workspace)}>{t('Export')}</button>
          <button class="button plain" onclick={() => duplicate(workspace)}>{t('Duplicate')}</button>
        {/if}
        <button class="button" onclick={() => run(workspace)}>{t('Run')}</button>
        {#if !ui.phone}
          <button class="button danger" onclick={() => remove(workspace)}>{t('Delete')}</button>
        {/if}
      </div>
    </div>
  {/each}
{/if}

<style>
  /* the two tabs of the list: a segmented control, so the examples are one tap away */
  .segments {
    display: flex;
    gap: 4px;
    padding: 4px;
    margin: 4px 0 14px;
    background: var(--ios-separator);
    border-radius: 12px;
  }
  .segments button {
    flex: 1;
    appearance: none;
    border: 0;
    border-radius: 9px;
    padding: 9px 10px;
    background: transparent;
    color: var(--ios-label2);
    font: 600 15px var(--nb-font);
    cursor: pointer;
  }
  .segments button span {
    margin-left: 6px;
    font-weight: 500;
    opacity: 0.7;
  }
  .segments button.on {
    background: var(--ios-card);
    color: var(--ios-label);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  }

  .lead {
    margin: 0 0 10px;
  }

  .actions {
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  /* the four levels, each with its colour: a learning curve from easy to expert */
  .level {
    margin: 20px 0 6px;
  }
  .level-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px 10px;
    margin: 0 0 8px;
    font-size: 17px;
    font-weight: 700;
  }
  .level-head .muted {
    flex-basis: 100%;
    margin-left: 36px;
    font-size: 13px;
    font-weight: 400;
  }
  .level-num {
    display: inline-flex;
    width: 26px;
    height: 26px;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--level-colour);
    color: #fff;
    font-size: 13px;
  }
  .level-easy {
    --level-colour: #34c759;
  }
  .level-moderate {
    --level-colour: #0a84ff;
  }
  .level-complex {
    --level-colour: #ff9500;
  }
  .level-expert {
    --level-colour: #af52de;
  }

  /* an example: a card with its level's colour on the left, so the four levels stand out */
  .example {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
    padding: 12px 14px;
    background: var(--ios-card);
    border: 1px solid var(--nb-line);
    border-left: 4px solid var(--level-colour);
    border-radius: var(--radius);
  }
  .example.added {
    background: #f1faf4;
  }
  .tick {
    white-space: nowrap;
    color: #1f8f3d;
    font-size: 13px;
    font-weight: 600;
  }

  /* what just happened: a notice with its action, at the top of the list */
  .notice {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
    padding: 10px 12px;
    background: #e8f7ee;
    border: 1px solid #9ad8b0;
    border-radius: 12px;
    color: #14532d;
    font-weight: 500;
  }

  /* the workspace just added or copied glows for a moment */
  .card.fresh {
    animation: glow 2.4s ease-out;
  }
  @keyframes glow {
    0% {
      box-shadow: 0 0 0 4px rgba(52, 199, 89, 0.55);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(52, 199, 89, 0);
    }
  }

  .start {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    justify-content: space-between;
  }
  .start p {
    margin: 0;
  }
</style>
