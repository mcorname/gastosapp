import React, { useState, useRef, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { askLocalAssistant } from '../services/assistantClient';
import { tokens } from '../theme/tokens';
interface Message { id: number; sender: 'user' | 'mario'; text: string; }
interface MarioChatModalProps { visible: boolean; onClose: () => void; }
export const MarioChatModal: React.FC<MarioChatModalProps> = ({ visible, onClose }) => {
  const { stats, totalBalance, currency, currentYearMonth, showAmounts, displayMoney } = useFinance();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [failedPrompt, setFailedPrompt] = useState('');
  const busy = useRef(false);
  const sequence = useRef(0);
  const generation = useRef(0);
  const scroll = useRef<ScrollView>(null);
  useEffect(() => { generation.current++; busy.current = false; setLoading(false); setMessages([]); setInput(''); setError(''); setFailedPrompt(''); }, [currency, currentYearMonth]);
  const send = async (prompt = input, retry = false) => {
    const text = prompt.trim();
    if (!text || busy.current || !showAmounts) return;
    busy.current = true;
    const requestGeneration = generation.current;
    setLoading(true); setError(''); setInput('');
    if (!retry) setMessages(previous => [...previous, { id: ++sequence.current, sender: 'user', text }]);
    try {
      const reply = await askLocalAssistant(text, { totalBalance, monthlyIncome: stats.totalIncome, monthlyExpense: stats.totalExpense, topCategories: stats.topCategories, currency, period: currentYearMonth });
      if (requestGeneration === generation.current) { setMessages(previous => [...previous, { id: ++sequence.current, sender: 'mario', text: reply }]); setFailedPrompt(''); }
    } catch {
      if (requestGeneration === generation.current) { setError('No se pudo completar el análisis. Inténtalo de nuevo.'); setFailedPrompt(text); }
    } finally {
      if (requestGeneration === generation.current) { busy.current = false; setLoading(false); }
    }
  };
  return <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.sheetContainer}>
        <View style={styles.header}><View style={styles.headerLeft}><View style={styles.marioAvatar}><MaterialIcons name="auto-awesome" size={18} color={tokens.colors.brand} /></View><View><Text style={styles.marioName}>Mario IA</Text><Text style={styles.marioSubtitle}>Análisis local basado en tus registros</Text></View></View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Cerrar chat de Mario" onPress={onClose} style={styles.closeBtn}><Feather name="x" size={20} color={tokens.colors.textSecondary} /></TouchableOpacity></View>
        <View style={styles.contextBar}><View style={styles.contextItem}><Text style={styles.contextLabel}>Saldo total · {currency}</Text><Text style={styles.contextVal}>{displayMoney(totalBalance, currency)}</Text></View><View style={styles.contextItem}><Text style={styles.contextLabel}>Gastos · {currentYearMonth}</Text><Text style={styles.contextVal}>{displayMoney(stats.totalExpense, currency)}</Text></View></View>
        <View style={styles.centralThread}>
          <ScrollView ref={scroll} style={styles.chatScroll} contentContainerStyle={styles.chatContent} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
            <Text style={styles.marioBubbleText}>{showAmounts ? 'Puedo consultar tu resumen, categorías de gasto y diferencia entre ingresos y gastos del período seleccionado.' : 'Conversación oculta para proteger tus montos. Activa “Mostrar montos” para verla y consultar.'}</Text>
            {showAmounts && messages.map(message => <View key={message.id} style={[styles.bubbleRow, message.sender === 'user' ? styles.userBubbleRow : styles.marioBubbleRow]}><View style={[styles.bubble, message.sender === 'user' ? styles.userBubble : styles.marioBubble]}><Text style={[styles.bubbleText, message.sender === 'user' ? styles.userBubbleText : styles.marioBubbleText]}>{message.text}</Text></View></View>)}
            {loading && <View style={styles.loadingRow}><ActivityIndicator color={tokens.colors.brand} /><Text style={styles.loadingText}>Analizando tus registros…</Text></View>}
            {!!error && <View><Text accessibilityRole="alert" style={styles.loadingText}>{error}</Text><TouchableOpacity accessibilityRole="button" onPress={() => send(failedPrompt, true)} disabled={loading || !showAmounts} style={styles.chipBtn}><Text style={styles.chipText}>Reintentar consulta</Text></TouchableOpacity></View>}
          </ScrollView>
          <View style={styles.chipsContainer}><ScrollView horizontal contentContainerStyle={styles.chipsScroll}>{['Resumen de mis finanzas', '¿Cuál es mi mayor categoría de gasto?', '¿Cuánto puedo ahorrar?'].map(question => <TouchableOpacity accessibilityRole="button" key={question} style={styles.chipBtn} onPress={() => send(question)} disabled={loading || !showAmounts}><Text style={styles.chipText}>{question}</Text></TouchableOpacity>)}</ScrollView></View>
          <View style={styles.composerWrapper}><View style={styles.composer}>
            <TextInput accessibilityLabel="Pregunta para Mario" style={styles.input} multiline editable={showAmounts && !loading} placeholder="Pregúntale a Mario…" placeholderTextColor={tokens.colors.textTertiary} value={showAmounts ? input : ''} onChangeText={setInput} onKeyPress={event => {
              const native = event.nativeEvent as typeof event.nativeEvent & { shiftKey?: boolean; isComposing?: boolean };
              if (Platform.OS === 'web' && native.key === 'Enter' && !native.shiftKey && !native.isComposing) { event.preventDefault(); void send(); }
            }} />
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Enviar pregunta" style={[styles.sendBtn, (!input.trim() || loading || !showAmounts) && styles.sendBtnDisabled]} disabled={!input.trim() || loading || !showAmounts} onPress={() => send()}><Feather name="arrow-up" size={18} color="#FFFFFF" /></TouchableOpacity>
          </View></View>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: tokens.colors.bg, // #F5F5F7
    height: '92%',
    borderTopLeftRadius: tokens.radii.modal,
    borderTopRightRadius: tokens.radii.modal,
    display: 'flex',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderSubtle,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  marioAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: tokens.colors.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marioName: {
    color: tokens.colors.textPrimary,
    fontSize: 15,
    fontWeight: '650' as any,
    letterSpacing: -0.2,
  },
  marioSubtitle: {
    color: tokens.colors.textSecondary,
    fontSize: 12,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
  },
  contextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.separator,
  },
  contextItem: {
    alignItems: 'center',
    gap: 2,
  },
  contextLabel: {
    color: tokens.colors.textSecondary,
    fontSize: 11,
    fontWeight: '400',
  },
  contextVal: {
    color: tokens.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  contextDivider: {
    width: 1,
    height: 24,
    backgroundColor: tokens.colors.separator,
  },
  centralThread: {
    flex: 1,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    display: 'flex',
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 20,
    gap: 16,
  },
  bubbleRow: {
    flexDirection: 'row',
  },
  userBubbleRow: {
    justifyContent: 'flex-end',
  },
  marioBubbleRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: tokens.radii.modal,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: tokens.colors.brand,
    borderBottomRightRadius: 4,
  },
  marioBubble: {
    backgroundColor: tokens.colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    ...tokens.shadows.card,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
  },
  userBubbleText: {
    color: '#FFFFFF',
  },
  marioBubbleText: {
    color: tokens.colors.textPrimary,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  loadingText: {
    color: tokens.colors.textSecondary,
    fontSize: 13,
  },
  chipsContainer: {
    paddingVertical: 8,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chipBtn: {
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.borderDefault,
    borderRadius: tokens.radii.btn,
    paddingHorizontal: 14,
    paddingVertical: 7,
    ...tokens.shadows.card,
  },
  chipText: {
    color: tokens.colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  composerWrapper: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingTop: 8,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: tokens.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tokens.colors.borderDefault,
    paddingHorizontal: 14,
    ...tokens.shadows.cardElevated,
  },
  input: {
    flex: 1,
    color: tokens.colors.textPrimary,
    fontSize: 14,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: tokens.colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.35,
  },
});

