"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cents = void 0;
exports.validMoney = validMoney;
exports.localDate = localDate;
exports.validateDate = validateDate;
exports.formatDate = formatDate;
exports.money = money;
exports.validateTransaction = validateTransaction;
exports.getBalances = getBalances;
exports.enrichedTransactions = enrichedTransactions;
exports.filterTransactions = filterTransactions;
exports.monthlyStats = monthlyStats;
const cents = (value) => Math.round(value * 100);
exports.cents = cents;
function validMoney(value, signed = false) {
    if (!Number.isFinite(value) || Math.abs(value) > 1e12 || (!signed && value <= 0) || Math.abs(value * 100 - (0, exports.cents)(value)) > 0.00001) {
        throw new Error(signed ? 'Ingresa un saldo válido con hasta dos decimales.' : 'El monto debe ser mayor que cero y tener hasta dos decimales.');
    }
}
function localDate(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function validateDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
        throw new Error('La fecha debe tener formato AAAA-MM-DD.');
    const [year, month, day] = value.split('-').map(Number);
    const d = new Date(year, month - 1, day, 12);
    if (year < 1900 || year > 9999 || d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day)
        throw new Error('La fecha no existe.');
    return value;
}
function formatDate(value, long = false) {
    const day = value.slice(0, 10);
    try {
        validateDate(day);
        return new Intl.DateTimeFormat('es-PE', long ? { dateStyle: 'full' } : { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${day}T12:00:00`));
    }
    catch {
        return 'Fecha inválida';
    }
}
function money(value, currency = 'PEN') {
    const absolute = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(value));
    return `${value < 0 ? '-' : ''}${currency === 'PEN' ? 'S/' : currency} ${absolute}`;
}
function validateTransaction(data, ledger) {
    if (!['income', 'expense', 'transfer'].includes(data.type))
        throw new Error('Tipo de movimiento inválido. Usa Ajustar saldo para registrar un ajuste.');
    validMoney(data.amount);
    validateDate(data.date);
    if (!data.merchant?.trim())
        throw new Error('Escribe una descripción.');
    const account = ledger.accounts.find(a => a.id === data.accountId && !a.deletedAt);
    if (!account)
        throw new Error('Selecciona una cuenta existente.');
    if (data.type === 'transfer') {
        const destination = ledger.accounts.find(a => a.id === data.destinationAccountId && !a.deletedAt);
        if (!destination || destination.id === account.id)
            throw new Error('Selecciona una cuenta de destino diferente.');
        if (destination.currency !== account.currency)
            throw new Error('Solo puedes transferir entre cuentas con la misma moneda.');
    }
    else if (!ledger.categories.some(c => c.id === data.categoryId && c.type === data.type && !c.deletedAt)) {
        throw new Error('Selecciona una categoría válida para este tipo de movimiento.');
    }
    return { ...data, merchant: data.merchant.trim(), notes: data.notes?.trim(), currency: account.currency,
        categoryId: data.type === 'transfer' ? undefined : data.categoryId,
        destinationAccountId: data.type === 'transfer' ? data.destinationAccountId : undefined };
}
function getBalances(ledger) {
    const balances = new Map(ledger.accounts.map(a => [a.id, (0, exports.cents)(a.initialBalance)]));
    for (const tx of ledger.transactions) {
        if (tx.deletedAt)
            continue;
        const amount = (0, exports.cents)(tx.amount);
        const delta = tx.type === 'income' || tx.type === 'adjustment' ? amount : -amount;
        balances.set(tx.accountId, (balances.get(tx.accountId) || 0) + delta);
        if (tx.type === 'transfer' && tx.destinationAccountId)
            balances.set(tx.destinationAccountId, (balances.get(tx.destinationAccountId) || 0) + amount);
    }
    return ledger.accounts.filter(a => !a.deletedAt).map(a => ({ ...a, currentBalance: (balances.get(a.id) || 0) / 100 }));
}
function enrichedTransactions(ledger) {
    return ledger.transactions.filter(t => !t.deletedAt).map(t => ({ ...t,
        accountName: ledger.accounts.find(a => a.id === t.accountId)?.name || 'Cuenta archivada',
        destinationAccountName: ledger.accounts.find(a => a.id === t.destinationAccountId)?.name,
        categoryName: t.type === 'transfer' ? 'Transferencia' : t.type === 'adjustment' ? 'Ajuste' : ledger.categories.find(c => c.id === t.categoryId)?.name || 'Sin categoría',
        categoryIcon: ledger.categories.find(c => c.id === t.categoryId)?.icon || 'swap-horiz',
        categoryColor: ledger.categories.find(c => c.id === t.categoryId)?.color || '#0A9F72',
    })).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}
const normalize = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function filterTransactions(ledger, filters = {}) {
    const q = normalize(filters.query?.trim() || '');
    const list = enrichedTransactions(ledger).filter(t => (!filters.month || t.date.startsWith(filters.month)) &&
        (!filters.type || filters.type === 'all' || t.type === filters.type) &&
        (!filters.categoryId || t.categoryId === filters.categoryId) &&
        (!filters.accountId || t.accountId === filters.accountId || t.destinationAccountId === filters.accountId) &&
        (!filters.startDate || t.date.slice(0, 10) >= filters.startDate) &&
        (!filters.endDate || t.date.slice(0, 10) <= filters.endDate) &&
        (!q || normalize(`${t.merchant} ${t.categoryName} ${t.accountName} ${t.destinationAccountName || ''} ${t.amount} ${money(t.amount, t.currency)}`).includes(q)));
    if (filters.sort === 'oldest')
        list.reverse();
    if (filters.sort === 'amount-desc')
        list.sort((a, b) => b.amount - a.amount);
    if (filters.sort === 'amount-asc')
        list.sort((a, b) => a.amount - b.amount);
    return list;
}
function monthlyStats(ledger, month, currency = 'PEN') {
    const rows = ledger.transactions.filter(t => !t.deletedAt && t.date.startsWith(month) && t.currency === currency);
    const totalIncome = rows.filter(t => t.type === 'income').reduce((sum, t) => sum + (0, exports.cents)(t.amount), 0) / 100;
    const totalExpense = rows.filter(t => t.type === 'expense').reduce((sum, t) => sum + (0, exports.cents)(t.amount), 0) / 100;
    const groups = new Map();
    rows.filter(t => t.type === 'expense').forEach(t => groups.set(t.categoryId || '', (groups.get(t.categoryId || '') || 0) + (0, exports.cents)(t.amount)));
    const topCategories = [...groups].map(([id, value]) => {
        const c = ledger.categories.find(c => c.id === id);
        return { id, name: c?.name || 'Sin categoría', icon: c?.icon || 'category', color: c?.color || '#0A9F72', total: value / 100,
            percentage: totalExpense > 0 ? value / (0, exports.cents)(totalExpense) * 100 : 0 };
    }).sort((a, b) => b.total - a.total);
    return { totalIncome, totalExpense, netSavings: ((0, exports.cents)(totalIncome) - (0, exports.cents)(totalExpense)) / 100, topCategories };
}
//# sourceMappingURL=finance.js.map