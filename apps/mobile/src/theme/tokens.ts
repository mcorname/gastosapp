/**
 * AI Money - Apple / macOS Light Design Tokens
 */
export const tokens = {
  colors: {
    // Fondos y superficies
    bg: '#ECECEA',                 // Fondo exterior
    containerBg: '#F8F8F6',        // Contenedor principal
    surface: '#FFFFFF',            // Cards y paneles blancos
    surfaceSecondary: '#F4F4F2',   // Tracks y campos secundarios
    surfaceTertiary: '#EBEBE8',    // Segmented controls y divisores
    surfaceSelected: 'rgba(20, 20, 18, 0.05)',

    // Identidad de marca (AI Money Emerald Green)
    brand: '#0EA876',
    brandHover: '#0A9468',
    brandLight: '#E6F7F1',
    brandLightHover: '#D8F3EA',

    // Gastos y advertencias (Fintech Coral / Naranja de contraste)
    expense: '#FF643D',
    expenseHover: '#FF6B45',
    expenseLight: '#FFF0EE',

    // Semánticos
    success: '#0EA876',
    successLight: '#E6F7F1',
    danger: '#FF643D',
    dangerLight: '#FFF0EE',
    warning: '#F39A38',
    warningLight: '#FFF5E9',
    info: '#4F8EF7',
    infoLight: '#EDF4FF',

    // Navegación oscura destacada
    navPillDark: '#191917',

    // Tipografía
    textPrimary: '#171715',
    textSecondary: '#696966',
    textTertiary: '#979792',
    textMuted: '#B4B4AF',

    // Bordes y separadores
    borderSubtle: 'rgba(20, 20, 18, 0.06)',
    borderDefault: 'rgba(20, 20, 18, 0.08)',
    borderActive: 'rgba(14, 168, 118, 0.35)',
    separator: 'rgba(20, 20, 18, 0.05)',
  },

  radii: {
    xs: 6,
    sm: 8,
    btn: 10,
    input: 12,
    cardSm: 14,
    card: 18,
    modal: 20,
    pill: 999,
  },

  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, "Segoe UI", sans-serif',
    patrimonio: {
      fontSize: 34,
      fontWeight: '650' as any,
      letterSpacing: -0.6,
    },
    title1: {
      fontSize: 22,
      fontWeight: '650' as any,
      letterSpacing: -0.4,
    },
    title2: {
      fontSize: 18,
      fontWeight: '600' as any,
      letterSpacing: -0.2,
    },
    title3: {
      fontSize: 16,
      fontWeight: '600' as any,
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as any,
      lineHeight: 20,
    },
    bodyMedium: {
      fontSize: 14,
      fontWeight: '500' as any,
    },
    bodySemibold: {
      fontSize: 14,
      fontWeight: '600' as any,
    },
    metadata: {
      fontSize: 12,
      fontWeight: '400' as any,
    },
    caption: {
      fontSize: 11,
      fontWeight: '500' as any,
    },
    tabularAmount: {
      fontVariant: ['tabular-nums'] as any,
      fontWeight: '600' as any,
    },
  },

  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.02,
      shadowRadius: 2,
      elevation: 1,
    },
    cardElevated: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.03,
      shadowRadius: 18,
      elevation: 2,
    },
    fab: {
      shadowColor: '#0EA876',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.20,
      shadowRadius: 12,
      elevation: 4,
    },
    segmentedPill: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 2,
      elevation: 1,
    },
  },

  layout: {
    maxWidth: 1440,
    sidebarWidth: 250,
    railWidth: 68,
  },
};
