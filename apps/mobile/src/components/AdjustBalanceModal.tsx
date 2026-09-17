import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Account, parseMoneyInput } from '@ai-money/shared';
import { useFinance } from '../context/FinanceContext';
import { tokens } from '../theme/tokens';

interface AdjustBalanceModalProps {
  visible: boolean;
  account?: Account;
  onClose: () => void;
}

export const AdjustBalanceModal: React.FC<AdjustBalanceModalProps> = ({
  visible,
  account,
  onClose,
}) => {
  const { adjustBalance, displayMoney } = useFinance();

  const [newBalance, setNewBalance] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && account) {
      setNewBalance(String(account.currentBalance));
      setError('');
      setSaving(false);
    }
  }, [visible, account]);

  if (!account) return null;

  const currentBal = account.currentBalance;
  let parsedNew = 0;
  let diff = 0;
  let hasValidDiff = false;

  try {
    const trimmed = newBalance.trim();
    if (trimmed !== '') {
      parsedNew = trimmed.startsWith('-')
        ? -parseMoneyInput(trimmed.slice(1))
        : parseMoneyInput(trimmed);
      diff = Math.round((parsedNew - currentBal) * 100) / 100;
      hasValidDiff = diff !== 0;
    }
  } catch {}

  const handleSave = () => {
    if (!account) return;
    setError('');
    setSaving(true);
    try {
      adjustBalance(account.id, parsedNew);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al ajustar el saldo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Feather name="sliders" size={16} color={tokens.colors.brand} />
              </View>
              <Text style={styles.title}>Ajustar saldo</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={18} color={tokens.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Account info banner */}
          <View style={styles.accountBanner}>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountCurrentBalance}>
              Saldo actual: {displayMoney(currentBal, account.currency)}
            </Text>
          </View>

          {/* New Balance Field */}
          <View style={styles.field}>
            <Text style={styles.label}>Nuevo saldo real ({account.currency})</Text>
            <TextInput
              style={styles.input}
              value={newBalance}
              onChangeText={(t) => {
                setNewBalance(t);
                setError('');
              }}
              placeholder="0.00"
              placeholderTextColor={tokens.colors.textTertiary}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>

          {/* Difference & Traceability info */}
          {hasValidDiff && (
            <View style={styles.diffBox}>
              <Text style={styles.diffLabel}>Diferencia a registrar:</Text>
              <Text
                style={[
                  styles.diffAmount,
                  { color: diff > 0 ? tokens.colors.brand : tokens.colors.expense },
                ]}
              >
                {diff > 0 ? `+${displayMoney(diff, account.currency)}` : displayMoney(diff, account.currency)}
              </Text>
            </View>
          )}

          <Text style={styles.helperText}>
            Se generará una operación <Text style={{ fontWeight: '600' }}>AJUSTE DE SALDO</Text> en el historial para mantener la trazabilidad contable de tus cuentas.
          </Text>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {/* Actions */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, saving && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.confirmBtnText}>
                {saving ? 'Guardando...' : 'Confirmar ajuste'}
              </Text>
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
    backgroundColor: 'rgba(23, 23, 21, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sheet: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.modal,
    padding: 24,
    maxWidth: 460,
    width: '100%',
    gap: 16,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    ...tokens.shadows.cardElevated,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: tokens.colors.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
  },
  closeBtn: {
    padding: 6,
  },
  accountBanner: {
    backgroundColor: tokens.colors.surfaceSecondary,
    borderRadius: tokens.radii.cardSm,
    padding: 12,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    gap: 3,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.textPrimary,
  },
  accountCurrentBalance: {
    fontSize: 13,
    color: tokens.colors.textSecondary,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.textPrimary,
  },
  input: {
    backgroundColor: tokens.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: tokens.colors.borderDefault,
    borderRadius: tokens.radii.btn,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  diffBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAF8',
    padding: 12,
    borderRadius: tokens.radii.btn,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
  },
  diffLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: tokens.colors.textSecondary,
  },
  diffAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  helperText: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    lineHeight: 17,
  },
  errorText: {
    fontSize: 12.5,
    color: tokens.colors.danger,
    backgroundColor: tokens.colors.dangerLight,
    padding: 10,
    borderRadius: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: tokens.radii.btn,
    backgroundColor: tokens.colors.surfaceSecondary,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.textSecondary,
  },
  confirmBtn: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: tokens.radii.btn,
    backgroundColor: tokens.colors.brand,
    ...tokens.shadows.fab,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '650' as any,
    color: '#FFFFFF',
  },
});

