import * as SQLite from 'expo-sqlite';
import type { Ledger } from '../../../../packages/shared/src/finance';
import { fromRows, toRows, initialLedger } from './serialization';
import { migrateDatabase } from './migrations';
let dbInstance: SQLite.SQLiteDatabase | null = null;
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) dbInstance = SQLite.openDatabaseSync('aimoney.db');
  return dbInstance;
}
export function readLedger(): Ledger {
  const db = getDatabase();
  const settings = Object.fromEntries(db.getAllSync<{key:string;value:string}>('SELECT * FROM settings').map(r => [r.key,r.value]));
  return fromRows({ accounts:db.getAllSync('SELECT * FROM accounts'),categories:db.getAllSync('SELECT * FROM categories'),transactions:db.getAllSync('SELECT * FROM transactions'),budgets:db.getAllSync('SELECT * FROM budgets'),settings });
}
export function writeLedger(ledger: Ledger): void {
  const db = getDatabase();
  const rows = toRows(ledger);
  db.withTransactionSync(() => {
    for (const table of ['accounts','categories','transactions'] as const) {
      for (const row of rows[table]) {
        const columns = Object.keys(row);
        db.runSync(`INSERT INTO ${table} (${columns.join(',')}) VALUES (${columns.map(()=>'?').join(',')}) ON CONFLICT(id) DO UPDATE SET ${columns.filter(k=>k!=='id').map(k=>`${k}=excluded.${k}`).join(',')}`, columns.map(k => row[k] ?? null));
      }
    }
    for (const [key,value] of Object.entries(ledger.settings)) db.runSync('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',[key,value]);
  });
}
export function getPreference(key: string): string | undefined { return readLedger().settings[key]; }
export async function initDatabase() {
  const db = getDatabase(); migrateDatabase(db);
  const ledger = readLedger();
  if (!ledger.categories.length || !ledger.accounts.length) {
    const init = initialLedger();
    if (!ledger.categories.length) ledger.categories = init.categories;
    if (!ledger.accounts.length) {
      ledger.accounts = init.accounts;
      ledger.transactions = init.transactions;
      ledger.settings = { ...init.settings, ...ledger.settings };
    }
    writeLedger(ledger);
  }
  return db;
}
