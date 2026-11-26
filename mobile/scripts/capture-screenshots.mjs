import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIRS = [
  path.resolve('/workspace/docs/screenshots'),
  path.resolve('/opt/cursor/artifacts'),
];

for (const dir of OUT_DIRS) {
  fs.mkdirSync(dir, { recursive: true });
}

const save = async (page, name) => {
  for (const dir of OUT_DIRS) {
    const file = path.join(dir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log('saved', file);
  }
};

const clickTab = async (page, label) => {
  // Tab bar labels appear as text buttons
  const tab = page.getByText(label, { exact: true }).last();
  await tab.click({ timeout: 15000 });
  await page.waitForTimeout(1200);
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();

page.on('pageerror', (err) => console.error('PAGEERROR', err.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') console.error('CONSOLE', msg.text());
});

console.log('goto...');
await page.goto('http://localhost:8081', { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(2500);

// Wait for Bill Lens brand or Demo Mode button
const demoBtn = page.getByText(/Demo Mode|Örnek Verilerle Keşfet/i).first();
const brand = page.getByText('Bill Lens').first();
try {
  await Promise.race([
    demoBtn.waitFor({ timeout: 60000 }),
    brand.waitFor({ timeout: 60000 }),
  ]);
} catch (e) {
  await save(page, '00_error_state');
  const html = await page.content();
  fs.writeFileSync('/tmp/bill-lens-page.html', html);
  console.error('Login UI not found. Saved error screenshot + HTML.');
  await browser.close();
  process.exit(1);
}

await save(page, '01_login');

await demoBtn.click();
await page.waitForTimeout(2000);

// Home greeting
try {
  await page.getByText(/Merhaba/i).first().waitFor({ timeout: 30000 });
} catch {
  await save(page, '02_home_error');
  console.error('Home did not load');
}
await save(page, '02_home');

await clickTab(page, 'Harcamalar');
await save(page, '03_expenses');

await clickTab(page, 'Ürünler');
await save(page, '04_products');

await clickTab(page, 'Tasarruf');
await save(page, '05_savings');

await clickTab(page, 'Ayarlar');
await save(page, '06_settings');

await browser.close();
console.log('done');
