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

// the words each language shows: the list's Add, the card's Edit, the editor's Save, Run and Detailed tabs, the
// Settings screen's Import and add, and Blockly's repeat block
const LANGS = [
  { code: 'nl', open: 'Openen', add: 'Toevoegen', edit: 'Bewerken', save: 'Opslaan', run: 'Uitvoeren', detailed: 'Uitgebreid', settings: 'Instellingen', importAdd: 'Importeren en toevoegen', repeat: 'keer herhalen', loops: 'Lussen', yesterday: 'Voorbeeld: Gisteren in één getal', example: 'Voorbeeld: Hallo, console', readNotes: 'LEES JE NOTITIES', open: 'Openen' },
  { code: 'de', open: 'Öffnen', add: 'Hinzufügen', edit: 'Bearbeiten', save: 'Speichern', run: 'Ausführen', detailed: 'Ausführlich', settings: 'Einstellungen', importAdd: 'Importieren und hinzufügen', repeat: 'wiederhole', loops: 'Schleifen', yesterday: 'Beispiel: Gestern als eine Zahl', example: 'Beispiel: Hallo, Konsole', readNotes: 'NOTIZEN LESEN', open: 'Öffnen' },
  { code: 'it', open: 'Apri', add: 'Aggiungi', edit: 'Modifica', save: 'Salva', run: 'Esegui', detailed: 'Approfondita', settings: 'Impostazioni', importAdd: 'Importa e aggiungi', repeat: 'ripeti', loops: 'Cicli', yesterday: 'Esempio: Ieri in un numero', example: 'Esempio: Ciao, console', readNotes: 'LEGGI LE NOTE', open: 'Apri' },
  { code: 'es', open: 'Abrir', add: 'Añadir', edit: 'Editar', save: 'Guardar', run: 'Ejecutar', loops: 'Bucles', yesterday: 'Ejemplo: Ayer en un número', example: 'Ejemplo: Hola, consola', readNotes: 'LEE TUS NOTAS', detailed: 'Detallada', settings: 'Ajustes', importAdd: 'Importar y añadir', repeat: 'repetir' },
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

    // the list is translated: its Add button, and the Add of each example card on the Examples tab
    check(`${lang.code}: the list is translated`, (await page.getByRole('button', { name: lang.add, exact: true }).count()) >= 1);
    // the Settings screen: its import buttons
    await page.getByRole('button', { name: lang.settings, exact: true }).click();
    check(`${lang.code}: the Settings screen is translated`, (await page.getByRole('button', { name: lang.importAdd, exact: true }).count()) === 1);
    await page.goto(url);
    // the examples are in the language too (phase 22): the second tab of the list is the Examples
    await page.getByRole('tab').nth(1).click();
    await page.getByText(lang.example).first().waitFor({ timeout: 5000 }).catch(() => undefined);
    check(`${lang.code}: the examples are translated`, (await page.getByText(lang.example).count()) >= 1);
    await page.locator('.example', { hasText: lang.yesterday }).getByRole('button', { name: lang.add, exact: true }).click();
    // the notice offers to open the new workspace
    await page.locator('.notice').getByRole('button', { name: lang.open, exact: true }).click();
    await page.locator('.ed-toolbar').waitFor({ timeout: 15000 });

    check(`${lang.code}: the editor toolbar is translated`, (await page.getByRole('button', { name: lang.save, exact: true }).count()) === 1);
    check(`${lang.code}: the editor tabs are translated`, (await page.getByRole('tab', { name: lang.run }).count()) === 1);
    check(`${lang.code}: the Detailed tab is translated`, (await page.getByRole('tab', { name: lang.detailed }).count()) === 1);

    // a standard block: the repeat block's text in the Loops drawer (Blockly's own table, in this language)
    await page.locator('.blocklyToolboxCategory', { hasText: lang.loops }).click();
    await page.waitForFunction((word) => document.querySelector('.blocklyFlyout')?.textContent?.replace(/\s/g, ' ').includes(word), lang.repeat, { timeout: 10000 }).catch(() => undefined);
    const flyout = (await page.locator('.blocklyFlyout').allTextContents()).join(' ').replace(/\s/g, ' ');
    check(`${lang.code}: a standard block shows its text in this language`, flyout.includes(lang.repeat));
    // the Nomie blocks and their group names (phase 22)
    await page.locator('.blocklyToolboxCategory', { hasText: 'Nomie' }).click();
    await page.waitForTimeout(400);
    const nomieFlyout = (await page.locator('.blocklyFlyout').allTextContents()).join(' ').replace(/\s/g, ' ');
    check(`${lang.code}: the Nomie blocks show their group names in this language`, nomieFlyout.includes(lang.readNotes));
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
