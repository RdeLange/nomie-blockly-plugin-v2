// The widget preview (phase 20): the Preview tab, and on a phone the Preview button next to Console, are there only when
// a widget block is on the canvas. The preview is the widget as the dashboard shows it, sized like a dashboard widget.
// Runs against fake-nomie.js, at 1440 x 900 and 390 x 844.
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

const openEditor = async (context, templateName, viewport) => {
  const page = await context.newPage();
  page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  await page.goto(url);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.locator('.row', { hasText: templateName }).getByRole('button', { name: 'Add' }).first().click();
  await page.locator('.card', { hasText: 'Last run' }).filter({ hasText: templateName }).first().getByRole('button', { name: 'Edit' }).click();
  await page.locator('.ed-toolbar').waitFor({ timeout: 15000 });
  await page.waitForTimeout(500);
  return page;
};

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await context.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  await context.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));

  // a workspace with a widget: the Preview tab, and the preview at dashboard size
  let page = await openEditor(context, '7-day mood on the widget', { width: 1440, height: 900 });
  check('a workspace with a widget block has a Preview tab', (await page.getByRole('tab', { name: 'Preview' }).count()) === 1);
  await page.getByRole('tab', { name: 'Preview' }).click();
  await page.locator('.ed-preview .wd').waitFor({ timeout: 15000 });
  check('the preview draws the widget', (await page.locator('.ed-preview .wd').count()) === 1);
  const headBox = await page.locator('.ed-preview .wd-head').boundingBox();
  const runBox = await page.locator('.ed-preview .wd-run').boundingBox();
  const cardBox = await page.locator('.ed-preview .wd').boundingBox();
  check('the Run button sits in the top-right corner of the widget', !!headBox && !!runBox && !!cardBox && runBox.x + runBox.width > cardBox.x + cardBox.width * 0.7 && runBox.y < cardBox.y + 40);
  const mainMin = await page.locator('.ed-preview .wd-main').evaluate((el) => getComputedStyle(el).minHeight);
  check(`the body is at least the dashboard's 90 px (${mainMin})`, mainMin === '90px');
  const radius = await page.locator('.ed-preview .wd').evaluate((el) => getComputedStyle(el).borderRadius);
  check(`the widget has the dashboard's 16 px corners (${radius})`, radius === '16px');
  await page.screenshot({ path: 'screenshots/preview-desktop.png' });
  await page.close();

  // a workspace without a widget: no Preview tab
  page = await openEditor(context, 'Retrieve Data Example', { width: 1440, height: 900 });
  check('a workspace without a widget block has no Preview tab', (await page.getByRole('tab', { name: 'Preview' }).count()) === 0);
  await page.close();

  // the phone: the Preview button is next to Console, only with a widget block
  const phoneContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await phoneContext.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  await phoneContext.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
  page = await openEditor(phoneContext, '7-day mood on the widget', { width: 390, height: 844 });
  const previewButton = page.getByRole('button', { name: 'Preview', exact: true });
  check('on a phone, a widget workspace has the Preview button', (await previewButton.count()) === 1);
  await previewButton.click();
  await page.locator('.ed-preview .wd').waitFor({ timeout: 15000 });
  check('the phone preview draws the widget', (await page.locator('.ed-preview .wd').count()) === 1);
  await page.screenshot({ path: 'screenshots/preview-phone.png' });
  await page.close();
  page = await openEditor(phoneContext, 'Retrieve Data Example', { width: 390, height: 844 });
  check('on a phone, a workspace without a widget has no Preview button', (await page.getByRole('button', { name: 'Preview', exact: true }).count()) === 0);
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
