import { chromium } from '@playwright/test';
import fs from 'fs';

const TARGET_URL = 'https://backend-gold-omega-57.vercel.app/';

async function run() {
  console.log('--- STARTING SMOKE TEST & SYSTEM MAPPING ---');
  console.log('Target URL:', TARGET_URL);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleLogs = [];
  const networkRequests = [];
  const failedRequests = [];

  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') console.log('Console Error:', msg.text());
  });
  page.on('pageerror', err => {
    consoleLogs.push({ type: 'pageerror', text: err.message, stack: err.stack });
    console.log('Page Error:', err.message);
  });
  page.on('requestfailed', req => {
    failedRequests.push({ url: req.url(), failure: req.failure() });
  });
  page.on('response', res => {
    networkRequests.push({ url: res.url(), status: res.status() });
  });

  console.log('Navigating to page...');
  const t0 = Date.now();
  const response = await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
  const loadTimeMs = Date.now() - t0;
  console.log(`Page loaded in ${loadTimeMs}ms with status ${response.status()}`);

  await page.waitForTimeout(2500);

  await page.screenshot({ path: 'qa/screenshots/01_desktop_home_initial.png', fullPage: true });
  console.log('Screenshot saved to qa/screenshots/01_desktop_home_initial.png');

  const pageTitle = await page.title();
  const textContent = await page.evaluate(() => document.body.innerText);

  const elements = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('div[role="button"], button, a')).map(el => ({
      text: el.innerText ? el.innerText.trim().replace(/\n/g, ' ') : '',
      ariaLabel: el.getAttribute('aria-label') || '',
      role: el.getAttribute('role') || el.tagName.toLowerCase()
    })).filter(b => b.text || b.ariaLabel);

    const inputs = Array.from(document.querySelectorAll('input, textarea')).map(el => ({
      placeholder: el.getAttribute('placeholder') || '',
      type: el.getAttribute('type') || '',
      value: el.value || ''
    }));

    const storageData = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      storageData[k] = window.localStorage.getItem(k);
    }

    return { buttonsCount: buttons.length, buttonsSample: buttons.slice(0, 50), inputs, storageData };
  });

  const result = {
    targetURL: TARGET_URL,
    statusCode: response.status(),
    loadTimeMs,
    pageTitle,
    consoleLogs,
    networkRequestsCount: networkRequests.length,
    failedRequests,
    elements,
    hasMarioData: textContent.includes('BCP') || textContent.includes('Efectivo') || textContent.includes('WIN'),
    bodyTextSnippet: textContent.slice(0, 1000)
  };

  fs.writeFileSync('qa/smoke_results.json', JSON.stringify(result, null, 2));
  console.log('Results written to qa/smoke_results.json');
  console.log('hasMarioData:', result.hasMarioData);
  console.log('console errors count:', consoleLogs.filter(l => l.type === 'error' || l.type === 'pageerror').length);

  await browser.close();
}

run().catch(e => { console.error('Error:', e); process.exit(1); });
