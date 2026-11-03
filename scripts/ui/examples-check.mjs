// The example library (phase 21): the Add screen lists the examples after the templates; an example adds a workspace
// whose Detailed tab holds its tutorial, and whose blocks are on the canvas. Runs against fake-nomie.js, at 1440 x 900
// and 390 x 844.
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

const newPage = async (viewport) => {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  await context.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  await context.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
  const page = await context.newPage();
  page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  await page.goto(url);
  return { context, page };
};

try {
  const { context, page } = await newPage({ width: 1440, height: 900 });
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  const examples = page.locator('.row', { hasText: 'Example: ' });
  const count = await examples.count();
  check(`the Add screen lists the examples (${count})`, count >= 25);
  await page.locator('.row', { hasText: 'Example: Hello, console' }).getByRole('button', { name: 'Add' }).click();
  await page.getByText('Added "Example: Hello, console"').first().waitFor({ timeout: 5000 }).catch(() => undefined);
  check('adding an example says so', (await page.getByText('Added "Example: Hello, console"').count()) >= 1);
  await page.screenshot({ path: 'screenshots/examples-add-desktop.png' });

  // the workspace is in the list; its Edit opens the editor, and the Detailed tab holds the tutorial
  await page.locator('.card', { hasText: 'Example: Hello, console' }).getByRole('button', { name: 'Edit' }).first().click();
  await page.locator('.ed-toolbar').waitFor({ timeout: 15000 });
  await page.waitForTimeout(800);
  await page.getByRole('tab', { name: 'Detailed' }).click();
  const tutorial = await page.getByLabel('Detailed description').inputValue();
  check('the Detailed tab holds the tutorial of the example', tutorial.startsWith('In this first example'));
  await page.getByRole('tab', { name: 'Details' }).click();
  await context.close();

  const phone = await newPage({ width: 390, height: 844 });
  await phone.page.getByRole('button', { name: 'Add', exact: true }).click();
  await phone.page.locator('.row', { hasText: 'Example: Hello, console' }).waitFor({ timeout: 15000 });
  await phone.page.screenshot({ path: 'screenshots/examples-add-phone.png' });
  check('on a phone the examples are listed too', (await phone.page.locator('.row', { hasText: 'Example: ' }).count()) >= 25);
  await phone.context.close();
} finally {
  await browser.close();
  await server.close();
}
const real = errors.filter((e) => e !== 'Failed to fetch');
if (real.length) {
  console.error('page errors:\n' + real.join('\n'));
  process.exitCode = 1;
}
