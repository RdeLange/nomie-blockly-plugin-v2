// The languages of the Nomie user (phase 18): Nomie sends Dutch, German or Italian, and the plugin's screens, the editor's
// toolbar and tabs, and a standard Blockly block (the repeat block in the Loops drawer) show that language.
// Runs against fake-nomie.js, which sends the language in `registered`.
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

// the words each language shows: the list's Add, the card's Edit, the editor's Save and Run, and Blockly's repeat block
const LANGS = [
  { code: 'nl', add: 'Toevoegen', edit: 'Bewerken', save: 'Opslaan', run: 'Uitvoeren', repeat: 'keer herhalen' },
  { code: 'de', add: 'Hinzufügen', edit: 'Bearbeiten', save: 'Speichern', run: 'Ausführen', repeat: 'wiederhole' },
  { code: 'it', add: 'Aggiungi', edit: 'Modifica', save: 'Salva', run: 'Esegui', repeat: 'ripeti' },
];

try {
  for (const lang of LANGS) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    await context.addInitScript({ content: `window.__fakeLanguage = "${lang.code}";` });
    await context.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
    await context.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
    const page = await context.newPage();
    page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
    await page.goto(url);

    check(`${lang.code}: the list is translated`, (await page.getByRole('button', { name: lang.add, exact: true }).count()) === 1);
    await page.getByRole('button', { name: lang.add, exact: true }).click();
    await page.locator('.row', { hasText: 'Retrieve Data Example' }).getByRole('button', { name: lang.add }).first().click();
    await page.locator('.card', { hasText: 'Retrieve Data Example' }).filter({ has: page.getByRole('button', { name: lang.edit }) }).first().getByRole('button', { name: lang.edit }).click();
    await page.locator('.ed-toolbar').waitFor({ timeout: 15000 });

    check(`${lang.code}: the editor toolbar is translated`, (await page.getByRole('button', { name: lang.save, exact: true }).count()) === 1);
    check(`${lang.code}: the editor tabs are translated`, (await page.getByRole('tab', { name: lang.run }).count()) === 1);

    // a standard block: the repeat block's text in the Loops drawer (Blockly's own table, in this language)
    await page.locator('.blocklyToolboxCategory', { hasText: 'Loops' }).click();
    await page.waitForFunction((word) => document.querySelector('.blocklyFlyout')?.textContent?.replace(/\s/g, ' ').includes(word), lang.repeat, { timeout: 10000 }).catch(() => undefined);
    const flyout = (await page.locator('.blocklyFlyout').allTextContents()).join(' ').replace(/\s/g, ' ');
    check(`${lang.code}: a standard block shows its text in this language`, flyout.includes(lang.repeat));
    if (lang.code === 'de') await page.screenshot({ path: 'screenshots/language-de.png' });
    await context.close();
  }
} finally {
  await browser.close();
  await server.close();
}
const real = errors.filter((e) => e !== 'Failed to fetch');
if (real.length) {
  console.error('page errors:\n' + real.join('\n'));
  process.exitCode = 1;
}
