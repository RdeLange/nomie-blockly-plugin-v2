// The editor's panel: the Run tab with a problem in it (desktop), and the panel as a sheet on a phone.
import { mkdirSync } from 'node:fs';
import { addExample } from './add-example.mjs';
import { createServer } from 'vite';
import { chromium } from 'playwright';

mkdirSync('screenshots', { recursive: true });
const server = await createServer({ logLevel: 'error' });
await server.listen();
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch();
const errors = [];

const openEditor = async (viewport) => {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  // no network in CI: the real SDK script is not needed here
  await page.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
  await page.goto(url);
  await addExample(page, 'Example: Yesterday in one number');
  await page.waitForTimeout(1200);
  return page;
};

try {
  const desktop = await openEditor({ width: 1440, height: 900 });
  // a loose data block without a tracker: one error and one warning
  await desktop.evaluate(async () => {
    const { Blockly } = await import('/src/blockly/setup.ts');
    const block = Blockly.getMainWorkspace().newBlock('s4e_dayvalue');
    block.initSvg();
    block.render();
    block.moveBy(560, 260);
  });
  await desktop.getByRole('tab', { name: /Run/ }).click();
  await desktop.waitForTimeout(400);
  await desktop.screenshot({ path: 'screenshots/panel-run.png' });
  console.log('Run tab problems:', await desktop.locator('.ed-problem').count(), '| badge:', await desktop.locator('.ed-badge').textContent());

  const phone = await openEditor({ width: 390, height: 844 });
  await phone.getByRole('button', { name: 'Show details' }).click();
  await phone.waitForTimeout(400);
  await phone.screenshot({ path: 'screenshots/panel-phone.png' });
  await phone.getByRole('button', { name: 'Close the panel' }).click();
  console.log('phone sheet closes:', (await phone.locator('.ed-panel').count()) === 0);
} finally {
  await browser.close();
  await server.close();
}
if (errors.length) {
  console.error('page errors:\n' + errors.join('\n'));
  process.exitCode = 1;
}
