import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, type Ledger } from '@ai-money/shared';
import { generateUUID } from '../utils/uuid';
import { fromRows, toRows, initialLedger } from './serialization';

interface WebDBState {
  accounts: any[];
  categories: any[];
  transactions: any[];
  budgets: any[];
}

const STORAGE_KEY = 'ai_money_web_db_v5';
const LEGACY_KEY = 'ai_money_web_db_v4';
let inTransaction = false;

function loadState(): WebDBState {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed || typeof parsed !== 'object' || !['accounts','categories','transactions','budgets'].every(k => Array.isArray(parsed[k]))) {
          throw new Error('Datos locales dañados. Restaura una copia de seguridad.');
        }
        return parsed;
      }
    }
  } catch (e) {
    throw new Error('No se pudieron leer los datos locales. No se ha sobrescrito tu información.');
  }
  return { accounts: [], categories: [], transactions: [], budgets: [] };
}

function saveState(state: WebDBState) {
  if (inTransaction) return;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch (e) {
    throw new Error('No se pudo guardar. Revisa el espacio y los permisos del almacenamiento local.');
  }
}

let state: WebDBState = loadState();

export class WebDatabase {
  execSync(_sql: string): void {
    // No-op for DDL in web environment
  }

  runSync(sql: string, params: any[] = []): any {
    const cleanSql = sql.trim();

    // 1. INSERT INTO categories
    if (/^INSERT INTO categories/i.test(cleanSql)) {
      const [id, name, icon, color, type, is_default, created_at, updated_at] = params;
      state.categories.push({
        id,
        name,
        icon,
        color,
        type,
        is_default: Number(is_default),
        created_at,
        updated_at,
        deleted_at: null,
      });
      saveState(state);
      return { changes: 1 };
    }

    // 2. INSERT INTO accounts
    if (/^INSERT INTO accounts/i.test(cleanSql)) {
      const [id, name, type, initial_balance, current_balance, currency, color, icon, created_at, updated_at] = params;
      state.accounts.push({
        id,
        name,
        type,
        initial_balance,
        current_balance,
        currency,
        color,
        icon,
        created_at,
        updated_at,
        deleted_at: null,
      });
      saveState(state);
      return { changes: 1 };
    }

    // 3. INSERT INTO transactions
    if (/^INSERT INTO transactions/i.test(cleanSql)) {
      const [id, account_id, category_id, amount, type, date, merchant, notes, source, currency, raw_input, created_at, updated_at] = params;
      state.transactions.unshift({
        id,
        account_id,
        category_id,
        amount,
        type,
        date,
        merchant,
        notes,
        source: typeof source === 'string' ? source : 'manual',
        currency: typeof currency === 'string' && currency.length === 3 ? currency : 'PEN',
        raw_input: typeof raw_input === 'string' ? raw_input : null,
        sync_status: 'synced',
        created_at: Number(created_at) || Date.now(),
        updated_at: Number(updated_at) || Date.now(),
        deleted_at: null,
      });
      saveState(state);
      return { changes: 1 };
    }

    // 4. UPDATE accounts SET current_balance = current_balance + ?
    if (/^UPDATE accounts SET current_balance/i.test(cleanSql)) {
      const [delta, updatedAt, accountId] = params;
      const acc = state.accounts.find((a) => a.id === accountId);
      if (acc) {
        acc.current_balance += /current_balance\s*-/.test(cleanSql) ? -delta : delta;
        acc.updated_at = updatedAt;
        saveState(state);
      }
      return { changes: 1 };
    }

    // 5. Soft delete accounts
    if (/^UPDATE accounts SET deleted_at/i.test(cleanSql)) {
      const [deletedAt, updatedAt, id] = params;
      const acc = state.accounts.find((a) => a.id === id);
      if (acc) {
        acc.deleted_at = deletedAt;
        acc.updated_at = updatedAt;
        saveState(state);
      }
      return { changes: 1 };
    }

    // 6. Soft delete transactions
    if (/^UPDATE transactions SET deleted_at/i.test(cleanSql)) {
      const [deletedAt, updatedAt, id] = params;
      const tx = state.transactions.find((t) => t.id === id);
      if (tx) {
        tx.deleted_at = deletedAt;
        tx.updated_at = updatedAt;
        saveState(state);
      }
      return { changes: 1 };
    }

    return { changes: 0 };
  }

