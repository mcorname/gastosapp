import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import type { TransactionInput } from '@ai-money/shared';
import { useFinance } from '../context/FinanceContext';
import { extractLocalTransaction } from '../services/assistantClient';
import { tokens } from '../theme/tokens';
import { CategoryIcon } from './CategoryIcon';
interface QuickAIModalProps { visible: boolean; onClose: () => void; onReview?: (draft: Partial<TransactionInput>) => void; }
type Extraction = Awaited<ReturnType<typeof extractLocalTransaction>>;
export const QuickAIModal: React.FC<QuickAIModalProps> = ({ visible, onClose, onReview }) => {
  const { accounts, categories, currency, showAmounts, displayMoney } = useFinance();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Extraction | null>(null);
  const [error, setError] = useState('');
  const busy = useRef(false);
  const generation = useRef(0);
  useEffect(() => { generation.current++; busy.current = false; setLoading(false); setInput(''); setData(null); setError(''); }, [visible]);
  const extract = async (text = input) => {
    if (!text.trim() || busy.current || !showAmounts) return;
    busy.current = true; setLoading(true); setError(''); setData(null);
    const requestGeneration = generation.current;
    try {
      const result = await extractLocalTransaction(text, { accounts, categories, currency });
      if (requestGeneration === generation.current) setData(result);
    } catch (failure) {
      if (requestGeneration === generation.current) setError(failure instanceof Error ? failure.message : 'No se pudo interpretar el texto. Inténtalo de nuevo.');
    } finally {
      if (requestGeneration === generation.current) { busy.current = false; setLoading(false); }
    }
  };
  const review = () => {
    if (!data || !onReview || busy.current || !showAmounts) return;
    busy.current = true;
    try {
      const { warnings, ...draft } = data;
      onReview({ ...draft, source: 'ai_text' });
      onClose();
    } catch { setError('No se pudo abrir la revisión. Inténtalo de nuevo.'); }
    finally { busy.current = false; }
  };
  const rows = data ? [
    ['Monto', displayMoney(data.amount, data.currency)],
    ['Tipo', data.type === 'income' ? 'Ingreso' : 'Gasto'],
    ['Descripción', data.merchant],
    ['Categoría', categories.find(category => category.id === data.categoryId)?.name ?? 'Por seleccionar'],
    ['Cuenta', accounts.find(account => account.id === data.accountId)?.name ?? 'Por seleccionar'],
    ['Fecha', data.date],
  ] : [];
  return <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.sheet, { maxHeight: '90%' }]}><ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.sheetHeader}><View style={[styles.headerTitleRow, { flex: 1 }]}><View style={styles.iconCircle}><MaterialIcons name="auto-awesome" size={16} color={tokens.colors.brand} /></View><Text style={[styles.sheetTitle, { flexShrink: 1 }]}>Registro con texto</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Cerrar registro con texto" style={{ padding: 10 }} onPress={onClose}><Feather name="x" size={18} color={tokens.colors.textSecondary} /></TouchableOpacity></View>
        <Text style={styles.instructions}>Interpretación local. Escribe un monto, descripción y cuenta; puedes indicar una fecha completa. Revisa y edita los datos antes de guardar.</Text>
        {!showAmounts ? <Text style={styles.instructions}>Activa “Mostrar montos” para introducir y revisar una transacción.</Text> : <>
          <View style={styles.inputContainer}><TextInput accessibilityLabel="Detalle de la transacción" style={styles.textInput} placeholder="Ej. Almuerzo 18,50 soles con Efectivo" placeholderTextColor={tokens.colors.textTertiary} value={input} onChangeText={text => { setInput(text); setData(null); setError(''); }} editable={!loading} multiline /><TouchableOpacity accessibilityRole="button" accessibilityLabel="Interpretar transacción" style={[styles.actionBtn, (!input.trim() || loading) && styles.actionBtnDisabled]} onPress={() => extract()} disabled={!input.trim() || loading}>{loading ? <ActivityIndicator color="#FFF" /> : <Feather name="arrow-up" size={16} color="#FFF" />}</TouchableOpacity></View>
          <View style={styles.samplesGrid}>{['Almuerzo 18,50 soles', 'Recibí sueldo 2500 soles'].map(prompt => <TouchableOpacity accessibilityRole="button" key={prompt} style={styles.sampleChip} disabled={loading} onPress={() => { setInput(prompt); void extract(prompt); }}><Text style={styles.sampleText}>{prompt}</Text></TouchableOpacity>)}</View>
          {loading && <Text accessibilityLiveRegion="polite" style={styles.instructions}>Interpretando el texto…</Text>}
          {!!error && <Text accessibilityRole="alert" style={[styles.instructions, { color: tokens.colors.danger }]}>{error}</Text>}
          {data && <View style={styles.previewCard}><Text style={styles.previewTitle}>Datos detectados · aún no guardados</Text>{rows.map(([label, value]) => <View key={label} style={[styles.previewRow, { gap: 12 }]}><Text style={styles.previewKey}>{label}</Text>{label === 'Categoría' && value !== 'Por seleccionar' ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><CategoryIcon categoryName={value} size={11} boxSize={18} borderRadius={4} /><Text style={[styles.previewVal, { textAlign: 'right' }]}>{value}</Text></View> : <Text style={[styles.previewVal, { flex: 1, textAlign: 'right' }]}>{value}</Text>}</View>)}{data.warnings.map(warning => <Text key={warning} style={[styles.instructions, { marginTop: 8, marginBottom: 0 }]}>{warning}</Text>)}<Text style={[styles.instructions, { marginTop: 10 }]}>Sin una fecha explícita se usa hoy. Podrás editar monto, descripción, categoría, cuenta y fecha en el siguiente paso.</Text><TouchableOpacity accessibilityRole="button" disabled={!onReview || loading} style={[styles.confirmBtn, (!onReview || loading) && styles.actionBtnDisabled]} onPress={review}><Text style={styles.confirmBtnText}>Revisar y confirmar</Text></TouchableOpacity></View>}
        </>}
      </ScrollView></View>
    </KeyboardAvoidingView>
  </Modal>;
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.modal,
    padding: 20,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    ...tokens.shadows.cardElevated,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: tokens.colors.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetTitle: {
    color: tokens.colors.textPrimary,
    fontSize: 15,
    fontWeight: '650' as any,
  },
  instructions: {
    color: tokens.colors.textSecondary,
    fontSize: 13,
    marginBottom: 14,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: tokens.colors.surfaceSecondary,
    borderRadius: tokens.radii.input,
    padding: 8,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
  },
  textInput: {
    flex: 1,
    color: tokens.colors.textPrimary,
    fontSize: 13,
    paddingHorizontal: 8,
    minHeight: 40,
  },
  actionBtn: {
    backgroundColor: tokens.colors.brand,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnDisabled: {
    opacity: 0.35,
  },
  sampleLabel: {
    color: tokens.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  samplesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  sampleChip: {
    backgroundColor: tokens.colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: tokens.radii.pill,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
  },
  sampleText: {
    color: tokens.colors.textSecondary,
    fontSize: 11,
  },
  previewCard: {
    backgroundColor: tokens.colors.surfaceSecondary,
    borderRadius: tokens.radii.cardSm,
    padding: 14,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    marginTop: 4,
  },
  previewTitle: {
    color: tokens.colors.textPrimary,
    fontSize: 12,
    fontWeight: '650' as any,
    marginBottom: 8,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  previewKey: {
    color: tokens.colors.textSecondary,
    fontSize: 12,
  },
  previewVal: {
    color: tokens.colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  monthSelectorRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.separator,
  },
  previewMonthPills: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  miniPill: {
    flex: 1,
    backgroundColor: tokens.colors.surface,
    paddingVertical: 5,
    borderRadius: tokens.radii.xs,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.borderDefault,
  },
  miniPillActive: {
    backgroundColor: tokens.colors.brand,
    borderColor: tokens.colors.brand,
  },
  miniPillText: {
    color: tokens.colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  miniPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  confirmBtn: {
    backgroundColor: tokens.colors.brand,
    borderRadius: tokens.radii.btn,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 12,
    ...tokens.shadows.fab,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '650' as any,
  },
});

