// A workspace from a backup starts in test mode: its runs write no notes, the Run tab says so, and its first real run
// turns test mode off. Runs against fake-nomie.js (window.__nomie.created holds the notes it was given).
import { mkdirSync, readFileSync } from 'node:fs';
import { addExample } from './add-example.mjs';
import { createServer } from 'vite';
import { chromium } from 'playwright';

mkdirSync('screenshots', { recursive: true });
const server = await createServer({ logLevel: 'error' });
await server.listen();
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch();
const errors = [];
const check = (label, ok) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`);
  if (!ok) process.exitCode = 1;
};

// logs 6 to #mood for today, as a block in the editor
const DAY = '<block type="s4e_daypicker"><field name="Day">today</field></block>';
const LOG = `<xml xmlns="https://developers.google.com/blockly/xml"><block type="s4e_logvalue" x="40" y="420"><value name="Value"><block type="math_number"><field name="NUM">6</field></block></value><value name="Tracker"><block type="s4e_trackers"><field name="Trackers">#mood</field></block></value><value name="Date">${DAY}</value></block></xml>`;

const openFromBackup = async (viewport) => {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  await page.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  await page.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
  await page.goto(url);
  await addExample(page, 'Example: Yesterday in one number');
  // adding saves the workspace: wait for the save, then mark the saved workspaces as from a backup, and launch again
  await page.waitForFunction(() => (window.localStorage.getItem('fake-nomie-store') ?? '').includes('Example: Yesterday in one number'), null, { timeout: 15000 });
  await page.evaluate(() => {
    const store = JSON.parse(window.localStorage.getItem('fake-nomie-store'));
    for (const w of store.blockly.workspaces) w.untested = true;
    window.localStorage.setItem('fake-nomie-store', JSON.stringify(store));
  });
  await page.reload();
  await page.getByRole('button', { name: 'Edit' }).first().click();
  await page.waitForTimeout(1200);
  return page;
};

const created = (page) => page.evaluate(() => window.__nomie.created.length);
const untested = (page) => page.evaluate(async () => {
  const { appState } = await import('/src/app/state.svelte.ts');
  return appState.workspaces[0].untested;
});

try {
  const page = await openFromBackup({ width: 1440, height: 900 });
  // the editor loads when it opens: wait for its toolbar, not for a fixed time
  const toolbarSwitch = page.locator('.ed-toolbar input[type="checkbox"]');
  await toolbarSwitch.waitFor({ timeout: 15000 });
  check('a workspace from a backup opens with test run on', await toolbarSwitch.isChecked());

  await page.getByRole('tab', { name: /Run/ }).click();
  const runTabSwitch = page.locator('.ed-pane input[type="checkbox"]').first();
  check('the Run tab shows the switch on, and says the workspace came from a backup',
    (await runTabSwitch.isChecked()) && (await page.locator('.ed-hint').allTextContents()).some((t) => t.includes('came from a file or backup')));
  await page.screenshot({ path: 'screenshots/test-run-desktop.png' });

  // a test run: nothing is written, and the output says what would be
  await page.evaluate(async (xml) => {
    const { Blockly } = await import('/src/blockly/setup.ts');
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), Blockly.getMainWorkspace());
  }, LOG);
  await page.waitForTimeout(500);
  const before = await created(page);
  await page.getByRole('button', { name: 'Run now' }).click();
  await page.waitForFunction(() => document.querySelector('.ed-console')?.textContent.includes('Would log'), null, { timeout: 10000 });
  check('a test run writes no notes', (await created(page)) === before);
  check('a test run says what it would log', (await page.locator('.ed-console').textContent()).includes('Would log #mood(6) on '));
  check('a test run does not end test mode', (await untested(page)) === true);

  // the first real run writes the note, and ends test mode for this workspace (a run opens the Console tab)
  await page.getByRole('tab', { name: /Run/ }).click();
  await runTabSwitch.uncheck();
  await page.getByRole('button', { name: 'Run now' }).click();
  await page.waitForFunction((n) => window.__nomie.created.length > n, before, { timeout: 10000 });
  check('a real run writes the note', (await created(page)) === before + 1);
  check('the first real run turns test mode off', (await untested(page)) === undefined);
  await page.close();

  // the phone is checked in phone-list-check.mjs: a phone shows the list only, not the editor
} finally {
  await browser.close();
  await server.close();
}
const real = errors.filter((e) => e !== 'Failed to fetch');
if (real.length) {
  console.error('page errors:\n' + real.join('\n'));
  process.exitCode = 1;
}