  getFirstSync<T>(sql: string, params: any[] = []): T | null {
    const cleanSql = sql.trim();

    // COUNT categories
    if (/SELECT COUNT\(\*\) as count FROM categories/i.test(cleanSql)) {
      const active = state.categories.filter((c) => !c.deleted_at);
      return { count: active.length } as unknown as T;
    }

    // COUNT accounts
    if (/SELECT COUNT\(\*\) as count FROM accounts/i.test(cleanSql)) {
      const active = state.accounts.filter((a) => !a.deleted_at);
      return { count: active.length } as unknown as T;
    }

    // SELECT id, currency FROM accounts WHERE deleted_at IS NULL ORDER BY created_at ASC LIMIT 1
    if (/FROM accounts WHERE deleted_at IS NULL/i.test(cleanSql)) {
      const active = state.accounts.filter((a) => !a.deleted_at);
      return (active[0] || null) as unknown as T;
    }

    // SELECT id FROM transactions WHERE merchant = ? AND date LIKE ?
    if (/FROM transactions WHERE merchant =/i.test(cleanSql)) {
      const [merchant, datePattern] = params;
      const cleanPattern = (datePattern || '').replace('%', '');
      const tx = state.transactions.find(
        (t) => t.merchant === merchant && t.date.startsWith(cleanPattern) && !t.deleted_at
      );
      return (tx || null) as unknown as T;
    }

    // SELECT * FROM accounts WHERE id = ?
    if (/SELECT \* FROM accounts WHERE id =/i.test(cleanSql)) {
      const id = params[0];
      const acc = state.accounts.find((a) => a.id === id && !a.deleted_at);
      return (acc || null) as unknown as T;
    }

    // SELECT * FROM categories WHERE LOWER(name) = LOWER(?) AND type = ?
    if (/SELECT \* FROM categories WHERE LOWER\(name\)/i.test(cleanSql)) {
      const [name, type] = params;
      const cat = state.categories.find(
        (c) => c.name.toLowerCase() === String(name).toLowerCase() && c.type === type && !c.deleted_at
      );
      return (cat || null) as unknown as T;
    }

    // SELECT t.* ... FROM transactions t ... WHERE t.id = ?
    if (/FROM transactions t/i.test(cleanSql) && /WHERE t\.id =/i.test(cleanSql)) {
      const id = params[0];
      const tx = state.transactions.find((t) => t.id === id && !t.deleted_at);
      if (!tx) return null;
      const acc = state.accounts.find((a) => a.id === tx.account_id);
      const cat = state.categories.find((c) => c.id === tx.category_id);
      return {
        ...tx,
        account_name: acc?.name || 'Cuenta',
        category_name: cat?.name || 'Categoría',
        category_icon: cat?.icon || 'category',
        category_color: cat?.color || '#64748B',
      } as unknown as T;
    }

    // SELECT account_id, amount, type FROM transactions WHERE id = ?
    if (/SELECT account_id, amount, type FROM transactions WHERE id =/i.test(cleanSql)) {
      const id = params[0];
      const tx = state.transactions.find((t) => t.id === id);
      return (tx || null) as unknown as T;
    }

    // Monthly summary: SELECT SUM(CASE WHEN type = 'income' ...)
    if (/SELECT\s+SUM\(CASE WHEN type = 'income'/i.test(cleanSql)) {
      const monthPrefix = (params[0] || '').replace('%', '');
      const active = state.transactions.filter(
        (t) => !t.deleted_at && t.date.startsWith(monthPrefix)
      );
      const totalIncome = active
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpense = active
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return {
        total_income: totalIncome,
        total_expense: totalExpense,
      } as unknown as T;
    }

    return null;
  }

  getAllSync<T>(sql: string, params: any[] = []): T[] {
    const cleanSql = sql.trim();

    // SELECT * FROM accounts WHERE deleted_at IS NULL ORDER BY created_at ASC
    if (/FROM accounts WHERE deleted_at IS NULL/i.test(cleanSql)) {
      const active = state.accounts.filter((a) => !a.deleted_at);
      active.sort((a, b) => a.created_at - b.created_at);
      return active as unknown as T[];
    }

    // SELECT * FROM categories WHERE deleted_at IS NULL
    if (/FROM categories WHERE deleted_at IS NULL/i.test(cleanSql)) {
      let active = state.categories.filter((c) => !c.deleted_at);
      if (params.length > 0 && params[0]) {
        active = active.filter((c) => c.type === params[0]);
      }
      active.sort((a, b) => (b.is_default || 0) - (a.is_default || 0));
      return active as unknown as T[];
    }

    // Top categories: SELECT c.name, c.icon, c.color, SUM(t.amount) as total FROM transactions t JOIN categories c
    if (/SELECT c\.name, c\.icon, c\.color, SUM\(t\.amount\) as total/i.test(cleanSql)) {
      const monthPrefix = (params[0] || '').replace('%', '');
      const activeExpenses = state.transactions.filter(
        (t) => !t.deleted_at && t.type === 'expense' && t.date.startsWith(monthPrefix)
      );

      const map = new Map<string, { name: string; icon: string; color: string; total: number }>();
      for (const tx of activeExpenses) {
        const cat = state.categories.find((c) => c.id === tx.category_id);
        const name = cat?.name || 'Varios';
        const current = map.get(name) || {
          name,
          icon: cat?.icon || 'category',
          color: cat?.color || '#EF4444',
          total: 0,
        };
        current.total += Number(tx.amount);
        map.set(name, current);
      }

      const list = Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 5);
      return list as unknown as T[];
    }

    // SELECT t.*, COALESCE(a.name... FROM transactions t LEFT JOIN accounts a ...
    if (/FROM transactions t/i.test(cleanSql)) {
      const limit = params[0] || 100;
      const offset = params[1] || 0;
      const active = state.transactions.filter((t) => !t.deleted_at);
      active.sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return b.created_at - a.created_at;
      });

