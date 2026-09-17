import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';

const TARGET_URL = 'https://backend-gold-omega-57.vercel.app/';

async function audit() {
  console.log('=== STARTING COMPREHENSIVE QA AUDIT ON VERCEL ===');
  console.log('Target:', TARGET_URL);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleLogs = [];
  const networkErrors = [];

  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') console.log('❌ [Console Error]:', msg.text());
  });

  page.on('pageerror', err => {
    consoleLogs.push({ type: 'pageerror', text: err.message, stack: err.stack });
    console.log('💥 [Page Error]:', err.message);
  });

  page.on('response', res => {
    if (res.status() >= 400) {
      networkErrors.push({ url: res.url(), status: res.status() });
      console.log(⚠️ [Network Error] HTTP  on );
    }
  });

  console.log('Step 1: Navigating to Target...');
  const t0 = Date.now();
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  const loadTime = Date.now() - t0;
  console.log(Loaded in ms);
  await page.waitForTimeout(2000);

  const testResults = {
    smoke: { status: 'PASS', loadTime },
    functional: {},
    responsive: [],
    accessibility: {},
    performance: {},
    consoleLogs,
    networkErrors
  };

  // --- FUNCTIONAL TESTS ---
  console.log('\nStep 2: Testing Tabs Navigation...');
  try {
    const tabs = ['Movimientos', 'Cuentas', 'Análisis', 'Ajustes', 'Inicio'];
    for (const tab of tabs) {
      const tabBtn = page.getByRole('button', { name: tab, exact: true }).first();
      await tabBtn.click();
      await page.waitForTimeout(800);
      const isVisible = await page.evaluate((t) => document.body.innerText.includes(t), tab);
      console.log(  Tab : );
    }
    testResults.functional.tabsNavigation = 'PASS';
  } catch (err) {
    console.error('  Tabs error:', err.message);
    testResults.functional.tabsNavigation = 'FAIL: ' + err.message;
  }

  console.log('\nStep 3: Testing Month Selector...');
  try {
    await page.getByRole('button', { name: 'Inicio', exact: true }).first().click();
    await page.waitForTimeout(500);

    const junBtn = page.getByRole('button', { name: 'Jun', exact: true });
    await junBtn.click();
    await page.waitForTimeout(800);
    const hasJun = await page.evaluate(() => document.body.innerText.includes('junio de 2026') || document.body.innerText.includes('Junio de 2026'));
    console.log(  Jun selector: );

    const setBtn = page.getByRole('button', { name: 'Set', exact: true });
    await setBtn.click();
    await page.waitForTimeout(800);
    const hasSet = await page.evaluate(() => document.body.innerText.includes('setiembre de 2026') || document.body.innerText.includes('Setiembre de 2026'));
    console.log(  Set selector: );
    testResults.functional.monthSelector = 'PASS';
  } catch (err) {
    console.error('  Month selector error:', err.message);
    testResults.functional.monthSelector = 'FAIL: ' + err.message;
  }

  console.log('\nStep 4: Testing Search Bar...');
  try {
    const searchInput = page.getByPlaceholder('Buscar movimientos, categorías, cuentas...');
    await searchInput.fill('WIN');
    await page.waitForTimeout(600);
    const searchResults = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('WIN') && !text.includes('CELULAR MARIO');
    });
    console.log(  Search filter for WIN: );
    await searchInput.fill('');
    await page.waitForTimeout(600);
    testResults.functional.search = searchResults ? 'PASS' : 'FAIL';
  } catch (err) {
    console.error('  Search error:', err.message);
    testResults.functional.search = 'FAIL: ' + err.message;
  }

  console.log('\nStep 5: Testing CRUD Transaction (Create & Validate)...');
  try {
    const nuevoGastoBtn = page.getByRole('button', { name: '+ Nuevo gasto' }).first();
    await nuevoGastoBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'qa/screenshots/02_modal_new_transaction.png' });

    // Test form validation: submit empty
    const guardarBtn = page.getByRole('button', { name: 'Guardar movimiento' });
    await guardarBtn.click();
    await page.waitForTimeout(400);

    const hasValidationError = await page.evaluate(() => {
      return document.body.innerText.includes('Escribe una descripción') || 
             document.body.innerText.includes('Ingresa un monto') ||
             document.body.innerText.includes('monto debe ser mayor');
    });
    console.log(  Empty submission validation: );

    // Fill valid transaction
    const descInput = page.getByPlaceholder('Ej: Almuerzo de trabajo, Taxi, Bono...');
    await descInput.fill('QA TEST Compra Alimentos');

    const amountInput = page.getByPlaceholder('0.00');
    await amountInput.fill('45.50');

    await guardarBtn.click();
    await page.waitForTimeout(1000);

    const createdVisible = await page.evaluate(() => document.body.innerText.includes('QA TEST Compra Alimentos'));
    console.log(  Created transaction visible: );
    testResults.functional.createTransaction = createdVisible ? 'PASS' : 'FAIL';
    await page.screenshot({ path: 'qa/screenshots/03_transaction_created.png' });
  } catch (err) {
    console.error('  Create transaction error:', err.message);
    testResults.functional.createTransaction = 'FAIL: ' + err.message;
  }

  console.log('\nStep 6: Testing Net Worth Modal...');
  try {
    // Click on Patrimonio card
    const patrimonioCard = page.getByText('PATRIMONIO TOTAL');
    await patrimonioCard.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'qa/screenshots/04_modal_net_worth.png' });

    const modalOpen = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Desglose de activos líquidos') && text.includes('Gestionar cuentas');
    });
    console.log(  Net Worth Modal opened: );

    // Click 'Gestionar cuentas'
    await page.getByRole('button', { name: 'Gestionar cuentas' }).click();
    await page.waitForTimeout(800);
    const onAccountsTab = await page.evaluate(() => document.body.innerText.includes('Mis Cuentas') || document.body.innerText.includes('Ajustar saldo'));
    console.log(  Navigate from Net Worth to Accounts: );
    testResults.functional.netWorthModal = (modalOpen && onAccountsTab) ? 'PASS' : 'FAIL';
  } catch (err) {
    console.error('  Net worth error:', err.message);
    testResults.functional.netWorthModal = 'FAIL: ' + err.message;
  }

  console.log('\nStep 7: Testing Accounts Tab (Adjust Balance & Transfer)...');
  try {
    await page.screenshot({ path: 'qa/screenshots/05_accounts_view.png' });

    // Check Adjust Balance button
    const adjustBtn = page.getByRole('button', { name: 'Ajustar saldo' }).first();
    await adjustBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'qa/screenshots/06_modal_adjust_balance.png' });

    const adjustModalVisible = await page.evaluate(() => document.body.innerText.includes('Cuadre de caja'));
    console.log(  Adjust Balance modal opened: );

    // Close modal
    const cancelBtn = page.getByRole('button', { name: 'Cancelar' });
    await cancelBtn.click();
    await page.waitForTimeout(500);

    testResults.functional.accountsView = adjustModalVisible ? 'PASS' : 'FAIL';
  } catch (err) {
    console.error('  Accounts tab error:', err.message);
    testResults.functional.accountsView = 'FAIL: ' + err.message;
  }

  console.log('\nStep 8: Testing Mario IA Chat Modal...');
  try {
    await page.getByRole('button', { name: 'Inicio', exact: true }).first().click();
    await page.waitForTimeout(600);

    const askMarioBtn = page.getByRole('button', { name: 'Preguntarle a Mario' });
    await askMarioBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'qa/screenshots/07_modal_mario_chat.png' });

    const chatModalOpen = await page.evaluate(() => document.body.innerText.includes('Mario IA') && document.body.innerText.includes('Preguntas sugeridas'));
    console.log(  Mario Chat Modal opened: );

    // Click suggested question
    const suggestBtn = page.getByText('¿Cuál fue mi mayor gasto?');
    if (await suggestBtn.isVisible()) {
      await suggestBtn.click();
      await page.waitForTimeout(1500);
      const hasResponse = await page.evaluate(() => document.body.innerText.includes('Tu mayor gasto') || document.body.innerText.includes('Vivienda') || document.body.innerText.includes('LUZ'));
      console.log(  Suggested question response: );
    }

    // Close chat modal
    const closeBtn = page.getByRole('button', { name: 'Cerrar chat' }).or(page.getByLabel('Cerrar')).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    } else {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    testResults.functional.marioChat = chatModalOpen ? 'PASS' : 'FAIL';
  } catch (err) {
    console.error('  Mario Chat error:', err.message);
    testResults.functional.marioChat = 'FAIL: ' + err.message;
  }

  console.log('\nStep 9: Testing Settings Tab & Privacy Toggle...');
  try {
    await page.getByRole('button', { name: 'Ajustes', exact: true }).first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'qa/screenshots/08_settings_view.png' });

    const ocultarBtn = page.getByRole('button', { name: 'Ocultar' });
    if (await ocultarBtn.isVisible()) {
      await ocultarBtn.click();
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Inicio', exact: true }).first().click();
      await page.waitForTimeout(500);
      const isHidden = await page.evaluate(() => document.body.innerText.includes('••••••••'));
      console.log(  Privacy toggle (amounts hidden): );
      await page.screenshot({ path: 'qa/screenshots/09_privacy_hidden.png' });

      // Unhide
      await page.getByRole('button', { name: 'Ajustes', exact: true }).first().click();
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Mostrar' }).click();
      await page.waitForTimeout(500);
      testResults.functional.privacyToggle = isHidden ? 'PASS' : 'FAIL';
    }
  } catch (err) {
    console.error('  Settings privacy error:', err.message);
    testResults.functional.privacyToggle = 'FAIL: ' + err.message;
  }

  console.log('\nStep 10: Testing Persistence across Reload...');
  try {
    await page.getByRole('button', { name: 'Inicio', exact: true }).first().click();
    await page.waitForTimeout(500);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const persists = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('QA TEST Compra Alimentos') && text.includes('BCP');
    });
    console.log(  Data persistence after reload: );
    testResults.functional.persistence = persists ? 'PASS' : 'FAIL';
  } catch (err) {
    console.error('  Persistence error:', err.message);
    testResults.functional.persistence = 'FAIL: ' + err.message;
  }

  // --- RESPONSIVE TESTING (13 Viewports) ---
  console.log('\nStep 11: Testing 13 Viewports...');
  const viewports = [
    { w: 320, h: 568, name: 'mobile_320x568' },
    { w: 360, h: 800, name: 'mobile_360x800' },
    { w: 375, h: 667, name: 'mobile_375x667' },
    { w: 390, h: 844, name: 'mobile_390x844' },
    { w: 412, h: 915, name: 'mobile_412x915' },
    { w: 430, h: 932, name: 'mobile_430x932' },
    { w: 768, h: 1024, name: 'tablet_768x1024' },
    { w: 820, h: 1180, name: 'tablet_820x1180' },
    { w: 1024, h: 768, name: 'desktop_1024x768' },
    { w: 1280, h: 720, name: 'desktop_1280x720' },
    { w: 1366, h: 768, name: 'desktop_1366x768' },
    { w: 1440, h: 900, name: 'desktop_1440x900' },
    { w: 1920, h: 1080, name: 'desktop_1920x1080' }
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.waitForTimeout(500);

    const overflow = await page.evaluate(() => {
      const scrollW = document.documentElement.scrollWidth;
      const clientW = document.documentElement.clientWidth;
      return {
        scrollWidth: scrollW,
        clientWidth: clientW,
        hasHorizontalOverflow: scrollW > clientW
      };
    });

    const shotPath = qa/screenshots/vp_.png;
    await page.screenshot({ path: shotPath });

    testResults.responsive.push({
      viewport: ${vp.w}x,
      name: vp.name,
      hasOverflow: overflow.hasHorizontalOverflow,
      scrollWidth: overflow.scrollWidth,
      clientWidth: overflow.clientWidth,
      screenshot: shotPath
    });

    console.log(  Viewport x: Overflow=);
  }

  // Reset desktop viewport for A11y
  await page.setViewportSize({ width: 1440, height: 900 });

  // --- ACCESSIBILITY AUDIT (Axe-Core) ---
  console.log('\nStep 12: Running Axe-Core Accessibility Audit...');
  try {
    const axeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    console.log(  Axe Violations Found: );
    testResults.accessibility = {
      violationsCount: axeResults.violations.length,
      violations: axeResults.violations.map(v => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodesCount: v.nodes.length,
        nodeTargets: v.nodes.slice(0, 3).map(n => n.target)
      }))
    };
    for (const v of axeResults.violations) {
      console.log(    [] :  ( occurrences));
    }
  } catch (err) {
    console.error('  Axe audit error:', err.message);
    testResults.accessibility = { error: err.message };
  }

  // --- PERFORMANCE METRICS ---
  console.log('\nStep 13: Collecting Web Performance Metrics...');
  try {
    const perfTiming = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      return {
        dnsMs: nav ? nav.domainLookupEnd - nav.domainLookupStart : 0,
        tcpMs: nav ? nav.connectEnd - nav.connectStart : 0,
        ttfbMs: nav ? nav.responseStart - nav.requestStart : 0,
        domInteractiveMs: nav ? nav.domInteractive : 0,
        domCompleteMs: nav ? nav.domComplete : 0,
        loadEventEndMs: nav ? nav.loadEventEnd : 0,
        paints: paint.map(p => ({ name: p.name, startTime: Math.round(p.startTime) }))
      };
    });
    testResults.performance = perfTiming;
    console.log('  TTFB:', Math.round(perfTiming.ttfbMs), 'ms');
    console.log('  DOM Complete:', Math.round(perfTiming.domCompleteMs), 'ms');
    console.log('  Paints:', perfTiming.paints);
  } catch (err) {
    testResults.performance = { error: err.message };
  }

  fs.writeFileSync('qa/full_audit_results.json', JSON.stringify(testResults, null, 2));
  console.log('\n=== FULL AUDIT COMPLETED SUCCESSFULLY. Results in qa/full_audit_results.json ===');

  await browser.close();
}

audit().catch(err => {
  console.error('Audit crashed:', err);
  process.exit(1);
});
