import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Account, type TransactionInput } from '@ai-money/shared';
import { useFinance } from '../context/FinanceContext';
import { tokens } from '../theme/tokens';
import { AdjustBalanceModal } from './AdjustBalanceModal';
import { Sheet, Field, Choices, ErrorText, Button } from './FormUI';

interface AccountsViewProps {
  onTransfer: (draft: Partial<TransactionInput>) => void;
  onViewMovements: (accountId: string) => void;
}

const ACCOUNT_TYPES = [
  { value: 'cash', label: 'Efectivo / Billetera' },
  { value: 'bank', label: 'Cuenta bancaria' },
  { value: 'savings', label: 'Ahorros' },
  { value: 'investment', label: 'Inversión' },
  { value: 'credit_card', label: 'Tarjeta de crédito' },
];

export const AccountsView: React.FC<AccountsViewProps> = ({
  onTransfer,
  onViewMovements,
}) => {
  const {
    accounts,
    transactions,
    totalBalance,
    currency,
    displayMoney,
    addAccount,
    updateAccount,
    deleteAccount,
  } = useFinance();

  // Modals state
  const [adjustAccount, setAdjustAccount] = useState<Account | undefined>();
  const [modalMode, setModalMode] = useState<'new' | 'edit' | 'delete' | ''>('');
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>();

  // Form fields
  const [name, setName] = useState('');
  const [type, setType] = useState('cash');
  const [initialBalance, setInitialBalance] = useState('0');
  const [accCurrency, setAccCurrency] = useState('PEN');
  const [formError, setFormError] = useState('');

  const openNew = () => {
    setSelectedAccount(undefined);
    setName('');
    setType('cash');
    setInitialBalance('0');
    setAccCurrency('PEN');
    setFormError('');
    setModalMode('new');
  };

  const openEdit = (acc: Account) => {
    setSelectedAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setAccCurrency(acc.currency || 'PEN');
    setFormError('');
    setModalMode('edit');
  };

  const openDelete = (acc: Account) => {
    setSelectedAccount(acc);
    setFormError('');
    setModalMode('delete');
  };

  const handleSaveForm = () => {
    setFormError('');
    try {
      if (modalMode === 'new') {
        const bal = parseFloat(initialBalance.replace(',', '.')) || 0;
        addAccount({
          name,
          type: type as any,
          currency: accCurrency,
          initialBalance: bal,
        });
      } else if (modalMode === 'edit' && selectedAccount) {
        updateAccount(selectedAccount.id, {
          name,
          type: type as any,
          currency: accCurrency,
        });
      } else if (modalMode === 'delete' && selectedAccount) {
        deleteAccount(selectedAccount.id);
      }
      setModalMode('');
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error al guardar.');
    }
  };

  const accountHasHistory = (id: string) => {
    return transactions.some((t) => t.accountId === id || t.destinationAccountId === id);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Cuentas financieras</Text>
          <Text style={styles.subtitle}>
            {accounts.length} {accounts.length === 1 ? 'cuenta activa' : 'cuentas activas'} · Total: {displayMoney(totalBalance, currency)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.newBtn}
          onPress={openNew}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Nueva cuenta"
        >
          <Feather name="plus" size={14} color="#FFFFFF" />
          <Text style={styles.newBtnText}>Nueva cuenta</Text>
        </TouchableOpacity>
      </View>

      {/* Grid of Accounts */}
      <View style={styles.grid}>
        {accounts.map((acc) => {
          const isWallet = acc.type === 'cash' || acc.name.toLowerCase().includes('efectivo');
          const isNegative = acc.currentBalance < 0;
          const txCount = transactions.filter(
            (t) => t.accountId === acc.id || t.destinationAccountId === acc.id
          ).length;

          const typeLabel = ACCOUNT_TYPES.find((t) => t.value === acc.type)?.label || acc.type;

          return (
            <View key={acc.id} style={styles.card}>
              {/* Card Top */}
              <View style={styles.cardTopRow}>
                <View style={styles.cardLeftTitleRow}>
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: isWallet ? tokens.colors.brandLight : tokens.colors.infoLight },
                    ]}
                  >
                    {isWallet ? (
                      <MaterialIcons name="account-balance-wallet" size={18} color={tokens.colors.brand} />
                    ) : (
                      <MaterialIcons name="account-balance" size={18} color={tokens.colors.info} />
                    )}
                  </View>

                  <View style={styles.cardTitleCol}>
                    <Text style={styles.cardAccountName} numberOfLines={2}>
                      {acc.name}
                    </Text>
                    <Text style={styles.cardAccountType}>
                      {typeLabel} · {acc.currency || 'PEN'}
                    </Text>
                  </View>
                </View>

                {/* Edit Icon Button */}
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => openEdit(acc)}
                  accessibilityRole="button"
                  accessibilityLabel={`Editar cuenta ${acc.name}`}
                >
                  <Feather name="edit-2" size={14} color={tokens.colors.textTertiary} />
                </TouchableOpacity>
              </View>

              {/* Balance Row */}
              <View style={styles.balanceBlock}>
                <Text style={styles.balanceLabel}>Saldo disponible</Text>
                <Text
                  style={[
                    styles.balanceAmount,
                    isNegative && { color: tokens.colors.expense },
                  ]}
                >
                  {displayMoney(acc.currentBalance, acc.currency || currency)}
                </Text>
                <Text style={styles.metaInfoText}>
                  {txCount} {txCount === 1 ? 'movimiento asociado' : 'movimientos asociados'}
                </Text>
              </View>

              {/* Action Buttons Row */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.cardBtn}
                  onPress={() => setAdjustAccount(acc)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Ajustar saldo de ${acc.name}`}
                >
                  <Feather name="sliders" size={13} color={tokens.colors.brand} />
                  <Text style={styles.cardBtnText}>Ajustar saldo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cardBtn}
                  onPress={() =>
                    onTransfer({
                      type: 'transfer',
                      accountId: acc.id,
                      merchant: 'Transferencia entre cuentas',
                    })
                  }
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Transferir desde ${acc.name}`}
                >
                  <Feather name="repeat" size={13} color={tokens.colors.brand} />
                  <Text style={styles.cardBtnText}>Transferir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cardBtnSecondary}
                  onPress={() => onViewMovements(acc.id)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Ver movimientos de ${acc.name}`}
                >
                  <Feather name="list" size={13} color={tokens.colors.textSecondary} />
                  <Text style={styles.cardBtnTextSecondary}>Movimientos</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {/* Adjust Balance Modal */}
      <AdjustBalanceModal
        visible={!!adjustAccount}
        account={adjustAccount}
        onClose={() => setAdjustAccount(undefined)}
      />

      {/* Create / Edit / Delete Sheet Modal */}
      <Sheet
        visible={!!modalMode}
        title={
          modalMode === 'new'
            ? 'Nueva cuenta'
            : modalMode === 'edit'
            ? 'Editar cuenta'
            : 'Eliminar cuenta'
        }
        onClose={() => setModalMode('')}
      >
        {(modalMode === 'new' || modalMode === 'edit') && (
          <>
            <Field label="Nombre de la cuenta" value={name} onChangeText={setName} placeholder="Ej. BCP Ahorros" />
            <Choices label="Tipo de cuenta" value={type} onChange={setType} options={ACCOUNT_TYPES} />
            {modalMode === 'new' ? (
              <>
                <Field
                  label="Saldo inicial"
                  value={initialBalance}
                  onChangeText={setInitialBalance}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                />
                <Choices
                  label="Moneda"
                  value={accCurrency}
                  onChange={setAccCurrency}
                  options={['PEN', 'USD', 'EUR', 'COP', 'MXN', 'ARS', 'CLP', 'BRL'].map((v) => ({
                    value: v,
                    label: v,
                  }))}
                />
              </>
            ) : null}
          </>
        )}

        {modalMode === 'delete' && selectedAccount && (
          <Text style={styles.deleteConfirmText}>
            {accountHasHistory(selectedAccount.id)
              ? 'Esta cuenta tiene movimientos asociados y no puede eliminarse para preservar la integridad de tu historial. Si deseas, puedes ajustar su saldo a 0.'
              : '¿Estás seguro de que deseas eliminar esta cuenta? Esta acción no se puede deshacer.'}
          </Text>
        )}

        <ErrorText error={formError} />

        <Button
          danger={modalMode === 'delete'}
          disabled={modalMode === 'delete' && selectedAccount ? accountHasHistory(selectedAccount.id) : !name.trim()}
          onPress={handleSaveForm}
        >
          {modalMode === 'delete'
            ? 'Eliminar cuenta'
            : modalMode === 'edit'
            ? 'Guardar cambios'
            : 'Crear cuenta'}
        </Button>
      </Sheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: tokens.colors.textSecondary,
    marginTop: 2,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: tokens.colors.brand,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: tokens.radii.btn,
    ...tokens.shadows.fab,
  },
  newBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.card,
    padding: 20,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    gap: 14,
    minWidth: 320,
    flex: 1,
    ...tokens.shadows.card,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLeftTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitleCol: {
    flex: 1,
    gap: 2,
  },
  cardAccountName: {
    fontSize: 15,
    fontWeight: '650' as any,
    color: tokens.colors.textPrimary,
    letterSpacing: -0.2,
  },
  cardAccountType: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceBlock: {
    gap: 3,
    paddingVertical: 4,
  },
  balanceLabel: {
    fontSize: 11.5,
    fontWeight: '500',
    color: tokens.colors.textSecondary,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.4,
  },
  metaInfoText: {
    fontSize: 11.5,
    color: tokens.colors.textTertiary,
    marginTop: 2,
  },
  cardActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.separator,
  },
  cardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: tokens.colors.brandLight,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: tokens.radii.btn,
  },
  cardBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.brand,
  },
  cardBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: tokens.colors.surfaceSecondary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: tokens.radii.btn,
  },
  cardBtnTextSecondary: {
    fontSize: 12,
    fontWeight: '500',
    color: tokens.colors.textSecondary,
  },
  deleteConfirmText: {
    fontSize: 13,
    color: tokens.colors.textSecondary,
    lineHeight: 19,
  },
});

