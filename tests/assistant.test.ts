import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMoneyInput, parseTransactionText, createFinancialReply } from '../packages/shared/src/assistant.ts';

const options = {
  accounts: [{ id: 'cash', name: 'Efectivo', currency: 'PEN' }, { id: 'bank', name: 'BCP', currency: 'PEN' }],
  categories: [{ id: 'food', name: 'Alimentación', type: 'expense' }, { id: 'utilities', name: 'Vivienda y Servicios', type: 'expense' }, { id: 'salary', name: 'Salario', type: 'income' }],
  date: '2026-09-17',
};
test('money retains complete integers, decimals and valid grouped thousands', () => {
  for (const [input, expected] of [['3700', 3700], ['130.50', 130.5], ['130,50', 130.5], ['1,892.17', 1892.17], ['1.892,17', 1892.17], ['1,892', 1892]] as const) assert.equal(parseMoneyInput(input), expected);
  for (const input of ['', '-35', 'NaN', '1,2,3', '35 pesos', '0']) assert.throws(() => parseMoneyInput(input));
});
test('expense and salary extraction resolves only real categories and accounts', () => {
  const lunch = parseTransactionText('Gasté 35 soles en almuerzo', options);
  assert.equal(lunch.amount, 35); assert.equal(lunch.categoryId, 'food'); assert.equal(lunch.accountId, undefined); assert.ok(lunch.warnings.length);
  const internet = parseTransactionText('Pagué 120 soles de internet con mi BCP', options);
  assert.equal(internet.type, 'expense'); assert.equal(internet.accountId, 'bank'); assert.equal(internet.categoryId, 'utilities');
  const salary = parseTransactionText('Me depositaron 3700 de sueldo', options);
  assert.equal(salary.amount, 3700); assert.equal(salary.type, 'income'); assert.equal(salary.categoryId, 'salary');
});
test('missing and ambiguous amounts or accounts are not invented', () => {
  assert.throws(() => parseTransactionText('Gasté en almuerzo', options));
  assert.throws(() => parseTransactionText('Gasté -35 soles', options));
  assert.throws(() => parseTransactionText('Gasté - 35 soles', options));
  assert.throws(() => parseTransactionText('Gasté −35 soles', options));
  assert.throws(() => parseTransactionText('Gasté .50 soles en comida', options));
  assert.throws(() => parseTransactionText('Gasté S/.50 en comida', options));
  assert.throws(() => parseTransactionText('Gasté 35 mil soles en comida', options));
  assert.throws(() => parseTransactionText('Gasté 35 y 20 soles', options));
  const ambiguous = parseTransactionText('Gasté 35 con BCP', { ...options, accounts: [...options.accounts, { id: 'second', name: 'BCP ahorro', currency: 'PEN' }] });
  assert.equal(ambiguous.accountId, undefined);
  const unknown = parseTransactionText('Gasté 35 con BBVA', { ...options, accounts: [options.accounts[0]] });
  assert.equal(unknown.accountId, undefined);
  assert.equal(parseTransactionText('Me pagaron 3700', options).type, 'income');
});
test('dates use current context and validate explicit dates', () => {
  assert.equal(parseTransactionText('Gasté 35 soles', options).date, '2026-09-17');
  assert.equal(parseTransactionText('Gasté 35 soles el 12/08', options).date, '2026-08-12');
  assert.throws(() => parseTransactionText('Gasté 35 soles el 31/02', options));
  assert.equal(parseTransactionText('Gasté 35 soles el 12 de agosto', options).date, '2026-08-12');
  assert.equal(parseTransactionText('Gasté 35 soles el 2026-08-12', options).date, '2026-08-12');
  assert.equal(parseTransactionText('Gasté 35 soles ayer', options).date, '2026-09-16');
  assert.equal(parseTransactionText('Gasté 35 soles anteayer', { ...options, date: '2026-03-01' }).date, '2026-02-27');
});
test('explicit currencies are preserved and incompatible accounts remain unresolved', () => {
  const dollar = parseTransactionText('Gasté 35 dólares', { ...options, accounts: [options.accounts[0]] });
  assert.equal(dollar.currency, 'USD'); assert.equal(dollar.accountId, undefined); assert.ok(dollar.warnings.length);
  const mismatch = parseTransactionText('Gasté 35 USD con BCP', options);
  assert.equal(mismatch.currency, 'USD'); assert.equal(mismatch.accountId, undefined);
  assert.throws(() => parseTransactionText('Gasté 35 pesos', options));
  assert.throws(() => parseTransactionText('Gasté 35 USD soles', options));
  const usdAccount = { id: 'usd', name: 'Dólares', currency: 'USD' };
  assert.equal(parseTransactionText('Gasté 35 dólares', { ...options, accounts: [usdAccount] }).accountId, 'usd');
});
test('local replies address summary, largest expense, savings and unsupported questions', () => {
  const context = { totalBalance: 500, monthlyIncome: 1000, monthlyExpense: 300, topCategories: [{ name: 'Transporte', total: 100 }, { name: 'Comida', total: 200 }] };
  assert.match(createFinancialReply('Resumen de mis finanzas', context), /500\.00/);
  assert.match(createFinancialReply('¿En qué gasté más?', context), /Comida.*200\.00/);
  assert.match(createFinancialReply('¿Cuánto puedo ahorrar?', context), /700\.00/);
  assert.match(createFinancialReply('¿Cómo van mis gastos este mes?', context), /300\.00/);
  assert.match(createFinancialReply('Predice el dólar', context), /no puedo/i);
  assert.doesNotMatch(createFinancialReply('Resumen', context), /20%|aconsejo|sugiero/i);
});

test('backend rejects invalid AI input and disables unfinished integrations honestly', async () => {
  const { default: express } = await import('express');
  const { aiRouter } = await import('../apps/backend/src/routes/ai.ts');
  const { syncRouter } = await import('../apps/backend/src/routes/sync.ts');
  const { whatsappRouter } = await import('../apps/backend/src/routes/whatsapp.ts');
  const { shortcutsRouter } = await import('../apps/backend/src/routes/shortcuts.ts');
  const app = express();
  app.use(express.json());
  app.use('/ai', aiRouter); app.use('/sync', syncRouter); app.use('/whatsapp', whatsappRouter); app.use('/shortcuts', shortcutsRouter);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const request = (path: string, body: unknown) => fetch(`http://127.0.0.1:${address.port}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  try {
    assert.equal((await request('/ai/extract-text', { text: '35', accounts: 'BCP' })).status, 400);
    assert.equal((await request('/ai/chat-denis', { prompt: 'resumen' })).status, 400);
    assert.equal((await request('/ai/extract-text', { text: 'sin monto' })).status, 400);
    const valid = await request('/ai/extract-text', { text: 'Pagué 120 con BCP', accounts: options.accounts, categories: options.categories });
    assert.equal(valid.status, 200);
    const result = await valid.json();
    assert.equal(result.mode, 'local'); assert.equal(result.saved, false); assert.equal(result.transaction.amount, 120);
    for (const [path, status] of [['/sync/push', 501], ['/whatsapp/pair/generate', 503], ['/whatsapp/webhook', 503], ['/shortcuts/ingest', 503], ['/ai/extract-receipt', 503]] as const) {
      const response = await request(path, {});
      assert.equal(response.status, status); assert.equal((await response.json()).available, false);
    }
    assert.equal((await fetch(`http://127.0.0.1:${address.port}/whatsapp/pending/user`)).status, 503);
    assert.equal((await fetch(`http://127.0.0.1:${address.port}/sync/pull`)).status, 501);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
