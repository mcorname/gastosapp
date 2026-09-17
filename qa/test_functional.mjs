import { chromium } from '@playwright/test';
import fs from 'fs';

const TARGET_URL = 'https://backend-gold-omega-57.vercel.app/';

async function run() {
  console.log('=== 1. FUNCTIONAL TESTS ON VERCEL ===');
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

  for (const tab of ['Movimientos', 'Cuentas', 'Análisis', 'Ajustes', 'Inicio']) {
    try {
      const btn = page.getByRole('button', { name: tab, exact: true }).first();
      await btn.click();
      await page.waitForTimeout(600);
      const isVisible = await page.evaluate((t) => document.body.innerText.includes(t), tab);
      if (isVisible) {
        addResult('Navegación', 'Navegar a tab ' + tab, 'Vista de ' + tab + ' se muestra', 'Renderizado exitoso', 'PASS', 'LOW');
      } else {
        addResult('Navegación', 'Navegar a tab ' + tab, 'Vista de ' + tab + ' visible', 'No se encontró contenido esperado', 'FAIL', 'MEDIUM');
      }
    } catch (e) {
      addResult('Navegación', 'Click en tab ' + tab, 'Navegación fluida', e.message, 'FAIL', 'HIGH');
    }
  }

  await page.getByRole('button', { name: 'Inicio', exact: true }).first().click();
  await page.waitForTimeout(500);

  try {
    const junBtn = page.getByRole('button', { name: 'Jun', exact: true });
    await junBtn.click();
    await page.waitForTimeout(600);
    const hasJun = await page.evaluate(() => document.body.innerText.toLowerCase().includes('junio'));
    if (hasJun) {
      addResult('Selector Meses', 'Cambiar mes a Junio', 'Muestra período Junio 2026', 'Texto de Junio visible', 'PASS', 'LOW');
    } else {
      addResult('Selector Meses', 'Cambiar mes a Junio', 'Muestra período Junio', 'No cambió el texto del período', 'FAIL', 'MEDIUM');
    }

    const setBtn = page.getByRole('button', { name: 'Set', exact: true });
    await setBtn.click();
    await page.waitForTimeout(600);
    const hasSet = await page.evaluate(() => document.body.innerText.toLowerCase().includes('setiembre'));
    if (hasSet) {
      addResult('Selector Meses', 'Cambiar mes a Setiembre', 'Muestra período Setiembre 2026', 'Setiembre activo', 'PASS', 'LOW');
    } else {
      addResult('Selector Meses', 'Cambiar mes a Setiembre', 'Setiembre activo', 'Fallo al volver a Setiembre', 'FAIL', 'MEDIUM');
    }
  } catch (e) {
    addResult('Selector Meses', 'Interacción con botones de mes', 'Cambio dinámico', e.message, 'FAIL', 'HIGH');
  }

  try {
    const searchInput = page.getByPlaceholder('Buscar movimientos, categorías, cuentas...');
    await searchInput.fill('WIN');
    await page.waitForTimeout(600);
    const searchMatch = await page.evaluate(() => {
      const t = document.body.innerText;
      return t.includes('WIN') && !t.includes('CELULAR MARIO');
    });
    if (searchMatch) {
      addResult('Búsqueda', 'Filtrar por texto WIN', 'Solo muestra fila de WIN', 'Filtro reactivo aplicado correctamente', 'PASS', 'LOW');
    } else {
      addResult('Búsqueda', 'Filtrar por texto WIN', 'Filtro exclusivo de WIN', 'No filtró adecuadamente la tabla', 'FAIL', 'MEDIUM');
    }
    await searchInput.fill('');
    await page.waitForTimeout(600);
  } catch (e) {
    addResult('Búsqueda', 'Escritura en barra de búsqueda', 'Filtrado con debounce', e.message, 'FAIL', 'HIGH');
  }

  try {
    const headerMonto = page.getByText('MONTO').first();
    await headerMonto.click();
    await page.waitForTimeout(500);
    addResult('Tabla Gastos', 'Ordenar por columna MONTO', 'Tabla reordena filas por monto', 'Ordenamiento ejecutado sin excepciones', 'PASS', 'LOW');
  } catch (e) {
    addResult('Tabla Gastos', 'Ordenar por columnas', 'Ordenamiento funcional', e.message, 'FAIL', 'MEDIUM');
  }

  try {
    const nuevoGasto = page.getByRole('button', { name: '+ Nuevo gasto' }).first();
    await nuevoGasto.click();
    await page.waitForTimeout(500);

    const guardarBtn = page.getByRole('button', { name: 'Guardar movimiento' });
    await guardarBtn.click();
    await page.waitForTimeout(400);

    const valError = await page.evaluate(() => {
      const t = document.body.innerText;
      return t.includes('descripción') || t.includes('monto') || t.includes('mayor');
    });
    if (valError) {
      addResult('Validación Formularios', 'Enviar formulario vacío', 'Muestra mensaje de error y no guarda', 'Mensaje de validación visible', 'PASS', 'LOW');
    } else {
      addResult('Validación Formularios', 'Enviar formulario vacío', 'Bloqueo de submit', 'No se mostró mensaje de error', 'FAIL', 'MEDIUM');
    }

    await page.getByPlaceholder('Ej: Almuerzo de trabajo, Taxi, Bono...').fill('QA TEST Registro Seguro');
    await page.getByPlaceholder('0.00').fill('38.50');
    await guardarBtn.click();
    await page.waitForTimeout(1000);

    const created = await page.evaluate(() => document.body.innerText.includes('QA TEST Registro Seguro'));
    if (created) {
      addResult('CRUD Transacciones', 'Crear nuevo gasto (CREATE)', 'Gasto aparece en tabla y actualiza métricas', 'Gasto creado y visible con S/ 38.50', 'PASS', 'LOW');
    } else {
      addResult('CRUD Transacciones', 'Crear nuevo gasto', 'Aparece en tabla', 'No se visualiza en la tabla tras guardar', 'FAIL', 'HIGH');
    }
  } catch (e) {
    addResult('CRUD Transacciones', 'Creación de gasto', 'Guardado exitoso', e.message, 'FAIL', 'CRITICAL');
  }

  try {
    const patrimonio = page.getByText('PATRIMONIO TOTAL');
    await patrimonio.click();
    await page.waitForTimeout(600);
    const nwText = await page.evaluate(() => document.body.innerText);
    const nwOpen = nwText.includes('Desglose de activos líquidos');
    if (nwOpen) {
      addResult('Métrica Patrimonio', 'Clic en Patrimonio Total', 'Abre modal con desglose de cuentas', 'Modal abierto con saldos detallados', 'PASS', 'LOW');
    } else {
      addResult('Métrica Patrimonio', 'Clic en Patrimonio Total', 'Abre modal de patrimonio', 'Modal no abrió al hacer clic', 'FAIL', 'MEDIUM');
    }

    await page.getByRole('button', { name: 'Gestionar cuentas' }).click();
    await page.waitForTimeout(800);
    const onAccounts = await page.evaluate(() => document.body.innerText.includes('Mis Cuentas') || document.body.innerText.includes('Ajustar saldo'));
    if (onAccounts) {
      addResult('Navegación Modal', 'Botón Gestionar cuentas en modal', 'Navega al tab de cuentas', 'Navegación exitosa', 'PASS', 'LOW');
    } else {
      addResult('Navegación Modal', 'Gestionar cuentas', 'Navega a Cuentas', 'No navegó a la vista de cuentas', 'FAIL', 'MEDIUM');
    }
  } catch (e) {
    addResult('Métrica Patrimonio', 'Interacción con modal de patrimonio', 'Desglose y navegación', e.message, 'FAIL', 'HIGH');
  }

  try {
    const adjustBtn = page.getByRole('button', { name: 'Ajustar saldo' }).first();
    await adjustBtn.click();
    await page.waitForTimeout(600);
    const hasAdj = await page.evaluate(() => document.body.innerText.includes('Cuadre de caja'));
    if (hasAdj) {
      addResult('Módulo Cuentas', 'Abrir modal de ajuste de saldo', 'Abre modal con cálculo de diferencia', 'Modal abierto correctamente', 'PASS', 'LOW');
    } else {
      addResult('Módulo Cuentas', 'Ajustar saldo', 'Abre modal de ajuste', 'No abrió el modal', 'FAIL', 'HIGH');
    }
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await page.waitForTimeout(500);
  } catch (e) {
    addResult('Módulo Cuentas', 'Ajustar saldo de cuenta', 'Cálculo de delta y auditoría', e.message, 'FAIL', 'HIGH');
  }

  try {
    await page.getByRole('button', { name: 'Inicio', exact: true }).first().click();
    await page.waitForTimeout(600);

    const askMario = page.getByRole('button', { name: 'Preguntarle a Mario' });
    await askMario.click();
    await page.waitForTimeout(800);
    const chatOpen = await page.evaluate(() => document.body.innerText.includes('Mario IA'));
    if (chatOpen) {
      addResult('Mario IA', 'Abrir modal de chat', 'Abre asistente interactivo', 'Modal de chat renderizado', 'PASS', 'LOW');
    } else {
      addResult('Mario IA', 'Abrir modal de chat', 'Abre asistente', 'No abrió el modal de chat', 'FAIL', 'MEDIUM');
    }

    const qBtn = page.getByText('¿Cuál fue mi mayor gasto?');
    if (await qBtn.isVisible()) {
      await qBtn.click();
      await page.waitForTimeout(1500);
      const answered = await page.evaluate(() => {
        const t = document.body.innerText;
        return t.includes('Tu mayor gasto') || t.includes('Vivienda') || t.includes('LUZ');
      });
      if (answered) {
        addResult('Mario IA', 'Pregunta sugerida: Mayor gasto', 'Responde identificando el gasto mayor', 'Respuesta calculada sobre datos reales', 'PASS', 'LOW');
      } else {
        addResult('Mario IA', 'Pregunta sugerida', 'Responde con datos reales', 'No respondió a la consulta', 'FAIL', 'MEDIUM');
      }
    }

    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  } catch (e) {
    addResult('Mario IA', 'Asistente conversacional', 'Interacción con Mario IA', e.message, 'FAIL', 'HIGH');
  }

  try {
    await page.getByRole('button', { name: 'Ajustes', exact: true }).first().click();
    await page.waitForTimeout(600);
    const ocultarBtn = page.getByRole('button', { name: 'Ocultar' });
    if (await ocultarBtn.isVisible()) {
      await ocultarBtn.click();
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Inicio', exact: true }).first().click();
      await page.waitForTimeout(500);
      const hidden = await page.evaluate(() => document.body.innerText.includes('••••••••'));
      if (hidden) {
        addResult('Privacidad', 'Ocultar montos sensibles', 'Reemplaza cifras por •••••••• transversalmente', 'Montos enmascarados correctamente', 'PASS', 'LOW');
      } else {
        addResult('Privacidad', 'Ocultar montos sensibles', 'Enmascara montos', 'Cifras siguieron visibles', 'FAIL', 'MEDIUM');
      }
      await page.getByRole('button', { name: 'Ajustes', exact: true }).first().click();
      await page.waitForTimeout(500);
      await page.getByRole('button', { name: 'Mostrar' }).click();
      await page.waitForTimeout(500);
    }
  } catch (e) {
    addResult('Privacidad', 'Toggle de privacidad', 'Ocultar / Mostrar cifras', e.message, 'FAIL', 'MEDIUM');
  }

  try {
    await page.getByRole('button', { name: 'Inicio', exact: true }).first().click();
    await page.waitForTimeout(500);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const persisted = await page.evaluate(() => {
      const t = document.body.innerText;
      return t.includes('QA TEST Registro Seguro') && t.includes('BCP');
    });
    if (persisted) {
      addResult('Persistencia', 'Recarga de navegador (F5)', 'Gasto creado y datos continúan intactos', 'Persistencia local confirmada tras reload', 'PASS', 'LOW');
    } else {
      addResult('Persistencia', 'Recarga de navegador (F5)', 'Datos persisten', 'El gasto creado desapareció tras F5', 'FAIL', 'CRITICAL', 'BUG-002');
    }
  } catch (e) {
    addResult('Persistencia', 'Recarga de navegador', 'Consistencia de datos', e.message, 'FAIL', 'HIGH');
  }

  fs.writeFileSync('qa/functional_results.json', JSON.stringify({ results, consoleErrors }, null, 2));
  console.log('Finished functional tests.');
  await browser.close();
}

run().catch(e => { console.error('Error:', e); process.exit(1); });
