import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';

interface Message {
  id: string;
  sender: 'user' | 'denis';
  text: string;
  timestamp: string;
}

interface DenisChatModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DenisChatModal: React.FC<DenisChatModalProps> = ({ visible, onClose }) => {
  const { stats, totalBalance } = useFinance();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'denis',
      text: `¡Hola! Soy Denis, tu asesor financiero con IA. Veo que tienes un balance total de $${totalBalance.toLocaleString()} y este mes tus gastos son de $${stats.totalExpense.toLocaleString()} frente a ingresos de $${stats.totalIncome.toLocaleString()}.\n\n¿En qué te puedo ayudar hoy?`,
      timestamp: 'Ahora',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    '¿Cómo van mis finanzas este mes?',
    '¿Cuál es mi mayor categoría de gasto?',
    '¿Cuánto puedo ahorrar este mes?',
  ];

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: 'Ahora',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let replyText = '';
      try {
        const resp = await fetch('http://localhost:3001/api/ai/chat-denis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: textToSend,
            financialContext: {
              totalBalance,
              monthlyIncome: stats.totalIncome,
              monthlyExpense: stats.totalExpense,
              topCategories: stats.topCategories,
            },
          }),
        });
        if (resp.ok) {
          const json = await resp.json();
          replyText = json.reply;
        }
      } catch (err) {
        console.log('Backend not reachable, generating local Denis financial response');
      }

      if (!replyText) {
        // Generador local inteligente con los datos reales de SQLite
        const lower = textToSend.toLowerCase();
        if (lower.includes('mayor') || lower.includes('categoría') || lower.includes('categoria')) {
          if (stats.topCategories.length > 0) {
            const top = stats.topCategories[0];
            replyText = `Tu mayor gasto este mes es en "${top.name}" con un total de $${top.total.toLocaleString()} (${top.percentage}% de tus gastos totales).`;
          } else {
            replyText = 'Aún no registras gastos suficientes este mes para determinar tu categoría principal.';
          }
        } else if (lower.includes('ahorrar') || lower.includes('ahorro')) {
          const savings = stats.netSavings;
          if (savings > 0) {
            replyText = `Actualmente tienes un superávit de $${savings.toLocaleString()} este mes. Te sugiero destinar al menos el 50% de ese valor a tu bolsillo de fondo de emergencias.`;
          } else {
            replyText = `Tus gastos superan tus ingresos por $${Math.abs(savings).toLocaleString()}. Te recomiendo revisar suscripciones o salidas a comer para volver a números verdes.`;
          }
        } else {
          replyText = `Resumen rápido de Denis: Tienes $${stats.totalIncome.toLocaleString()} en ingresos y $${stats.totalExpense.toLocaleString()} en gastos. Tu balance neto este mes es de $${stats.netSavings.toLocaleString()}. ¡Mantén la disciplina financiera!`;
        }
      }

      const denisMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'denis',
        text: replyText,
        timestamp: 'Ahora',
      };
      setMessages((prev) => [...prev, denisMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.denisAvatar}>
                <MaterialIcons name="smart-toy" size={20} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.denisName}>Denis</Text>
                <Text style={styles.denisStatus}>Tu Asesor Financiero IA</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Quick Context Chips */}
          <View style={styles.contextBar}>
            <Text style={styles.contextChip}>💰 Balance: ${totalBalance.toLocaleString()}</Text>
            <Text style={styles.contextChip}>📉 Gastos: ${stats.totalExpense.toLocaleString()}</Text>
          </View>

          {/* Messages list */}
          <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
            {messages.map((m) => (
              <View
                key={m.id}
                style={[
                  styles.bubbleContainer,
                  m.sender === 'user' ? styles.userBubbleContainer : styles.denisBubbleContainer,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    m.sender === 'user' ? styles.userBubble : styles.denisBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      m.sender === 'user' ? styles.userBubbleText : styles.denisBubbleText,
                    ]}
                  >
                    {m.text}
                  </Text>
                </View>
              </View>
            ))}
            {loading && (
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text style={styles.loadingText}>Denis está analizando tus finanzas...</Text>
              </View>
            )}
          </ScrollView>

          {/* Quick Questions */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickBar}
            contentContainerStyle={styles.quickContent}
          >
            {quickQuestions.map((q, i) => (
              <TouchableOpacity
                key={i}
                style={styles.quickPill}
                onPress={() => handleSend(q)}
                disabled={loading}
              >
                <Text style={styles.quickPillText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Input field */}
          <View style={styles.inputArea}>
            <TextInput
              style={styles.input}
              placeholder="Pregúntale a Denis..."
              placeholderTextColor="#64748B"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !input && styles.sendBtnDisabled]}
              onPress={() => handleSend()}
              disabled={!input || loading}
            >
              <MaterialIcons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0F172A',
    height: '92%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    display: 'flex',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  denisAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  denisName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  denisStatus: {
    color: '#3B82F6',
    fontSize: 12,
  },
  closeBtn: {
    padding: 4,
  },
  contextBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
  },
  contextChip: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 20,
    gap: 14,
  },
  bubbleContainer: {
    flexDirection: 'row',
  },
  userBubbleContainer: {
    justifyContent: 'flex-end',
  },
  denisBubbleContainer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  denisBubble: {
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userBubbleText: {
    color: '#FFFFFF',
  },
  denisBubbleText: {
    color: '#E2E8F0',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 13,
  },
  quickBar: {
    maxHeight: 44,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  quickContent: {
    gap: 8,
  },
  quickPill: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickPillText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  inputArea: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
