// On a phone (below 900 px) the plugin is a list of workspaces with Run, and nothing else about a workspace: no editor,
// no adding, no examples, no edit, export, duplicate or delete. Runs against fake-nomie.js, at 390 x 844 (the workspace
// is added at desktop size first, in the same browser storage).
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
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await context.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  await context.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));

  // desktop: add a workspace, so the phone has one to list
  const desktop = await context.newPage();
  await desktop.goto(url);
  // the header's Add comes first; the examples below it have Add buttons too
  await desktop.getByRole('button', { name: 'Add', exact: true }).first().click();
  await desktop.locator('.row', { hasText: 'Kick Start' }).getByRole('button', { name: 'Add' }).first().click();
  await desktop.waitForFunction(() => (window.localStorage.getItem('fake-nomie-store') ?? '').includes('Kick Start'), null, { timeout: 15000 });
  await desktop.close();

  // phone: the same storage, a phone-sized page
  const page = await context.newPage();
  page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  await page.locator('.card', { hasText: 'Kick Start' }).waitFor({ timeout: 15000 });

  const card = page.locator('.card', { hasText: 'Kick Start' }).first();
  check('the phone lists the workspace with its Run button', (await card.getByRole('button', { name: 'Run', exact: true }).count()) === 1);
  for (const name of ['Edit', 'Info', 'Export', 'Duplicate', 'Delete']) {
    check(`the phone has no ${name} button`, (await page.getByRole('button', { name, exact: true }).count()) === 0);
  }
  check('the phone has no Add button', (await page.getByRole('button', { name: 'Add', exact: true }).count()) === 0);
  check('the phone has no Examples tab', (await page.getByRole('tab', { name: /Examples/ }).count()) === 0);
  await card.locator('strong').click();
  await page.waitForTimeout(500);
  check('a tap on a workspace does not open the editor', (await page.locator('.ed-toolbar').count()) === 0);
  check('the list is still shown after a tap', (await page.locator('.card', { hasText: 'Kick Start' }).count()) >= 1);
  await page.screenshot({ path: 'screenshots/phone-list.png' });
} finally {
  await browser.close();
  await server.close();
}
const real = errors.filter((e) => e !== 'Failed to fetch');
if (real.length) {
  console.error('page errors:\n' + real.join('\n'));
  process.exitCode = 1;
}
