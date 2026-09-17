import { chromium } from '@playwright/test';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('https://backend-gold-omega-57.vercel.app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('Testing Net Worth Card Click by aria-label...');
  const nwBtn = page.getByRole('button', { name: 'Abrir detalle del patrimonio' });
  await nwBtn.click();
  await page.waitForTimeout(800);
  const nwOpen = await page.evaluate(() => document.body.innerText.includes('Desglose de activos líquidos'));
  console.log('Net Worth Modal Open:', nwOpen);

  console.log('Navigating to Accounts...');
  await page.getByRole('button', { name: 'Gestionar cuentas' }).click();
  await page.waitForTimeout(800);

  console.log('Testing Adjust Balance by regex...');
  const adjBtn = page.getByRole('button', { name: /Ajustar saldo/ }).first();
  await adjBtn.click();
  await page.waitForTimeout(800);
  const adjOpen = await page.evaluate(() => document.body.innerText.includes('Cuadre de caja'));
  console.log('Adjust Balance Modal Open:', adjOpen);

  await browser.close();
}
test().catch(console.error);
