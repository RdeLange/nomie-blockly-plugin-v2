<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as Blockly from 'blockly';
  import { javascriptGenerator } from 'blockly/javascript';
  import { notebookTheme, notebookDarkTheme, GRID } from '../blockly/theme';
  import { registerRail } from '../blockly/rail';
  import { attachSearch } from '../blockly/search';
  import '../blockly/notebook.css';
  import { toolbox } from '../blockly/toolbox';
  import { loadWorkspace } from '../blockly/setup';
  import { appState } from './state.svelte';
  import { ui } from './ui.svelte';
  import { actionDeps, askConfirm, notify } from './dialogs';
  import { runNow, runRange } from './actions';
  import { checkWorkspace } from '../blockly/compile';
  import type { RunResult } from '../runtime/run';
  import type { Workspace } from '../domain/workspace';
  import { newWorkspaceFromBlocks } from './editing';

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
  // the details (name, emoji, colour) can be folded away, so the canvas has the whole screen
  let detailsOpen = $state(true);
  let showConsole = $state(false);
  let running = $state(false);
  let consoleText = $state('');
  let highlighted = $state<string | null>(null);
  let host: HTMLDivElement | undefined = $state();
  // the block search (the Search tile on the rail)
  let searching = $state(false);
  let searchQuery = $state('');
  let searchField: HTMLInputElement | undefined = $state();
  let showResults: (() => void) | undefined;
  const onSearch = () => showResults?.();
  // leaving the field (a click on the canvas, a block dragged out) closes the search, unless Search is chosen again
  const onSearchBlur = () =>
    setTimeout(() => {
      if (document.activeElement !== searchField && workspace?.getToolbox()?.getSelectedItem()?.getId() !== 'search') searching = false;
    }, 150);
  const onSearchKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      searching = false;
      workspace?.getToolbox()?.clearSelection();
      workspace?.getToolbox()?.getFlyout()?.hide();
    }
  };
  let workspace: Blockly.WorkspaceSvg | undefined;
  let restoreTrackers: (() => void) | undefined;
  const stop = { stopped: false };

  const scale = start?.workspacePosition?.scale ?? 0.8;

  onMount(() => {
    if (!host) return;
    registerRail();
    const dark = ui.theme === 'dark';
    const palette = toolbox();
    workspace = Blockly.inject(host, {
      toolbox: palette,
      theme: dark ? notebookDarkTheme : notebookTheme,
      renderer: 'thrasos',
      // Blockly's icons and sounds ship with the plugin, so they work without static.blockly.com
      media: './blockly-media/',
      trashcan: true,
      zoom: { controls: true, wheel: true, startScale: scale, maxScale: 1.5, minScale: 0.4, scaleSpeed: 1.02 },
      move: { scrollbars: true, drag: true, wheel: true },
      // lines, like the paper of a notebook
      grid: { spacing: 24, length: 24, colour: dark ? GRID.dark : GRID.light, snap: true },
    });
    showResults = attachSearch(workspace, palette as never, () => searchQuery);
    // The search field shows when the Search tile is chosen, and stays while someone types in it. Choosing another
    // category closes it. (The event names a category by its name; the id 'search' is on the selected item.)
    workspace.addChangeListener((event) => {
      if (event.type !== Blockly.Events.TOOLBOX_ITEM_SELECT) return;
      const selected = workspace?.getToolbox()?.getSelectedItem()?.getId();
      if (selected === 'search') {
        searching = true;
        queueMicrotask(() => searchField?.focus());
      } else if (selected) {
        searching = false;
      } else if (searching && document.activeElement === searchField) {
        // focus moved to the field, and Blockly closed the drawer: show the results again
        showResults?.();
      }
    });
    // the saved trackers stay in the dropdowns while the editor is open (see loadWorkspace)
    if (draft.xml) restoreTrackers = loadWorkspace(workspace, draft.xml);
    showProblems();
    workspace.addChangeListener((event) => {
      if (event.isUiEvent) return;
      draft.xml = Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(workspace!));
      draft.jscode = javascriptGenerator.workspaceToCode(workspace!);
      dirty = true;
      showProblems();
    });
  });

  // The pre-run check, shown on the blocks themselves: a warning icon with the message.
  const showProblems = () => {
    if (!workspace) return;
    const problems = checkWorkspace(workspace);
    for (const block of workspace.getAllBlocks(false)) {
      const text = problems.filter((p) => p.blockId === block.id).map((p) => p.message).join('\n');
      if (text) block.setWarningText(text);
      else if (block.hasIcon(Blockly.icons.IconType.WARNING)) block.setWarningText(null);
    }
  };

  // After a failed run, show the block it failed in
  const showFailedBlock = (result: RunResult) => {
    if (result.ok || !result.blockId || !workspace) return;
    const block = workspace.getBlockById(result.blockId);
    if (!block) return;
    block.select();
    workspace.centerOnBlock(block.id);
  };

  onDestroy(() => {
    restoreTrackers?.();
    workspace?.dispose();
  });

  const output = (text: string) => {
    consoleText = consoleText ? `${consoleText}\n${text}` : text;
  };

  const highlight = (blockId: string) => {
    highlighted = blockId;
    workspace?.highlightBlock(blockId);
  };

  // daily when the Scheduler block says Daily (read from the blocks, as the runs do)
  const scheduleNow = (): 'daily' | 'none' =>
    workspace?.getBlocksByType('s4eblocklyframe', false).some((b) => b.isEnabled() && b.getFieldValue('NAME') === 'daily') ? 'daily' : 'none';

  const save = async () => {
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
      schedule: scheduleNow(),
    } satisfies Partial<Workspace>);
    // a failed save says so (see nomie/plugin.ts) and leaves the changes marked as unsaved
    const saved = await actionDeps()?.save();
    if (saved !== false) dirty = false;
  };

  const back = async () => {
    if (dirty && !(await askConfirm('Leave without saving?', 'Your changes are not saved yet.'))) return;
    ui.view = 'list';
    ui.editingId = null;
  };

  // The workspace as it is in the editor now, saved or not: what Run and Run for yesterday run
  const draftWorkspace = (): Workspace => ({
    ...(start ?? newWorkspaceFromBlocks()),
    displayName: draft.displayName,
    name: draft.name,
    description: draft.description,
    emoji: draft.emoji,
    color: draft.color,
    workspaceBlocks: draft.xml,
    jscode: draft.jscode,
  });

  const run = async () => {
    const deps = actionDeps();
    if (!deps || running) return;
    showConsole = true;
    running = true;
    stop.stopped = false;
    consoleText = 'Running…';
    const result = await runNow(deps, draftWorkspace(), { output, highlight, stop });
    running = false;
    highlight('');
    highlighted = null;
    workspace?.highlightBlock(null);
    if (!result.ok && result.error !== 'stopped') output(`Stopped with an error: ${result.error}`);
    showFailedBlock(result);
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
    const result = await runRange(deps, draftWorkspace(), yesterday, yesterday, { output, highlight, stop });
    running = false;
    showFailedBlock(result);
    workspace?.highlightBlock(null);
  };

  const toggleDetails = () => {
    detailsOpen = !detailsOpen;
    // the canvas changed size, so Blockly has to measure it again
    queueMicrotask(() => workspace?.resize());
  };

  const stopRun = () => {
    stop.stopped = true;
  };
