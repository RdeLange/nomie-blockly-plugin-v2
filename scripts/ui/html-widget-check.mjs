// The HTML widget (phase 20): an HTML block with a parameter is drawn in the preview as a frame with no scripts, the
// placeholder is filled, and a script in the HTML is removed. Runs against fake-nomie.js, at 1440 x 900 (the phone: phone-list-check.mjs).
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
// a dashboard widget with one HTML block: "Mood 6" from the placeholder, and a script that must be removed
const PROGRAM = `<xml ${NS}><block type="s4eblocklyframe" x="40" y="40"><field name="NAME">none</field><statement name="script">
  <block type="s4e_dashboard"><field name="NAME">Mood</field><field name="EMOJI">📊</field><statement name="CONTENT">
    <block type="s4e_whtml"><field name="HTML">&lt;p&gt;Mood &lt;b&gt;{{mood}}&lt;/b&gt;&lt;/p&gt;&lt;script&gt;bad()&lt;/script&gt;</field>
      <statement name="PARAMS"><block type="s4e_wparam"><field name="NAME">mood</field><value name="VALUE"><block type="math_number"><field name="NUM">6</field></block></value></block></statement>
    </block>
  </statement></block>
</statement></block></xml>`;

const openEditor = async (context, viewport) => {
  const page = await context.newPage();
  page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  await page.goto(url);
  // the examples are listed on their own tab; adding one offers its workspace in a notice
  await page.getByRole('tab', { name: /^Examples/ }).click();
  await page.locator('.example', { hasText: 'Example: Yesterday in one number' }).getByRole('button', { name: 'Add', exact: true }).click();
  await page.locator('.notice').getByRole('button', { name: 'Open', exact: true }).click();
  await page.locator('.ed-toolbar').waitFor({ timeout: 15000 });
  await page.waitForTimeout(800);
  // the program goes on the canvas; the Preview tab appears because a widget block is there
  await page.evaluate(async (xml) => {
    const { Blockly } = await import('/src/blockly/setup.ts');
    const ws = Blockly.getMainWorkspace();
    ws.clear();
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), ws);
  }, PROGRAM);
  await page.waitForTimeout(500);
  return page;
};

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await context.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  await context.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));

  let page = await openEditor(context, { width: 1440, height: 900 });
  // the preview is under the run, in the Run tab
  await page.getByRole('tab', { name: 'Run' }).click();
  await page.getByRole('button', { name: 'Show preview' }).click();
  await page.locator('.ed-preview iframe.wd-html').waitFor({ timeout: 15000 });
  const frame = page.locator('.ed-preview iframe.wd-html');
  check('the HTML is a frame with no sandbox permissions', (await frame.getAttribute('sandbox')) === '');
  const srcdoc = (await frame.getAttribute('srcdoc')) ?? '';
  check('the placeholder is filled with the parameter', srcdoc.includes('<p>Mood <b>6</b></p>'));
  check('the script in the HTML is removed', !/<script/i.test(srcdoc) && !srcdoc.includes('bad()'));
  check('the frame has the policy that allows only https images', srcdoc.includes("img-src https:"));
  await page.screenshot({ path: 'screenshots/html-widget-desktop.png' });
  await page.close();

  // the phone is checked in phone-list-check.mjs: a phone shows the list only, not the editor
} finally {
  await browser.close();
  await server.close();
}
const real = errors.filter((e) => e !== 'Failed to fetch');
if (real.length) {
  console.error('page errors:\n' + real.join('\n'));
  process.exitCode = 1;
}
