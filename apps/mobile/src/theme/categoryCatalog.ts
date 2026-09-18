export type SupportedIconSet = 'feather' | 'mci' | 'fa6' | 'mi';

export interface CategoryVisualConfig {
  key: string;
  label: string;
  iconSet: SupportedIconSet;
  iconName: string;
  color: string;
  bg: string;
  border: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
  keywords: string[];
}

export const CATEGORY_CATALOG: Record<string, CategoryVisualConfig> = {
  // ==================== 10 CATEGORÍAS DE GASTO ====================
  alimentacion: {
    key: 'alimentacion',
    label: 'Alimentación',
    iconSet: 'fa6',
    iconName: 'utensils',
    color: '#EA580C',      // Naranja profesional
    bg: '#FFF7ED',         // Naranja pastel muy suave
    border: '#FFEDD5',
    activeBg: '#FFEDD5',
    activeBorder: '#EA580C',
    activeText: '#9A3412',
    keywords: ['aliment', 'comida', 'restaurante', 'almuerzo', 'desayuno', 'cena', 'supermercado', 'vea', 'metro', 'tottus', 'wong', 'vivanda', 'mercado', 'panaderia', 'cafe', 'starbucks', 'snack'],
  },
  transporte: {
    key: 'transporte',
    label: 'Transporte',
    iconSet: 'fa6',
    iconName: 'car',
    color: '#16A34A',      // Verde
    bg: '#F0FDF4',         // Verde pastel suave
    border: '#DCFCE7',
    activeBg: '#DCFCE7',
    activeBorder: '#16A34A',
    activeText: '#166534',
    keywords: ['transporte', 'auto', 'carro', 'gasolina', 'combustible', 'grifo', 'repsol', 'primax', 'taxi', 'uber', 'cabify', 'didi', 'indrive', 'pasaje', 'metro', 'colectivo', 'peaje', 'mantenimiento vehicular'],
  },
  vivienda: {
    key: 'vivienda',
    label: 'Vivienda y Servicios',
    iconSet: 'feather',
    iconName: 'home',
    color: '#2563EB',      // Azul institucional
    bg: '#EFF6FF',         // Azul pastel suave
    border: '#DBEAFE',
    activeBg: '#DBEAFE',
    activeBorder: '#2563EB',
    activeText: '#1E40AF',
    keywords: ['vivienda', 'servicio', 'casa', 'hogar', 'luz', 'enel', 'luz del sur', 'agua', 'sedapal', 'gas', 'calidda', 'alquiler', 'renta', 'internet', 'claro', 'movistar', 'entel', 'condominio', 'mantenimiento del hogar'],
  },
  entretenimiento: {
    key: 'entretenimiento',
    label: 'Entretenimiento',
    iconSet: 'mci',
    iconName: 'gamepad-variant-outline',
    color: '#9333EA',      // Morado
    bg: '#FAF5FF',         // Morado pastel suave
    border: '#F3E8FF',
    activeBg: '#F3E8FF',
    activeBorder: '#9333EA',
    activeText: '#6B21A8',
    keywords: ['entretenimiento', 'ocio', 'juego', 'cine', 'planet', 'cinemark', 'cinepolis', 'videojuego', 'playstation', 'steam', 'diversion', 'fiesta', 'bar', 'concierto', 'teatro'],
  },
  salud: {
    key: 'salud',
    label: 'Salud y Cuidado',
    iconSet: 'mci',
    iconName: 'heart-pulse',
    color: '#E11D48',      // Rojo suave / rosa profesional
    bg: '#FFF1F2',         // Rosa pastel suave
    border: '#FFE4E6',
    activeBg: '#FFE4E6',
    activeBorder: '#E11D48',
    activeText: '#9F1239',
    keywords: ['salud', 'cuidado', 'farmacia', 'inkafarma', 'mifarma', 'medico', 'doctor', 'clinica', 'hospital', 'odontologia', 'dentista', 'optica', 'psicologo', 'personal', 'gimnasio', 'gym'],
  },
  compras: {
    key: 'compras',
    label: 'Compras y Ropa',
    iconSet: 'feather',
    iconName: 'shopping-bag',
    color: '#0D9488',      // Turquesa
    bg: '#F0FDFA',         // Turquesa pastel suave
    border: '#CCFBF1',
    activeBg: '#CCFBF1',
    activeBorder: '#0D9488',
    activeText: '#115E59',
    keywords: ['compra', 'ropa', 'shopping', 'saga', 'falabella', 'ripley', 'oechsle', 'zara', 'h&m', 'tienda', 'calzado', 'zapatos', 'accesorios', 'mall', 'electronica'],
  },
  educacion: {
    key: 'educacion',
    label: 'Educación',
    iconSet: 'fa6',
    iconName: 'graduation-cap',
    color: '#4F46E5',      // Índigo
    bg: '#EEF2FF',         // Índigo pastel suave
    border: '#E0E7FF',
    activeBg: '#E0E7FF',
    activeBorder: '#4F46E5',
    activeText: '#3730A3',
    keywords: ['educa', 'curso', 'universidad', 'colegio', 'instituto', 'platzi', 'udemy', 'coursera', 'libro', 'libreria', 'matricula', 'pension', 'clase', 'estudios'],
  },
  viajes: {
    key: 'viajes',
    label: 'Viajes',
    iconSet: 'fa6',
    iconName: 'plane',
    color: '#0284C7',      // Celeste cielo
    bg: '#F0F9FF',         // Celeste pastel suave
    border: '#E0F2FE',
    activeBg: '#E0F2FE',
    activeBorder: '#0284C7',
    activeText: '#075985',
    keywords: ['viaje', 'vuelo', 'avion', 'aerolinea', 'latam', 'sky', 'hotel', 'airbnb', 'turismo', 'hospedaje', 'booking', 'maleta', 'vacaciones'],
  },
  suscripciones: {
    key: 'suscripciones',
    label: 'Suscripciones',
    iconSet: 'feather',
    iconName: 'repeat',
    color: '#D97706',      // Ámbar
    bg: '#FFFBEB',         // Ámbar pastel suave
    border: '#FEF3C7',
    activeBg: '#FEF3C7',
    activeBorder: '#D97706',
    activeText: '#92400E',
    keywords: ['suscripcion', 'recurrente', 'netflix', 'spotify', 'apple', 'youtube', 'prime', 'disney', 'icloud', 'google one', 'hbo', 'max', 'chatgpt', 'openai', 'software'],
  },
  otros: {
    key: 'otros',
    label: 'Otros Gastos',
    iconSet: 'feather',
    iconName: 'more-horizontal',
    color: '#64748B',      // Gris pizarra
    bg: '#F8FAFC',         // Slate pastel suave
    border: '#E2E8F0',
    activeBg: '#F1F5F9',
    activeBorder: '#64748B',
    activeText: '#334155',
    keywords: ['otro', 'gasto', 'general', 'varios', 'imprevisto', 'banco', 'comision', 'impuesto'],
  },

  // ==================== CATEGORÍAS DE INGRESO ====================
  salario: {
    key: 'salario',
    label: 'Salario',
    iconSet: 'feather',
    iconName: 'dollar-sign',
    color: '#059669',      // Esmeralda
    bg: '#ECFDF5',
    border: '#A7F3D0',
    activeBg: '#D1FAE5',
    activeBorder: '#059669',
    activeText: '#065F46',
    keywords: ['salario', 'sueldo', 'nomina', 'haberes', 'ingreso', 'quincena'],
  },
  freelance: {
    key: 'freelance',
    label: 'Freelance / Negocios',
    iconSet: 'feather',
    iconName: 'briefcase',
    color: '#0D9488',      // Turquesa oscuro
    bg: '#F0FDFA',
    border: '#CCFBF1',
    activeBg: '#CCFBF1',
    activeBorder: '#0D9488',
    activeText: '#115E59',
    keywords: ['freelance', 'negocio', 'cliente', 'honorarios', 'factura', 'proyecto', 'venta'],
  },
  inversiones: {
    key: 'inversiones',
    label: 'Inversiones y Rendimientos',
    iconSet: 'feather',
    iconName: 'trending-up',
    color: '#0284C7',      // Azul inversión
    bg: '#F0F9FF',
    border: '#BAE6FD',
    activeBg: '#BAE6FD',
    activeBorder: '#0284C7',
    activeText: '#075985',
    keywords: ['inversion', 'rendimiento', 'dividendo', 'interes', 'deposito', 'plazo', 'bolsa', 'crypto'],
  },
  regalos: {
    key: 'regalos',
    label: 'Regalos / Bonos',
    iconSet: 'feather',
    iconName: 'gift',
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    activeBg: '#D1FAE5',
    activeBorder: '#10B981',
    activeText: '#065F46',
    keywords: ['regalo', 'bono', 'gratificacion', 'premio', 'donacion'],
  },
  otros_ingresos: {
    key: 'otros_ingresos',
    label: 'Otros Ingresos',
    iconSet: 'feather',
    iconName: 'plus-circle',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    activeBg: '#D1FAE5',
    activeBorder: '#059669',
    activeText: '#065F46',
    keywords: ['otros ingresos', 'extra', 'reembolso', 'devolucion'],
  },

  // ==================== TIPOS DE SISTEMA ====================
  transferencia: {
    key: 'transferencia',
    label: 'Transferencia',
    iconSet: 'feather',
    iconName: 'repeat',
    color: '#475569',      // Pizarra neutral
    bg: '#F1F5F9',
    border: '#CBD5E1',
    activeBg: '#E2E8F0',
    activeBorder: '#475569',
    activeText: '#1E293B',
    keywords: ['transferencia', 'traspaso', 'entre cuentas'],
  },
  ajuste: {
    key: 'ajuste',
    label: 'Ajuste',
    iconSet: 'feather',
    iconName: 'sliders',
    color: '#6366F1',      // Índigo
    bg: '#EEF2FF',
    border: '#C7D2FE',
    activeBg: '#E0E7FF',
    activeBorder: '#6366F1',
    activeText: '#3730A3',
    keywords: ['ajuste', 'cuadre', 'correccion', 'saldo'],
  },
};

