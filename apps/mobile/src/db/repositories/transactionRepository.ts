import { enrichedTransactions, monthlyStats, type TransactionInput } from '@ai-money/shared';
import { financeStore } from '../store';
export type EnrichedTransaction = ReturnType<typeof enrichedTransactions>[number];
export class TransactionRepository {
  static getAll(limit?: number, offset = 0) { const rows = enrichedTransactions(financeStore.read()); return limit ? rows.slice(offset,offset+limit) : rows.slice(offset); }
  static create(data: TransactionInput) { const tx = financeStore.createTransaction(data); return this.getAll().find(t=>t.id===tx.id)!; }
  static update(id:string,data:TransactionInput) { financeStore.updateTransaction(id,data); return this.getAll().find(t=>t.id===id)!; }
  static delete(id:string) { financeStore.deleteTransaction(id); }
  static getMonthlyStats(month:string,currency='PEN') { return monthlyStats(financeStore.read(),month,currency); }
}
