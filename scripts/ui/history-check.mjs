// The Nomie blocks of phase 13 in the editor: "Pick from Nomie" fills a Tracker field, the history blocks and a link
// run, and a note written in a test run is only said. Runs against fake-nomie.js (window.__nomie holds what it was given).
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

const NS = 'xmlns="https://developers.google.com/blockly/xml"';
const TRACKER = (tag) => `<block type="s4e_trackers"><field name="Trackers">${tag}</field></block>`;
const TEXT = (text) => `<block type="text"><field name="TEXT">${text}</field></block>`;
// days since #mood, shown in the console; then a link; then a note (test runs only say it)
const PROGRAM = `<xml ${NS}>
  <block type="pushto_console" x="40" y="420"><value name="Value"><block type="s4e_dayssince"><value name="Tracker">${TRACKER('#mood')}</value></block></value>
    <next><block type="s4e_openlink"><value name="Value">${TEXT('https://example.com/a')}</value>
      <next><block type="s4e_lognote"><value name="Text">${TEXT('Felt good')}</value><value name="Date"><block type="s4e_daypicker"><field name="Day">today</field></block></value></block></next>
    </block></next>
  </block>
</xml>`;

const openEditor = async (viewport) => {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  await page.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  await page.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
  await page.goto(url);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.locator('.row', { hasText: 'Example: Yesterday in one number' }).getByRole('button', { name: 'Add' }).first().click();
  await page.locator('.card', { hasText: 'Example: Yesterday in one number' }).getByRole('button', { name: 'Edit' }).first().click();
  await page.waitForTimeout(1200);
  return page;
};

try {
  const page = await openEditor({ width: 1440, height: 900 });

  // the drawer's Nomie category shows the new groups
  await page.locator('.blocklyToolboxCategory', { hasText: 'Nomie' }).click();
  await page.waitForTimeout(500);
  const drawer = (await page.locator('.blocklyFlyout').allTextContents()).join(' ');
  check('the drawer has the History group and the notes and places blocks', drawer.includes('HISTORY') && drawer.includes('NOTES AND PLACES'));
  await page.screenshot({ path: 'screenshots/history-drawer.png' });

  // "Pick from Nomie…" fills the Tracker field with the tracker picked in Nomie
  const picked = await page.evaluate(async (xml) => {
    const { Blockly } = await import('/src/blockly/setup.ts');
    const block = Blockly.getMainWorkspace().newBlock('s4e_trackers');
    block.initSvg();
    block.render();
    const field = block.getField('Trackers');
    field.setValue('__pick_from_nomie__');
    await new Promise((r) => setTimeout(r, 400));
    return { value: field.getValue(), pickers: window.__nomie.pickers };
  });
  check('Pick from Nomie fills the Tracker with the tracker picked', picked.value === '#hydration');
  check('the picker is Nomie\'s single-tracker picker', picked.pickers.length === 1 && picked.pickers[0].type === 'tracker' && picked.pickers[0].multiple === false);

  // the program: history, a link and a note, run for real
  await page.evaluate(async (xml) => {
    const { Blockly } = await import('/src/blockly/setup.ts');
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), Blockly.getMainWorkspace());
  }, PROGRAM);
  await page.waitForTimeout(500);
  await page.getByRole('tab', { name: /Run/ }).click().catch(() => undefined);
  await page.getByRole('button', { name: 'Run', exact: true }).first().click();
  await page.waitForFunction(() => /Program complete|Error|Stopped/.test(document.querySelector('.ed-console')?.textContent ?? ''), null, { timeout: 30000 });
  const output = await page.locator('.ed-console').textContent();
  check('days since shows a number of days', /\n\d+\n|\n\d+$/m.test(output) || /^\d+/m.test(output));
  check('the link opens in Nomie for a manual run', await page.evaluate(() => window.__nomie.opened.some((o) => o.url === 'https://example.com/a')));
  check('a real run writes the note', await page.evaluate(() => window.__nomie.created.some((c) => c.note === 'Felt good')));
  await page.screenshot({ path: 'screenshots/history-run.png' });

  // a test run says what the note would be, and writes nothing
  await page.getByRole('tab', { name: /Run/ }).click();
  await page.locator('.ed-switch input[type="checkbox"]').first().check();
  const before = await page.evaluate(() => window.__nomie.created.length);
  await page.getByRole('button', { name: 'Run now' }).click();
  await page.waitForFunction(() => /Program complete|Error|Stopped/.test(document.querySelector('.ed-console')?.textContent ?? ''), null, { timeout: 30000 });
  check('a test run writes no note', (await page.evaluate(() => window.__nomie.created.length)) === before);
  check('a test run says what the note would be', (await page.locator('.ed-console').textContent()).includes('Would write the note "Felt good"'));
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
