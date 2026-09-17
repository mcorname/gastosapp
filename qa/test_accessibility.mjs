import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

const TARGET_URL = 'https://backend-gold-omega-57.vercel.app/';

async function runAccessibilityAudit() {
  console.log('--- STARTING ACCESSIBILITY (WCAG 2.2 AA) AUDIT ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  const auditViews = [];

  // Helper to run axe on current page state
  async function auditCurrentState(viewName) {
    console.log(`Auditing accessibility on: ${viewName}...`);
    try {
      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();

      const summary = {
        view: viewName,
        url: page.url(),
        violationsCount: axeResults.violations.length,
        incompleteCount: axeResults.incomplete.length,
        passesCount: axeResults.passes.length,
        violations: axeResults.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          tags: v.tags,
          description: v.description,
          help: v.help,
          helpUrl: v.helpUrl,
          nodeCount: v.nodes.length,
          nodes: v.nodes.map(n => ({
            html: n.html,
            target: n.target,
            failureSummary: n.failureSummary
          }))
        }))
      };

      auditViews.push(summary);
      console.log(`  -> ${viewName}: ${axeResults.violations.length} violations found.`);
    } catch (e) {
      console.error(`Error auditing ${viewName}:`, e.message);
      auditViews.push({ view: viewName, error: e.message });
    }
  }

  // 1. Home / Dashboard (Desktop)
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await auditCurrentState('Dashboard / Home (Desktop 1280x800)');

  // 2. Movimientos View
  console.log('Navigating to Movimientos...');
  await page.locator('text=Movimientos').first().click();
  await page.waitForTimeout(1500);
  await auditCurrentState('Movimientos Tab');

  // 3. Cuentas View
  console.log('Navigating to Cuentas...');
  await page.locator('text=Cuentas').first().click();
  await page.waitForTimeout(1500);
  await auditCurrentState('Cuentas Tab');

  // 4. Ajustes View
  console.log('Navigating to Ajustes...');
  await page.locator('text=Ajustes').first().click();
  await page.waitForTimeout(1500);
  await auditCurrentState('Ajustes Tab');

  // 5. New Transaction Modal
  console.log('Opening New Transaction Modal...');
  await page.locator('text=Inicio').first().click();
  await page.waitForTimeout(1000);
  const addBtn = page.getByText('+ Nuevo').first();
  if (await addBtn.isVisible()) {
    await addBtn.click();
    await page.waitForTimeout(1500);
    await auditCurrentState('New Transaction Modal');
    // Close modal
    const closeBtn = page.getByText('Cancelar').first();
    if (await closeBtn.isVisible()) await closeBtn.click();
    await page.waitForTimeout(800);
  }

  // 6. Mario IA Floating Modal
  console.log('Opening Mario IA Modal...');
  const aiBtn = page.locator('text=Pregúntale a Mario').first();
  if (await aiBtn.isVisible()) {
    await aiBtn.click();
    await page.waitForTimeout(1500);
    await auditCurrentState('Mario IA Assistant Modal');
  }

  // 7. Mobile Home View (390x844)
  console.log('Auditing Mobile View (390x844)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await auditCurrentState('Dashboard / Home (Mobile 390x844)');

  await browser.close();

  fs.writeFileSync('qa/accessibility_results.json', JSON.stringify(auditViews, null, 2), 'utf8');
  console.log('\n--- ACCESSIBILITY AUDIT COMPLETE. Saved qa/accessibility_results.json ---');
}

runAccessibilityAudit().catch(err => {
  console.error('Accessibility fatal error:', err);
  process.exit(1);
});
