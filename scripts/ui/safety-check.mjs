// The safety nets (phase 17): a failed run shows on its card and opens the Run tab, a workspace is duplicated and
// exported (without its history), and an earlier version is restored in the editor, unsaved. Runs against fake-nomie.js.
import { mkdirSync, readFileSync } from 'node:fs';
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

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await context.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  await context.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
  const page = await context.newPage();
  page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  page.on('dialog', (d) => d.accept());
  await page.goto(url);

  // a template, copied: two cards, the copy named "(copy)"
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.locator('.row', { hasText: 'Retrieve Data Example' }).getByRole('button', { name: 'Add' }).first().click();
  await page.locator('.card', { hasText: 'Retrieve Data Example' }).getByRole('button', { name: 'Duplicate' }).click();
  await page.waitForFunction(() => document.querySelectorAll('.card').length >= 2 && (document.body.textContent ?? '').includes('(copy)'), null, { timeout: 15000 });
  check('a duplicate is a second card named "(copy)"', (await page.locator('.card', { hasText: 'Retrieve Data Example (copy)' }).count()) === 1);

  // export one: a file with that workspace only, no earlier version and no remembered values
  // the workspace cards (they show "Last run"), not the template list that is open while adding
  const workspaceCard = (name) => page.locator('.card', { hasText: 'Last run' }).filter({ hasText: name }).first();
  const downloadPromise = page.waitForEvent('download');
  await workspaceCard('Retrieve Data Example').getByRole('button', { name: 'Export' }).click();
  const download = await downloadPromise;
  const file = JSON.parse(readFileSync(await download.path(), 'utf8'));
  check('an export is one workspace, without its earlier version or remembered values',
    Array.isArray(file) && file.length === 1 && !('previous' in file[0]) && !('memory' in file[0]) && typeof file[0].workspaceBlocks === 'string');

  // an edit saved: the earlier blocks become the version to restore
  await workspaceCard('Retrieve Data Example').getByRole('button', { name: 'Edit' }).click();
  await page.locator('.ed-toolbar').waitFor({ timeout: 15000 });
  await page.evaluate(async () => {
    const { Blockly, loadWorkspace } = await import('/src/blockly/setup.ts');
    const ws = Blockly.getMainWorkspace();
    const block = ws.newBlock('s4e_forget');
    block.setFieldValue('edited', 'NAME');
    block.initSvg();
    block.render();
    block.moveBy(40, 500);
  });
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForTimeout(300);
  await page.getByRole('tab', { name: /Details/ }).click();
  const restore = page.getByRole('button', { name: /Restore the version of/ });
  check('the Details tab offers to restore the earlier version', (await restore.count()) === 1);
  await restore.click();
  const edited = await page.evaluate(async () => {
    const { Blockly } = await import('/src/blockly/setup.ts');
    return Blockly.getMainWorkspace().getBlocksByType('s4e_forget', false).length;
  });
  check('restoring brings back the earlier blocks', edited === 0);
  check('the restored version is unsaved until the next save', await page.getByRole('button', { name: 'Save', exact: true }).isEnabled());
  await page.getByRole('button', { name: 'Back to workspaces' }).click();
  await page.getByRole('button', { name: 'Leave', exact: true }).click().catch(() => undefined);

  // a failed scheduled run: the card says so, and Show opens the Run tab where the error is
  const stored = await page.evaluate(() => JSON.parse(window.localStorage.getItem('fake-nomie-store')));
  const workspace = stored.blockly.workspaces.find((w) => w.displayName === 'Retrieve Data Example');
  stored.blockly.scheduledays = {
    [workspace.id]: [{ day: '2026-11-02', ok: false, error: 'the run took too many steps', output: [] }],
  };
  await page.evaluate((s) => window.localStorage.setItem('fake-nomie-store', JSON.stringify(s)), stored);
  await page.reload();
  const card = workspaceCard('Retrieve Data Example');
  await card.locator('.health.failed').waitFor({ timeout: 15000 });
  check('the card says when the run failed and why', (await card.locator('.health.failed').textContent()) === 'Failed on 2026-11-02: the run took too many steps');
  await page.screenshot({ path: 'screenshots/safety-card.png' });
  await card.getByRole('button', { name: 'Show', exact: true }).click();
  await page.getByRole('tab', { name: /Run/ }).waitFor({ timeout: 15000 });
  check('Show opens the Run tab', (await page.getByRole('tab', { name: /Run/ }).getAttribute('aria-selected')) === 'true');
} finally {
  await browser.close();
  await server.close();
}
const real = errors.filter((e) => e !== 'Failed to fetch');
if (real.length) {
  console.error('page errors:\n' + real.join('\n'));
  process.exitCode = 1;
}
