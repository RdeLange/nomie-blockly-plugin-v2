// The language of the Nomie user (phase 18): Nomie sends Dutch, so the plugin's screens and the editor's toolbar,
// and a standard block of Blockly (the repeat block in the Loops drawer), show Dutch. Runs against fake-nomie.js.
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
  await context.addInitScript({ content: 'window.__fakeLanguage = "nl";' });
  await context.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  await context.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
  const page = await context.newPage();
  page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  await page.goto(url);

  check('the list is in Dutch', (await page.getByRole('button', { name: 'Toevoegen', exact: true }).count()) === 1);
  await page.getByRole('button', { name: 'Toevoegen', exact: true }).click();
  await page.locator('.row', { hasText: 'Retrieve Data Example' }).getByRole('button', { name: 'Toevoegen' }).first().click();
  await page.locator('.card', { hasText: 'Laatste run' }).filter({ hasText: 'Retrieve Data Example' }).first().getByRole('button', { name: 'Bewerken' }).click();
  await page.locator('.ed-toolbar').waitFor({ timeout: 15000 });

  check('the editor toolbar is in Dutch', (await page.getByRole('button', { name: 'Opslaan', exact: true }).count()) === 1);
  check('the editor tabs are in Dutch', (await page.getByRole('tab', { name: 'Uitvoeren' }).count()) === 1);

  // a standard block: the repeat block's text is Dutch in the Loops drawer
  await page.locator('.blocklyToolboxCategory', { hasText: 'Loops' }).click();
  // the drawer draws its blocks a moment after the category opens
  await page.waitForFunction(() => document.querySelector('.blocklyFlyout')?.textContent?.replace(/\s/g, ' ').includes('keer herhalen'), null, { timeout: 10000 }).catch(() => undefined);
  // Blockly writes some spaces as non-breaking spaces: compare with plain ones
  const flyout = (await page.locator('.blocklyFlyout').allTextContents()).join(' ').replace(/\s/g, ' ');
  check('a standard block shows Dutch text (the repeat block)', flyout.includes('keer herhalen'));
  await page.screenshot({ path: 'screenshots/language-nl.png' });
  await context.close();
} finally {
  await browser.close();
  await server.close();
}
const real = errors.filter((e) => e !== 'Failed to fetch');
if (real.length) {
  console.error('page errors:\n' + real.join('\n'));
  process.exitCode = 1;
}
