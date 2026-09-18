import { Category } from './types.js';

export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Alimentación', icon: 'restaurant', color: '#EA580C', type: 'expense', isDefault: true },
  { name: 'Transporte', icon: 'directions-car', color: '#16A34A', type: 'expense', isDefault: true },
  { name: 'Vivienda y Servicios', icon: 'home', color: '#2563EB', type: 'expense', isDefault: true },
  { name: 'Entretenimiento', icon: 'sports-esports', color: '#9333EA', type: 'expense', isDefault: true },
  { name: 'Salud y Cuidado', icon: 'favorite', color: '#E11D48', type: 'expense', isDefault: true },
  { name: 'Compras y Ropa', icon: 'shopping-bag', color: '#0D9488', type: 'expense', isDefault: true },
  { name: 'Educación', icon: 'school', color: '#4F46E5', type: 'expense', isDefault: true },
  { name: 'Viajes', icon: 'flight', color: '#0284C7', type: 'expense', isDefault: true },
  { name: 'Suscripciones', icon: 'subscriptions', color: '#D97706', type: 'expense', isDefault: true },
  { name: 'Otros Gastos', icon: 'more-horiz', color: '#64748B', type: 'expense', isDefault: true },
];

export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Salario', icon: 'attach-money', color: '#10B981', type: 'income', isDefault: true },
  { name: 'Freelance / Negocios', icon: 'business-center', color: '#059669', type: 'income', isDefault: true },
  { name: 'Inversiones y Rendimientos', icon: 'trending-up', color: '#34D399', type: 'income', isDefault: true },
  { name: 'Regalos / Bonos', icon: 'card-giftcard', color: '#A7F3D0', type: 'income', isDefault: true },
  { name: 'Otros Ingresos', icon: 'add-circle-outline', color: '#6EE7B7', type: 'income', isDefault: true },
];

export const POPULAR_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'Dólar Estadounidense' },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino' },
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano' },
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileño' },
];