</script>

<div class="header">
  <button class="button plain" onclick={back}>Back</button>
  <h1 class="title" style="font-size: 22px">{draft.displayName || 'Workspace'}</h1>
  <div class="row">
    <button class="button" onclick={run} disabled={running}>Run</button>
    <button class="button" onclick={runForDays} disabled={running}>Run for yesterday</button>
    <button class="button plain" onclick={stopRun} disabled={!running}>Stop</button>
    <button class="button plain" onclick={() => (showConsole = !showConsole)}>
      {showConsole ? 'Hide console' : 'Console'}
    </button>
    <button class="button" onclick={save} disabled={!dirty}>Save</button>
  </div>
</div>

<button class="button plain" style="padding: 4px 0; margin-bottom: 4px" onclick={toggleDetails} aria-expanded={detailsOpen}>
  {detailsOpen ? '▾ Hide details' : '▸ Show details'}
</button>

{#if detailsOpen}
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

{/if}

<div class="blockly-frame" style="height: {detailsOpen ? '60vh' : '80vh'}">
  <div bind:this={host} class="blockly-host nomie-blockly"></div>
  {#if searching}
    <label class="block-search">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></svg>
      <input bind:this={searchField} bind:value={searchQuery} oninput={onSearch} onblur={onSearchBlur} onkeydown={onSearchKey} placeholder="Search all blocks" aria-label="Search all blocks" />
    </label>
  {/if}
</div>

{#if showConsole}
  <div class="console" style="margin-top: 12px">{consoleText || 'No output yet.'}</div>
{/if}
