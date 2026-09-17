import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { EnrichedTransaction } from '../db/repositories/transactionRepository';
import { useFinance } from '../context/FinanceContext';
import { tokens } from '../theme/tokens';

interface ExpenseEvolutionChartProps {
  expenses: EnrichedTransaction[];
}

export const ExpenseEvolutionChart: React.FC<ExpenseEvolutionChartProps> = ({ expenses }) => {
  const { displayMoney, currency } = useFinance();

  // Group expenses by week of the month (1-7, 8-14, 15-21, 22+)
  const weeklyData = useMemo(() => {
    if (expenses.length < 2) return null;

    const weeks = [
      { label: 'Sem 1', total: 0, count: 0 },
      { label: 'Sem 2', total: 0, count: 0 },
      { label: 'Sem 3', total: 0, count: 0 },
      { label: 'Sem 4', total: 0, count: 0 },
    ];

    for (const tx of expenses) {
      const day = parseInt(tx.date.slice(8, 10), 10);
      if (day <= 7) {
        weeks[0].total += tx.amount;
        weeks[0].count += 1;
      } else if (day <= 14) {
        weeks[1].total += tx.amount;
        weeks[1].count += 1;
      } else if (day <= 21) {
        weeks[2].total += tx.amount;
        weeks[2].count += 1;
      } else {
        weeks[3].total += tx.amount;
        weeks[3].count += 1;
      }
    }

    const maxTotal = Math.max(...weeks.map((w) => w.total), 1);
    return { weeks, maxTotal };
  }, [expenses]);

  if (!weeklyData) {
    return null;
  }

  const { weeks, maxTotal } = weeklyData;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={styles.cardTitle}>Evolución de gastos</Text>
          <Text style={styles.cardSubtitle}>Distribución semanal del período</Text>
        </View>
        <Feather name="bar-chart-2" size={16} color={tokens.colors.textTertiary} />
      </View>

      <View style={styles.chartContainer}>
        {weeks.map((week, idx) => {
          const heightPct = Math.max(Math.round((week.total / maxTotal) * 100), 4);
          const isHighest = week.total === maxTotal && week.total > 0;

          return (
            <View key={idx} style={styles.barCol}>
              <Text style={styles.barAmountText}>
                {week.total > 0 ? `S/${Math.round(week.total)}` : ''}
              </Text>

              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${heightPct}%`,
                      backgroundColor: isHighest ? tokens.colors.expense : '#F39A38',
                    },
                  ]}
                />
              </View>

              <Text style={[styles.barLabel, isHighest && styles.barLabelActive]}>
                {week.label}
              </Text>
            </View>
          );
        })}
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
    gap: 16,
    ...tokens.shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleCol: {
    gap: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '650' as any,
    color: tokens.colors.textPrimary,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 110,
    paddingTop: 10,
    gap: 12,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 6,
  },
  barAmountText: {
    fontSize: 10,
    fontWeight: '600',
    color: tokens.colors.textTertiary,
    fontVariant: ['tabular-nums'],
    height: 14,
  },
  barTrack: {
    width: '55%',
    maxWidth: 28,
    height: 70,
    backgroundColor: tokens.colors.surfaceTertiary,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 11,
    color: tokens.colors.textSecondary,
    fontWeight: '500',
  },
  barLabelActive: {
    color: tokens.colors.textPrimary,
    fontWeight: '650' as any,
  },
});

