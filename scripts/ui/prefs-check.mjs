// Nomie's preferences while the plugin is open (phase 19): DailyNomie 7 sends prefsChanged when the theme, the colours
// or the language change, and the plugin follows at once: the dark theme, its colours, and the language of the screens.
// Runs against fake-nomie.js: the message is posted to the page the way Nomie posts it to the plugin's frame.
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

// DailyNomie 7's palette (src/style/plugin-colours.ts), as the app passes it in prefs.colours
const LIGHT = { page: '#F2F2F7', card: '#FFFFFF', cardInner: '#F2F2F7', text: '#000000', textSecondary: '#636368', separator: '#D8D8DC', fill: '#E5E5EA', tint: '#0A6CC9', onTint: '#FFFFFF', tintSoft: '#EBF4FD', good: '#1E7A34', goodSoft: '#DDF3E2', danger: '#D70015', onDanger: '#FFFFFF', switchOn: '#34C759', switchOff: '#E3E3E8' };
const DARK = { page: '#000000', card: '#1C1C1E', cardInner: '#2C2C2E', text: '#FFFFFF', textSecondary: '#AEAEB2', separator: '#48484A', fill: '#2C2C2E', tint: '#4DB3FF', onTint: '#000000', tintSoft: '#0B2236', good: '#30D158', goodSoft: '#123620', danger: '#FF6961', onDanger: '#000000', switchOn: '#34C759', switchOff: '#39393D' };
const prefs = (mode, palette, language) => ({ theme: mode, language, colours: { mode, current: palette, light: LIGHT, dark: DARK } });

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await context.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  await context.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
  const page = await context.newPage();
  page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  await page.goto(url);
  await page.getByRole('button', { name: 'Add', exact: true }).waitFor({ timeout: 15000 });

  // Nomie changes to dark, German, with its dark colours
  await page.evaluate((message) => window.postMessage({ action: 'prefsChanged', data: { user: message } }, '*'), prefs('dark', DARK, 'de'));
  await page.waitForFunction(() => document.querySelector('.app')?.classList.contains('dark'), null, { timeout: 5000 });
  check('the app turns dark when the theme changes in Nomie', await page.locator('.app.dark').count() === 1);
  check('the app takes the colours Nomie sends', (await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--nb-canvas').trim())) === '#000000');
  check('the screens follow the language Nomie sends', (await page.getByRole('button', { name: 'Hinzufügen', exact: true }).count()) === 1);
  await page.screenshot({ path: 'screenshots/prefs-dark-de.png' });

  // and back to light, Italian
  await page.evaluate((message) => window.postMessage({ action: 'prefsChanged', data: { user: message } }, '*'), prefs('light', LIGHT, 'it'));
  await page.waitForFunction(() => !document.querySelector('.app')?.classList.contains('dark'), null, { timeout: 5000 });
  check('the app goes back to light', (await page.locator('.app.dark').count()) === 0);
  check('the colours follow the light palette', (await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--nb-canvas').trim())) === '#F2F2F7');
  check('the screens follow the new language', (await page.getByRole('button', { name: 'Aggiungi', exact: true }).count()) === 1);
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
