// The Nomie widget (phase 15): a workspace that set a value shows as a tile with its label, the value and when it was
// set, with a Run button. Runs against fake-nomie.js, in the widget's own frame size.
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

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  await page.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  await page.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
  await page.goto(url);

  // add the widget template and run it from its card: it sets the value on the widget
  await addExample(page, 'Example: Dashboard widget with a value');
  await page.goto(url);
  await page.locator('.card', { hasText: 'Example: Dashboard widget with a value' }).getByRole('button', { name: 'Run', exact: true }).click();
  // the run saves its value with the stored state: read it there (the app's own state is read in the page too)
  const storedWidget = () => page.evaluate(() => {
    const store = JSON.parse(window.localStorage.getItem('fake-nomie-store') ?? '{}');
    return Object.values(store.blockly?.widget ?? {})[0];
  });
  await page.waitForFunction(() => {
    const store = JSON.parse(window.localStorage.getItem('fake-nomie-store') ?? '{}');
    return Object.keys(store.blockly?.widget ?? {}).length > 0;
  }, null, { timeout: 30000 });
  const saved = await storedWidget();
  check('the run keeps its value for the widget', saved.components?.[0]?.label === '7-day average' && saved.components[0].value.length > 0);

  // the widget opens (its own frame): it shows the value as a tile
  await page.evaluate(() => window.__nomie.fireWidget());
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => document.querySelector('.widget-tile') !== null, null, { timeout: 10000 });
  const tile = page.locator('.widget-tile');
  check('the widget shows the label', (await tile.locator('.widget-label').textContent()) === '7-day average');
  check('the widget shows the value', (await tile.locator('.widget-value').textContent()) === saved.components[0].value);
  check('the widget says when it was set', (await tile.locator('.widget-time').textContent()).startsWith('updated '));
  check('the tile has a Run button', (await tile.getByRole('button', { name: 'Run' }).count()) === 1);
  await page.screenshot({ path: 'screenshots/widget-view.png' });
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
