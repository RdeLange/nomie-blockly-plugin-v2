// Note triggers (phase 14): a When-note workspace is listed with its tracker, a saved note with the tracker runs it and
// the result is logged, and Try with a note runs it in test mode. Runs against fake-nomie.js.
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
// when a note with #run is saved, show the value of #mood in it
const PROGRAM = `<xml ${NS}><block type="s4e_whennote" x="40" y="40"><value name="Tracker">${TRACKER('#run')}</value>
  <statement name="script"><block type="pushto_console"><value name="Value"><block type="s4e_notevalue"><value name="Tracker">${TRACKER('#mood')}</value></block></value></block></statement>
</block></xml>`;

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  page.on('dialog', (d) => d.accept());
  await page.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  await page.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
  await page.goto(url);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.locator('.row', { hasText: 'Example: Yesterday in one number' }).getByRole('button', { name: 'Add' }).first().click();
  await page.locator('.card', { hasText: 'Example: Yesterday in one number' }).getByRole('button', { name: 'Edit' }).first().click();
  await page.waitForTimeout(1200);

  // replace the blocks with a When-note workspace, and save it
  await page.evaluate(async (xml) => {
    // loadWorkspace keeps the trackers the workspace uses (as the editor does when it opens one)
    const { Blockly, loadWorkspace } = await import('/src/blockly/setup.ts');
    const ws = Blockly.getMainWorkspace();
    ws.clear();
    loadWorkspace(ws, xml);
  }, PROGRAM);
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForTimeout(300);
  await page.getByRole('tab', { name: /Run/ }).click();
  check('the Run tab offers Try with a note', (await page.getByPlaceholder('#mood(2) #run').count()) === 1);
  await page.getByRole('tab', { name: /Details/ }).click();
  check('the editor says when it runs', (await page.locator('.ed-summary', { hasText: 'Runs when #run is logged' }).count()) === 1);
  await page.getByRole('tab', { name: /Run/ }).click();

  // Try with a note: test mode, nothing written, the value shown
  const created = () => page.evaluate(() => window.__nomie.created.length);
  const before = await created();
  await page.getByPlaceholder('#mood(2) #run').fill('#run #mood(2)');
  await page.getByRole('button', { name: 'Try', exact: true }).click();
  await page.waitForFunction(() => /Program complete|Error|Stopped/.test(document.querySelector('.ed-console')?.textContent ?? ''), null, { timeout: 30000 });
  const tried = await page.locator('.ed-console').textContent();
  check('Try with a note shows the value of the note', /^2$|\n2\n|\n2$/m.test(tried));
  check('Try with a note writes nothing', (await created()) === before);
  await page.screenshot({ path: 'screenshots/note-try.png' });

  // back to the list: the card says what it runs on
  await page.getByRole('button', { name: 'Back to workspaces' }).click();
  await page.waitForTimeout(300);
  check('the list says the workspace runs when #run is logged', (await page.locator('.card', { hasText: 'Runs when #run is logged' }).count()) === 1);
  await page.screenshot({ path: 'screenshots/note-list.png' });

  // a note saved in Nomie with the tracker starts the workspace, and the run is logged
  await page.evaluate(() => window.__nomie.fireNote({
    id: 'note-1',
    note: '#run #mood(5)',
    end: new Date().toISOString(),
    elements: [
      { type: 'tracker', id: 'run', prefix: '#' },
      { type: 'tracker', id: 'mood', prefix: '#', value: 5 },
    ],
  }));
  await page.waitForFunction(() => false, null, { timeout: 1500 }).catch(() => undefined);
  const logged = await page.evaluate(async () => {
    const { appState } = await import('/src/app/state.svelte.ts');
    return appState.centralLog;
  });
  check('a saved note with the tracker runs the workspace, and the run is logged', logged.includes('ran for #run #mood'));
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
