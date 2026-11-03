<script lang="ts">
  import { t } from './i18n.svelte';
  // The editor (mockup D1 with the right panel in tabs, as D4). Desktop: a toolbar, the rail and canvas, and a panel
  // on the right with Details, Run and Console. Phone (under 900 px): the run buttons float at the bottom of the
  // canvas (mockup 1), and the panel opens as a sheet over the canvas.
  import { onMount, onDestroy } from 'svelte';
  import * as Blockly from 'blockly';
  import { javascriptGenerator } from 'blockly/javascript';
  import { notebookTheme, notebookDarkTheme, GRID } from '../blockly/theme';
  import { registerRail } from '../blockly/rail';
  import { attachSearch } from '../blockly/search';
  import '../blockly/notebook.css';
  import './editor.css';
  import { toolbox } from '../blockly/toolbox';
  import { loadWorkspace, setupBlockly } from '../blockly/setup';
  import { applyBlocklyLanguage } from '../blockly/messages';
  import { i18n } from './i18n.svelte';
  import { trackerOptionsNow } from './trackers.svelte';
  import { applyCompiled, refreshCompiled } from './compiler';
  import { restoredWorkspace, savedWithBlocks, workspaceToFile } from '../domain/workspace';
  import { downloadText } from './download';
  // the blocks and their generator are registered when the editor opens (the plugin's start does not load them)
  applyBlocklyLanguage(i18n.lang);
  setupBlockly(trackerOptionsNow);
  import { appState } from './state.svelte';
  import { ui } from './ui.svelte';
  import { actionDeps, askConfirm } from './dialogs';
  import { runDays, runNow, tryWithNote } from './actions';
  import { localDayKey } from '../runtime/dates';
  import { scheduleWindow, type DayOutcome } from '../runtime/scheduler';
  import { checkWorkspace, type Problem, workspaceInfo } from '../blockly/compile';
  import type { RunResult } from '../runtime/run';
  import type { Workspace } from '../domain/workspace';
  import { newWorkspaceFromBlocks } from './editing';
  import Icon from './Icon.svelte';

  let { id }: { id: string } = $props();

  const COLOURS = ['#E3F2FD', '#FDF0A4', '#C47ADA', '#EC9740', '#5E7ABC', '#34C759', '#FF3B30'];
  const WIDE = '(min-width: 900px)';

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
  let running = $state(false);
  // a test run writes no notes. A workspace from a backup starts in test mode until its first real run.
  let testRun = $state(Boolean(start?.untested));
  let consoleText = $state('');
  // while a run goes on: the day (for a run over days) and the steps so far, shown on the canvas
  let progress = $state({ day: '', index: 0, total: 0, steps: 0 });
  // the days of the last "Run for days" in this editor; before one, the days of the last scheduled run
  let ranDays = $state<DayOutcome[] | null>(null);
  const yesterdayKey = () => {
    const day = new Date();
    day.setDate(day.getDate() - 1);
    return localDayKey(day);
  };
  let daysFrom = $state(yesterdayKey());
  let daysTo = $state(yesterdayKey());

  // layout: wide (desktop) or not (phone); the panel and its tab
  let wide = $state(typeof window !== 'undefined' && window.matchMedia(WIDE).matches);
  let panelOpen = $state(typeof window !== 'undefined' && window.matchMedia(WIDE).matches);
  let tab = $state<'details' | 'run' | 'console'>(ui.startTab ?? 'details');
  ui.startTab = undefined;
  let detailsPanel: HTMLElement | undefined = $state();

  // what the blocks say, kept up to date as they change
  let problems = $state<Array<Problem & { label: string }>>([]);
  let daily = $state(start?.schedule === 'daily');
  // the tracker of the When-note block, when the workspace runs on notes
  let noteTracker = $state<string | undefined>(undefined);
  // the note typed in Try with a note
  let tryText = $state('');
  let reads = $state<string[]>([]);
  let writes = $state<string[]>([]);

  let frame: HTMLDivElement | undefined = $state();
  let host: HTMLDivElement | undefined = $state();
  let workspace: Blockly.WorkspaceSvg | undefined;
  let resizeObserver: ResizeObserver | undefined;
  const stop = { stopped: false };
  const scale = start?.workspacePosition?.scale ?? 0.8;

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

  onMount(() => {
    if (!host || !frame) return;
    const media = window.matchMedia(WIDE);
    const onMedia = () => {
      wide = media.matches;
      // on a phone the panel is a sheet that starts closed
      if (!wide) panelOpen = false;
    };
    media.addEventListener('change', onMedia);

    registerRail();
  // the Blockly canvas follows the theme of the app, also when it changes while the editor is open
  $effect(() => {
    const dark = ui.theme === 'dark';
    workspace?.setTheme(dark ? notebookDarkTheme : notebookTheme);
  });
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
    // the saved trackers stay in this workspace's dropdowns (see readBlocksInto)
    if (draft.xml) loadWorkspace(workspace, draft.xml);
    readBlocks();
    // a little room between the program and the edge of the canvas
    workspace.scroll(workspace.scrollX + 32, workspace.scrollY + 24);
    // Loading the blocks fires change events too, a moment later, ending with "finished loading"; those are not
    // edits. (The old editor counted them, so a workspace looked unsaved as soon as it opened.) An empty workspace
    // sends no such event, hence the timer.
    let loaded = !draft.xml;
    setTimeout(() => (loaded = true), 500);
    workspace.addChangeListener((event) => {
      if (event.type === Blockly.Events.FINISHED_LOADING) {
        loaded = true;
        return;
      }
      if (event.isUiEvent || !loaded) return;
      dirty = true;
      syncSoon();
    });
    // Blockly draws into a fixed size: measure again whenever the canvas changes size (panel, window, phone turned)
    resizeObserver = new ResizeObserver(() => workspace && Blockly.svgResize(workspace));
    resizeObserver.observe(frame);
    return () => media.removeEventListener('change', onMedia);
  });

  onDestroy(() => {
    if (syncTimer) clearTimeout(syncTimer);
    if (highlightFrame) cancelAnimationFrame(highlightFrame);
    resizeObserver?.disconnect();
    workspace?.dispose();
  });

  // After an edit, the blocks are written to the draft (XML and code) and checked again. That is the costly part, so
  // it waits until the edits pause for 300 ms (a drag fires many events); Save and Run do it straight away.
  let syncTimer: ReturnType<typeof setTimeout> | undefined;
  const sync = () => {
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = undefined;
    if (!workspace) return;
    draft.xml = Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(workspace));
    draft.jscode = javascriptGenerator.workspaceToCode(workspace);
    readBlocks();
  };
  const syncSoon = () => {
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(sync, 300);
  };
  const flush = () => {
    if (syncTimer) sync();
  };

  // The pre-run check, on the blocks (a warning icon) and in the Run tab; the schedule and the trackers, for Details.
  const readBlocks = () => {
    if (!workspace) return;
    const found = checkWorkspace(workspace, Object.keys(appState.secrets));
    for (const block of workspace.getAllBlocks(false)) {
      const text = found.filter((p) => p.blockId === block.id).map((p) => p.message).join('\n');
      if (text) block.setWarningText(text);
      else if (block.hasIcon(Blockly.icons.IconType.WARNING)) block.setWarningText(null);
    }
    problems = found.map((p) => ({ ...p, label: p.blockId ? (workspace!.getBlockById(p.blockId)?.toString(40) ?? '') : '' }));
    daily = workspace.getBlocksByType('s4eblocklyframe', false).some((b) => b.isEnabled() && b.getFieldValue('NAME') === 'daily');
    noteTracker = workspaceInfo(draft.xml).note;
    const tracker = (block: Blockly.Block, input: string) => block.getInputTargetBlock(input)?.getFieldValue('Trackers');
    const unique = (list: Array<string | undefined>) => [...new Set(list.filter((t): t is string => Boolean(t) && t !== '#none'))];
    writes = unique(workspace.getBlocksByType('s4e_logvalue', false).map((b) => tracker(b, 'Tracker')));
    reads = unique([
      ...workspace.getBlocksByType('s4e_dayvalue', false).map((b) => tracker(b, 'Tracker')),
      ...workspace.getBlocksByType('s4e_periodvalue', false).map((b) => tracker(b, 'Trackable')),
    ]);
  };

  const selectBlock = (blockId?: string) => {
    if (!blockId || !workspace) return;
    const block = workspace.getBlockById(blockId);
    if (!block) return;
    block.select();
    workspace.centerOnBlock(block.id);
    if (!wide) panelOpen = false;
  };

  // After a failed run, show the block it failed in
  const showFailedBlock = (result: RunResult) => {
    if (!result.ok && result.blockId) selectBlock(result.blockId);
  };

  const output = (text: string) => {
    consoleText = consoleText ? `${consoleText}\n${text}` : text;
  };

  // A run highlights every block it runs, thousands of times a second in a loop; the screen shows the latest one,
  // once per frame.
  let pendingHighlight: string | null = null;
  let highlightFrame = 0;
  const highlight = (blockId: string) => {
    pendingHighlight = blockId || null;
    if (highlightFrame) return;
    highlightFrame = requestAnimationFrame(() => {
      highlightFrame = 0;
      workspace?.highlightBlock(pendingHighlight);
    });
  };
  const clearHighlight = () => {
    if (highlightFrame) cancelAnimationFrame(highlightFrame);
    highlightFrame = 0;
    workspace?.highlightBlock(null);
  };

  const save = async () => {
    flush();
    const target = appState.workspaces.find((w) => w.id === id);
    if (!target) return;
    const scaleNow = workspace?.getScale() ?? scale;
    // changed blocks keep the blocks they replace as the previous version (phase 17)
    const versioned = savedWithBlocks(target, draft.xml, new Date().toISOString());
    Object.assign(target, {
      displayName: draft.displayName || 'Workspace',
      name: draft.name,
      description: draft.description,
      emoji: draft.emoji || '🧱',
      color: draft.color,
      workspaceBlocks: versioned.workspaceBlocks,
      workspacePosition: { scrollX: 0, scrollY: 0, scale: scaleNow },
    } satisfies Partial<Workspace>);
    if (versioned !== target) {
      target.savedAt = versioned.savedAt;
      target.previous = versioned.previous;
    }
    // the code of the saved blocks is made now, with the schedule and the note (the editor has Blockly loaded)
    applyCompiled(target, await refreshCompiled({ ...target }));
    // a failed save says so (see nomie/plugin.ts) and leaves the changes marked as unsaved
    const saved = await actionDeps()?.save();
    if (saved !== false) dirty = false;
  };

  // The version before the last save. Restoring it puts its blocks in the editor, unsaved, until the next save.
  const previousVersion = $derived(appState.workspaces.find((w) => w.id === id)?.previous);
  const previousWhen = $derived(
    previousVersion?.savedAt
      ? new Date(previousVersion.savedAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      : ''
  );
  const restorePrevious = () => {
    const target = appState.workspaces.find((w) => w.id === id);
    if (!target?.previous || !workspace) return;
    const restored = restoredWorkspace(target);
    // loading adds blocks, so the editor is emptied first: the restored version replaces the current blocks
    workspace.clear();
    loadWorkspace(workspace, restored.workspaceBlocks);
    sync();
    dirty = true;
  };

  // this workspace as a file: no remembered values, no secrets, and no earlier version
  const exportThis = () => {
    const target = appState.workspaces.find((w) => w.id === id);
    if (target) downloadText(`blockly-${target.displayName}.wsp`, workspaceToFile([target]));
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

  // the values this workspace remembers between runs (Details lists them)
  const remembered = $derived(Object.entries(appState.memory[id] ?? {}));
  const forgetAll = async () => {
    if (!(await askConfirm('Forget all?', 'The values this workspace remembers are deleted. Its next run starts from nothing.'))) return;
    delete appState.memory[id];
    void actionDeps()?.save();
  };

  // A run shows the Console tab, unless someone is typing in Details
  const showConsole = () => {
    if (detailsPanel?.contains(document.activeElement)) return;
    tab = 'console';
    if (wide) panelOpen = true;
  };

  type Deps = NonNullable<ReturnType<typeof actionDeps>>;
  const onProgress = (steps: number) => (progress.steps = steps);

  const startRun = async (label: string, go: (deps: Deps) => Promise<RunResult>) => {
    const deps = actionDeps();
    if (!deps || running) return;
    flush();
    showConsole();
    running = true;
    stop.stopped = false;
    progress = { day: '', index: 0, total: 0, steps: 0 };
    consoleText = label;
    const result = await go(deps);
    running = false;
    clearHighlight();
    if (!result.ok && result.error !== 'stopped') output(`Stopped with an error: ${result.error}`);
    showFailedBlock(result);
  };

  // the first real run of a workspace from a backup ends its test mode
  const markTried = () => {
    const target = appState.workspaces.find((w) => w.id === id);
    if (!target?.untested) return;
    delete target.untested;
    void actionDeps()?.save();
  };

  const run = () =>
    startRun(testRun ? 'Test run…' : 'Running…', (deps) => {
      if (!testRun) markTried();
      return runNow(deps, draftWorkspace(), { output, highlight, stop, onProgress, test: testRun });
    });

  // A run over days, as the schedule would run them, one day at a time; its days show in the Run tab
  const runOverDays = (from: string, to: string, label: string) =>
    startRun(testRun ? `Test run, ${label.toLowerCase()}` : label, async (deps) => {
      if (!testRun) markTried();
      const days = await runDays(deps, draftWorkspace(), from, to, {
        output,
        highlight,
        stop,
        onProgress,
        test: testRun,
        onDay: (day, index, total) => (progress = { day, index, total, steps: 0 }),
      });
      ranDays = days;
      const failed = days.find((d) => !d.result.ok);
      return failed ? failed.result : { ok: true, steps: 0 };
    });

  // Try with a note: the typed note runs the workspace as if it was saved today, in test mode
  const tryNote = () =>
    startRun(`Trying with ${tryText}…`, (deps) => tryWithNote(deps, draftWorkspace(), tryText, { output, highlight, stop, onProgress }));

  const runForYesterday = () => runOverDays(yesterdayKey(), yesterdayKey(), 'Running for yesterday…');
  const runTheseDays = () => runOverDays(daysFrom, daysTo, `Running ${daysFrom} to ${daysTo}…`);

  // a day of a run, opened in the Console tab
  const showDay = (day: { day: string; output: string[]; error?: string }) => {
    consoleText = [`— ${day.day} —`, ...day.output, ...(day.error ? [`Error: ${day.error}`] : [])].join('\n');
    tab = 'console';
  };

  const stopRun = () => {
    stop.stopped = true;
  };

  const openPanel = (which: 'details' | 'run' | 'console') => {
    if (panelOpen && tab === which && !wide) {
      panelOpen = false;
      return;
    }
    tab = which;
    panelOpen = true;
  };

  const lastRun = $derived(start?.latestrun ? new Date(start.latestrun).toLocaleDateString() : 'never');
  const status = $derived(
    [daily ? 'Runs daily' : 'Not scheduled', `last run ${lastRun}`, running ? 'running…' : dirty ? 'unsaved changes' : 'saved'].join(' · ')
  );
  const errorCount = $derived(problems.filter((p) => p.level === 'error').length);
  // the days the Run tab lists: this editor's last run over days, or else the last scheduled run
  const dayRows = $derived(
    ranDays
      ? ranDays.map((d) => ({ day: d.day, ok: d.result.ok, error: d.result.ok ? undefined : d.result.error, output: d.output }))
      : (appState.scheduleDays[id] ?? [])
  );
  const nextWindow = $derived(daily ? scheduleWindow(appState.workspaces.find((w) => w.id === id)?.latestrun, new Date()) : undefined);
  const dayStatus = (row: { ok: boolean; error?: string }) => (row.ok ? 'ok' : row.error === 'stopped' ? 'stopped' : 'failed');
  const TABS = [
    ['details', 'Details'],
    ['run', 'Run'],
    ['console', 'Console'],
  ] as const;
</script>

<div class="editor" class:wide>
  <header class="ed-toolbar">
    <button class="nb-icon" onclick={back} aria-label="Back to workspaces"><Icon name="back" size={20} /></button>
    <div class="ed-title">
      <h1>{draft.displayName || 'Workspace'}</h1>
      <span class="ed-status">{status}</span>
    </div>
    {#if wide}
      <label class="ed-switch" title="A test run writes no notes">
        <input type="checkbox" role="switch" bind:checked={testRun} disabled={running} />
        {t('Test run')}
      </label>
      <button class="nb-btn primary" onclick={run} disabled={running}><Icon name="play" size={16} />{t('Run')}</button>
      <button class="nb-btn" onclick={runForYesterday} disabled={running}><Icon name="calendar" size={16} />{t('Run for yesterday')}</button>
      <button class="nb-btn" onclick={stopRun} disabled={!running}><Icon name="stop" size={16} />{t('Stop')}</button>
      <span class="ed-sep" aria-hidden="true"></span>
    {/if}
    <button class="nb-btn primary" onclick={save} disabled={!dirty}><Icon name="save" size={16} />{t('Save')}</button>
    <button class="nb-icon" class:on={panelOpen} onclick={() => (wide ? (panelOpen = !panelOpen) : openPanel('details'))} aria-label={panelOpen ? 'Hide the panel' : 'Show details'} aria-pressed={panelOpen}>
      <Icon name="panel" size={20} />
    </button>
  </header>

  <div class="ed-body">
    <div class="blockly-frame" bind:this={frame}>
      <div bind:this={host} class="blockly-host nomie-blockly"></div>
      {#if searching}
        <label class="block-search">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></svg>
          <input bind:this={searchField} bind:value={searchQuery} oninput={onSearch} onblur={onSearchBlur} onkeydown={onSearchKey} placeholder="Search all blocks" aria-label="Search all blocks" />
        </label>
      {/if}
      {#if running}
        <div class="run-status" role="status">
          <span class="run-dot" aria-hidden="true"></span>
          {testRun ? 'Test run' : 'Running'}{#if progress.total} · day {progress.index} of {progress.total}{/if} · step {progress.steps.toLocaleString()}
        </div>
      {/if}
      {#if !wide}
        <div class="run-bar">
          <button class="run-go" onclick={run} disabled={running}><Icon name="play" size={16} />{t('Run')}</button>
          <button class="run-plain" onclick={runForYesterday} disabled={running}><Icon name="calendar" size={16} />Yesterday</button>
          <label class="run-test"><input type="checkbox" role="switch" bind:checked={testRun} disabled={running} />Test</label>
          <span class="grow"></span>
          <button class="run-icon" onclick={stopRun} disabled={!running} aria-label="Stop"><Icon name="stop" /></button>
          <button class="run-icon" onclick={() => openPanel('console')} aria-label="Console"><Icon name="console" /></button>
        </div>
      {/if}
    </div>

    {#if panelOpen}
      <aside class="ed-panel" class:sheet={!wide} aria-label="Workspace panel">
        <div class="ed-tabs" role="tablist">
          {#each TABS as [key, name] (key)}
            <button role="tab" aria-selected={tab === key} class:active={tab === key} onclick={() => (tab = key)}>
              {t(name)}{#if key === 'run' && errorCount}<span class="ed-badge">{errorCount}</span>{/if}
            </button>
          {/each}
          {#if !wide}
            <button class="nb-icon ed-close" onclick={() => (panelOpen = false)} aria-label="Close the panel"><Icon name="close" /></button>
          {/if}
        </div>

        {#if tab === 'details'}
          <div class="ed-pane" role="tabpanel" bind:this={detailsPanel}>
            <div class="ed-field-row">
              <span class="ed-emoji" style="background: {draft.color}">{draft.emoji}</span>
              <label class="ed-field grow">{t('Name')}<input bind:value={draft.displayName} oninput={() => (dirty = true)} /></label>
            </div>
            <label class="ed-field">{t('Emoji')}<input class="ed-emoji-input" bind:value={draft.emoji} oninput={() => (dirty = true)} /></label>
            <label class="ed-field">{t('Description')}<textarea rows="3" bind:value={draft.description} oninput={() => (dirty = true)}></textarea></label>
            <label class="ed-field">Name used in notes<input bind:value={draft.name} oninput={() => (dirty = true)} /></label>
            <p class="ed-hint">A note with “Run Blockly Workspace: {draft.name || 'name'}” runs this workspace.</p>
            <div class="ed-field">
              Colour
              <div class="ed-swatches">
                {#each COLOURS as colour (colour)}
                  <button class="ed-swatch" class:selected={draft.color === colour} style="background: {colour}" aria-label="Colour {colour}" aria-pressed={draft.color === colour} onclick={() => { draft.color = colour; dirty = true; }}></button>
                {/each}
              </div>
            </div>
            <div class="ed-summary">
              <strong>{t('Schedule')}</strong>
              <span>{daily ? 'Daily: runs for each day since its last run, up to yesterday.' : 'Not scheduled. Set the Scheduler block to Daily to run it every day.'}</span>
              {#if noteTracker}<span>Runs when {noteTracker} is logged</span>{/if}
              {#if reads.length}<span>Reads {reads.join(', ')}</span>{/if}
              {#if writes.length}<span>Writes to {writes.join(', ')}</span>{/if}
            </div>
            <div class="ed-summary">
              <strong>{t('Versions')}</strong>
              {#if previousVersion}
                <button class="nb-btn" onclick={restorePrevious}>Restore the version of {previousWhen || 'before the first save'}</button>
              {:else}
                <span>No earlier version yet. The blocks from before the next save are kept here.</span>
              {/if}
              <button class="nb-btn" onclick={exportThis}>Export this workspace</button>
            </div>
            <div class="ed-summary">
              <strong>Remembered values</strong>
              {#if remembered.length}
                {#each remembered as [name, value] (name)}
                  <span><code>{name}</code> {JSON.stringify(value)}</span>
                {/each}
                <button class="nb-btn" onclick={forgetAll}>Forget all</button>
              {:else}
                <span>Nothing yet. Remember blocks keep a value for the next run.</span>
              {/if}
            </div>
          </div>
        {:else if tab === 'run'}
          <div class="ed-pane" role="tabpanel">
            <label class="ed-switch">
              <input type="checkbox" role="switch" bind:checked={testRun} disabled={running} />
              Test run (no notes are written)
            </label>
            {#if testRun && start?.untested}
              <p class="ed-hint">This workspace came from a file or backup. Its first real run turns test mode off.</p>
            {/if}
            <div class="ed-actions">
              <button class="nb-btn primary" onclick={run} disabled={running}><Icon name="play" size={16} />Run now</button>
              <button class="nb-btn" onclick={stopRun} disabled={!running}><Icon name="stop" size={16} />{t('Stop')}</button>
            </div>
            <strong class="ed-heading">Try with a note</strong>
            <div class="ed-days-form">
              <label class="ed-field grow">Note<input bind:value={tryText} placeholder="#mood(2) #run" /></label>
              <button class="nb-btn" onclick={tryNote} disabled={running || !tryText.trim()}><Icon name="play" size={16} />{t('Try')}</button>
            </div>
            <p class="ed-hint">Runs the workspace as if this note was saved today. It is a test run: no notes are written.</p>

            <strong class="ed-heading">Before a run</strong>
            {#if problems.length === 0}
              <p class="ed-ok"><Icon name="check" size={16} />No problems found.</p>
            {:else}
              <ul class="ed-problems">
                {#each problems as problem, i (i)}
                  <li>
                    <button class="ed-problem" class:error={problem.level === 'error'} onclick={() => selectBlock(problem.blockId)} disabled={!problem.blockId}>
                      <Icon name={problem.level === 'error' ? 'error' : 'warning'} size={16} />
                      <span>{problem.message}{#if problem.label}<em>{problem.label}</em>{/if}</span>
                    </button>
                  </li>
                {/each}
              </ul>
            {/if}

            <strong class="ed-heading">Run for days</strong>
            <div class="ed-days-form">
              <label class="ed-field">{t('From')}<input type="date" bind:value={daysFrom} max={daysTo} /></label>
              <label class="ed-field">{t('To')}<input type="date" bind:value={daysTo} min={daysFrom} /></label>
              <button class="nb-btn" onclick={runTheseDays} disabled={running || !daysFrom || !daysTo}><Icon name="calendar" size={16} />{t('Run')}</button>
            </div>
            <p class="ed-hint">
              {testRun
                ? 'Runs the workspace for each day, as the schedule would. It writes no notes: each day lists the notes it would write.'
                : 'Runs the workspace for each day, as the schedule would, and writes its notes for those days.'}
            </p>

            <strong class="ed-heading">{ranDays ? 'This run, per day' : 'Last schedule, per day'}</strong>
            {#if dayRows.length === 0 && !nextWindow}
              <p class="ed-hint">No days have run yet.</p>
            {/if}
            <ul class="ed-days">
              {#each dayRows as row (row.day)}
                <li>
                  <button class="ed-day {dayStatus(row)}" onclick={() => showDay(row)}>
                    <span class="ed-day-date">{row.day}</span>
                    <span class="ed-day-text">
                      <span class="ed-day-status">{dayStatus(row)}</span>
                      <span class="ed-day-line">{row.error && row.error !== 'stopped' ? row.error : (row.output[0] ?? 'no output')}</span>
                    </span>
                  </button>
                </li>
              {/each}
              {#if nextWindow && !ranDays}
                <li class="ed-day next">
                  <span class="ed-day-date">{localDayKey(nextWindow.start)}</span>
                  <span class="ed-day-text">
                    <span class="ed-day-status">next</span>
                    <span class="ed-day-line">
                      {nextWindow.end < nextWindow.start ? 'runs tomorrow' : `the next schedule runs ${localDayKey(nextWindow.start)} to ${localDayKey(nextWindow.end)}`}
                    </span>
                  </span>
                </li>
              {/if}
            </ul>
          </div>
        {:else}
          <div class="ed-pane ed-console-pane" role="tabpanel">
            <div class="ed-actions">
              <strong class="ed-heading grow">{t('Output')}</strong>
              <button class="nb-btn" onclick={() => (consoleText = '')} disabled={!consoleText || running}>{t('Clear')}</button>
            </div>
            <pre class="ed-console" aria-live="polite">{consoleText || 'No output yet. Run the workspace to see what it shows.'}</pre>
          </div>
        {/if}
      </aside>
    {/if}
  </div>
</div>
