<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as Blockly from 'blockly';
  import { javascriptGenerator } from 'blockly/javascript';
  import darkTheme from '@blockly/theme-dark';
  import { toolbox } from '../blockly/toolbox';
    import { appState } from './state.svelte';
  import { ui } from './ui.svelte';
  import { actionDeps, askConfirm, notify } from './dialogs';
  import { runNow, runRange } from './actions';
  import type { Workspace } from '../domain/workspace';

  let { id }: { id: string } = $props();

  const COLOURS = ['#E3F2FD', '#FDF0A4', '#C47ADA', '#EC9740', '#5E7ABC', '#34C759', '#FF3B30'];

  const start = appState.workspaces.find((w) => w.id === id);
  let draft = $state({
    displayName: start?.displayName ?? '',
    name: start?.name ?? '',
    description: start?.description ?? '',
    emoji: start?.emoji ?? '🧱',
    color: start?.color ?? COLOURS[0],
    xml: start?.workspaceBlocks ?? '',
    jscode: start?.jscode ?? '',
  });
  let dirty = $state(false);
  let showConsole = $state(false);
  let running = $state(false);
  let consoleText = $state('');
  let highlighted = $state<string | null>(null);
  let host: HTMLDivElement | undefined = $state();
  let workspace: Blockly.WorkspaceSvg | undefined;
  const stop = { stopped: false };

  const scale = start?.workspacePosition?.scale ?? 0.8;

  onMount(() => {
    if (!host) return;
    workspace = Blockly.inject(host, {
      toolbox: toolbox(),
      theme: ui.theme === 'dark' ? darkTheme : undefined,
      trashcan: true,
      zoom: { controls: true, wheel: true, startScale: scale, maxScale: 1.5, minScale: 0.4, scaleSpeed: 1.02 },
      move: { scrollbars: true, drag: true, wheel: true },
      grid: { spacing: 20, length: 3, colour: '#ccc', snap: true },
    });
    if (draft.xml) Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(draft.xml), workspace);
    workspace.addChangeListener((event) => {
      if (event.isUiEvent) return;
      draft.xml = Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(workspace!));
      draft.jscode = javascriptGenerator.workspaceToCode(workspace!);
      dirty = true;
    });
  });

  onDestroy(() => workspace?.dispose());

  const output = (text: string) => {
    consoleText = consoleText ? `${consoleText}\n${text}` : text;
  };

  const highlight = (blockId: string) => {
    highlighted = blockId;
    workspace?.highlightBlock(blockId);
  };

  const save = () => {
    const target = appState.workspaces.find((w) => w.id === id);
    if (!target) return;
    const scaleNow = workspace?.getScale() ?? scale;
    Object.assign(target, {
      displayName: draft.displayName || 'Workspace',
      name: draft.name,
      description: draft.description,
      emoji: draft.emoji || '🧱',
      color: draft.color,
      workspaceBlocks: draft.xml,
      jscode: draft.jscode,
      workspacePosition: { scrollX: 0, scrollY: 0, scale: scaleNow },
      schedule: draft.jscode.includes('var schedule = "daily"') ? 'daily' : 'none',
    } satisfies Partial<Workspace>);
    actionDeps()?.save();
    dirty = false;
  };

  const back = async () => {
    if (dirty && !(await askConfirm('Leave without saving?', 'Your changes are not saved yet.'))) return;
    ui.view = 'list';
    ui.editingId = null;
  };

  const run = async () => {
    const deps = actionDeps();
    if (!deps || running) return;
    showConsole = true;
    running = true;
    stop.stopped = false;
    consoleText = 'Running…';
    const result = await runNow(deps, { ...draft } as Workspace, { output, highlight, stop });
    running = false;
    highlight('');
    highlighted = null;
    workspace?.highlightBlock(null);
    if (!result.ok && result.error !== 'stopped') output(`Stopped with an error: ${result.error}`);
  };

  // A run over a range of days, for a daily workspace: the days the schedule would have run
  const runForDays = async () => {
    const deps = actionDeps();
    if (!deps || running) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    showConsole = true;
    running = true;
    stop.stopped = false;
    consoleText = 'Running for yesterday…';
    await runRange(deps, { ...draft } as Workspace, yesterday, yesterday, { output, highlight, stop });
    running = false;
    workspace?.highlightBlock(null);
  };

  const stopRun = () => {
    stop.stopped = true;
  };
</script>

<div class="header">
  <button class="button plain" onclick={back}>Back</button>
  <h1 class="title" style="font-size: 22px">{draft.displayName || 'Workspace'}</h1>
  <button class="button" onclick={save} disabled={!dirty}>Save</button>
</div>

<div class="card">
  <div class="row">
    <span class="emoji" style="background: {draft.color}">{draft.emoji}</span>
    <input class="input grow" placeholder="Name" bind:value={draft.displayName} oninput={() => (dirty = true)} />
  </div>
  <div class="row" style="margin-top: 10px">
    <input class="input" style="width: 70px" placeholder="🧱" bind:value={draft.emoji} oninput={() => (dirty = true)} />
    <input class="input grow" placeholder="Description" bind:value={draft.description} oninput={() => (dirty = true)} />
  </div>
  <p class="muted" style="margin: 10px 0 6px">Note trigger: a note with "Run Blockly Workspace: {draft.name || 'name'}" runs this workspace.</p>
  <input class="input" placeholder="Name used in notes" bind:value={draft.name} oninput={() => (dirty = true)} />
  <div class="swatches" style="margin-top: 10px">
    {#each COLOURS as colour}
      <button
        class="swatch"
        class:selected={draft.color === colour}
        style="background: {colour}"
        aria-label="Colour {colour}"
        onclick={() => { draft.color = colour; dirty = true; }}
      ></button>
    {/each}
  </div>
</div>

<div class="row" style="margin-bottom: 12px">
  <button class="button" onclick={run} disabled={running}>Run</button>
  <button class="button" onclick={runForDays} disabled={running}>Run for yesterday</button>
  <button class="button plain" onclick={stopRun} disabled={!running}>Stop</button>
  <button class="button plain grow" style="text-align: right" onclick={() => (showConsole = !showConsole)}>
    {showConsole ? 'Hide console' : 'Show console'}
  </button>
</div>

<div bind:this={host} class="blockly-host"></div>

{#if showConsole}
  <div class="console" style="margin-top: 12px">{consoleText || 'No output yet.'}</div>
{/if}
