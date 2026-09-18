import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { EnrichedTransaction } from '../db/repositories/transactionRepository';
import { formatDate } from '../utils/format';
import { useFinance } from '../context/FinanceContext';
import { tokens } from '../theme/tokens';
import { CategoryIcon } from './CategoryIcon';

export const TransactionItem: React.FC<{
  transaction: EnrichedTransaction;
  onDelete?: (id: string) => void;
  onOpen?: () => void;
}> = ({ transaction: tx, onDelete, onOpen }) => {
  const { displayMoney } = useFinance();
  const compact = useWindowDimensions().width < 600;
  const sign = tx.type === 'expense' ? -1 : 1;

  return (
    <View style={styles.row}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Ver movimiento ${tx.merchant}`}
        onPress={onOpen}
        disabled={!onOpen}
        style={[styles.content, compact && { alignItems: 'center' }]}
      >
        <CategoryIcon
          categoryName={tx.categoryName}
          size={14}
          boxSize={28}
          borderRadius={7}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{tx.merchant}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            {tx.categoryName} · {tx.accountName}
            {tx.destinationAccountName ? ` → ${tx.destinationAccountName}` : ''}
          </Text>
        </View>
        <View style={styles.amount}>
          <Text style={styles.meta}>{formatDate(tx.date)}</Text>
          <Text
            style={[
              styles.money,
              tx.type === 'income' && { color: tokens.colors.brand },
              tx.type === 'expense' && { color: tokens.colors.expense },
            ]}
          >
            {displayMoney(tx.amount * sign, tx.currency)}
          </Text>
        </View>
      </TouchableOpacity>
      {onDelete && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Eliminar ${tx.merchant}`}
          onPress={() => onDelete(tx.id)}
          style={styles.delete}
        >
          <Feather name="trash-2" size={16} color={tokens.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderColor: tokens.colors.separator,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    minWidth: 0,
  },
  info: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.textPrimary,
    lineHeight: 19,
  },
  meta: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    lineHeight: 16,
  },
  amount: {
    gap: 3,
    alignItems: 'flex-end',
  },
  money: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  delete: {
    padding: 14,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
