// Screenshots of the block drawer (the Nomie category) and of a block search, at desktop size.
import { mkdirSync } from 'node:fs';
import { createServer } from 'vite';
import { chromium } from 'playwright';

mkdirSync('screenshots', { recursive: true });
const server = await createServer({ logLevel: 'error' });
await server.listen();
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch();
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  // no network in CI: the real SDK script is not needed here
  await page.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
  await page.goto(url);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.locator('.row', { hasText: 'Retrieve Data Example' }).getByRole('button', { name: 'Add' }).first().click();
  await page.getByRole('button', { name: 'Edit' }).first().click();
  await page.waitForTimeout(1200);
  await page.locator('.blocklyToolboxCategory', { hasText: 'Nomie' }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/drawer-nomie.png' });
  await page.locator('.blocklyToolboxCategory', { hasText: 'Search' }).click();
  await page.waitForTimeout(300);
  await page.getByRole('textbox', { name: 'Search all blocks' }).fill('fetch');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/drawer-search.png' });
  const found = await page.evaluate(async () => {
    const { Blockly } = await import('/src/blockly/setup.ts');
    const flyout = Blockly.getMainWorkspace().getToolbox().getFlyout();
    return flyout.getWorkspace().getTopBlocks(true).map((b) => b.type);
  });
  console.log('search "fetch" shows:', found.join(', '));
} finally {
  await browser.close();
  await server.close();
}
if (errors.length) {
  console.error('page errors:\n' + errors.join('\n'));
  process.exitCode = 1;
}
