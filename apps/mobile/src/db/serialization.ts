import type { Ledger } from '../../../../packages/shared/src/finance';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@ai-money/shared';
import { generateUUID } from '../utils/uuid';

export interface RawState { accounts: any[]; categories: any[]; transactions: any[]; budgets: any[]; settings?: Record<string,string>; }
export function fromRows(raw: RawState): Ledger {
  const base = (r: any) => ({id:r.id,createdAt:r.created_at,updatedAt:r.updated_at,deletedAt:r.deleted_at});
  return {
    accounts: raw.accounts.map(r => ({...base(r),name:r.name,type:r.type,initialBalance:r.initial_balance,currentBalance:r.current_balance,currency:r.currency,color:r.color,icon:r.icon})),
    categories: raw.categories.map(r => ({...base(r),name:r.name,type:r.type,icon:r.icon,color:r.color,isDefault:!!r.is_default})),
    transactions: raw.transactions.map(r => ({...base(r),accountId:r.account_id,categoryId:r.category_id || undefined,amount:r.amount,type:r.type,date:r.date,merchant:r.merchant,notes:r.notes || undefined,source:r.source,currency:r.currency,destinationAccountId:r.destination_account_id || undefined,rawInput:r.raw_input || undefined,syncStatus:r.sync_status,adjustmentPrevious:r.adjustment_previous ?? undefined,adjustmentNew:r.adjustment_new ?? undefined})),
    budgets: raw.budgets, settings: raw.settings || {},
  };
}
export function toRows(ledger: Ledger): RawState {
  const base = (r:any) => ({id:r.id,created_at:r.createdAt,updated_at:r.updatedAt,deleted_at:r.deletedAt ?? null});
  return {
    accounts: ledger.accounts.map(r => ({...base(r),name:r.name,type:r.type,initial_balance:r.initialBalance,current_balance:r.currentBalance,currency:r.currency,color:r.color,icon:r.icon})),
    categories: ledger.categories.map(r => ({...base(r),name:r.name,type:r.type,icon:r.icon,color:r.color,is_default:r.isDefault ? 1 : 0})),
    transactions: ledger.transactions.map(r => ({...base(r),account_id:r.accountId,category_id:r.categoryId || null,amount:r.amount,type:r.type,date:r.date,merchant:r.merchant,notes:r.notes || null,source:r.source,currency:r.currency,destination_account_id:r.destinationAccountId || null,raw_input:r.rawInput || null,sync_status:r.syncStatus || 'synced',adjustment_previous:r.adjustmentPrevious ?? null,adjustment_new:r.adjustmentNew ?? null})),
    budgets: ledger.budgets as any[], settings:ledger.settings,
  };
}
export function initialLedger(): Ledger {
  const now = 1770000000000;
  const categories = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES].map((c, i) => ({
    ...c,
    id: `cat-${i + 1}-${c.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  }));

  const catVivienda = categories.find(c => c.name.includes('Vivienda'))?.id || categories[0].id;
  const catCompras = categories.find(c => c.name.includes('Compras'))?.id || categories[0].id;
  const catSalario = categories.find(c => c.name.includes('Salario'))?.id || categories.find(c => c.type === 'income')?.id || 'cat-salario';

  const accounts = [
    {
      id: 'acc-bcp',
      name: 'Cuenta Bancaria (BCP / Interbank)',
      type: 'bank' as const,
      initialBalance: 10000,
      currentBalance: 10000,
      currency: 'PEN',
      color: '#3B82F6',
      icon: 'account-balance',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'acc-efectivo',
      name: 'Efectivo (Billetera)',
      type: 'cash' as const,
      initialBalance: 500,
      currentBalance: 500,
      currency: 'PEN',
      color: '#10B981',
      icon: 'wallet',
      createdAt: now,
      updatedAt: now,
    },
  ];

  const recurringList = [
    { merchant: 'WIN', amount: 130.00, catId: catVivienda, notes: 'Internet Fibra', day: 5 },
    { merchant: 'AGUA CHORRILLOS', amount: 65.30, catId: catVivienda, notes: 'Servicio de Agua Chorrillos', day: 8 },
    { merchant: 'AGUA SURCO', amount: 112.00, catId: catVivienda, notes: 'Servicio de Agua Surco', day: 8 },
    { merchant: 'LUZ CHORRILLOS', amount: 141.60, catId: catVivienda, notes: 'Luz del Sur Chorrillos', day: 10 },
    { merchant: 'LUZ SURCO', amount: 969.60, catId: catVivienda, notes: 'Luz del Sur Surco', day: 10 },
    { merchant: 'GAS CHORRILLOS 01', amount: 22.00, catId: catVivienda, notes: 'Gas Natural Cálidda 01', day: 12 },
    { merchant: 'GAS CHORRILLOS 02', amount: 33.00, catId: catVivienda, notes: 'Gas Natural Cálidda 02', day: 12 },
    { merchant: 'MOVISTAR SURCO', amount: 126.67, catId: catVivienda, notes: 'Telefónica / Movistar Surco', day: 14 },
    { merchant: 'SAGA', amount: 158.00, catId: catCompras, notes: 'Tarjeta Saga Falabella', day: 18 },
    { merchant: 'CELULAR BRENDA', amount: 29.00, catId: catVivienda, notes: 'Plan móvil Brenda', day: 20 },
    { merchant: 'CELULAR MARIO', amount: 62.00, catId: catVivienda, notes: 'Plan móvil Mario', day: 20 },
    { merchant: 'CELULAR DIANA', amount: 43.00, catId: catVivienda, notes: 'Plan móvil Diana', day: 20 },
  ];

  const months = ['2026-06', '2026-07', '2026-08', '2026-09'];
  const transactions: any[] = [];

  for (const m of months) {
    transactions.push({
      id: `tx-sueldo-${m}`,
      accountId: 'acc-bcp',
      categoryId: catSalario,
      amount: 5000.00,
      type: 'income' as const,
      date: `${m}-01`,
      merchant: 'Sueldo Mario',
      notes: 'Ingreso mensual empresa',
      source: 'manual',
      currency: 'PEN',
      syncStatus: 'synced',
      createdAt: now,
      updatedAt: now,
    });

    for (const exp of recurringList) {
      const dayStr = String(exp.day).padStart(2, '0');
      const slug = exp.merchant.toLowerCase().replace(/[^a-z0-9]/g, '-');
      transactions.push({
        id: `tx-${slug}-${m}`,
        accountId: 'acc-bcp',
        categoryId: exp.catId,
        amount: exp.amount,
        type: 'expense' as const,
        date: `${m}-${dayStr}`,
        merchant: exp.merchant,
        notes: exp.notes,
        source: 'manual',
        currency: 'PEN',
        syncStatus: 'synced',
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return {
    accounts,
    categories,
    transactions,
    budgets: [],
    settings: {
      profileName: 'Mario',
      hideAmounts: 'false',
    },
  };
}

