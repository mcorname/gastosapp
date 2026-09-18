import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { tokens } from '../theme/tokens';
import { CategoryIcon, getCategoryMeta } from './CategoryIcon';

interface CategoryAnalyticsProps {
  onViewAll?: () => void;
}

export const CategoryAnalytics: React.FC<CategoryAnalyticsProps> = ({ onViewAll }) => {
  const { stats, displayMoney, currency } = useFinance();

  const categories = stats.topCategories;

  if (!categories || categories.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.cardTitle}>Resumen por categoría</Text>
        </View>
        <View style={styles.emptyBox}>
          <Feather name="pie-chart" size={24} color={tokens.colors.textTertiary} />
          <Text style={styles.emptyText}>Sin gastos en este período</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Resumen por categoría</Text>
        {onViewAll && (
          <TouchableOpacity
            style={styles.actionRow}
            onPress={onViewAll}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Ver todas las categorías"
          >
            <Text style={styles.actionText}>Ver todas</Text>
            <Feather name="chevron-right" size={13} color={tokens.colors.brand} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Rows */}
      <View style={styles.list}>
        {categories.map((cat) => {
          const meta = getCategoryMeta(cat.name);
          const safePct = Number.isFinite(cat.percentage) ? Math.min(Math.max(cat.percentage, 0), 100) : 0;
          const pctLabel = safePct.toFixed(1) + '%';

          return (
            <View key={cat.id || cat.name} style={styles.catItem}>
              {/* Row: [icon] Name ... Amount */}
              <View style={styles.topRow}>
                <View style={styles.nameRow}>
                  <CategoryIcon categoryName={cat.name} size={14} boxSize={26} borderRadius={6} />
                  <Text
                    style={styles.catName}
                    numberOfLines={1}
                    {...(Platform.OS === 'web' ? ({ title: cat.name } as any) : {})}
                  >
                    {cat.name}
                  </Text>
                </View>
                <Text style={styles.catAmount}>{displayMoney(cat.total, currency)}</Text>
              </View>

              {/* Row: 6px Progress Bar + Percentage */}
              <View style={styles.progressRow}>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${safePct}%`,
                        backgroundColor: meta.color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.pctText}>{pctLabel}</Text>
              </View>
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
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: tokens.colors.textPrimary,
    letterSpacing: -0.2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.brand,
  },
  list: {
    gap: 14,
  },
  catItem: {
    gap: 7,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  catName: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.textPrimary,
  },
  catAmount: {
    fontSize: 13.5,
    fontWeight: '600',
    color: tokens.colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: tokens.colors.surfaceTertiary,
    borderRadius: tokens.radii.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: tokens.radii.pill,
  },
  pctText: {
    fontSize: 11,
    fontWeight: '600',
    color: tokens.colors.textSecondary,
    fontVariant: ['tabular-nums'],
    width: 42,
    textAlign: 'right',
  },
  emptyBox: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
    color: tokens.colors.textTertiary,
  },
});

