import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { tokens } from '../theme/tokens';

export const TopCategoriesCard: React.FC<{ onViewAll?: () => void }> = ({ onViewAll }) => {
  const { stats, displayMoney, currency } = useFinance();

  if (stats.topCategories.length === 0) {
    return null;
  }

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return <Feather name="home" size={14} color={tokens.colors.info} />;
      case 'shopping-bag':
        return <Feather name="shopping-bag" size={14} color={tokens.colors.brand} />;
      case 'utensils':
        return <MaterialIcons name="restaurant" size={14} color={tokens.colors.warning} />;
      default:
        return <Feather name="tag" size={14} color={tokens.colors.brand} />;
    }
  };

  const getCategoryBg = (index: number) => {
    return index % 2 === 0 ? tokens.colors.infoLight : tokens.colors.brandLight;
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Gastos por categoría</Text>
        <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={onViewAll} accessibilityRole="button" accessibilityLabel="Ver todas las categorias">
          <Text style={styles.actionText}>Ver todas</Text>
          <Feather name="chevron-right" size={13} color={tokens.colors.brand} />
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      <View style={styles.categoriesList}>
        {stats.topCategories.map((cat, index) => (
          <View key={index} style={styles.catRow}>
            <View style={styles.catMetaRow}>
              <View style={styles.leftCol}>
                <View style={[styles.iconBox, { backgroundColor: getCategoryBg(index) }]}>
                  {getCategoryIcon(cat.icon)}
                </View>
                <Text style={styles.catName}>{cat.name}</Text>
              </View>

              <View style={styles.rightCol}>
                <Text style={styles.catAmount}>{displayMoney(cat.total, currency)}</Text>
                <Text style={styles.catPercentage}>{cat.percentage.toFixed(1)}%</Text>
              </View>
            </View>

            {/* Apple Health Sleek Progress Track */}
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.min(Math.max(cat.percentage, 4), 100)}%`,
                  },
                ]}
              />
            </View>
          </View>
        ))}
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionText: {
    color: tokens.colors.brand,
    fontSize: 12,
    fontWeight: '500',
  },
  categoriesList: {
    gap: 14,
  },
  catRow: {
    gap: 6,
  },
  catMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catName: {
    color: tokens.colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catAmount: {
    color: tokens.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  catPercentage: {
    color: tokens.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    minWidth: 28,
    textAlign: 'right',
  },
  track: {
    height: 5,
    backgroundColor: tokens.colors.surfaceTertiary, // #ECECEF
    borderRadius: tokens.radii.pill,
    overflow: 'hidden',
    marginTop: 2,
  },
  fill: {
    height: '100%',
    backgroundColor: tokens.colors.brand, // #0A9F72
    borderRadius: tokens.radii.pill,
  },
});


