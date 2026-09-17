import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { tokens } from '../theme/tokens';

interface MarioSummaryWidgetProps {
  onOpenChat: () => void;
}

export const MarioSummaryWidget: React.FC<MarioSummaryWidgetProps> = ({ onOpenChat }) => {
  const { stats, currentYearMonth } = useFinance();

  const topCategory = stats.topCategories[0];
  const totalExpense = stats.totalExpense;

  let insightText = 'Registra tus gastos e ingresos para obtener análisis y proyecciones en tiempo real.';
  if (topCategory && totalExpense > 0) {
    const pct = topCategory.percentage.toFixed(1);
    insightText = `Tu mayor gasto del mes está en ${topCategory.name}. Representa el ${pct}% de tus gastos.`;
  } else if (totalExpense === 0 && stats.totalIncome > 0) {
    insightText = 'Excelente mes: tienes ingresos registrados y cero gastos cargados en este período.';
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <View style={styles.sparkleBox}>
            <MaterialIcons name="auto-awesome" size={14} color={tokens.colors.brand} />
          </View>
          <Text style={styles.title}>Mario IA</Text>
        </View>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>En línea</Text>
        </View>
      </View>

      {/* Insight Text */}
      <Text style={styles.insightText}>{insightText}</Text>

      {/* Action Button */}
      <TouchableOpacity
        style={styles.ctaBtn}
        onPress={onOpenChat}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Preguntarle a Mario"
      >
        <Text style={styles.ctaText}>Preguntarle a Mario</Text>
        <Feather name="arrow-right" size={13} color={tokens.colors.brand} />
      </TouchableOpacity>
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
    gap: 12,
    ...tokens.shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sparkleBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: tokens.colors.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '650' as any,
    color: tokens.colors.textPrimary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: tokens.colors.brandLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: tokens.radii.pill,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.colors.brand,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: tokens.colors.brand,
  },
  insightText: {
    fontSize: 13,
    color: tokens.colors.textSecondary,
    lineHeight: 19,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: tokens.colors.brandLight,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: tokens.radii.btn,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  ctaText: {
    fontSize: 12.5,
    fontWeight: '650' as any,
    color: tokens.colors.brand,
  },
});

