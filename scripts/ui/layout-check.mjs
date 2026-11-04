// The layout of phase 19: from 1200 px wide the list of workspaces sits beside the editor (switching asks first when
// there are unsaved changes); below 900 px the rail shows the label of the selected tile only, and a long press shows
// any tile's name. Runs against fake-nomie.js, at 1440 x 900 and 1100 x 800 (the phone: phone-list-check.mjs).
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

const openTwo = async (viewport, name) => {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  await context.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  await context.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
  const page = await context.newPage();
  page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  page.on('dialog', (d) => d.dismiss());
  await page.goto(url);
  // the template list opens with the header's Add, and stays open while templates are added
  await addExample(page, 'Example: Yesterday in one number');
  await page.goto(url);
  await page.getByRole('button', { name: 'Add', exact: true }).first().click();
  await page.locator('.row', { hasText: 'Kick Start' }).getByRole('button', { name: 'Add' }).first().click();
  await page.waitForTimeout(400);
  await page.locator('.card', { hasText: 'Last run' }).filter({ hasText: name }).first().getByRole('button', { name: 'Edit' }).click();
  await page.locator('.ed-toolbar').waitFor({ timeout: 15000 });
  return { context, page };
};

try {
  // 1440 x 900: the list beside the editor
  let { context, page } = await openTwo({ width: 1440, height: 900 }, 'Example: Yesterday in one number');
  const side = page.locator('.ws-side');
  check('from 1200 px wide the list sits beside the editor', (await side.count()) === 1);
  const width = (await side.boundingBox())?.width ?? 0;
  check(`the list is 280 px wide (${Math.round(width)})`, width > 270 && width < 290);
  check('the list shows both workspaces', (await page.locator('.ws-item').count()) === 2);
  await page.screenshot({ path: 'screenshots/split-1440.png' });

  // switching with no unsaved changes goes straight to the other workspace
  await page.locator('.ws-item', { hasText: 'Kick Start' }).click();
  await page.waitForTimeout(600);
  check('switching to another workspace opens it', (await page.locator('.ed-title h1').textContent())?.trim() === 'Kick Start');

  // switching with unsaved changes asks first: No keeps the open workspace and its changes, Yes switches
  await page.getByRole('tab', { name: /Details/ }).click();
  await page.getByLabel('Name', { exact: true }).fill('Kick Start changed');
  await page.waitForTimeout(200);
  const asked = () => page.evaluate(() => window.__nomie.dialogs.some((d) => d.startsWith('Leave without saving?')));
  const before = await asked();
  await page.evaluate(() => (window.__fakeConfirm = false));
  await page.locator('.ws-item', { hasText: 'Example: Yesterday in one number' }).click();
  await page.waitForTimeout(600);
  check('with unsaved changes, switching asks first', (await asked()) && !before);
  check('No keeps the open workspace and its changes', (await page.locator('.ed-title h1').textContent())?.includes('Kick Start changed'));
  await page.evaluate(() => (window.__fakeConfirm = true));
  await page.locator('.ws-item', { hasText: 'Example: Yesterday in one number' }).click();
  await page.waitForTimeout(600);
  check('Yes switches to the other workspace', (await page.locator('.ed-title h1').textContent())?.trim() === 'Example: Yesterday in one number');
  await context.close();

  // 1100 x 800: no list beside the editor
  ({ context, page } = await openTwo({ width: 1100, height: 800 }, 'Example: Yesterday in one number'));
  check('below 1200 px wide there is no list beside the editor', (await page.locator('.ws-side').count()) === 0);
  await page.screenshot({ path: 'screenshots/split-1100.png' });
  await context.close();

  // the phone has no editor, so no rail: phone-list-check.mjs covers the phone
} finally {
  await browser.close();
  await server.close();
}
const real = errors.filter((e) => e !== 'Failed to fetch');
if (real.length) {
  console.error('page errors:\n' + real.join('\n'));
  process.exitCode = 1;
}
