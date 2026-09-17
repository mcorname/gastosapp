import test from 'node:test';
import assert from 'node:assert/strict';

test('web SQL adapter subtracts expenses and rolls back failed operations', async () => {
  const { WebDatabase } = await import('../apps/mobile/src/db/database.web');
  const db = new WebDatabase();
  db.runSync('INSERT INTO accounts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', ['regression','Caja','cash',500,500,'PEN','green','wallet',1,1]);
  db.runSync('UPDATE accounts SET current_balance = current_balance - ?, updated_at = ? WHERE id = ?', [35,2,'regression']);
  assert.equal(db.getFirstSync<any>('SELECT * FROM accounts WHERE id = ?', ['regression']).current_balance, 465);
  assert.throws(() => db.withTransactionSync(() => {
    db.runSync('UPDATE accounts SET current_balance = current_balance + ?, updated_at = ? WHERE id = ?', [10,3,'regression']);
    throw new Error('fail');
  }));
  assert.equal(db.getFirstSync<any>('SELECT * FROM accounts WHERE id = ?', ['regression']).current_balance, 465);
});
