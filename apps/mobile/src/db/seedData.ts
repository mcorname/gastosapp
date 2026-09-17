import { generateUUID } from '../utils/uuid';

export interface MonthlyExpenseTemplate {
  merchant: string;
  amount: number;
  categoryName: string;
  notes?: string;
  dayOfMonth: number;
}

export const RECURRING_EXPENSES: MonthlyExpenseTemplate[] = [
  { merchant: 'WIN', amount: 130.00, categoryName: 'Vivienda y Servicios', notes: 'Internet Fibra', dayOfMonth: 5 },
  { merchant: 'AGUA CHORRILLOS', amount: 65.30, categoryName: 'Vivienda y Servicios', notes: 'Servicio de Agua Chorrillos', dayOfMonth: 8 },
  { merchant: 'AGUA SURCO', amount: 112.00, categoryName: 'Vivienda y Servicios', notes: 'Servicio de Agua Surco', dayOfMonth: 8 },
  { merchant: 'LUZ CHORRILLOS', amount: 141.60, categoryName: 'Vivienda y Servicios', notes: 'Luz del Sur Chorrillos', dayOfMonth: 10 },
  { merchant: 'LUZ SURCO', amount: 969.60, categoryName: 'Vivienda y Servicios', notes: 'Luz del Sur Surco', dayOfMonth: 10 },
  { merchant: 'GAS CHORRILLOS 01', amount: 22.00, categoryName: 'Vivienda y Servicios', notes: 'Gas Natural Cálidda 01', dayOfMonth: 12 },
  { merchant: 'GAS CHORRILLOS 02', amount: 33.00, categoryName: 'Vivienda y Servicios', notes: 'Gas Natural Cálidda 02', dayOfMonth: 12 },
  { merchant: 'MOVISTAR SURCO', amount: 126.67, categoryName: 'Vivienda y Servicios', notes: 'Telefónica / Movistar Surco', dayOfMonth: 14 },
  { merchant: 'SAGA', amount: 158.00, categoryName: 'Compras y Ropa', notes: 'Tarjeta Saga Falabella', dayOfMonth: 18 },
  { merchant: 'CELULAR BRENDA', amount: 29.00, categoryName: 'Vivienda y Servicios', notes: 'Plan móvil Brenda', dayOfMonth: 20 },
  { merchant: 'CELULAR MARIO', amount: 62.00, categoryName: 'Vivienda y Servicios', notes: 'Plan móvil Mario', dayOfMonth: 20 },
  { merchant: 'CELULAR DIANA', amount: 43.00, categoryName: 'Vivienda y Servicios', notes: 'Plan móvil Diana', dayOfMonth: 20 },
];

export const MONTHS_TO_SEED = ['2026-06', '2026-07', '2026-08', '2026-09'];

/**
 * Inserta los registros recurrentes desde junio hasta septiembre
 */
export function seedRecurringExpenses(db: any) {
  // 1. Obtener cuenta principal
  let accountRow = db.getFirstSync(
    "SELECT id, currency FROM accounts WHERE deleted_at IS NULL ORDER BY created_at ASC LIMIT 1"
  );

  let accountId = accountRow?.id;
  let currency = accountRow?.currency || 'PEN';

  if (!accountId) {
    accountId = generateUUID();
    const now = Date.now();
    db.runSync(
      `INSERT INTO accounts (id, name, type, initial_balance, current_balance, currency, color, icon, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [accountId, 'Cuenta Principal (Soles)', 'bank', 10000, 10000, 'PEN', '#10B981', 'account-balance', now, now]
    );
    currency = 'PEN';
  }

  // 2. Obtener categorías
  const categories = db.getAllSync("SELECT id, name FROM categories WHERE deleted_at IS NULL");
  const getCategoryId = (name: string): string => {
    const found = categories.find((c: any) => c.name.toLowerCase().includes(name.toLowerCase()));
    return found ? found.id : categories[0]?.id || generateUUID();
  };

  const catVivienda = getCategoryId('Vivienda');
  const catCompras = getCategoryId('Compras');

  // 3. Insertar por cada mes desde junio hasta septiembre
  for (const monthStr of MONTHS_TO_SEED) {
    for (const item of RECURRING_EXPENSES) {
      // Verificar si ya existe para evitar duplicar
      const dayStr = String(item.dayOfMonth).padStart(2, '0');
      const dateStr = `${monthStr}-${dayStr}T12:00:00.000Z`;

      const existing = db.getFirstSync(
        "SELECT id FROM transactions WHERE merchant = ? AND date LIKE ? AND deleted_at IS NULL",
        [item.merchant, `${monthStr}%`]
      );

      if (!existing) {
        const id = generateUUID();
        const now = Date.now();
        const categoryId = item.categoryName === 'Compras y Ropa' ? catCompras : catVivienda;

        db.runSync(
          `INSERT INTO transactions (
            id, account_id, category_id, amount, type, date, merchant, 
            notes, source, currency, raw_input, sync_status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?, ?)`,
          [
            id,
            accountId,
            categoryId,
            item.amount,
            'expense',
            dateStr,
            item.merchant,
            item.notes || null,
            'manual',
            currency,
            null,
            now,
            now,
          ]
        );

        // Descontar del balance de la cuenta
        db.runSync(
          'UPDATE accounts SET current_balance = current_balance - ?, updated_at = ? WHERE id = ?',
          [item.amount, now, accountId]
        );
      }
    }
  }
}
