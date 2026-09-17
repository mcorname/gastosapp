"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMoneyInput = parseMoneyInput;
exports.parseTransactionText = parseTransactionText;
exports.createFinancialReply = createFinancialReply;
const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function parseMoneyInput(text) {
    const value = text.trim().replace(/^(?:S\/\.?|PEN)\s*/i, '').replace(/\s*soles?$/i, '');
    if (!/^(?:\d+|\d+[.,]\d{1,2}|\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?)$/.test(value))
        throw new Error('Ingresa un monto válido y positivo.');
    let canonical = value;
    if (value.includes(',') && value.includes('.')) {
        canonical = value.lastIndexOf(',') > value.lastIndexOf('.') ? value.replace(/\./g, '').replace(',', '.') : value.replace(/,/g, '');
    }
    else if (/^\d{1,3}(?:[.,]\d{3})+$/.test(value))
        canonical = value.replace(/[.,]/g, '');
    else
        canonical = value.replace(',', '.');
    const result = Number(canonical);
    if (!Number.isFinite(result) || result <= 0 || result > Number.MAX_SAFE_INTEGER / 100)
        throw new Error('Ingresa un monto válido y positivo.');
    return result;
}
function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)
        throw new Error('La fecha no es válida.');
    return value;
}
function parseTransactionText(text, options) {
    if (typeof text !== 'string' || !text.trim())
        throw new Error('Escribe el detalle y monto de la transacción.');
    const clean = normalize(text.trim());
    const today = new Date();
    let date = validDate(options.date?.slice(0, 10) ?? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
    let amountText = clean;
    const isoDate = clean.match(/\b\d{4}-\d{2}-\d{2}\b/);
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const namedDate = clean.match(/\b(\d{1,2})\s+(?:de\s+)?(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s+(?:de\s+)?(\d{4}))?\b/);
    const explicitDate = clean.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{4}))?\b/);
    const relativeDates = clean.match(/\b(anteayer|ayer|hoy|manana)\b/g) ?? [];
    if (relativeDates.length > 1 || (relativeDates.length && (isoDate || namedDate || explicitDate)))
        throw new Error('Indica una única fecha para la transacción.');
    if (isoDate) {
        date = validDate(isoDate[0]);
        amountText = amountText.replace(isoDate[0], '');
    }
    else if (namedDate) {
        const month = months.indexOf(namedDate[2] === 'setiembre' ? 'septiembre' : namedDate[2]) + 1;
        date = validDate(`${namedDate[3] ?? date.slice(0, 4)}-${String(month).padStart(2, '0')}-${namedDate[1].padStart(2, '0')}`);
        amountText = amountText.replace(namedDate[0], '');
    }
    else if (explicitDate) {
        date = validDate(`${explicitDate[3] ?? date.slice(0, 4)}-${explicitDate[2].padStart(2, '0')}-${explicitDate[1].padStart(2, '0')}`);
        amountText = amountText.replace(explicitDate[0], '');
    }
    else if (relativeDates.length) {
        const offset = { anteayer: -2, ayer: -1, hoy: 0, manana: 1 }[relativeDates[0]];
        const relative = new Date(`${date}T12:00:00Z`);
        relative.setUTCDate(relative.getUTCDate() + offset);
        date = relative.toISOString().slice(0, 10);
    }
    if (/(?:^|[^\d])[.,]\d|\d\s*(?:mil|millon|millones|k)\b/.test(amountText))
        throw new Error('Escribe el monto completo, por ejemplo 0.50 o 35000.');
    if (/[-−]\s*\d/.test(amountText))
        throw new Error('Ingresa un monto válido y positivo.');
    const amounts = amountText.match(/\d+(?:[.,]\d+)*/g) ?? [];
    if (amounts.length !== 1)
        throw new Error('Indica un único monto para esta transacción.');
    const amount = parseMoneyInput(amounts[0]);
    const type = /\b(sueldo|salario|depositaron|pagaron|ingreso|recibi|cobre)\b/.test(clean) && !/\b(pague|gaste|compre)\b/.test(clean) ? 'income' : 'expense';
    const warnings = [];
    const currencyHints = [
        { code: 'PEN', pattern: /\b(?:pen|soles?)\b|s\// },
        { code: 'USD', pattern: /\b(?:usd|dolares?|dolar)\b|us\$/ },
        { code: 'EUR', pattern: /\b(?:eur|euros?)\b|€/ },
        { code: 'GBP', pattern: /\b(?:gbp|libras?)\b|£/ },
    ].filter(hint => hint.pattern.test(clean));
    if (currencyHints.length > 1 || /\bpesos?\b/.test(clean) || (clean.includes('$') && !/us\$|\busd\b/.test(clean)))
        throw new Error('Indica una moneda inequívoca, como PEN, USD o EUR.');
    const explicitCurrency = currencyHints[0]?.code;
    const accountHint = clean.match(/\bcon\s+(?:(?:mi|la|el|tarjeta|cuenta)\s+)*(.+?)(?:\s+el\s+\d|$)/)?.[1]?.trim();
    const mentioned = options.accounts.filter(a => clean.includes(normalize(a.name)) || (accountHint && normalize(a.name).includes(accountHint)));
    let account = mentioned.length === 1 ? mentioned[0] : !accountHint && mentioned.length === 0 && options.accounts.length === 1 ? options.accounts[0] : undefined;
    if (account && explicitCurrency && account.currency !== explicitCurrency) {
        account = undefined;
        warnings.push('La moneda indicada no coincide con la cuenta. Selecciona una cuenta de la misma moneda; no se realizó conversión.');
    }
    if (!account)
        warnings.push('Selecciona la cuenta: no se identificó una cuenta única.');
    const families = [
        { words: /\b(almuerzo|cena|comida|cafe|restaurante|menu)\b/, names: /aliment|comida/ },
        { words: /\b(internet|luz|agua|gas|movistar|sedapal|celular)\b/, names: /servicio|vivienda/ },
        { words: /\b(taxi|uber|transporte|gasolina)\b/, names: /transporte/ },
        { words: /\b(sueldo|salario|depositaron)\b/, names: /salario|sueldo/ },
    ];
    const matched = options.categories.filter(c => c.type === type && (clean.includes(normalize(c.name)) || families.some(f => f.words.test(clean) && f.names.test(normalize(c.name)))));
    const categoryId = matched.length === 1 ? matched[0].id : undefined;
    if (!categoryId)
        warnings.push('Selecciona la categoría: no se identificó una categoría única.');
    return { amount, type, merchant: text.trim(), date, categoryId, accountId: account?.id, currency: explicitCurrency ?? account?.currency ?? options.currency ?? 'PEN', notes: text.trim(), warnings };
}
function createFinancialReply(prompt, context) {
    const query = normalize(prompt);
    const money = (value) => `${context.currency === undefined || context.currency === 'PEN' ? 'S/' : context.currency} ${value.toFixed(2)}`;
    const period = context.period ?? 'este mes';
    if (/ahorr|disponible/.test(query))
        return `La diferencia entre ingresos y gastos de ${period} es ${money(context.monthlyIncome - context.monthlyExpense)}. Es el saldo del período, no una predicción de ahorro.`;
    if (/mas|mayor|principal/.test(query) && /gast|categoria/.test(query)) {
        const top = [...context.topCategories].sort((a, b) => b.total - a.total)[0];
        return top ? `La categoría con mayor gasto de ${period} es ${top.name}: ${money(top.total)}.` : `No hay gastos por categoría registrados para ${period}.`;
    }
    if (/resumen|finanza|balance|saldo/.test(query))
        return `Saldo total: ${money(context.totalBalance)}. En ${period}: ingresos de ${money(context.monthlyIncome)} y gastos de ${money(context.monthlyExpense)}.`;
    if (/gast/.test(query))
        return `Tus gastos registrados de ${period} suman ${money(context.monthlyExpense)}.`;
    if (/ingreso/.test(query))
        return `Tus ingresos registrados de ${period} suman ${money(context.monthlyIncome)}.`;
    return 'Soy un asistente local y no puedo responder esa consulta con los datos disponibles. Puedo mostrar tu resumen, gastos por categoría o diferencia entre ingresos y gastos.';
}
//# sourceMappingURL=assistant.js.map