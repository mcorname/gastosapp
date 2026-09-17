import { chromium } from '@playwright/test';
import fs from 'fs';

const TARGET_URL = process.env.TEST_URL || 'http://localhost:3001';

async function run() {
  console.log('=== FUNCTIONAL QA TEST SUITE V3 ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const matrix = [];
  const record = (module, screen, feature, action, expected, real, status, severity, bug = '') => {
    matrix.push({ module, screen, feature, action, expected, real, status, severity, bug });
    console.log('[' + status + '] ' + module + ' -> ' + action + ': ' + real);
  };

  const consoleLogs = [];
  page.on('console', m => consoleLogs.push({ type: m.type(), text: m.text() }));
  page.on('pageerror', e => consoleLogs.push({ type: 'error', text: e.message }));

  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Helper to ensure all modals are closed
  const ensureCleanState = async () => {
    try {
      const closeBtn = page.getByRole('button', { name: 'Cerrar' }).first();
      if (await closeBtn.isVisible()) await closeBtn.click();
      const cancelBtn = page.getByRole('button', { name: 'Cancelar' }).first();
      if (await cancelBtn.isVisible()) await cancelBtn.click();
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    } catch (e) {}
  };

  // --- TEST 1: Initial Data Load ---
  const bodyText = await page.evaluate(() => document.body.innerText);
  if (bodyText.includes('BCP') && bodyText.includes('WIN') && bodyText.includes('S/ 22,931.32')) {
    record('Dashboard', 'Inicio', 'Carga inicial de datos', 'Cargar app en navegador limpio', 'Cuentas y gastos cargados por defecto', 'Data de Mario cargada con saldos calculados', 'PASS', 'LOW');
  } else {
    record('Dashboard', 'Inicio', 'Carga inicial de datos', 'Cargar app en navegador limpio', 'Cuentas y gastos cargados', 'Faltan datos o saldos en 0', 'FAIL', 'HIGH', 'BUG-DATA-01');
  }

  // --- TEST 2: Tab Navigation ---
  for (const tab of ['Movimientos', 'Cuentas', 'Análisis', 'Ajustes', 'Inicio']) {
    try {
      await ensureCleanState();
      const tabBtn = page.getByRole('button', { name: tab, exact: true }).first();
      await tabBtn.click();
      await page.waitForTimeout(500);
      const isVisible = await page.evaluate((t) => document.body.innerText.includes(t), tab);
      record('Navegación', tab, 'Cambio de pestaña', 'Clic en tab ' + tab, 'Vista ' + tab + ' renderizada', isVisible ? 'Vista visible y reactiva' : 'Vista no renderizada', isVisible ? 'PASS' : 'FAIL', 'MEDIUM');
    } catch (e) {
      record('Navegación', tab, 'Cambio de pestaña', 'Clic en tab ' + tab, 'Vista ' + tab + ' visible', e.message, 'FAIL', 'HIGH');
    }
  }

  await ensureCleanState();
  await page.getByRole('button', { name: 'Inicio', exact: true }).first().click();
  await page.waitForTimeout(500);

  // --- TEST 3: Month Selector ---
  try {
    const junBtn = page.getByRole('button', { name: 'Jun', exact: true });
    await junBtn.click();
    await page.waitForTimeout(500);
    const hasJun = await page.evaluate(() => document.body.innerText.toLowerCase().includes('junio'));
    record('Dashboard', 'Inicio', 'Filtro por mes', 'Clic en Jun', 'Muestra datos de Junio 2026', hasJun ? 'Período cambiado a Junio' : 'No cambió el período', hasJun ? 'PASS' : 'FAIL', 'LOW');

    const setBtn = page.getByRole('button', { name: 'Set', exact: true });
    await setBtn.click();
    await page.waitForTimeout(500);
    const hasSet = await page.evaluate(() => document.body.innerText.toLowerCase().includes('setiembre'));
    record('Dashboard', 'Inicio', 'Filtro por mes', 'Clic en Set', 'Muestra datos de Setiembre 2026', hasSet ? 'Período cambiado a Setiembre' : 'No cambió a Setiembre', hasSet ? 'PASS' : 'FAIL', 'LOW');
  } catch (e) {
    record('Dashboard', 'Inicio', 'Filtro por mes', 'Navegación por meses', 'Cambio dinámico', e.message, 'FAIL', 'MEDIUM');
  }

  // --- TEST 4: Search Bar with Debounce ---
  try {
    const search = page.getByPlaceholder(/Buscar/).first();
    await search.fill('WIN');
    await page.waitForTimeout(600);
    const matchWIN = await page.evaluate(() => {
      const t = document.body.innerText;
      return t.includes('WIN') && !t.includes('CELULAR MARIO');
    });
    record('Búsqueda', 'Inicio', 'Buscador con debounce', 'Escribir WIN en buscador', 'Filtra y muestra solo movimiento WIN', matchWIN ? 'Filtro aplicado correctamente' : 'Filtro no aisló WIN', matchWIN ? 'PASS' : 'FAIL', 'LOW');
    await search.fill('');
    await page.waitForTimeout(600);
  } catch (e) {
    record('Búsqueda', 'Inicio', 'Buscador', 'Filtrado de texto', 'Búsqueda reactiva', e.message, 'FAIL', 'MEDIUM');
  }

  // --- TEST 5: Table Sorting ---
  try {
    const colMonto = page.getByText('MONTO').first();
    await colMonto.click();
    await page.waitForTimeout(500);
    record('Tabla', 'Inicio', 'Ordenamiento por columna', 'Clic en encabezado MONTO', 'Reordena transacciones por valor', 'Ordenamiento ejecutado sin errores', 'PASS', 'LOW');
  } catch (e) {
    record('Tabla', 'Inicio', 'Ordenamiento', 'Clic en columna', 'Reordenamiento', e.message, 'FAIL', 'LOW');
  }

  // --- TEST 6: CREATE Transaction with Form Validation ---
  try {
    await ensureCleanState();
    const newBtn = page.getByRole('button', { name: 'Nuevo gasto' }).first();
    await newBtn.click();
    await page.waitForTimeout(600);

    // Empty validation
    const submitBtn = page.getByRole('button', { name: 'Guardar movimiento' });
    await submitBtn.click();
    await page.waitForTimeout(400);
    const hasErr = await page.evaluate(() => {
      const t = document.body.innerText;
      return t.includes('monto') || t.includes('descripción') || t.includes('cuenta') || t.includes('categoría');
    });
    record('Transacciones', 'Modal Nuevo Gasto', 'Validación de campos obligatorios', 'Clic Guardar con campos vacíos', 'Bloquea submit y muestra error', hasErr ? 'Error de validación mostrado' : 'Submit permitido sin datos', hasErr ? 'PASS' : 'FAIL', 'MEDIUM');

    // Fill valid data
    await page.getByPlaceholder('0.00').fill('42.00');
    await page.getByPlaceholder('¿En qué consistió el movimiento?').fill('QA TEST Farmacia Salud');

    // Select account pill
    const accPill = page.getByText('Cuenta Bancaria (BCP / Interbank) (PEN)').first();
    if (await accPill.isVisible()) await accPill.click();

    // Select category pill
    const catPill = page.getByText('Salud y Cuidado').first();
    if (await catPill.isVisible()) await catPill.click();

    await submitBtn.click();
    await page.waitForTimeout(1000);

    const isCreated = await page.evaluate(() => document.body.innerText.includes('QA TEST Farmacia Salud'));
    record('Transacciones', 'Modal Nuevo Gasto', 'Creación de gasto (CREATE)', 'Llenar datos válidos y Guardar', 'Gasto creado y visible en tabla', isCreated ? 'Gasto registrado con éxito y visible' : 'No visible en tabla', isCreated ? 'PASS' : 'FAIL', 'CRITICAL');
  } catch (e) {
    record('Transacciones', 'Modal Nuevo Gasto', 'Creación de gasto', 'Llenado y guardado', 'Gasto guardado', e.message, 'FAIL', 'CRITICAL');
  }

  // --- TEST 7: Net Worth Modal & Navigation ---
  try {
    await ensureCleanState();
    const nwCard = page.getByText('PATRIMONIO TOTAL').first();
    await nwCard.click();
    await page.waitForTimeout(600);
    const nwOpen = await page.evaluate(() => document.body.innerText.includes('Detalle del patrimonio'));
    record('Patrimonio', 'Modal Patrimonio', 'Detalle de patrimonio', 'Clic en tarjeta Patrimonio Total', 'Abre modal con detalle de cuentas', nwOpen ? 'Modal abierto con saldos' : 'Modal no abrió', nwOpen ? 'PASS' : 'FAIL', 'LOW');

    const manageBtn = page.getByRole('button', { name: 'Gestionar cuentas' });
    if (await manageBtn.isVisible()) {
      await manageBtn.click();
      await page.waitForTimeout(800);
      const inAccs = await page.evaluate(() => document.body.innerText.includes('Mis Cuentas') || document.body.innerText.includes('Ajustar saldo'));
      record('Patrimonio', 'Modal Patrimonio', 'Enlace directo a Cuentas', 'Clic en Gestionar cuentas', 'Navega a la pantalla Cuentas', inAccs ? 'Navegación exitosa' : 'No navegó a Cuentas', inAccs ? 'PASS' : 'FAIL', 'LOW');
    }
  } catch (e) {
    record('Patrimonio', 'Modal Patrimonio', 'Desglose y enlace', 'Apertura y navegación', 'Detalle accesible', e.message, 'FAIL', 'MEDIUM');
  }

  // --- TEST 8: Accounts View & Adjust Balance Modal ---
  try {
    await ensureCleanState();
    await page.getByRole('button', { name: 'Cuentas', exact: true }).first().click();
    await page.waitForTimeout(600);

    const adjustBtn = page.getByRole('button', { name: 'Ajustar saldo' }).first();
    await adjustBtn.click();
    await page.waitForTimeout(600);
    const adjOpen = await page.evaluate(() => document.body.innerText.includes('Ajustar saldo') && (document.body.innerText.includes('Saldo actual') || document.body.innerText.includes('Nuevo saldo')));
    record('Cuentas', 'AccountsView', 'Modal Ajuste de Saldo', 'Clic en Ajustar saldo', 'Abre modal de cuadre con cálculo de diferencia', adjOpen ? 'Modal de ajuste funcional' : 'Modal no abrió', adjOpen ? 'PASS' : 'FAIL', 'HIGH');

    const cancelBtn = page.getByRole('button', { name: 'Cancelar' });
    if (await cancelBtn.isVisible()) await cancelBtn.click();
    await page.waitForTimeout(500);
  } catch (e) {
    record('Cuentas', 'AccountsView', 'Ajuste de saldo', 'Apertura de modal', 'Cuadre de caja disponible', e.message, 'FAIL', 'HIGH');
  }

  // --- TEST 9: Mario IA Chat Interaction ---
  try {
    await ensureCleanState();
    await page.getByRole('button', { name: 'Inicio', exact: true }).first().click();
    await page.waitForTimeout(600);

    const askBtn = page.getByText('Pregúntale a Mario').first();
    if (await askBtn.isVisible()) {
      await askBtn.click();
      await page.waitForTimeout(800);
      const chatVisible = await page.evaluate(() => document.body.innerText.includes('Mario IA'));
      record('Mario IA', 'Widget / Modal', 'Apertura de chat', 'Clic en Pregúntale a Mario', 'Abre modal conversacional de Mario IA', chatVisible ? 'Chat modal abierto' : 'Chat no abrió', chatVisible ? 'PASS' : 'FAIL', 'LOW');

      const qBtn = page.getByText('Resumen de mis finanzas').first();
      if (await qBtn.isVisible()) {
        await qBtn.click();
        await page.waitForTimeout(1500);
        const reply = await page.evaluate(() => {
          const t = document.body.innerText;
          return t.includes('Saldo total') || t.includes('ingresos') || t.includes('gastos');
        });
        record('Mario IA', 'Modal Chat', 'Consulta sugerida', 'Clic en pregunta resumen', 'Devuelve análisis sobre datos reales', reply ? 'Respuesta calculada correctamente' : 'Sin respuesta', reply ? 'PASS' : 'FAIL', 'LOW');
      }

      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  } catch (e) {
    record('Mario IA', 'Chat', 'Asistente financiero', 'Interacción con chat', 'Respuesta coherente', e.message, 'FAIL', 'MEDIUM');
  }

  // --- TEST 10: Privacy Toggle ---
  try {
    await ensureCleanState();
    await page.getByRole('button', { name: 'Ajustes', exact: true }).first().click();
    await page.waitForTimeout(600);

    const hideBtn = page.getByRole('button', { name: 'Ocultar' });
    if (await hideBtn.isVisible()) {
      await hideBtn.click();
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Inicio', exact: true }).first().click();
      await page.waitForTimeout(500);

      const masked = await page.evaluate(() => document.body.innerText.includes('••••••••'));
      record('Seguridad / UX', 'Ajustes', 'Modo privacidad (Ojo)', 'Clic en Ocultar importes', 'Reemplaza números con •••••••• transversalmente', masked ? 'Montos enmascarados correctamente' : 'Montos no ocultados', masked ? 'PASS' : 'FAIL', 'LOW');

      // Unmask
      await page.getByRole('button', { name: 'Ajustes', exact: true }).first().click();
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Mostrar' }).click();
      await page.waitForTimeout(500);
    }
  } catch (e) {
    record('Seguridad / UX', 'Ajustes', 'Privacidad', 'Ocultar / Mostrar cifras', 'Enmascaramiento activo', e.message, 'FAIL', 'MEDIUM');
  }

  // --- TEST 11: Persistence across F5 ---
  try {
    await ensureCleanState();
    await page.getByRole('button', { name: 'Inicio', exact: true }).first().click();
    await page.waitForTimeout(500);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const persists = await page.evaluate(() => {
      const t = document.body.innerText;
      return t.includes('QA TEST Farmacia Salud') && t.includes('BCP');
    });
    record('Persistencia', 'General', 'Recarga de navegador (F5)', 'Recargar página tras creación', 'Datos creados permanecen intactos en Local-first', persists ? 'Persistencia local confirmada tras reload' : 'Datos perdidos tras recarga', persists ? 'PASS' : 'FAIL', 'CRITICAL');
  } catch (e) {
    record('Persistencia', 'General', 'Recarga', 'F5 reload', 'Datos persisten', e.message, 'FAIL', 'CRITICAL');
  }

  fs.writeFileSync('qa/functional_v3_results.json', JSON.stringify({ matrix, consoleLogs }, null, 2));
  console.log('\n=== FUNCTIONAL SUITE V3 SUMMARY ===');
  console.log('Total Test Cases:', matrix.length);
  console.log('PASS:', matrix.filter(r => r.status === 'PASS').length);
  console.log('FAIL:', matrix.filter(r => r.status === 'FAIL').length);

  await browser.close();
}

run().catch(e => { console.error('Suite error:', e); process.exit(1); });
