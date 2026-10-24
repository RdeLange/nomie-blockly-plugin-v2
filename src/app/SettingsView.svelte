<script lang="ts">
  import { appState } from './state.svelte';
  import { ui } from './ui.svelte';
  import { actionDeps, askConfirm, notify } from './dialogs';
  import { scheduleNow, setScheduleStart } from './actions';
  import { isDailyWorkspace, parseTypedDay, scheduleWindow } from '../runtime/scheduler';
  import { localDayKey } from '../runtime/dates';
  import { parseWorkspaceFile, workspaceToFile, withNewId } from '../domain/workspace';

  let importMode = $state<'add' | 'replace'>('add');
  let startText = $state(localDayKey(new Date()));
  let startError = $state('');

  const now = new Date();
  // the daily workspaces, with the days their next run covers
  const overview = $derived(
    appState.workspaces.map((w) => ({
      id: w.id,
      name: w.displayName,
      daily: isDailyWorkspace(w.jscode),
      window: isDailyWorkspace(w.jscode) ? scheduleWindow(w.latestrun, now) : undefined,
    }))
  );
  const dailyCount = $derived(overview.filter((w) => w.daily).length);

  const applyStart = () => {
    const day = parseTypedDay(startText);
    if (!day) {
      startError = 'Type a day as YYYY-MM-DD, for example 2026-10-01.';
      return;
    }
    startError = '';
    const deps = actionDeps();
    if (!deps) return;
    const count = setScheduleStart(deps, day);
    notify('Scheduler', `The next run starts from ${day} for ${count} workspace${count === 1 ? '' : 's'}.`);
  };
  let fileInput: HTMLInputElement | undefined = $state();

  const runSchedule = async () => {
    const deps = actionDeps();
    if (!deps) return;
    const outcomes = await scheduleNow(deps);
    notify('Scheduler', outcomes.length ? 'The schedule has run.' : 'No workspace is scheduled.');
  };

  const exportBackup = () => {
    const blob = new Blob([workspaceToFile(appState.workspaces)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `blockly-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const importBackup = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    let workspaces;
    try {
      workspaces = parseWorkspaceFile(await file.text());
    } catch (error) {
      notify('Import failed', (error as Error).message);
      return;
    }
    const replace = importMode === 'replace';
    const question = replace ? 'Replace your workspaces with this backup?' : 'Add the backup to your workspaces?';
    if (!(await askConfirm('Import', question))) return;
    const imported = workspaces.map(withNewId);
    appState.workspaces = replace ? imported : [...appState.workspaces, ...imported];
    actionDeps()?.save();
    notify('Import', `${imported.length} workspace${imported.length === 1 ? '' : 's'} ${replace ? 'replaced' : 'added'}.`);
  };

  const pick = (mode: 'add' | 'replace') => {
    importMode = mode;
    fileInput?.click();
  };
</script>

<div class="header">
  <button class="button plain" onclick={() => (ui.view = 'list')}>Back</button>
  <h1 class="title" style="font-size: 22px">Settings</h1>
  <span></span>
</div>

<div class="card">
  <p><strong>Scheduler</strong></p>
  <p class="muted">Last run: {new Date(appState.lastCentralSchedule).toLocaleString()}</p>
  <p class="muted">Daily workspaces run for the days since their last run, up to yesterday.</p>
  <p class="muted">Next run starts from</p>
  <div class="row">
    <input class="input grow" inputmode="numeric" placeholder="YYYY-MM-DD" bind:value={startText} />
    <button class="button" onclick={applyStart}>Set</button>
  </div>
  {#if startError}
    <p class="muted" style="color: var(--ios-danger)">{startError}</p>
  {/if}
  <p class="muted" style="margin-top: 12px">Daily workspaces ({dailyCount})</p>
  {#each overview.filter((w) => w.daily) as item (item.id)}
    <div class="row" style="margin-top: 6px">
      <span class="grow">{item.name}</span>
      <span class="muted">
        {item.window ? `${localDayKey(item.window.start)} to ${localDayKey(item.window.end)}` : ''}
      </span>
    </div>
  {:else}
    <p class="muted">No workspace has a daily schedule. Set one with the Scheduler block in the editor.</p>
  {/each}
  <div class="row" style="margin-top: 12px">
    <button class="button" onclick={runSchedule}>Run the schedule now</button>
  </div>
  {#if appState.centralLog}
    <div class="console" style="margin-top: 12px">{appState.centralLog}</div>
  {/if}
</div>

<div class="card">
  <p><strong>Backup</strong></p>
  <p class="muted">A backup is a file with all your workspaces. Nomie Blockly v1 backups import here too.</p>
  <div class="row">
    <button class="button" onclick={exportBackup}>Export</button>
    <button class="button plain" onclick={() => pick('add')}>Import and add</button>
    <button class="button danger" onclick={() => pick('replace')}>Import and replace</button>
    <input bind:this={fileInput} type="file" accept=".json,.wsp,application/json" onchange={importBackup} hidden />
  </div>
</div>
