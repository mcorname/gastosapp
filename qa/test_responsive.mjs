import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const VIEWPORTS = [
  { name: 'iphone_se_1st', width: 320, height: 568, device: 'iPhone SE (1st gen)' },
  { name: 'android_common', width: 360, height: 800, device: 'Android Common' },
  { name: 'iphone_se_2nd', width: 375, height: 667, device: 'iPhone SE (2nd/3rd gen)' },
  { name: 'iphone_12_14', width: 390, height: 844, device: 'iPhone 12/13/14' },
  { name: 'pixel_7', width: 412, height: 915, device: 'Pixel 7 / Galaxy S20+' },
  { name: 'iphone_15_pro_max', width: 430, height: 932, device: 'iPhone 14/15 Pro Max' },
  { name: 'ipad_mini_portrait', width: 768, height: 1024, device: 'iPad Mini (Portrait)' },
  { name: 'ipad_air_portrait', width: 820, height: 1180, device: 'iPad Air (Portrait)' },
  { name: 'ipad_landscape', width: 1024, height: 768, device: 'iPad (Landscape)' },
  { name: 'laptop_hd', width: 1280, height: 720, device: 'HD Laptop' },
  { name: 'laptop_common', width: 1366, height: 768, device: 'Common Laptop' },
  { name: 'macbook_air', width: 1440, height: 900, device: 'MacBook Air 13"' },
  { name: 'desktop_fhd', width: 1920, height: 1080, device: 'Full HD Desktop' }
];

const TARGET_URL = process.env.TEST_URL || 'http://localhost:3001';
const SCREENSHOT_DIR = path.resolve('qa/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runResponsiveTests() {
  console.log('--- STARTING RESPONSIVE AUDIT (13 VIEWPORTS) ---');
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const vp of VIEWPORTS) {
    console.log(`\nTesting ${vp.device} (${vp.width}x${vp.height})...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: vp.width < 768 
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleLogs.push(msg.text());
    });

    const startTime = Date.now();
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500); // allow layout to stabilize

    // Overflow analysis
    const overflowMetrics = await page.evaluate((width) => {
      const docEl = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
      const clientWidth = docEl.clientWidth;
      const hasHorizontalScroll = scrollWidth > clientWidth;

      // Find offending elements overflowing viewport
      const overflowingElements = [];
      const allElements = document.querySelectorAll('*');
      for (const el of allElements) {
        const rect = el.getBoundingClientRect();
        if (rect.right > width + 1) { // 1px threshold for subpixel rounding
          overflowingElements.push({
            tag: el.tagName.toLowerCase(),
            id: el.id || undefined,
            className: (el.className && typeof el.className === 'string') ? el.className.split(' ').slice(0, 3).join(' ') : undefined,
            text: el.innerText ? el.innerText.slice(0, 40).replace(/\n/g, ' ') : undefined,
            rect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), right: Math.round(rect.right) },
            overflowAmount: Math.round(rect.right - width)
          });
        }
      }

      // Check bottom bar / navigation visibility
      const navButtons = Array.from(document.querySelectorAll('div, button'))
        .filter(el => ['Inicio', 'Movimientos', 'Cuentas', 'Análisis', 'Ajustes'].includes(el.innerText?.trim()))
        .map(el => {
          const r = el.getBoundingClientRect();
          return {
            text: el.innerText.trim(),
            visible: r.width > 0 && r.height > 0 && r.top < window.innerHeight && r.bottom > 0,
            rect: { y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }
          };
        });

      return {
        clientWidth,
        scrollWidth,
        hasHorizontalScroll,
        overflowPixels: scrollWidth - clientWidth,
        overflowingElementsCount: overflowingElements.length,
        topOverflowingElements: overflowingElements.slice(0, 5),
        navButtons: navButtons.slice(0, 5)
      };
    }, vp.width);

    const screenshotFile = `vp_${vp.name}_${vp.width}x${vp.height}.png`;
    const screenshotPath = path.join(SCREENSHOT_DIR, screenshotFile);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const duration = Date.now() - startTime;
    const vpResult = {
      name: vp.name,
      device: vp.device,
      width: vp.width,
      height: vp.height,
      hasHorizontalScroll: overflowMetrics.hasHorizontalScroll,
      overflowPixels: overflowMetrics.overflowPixels,
      topOverflowingElements: overflowMetrics.topOverflowingElements,
      navButtons: overflowMetrics.navButtons,
      screenshot: screenshotFile,
      consoleErrors: consoleLogs,
      durationMs: duration,
      status: overflowMetrics.hasHorizontalScroll ? 'FAIL_OVERFLOW' : 'PASS'
    };

    results.push(vpResult);
    console.log(`  -> Status: ${vpResult.status}, Overflow: ${vpResult.overflowPixels}px, Screenshot: ${screenshotFile}`);

    await context.close();
  }

  await browser.close();
  fs.writeFileSync('qa/responsive_results.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('\n--- RESPONSIVE AUDIT COMPLETED. Saved qa/responsive_results.json ---');
}

runResponsiveTests().catch(err => {
  console.error('Responsive test fatal error:', err);
  process.exit(1);
});
