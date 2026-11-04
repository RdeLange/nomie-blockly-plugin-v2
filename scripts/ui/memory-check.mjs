// Remembered values and secrets (phase 12): a template asks for its secret before a run, Settings shows the name and
// never the value, a run remembers a value that Details lists, and Forget all clears it. Runs against fake-nomie.js.
import { mkdirSync, readFileSync } from 'node:fs';
import { addExample } from './add-example.mjs';
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

const SECRET_VALUE = 'k3y-value-123';
// remembers streak = 3, as a block that is not in a Scheduler block (it runs once)
const REMEMBER = '<xml xmlns="https://developers.google.com/blockly/xml"><block type="s4e_remember" x="40" y="420"><field name="NAME">streak</field><value name="VALUE"><block type="math_number"><field name="NUM">3</field></block></value></block></xml>';

const openApp = async (viewport) => {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  // a window.confirm outside Nomie is the dev server's stand-in for the Nomie dialog: say yes
  page.on('dialog', (d) => d.accept());
  await page.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  await page.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
  await page.goto(url);
  return page;
};

// adds a template and opens its editor (the card of that name, as the list may hold other workspaces too)
const addAndEdit = async (page, name) => {
  await addExample(page, name);
  await page.waitForTimeout(1200);
};

try {
  const page = await openApp({ width: 1440, height: 900 });

  // a template that needs a secret: the pre-run check asks for it
  await addAndEdit(page, 'Example: Read a web service');
  await page.getByRole('tab', { name: /Run/ }).click();
  const problems = await page.locator('.ed-problems').textContent().catch(() => '');
  check('the pre-run check asks for the secret the template uses', problems.includes('OPENWEATHER_KEY'));

  // Settings: the secret is added; its name shows, its value does not
  await page.getByRole('button', { name: 'Back to workspaces' }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByLabel('Secret name').fill('OPENWEATHER_KEY');
  await page.getByLabel('Secret value').fill(SECRET_VALUE);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForTimeout(300);
  const settings = await page.content();
  check('Settings shows the secret by name, masked', settings.includes('OPENWEATHER_KEY') && settings.includes('••••'));
  check('Settings never shows the value', !settings.includes(SECRET_VALUE));
  await page.screenshot({ path: 'screenshots/secrets-settings.png' });
  await page.getByRole('button', { name: 'Back', exact: true }).click();

  // with the secret in Settings, the warning is gone
  await page.goto(url);
  await page.locator('.card', { hasText: 'Example: Read a web service' }).getByRole('button', { name: 'Edit' }).first().click();
  await page.waitForTimeout(1200);
  await page.getByRole('tab', { name: /Run/ }).click();
  check('with the secret in Settings, the pre-run check has no problem', (await page.locator('.ed-ok').count()) === 1);
  await page.getByRole('button', { name: 'Back to workspaces' }).click();

  // a run remembers a value; Details lists it; Forget all clears it
  await addAndEdit(page, 'Example: Yesterday in one number');
  await page.evaluate(async (xml) => {
    const { Blockly } = await import('/src/blockly/setup.ts');
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), Blockly.getMainWorkspace());
  }, REMEMBER);
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Run', exact: true }).first().click();
  // wait for the run to end (its last line says so, or it failed)
  await page.waitForFunction(() => /Program complete|Error|Stopped/.test(document.querySelector('.ed-console')?.textContent ?? ''), null, { timeout: 30000 }).catch(() => undefined);
  await page.getByRole('tab', { name: /Details/ }).click();
  const remembered = await page.locator('.ed-summary', { hasText: 'Remembered values' }).textContent();
  check('Details lists the value the run remembered', remembered.includes('streak') && remembered.includes('3'));
  await page.screenshot({ path: 'screenshots/memory-details.png' });
  await page.getByRole('button', { name: 'Forget all' }).click();
  await page.waitForTimeout(500);
  const after = await page.locator('.ed-summary', { hasText: 'Remembered values' }).textContent();
  check('Forget all clears the remembered values', after.includes('Nothing yet'));
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
