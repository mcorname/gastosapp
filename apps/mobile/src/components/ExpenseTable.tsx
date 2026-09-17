import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { EnrichedTransaction } from '../db/repositories/transactionRepository';
import { useFinance } from '../context/FinanceContext';
import { tokens } from '../theme/tokens';
import { CategoryIcon, getCategoryMeta } from './CategoryIcon';

interface ExpenseTableProps {
  expenses: EnrichedTransaction[];
  onOpenTransaction: (id: string) => void;
  onEditTransaction: (id: string) => void;
  onDuplicateTransaction: (tx: EnrichedTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onNewTransaction: () => void;
}

type SortColumn = 'date' | 'merchant' | 'category' | 'account' | 'amount';
type SortOrder = 'asc' | 'desc';

const MONTH_NAMES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

function formatTableDate(dateStr: string): string {
  try {
    const parts = dateStr.slice(0, 10).split('-');
    if (parts.length === 3) {
      const y = parts[0];
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      return `${d} ${MONTH_NAMES[m] || ''}. ${y}`;
    }
  } catch {}
  return dateStr;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  onOpenTransaction,
  onEditTransaction,
  onDuplicateTransaction,
  onDeleteTransaction,
  onNewTransaction,
}) => {
  const { displayMoney, currency, categories, accounts } = useFinance();

  const [sortCol, setSortCol] = useState<SortColumn>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeMenuTxId, setActiveMenuTxId] = useState<string | null>(null);

  // Sorting handler
  const handleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortOrder(col === 'amount' || col === 'date' ? 'desc' : 'asc');
    }
  };

  // Filtered and sorted expenses
  const processedExpenses = useMemo(() => {
    let result = [...expenses];

    if (selectedCategory !== 'all') {
      result = result.filter((tx) => tx.categoryId === selectedCategory);
    }
    if (selectedAccount !== 'all') {
      result = result.filter((tx) => tx.accountId === selectedAccount);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortCol === 'date') {
        cmp = a.date.localeCompare(b.date);
      } else if (sortCol === 'merchant') {
        cmp = a.merchant.localeCompare(b.merchant);
      } else if (sortCol === 'category') {
        cmp = a.categoryName.localeCompare(b.categoryName);
      } else if (sortCol === 'account') {
        cmp = a.accountName.localeCompare(b.accountName);
      } else if (sortCol === 'amount') {
        cmp = a.amount - b.amount;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [expenses, selectedCategory, selectedAccount, sortCol, sortOrder]);

  // Totals calculations
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, tx) => sum + tx.amount, 0);
  }, [expenses]);

  const count = expenses.length;
  const avgAmount = count > 0 ? totalAmount / count : 0;

  // Category totals
  const categoryTotals = useMemo(() => {
    const map = new Map<string, { total: number; name: string; count: number }>();
    for (const tx of expenses) {
      const key = tx.categoryId || 'unknown';
      const existing = map.get(key) || { total: 0, name: tx.categoryName, count: 0 };
      existing.total += tx.amount;
      existing.count += 1;
      map.set(key, existing);
    }
    return Array.from(map.entries())
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const topCategory = categoryTotals[0]?.name || 'Ninguna';

  const confirmDelete = (id: string) => {
    setActiveMenuTxId(null);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm('¿Eliminar este gasto? El saldo de tu cuenta se actualizará automáticamente.')) {
        onDeleteTransaction(id);
      }
    } else {
      Alert.alert(
        'Eliminar gasto',
        '¿Deseas eliminar este movimiento? El saldo se actualizará.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => onDeleteTransaction(id) },
        ]
      );
    }
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedAccount !== 'all';

  return (
    <View style={styles.container}>
      {/* Header with Title & Action Controls */}
      <View style={styles.tableHeader}>
        <View>
          <Text style={styles.tableTitle}>Todos los gastos del mes</Text>
          <Text style={styles.tableSubtitle}>
            {processedExpenses.length} {processedExpenses.length === 1 ? 'gasto registrado' : 'gastos registrados'} en este período
          </Text>
        </View>

        <View style={styles.headerButtonsRow}>
          <TouchableOpacity
            style={[styles.filterBtn, (showFilters || hasActiveFilters) && styles.filterBtnActive]}
            onPress={() => setShowFilters(!showFilters)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Filtros"
          >
            <Feather
              name="filter"
              size={13}
              color={hasActiveFilters ? tokens.colors.brand : tokens.colors.textSecondary}
            />
            <Text
              style={[
                styles.filterBtnText,
                hasActiveFilters && { color: tokens.colors.brand, fontWeight: '600' },
              ]}
            >
              Filtros
            </Text>
            {hasActiveFilters && <View style={styles.filterDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.newGastoBtn}
            onPress={onNewTransaction}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Nuevo gasto"
          >
            <Feather name="plus" size={13} color="#FFFFFF" />
            <Text style={styles.newGastoBtnText}>Nuevo gasto</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Expandable Filter Chips Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionLabel}>Categoría:</Text>
            <View style={styles.chipsRow}>
              <TouchableOpacity
                style={[styles.chip, selectedCategory === 'all' && styles.chipActive]}
                onPress={() => setSelectedCategory('all')}
              >
                <Text style={[styles.chipText, selectedCategory === 'all' && styles.chipTextActive]}>Todas</Text>
              </TouchableOpacity>
              {categories
                .filter((c) => c.type === 'expense')
                .map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionLabel}>Cuenta:</Text>
            <View style={styles.chipsRow}>
              <TouchableOpacity
                style={[styles.chip, selectedAccount === 'all' && styles.chipActive]}
                onPress={() => setSelectedAccount('all')}
              >
                <Text style={[styles.chipText, selectedAccount === 'all' && styles.chipTextActive]}>Todas</Text>
              </TouchableOpacity>
              {accounts.map((acc) => (
                <TouchableOpacity
                  key={acc.id}
                  style={[styles.chip, selectedAccount === acc.id && styles.chipActive]}
                  onPress={() => setSelectedAccount(acc.id)}
                >
                  <Text style={[styles.chipText, selectedAccount === acc.id && styles.chipTextActive]}>
                    {acc.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {hasActiveFilters && (
            <TouchableOpacity
              style={styles.resetFiltersBtn}
              onPress={() => {
                setSelectedCategory('all');
                setSelectedAccount('all');
              }}
            >
              <Feather name="rotate-ccw" size={11} color={tokens.colors.brand} />
              <Text style={styles.resetFiltersText}>Restablecer filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Main Table Card */}
      <View style={styles.tableCard}>
        {/* Table Column Headers */}
        <View style={styles.columnsHeaderRow}>
          <TouchableOpacity
            style={[styles.thCell, { flex: 2.2 }]}
            onPress={() => handleSort('merchant')}
            activeOpacity={0.7}
          >
            <Text style={styles.thText}>Descripción</Text>
            {sortCol === 'merchant' && (
              <Feather name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} size={12} color={tokens.colors.textPrimary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.thCell, { flex: 1.8 }]}
            onPress={() => handleSort('category')}
            activeOpacity={0.7}
          >
            <Text style={styles.thText}>Categoría</Text>
            {sortCol === 'category' && (
              <Feather name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} size={12} color={tokens.colors.textPrimary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.thCell, { flex: 1.8 }]}
            onPress={() => handleSort('account')}
            activeOpacity={0.7}
          >
            <Text style={styles.thText}>Cuenta</Text>
            {sortCol === 'account' && (
              <Feather name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} size={12} color={tokens.colors.textPrimary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.thCell, { flex: 1.2 }]}
            onPress={() => handleSort('date')}
            activeOpacity={0.7}
          >
            <Text style={styles.thText}>Fecha</Text>
            {sortCol === 'date' && (
              <Feather name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} size={12} color={tokens.colors.textPrimary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.thCell, { flex: 1.3, justifyContent: 'flex-end' }]}
            onPress={() => handleSort('amount')}
            activeOpacity={0.7}
          >
            <Text style={[styles.thText, { textAlign: 'right' }]}>Monto</Text>
            {sortCol === 'amount' && (
              <Feather name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} size={12} color={tokens.colors.textPrimary} />
            )}
          </TouchableOpacity>

          <View style={[styles.thCell, { width: 44, justifyContent: 'center' }]}>
            <Text style={[styles.thText, { textAlign: 'center' }]}></Text>
          </View>
        </View>

        {/* Rows */}
        {processedExpenses.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Feather name="search" size={28} color={tokens.colors.textTertiary} />
            <Text style={styles.emptyTitle}>Sin gastos que mostrar</Text>
            <Text style={styles.emptySubtitle}>
              {hasActiveFilters
                ? 'Ningún gasto coincide con los filtros aplicados.'
                : 'No hay gastos registrados en este período. Registra tu primer gasto.'}
            </Text>
          </View>
        ) : (
          processedExpenses.map((tx, idx) => {
            const isMenuOpen = activeMenuTxId === tx.id;
            const meta = getCategoryMeta(tx.categoryName);

            return (
              <View
                key={tx.id}
                style={[
                  styles.trRow,
                  idx === processedExpenses.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                {/* 1. Descripción */}
                <View style={[styles.tdCell, { flex: 2.2 }]}>
                  <Text style={styles.merchantTitle} numberOfLines={2}>
                    {tx.merchant}
                  </Text>
                  {tx.notes ? <Text style={styles.notesSubtitle} numberOfLines={1}>{tx.notes}</Text> : null}
                </View>

                {/* 2. Categoría */}
                <View style={[styles.tdCell, { flex: 1.8, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                  <CategoryIcon categoryName={tx.categoryName} size={13} boxSize={26} borderRadius={6} />
                  <Text style={styles.categoryTitle} numberOfLines={1}>
                    {tx.categoryName}
                  </Text>
                </View>

                {/* 3. Cuenta */}
                <View style={[styles.tdCell, { flex: 1.8 }]}>
                  <Text style={styles.accountTitle} numberOfLines={2}>
                    {tx.accountName}
                  </Text>
                </View>

                {/* 4. Fecha */}
                <View style={[styles.tdCell, { flex: 1.2 }]}>
                  <Text style={styles.dateTitle}>{formatTableDate(tx.date)}</Text>
                </View>

                {/* 5. Monto (Coral en Negativo) */}
                <View style={[styles.tdCell, { flex: 1.3, alignItems: 'flex-end' }]}>
                  <Text style={styles.amountTitle}>
                    -{displayMoney(tx.amount, tx.currency || currency)}
                  </Text>
                </View>

                {/* 6. Acciones (•••) */}
                <View style={[styles.tdCell, { width: 44, alignItems: 'center', position: 'relative' }]}>
                  <TouchableOpacity
                    style={styles.moreBtn}
                    onPress={() => setActiveMenuTxId(isMenuOpen ? null : tx.id)}
                    activeOpacity={0.6}
                    accessibilityRole="button"
                    accessibilityLabel="Acciones de gasto"
                  >
                    <Feather name="more-horizontal" size={15} color={tokens.colors.textTertiary} />
                  </TouchableOpacity>

                  {/* Popover Menu */}
                  {isMenuOpen && (
                    <View style={styles.popoverMenu}>
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                          setActiveMenuTxId(null);
                          onOpenTransaction(tx.id);
                        }}
                      >
                        <Feather name="eye" size={13} color={tokens.colors.textPrimary} />
                        <Text style={styles.menuItemText}>Ver detalle</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                          setActiveMenuTxId(null);
                          onEditTransaction(tx.id);
                        }}
                      >
                        <Feather name="edit-2" size={13} color={tokens.colors.textPrimary} />
                        <Text style={styles.menuItemText}>Editar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                          setActiveMenuTxId(null);
                          onDuplicateTransaction(tx);
                        }}
                      >
                        <Feather name="copy" size={13} color={tokens.colors.textPrimary} />
                        <Text style={styles.menuItemText}>Duplicar</Text>
                      </TouchableOpacity>

                      <View style={styles.menuDivider} />

                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => confirmDelete(tx.id)}
                      >
                        <Feather name="trash-2" size={13} color={tokens.colors.danger} />
                        <Text style={[styles.menuItemText, { color: tokens.colors.danger }]}>
                          Eliminar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* ========================================================
          TOTALES DEL PERÍODO (4 cards compactas + desglose)
         ======================================================== */}
      <View style={styles.periodTotalsContainer}>
        <Text style={styles.periodTotalsTitle}>TOTALES DEL PERÍODO</Text>

        <View style={styles.totalsCardsGrid}>
          {/* Card 1: Total gastado */}
          <View style={styles.totalCard}>
            <Text style={styles.totalCardLabel}>Total gastado</Text>
            <Text style={[styles.totalCardAmount, { color: tokens.colors.expense }]}>
              {displayMoney(totalAmount, currency)}
            </Text>
          </View>

          {/* Card 2: Movimientos */}
          <View style={styles.totalCard}>
            <Text style={styles.totalCardLabel}>Movimientos</Text>
            <Text style={styles.totalCardAmount}>{count}</Text>
          </View>

          {/* Card 3: Categoría principal */}
          <View style={styles.totalCard}>
            <Text style={styles.totalCardLabel}>Categoría principal</Text>
            <Text style={styles.totalCardHighlight} numberOfLines={1}>
              {topCategory}
            </Text>
          </View>

          {/* Card 4: Promedio por gasto */}
          <View style={styles.totalCard}>
            <Text style={styles.totalCardLabel}>Promedio por gasto</Text>
            <Text style={styles.totalCardAmount}>
              {displayMoney(avgAmount, currency)}
            </Text>
          </View>
        </View>

        {/* Desglose real por Categoría */}
        {categoryTotals.length > 0 && (
          <View style={styles.categoryBreakdownCard}>
            <Text style={styles.breakdownHeaderTitle}>Detalle por categoría</Text>
            <View style={styles.breakdownGrid}>
              {categoryTotals.map((cat) => (
                <View key={cat.id} style={styles.breakdownItem}>
                  <View style={styles.breakdownLeft}>
                    <CategoryIcon categoryName={cat.name} size={12} boxSize={22} borderRadius={5} />
                    <Text style={styles.breakdownCatName} numberOfLines={1}>{cat.name}</Text>
                  </View>
                  <Text style={styles.breakdownCatAmount}>
                    {displayMoney(cat.total, currency)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
    letterSpacing: -0.2,
  },
  tableSubtitle: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    marginTop: 2,
  },
  headerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: tokens.radii.btn,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    ...tokens.shadows.card,
  },
  filterBtnActive: {
    borderColor: tokens.colors.borderActive,
    backgroundColor: tokens.colors.brandLight,
  },
  filterBtnText: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    fontWeight: '500',
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.colors.brand,
  },
  newGastoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: tokens.radii.btn,
    backgroundColor: tokens.colors.brand,
    ...tokens.shadows.fab,
  },
  newGastoBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  filtersPanel: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.cardSm,
    padding: 14,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    gap: 10,
    ...tokens.shadows.card,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  filterSectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.textSecondary,
    width: 70,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: tokens.colors.borderDefault,
  },
  chipActive: {
    backgroundColor: tokens.colors.brandLight,
    borderColor: tokens.colors.borderActive,
  },
  chipText: {
    fontSize: 11.5,
    color: tokens.colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: tokens.colors.brand,
    fontWeight: '600',
  },
  resetFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  resetFiltersText: {
    fontSize: 11.5,
    color: tokens.colors.brand,
    fontWeight: '600',
  },
  tableCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.card,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    overflow: 'hidden',
    ...tokens.shadows.card,
  },
  columnsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F8F8F6',
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderSubtle,
  },
  thCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  thText: {
    fontSize: 11,
    fontWeight: '650' as any,
    color: tokens.colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.separator,
    backgroundColor: tokens.colors.surface,
  },
  tdCell: {
    justifyContent: 'center',
  },
  merchantTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.textPrimary,
    lineHeight: 18,
    ...(Platform.OS === 'web' ? ({ wordBreak: 'normal', overflowWrap: 'anywhere' } as any) : {}),
  },
  notesSubtitle: {
    fontSize: 11,
    color: tokens.colors.textTertiary,
    marginTop: 1,
  },
  categoryTitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: tokens.colors.textPrimary,
  },
  accountTitle: {
    fontSize: 12,
    fontWeight: '400',
    color: tokens.colors.textSecondary,
    lineHeight: 16,
  },
  dateTitle: {
    fontSize: 12,
    fontWeight: '400',
    color: tokens.colors.textTertiary,
    ...(Platform.OS === 'web' ? ({ whiteSpace: 'nowrap' } as any) : {}),
  },
  amountTitle: {
    fontSize: 13.5,
    fontWeight: '650' as any,
    color: tokens.colors.expense,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
    ...(Platform.OS === 'web' ? ({ whiteSpace: 'nowrap' } as any) : {}),
  },
  moreBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popoverMenu: {
    position: 'absolute',
    right: 0,
    top: 32,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.cardSm,
    paddingVertical: 6,
    width: 140,
    borderWidth: 1,
    borderColor: tokens.colors.borderDefault,
    zIndex: 100,
    ...tokens.shadows.cardElevated,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  menuItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: tokens.colors.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: tokens.colors.separator,
    marginVertical: 4,
  },
  emptyWrap: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
  },
  periodTotalsContainer: {
    marginTop: 6,
    gap: 12,
  },
  periodTotalsTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: tokens.colors.textTertiary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  totalsCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  totalCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.cardSm,
    padding: 14,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    gap: 4,
    ...tokens.shadows.card,
  },
  totalCardLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: tokens.colors.textSecondary,
  },
  totalCardAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  totalCardHighlight: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.textPrimary,
  },
  categoryBreakdownCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.cardSm,
    padding: 14,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    gap: 10,
    ...tokens.shadows.card,
  },
  breakdownHeaderTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: tokens.colors.textSecondary,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 200,
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#FAFAF8',
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  breakdownCatName: {
    fontSize: 12,
    fontWeight: '500',
    color: tokens.colors.textPrimary,
  },
  breakdownCatAmount: {
    fontSize: 12,
    fontWeight: '650' as any,
    color: tokens.colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
});

