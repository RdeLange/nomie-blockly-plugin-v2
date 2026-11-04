// Each workspace can be a dashboard widget of its own (phase 20): the plugin lists the workspaces that show a value in
// its `widgets` storage key, and a widget frame opened with &widgetid=<id> shows only that workspace. Runs against
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

  // the workspaces are added on a desktop-sized page (a phone only lists them and runs them)
  await page.setViewportSize({ width: 1440, height: 900 });
  // two workspaces: one shows a value on the widget (a template), one does not
  await addExample(page, 'Example: Dashboard widget with a value');
  await page.goto(url);
  await addExample(page, 'Example: Yesterday in one number');
  await page.goto(url);
  await page.locator('.card', { hasText: 'Example: Dashboard widget with a value' }).filter({ has: page.getByRole('button', { name: 'Run', exact: true }) }).getByRole('button', { name: 'Run', exact: true }).click();
  await page.waitForFunction(() => Object.keys(JSON.parse(window.localStorage.getItem('fake-nomie-store') ?? '{}').blockly?.widget ?? {}).length > 0, null, { timeout: 30000 });

  await page.setViewportSize({ width: 390, height: 844 });
  const store = await stored(page);
  const moodId = store.blockly.workspaces.find((w) => w.displayName === 'Example: Dashboard widget with a value').id;
  const list = store.widgets ?? [];
  check('the widgets list has the workspace that shows a value, with its name and emoji',
    list.length === 1 && list[0].widgetid === moodId && list[0].name === 'Mood' && list[0].emoji === '😊' && Object.keys(list[0].config).length === 0);

  // DailyNomie opens the widget frame for that workspace: one tile, the one of the workspace it picked
  await page.goto(`${url}?pid=test&widgetid=${moodId}`);
  await openWidgetFrame(page);
  await page.locator('.wd').waitFor({ timeout: 15000 });
  check('a widget of its own shows its workspace only', (await page.locator('.wd').count()) === 1);
  check('the widget shows the value of its workspace', (await page.locator('.wd .wd-label').first().textContent()) === '7-day average');
  check('the widget draws its trend line', (await page.locator('.wd svg').count()) === 1);
  // DailyNomie draws the card and its corners; inside its frame the widget must not round its own (see styles.css)
  check('the widget has no corners of its own inside the dashboard', (await page.locator('.wd').first().evaluate((el) => getComputedStyle(el).borderRadius)) === '0px');
  await page.screenshot({ path: 'screenshots/dashboard-widget.png' });

  // a workspace without a value yet: its widget says so, and offers Run
  const retrieveId = store.blockly.workspaces.find((w) => w.displayName === 'Example: Yesterday in one number').id;
  await page.goto(`${url}?pid=test&widgetid=${retrieveId}`);
  await openWidgetFrame(page);
  await page.getByText('No value yet.', { exact: true }).waitFor({ timeout: 15000 });
  check('a workspace without a value says so, and has no Run button (it runs by itself)', (await page.locator('.wd').count()) === 0 && (await page.getByRole('button', { name: 'Run', exact: true }).count()) === 0);

  // a widget of a workspace that was removed says so
  await page.goto(`${url}?pid=test&widgetid=gone`);
  await openWidgetFrame(page);
  await page.getByText("This widget's workspace was removed", { exact: false }).waitFor({ timeout: 15000 });
  check('a widget whose workspace was removed says so', true);

  // a widget that has never run fills itself in when it opens: no Run button, and its charts appear
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url);
  await addExample(page, 'Example: Widget charts');
  const chartsId = (await stored(page)).blockly.workspaces.find((w) => w.displayName === 'Example: Widget charts').id;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${url}?pid=test&widgetid=${chartsId}`);
  await openWidgetFrame(page);
  await page.locator('.wd svg').first().waitFor({ timeout: 30000 });
  check('a widget that has not run fills itself in, with no Run button', (await page.getByRole('button', { name: 'Run', exact: true }).count()) === 0);

  // a widget's own run writes no notes: the log example runs when its widget opens, and writes none
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url);
  await addExample(page, 'Example: Log a value each day');
  await page.goto(url);
  await addExample(page, 'Example: Remember between runs');
  const stateNow = await stored(page);
  const logId = stateNow.blockly.workspaces.find((w) => w.displayName === 'Example: Log a value each day').id;
  const rememberId = stateNow.blockly.workspaces.find((w) => w.displayName === 'Example: Remember between runs').id;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${url}?pid=test&widgetid=${rememberId}`);
  await openWidgetFrame(page);
  // the remember example keeps a count on each run: the count shows that the widget's own run happened
  await page.waitForFunction((id) => JSON.parse(window.localStorage.getItem('fake-nomie-store') ?? '{}').blockly?.memory?.[id] !== undefined, rememberId, { timeout: 30000 }).catch(() => undefined);
  const afterRemember = await stored(page);
  check("a widget's own run keeps the value it remembers", afterRemember.blockly?.memory?.[rememberId]?.runs === 1);
  await page.goto(`${url}?pid=test&widgetid=${logId}`);
  await openWidgetFrame(page);
  await page.waitForTimeout(3000);
  const writes = await page.evaluate(() => (window.__nomie?.created ?? []).length);
  check("a widget's own run writes no note", writes === 0);
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
