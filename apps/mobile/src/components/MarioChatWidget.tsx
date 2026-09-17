import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { tokens } from '../theme/tokens';

export const MarioChatWidget = ({ onExpand }: { onExpand?: () => void }) => {
  const { stats, currentYearMonth, currency, showAmounts, displayMoney } = useFinance();
  return <View style={styles.card}>
    <View style={styles.header}><MaterialIcons name="auto-awesome" size={18} color={tokens.colors.brand} /><Text style={styles.title}>Mario IA</Text></View>
    <Text style={styles.note}>Análisis local basado en tus registros</Text>
    <Text style={styles.body}>{showAmounts ? `En ${currentYearMonth}, registraste ${displayMoney(stats.totalExpense, currency)} en gastos y ${displayMoney(stats.totalIncome, currency)} en ingresos.` : 'Tus montos están ocultos. Puedes mostrarlos para consultar el análisis del período.'}</Text>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Preguntarle a Mario" onPress={onExpand} style={styles.button}>
      <Text style={styles.buttonText}>Preguntarle a Mario</Text><Feather name="arrow-up-right" size={16} color={tokens.colors.brand} />
    </TouchableOpacity>
  </View>;
};
const styles = StyleSheet.create({
  card: { backgroundColor: tokens.colors.surface, borderRadius: tokens.radii.card, padding: 16, borderWidth: 1, borderColor: tokens.colors.borderSubtle, ...tokens.shadows.card, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { color: tokens.colors.textPrimary, fontSize: 14, fontWeight: '600' },
  note: { color: tokens.colors.textSecondary, fontSize: 11 },
  body: { color: tokens.colors.textPrimary, fontSize: 13, lineHeight: 20 },
  button: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: tokens.colors.brandLight, borderRadius: tokens.radii.btn, paddingHorizontal: 12 },
  buttonText: { color: tokens.colors.brand, fontSize: 13, fontWeight: '600' },
});
