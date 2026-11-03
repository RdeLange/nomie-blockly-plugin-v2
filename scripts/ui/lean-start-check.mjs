// A launch of the plugin whose workspaces are all compiled loads no Blockly (phase 16): the stored code runs the
// workspaces, and the list and the run need nothing from the compiler. Runs against fake-nomie.js, which keeps its
// stored state in localStorage, so a second page in the same browser context is a second launch.
import { readFileSync } from 'node:fs';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const server = await createServer({ logLevel: 'error' });
await server.listen();
const url = server.resolvedUrls.local[0];
const browser = await chromium.launch();
const errors = [];
const check = (label, ok) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}`);
  if (!ok) process.exitCode = 1;
};
// the modules of Blockly and of the compiler, as the dev server names them
const isBlockly = (u) => /\/src\/blockly\/|blockly[./]|\/blockly\/|compile\.ts/.test(u);

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  await context.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));

  // first launch: add a template (its code is compiled and kept), then the app stores it
  const first = await context.newPage();
  first.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  const firstRequests = [];
  first.on('request', (r) => firstRequests.push(r.url()));
  await first.goto(url);
  await first.getByRole('button', { name: 'Add', exact: true }).click();
  await first.locator('.row', { hasText: 'Retrieve Data Example' }).getByRole('button', { name: 'Add' }).first().click();
  await first.waitForTimeout(800);
  // the detector works: the first launch compiles the template, so it does request the compiler
  check('the detector sees the compiler when it is needed', firstRequests.some(isBlockly));
  await first.close();

  // second launch: nothing of Blockly is requested, and a run from the list uses the stored code
  const second = await context.newPage();
  second.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  const requested = [];
  second.on('request', (r) => requested.push(r.url()));
  await second.goto(url);
  await second.locator('.card', { hasText: 'Retrieve Data Example' }).waitFor({ timeout: 15000 });
  const stored = await second.evaluate(async () => {
    const { appState } = await import('/src/app/state.svelte.ts');
    return appState.workspaces.map((w) => ({ compiled: Boolean(w.compiledFrom), runnable: w.runnable }));
  });
  check('the stored workspace is compiled, and runnable', stored.length === 1 && stored[0].compiled && stored[0].runnable === true);
  await second.locator('.card', { hasText: 'Retrieve Data Example' }).getByRole('button', { name: 'Run', exact: true }).click();
  await second.waitForTimeout(1500);
  const blockly = requested.filter(isBlockly);
  check(`a launch with compiled workspaces requests no Blockly module (${blockly.length} requested)`, blockly.length === 0);
  if (blockly.length) console.log(blockly.join('\n'));
  await second.close();
} finally {
  await browser.close();
  await server.close();
}
const real = errors.filter((e) => e !== 'Failed to fetch');
if (real.length) {
  console.error('page errors:\n' + real.join('\n'));
  process.exitCode = 1;
}
