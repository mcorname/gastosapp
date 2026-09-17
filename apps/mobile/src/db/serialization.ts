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
  const now = Date.now();
  return { accounts: [], transactions: [], budgets: [], settings: {}, categories: [...DEFAULT_EXPENSE_CATEGORIES,...DEFAULT_INCOME_CATEGORIES].map(c => ({...c,id:generateUUID(),isDefault:true,createdAt:now,updatedAt:now})) };
}
