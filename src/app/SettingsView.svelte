<script lang="ts">
  import { appState } from './state.svelte';
  import { ui } from './ui.svelte';
  import { actionDeps, askConfirm, notify } from './dialogs';
  import { scheduleNow } from './actions';
  import { parseWorkspaceFile, workspaceToFile, withNewId } from '../domain/workspace';

  let importMode = $state<'add' | 'replace'>('add');
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
  <button class="button" onclick={runSchedule}>Run the schedule now</button>
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
