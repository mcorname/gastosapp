"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POPULAR_CURRENCIES = exports.DEFAULT_INCOME_CATEGORIES = exports.DEFAULT_EXPENSE_CATEGORIES = void 0;
exports.DEFAULT_EXPENSE_CATEGORIES = [
    { name: 'Alimentación', icon: 'restaurant', color: '#EF4444', type: 'expense', isDefault: true },
    { name: 'Transporte', icon: 'directions-car', color: '#F59E0B', type: 'expense', isDefault: true },
    { name: 'Vivienda y Servicios', icon: 'home', color: '#3B82F6', type: 'expense', isDefault: true },
    { name: 'Entretenimiento', icon: 'sports-esports', color: '#8B5CF6', type: 'expense', isDefault: true },
    { name: 'Salud y Cuidado', icon: 'favorite', color: '#EC4899', type: 'expense', isDefault: true },
    { name: 'Compras y Ropa', icon: 'shopping-bag', color: '#14B8A6', type: 'expense', isDefault: true },
    { name: 'Educación', icon: 'school', color: '#6366F1', type: 'expense', isDefault: true },
    { name: 'Viajes', icon: 'flight', color: '#06B6D4', type: 'expense', isDefault: true },
    { name: 'Suscripciones', icon: 'subscriptions', color: '#64748B', type: 'expense', isDefault: true },
    { name: 'Otros Gastos', icon: 'more-horiz', color: '#94A3B8', type: 'expense', isDefault: true },
];
exports.DEFAULT_INCOME_CATEGORIES = [
    { name: 'Salario', icon: 'attach-money', color: '#10B981', type: 'income', isDefault: true },
    { name: 'Freelance / Negocios', icon: 'business-center', color: '#059669', type: 'income', isDefault: true },
    { name: 'Inversiones y Rendimientos', icon: 'trending-up', color: '#34D399', type: 'income', isDefault: true },
    { name: 'Regalos / Bonos', icon: 'card-giftcard', color: '#A7F3D0', type: 'income', isDefault: true },
    { name: 'Otros Ingresos', icon: 'add-circle-outline', color: '#6EE7B7', type: 'income', isDefault: true },
];
exports.POPULAR_CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'Dólar Estadounidense' },
    { code: 'COP', symbol: '$', name: 'Peso Colombiano' },
    { code: 'MXN', symbol: '$', name: 'Peso Mexicano' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'CLP', symbol: '$', name: 'Peso Chileno' },
    { code: 'ARS', symbol: '$', name: 'Peso Argentino' },
    { code: 'PEN', symbol: 'S/', name: 'Sol Peruano' },
    { code: 'BRL', symbol: 'R$', name: 'Real Brasileño' },
];
//# sourceMappingURL=constants.js.map