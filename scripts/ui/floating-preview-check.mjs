// The floating preview: a card over the canvas that stays open when the workspace is reopened, lets the canvas below
// it keep working, and is hidden on a phone. Runs against fake-nomie.js at 1440 x 900 and then 390 x 844.
import { mkdirSync, readFileSync } from 'node:fs';
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { addExample } from './add-example.mjs';

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
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await context.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  await context.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
  const page = await context.newPage();
  page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  await page.goto(url);
  await addExample(page, 'Example: Dashboard widget with a value');
  await page.locator('.ed-toolbar').waitFor({ timeout: 15000 });
  await page.getByRole('tab', { name: 'Run', exact: true }).click();

  check('the floating preview is off at first', (await page.locator('.ed-float').count()) === 0);
  await page.getByRole('button', { name: 'Float preview', exact: true }).click();
  const card = page.locator('.ed-float');
  await card.waitFor({ timeout: 15000 });
  await page.waitForFunction(() => document.querySelector('.ed-float .dashboard-widget, .ed-float .widget, .ed-float .ed-preview, .ed-float [class*="widget"]') !== null || document.querySelector('.ed-float')?.textContent?.length > 20, null, { timeout: 15000 });
  check('the preview floats over the canvas', (await card.count()) === 1);
  check('the panel says the preview floats', (await page.getByText('The preview floats on the canvas.').count()) === 1);

  // the canvas under the card keeps working: a point on the canvas away from the card is the canvas itself
  const frame = await page.locator('.blockly-frame').boundingBox();
  const cardBox = await card.boundingBox();
  const spot = { x: frame.x + 40, y: frame.y + frame.height - 80 };
  const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('.blockly-host') !== null, spot);
  check('the canvas outside the card still takes clicks', hit && spot.x < cardBox.x);
  check('the card is in the top-right corner of the canvas', cardBox.x > frame.x + frame.width / 2 && cardBox.y < frame.y + 40);

  // dragging moves the card, and it stays on the canvas
  const head = card.locator('.ed-float-head');
  const headBox = await head.boundingBox();
  await page.mouse.move(headBox.x + 30, headBox.y + 10);
  await page.mouse.down();
  await page.mouse.move(headBox.x - 200, headBox.y + 300, { steps: 8 });
  await page.mouse.up();
  const moved = await card.boundingBox();
  check('dragging the header moves the card', Math.abs(moved.x - (cardBox.x - 230)) < 4 && moved.y > cardBox.y + 250);
  await page.screenshot({ path: 'screenshots/floating-preview-desktop.png' });

  // it stays open when the workspace is reopened
  // a reload lands on the list: open the workspace again from its card
  await page.reload();
  await page.locator('.card', { hasText: 'Example: Dashboard widget with a value' }).getByRole('button', { name: 'Edit' }).first().click();
  await page.locator('.ed-toolbar').waitFor({ timeout: 15000 });
  await page.getByRole('tab', { name: 'Run', exact: true }).click();
  await card.waitFor({ timeout: 15000 });
  check('the floating preview stays open when the workspace is reopened', (await card.count()) === 1);

  // Dock puts it back in the panel
  await page.getByRole('button', { name: 'Dock preview', exact: true }).click();
  check('Dock closes the floating preview', (await page.locator('.ed-float').count()) === 0);
  await page.getByRole('button', { name: 'Float preview', exact: true }).click();
  await card.waitFor({ timeout: 15000 });
  await page.locator('.ed-float-close').click();
  check('the close button closes it', (await page.locator('.ed-float').count()) === 0);

  // on a phone the card is not shown, and the canvas has no float button
  await page.getByRole('button', { name: 'Float preview', exact: true }).click();
  await card.waitFor({ timeout: 15000 });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  check('on a phone the floating preview is not drawn', (await page.locator('.ed-float').count()) === 0);
  await page.screenshot({ path: 'screenshots/floating-preview-phone.png' });
} finally {
  await browser.close();
  await server.close();
}
if (errors.length) {
  console.error('page errors:\n' + errors.join('\n'));
  process.exitCode = 1;
}
