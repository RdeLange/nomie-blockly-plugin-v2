// Runs in the browser with a stand-in for Nomie (fake-nomie.js): Run for days in the Run tab, the status of a run on
// the canvas, Stop inside an endless loop, and the console. Screenshots go to screenshots/.
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
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  // the real SDK script is not needed: the stand-in is already there
  await page.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
  await page.goto(url);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.locator('.row', { hasText: 'Retrieve Data Example' }).getByRole('button', { name: 'Add' }).first().click();
  await page.getByRole('button', { name: 'Edit' }).first().click();
  await page.waitForTimeout(1200);

  // Run for days: three days, each shown with its result
  await page.getByRole('tab', { name: /Run/ }).click();
  const from = new Date();
  from.setDate(from.getDate() - 3);
  const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  await page.getByLabel('From').fill(key(from));
  await page.getByRole('button', { name: 'Run', exact: true }).last().click();
  await page.waitForTimeout(2500);
  await page.getByRole('tab', { name: /Run/ }).click();
  const rows = await page.locator('.ed-day').allTextContents();
  check(`Run for days lists 3 days (${rows.length})`, rows.length === 3 && rows.every((r) => r.includes('ok')));
  check('each day shows its message', rows[0].includes('Your average mood score yesterday was'));
  await page.screenshot({ path: 'screenshots/run-days.png' });

  // a day opens in the Console tab
  await page.locator('.ed-day').first().click();
  const consoleText = await page.locator('.ed-console').textContent();
  check('a day opens its output in the Console tab', consoleText.startsWith(`— ${key(from)} —`));

  // an endless loop: the status on the canvas counts steps, and Stop ends it
  await page.evaluate(async () => {
    const { Blockly } = await import('/src/blockly/setup.ts');
    const xml = '<xml xmlns="https://developers.google.com/blockly/xml"><block type="controls_whileUntil" x="40" y="420"><field name="MODE">WHILE</field><value name="BOOL"><block type="logic_boolean"><field name="BOOL">TRUE</field></block></value></block></xml>';
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), Blockly.getMainWorkspace());
  });
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Run', exact: true }).first().click();
  // the step limit ends the loop about 1.5 s after it starts, so read the status as soon as it shows
  const statusEl = page.locator('.run-status');
  await statusEl.waitFor({ state: 'visible', timeout: 5000 });
  const status = await statusEl.textContent();
  check(`the canvas shows the run's progress ("${status.trim()}")`, /Running · step [\d,.]+/.test(status.trim()));
  await page.screenshot({ path: 'screenshots/run-status.png' });
  const started = Date.now();
  await page.getByRole('button', { name: 'Stop' }).first().click();
  await page.locator('.run-status').waitFor({ state: 'detached', timeout: 3000 });
  check(`Stop ends an endless loop (${Date.now() - started} ms)`, Date.now() - started < 3000);
  check('the console says it stopped', (await page.locator('.ed-console').textContent()).includes('<< Stopped >>'));
} finally {
  await browser.close();
  await server.close();
}
const real = errors.filter((e) => e !== 'Failed to fetch');
if (real.length) {
  console.error('page errors:\n' + real.join('\n'));
  process.exitCode = 1;
}
