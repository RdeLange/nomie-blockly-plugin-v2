<script lang="ts">
  import { t, tf } from './i18n.svelte';
  import { onMount } from 'svelte';
  import { appState } from './state.svelte';
  import { ui } from './ui.svelte';
  import { actionDeps, askConfirm, notify } from './dialogs';
  import { scheduleNow, setScheduleStart } from './actions';
  import { parseTypedDay, scheduleWindow } from '../runtime/scheduler';
  import { importSummary } from './editing';
  import { refreshCompiled } from './compiler';

  // the schedule a workspace was compiled to (see app/compiler.ts)
  const isDaily = (w: { schedule: string }) => w.schedule === 'daily';
  import { localDayKey } from '../runtime/dates';
  import { parseWorkspaceFile, readBackupMemory, workspaceToFile, withNewId } from '../domain/workspace';
  import { SECRET_NAME } from '../runtime/secrets';

  let importMode = $state<'add' | 'replace'>('add');
  let startText = $state(localDayKey(new Date()));
  let startError = $state('');

  // the time the overview is for; kept current, so it does not go stale when Settings stays open past midnight
  let now = $state(new Date());
  onMount(() => {
    const timer = setInterval(() => (now = new Date()), 60_000);
    return () => clearInterval(timer);
  });
  // the daily workspaces, with the days their next run covers
  const overview = $derived(
    appState.workspaces.map((w) => ({
      id: w.id,
      name: w.displayName,
      daily: isDaily(w),
      window: isDaily(w) ? scheduleWindow(w.latestrun, now) : undefined,
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
    notify(t('Scheduler'), count === 1 ? tf('The next run starts from {day} for 1 workspace.', { day }) : tf('The next run starts from {day} for {count} workspaces.', { day, count: String(count) }));
  };
  let fileInput: HTMLInputElement | undefined = $state();

  // Secrets: the names are shown, the values are not. A value can be changed or removed, not read back.
  let secretName = $state('');
  let secretValue = $state('');
  let secretError = $state('');
  let includeMemory = $state(false);
  const secretNames = $derived(Object.keys(appState.secrets).sort());

  const saveSecret = () => {
    const name = secretName.trim();
    if (!SECRET_NAME.test(name)) {
      secretError = 'A name uses letters, digits, _, - and . only, for example OPENWEATHER_KEY.';
      return;
    }
    if (!secretValue) {
      secretError = 'Type the value of the secret.';
      return;
    }
    secretError = '';
    appState.secrets[name] = secretValue;
    secretName = '';
    secretValue = '';
    void actionDeps()?.save();
  };

  const removeSecret = async (name: string) => {
    if (!(await askConfirm(t('Remove the secret?'), tf('{name} is removed. Workspaces that use it will say so before they run.', { name })))) return;
    delete appState.secrets[name];
    void actionDeps()?.save();
  };

  const runSchedule = async () => {
    const deps = actionDeps();
    if (!deps) return;
    const outcomes = await scheduleNow(deps);
    notify(t('Scheduler'), outcomes.length ? t('The schedule has run.') : t('No workspace is scheduled.'));
  };

  const exportBackup = () => {
    // remembered values go into the backup only when asked for; secrets never do
    const blob = new Blob([workspaceToFile(appState.workspaces, includeMemory ? appState.memory : undefined)], { type: 'application/json' });
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
    let memories: Array<Record<string, unknown> | undefined> = [];
    try {
      const text = await file.text();
      workspaces = parseWorkspaceFile(text);
      memories = readBackupMemory(text);
    } catch (error) {
      notify(t('Import failed'), (error as Error).message);
      return;
    }
    const replace = importMode === 'replace';
    const question = replace ? t('Replace your workspaces with this backup?') : t('Add the backup to your workspaces?');
    // a backup can come from someone else: say what its workspaces do before adding them
    if (!(await askConfirm(t('Import'), `${question}\n\n${t('Only import workspaces you trust.')}\n\n${await importSummary(workspaces)}`))) return;
    // each workspace is compiled from its blocks; a backup's workspaces start in test mode, until each one has had a
    // real run in the editor
    const compiled = await Promise.all(workspaces.map((w) => refreshCompiled(withNewId(w))));
    const imported = compiled.map((w) => ({ ...w, untested: true }));
    appState.workspaces = replace ? imported : [...appState.workspaces, ...imported];
    // replacing drops the values of the workspaces it replaces; the backup's values go to the new workspaces
    if (replace) appState.memory = {};
    imported.forEach((w, i) => {
      if (memories[i]) appState.memory[w.id] = memories[i] as Record<string, unknown>;
    });
    actionDeps()?.save();
    notify(t('Import'), imported.length === 1 ? (replace ? t('Replaced 1 workspace.') : t('Added 1 workspace.')) : tf(replace ? 'Replaced {count} workspaces.' : 'Added {count} workspaces.', { count: String(imported.length) }));
  };

  const pick = (mode: 'add' | 'replace') => {
    importMode = mode;
    fileInput?.click();
  };
</script>

<div class="header">
  <button class="button plain" onclick={() => (ui.view = 'list')}>{t('Back')}</button>
  <h1 class="title" style="font-size: 22px">{t('Settings')}</h1>
  <span></span>
</div>

<div class="card">
  <p><strong>{t('Scheduler')}</strong></p>
  <p class="muted">Last run: {appState.lastCentralSchedule ? new Date(appState.lastCentralSchedule).toLocaleString() : 'never'}</p>
  <p class="muted">{t('Daily workspaces run for the days since their last run, up to yesterday.')}</p>
  <p class="muted">{t('Next run starts from')}</p>
  <div class="row">
    <input class="input grow" inputmode="numeric" placeholder="YYYY-MM-DD" bind:value={startText} />
    <button class="button" onclick={applyStart}>{t('Set')}</button>
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
    <p class="muted">{t('No workspace has a daily schedule. Set one with the Scheduler block in the editor.')}</p>
  {/each}
  <div class="row" style="margin-top: 12px">
    <button class="button" onclick={runSchedule}>{t('Run the schedule now')}</button>
  </div>
  {#if appState.centralLog}
    <div class="console" style="margin-top: 12px">{appState.centralLog}</div>
  {/if}
</div>

<div class="card">
  <p><strong>{t('Secrets')}</strong></p>
  <p class="muted">{t('A workspace uses a secret by name, such as an API key, so the key is not in its blocks. Secrets stay on this device: they are never in a backup or a shared workspace.')}</p>
  {#each secretNames as name (name)}
    <div class="row" style="margin-top: 6px">
      <span class="grow">{name}</span>
      <span class="muted">••••</span>
      <button class="button plain" onclick={() => { secretName = name; secretValue = ''; secretError = ''; }}>{t('Change')}</button>
      <button class="button plain" onclick={() => removeSecret(name)}>{t('Remove')}</button>
    </div>
  {:else}
    <p class="muted">{t('No secrets yet.')}</p>
  {/each}
  <div class="row" style="margin-top: 12px">
    <input class="input" style="flex: 0 0 200px" placeholder={t('Name')} aria-label={t('Secret name')} bind:value={secretName} />
    <input class="input" style="flex: 1 1 auto; min-width: 160px" type="password" placeholder={t('value')} aria-label={t('Secret value')} autocomplete="off" bind:value={secretValue} />
    <button class="button" onclick={saveSecret}>{t('Save')}</button>
  </div>
  {#if secretError}
    <p class="muted" style="color: var(--ios-danger)">{secretError}</p>
  {/if}
</div>

<div class="card">
  <p><strong>{t('Backup')}</strong></p>
  <p class="muted">{t('A backup is a file with all your workspaces. Nomie Blockly v1 backups import here too.')}</p>
  <label class="row muted"><input type="checkbox" bind:checked={includeMemory} /> {t('Include remembered values')}</label>
  <div class="row">
    <button class="button" onclick={exportBackup}>{t('Export')}</button>
    <button class="button plain" onclick={() => pick('add')}>{t('Import and add')}</button>
    <button class="button danger" onclick={() => pick('replace')}>{t('Import and replace')}</button>
    <input bind:this={fileInput} type="file" accept=".json,.wsp,application/json" onchange={importBackup} hidden />
  </div>
</div>