      const sliced = active.slice(offset, offset + limit);
      const enriched = sliced.map((tx) => {
        const acc = state.accounts.find((a) => a.id === tx.account_id);
        const cat = state.categories.find((c) => c.id === tx.category_id);
        return {
          ...tx,
          account_name: acc?.name || 'Cuenta',
          category_name: cat?.name || 'Categoría',
          category_icon: cat?.icon || 'category',
          category_color: cat?.color || '#64748B',
        };
      });

      return enriched as unknown as T[];
    }

    return [];
  }

  withTransactionSync(fn: () => void): void {
    const before = JSON.parse(JSON.stringify(state));
    inTransaction = true;
    try { fn(); inTransaction = false; saveState(state); }
    catch (error) { state = before; throw error; }
    finally { inTransaction = false; }
  }
}

let webDbInstance: WebDatabase | null = null;

export function getDatabase(): WebDatabase {
  if (!webDbInstance) {
    webDbInstance = new WebDatabase();
  }
  return webDbInstance;
}

export function readLedger(): Ledger { return fromRows(JSON.parse(JSON.stringify(state))); }
export function writeLedger(ledger: Ledger): void {
  const next = toRows(ledger);
  saveState(next);
  state = next;
}
export function getPreference(key: string): string | undefined { return readLedger().settings[key]; }
export async function initDatabase(): Promise<WebDatabase> {
  if (typeof window !== 'undefined' && window.localStorage) {
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      if (legacy && !window.localStorage.getItem(`${LEGACY_KEY}_backup`)) window.localStorage.setItem(`${LEGACY_KEY}_backup`, legacy);
      const ledger = legacy ? readLedger() : initialLedger();
      if (legacy) ledger.settings.migrationNotice = 'Saldos recalculados desde el historial. Se conservó una copia de los datos anteriores en este dispositivo.';
      writeLedger(ledger);
    } else {
      const current = readLedger();
      if (!current.accounts.length && !current.transactions.length) {
        writeLedger(initialLedger());
      }
    }
  } else if (!state.categories.length || !state.accounts.length) {
    writeLedger(initialLedger());
  }
  return getDatabase();
}


