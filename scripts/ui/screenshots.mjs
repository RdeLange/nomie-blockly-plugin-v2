// Screenshots of the editor at desktop and phone size, for checking the look after a UI change.
// Starts its own Vite dev server, opens the "Example: Yesterday in one number" template in the editor, and saves
// screenshots/editor-desktop.png (1440x900), editor-laptop.png (1100x800) and editor-phone.png (390x844).
// Usage: node scripts/ui/screenshots.mjs [name]   (name is an optional suffix, e.g. "phase5")
import { mkdirSync } from 'node:fs';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const suffix = process.argv[2] ? `-${process.argv[2]}` : '';
const SIZES = [
  ['desktop', { width: 1440, height: 900 }],
  ['laptop', { width: 1100, height: 800 }],
  ['phone', { width: 390, height: 844 }],
];

mkdirSync('screenshots', { recursive: true });
const server = await createServer({ server: { port: 5010, strictPort: false }, logLevel: 'error' });
await server.listen();
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch();
const errors = [];
// requests to other hosts that failed (the Nomie SDK, Blockly media): reported, not counted as errors
const external = new Set();

try {
  for (const [name, viewport] of SIZES) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
    page.on('requestfailed', (r) => {
      if (!r.url().startsWith(url)) external.add(new URL(r.url()).host);
    });
    // "Failed to fetch" is what a blocked request to another host shows; everything else is a real error
    page.on('pageerror', (e) => {
      if (e.message !== 'Failed to fetch') errors.push(`${name}: ${e.message}`);
    });
    await page.goto(url, { waitUntil: 'load' });
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    // the Add button in the template row of "Example: Yesterday in one number"
    const row = page.locator('.row', { hasText: 'Example: Yesterday in one number' }).filter({ has: page.getByRole('button', { name: 'Add' }) });
    await row.getByRole('button', { name: 'Add' }).first().click();
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await page.waitForTimeout(1500);
    const file = `screenshots/editor-${name}${suffix}.png`;
    await page.screenshot({ path: file });
    console.log('saved', file);
    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}
if (external.size) console.log('note: requests to these hosts failed:', [...external].join(', '));
if (errors.length) {
  console.error('page errors:\n' + errors.join('\n'));
  process.exitCode = 1;
}