/**
 * Normaliza un texto removiendo acentos, caracteres especiales y convirtiendo a minúsculas
 */
function normalizeString(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Resuelve la configuración visual canónica a partir del nombre o identificador de una categoría.
 * Realiza coincidencia exacta por clave, por etiqueta y por palabras clave heurísticas.
 */
export function resolveCategoryMeta(categoryNameOrId: string = ''): CategoryVisualConfig {
  if (!categoryNameOrId) {
    return CATEGORY_CATALOG.otros;
  }

  const normalized = normalizeString(categoryNameOrId);

  // 1. Coincidencia directa por key
  if (CATEGORY_CATALOG[normalized]) {
    return CATEGORY_CATALOG[normalized];
  }

  // 2. Coincidencia directa por label normalizado
  for (const config of Object.values(CATEGORY_CATALOG)) {
    if (normalizeString(config.label) === normalized) {
      return config;
    }
  }

  // 3. Coincidencia por sub-palabras clave en keywords
  for (const config of Object.values(CATEGORY_CATALOG)) {
    for (const keyword of config.keywords) {
      if (normalized.includes(keyword) || keyword.includes(normalized)) {
        return config;
      }
    }
  }

  // 4. Heurísticas especiales para ingresos y sistema
  if (normalized.includes('ingreso') || normalized.includes('sueldo') || normalized.includes('salario')) {
    return CATEGORY_CATALOG.salario;
  }
  if (normalized.includes('transfer')) {
    return CATEGORY_CATALOG.transferencia;
  }
  if (normalized.includes('ajust')) {
    return CATEGORY_CATALOG.ajuste;
  }

  // 5. Fallback seguro a "Otros Gastos" con etiqueta respetando el nombre original
  return {
    ...CATEGORY_CATALOG.otros,
    label: categoryNameOrId,
  };
}
