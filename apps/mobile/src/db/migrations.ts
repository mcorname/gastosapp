import { CREATE_TABLES_SQL } from './schema';
export function migrateDatabase(db: {execSync(sql:string):void;getFirstSync<T>(sql:string):T|null;withTransactionSync(fn:()=>void):void}) {
  const version = db.getFirstSync<{user_version:number}>('PRAGMA user_version')?.user_version || 0;
  if (version >= 2) return;
  const exists = db.getFirstSync<{name:string}>("SELECT name FROM sqlite_master WHERE type='table' AND name='transactions'");
  db.withTransactionSync(() => {
    if (exists) db.execSync(`
      CREATE TABLE IF NOT EXISTS accounts_backup_v1 AS SELECT * FROM accounts;
      CREATE TABLE IF NOT EXISTS categories_backup_v1 AS SELECT * FROM categories;
      CREATE TABLE IF NOT EXISTS budgets_backup_v1 AS SELECT * FROM budgets;
      ALTER TABLE transactions RENAME TO transactions_backup_v1;
      DROP INDEX IF EXISTS idx_transactions_date;
      DROP INDEX IF EXISTS idx_transactions_account;
      DROP INDEX IF EXISTS idx_transactions_category;
    `);
    db.execSync(CREATE_TABLES_SQL);
    if (exists) db.execSync(`
      INSERT INTO transactions (id,account_id,category_id,amount,type,date,merchant,notes,source,currency,destination_account_id,raw_input,sync_status,created_at,updated_at,deleted_at)
      SELECT id,account_id,category_id,amount,type,date,merchant,notes,source,currency,destination_account_id,raw_input,sync_status,created_at,updated_at,deleted_at FROM transactions_backup_v1;
      INSERT INTO settings (key,value) VALUES ('migrationNotice','Saldos recalculados desde el historial. Se conservó una copia de los datos anteriores en este dispositivo.');
    `);
    db.execSync('PRAGMA user_version = 2');
  });
}
