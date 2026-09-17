import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { tokens } from '../theme/tokens';

export const MonthlySummaryCard: React.FC = () => {
  const { stats, displayMoney, currency } = useFinance();

  const savingsRate =
    stats.totalIncome > 0
      ? Math.round((stats.netSavings / stats.totalIncome) * 100)
      : 0;

  const isNetPositive = stats.netSavings >= 0;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Resumen del mes</Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isNetPositive
                ? tokens.colors.successLight
                : tokens.colors.dangerLight,
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color: isNetPositive ? tokens.colors.success : tokens.colors.danger,
              },
            ]}
          >
            {isNetPositive
              ? `+${savingsRate}% ahorro`
              : `${Math.abs(savingsRate)}% déficit`}
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {/* Ingresos */}
        <View style={styles.statCol}>
          <View style={styles.iconBoxIncome}>
            <Feather name="arrow-down" size={16} color={tokens.colors.brand} />
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.statLabel}>Ingresos</Text>
            <Text style={styles.statIncome}>{displayMoney(stats.totalIncome, currency)}</Text>
          </View>
        </View>

        {/* Vertical subtle separator */}
        <View style={styles.divider} />

        {/* Gastos */}
        <View style={styles.statCol}>
          <View style={styles.iconBoxExpense}>
            <Feather name="arrow-up" size={16} color={tokens.colors.danger} />
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.statLabel}>Gastos</Text>
            <Text style={styles.statExpense}>{displayMoney(stats.totalExpense, currency)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.card,
    padding: 18,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    ...tokens.shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: tokens.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: tokens.radii.pill,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBoxIncome: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxExpense: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCol: {
    gap: 2,
  },
  statLabel: {
    color: tokens.colors.textSecondary,
    fontSize: 12,
    fontWeight: '400',
  },
  statIncome: {
    color: tokens.colors.brand,
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  statExpense: {
    color: tokens.colors.danger,
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: tokens.colors.separator,
    marginHorizontal: 12,
  },
});

