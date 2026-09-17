import test from 'node:test';
import assert from 'node:assert/strict';
import { FinanceStore } from '../apps/mobile/src/db/financeStore';
import { getBalances, monthlyStats, validateDate, filterTransactions } from '../packages/shared/src/finance';

function fixture() {
  let data: any = { accounts: [
    { id: 'cash', name: 'Efectivo', type: 'cash', currency: 'PEN', initialBalance: 500, createdAt: 1, updatedAt: 1 },
    { id: 'bank', name: 'BCP', type: 'bank', currency: 'PEN', initialBalance: 1000, createdAt: 1, updatedAt: 1 },
  ], categories: [{ id: 'food', name: 'Alimentación', type: 'expense' }, { id: 'salary', name: 'Salario', type: 'income' }], transactions: [], budgets: [], settings: {} };
  const store = new FinanceStore({ read: () => structuredClone(data), write: (next: any) => { data = structuredClone(next); } });
  return { store, data: () => data };
}
const expense = { accountId: 'cash', categoryId: 'food', amount: 35, type: 'expense' as const, merchant: 'Almuerzo', date: '2026-09-17' };

test('income/expense/transfer/edit/delete derive consistent balances and monthly totals', () => {
  const { store, data } = fixture();
  const tx = store.createTransaction(expense);
  store.createTransaction({ ...expense, amount: 100, type: 'income', categoryId: 'salary' });
  const transfer = store.createTransaction({ ...expense, amount: 100, type: 'transfer', categoryId: undefined, destinationAccountId: 'bank' });
  assert.deepEqual(getBalances(data()).map(a => a.currentBalance), [465, 1100]);
  assert.equal(monthlyStats(data(), '2026-09', 'PEN').totalExpense, 35);
  assert.equal(monthlyStats(data(), '2026-09', 'PEN').totalIncome, 100);
  store.updateTransaction(tx.id, { ...expense, amount: 50, accountId: 'bank' });
  assert.deepEqual(getBalances(data()).map(a => a.currentBalance), [500, 1050]);
  store.deleteTransaction(transfer.id);
  store.deleteTransaction(transfer.id);
  assert.deepEqual(getBalances(data()).map(a => a.currentBalance), [600, 950]);
});
test('adjustments retain snapshots and do not count as income or expense', () => {
  const { store, data } = fixture();
  const tx = store.adjustBalance('cash', 568.68);
  assert.equal(tx.amount, 68.68);
  assert.equal(tx.adjustmentPrevious, 500);
  assert.equal(tx.adjustmentNew, 568.68);
  store.adjustBalance('cash', 400);
  assert.equal(getBalances(data())[0].currentBalance, 400);
  assert.equal(monthlyStats(data(), new Date().toISOString().slice(0,7), 'PEN').totalIncome, 0);
  assert.equal(monthlyStats(data(), new Date().toISOString().slice(0,7), 'PEN').totalExpense, 0);
});
test('financial validation rejects invalid money, references and dates without mutations', () => {
  const { store, data } = fixture();
  for (const amount of [0, -1, NaN, Infinity, 1.001]) assert.throws(() => store.createTransaction({ ...expense, amount }));
  for (const patch of [{ accountId: 'missing' }, { categoryId: 'missing' }, { categoryId: 'salary' }, { date: '2026-02-30' }, { merchant: '' }, { type: 'transfer', destinationAccountId: 'cash' }]) {
    assert.throws(() => store.createTransaction({ ...expense, ...patch } as any));
  }
  assert.equal(data().transactions.length, 0);
  assert.throws(() => validateDate('2026-13-01'));
});
test('account deletion protects source, destination and soft deleted history', () => {
  const { store } = fixture();
  const tx = store.createTransaction({ ...expense, type: 'transfer', categoryId: undefined, destinationAccountId: 'bank' });
  store.deleteTransaction(tx.id);
  assert.throws(() => store.deleteAccount('bank'));
  assert.throws(() => store.deleteAccount('cash'));
  assert.throws(() => store.updateAccount('cash', { name: 'Caja', type: 'cash', currency: 'USD' }));
});
test('cent arithmetic avoids drift and all transactions remain searchable', () => {
  const { store, data } = fixture();
  for (let i=0;i<110;i++) store.createTransaction({ ...expense, amount: 0.1, merchant: `Almuerzo ${i}` });
  assert.equal(getBalances(data())[0].currentBalance, 489);
  assert.equal(monthlyStats(data(), '2026-09', 'PEN').totalExpense, 11);
  assert.equal(filterTransactions(data(), { query: 'Almuerzo 109' }).length, 1);
  assert.equal(filterTransactions(data(), { query: 'efectivo', accountId: 'cash', startDate: '2026-09-17', endDate: '2026-09-17' }).length, 110);
});
