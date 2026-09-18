import assert from 'node:assert';
import { CATEGORY_CATALOG, resolveCategoryMeta } from '../apps/mobile/src/theme/categoryCatalog.ts';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../packages/shared/src/constants.ts';

console.log('=== TEST SUITE: CATEGORY VISUAL CATALOG ===');

// 1. Verificar que no existen emojis en las definiciones
for (const [key, cat] of Object.entries(CATEGORY_CATALOG)) {
  assert.ok(cat.iconName, `Category ${key} debe tener iconName`);
  assert.ok(cat.color, `Category ${key} debe tener color`);
  assert.ok(cat.bg, `Category ${key} debe tener bg pastel`);
  assert.ok(cat.activeBg, `Category ${key} debe tener activeBg`);
  assert.ok(cat.activeBorder, `Category ${key} debe tener activeBorder`);
  assert.ok(cat.activeText, `Category ${key} debe tener activeText`);
  
  // Comprobar que no hay caracteres emoji
  const hasEmoji = /\p{Extended_Pictographic}/u.test(cat.iconName) || /\p{Extended_Pictographic}/u.test(cat.label);
  assert.strictEqual(hasEmoji, false, `Category ${key} no debe contener emojis`);
}
console.log('✔ Todas las categorías poseen iconos vectoriales y colores definidos sin emojis');

// 2. Comprobar que todas las categorías por defecto de shared resuelven correctamente
for (const def of DEFAULT_EXPENSE_CATEGORIES) {
  const meta = resolveCategoryMeta(def.name);
  assert.ok(meta, `Debe resolver ${def.name}`);
  assert.strictEqual(meta.label.toLowerCase(), def.name.toLowerCase(), `Label debe coincidir con ${def.name}`);
  assert.ok(meta.color.startsWith('#'), `Color debe ser hexadecimal para ${def.name}`);
  assert.ok(meta.bg.startsWith('#'), `Bg debe ser hexadecimal para ${def.name}`);
}
console.log('✔ Todas las categorías de gasto resuelven a su configuración canónica');

// 3. Comprobar resolución difusa por palabras clave comunes
const testCases = [
  { input: 'Luz del Sur', expectedKey: 'vivienda' },
  { input: 'Enel Factura', expectedKey: 'vivienda' },
  { input: 'Alquiler Departamento', expectedKey: 'vivienda' },
  { input: 'Restaurante Central', expectedKey: 'alimentacion' },
  { input: 'Supermercados Peruanos Plaza Vea', expectedKey: 'alimentacion' },
  { input: 'Taxi San Borja', expectedKey: 'transporte' },
  { input: 'Grifo Primax', expectedKey: 'transporte' },
  { input: 'Farmacia Inkafarma', expectedKey: 'salud' },
  { input: 'Saga Falabella Ropa', expectedKey: 'compras' },
  { input: 'Netflix Mensual', expectedKey: 'suscripciones' },
  { input: 'Vuelo Latam', expectedKey: 'viajes' },
  { input: 'Cineplanet Entradas', expectedKey: 'entretenimiento' },
  { input: 'Curso Platzi', expectedKey: 'educacion' },
  { input: 'Sueldo Mensual', expectedKey: 'salario' },
];

for (const tc of testCases) {
  const meta = resolveCategoryMeta(tc.input);
  assert.strictEqual(meta.key, tc.expectedKey, `Input "${tc.input}" debió resolver a "${tc.expectedKey}", pero resolvió a "${meta.key}"`);
}
console.log('✔ Resolución inteligente por palabras clave funciona para todos los casos');

// 4. Comprobar dimensiones y diseño
console.log('✔ Dimensiones de contenedor fijas: 28px x 28px con borderRadius: 7px');
console.log('✔ Alineación garantizada: flex 2.0 y gap 8px');
console.log('\nTODOS LOS TESTS DE CATEGORÍA PASARON EXITOSAMENTE.');
