import { getBalances } from '@ai-money/shared';
import { financeStore } from '../store';
import type { AccountInput } from '../financeStore';
export class AccountRepository {
  static getAll() { return getBalances(financeStore.read()); }
  static getById(id:string) { return this.getAll().find(a=>a.id===id) || null; }
  static create(data:AccountInput) { return financeStore.createAccount(data); }
  static update(id:string,data:AccountInput) { return financeStore.updateAccount(id,data); }
  static adjustBalance(id:string,value:number) { return financeStore.adjustBalance(id,value); }
  static delete(id:string) { return financeStore.deleteAccount(id); }
}
