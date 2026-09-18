import { chromium } from '@playwright/test';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/Mario Castro/.gemini/antigravity/brain/20c544ee-d02a-4a19-8721-546d2c769aa6';
const TARGET_URL = process.env.TEST_URL || 'http://localhost:3001';

async function audit() {
  console.log('=== VISUAL QA AUDIT: CATEGORIES SYSTEM ===');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. DESKTOP TABLE CATEGORY COLUMN ALIGNMENT AUDIT
  console.log('\n--- 1. AUDITORÍA DE ALINEACIÓN EN TABLA (DESKTOP) ---');
  
  const tableRows = await page.$$eval('[role="main"] .css-g5y9jx', (divs) => {
    // Buscar elementos de fila de tabla que tengan las 6 columnas
    const rows = Array.from(document.querySelectorAll('div')).filter(el => {
      return el.children.length === 6 && el.children[0].innerText && (
        el.children[0].innerText.includes('CELULAR') || 
        el.children[0].innerText.includes('SAGA') || 
        el.children[0].innerText.includes('GAS') || 
        el.children[0].innerText.includes('LUZ') || 
        el.children[0].innerText.includes('WIN') ||
        el.children[0].innerText.includes('MOVISTAR')
      );
    });

    return rows.map((row, idx) => {
      const descCell = row.children[0];
      const catCell = row.children[1];
      const iconWrapper = catCell.firstElementChild;
      const textNode = catCell.children[1] || catCell.lastElementChild;

      const rowRect = row.getBoundingClientRect();
      const descRect = descCell.getBoundingClientRect();
      const catRect = catCell.getBoundingClientRect();
      const iconRect = iconWrapper ? iconWrapper.getBoundingClientRect() : null;
      const textRect = textNode ? textNode.getBoundingClientRect() : null;

      return {
        rowIndex: idx + 1,
        desc: descCell.innerText.split('\n')[0],
        catName: catCell.innerText.trim(),
        rowY: Math.round(rowRect.y),
        rowH: Math.round(rowRect.height),
        catCellX: Math.round(catRect.x),
        catCellW: Math.round(catRect.width),
        iconX: iconRect ? Math.round(iconRect.x) : null,
        iconW: iconRect ? Math.round(iconRect.width) : null,
        iconH: iconRect ? Math.round(iconRect.height) : null,
        textX: textRect ? Math.round(textRect.x) : null,
        gap: (iconRect && textRect) ? Math.round(textRect.x - (iconRect.x + iconRect.width)) : null
      };
    });
  });

  console.log(`Detectadas ${tableRows.length} filas en la tabla de gastos.`);
  tableRows.forEach(r => {
    console.log(`  Fila ${r.rowIndex} [${r.desc}]: Categoría="${r.catName}" -> CeldaX=${r.catCellX}px, IconoX=${r.iconX}px (${r.iconW}x${r.iconH}px), TextoX=${r.textX}px (gap=${r.gap}px), AlturaFila=${r.rowH}px`);
  });

  // Validaciones matemáticas
  const firstCatX = tableRows[0]?.catCellX;
  const firstIconX = tableRows[0]?.iconX;
  const firstTextX = tableRows[0]?.textX;
  const firstRowH = tableRows[0]?.rowH;

  const allCellsAligned = tableRows.every(r => r.catCellX === firstCatX);
  const allIconsAligned = tableRows.every(r => r.iconX === firstIconX);
  const allTextsAligned = tableRows.every(r => r.textX === firstTextX);
  const allRowHeightsEqual = tableRows.every(r => Math.abs(r.rowH - firstRowH) <= 1);
  const allIcons28px = tableRows.every(r => r.iconW === 28 && r.iconH === 28);
  const allGaps8px = tableRows.every(r => r.gap === 8);

  console.log('\n--- VERIFICACIÓN DE EXACTITUD GEOMÉTRICA ---');
  console.log(`✔ Alineación X de todas las celdas de categoría: ${allCellsAligned ? 'PERFECTA (x=' + firstCatX + 'px)' : 'DESALINEADA'}`);
  console.log(`✔ Alineación X de todos los iconos de categoría: ${allIconsAligned ? 'PERFECTA (x=' + firstIconX + 'px)' : 'DESALINEADA'}`);
  console.log(`✔ Alineación X del inicio del texto: ${allTextsAligned ? 'PERFECTA (x=' + firstTextX + 'px)' : 'DESALINEADA'}`);
  console.log(`✔ Tamaño uniforme de contenedores de iconos: ${allIcons28px ? 'PERFECTO (28x28px)' : 'DISPAREJO'}`);
  console.log(`✔ Espaciado uniforme icono -> texto: ${allGaps8px ? 'PERFECTO (8px)' : 'DISPAREJO'}`);
  console.log(`✔ Altura uniforme de filas de la tabla: ${allRowHeightsEqual ? 'PERFECTA (' + firstRowH + 'px)' : 'DISPAREJA'}`);

  // Captura 1: Vista general de la tabla con categorías
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'category_table_desktop.png') });
  console.log('✔ Screenshot guardado: category_table_desktop.png');

  // 2. AUDITORÍA DE FILTROS CON ICONOS
  console.log('\n--- 2. AUDITORÍA DE FILTROS CON ICONOS ---');
  const filterBtn = page.getByRole('button', { name: 'Filtros' });
  if (await filterBtn.isVisible()) {
    await filterBtn.click();
    await page.waitForTimeout(500);

    const filterScreenshot = path.join(ARTIFACTS_DIR, 'category_filters.png');
    await page.screenshot({ path: filterScreenshot });
    console.log('✔ Screenshot guardado: category_filters.png');
  }

  // 3. AUDITORÍA DEL MODAL "NUEVO GASTO" Y SELECTOR DE CATEGORÍA
  console.log('\n--- 3. AUDITORÍA DE SELECTOR EN MODAL NUEVO GASTO ---');
  const nuevoGastoBtn = page.getByRole('button', { name: 'Nuevo gasto' });
  if (await nuevoGastoBtn.isVisible()) {
    await nuevoGastoBtn.click();
    await page.waitForTimeout(600);

    // Clic en la categoría Transporte para verificar estado seleccionado
    const catTransporte = page.getByRole('button', { name: /Categoría: Transporte/i });
    if (await catTransporte.isVisible()) {
      await catTransporte.click();
      await page.waitForTimeout(400);
      console.log('✔ Categoría Transporte seleccionada interactivamente');
    }

    const modalScreenshot = path.join(ARTIFACTS_DIR, 'category_modal_selector.png');
    await page.screenshot({ path: modalScreenshot });
    console.log('✔ Screenshot guardado: category_modal_selector.png');

    // Cerrar modal
    const closeBtn = page.getByRole('button', { name: /Cerrar/i }).first();
    if (await closeBtn.isVisible()) await closeBtn.click();
    await page.waitForTimeout(400);
  }

  // 4. AUDITORÍA RESPONSIVE MÓVIL (375x812 iPhone)
  console.log('\n--- 4. AUDITORÍA RESPONSIVE (MÓVIL) ---');
  const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(TARGET_URL, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1500);

  // Ir a pestaña Movimientos en móvil
  const movTab = mobilePage.getByText('Movimientos').first();
  if (await movTab.isVisible()) {
    await movTab.click();
    await mobilePage.waitForTimeout(800);
  }

  const mobileScreenshot = path.join(ARTIFACTS_DIR, 'category_mobile.png');
  await mobilePage.screenshot({ path: mobileScreenshot });
  console.log('✔ Screenshot guardado: category_mobile.png');

  await browser.close();
  console.log('\n=== AUDITORÍA VISUAL QA COMPLETADA CON ÉXITO ===');
}

audit().catch(err => {
  console.error('Error durante la auditoría visual:', err);
  process.exit(1);
});
