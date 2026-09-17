import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { tokens } from '../theme/tokens';
import { useFinance } from '../context/FinanceContext';

interface MetricsRowProps {
  onOpenNetWorth: () => void;
  onOpenAccounts: () => void;
}

export const MetricsRow: React.FC<MetricsRowProps> = ({ onOpenNetWorth, onOpenAccounts }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  const {
    totalBalance,
    currency,
    accounts,
    stats,
    displayMoney,
    showAmounts,
    toggleAmounts,
  } = useFinance();

  const netBalance = stats.totalIncome - stats.totalExpense;
  const isNetPositive = netBalance >= 0;
  const savingsRate =
    stats.totalIncome > 0
      ? Math.round((netBalance / stats.totalIncome) * 100)
      : 0;

  const accountCountText = accounts.length === 1 ? '1 cuenta' : `${accounts.length} cuentas`;

  return (
    <View style={[styles.grid, isDesktop ? styles.gridDesktop : isTablet ? styles.gridTablet : styles.gridMobile]}>
      {/* 1. PATRIMONIO TOTAL (Card accesible sin controles anidados) */}
      <View style={[styles.card, styles.cardPatrimonio]}>
        <View style={styles.cardHeaderRow}>
          <TouchableOpacity
            style={styles.labelBtn}
            onPress={onOpenNetWorth}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Abrir detalle del patrimonio"
          >
            <Text style={styles.cardLabel}>PATRIMONIO TOTAL</Text>
            <Feather name="chevron-right" size={13} color={tokens.colors.textSecondary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleAmounts}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={showAmounts ? 'Ocultar importes' : 'Mostrar importes'}
            style={styles.eyeBtn}
          >
            <Feather name={showAmounts ? 'eye' : 'eye-off'} size={15} color={tokens.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={onOpenNetWorth}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Patrimonio total: ${displayMoney(totalBalance, currency)}. Ver desglose.`}
        >
          <Text style={styles.amountLarge}>{displayMoney(totalBalance, currency)}</Text>

          <View style={styles.cardFooterRow}>
            <Text style={styles.footerMutedText}>{accountCountText} · Actualizado hoy</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 2. INGRESOS (Card blanca/gris suave con contraste AA) */}
      <View style={[styles.card, styles.cardSoft]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardLabel}>INGRESOS</Text>
          <View style={styles.iconCircleBrand}>
            <Feather name="arrow-down-left" size={13} color={tokens.colors.brandText} />
          </View>
        </View>

        <Text style={[styles.amountMedium, { color: tokens.colors.brandText }]}>
          {displayMoney(stats.totalIncome, currency)}
        </Text>

        <View style={styles.cardFooterRow}>
          <Text style={styles.footerMutedText}>Entradas registradas</Text>
        </View>
      </View>

      {/* 3. GASTOS (Tarjeta destacada con contraste accesible) */}
      <View style={[styles.card, styles.cardExpenseStandout]}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardLabel, { color: tokens.colors.expenseText }]}>GASTOS DEL MES</Text>
          <View style={styles.iconCircleExpense}>
            <Feather name="arrow-up-right" size={13} color="#FFFFFF" />
          </View>
        </View>

        <Text style={[styles.amountMedium, { color: tokens.colors.expenseText }]}>
          {displayMoney(stats.totalExpense, currency)}
        </Text>

        <View style={styles.cardFooterRow}>
          <Text style={[styles.footerMutedText, { color: tokens.colors.expenseText, fontWeight: '500' }]}>
            {stats.topCategories.length} categorías activas
          </Text>
        </View>
      </View>

      {/* 4. BALANCE (Card blanca/gris con badges legibles) */}
      <View style={[styles.card, styles.cardSoft]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardLabel}>BALANCE DEL MES</Text>
          <View
            style={[
              styles.badgePill,
              { backgroundColor: isNetPositive ? '#DDF3EA' : '#FEECE7' },
            ]}
          >
            <Text
              style={[
                styles.badgePillText,
                { color: isNetPositive ? '#05613F' : '#A8280B' },
              ]}
            >
              {isNetPositive ? `+${savingsRate}%` : `${savingsRate}%`}
            </Text>
          </View>
        </View>

        <Text style={[styles.amountMedium, { color: tokens.colors.textPrimary }]}>
          {displayMoney(netBalance, currency)}
        </Text>

        <View style={styles.cardFooterRow}>
          <Text style={styles.footerMutedText}>
            {isNetPositive ? 'Superávit acumulado' : 'Déficit del período'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: 14,
    width: '100%',
  },
  gridDesktop: {
    flexDirection: 'row',
  },
  gridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridMobile: {
    flexDirection: 'column',
  },
  card: {
    flex: 1,
    minWidth: 200,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.card,
    padding: 18,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    justifyContent: 'space-between',
    minHeight: 120,
    ...tokens.shadows.card,
  },
  cardPatrimonio: {
    flex: 1.15,
    backgroundColor: tokens.colors.surface,
    borderColor: 'rgba(20, 20, 18, 0.08)',
  },
  cardSoft: {
    backgroundColor: '#FAFAF8',
    borderColor: tokens.colors.borderSubtle,
  },
  cardExpenseStandout: {
    backgroundColor: '#FFF7F5',
    borderColor: 'rgba(255, 100, 61, 0.22)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '650' as any,
    color: tokens.colors.textTertiary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  labelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  eyeBtn: {
    padding: 6,
    minWidth: 28,
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountLarge: {
    fontSize: 28,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.6,
    marginVertical: 4,
  },
  amountMedium: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
    marginVertical: 4,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  footerMutedText: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    fontWeight: '400',
  },
  iconCircleBrand: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.colors.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleExpense: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.colors.expense,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: tokens.radii.pill,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

