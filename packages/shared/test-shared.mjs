import { ExtractedTransactionSchema, CreateTransactionSchema, DEFAULT_EXPENSE_CATEGORIES } from './dist/index.js';

console.log('--- Probando esquemas compartidos @ai-money/shared ---');

// Test 1: Extracted Transaction Schema
const validExtracted = {
  amount: 25000,
  currency: 'COP',
  type: 'expense',
  category: 'Alimentación',
  merchant: 'Crepes & Waffles',
  date: new Date().toISOString(),
  confidence: 0.95,
};

const result = ExtractedTransactionSchema.safeParse(validExtracted);
if (!result.success) {
  console.error('FAIL: Error validando ExtractedTransactionSchema', result.error);
  process.exit(1);
}
console.log('✔ ExtractedTransactionSchema validó correctamente:', result.data.merchant, result.data.amount);

// Test 2: Categorías por defecto
if (DEFAULT_EXPENSE_CATEGORIES.length < 5) {
  console.error('FAIL: Categorías por defecto insuficientes');
  process.exit(1);
}
console.log(`✔ Categorías por defecto cargadas: ${DEFAULT_EXPENSE_CATEGORIES.length} categorías`);

console.log('TODAS LAS PRUEBAS DE SHARED PASARON CON ÉXITO');
