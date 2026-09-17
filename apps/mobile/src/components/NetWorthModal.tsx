import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useFinance } from '../context/FinanceContext';
import { tokens } from '../theme/tokens';

interface NetWorthModalProps {
  visible: boolean;
  onClose: () => void;
  onManageAccounts: () => void;
}

export const NetWorthModal: React.FC<NetWorthModalProps> = ({
  visible,
  onClose,
  onManageAccounts,
}) => {
  const { accounts, totalBalance, currency, displayMoney } = useFinance();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <MaterialIcons name="account-balance" size={17} color={tokens.colors.brand} />
              </View>
              <Text style={styles.title}>Detalle del patrimonio</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={18} color={tokens.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Tu patrimonio se calcula automáticamente sumando el saldo disponible de todas tus cuentas activas.
          </Text>

          {/* Accounts Breakdown */}
          <View style={styles.accountsList}>
            {accounts.map((acc) => {
              const isNegative = acc.currentBalance < 0;
              const isWallet = acc.type === 'cash' || acc.name.toLowerCase().includes('efectivo');

              return (
                <View key={acc.id} style={styles.accountRow}>
                  <View style={styles.accLeft}>
                    <View style={[styles.accIconBox, { backgroundColor: isWallet ? tokens.colors.brandLight : tokens.colors.infoLight }]}>
                      {isWallet ? (
                        <MaterialIcons name="account-balance-wallet" size={15} color={tokens.colors.brand} />
                      ) : (
                        <MaterialIcons name="account-balance" size={15} color={tokens.colors.info} />
                      )}
                    </View>
                    <Text style={styles.accName}>{acc.name}</Text>
                  </View>
                  <Text
                    style={[
                      styles.accBalance,
                      isNegative && { color: tokens.colors.expense },
                    ]}
                  >
                    {displayMoney(acc.currentBalance, acc.currency || currency)}
                  </Text>
                </View>
              );
            })}

            {/* Separator */}
            <View style={styles.divider} />

            {/* Total Patrimonio */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Patrimonio neto ({currency})</Text>
              <Text style={styles.totalAmount}>{displayMoney(totalBalance, currency)}</Text>
            </View>
          </View>

          {/* CTA: Gestionar cuentas */}
          <TouchableOpacity
            style={styles.manageBtn}
            onPress={() => {
              onClose();
              onManageAccounts();
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Gestionar cuentas"
          >
            <Feather name="credit-card" size={15} color="#FFFFFF" />
            <Text style={styles.manageBtnText}>Gestionar cuentas</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    maxWidth: 440,
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
  description: {
    fontSize: 12.5,
    color: tokens.colors.textSecondary,
    lineHeight: 18,
  },
  accountsList: {
    backgroundColor: '#FAFAF8',
    borderRadius: tokens.radii.cardSm,
    padding: 14,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    gap: 10,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  accIconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accName: {
    fontSize: 13,
    fontWeight: '500',
    color: tokens.colors.textPrimary,
  },
  accBalance: {
    fontSize: 13.5,
    fontWeight: '650' as any,
    color: tokens.colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.separator,
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: tokens.colors.brand,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: tokens.colors.brand,
    borderRadius: tokens.radii.btn,
    paddingVertical: 12,
    ...tokens.shadows.fab,
  },
  manageBtnText: {
    fontSize: 13.5,
    fontWeight: '650' as any,
    color: '#FFFFFF',
  },
});

