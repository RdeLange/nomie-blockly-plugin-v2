// Each workspace can be a dashboard widget of its own (phase 20): the plugin lists the workspaces that show a value in
// its `widgets` storage key, and a widget frame opened with &widgetindex=<id> shows only that workspace. Runs against
// fake-nomie.js, which keeps its storage in localStorage, so a page opened again is the widget frame of DailyNomie.
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
// the widget frame opens once the plugin has started (its listener is there), as DailyNomie opens it
const openWidgetFrame = async (page) => {
  await page.waitForFunction(() => window.__nomie?.widgetListeners?.length > 0, null, { timeout: 15000 });
  await page.evaluate(() => window.__nomie.fireWidget());
};
const stored = (page) => page.evaluate(() => JSON.parse(window.localStorage.getItem('fake-nomie-store') ?? '{}'));

try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await context.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  await context.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
  const page = await context.newPage();
  page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  await page.goto(url);

  // two workspaces: one shows a value on the widget (a template), one does not
  await addExample(page, 'Example: Dashboard widget with a value');
  await page.goto(url);
  await addExample(page, 'Example: Yesterday in one number');
  await page.goto(url);
  await page.locator('.card', { hasText: 'Example: Dashboard widget with a value' }).filter({ has: page.getByRole('button', { name: 'Run', exact: true }) }).getByRole('button', { name: 'Run', exact: true }).click();
  await page.waitForFunction(() => Object.keys(JSON.parse(window.localStorage.getItem('fake-nomie-store') ?? '{}').blockly?.widget ?? {}).length > 0, null, { timeout: 30000 });

  const store = await stored(page);
  const moodId = store.blockly.workspaces.find((w) => w.displayName === 'Example: Dashboard widget with a value').id;
  const list = store.widgets ?? [];
  check('the widgets list has the workspace that shows a value, with its name and emoji',
    list.length === 1 && list[0].widgetid === moodId && list[0].name === 'Mood' && list[0].emoji === '😊' && Object.keys(list[0].config).length === 0);

  // DailyNomie opens the widget frame for that workspace: one tile, the one of the workspace it picked
  await page.goto(`${url}?pid=test&widgetindex=${moodId}`);
  await openWidgetFrame(page);
  await page.locator('.wd').waitFor({ timeout: 15000 });
  check('a widget of its own shows its workspace only', (await page.locator('.wd').count()) === 1);
  check('the widget shows the value of its workspace', (await page.locator('.wd .wd-label').first().textContent()) === '7-day average');
  check('the widget draws its trend line', (await page.locator('.wd svg').count()) === 1);
  await page.screenshot({ path: 'screenshots/dashboard-widget.png' });

  // a workspace without a value yet: its widget says so, and offers Run
  const retrieveId = store.blockly.workspaces.find((w) => w.displayName === 'Example: Yesterday in one number').id;
  await page.goto(`${url}?pid=test&widgetindex=${retrieveId}`);
  await openWidgetFrame(page);
  await page.getByRole('button', { name: 'Run', exact: true }).waitFor({ timeout: 15000 });
  check('a workspace without a value says so, with Run', (await page.locator('.wd').count()) === 0 && (await page.getByRole('button', { name: 'Run', exact: true }).count()) === 1);

  // a widget of a workspace that was removed says so
  await page.goto(`${url}?pid=test&widgetindex=gone`);
  await openWidgetFrame(page);
  await page.getByText("This widget's workspace was removed", { exact: false }).waitFor({ timeout: 15000 });
  check('a widget whose workspace was removed says so', true);
  await page.close();
} finally {
  await browser.close();
  await server.close();
}
const real = errors.filter((e) => e !== 'Failed to fetch');
if (real.length) {
  console.error('page errors:\n' + real.join('\n'));
  process.exitCode = 1;
}
