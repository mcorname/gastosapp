import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { tokens } from '../theme/tokens';

const monthFormatter = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' });
const shortFormatter = new Intl.DateTimeFormat('es-PE', { month: 'short' });
function addMonths(yearMonth: string, delta: number) {
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1, 12);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
export const MonthSelector: React.FC = () => {
  const { currentYearMonth, setCurrentYearMonth, transactions } = useFinance();
  const availableMonths = Array.from(new Set([...transactions.map(tx => tx.date.slice(0, 7)), currentYearMonth])).sort().slice(-6);
  const [year, month] = currentYearMonth.split('-').map(Number);
  const label = monthFormatter.format(new Date(year, month - 1, 1, 12));
  return <View style={styles.container}>
    <View style={styles.headerBar}>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Mes anterior" style={styles.navBtn} onPress={() => setCurrentYearMonth(addMonths(currentYearMonth, -1))}><Feather name="chevron-left" size={16} color={tokens.colors.textSecondary} /></TouchableOpacity>
      <Text style={styles.monthLabel}>{label.charAt(0).toUpperCase() + label.slice(1)}</Text>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Mes siguiente" style={styles.navBtn} onPress={() => setCurrentYearMonth(addMonths(currentYearMonth, 1))}><Feather name="chevron-right" size={16} color={tokens.colors.textSecondary} /></TouchableOpacity>
    </View>
    <View style={styles.segmentedControl}>{availableMonths.map(key => {
      const selected = key === currentYearMonth;
      const [y, m] = key.split('-').map(Number);
      const short = shortFormatter.format(new Date(y, m - 1, 1, 12)).replace('.', '');
      return <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected }} key={key} style={[styles.segment, selected && styles.segmentSelected]} onPress={() => setCurrentYearMonth(key)}><Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{short.charAt(0).toUpperCase() + short.slice(1)}</Text></TouchableOpacity>;
    })}</View>
  </View>;
};
const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 8 },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: tokens.colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: tokens.radii.btn, borderWidth: 1, borderColor: tokens.colors.borderSubtle, minWidth: 200, ...tokens.shadows.card },
  navBtn: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center', borderRadius: 7 },
  monthLabel: { color: tokens.colors.textPrimary, fontSize: 13, fontWeight: '600', textAlign: 'center', paddingHorizontal: 8 },
  segmentedControl: { flexDirection: 'row', backgroundColor: tokens.colors.surfaceTertiary, borderRadius: tokens.radii.btn, padding: 3, gap: 2, minWidth: 200 },
  segment: { flex: 1, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  segmentSelected: { backgroundColor: tokens.colors.surface, ...tokens.shadows.segmentedPill },
  segmentText: { color: tokens.colors.textSecondary, fontSize: 12, fontWeight: '500' },
  segmentTextSelected: { color: tokens.colors.textPrimary, fontWeight: '600' },
});
