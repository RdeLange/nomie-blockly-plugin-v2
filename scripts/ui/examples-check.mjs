// The example library on the list screen: an Examples tab, with the examples in four levels (easy, moderate, complex and
// expert). Adding an example says so at once: the card says Added, a notice offers to open it, and Open shows the
// tutorial in the Detailed tab. Runs against fake-nomie.js, at 1440 x 900 and 390 x 844.
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

const newPage = async (viewport) => {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  await context.addInitScript({ content: readFileSync('scripts/ui/fake-nomie.js', 'utf8') });
  await context.route(/nomie-plugin\.js/, (route) => route.fulfill({ body: '', contentType: 'text/javascript' }));
  const page = await context.newPage();
  page.on('pageerror', (e) => { if (e.message !== 'Failed to fetch') errors.push(e.message); });
  await page.goto(url);
  return { context, page };
};

try {
  const { context, page } = await newPage({ width: 1440, height: 900 });

  // the list opens on the Workspaces tab once there are workspaces; the examples are one tap away
  await page.getByRole('tab', { name: /^Examples/ }).click();
  const cards = page.locator('.example');
  check(`the Examples tab lists the examples (${await cards.count()})`, (await cards.count()) >= 36);
  check('the examples are in four levels', (await page.locator('.level-head').count()) === 4);
  await page.screenshot({ path: 'screenshots/examples-levels-desktop.png' });

  // adding an example: its card says Added, and a notice offers to open it
  const hello = page.locator('.example', { hasText: 'Example: Hello, console' });
  await hello.getByRole('button', { name: 'Add', exact: true }).click();
  const notice = page.locator('.notice');
  await notice.waitFor({ timeout: 5000 });
  check('adding an example says so in a notice', (await notice.innerText()).includes('Added "Example: Hello, console"'));
  check('the card then says Added, with an Open button', (await hello.locator('.tick').count()) === 1 && (await hello.getByRole('button', { name: 'Open', exact: true }).count()) === 1);
  await page.screenshot({ path: 'screenshots/examples-added-desktop.png' });

  // the notice's Open shows the example, and its Detailed tab holds the tutorial
  await notice.getByRole('button', { name: 'Open', exact: true }).click();
  await page.locator('.ed-toolbar').waitFor({ timeout: 15000 });
  await page.waitForTimeout(800);
  await page.getByRole('tab', { name: 'Detailed' }).click();
  const tutorial = await page.getByLabel('Detailed description').inputValue();
  check('the Detailed tab holds the step-by-step tutorial', tutorial.startsWith('What you build: a workspace that writes two lines'));
  check('the tutorial has its numbered steps', (tutorial.match(/^Step \d+:/gm) ?? []).length >= 5);
  await page.getByRole('tab', { name: 'Details' }).click();
  await context.close();

  // on a phone: the same tabs, the same four levels, and the same feedback
  const phone = await newPage({ width: 390, height: 844 });
  await phone.page.locator('.segments').waitFor({ timeout: 15000 });
  await phone.page.getByRole('tab', { name: /^Examples/ }).click();
  check('on a phone the examples are listed too', (await phone.page.locator('.example').count()) >= 36);
  await phone.page.locator('.example', { hasText: 'Example: Mood analyst' }).getByRole('button', { name: 'Add', exact: true }).click();
  await phone.page.locator('.notice').waitFor({ timeout: 5000 });
  await phone.page.screenshot({ path: 'screenshots/examples-phone.png' });
  check('on a phone adding an example gives the notice too', (await phone.page.locator('.notice').count()) === 1);
  await phone.context.close();
} finally {
  await browser.close();
  await server.close();
}
const real = errors.filter((e) => e !== 'Failed to fetch');
if (real.length) {
  console.error('page errors:\n' + real.join('\n'));
  process.exitCode = 1;
}
