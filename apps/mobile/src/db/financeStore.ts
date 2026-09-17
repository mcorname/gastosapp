import type { Account, Category, Transaction } from '../../../../packages/shared/src/types';
import { cents, getBalances, localDate, validMoney, validateTransaction, type Ledger, type TransactionInput } from '../../../../packages/shared/src/finance';
import { generateUUID } from '../utils/uuid';

export interface LedgerAdapter { read(): Ledger; write(data: Ledger): void; }
export type AccountInput = Pick<Account,'name'|'type'|'currency'> & Partial<Pick<Account,'initialBalance'|'color'|'icon'>>;
export class FinanceStore {
  constructor(private adapter: LedgerAdapter) {}
  read() { return this.adapter.read(); }
  private mutate<T>(fn: (ledger: Ledger) => T): T {
    const ledger = this.read();
    const result = fn(ledger);
    this.adapter.write(ledger);
    return result;
  }
  createTransaction(input: TransactionInput) {
    return this.mutate(ledger => {
      const data = validateTransaction(input, ledger);
      const now = Date.now();
      const tx: Transaction = { ...data, currency: data.currency!, id: generateUUID(), createdAt: now, updatedAt: now, source: data.source || 'manual' };
      ledger.transactions.push(tx);
      this.touchAccounts(ledger, tx);
      return tx;
    });
  }
  updateTransaction(id: string, input: TransactionInput) {
    return this.mutate(ledger => {
      const tx = ledger.transactions.find(t => t.id === id && !t.deletedAt);
      if (!tx) throw new Error('El movimiento ya no existe.');
      if (tx.type === 'adjustment') throw new Error('Los ajustes conservan su trazabilidad. Registra un nuevo ajuste.');
      const data = validateTransaction(input, ledger);
      this.touchAccounts(ledger, tx);
      Object.assign(tx, data, { updatedAt: Date.now() });
      this.touchAccounts(ledger, tx);
      return tx;
    });
  }
  deleteTransaction(id: string) {
    return this.mutate(ledger => {
      const tx = ledger.transactions.find(t => t.id === id && !t.deletedAt);
      if (!tx) return;
      tx.deletedAt = Date.now(); tx.updatedAt = tx.deletedAt;
      this.touchAccounts(ledger, tx);
    });
  }
  adjustBalance(accountId: string, newBalance: number) {
    return this.mutate(ledger => {
      validMoney(newBalance, true);
      const account = getBalances(ledger).find(a => a.id === accountId);
      if (!account) throw new Error('La cuenta no existe.');
      const difference = (cents(newBalance)-cents(account.currentBalance))/100;
      if (!difference) throw new Error('El saldo nuevo es igual al saldo actual.');
      const now = Date.now();
      const tx: Transaction = { id: generateUUID(), accountId, type: 'adjustment', amount: difference, currency: account.currency,
        merchant: 'Ajuste de saldo', date: localDate(), adjustmentPrevious: account.currentBalance, adjustmentNew: newBalance,
        createdAt: now, updatedAt: now, source: 'manual' };
      ledger.transactions.push(tx); this.touchAccounts(ledger, tx); return tx;
    });
  }
  private touchAccounts(ledger: Ledger, tx: Transaction) {
    ledger.accounts.filter(a => a.id === tx.accountId || a.id === tx.destinationAccountId).forEach(a => { a.updatedAt = Date.now(); });
  }
  private validateAccount(data: AccountInput) {
    if (!data.name?.trim() || data.name.trim().length > 80) throw new Error('El nombre debe tener entre 1 y 80 caracteres.');
    if (!['cash','bank','savings','investment','credit_card'].includes(data.type)) throw new Error('Selecciona un tipo de cuenta válido.');
    if (!['PEN','USD','EUR','COP','MXN','ARS','CLP','BRL','GBP'].includes(data.currency)) throw new Error('Selecciona una moneda válida.');
    validMoney(data.initialBalance ?? 0, true);
  }
  createAccount(input: AccountInput) {
    this.validateAccount(input);
    return this.mutate(ledger => {
      const now = Date.now();
      const a: Account = { ...input, name: input.name.trim(), initialBalance: input.initialBalance || 0, currentBalance: input.initialBalance || 0,
        color: input.color || '#0A9F72', icon: input.icon || 'account-balance-wallet', id: generateUUID(), createdAt: now, updatedAt: now };
      ledger.accounts.push(a); return a;
    });
  }
  updateAccount(id: string, input: AccountInput) {
    this.validateAccount(input);
    return this.mutate(ledger => {
      const account = ledger.accounts.find(a => a.id === id && !a.deletedAt);
      if (!account) throw new Error('La cuenta no existe.');
      const history = ledger.transactions.some(t => t.accountId === id || t.destinationAccountId === id);
      if (history && input.currency !== account.currency) throw new Error('Una cuenta con historial no puede cambiar de moneda. Crea otra cuenta.');
      Object.assign(account, { name: input.name.trim(), type: input.type, currency: input.currency, updatedAt: Date.now() });
      return account;
    });
  }
  deleteAccount(id: string) {
    this.mutate(ledger => {
      if (ledger.transactions.some(t => t.accountId === id || t.destinationAccountId === id)) throw new Error('No puedes eliminar una cuenta con movimientos asociados, incluso eliminados.');
      const a = ledger.accounts.find(a => a.id === id && !a.deletedAt);
      if (!a) throw new Error('La cuenta no existe.');
      if (a.initialBalance !== 0) throw new Error('Solo puedes eliminar una cuenta sin saldo ni movimientos.');
      a.deletedAt = Date.now(); a.updatedAt = a.deletedAt;
    });
  }
  createCategory(input: Pick<Category,'name'|'type'|'color'|'icon'>) {
    return this.mutate(ledger => {
      if (!input.name.trim() || !['income','expense'].includes(input.type)) throw new Error('Escribe un nombre y tipo de categoría válidos.');
      if (ledger.categories.some(c => !c.deletedAt && c.type === input.type && c.name.toLocaleLowerCase() === input.name.trim().toLocaleLowerCase())) throw new Error('Esta categoría ya existe.');
      const now = Date.now();
      const cat = { ...input, name: input.name.trim(), id: generateUUID(), isDefault: false, createdAt: now, updatedAt: now };
      ledger.categories.push(cat); return cat;
    });
  }
  setSetting(key: string, value: string) { this.mutate(ledger => { ledger.settings[key] = value; }); }
}
