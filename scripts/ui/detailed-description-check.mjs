// The detailed description of a workspace: a Detailed tab in the panel holds the text, it stays when the tabs change,
// and Save keeps it with the workspace. Runs against fake-nomie.js, at 1440 x 900 and 390 x 844.
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
const TEXT = 'Logs my mood every morning and shows the week.';

const openEditor = async (viewport) => {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  await context.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  await context.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
  const page = await context.newPage();
  page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  await page.goto(url);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.locator('.row', { hasText: 'Example: Yesterday in one number' }).getByRole('button', { name: 'Add' }).first().click();
  await page.locator('.card', { hasText: 'Example: Yesterday in one number' }).getByRole('button', { name: 'Edit' }).first().click();
  await page.locator('.ed-toolbar').waitFor({ timeout: 15000 });
  await page.waitForTimeout(800);
  return { context, page };
};

try {
  const { context, page } = await openEditor({ width: 1440, height: 900 });
  await page.getByRole('tab', { name: 'Detailed' }).click();
  const box = page.getByLabel('Detailed description');
  await box.fill(TEXT);
  await page.getByRole('tab', { name: 'Run' }).click();
  await page.getByRole('tab', { name: 'Detailed' }).click();
  check('the text stays when the tabs change', (await page.getByLabel('Detailed description').inputValue()) === TEXT);
  await page.screenshot({ path: 'screenshots/detailed-desktop.png' });
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForTimeout(500);
  const stored = await page.evaluate(() => localStorage.getItem('fake-nomie-store') ?? '');
  check('Save keeps the detailed description with the workspace', stored.includes('Logs my mood every morning'));
  await context.close();

  const phone = await openEditor({ width: 390, height: 844 });
  // on a phone the panel is closed until the Details button opens it
  await phone.page.getByRole('button', { name: 'Show details' }).click();
  await phone.page.getByRole('tab', { name: 'Detailed' }).click();
  await phone.page.getByLabel('Detailed description').fill(TEXT);
  check('on a phone the Detailed tab has the text box', (await phone.page.getByLabel('Detailed description').count()) === 1);
  await phone.page.screenshot({ path: 'screenshots/detailed-phone.png' });
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
