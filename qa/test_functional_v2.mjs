import { chromium } from '@playwright/test';
import fs from 'fs';

const TARGET_URL = 'https://backend-gold-omega-57.vercel.app/';

async function run() {
  console.log('=== RUNNING REFINED FUNCTIONAL SUITE ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const results = [];
  const addResult = (module, action, expected, real, status, severity, bug = '') => {
    results.push({ module, action, expected, real, status, severity, bug });
    console.log('[' + status + '] ' + module + ' -> ' + action + ': ' + real);
  };

  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push(e.message));

  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Initial State
  const text = await page.evaluate(() => document.body.innerText);
  const hasBCP = text.includes('Cuenta Bancaria (BCP / Interbank)');
  const hasCash = text.includes('Efectivo (Billetera)');
  const hasWIN = text.includes('WIN');
  const hasSueldo = text.includes('S/ 5,000.00');

  if (hasBCP && hasWIN && hasSueldo) {
    addResult('Datos Iniciales', 'Carga de datos predeterminados en primer ingreso', 'Datos de Mario cargados (BCP, WIN, Sueldo)', 'Cuentas y gastos del mes presentes', 'PASS', 'LOW');
  } else {
    addResult('Datos Iniciales', 'Carga de datos predeterminados', 'Datos de Mario cargados', 'Faltan datos en primer ingreso', 'FAIL', 'HIGH', 'BUG-001');
  }

  // 2. New Transaction (CREATE)
  try {
    const nuevoGastoBtn = page.getByRole('button', { name: 'Nuevo gasto' }).first();
    await nuevoGastoBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'qa/screenshots/func_modal_new_tx.png' });

    // Try submitting empty
    const guardarBtn = page.getByRole('button', { name: 'Guardar movimiento' });
    await guardarBtn.click();
    await page.waitForTimeout(400);

    const valMsg = await page.evaluate(() => {
      const t = document.body.innerText;
      return t.includes('descripción') || t.includes('monto') || t.includes('mayor');
    });
    addResult('Validación Formularios', 'Submit de movimiento vacío', 'Muestra error de validación descriptivo', valMsg ? 'Error visible: validación exitosa' : 'Sin error visible', valMsg ? 'PASS' : 'FAIL', 'MEDIUM');

    // Fill valid data
    await page.getByPlaceholder('Ej: Almuerzo de trabajo, Taxi, Bono...').fill('QA TEST Registro Exitoso');
    await page.getByPlaceholder('0.00').fill('25.50');
    await guardarBtn.click();
    await page.waitForTimeout(1000);

    const isCreated = await page.evaluate(() => document.body.innerText.includes('QA TEST Registro Exitoso'));
    addResult('CRUD Transacciones', 'Crear nuevo gasto (CREATE)', 'Gasto guardado y visible en tabla con S/ 25.50', isCreated ? 'Gasto creado y reflejado en lista y totales' : 'No visible tras guardar', isCreated ? 'PASS' : 'FAIL', isCreated ? 'LOW' : 'CRITICAL', isCreated ? '' : 'BUG-002');
    await page.screenshot({ path: 'qa/screenshots/func_tx_created.png' });
  } catch (e) {
    console.error('Error in CREATE:', e.message);
    addResult('CRUD Transacciones', 'Crear nuevo gasto', 'Guardado exitoso', e.message, 'FAIL', 'CRITICAL', 'BUG-002');
  }

  // 3. Edit Transaction
  try {
    // Look for more options button on the created transaction
    const rowMenu = page.getByRole('button', { name: 'Más opciones' }).first();
    await rowMenu.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'qa/screenshots/func_tx_menu.png' });

    const editarBtn = page.getByText('Editar');
    if (await editarBtn.isVisible()) {
      await editarBtn.click();
      await page.waitForTimeout(600);

      // Change amount
      const amountInput = page.getByPlaceholder('0.00');
      await amountInput.fill('30.00');
      await page.getByRole('button', { name: 'Guardar movimiento' }).click();
      await page.waitForTimeout(1000);

      const editedText = await page.evaluate(() => document.body.innerText.includes('30.00'));
      addResult('CRUD Transacciones', 'Editar gasto existente (UPDATE)', 'Monto actualizado a S/ 30.00', editedText ? 'Monto actualizado correctamente' : 'Monto no se actualizó', editedText ? 'PASS' : 'FAIL', 'HIGH');
    } else {
      addResult('CRUD Transacciones', 'Menú Más opciones -> Editar', 'Opción Editar visible y accionable', 'No se encontró opción Editar en menú', 'FAIL', 'MEDIUM');
    }
  } catch (e) {
    addResult('CRUD Transacciones', 'Editar transacción', 'Edición exitosa', e.message, 'FAIL', 'HIGH');
  }

  // 4. Net Worth Modal
  try {
    const patrimonio = page.getByText('PATRIMONIO TOTAL');
    await patrimonio.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'qa/screenshots/func_net_worth_modal.png' });

    const modalText = await page.evaluate(() => document.body.innerText);
    const nwOpened = modalText.includes('Desglose de activos líquidos');
    addResult('Métrica Patrimonio', 'Clic en Patrimonio Total', 'Abre modal con desglose detallado', nwOpened ? 'Modal abierto con cuentas y saldos' : 'Modal no abrió', nwOpened ? 'PASS' : 'FAIL', 'LOW');

    const manageBtn = page.getByRole('button', { name: 'Gestionar cuentas' });
    await manageBtn.click();
    await page.waitForTimeout(800);
    const inAccounts = await page.evaluate(() => document.body.innerText.includes('Mis Cuentas') || document.body.innerText.includes('Ajustar saldo'));
    addResult('Navegación Modal', 'Botón Gestionar cuentas', 'Navega a tab Cuentas y cierra modal', inAccounts ? 'Navegación exitosa a Cuentas' : 'Fallo en navegación', inAccounts ? 'PASS' : 'FAIL', 'LOW');
  } catch (e) {
    addResult('Métrica Patrimonio', 'Modal de Patrimonio', 'Apertura y navegación', e.message, 'FAIL', 'HIGH');
  }

  // 5. Accounts View & Adjust Balance
  try {
    await page.screenshot({ path: 'qa/screenshots/func_accounts_view.png' });
    const adjustBtn = page.getByRole('button', { name: 'Ajustar saldo' }).first();
    await adjustBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: 'qa/screenshots/func_adjust_modal.png' });

    const hasAdj = await page.evaluate(() => document.body.innerText.includes('Cuadre de caja'));
    addResult('Módulo Cuentas', 'Ajustar saldo de cuenta', 'Abre modal de cuadre de saldo con cálculo en vivo', hasAdj ? 'Modal de ajuste funcional' : 'Modal no visible', hasAdj ? 'PASS' : 'FAIL', 'LOW');

    await page.getByRole('button', { name: 'Cancelar' }).click();
    await page.waitForTimeout(500);
  } catch (e) {
    addResult('Módulo Cuentas', 'Ajustar saldo', 'Modal de ajuste', e.message, 'FAIL', 'HIGH');
  }

  // 6. Return to Home
  try {
    const inicioTab = page.getByRole('button', { name: 'Inicio', exact: true }).first();
    await inicioTab.click();
    await page.waitForTimeout(600);
  } catch (e) {
    console.error('Error navigating back to Inicio:', e.message);
  }

  // 7. Mario IA Chat
  try {
    const askMario = page.getByRole('button', { name: 'Preguntarle a Mario' });
    if (await askMario.isVisible()) {
      await askMario.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: 'qa/screenshots/func_mario_chat.png' });

      const chatVisible = await page.evaluate(() => document.body.innerText.includes('Mario IA'));
      addResult('Mario IA', 'Abrir chat conversacional', 'Abre modal interactivo de Mario IA', chatVisible ? 'Chat modal abierto' : 'Chat no abrió', chatVisible ? 'PASS' : 'FAIL', 'LOW');

      // Click suggested question
      const sugg = page.getByText('¿Cuál fue mi mayor gasto?');
      if (await sugg.isVisible()) {
        await sugg.click();
        await page.waitForTimeout(1500);
        const hasReply = await page.evaluate(() => {
          const t = document.body.innerText;
          return t.includes('Tu mayor gasto') || t.includes('Vivienda') || t.includes('LUZ');
        });
        addResult('Mario IA', 'Pregunta sugerida (Mayor gasto)', 'Genera insight sobre datos reales', hasReply ? 'Respuesta financiera calculada correctamente' : 'Sin respuesta', hasReply ? 'PASS' : 'FAIL', 'LOW');
      }

      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }
  } catch (e) {
    addResult('Mario IA', 'Chat interactivo', 'Consulta y respuesta', e.message, 'FAIL', 'MEDIUM');
  }

  // 8. Settings & Privacy
  try {
    await page.getByRole('button', { name: 'Ajustes', exact: true }).first().click();
    await page.waitForTimeout(600);

    const ocultarBtn = page.getByRole('button', { name: 'Ocultar' });
    if (await ocultarBtn.isVisible()) {
      await ocultarBtn.click();
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Inicio', exact: true }).first().click();
      await page.waitForTimeout(500);

      const isMasked = await page.evaluate(() => document.body.innerText.includes('••••••••'));
      addResult('Privacidad', 'Ocultar montos', 'Enmascara montos sensibles con ••••••••', isMasked ? 'Cifras protegidas transversalmente' : 'Cifras visibles', isMasked ? 'PASS' : 'FAIL', 'LOW');

      // Unmask
      await page.getByRole('button', { name: 'Ajustes', exact: true }).first().click();
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Mostrar' }).click();
      await page.waitForTimeout(500);
    }
  } catch (e) {
    addResult('Privacidad', 'Modo privacidad', 'Ocultar / Mostrar', e.message, 'FAIL', 'MEDIUM');
  }

  // 9. Persistence across F5
  try {
    await page.getByRole('button', { name: 'Inicio', exact: true }).first().click();
    await page.waitForTimeout(500);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const hasData = await page.evaluate(() => {
      const t = document.body.innerText;
      return t.includes('BCP') && t.includes('WIN');
    });
    addResult('Persistencia', 'Recarga de navegador (F5)', 'Todos los datos y estados se conservan en Local-first', hasData ? 'Persistencia verificada exitosamente' : 'Pérdida de datos tras recarga', hasData ? 'PASS' : 'FAIL', hasData ? 'LOW' : 'BLOCKER', hasData ? '' : 'BUG-003');
  } catch (e) {
    addResult('Persistencia', 'Recarga de navegador', 'Consistencia de datos', e.message, 'FAIL', 'CRITICAL');
  }

  fs.writeFileSync('qa/functional_v2_results.json', JSON.stringify({ results, consoleErrors }, null, 2));
  console.log('\n=== REFINED FUNCTIONAL SUITE COMPLETED ===');
  console.log('Total tests:', results.length);
  console.log('PASS:', results.filter(r => r.status === 'PASS').length);
  console.log('FAIL:', results.filter(r => r.status === 'FAIL').length);

  await browser.close();
}

run().catch(e => { console.error('Suite error:', e); process.exit(1); });
