import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Account } from '@ai-money/shared';
import { useFinance } from '../context/FinanceContext';
import { tokens } from '../theme/tokens';

interface AccountCardProps {
  accounts: Account[];
  onAddAccount?: () => void;
  onOpenAccount?: (id: string) => void;
  onViewAll?: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({ accounts, onAddAccount, onOpenAccount, onViewAll }) => {
  const { displayMoney } = useFinance();
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Mis cuentas</Text>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={accounts.length === 0 ? onAddAccount : onViewAll}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={accounts.length === 0 ? 'Crear cuenta' : 'Ver todas las cuentas'}
        >
          <Text style={styles.actionText}>{accounts.length === 0 ? 'Nueva' : 'Ver todas'}</Text>
          <Feather
            name={accounts.length === 0 ? 'plus' : 'chevron-right'}
            size={13}
            color={tokens.colors.brand}
          />
        </TouchableOpacity>
      </View>

      {/* Account items list */}
      <View style={styles.cardsCol}>
        {accounts.map((acc) => {
          const isWallet = acc.type === 'cash' || acc.name.toLowerCase().includes('efectivo');
          const badgeBg = isWallet ? tokens.colors.brandLight : tokens.colors.infoLight;
          const iconColor = isWallet ? tokens.colors.brand : tokens.colors.info;
          const statusText = isWallet ? 'Disponible' : 'Cuenta principal';

          // Visual display name: if account has standard name, display cleanly
          const displayName = acc.name === 'Cuenta Principal (Soles)'
            ? 'Cuenta Bancaria (BCP / Interbank)'
            : acc.name;

          return (
            <TouchableOpacity key={acc.id} style={styles.accountCard} onPress={() => onOpenAccount?.(acc.id)} activeOpacity={0.75} accessibilityRole="button" accessibilityLabel={`Abrir cuenta ${displayName}`}> 
              {/* Icono */}
              <View style={[styles.iconBox, { backgroundColor: badgeBg }]}>
                {isWallet ? (
                  <MaterialIcons name="account-balance-wallet" size={18} color={iconColor} />
                ) : (
                  <MaterialIcons name="account-balance" size={18} color={iconColor} />
                )}
              </View>

              {/* Información de cuenta (Flexible, nunca truncada con ellipsis) */}
              <View style={styles.infoCol}>
                <Text style={styles.accountName}>
                  {displayName}
                </Text>
                <Text style={styles.accountStatus}>{statusText}</Text>
              </View>

              {/* Saldo (Alineado a la derecha, tabular nums, nunca cortado) */}
              <View style={styles.balanceCol}>
                <Text style={styles.accountBalance}>
                  {displayMoney(acc.currentBalance, acc.currency || 'PEN')}
                </Text>
              </View>

              {/* Indicador de acción */}
              <View style={styles.chevronCol}>
                <Feather name="chevron-right" size={15} color={tokens.colors.textTertiary} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  sectionTitle: {
    color: tokens.colors.textPrimary,
    fontSize: 16,
    fontWeight: '650' as any,
    letterSpacing: -0.2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: tokens.colors.brand,
    fontSize: 13,
    fontWeight: '500',
  },
  cardsCol: {
    gap: 10,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: tokens.radii.card,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    ...tokens.shadows.card,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoCol: {
    flex: 1,
    minWidth: 0,
    marginRight: 12,
    justifyContent: 'center',
  },
  accountName: {
    color: tokens.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
    letterSpacing: -0.2,
    ...(Platform.OS === 'web'
      ? ({
          wordBreak: 'normal',
          overflowWrap: 'anywhere',
        } as any)
      : {}),
  },
  accountStatus: {
    color: tokens.colors.textSecondary,
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  balanceCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 95,
  },
  accountBalance: {
    color: tokens.colors.textPrimary,
    fontSize: 14.5,
    fontWeight: '650' as any,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    letterSpacing: -0.2,
    ...(Platform.OS === 'web'
      ? ({
          whiteSpace: 'nowrap',
        } as any)
      : {}),
  },
  chevronCol: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});



