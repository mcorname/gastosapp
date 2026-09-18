import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import type { TransactionInput } from '@ai-money/shared';
import { FinanceProvider, useFinance } from './src/context/FinanceContext';
import { TopNavBar, NavTab } from './src/components/TopNavBar';
import { CompactRail } from './src/components/CompactRail';
import { MetricsRow } from './src/components/MetricsRow';
import { ExpenseTable } from './src/components/ExpenseTable';
import { CategoryAnalytics } from './src/components/CategoryAnalytics';
import { ExpenseEvolutionChart } from './src/components/ExpenseEvolutionChart';
import { MarioSummaryWidget } from './src/components/MarioSummaryWidget';
import { AccountsView } from './src/components/AccountsView';
import { NetWorthModal } from './src/components/NetWorthModal';
import { MonthSelector } from './src/components/MonthSelector';
import { TransactionItem } from './src/components/TransactionItem';
import { NewTransactionModal } from './src/components/NewTransactionModal';
import { QuickAIModal } from './src/components/QuickAIModal';
import { MarioChatModal } from './src/components/MarioChatModal';
import { CategoryIcon } from './src/components/CategoryIcon';
import { Button, ui } from './src/components/FormUI';
import { tokens } from './src/theme/tokens';
import { injectGlobalStyles } from './src/theme/globalStyles';

type FilterType = 'all' | 'expense' | 'income' | 'transfer' | 'adjustment';

function confirmAction(message: string): Promise<boolean> {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return Promise.resolve(window.confirm(message));
  }
  return new Promise((resolve) =>
    Alert.alert('Confirmar', message, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Continuar', style: 'destructive', onPress: () => resolve(true) },
    ])
  );
}

function MainApp() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const finance = useFinance();
  const {
    isLoading,
    error,
    initialize,
    transactions,
    accounts,
    currentYearMonth,
    currency,
    setCurrency,
    currencies,
    stats,
    displayMoney,
    showAmounts,
    toggleAmounts,
    profileName,
    deleteTransaction,
    addTransaction,
    resetToDefaultData,
  } = finance;

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewScope, setViewScope] = useState<'month' | 'all'>('month');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showNewTxModal, setShowNewTxModal] = useState(false);
  const [showQuickAIModal, setShowQuickAIModal] = useState(false);
  const [showMarioChatModal, setShowMarioChatModal] = useState(false);
  const [showNetWorth, setShowNetWorth] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);

  // Selected state for editing
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | undefined>();
  const [transactionDraft, setTransactionDraft] = useState<Partial<TransactionInput> | undefined>();

  useEffect(() => {
    injectGlobalStyles();
  }, []);

  const selectedTransaction = transactions.find((tx) => tx.id === selectedTransactionId);

  // Filter transactions for current month
  const monthTransactions = transactions.filter((tx) => tx.date.startsWith(currentYearMonth));
  const monthExpenses = monthTransactions.filter((tx) => tx.type === 'expense');

  // Search filtered for "Todos los gastos" or general
  const filteredMonthExpenses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return monthExpenses;
    return monthExpenses.filter((tx) => {
      const fullStr = `${tx.merchant} ${tx.categoryName} ${tx.accountName} ${tx.amount}`.toLowerCase();
      return fullStr.includes(q);
    });
  }, [monthExpenses, searchQuery]);

  // General transactions list for Movimientos tab
  const baseTransactions = viewScope === 'month' ? monthTransactions : transactions;
  const filteredTransactions = useMemo(() => {
    return baseTransactions.filter((tx) => {
      if (filterType !== 'all' && tx.type !== filterType) return false;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return `${tx.merchant} ${tx.categoryName} ${tx.accountName} ${tx.destinationAccountName || ''} ${tx.amount}`
        .toLowerCase()
        .includes(q);
    });
  }, [baseTransactions, filterType, searchQuery]);

  // Action handlers
  const openTransaction = (id: string) => {
    setSelectedTransactionId(id);
    setTransactionDraft(undefined);
    setShowNewTxModal(true);
  };

  const openNewTransaction = (draft?: Partial<TransactionInput>) => {
    setTransactionDraft(draft);
    setSelectedTransactionId(undefined);
    setShowNewTxModal(true);
  };

  const closeNewTransaction = () => {
    setShowNewTxModal(false);
    setTransactionDraft(undefined);
    setSelectedTransactionId(undefined);
  };

  const duplicateTransaction = (tx: any) => {
    openNewTransaction({
      type: tx.type,
      amount: tx.amount,
      merchant: `${tx.merchant} (Copia)`,
      accountId: tx.accountId,
      categoryId: tx.categoryId,
      destinationAccountId: tx.destinationAccountId,
      date: tx.date,
      notes: tx.notes,
    });
  };

  const removeTransaction = async (id: string) => {
    const ok = await confirmAction(
      '¿Eliminar este movimiento? El saldo de la cuenta se actualizará automáticamente.'
    );
    if (ok) deleteTransaction(id);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={tokens.colors.brand} />
        <Text style={styles.loadingText}>Iniciando AI Money...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.emptyTitle}>No se pudieron cargar tus datos</Text>
        <Text style={styles.emptySubtitle}>{error}</Text>
        <Button onPress={initialize}>Reintentar</Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.bg} />

      {/* Main 1440px Desktop Container */}
      <View style={styles.windowContainer}>
        {/* Left Compact Rail (68px) on Desktop */}
        {isDesktop && (
          <CompactRail
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenNewTx={() => openNewTransaction({ type: 'expense' })}
            onOpenQuickAI={() => setShowQuickAIModal(true)}
            onOpenMario={() => setShowMarioChatModal(true)}
          />
        )}

        {/* Main Canvas */}
        <View style={styles.mainCanvas} role="main" aria-label="Contenido principal">
          {/* Top Navigation Bar */}
          <TopNavBar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            profileName={profileName}
            onOpenProfile={() => setActiveTab('settings')}
            onOpenMario={() => setShowMarioChatModal(true)}
          />

          {/* Scrollable Content Area */}
          <ScrollView
            style={styles.scrollCanvas}
            contentContainerStyle={
              isDesktop ? styles.desktopScrollContent : styles.mobileScrollContent
            }
            showsVerticalScrollIndicator={false}
          >
            {/* ==================== TAB: INICIO (DASHBOARD) ==================== */}
            {activeTab === 'home' && (
              <View style={styles.homeContainer}>
                {/* Greeting & Period Selector Row */}
                <View style={isDesktop ? styles.greetingRowDesktop : styles.greetingRowMobile}>
                  <View style={styles.greetingTitleCol}>
                    <Text
                      style={styles.greetingTitle}
                      accessibilityRole="header"
                      {...(Platform.OS === 'web' ? ({ 'aria-level': 1 } as any) : {})}
                    >
                      Hola, {profileName}
                    </Text>
                    <Text style={styles.greetingSubtitle}>
                      Aquí tienes el resumen de tus finanzas.
                    </Text>
                  </View>

                  <View style={styles.monthSelectorWrap}>
                    <MonthSelector />
                  </View>
                </View>

                {/* 4 Editorial Metrics Cards */}
                <MetricsRow
                  onOpenNetWorth={() => setShowNetWorth(true)}
                  onOpenAccounts={() => setActiveTab('accounts')}
                />

                {/* Main 70% / 30% Dashboard Zone */}
                <View style={isDesktop ? styles.dashboardGridDesktop : styles.dashboardGridMobile}>
                  {/* Left Column (70%): TODOS LOS GASTOS DEL MES */}
                  <View style={isDesktop ? styles.left70Col : styles.fullCol}>
                    <ExpenseTable
                      expenses={filteredMonthExpenses}
                      onOpenTransaction={openTransaction}
                      onEditTransaction={openTransaction}
                      onDuplicateTransaction={duplicateTransaction}
                      onDeleteTransaction={removeTransaction}
                      onNewTransaction={() => openNewTransaction({ type: 'expense' })}
                    />
                  </View>

                  {/* Right Column (30%): ANALYTICS & MARIO IA */}
                  <View style={isDesktop ? styles.right30Col : styles.fullCol}>
                    {/* Resumen por categoría */}
                    <CategoryAnalytics onViewAll={() => setActiveTab('categories')} />

                    {/* Gráfico de evolución semanal si hay datos */}
                    <ExpenseEvolutionChart expenses={monthExpenses} />

                    {/* Mario IA Compact Widget */}
                    <MarioSummaryWidget onOpenChat={() => setShowMarioChatModal(true)} />
                  </View>
                </View>
              </View>
            )}

            {/* ==================== TAB: MOVIMIENTOS ==================== */}
            {activeTab === 'transactions' && (
              <View style={styles.tabContentContainer}>
                <View style={styles.transactionsTabHeader}>
                  <View>
                    <Text style={styles.tabTitle}>Movimientos</Text>
                    <Text style={styles.tabSubtitle}>
                      {filteredTransactions.length} operaciones visibles
                    </Text>
                  </View>
                  <MonthSelector />
                </View>

                {/* Filter Segments */}
                <View style={styles.filterSegmentedRow}>
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'expense', label: 'Gastos' },
                    { id: 'income', label: 'Ingresos' },
                    { id: 'transfer', label: 'Transferencias' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      accessibilityRole="button"
                      style={[
                        styles.filterSegment,
                        filterType === item.id && styles.filterSegmentActive,
                      ]}
                      onPress={() => setFilterType(item.id as FilterType)}
                    >
                      <Text
                        style={[
                          styles.filterSegmentText,
                          filterType === item.id && styles.filterSegmentTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Scope & New Action Row */}
                <View style={styles.scopeRow}>
                  <Button
                    secondary
                    onPress={() => setViewScope(viewScope === 'month' ? 'all' : 'month')}
                  >
                    {viewScope === 'month' ? 'Ver histórico completo' : 'Ver solo este mes'}
                  </Button>
                  <Button onPress={() => openNewTransaction()}>Nuevo movimiento</Button>
                </View>

                {/* Transactions Card List */}
                <View style={styles.transactionsCardWrapper}>
                  {filteredTransactions.length ? (
                    filteredTransactions.map((tx) => (
                      <TransactionItem
                        key={tx.id}
                        transaction={tx}
                        onDelete={removeTransaction}
                      />
                    ))
                  ) : (
                    <Empty
                      title="No hay movimientos"
                      subtitle="Cambia el filtro o registra una nueva operación."
                      icon="search"
                    />
                  )}
                </View>
              </View>
            )}

            {/* ==================== TAB: CUENTAS ==================== */}
            {activeTab === 'accounts' && (
              <View style={styles.tabContentContainer}>
                <AccountsView
                  onTransfer={(draft) => openNewTransaction(draft)}
                  onViewMovements={() => setActiveTab('transactions')}
                />
              </View>
            )}

            {/* ==================== TAB: ANÁLISIS (CATEGORÍAS) ==================== */}
            {activeTab === 'categories' && (
              <View style={styles.tabContentContainer}>
                <View style={styles.sectionHeaderRowNoPad}>
                  <View>
                    <Text style={styles.tabTitle}>Análisis por categorías</Text>
                    <Text style={styles.tabSubtitle}>
                      Gastos del período {currentYearMonth}
                    </Text>
                  </View>
                  <Button secondary onPress={() => setActiveTab('home')}>
                    Volver al Dashboard
                  </Button>
                </View>

                <View style={styles.analysisCard}>
                  {stats.topCategories.length ? (
                    stats.topCategories.map((cat) => (
                      <View key={cat.id || cat.name} style={styles.analysisRow}>
                        <CategoryIcon categoryName={cat.name} size={15} boxSize={30} borderRadius={7} />
                        <View style={styles.analysisText}>
                          <Text style={styles.sectionTitle}>{cat.name}</Text>
                          <Text style={styles.tabSubtitle}>
                            {cat.percentage.toFixed(1)}% de tus gastos
                          </Text>
                        </View>
                        <Text style={styles.analysisAmount}>
                          {displayMoney(cat.total, currency)}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Empty
                      title="Sin gastos por categoría"
                      subtitle="Aún no hay gastos en este período."
                      icon="pie-chart"
                    />
                  )}
                </View>
              </View>
            )}

            {/* ==================== TAB: AJUSTES ==================== */}
            {activeTab === 'settings' && (
              <View style={styles.tabContentContainer}>
                <Text style={styles.tabTitle}>Ajustes</Text>
                <Text style={styles.tabSubtitle}>Preferencias y configuración del sistema</Text>

                <SettingsCard
                  icon="user"
                  title="Perfil de Usuario"
                  subtitle={`Perfil local: ${profileName}. No hay autenticación remota configurada.`}
                />

                <View style={styles.settingsGroupCard}>
                  <View style={styles.settingsRow}>
                    <View
                      style={[styles.settingsIconBox, { backgroundColor: tokens.colors.brandLight }]}
                    >
                      <Feather name="credit-card" size={18} color={tokens.colors.brand} />
                    </View>
                    <View style={styles.settingsTextCol}>
                      <Text style={styles.settingsRowTitle}>Cuentas financieras</Text>
                      <Text style={styles.settingsRowSubtitle}>
                        Gestiona nombres, tipos, saldos y ajustes desde la vista de cuentas.
                      </Text>
                    </View>
                    <Button secondary onPress={() => setActiveTab('accounts')}>
                      Gestionar
                    </Button>
                  </View>
                </View>

                <View style={styles.settingsGroupCard}>
                  <View style={styles.settingsRow}>
                    <View
                      style={[styles.settingsIconBox, { backgroundColor: tokens.colors.infoLight }]}
                    >
                      <Feather name="eye" size={18} color={tokens.colors.info} />
                    </View>
                    <View style={styles.settingsTextCol}>
                      <Text style={styles.settingsRowTitle}>Privacidad</Text>
                      <Text style={styles.settingsRowSubtitle}>
                        Oculta o muestra todos los importes sensibles.
                      </Text>
                    </View>
                    <Button secondary onPress={toggleAmounts}>
                      {showAmounts ? 'Ocultar' : 'Mostrar'}
                    </Button>
                  </View>
                </View>

                <View style={styles.settingsGroupCard}>
                  <View style={styles.settingsRow}>
                    <View
                      style={[styles.settingsIconBox, { backgroundColor: tokens.colors.infoLight }]}
                    >
                      <Feather name="dollar-sign" size={18} color={tokens.colors.info} />
                    </View>
                    <View style={styles.settingsTextCol}>
                      <Text style={styles.settingsRowTitle}>Moneda de resumen</Text>
                      <Text style={styles.settingsRowSubtitle}>
                        Los totales no mezclan monedas. Elige cuál revisar.
                      </Text>
                      <View style={styles.inlinePills}>
                        {currencies.map((code) => (
                          <TouchableOpacity
                            key={code}
                            accessibilityRole="button"
                            onPress={() => setCurrency(code)}
                            style={[
                              styles.currencyPill,
                              currency === code && styles.currencyPillActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.currencyPillText,
                                currency === code && styles.currencyPillTextActive,
                              ]}
                            >
                              {code}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.settingsGroupCard}>
                  <View style={styles.settingsRow}>
                    <View
                      style={[styles.settingsIconBox, { backgroundColor: tokens.colors.brandLight }]}
                    >
                      <Feather name="refresh-cw" size={18} color={tokens.colors.brand} />
                    </View>
                    <View style={styles.settingsTextCol}>
                      <Text style={styles.settingsRowTitle}>Cargar mi data / Datos de ejemplo</Text>
                      <Text style={styles.settingsRowSubtitle}>
                        Recarga las cuentas (BCP e Interbank, Efectivo) y todos los gastos reales de servicios (Luz, Agua, WIN, Celulares, etc.).
                      </Text>
                    </View>
                    <Button
                      secondary
                      onPress={async () => {
                        const ok = await confirmAction('¿Cargar la data completa (cuentas, gastos de servicios e ingresos de Mario)?');
                        if (ok) {
                          resetToDefaultData();
                          setActiveTab('home');
                        }
                      }}
                    >
                      Cargar Data
                    </Button>
                  </View>
                </View>

                <SettingsCard
                  icon="database"
                  title="Base de datos local"
                  subtitle="Tus registros financieros se almacenan en este dispositivo (SQLite local-first) con trazabilidad contable."
                />
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Mobile FAB Menu */}
      {!isDesktop && showFabMenu && (
        <View style={styles.fabMenuOverlay}>
          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={() => {
              setShowFabMenu(false);
              setShowQuickAIModal(true);
            }}
          >
            <View style={[styles.fabIconCircle, { backgroundColor: tokens.colors.brand }]}>
              <MaterialIcons name="auto-awesome" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.fabMenuText}>Registrar con IA</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fabMenuItem}
            onPress={() => {
              setShowFabMenu(false);
              openNewTransaction();
            }}
          >
            <View style={[styles.fabIconCircle, { backgroundColor: tokens.colors.info }]}>
              <Feather name="edit-2" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.fabMenuText}>Registro manual</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Mobile Bottom Navigation */}
      {!isDesktop && (
        <View style={styles.bottomBar}>
          {[
            { tab: 'home', icon: 'home', label: 'Inicio' },
            { tab: 'transactions', icon: 'file-text', label: 'Movimientos' },
            { tab: 'accounts', icon: 'credit-card', label: 'Cuentas' },
            { tab: 'settings', icon: 'settings', label: 'Ajustes' },
          ].map((item) => (
            <TouchableOpacity
              key={item.tab}
              style={styles.tabBtn}
              onPress={() => {
                setShowFabMenu(false);
                setActiveTab(item.tab as NavTab);
              }}
            >
              <Feather
                name={item.icon as any}
                size={20}
                color={activeTab === item.tab ? tokens.colors.brand : tokens.colors.textTertiary}
              />
              <Text style={[styles.tabLabel, activeTab === item.tab && styles.tabLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowFabMenu(!showFabMenu)}
          >
            <Feather name={showFabMenu ? 'x' : 'plus'} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Modals */}
      <NewTransactionModal
        visible={showNewTxModal}
        transaction={selectedTransaction as any}
        initial={transactionDraft}
        onClose={closeNewTransaction}
      />

      <QuickAIModal
        visible={showQuickAIModal}
        onClose={() => setShowQuickAIModal(false)}
        onReview={(draft) => openNewTransaction(draft)}
      />

      <MarioChatModal
        visible={showMarioChatModal}
        onClose={() => setShowMarioChatModal(false)}
      />

      <NetWorthModal
        visible={showNetWorth}
        onClose={() => setShowNetWorth(false)}
        onManageAccounts={() => setActiveTab('accounts')}
      />
    </SafeAreaView>
  );
}

function Empty({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
}) {
  return (
    <View style={styles.emptyCard}>
      <Feather name={icon} size={32} color={tokens.colors.textTertiary} />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
    </View>
  );
}

function SettingsCard({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.settingsGroupCard}>
      <View style={styles.settingsRow}>
        <View
          style={[styles.settingsIconBox, { backgroundColor: tokens.colors.surfaceSecondary }]}
        >
          <Feather name={icon} size={18} color={tokens.colors.textSecondary} />
        </View>
        <View style={styles.settingsTextCol}>
          <Text style={styles.settingsRowTitle}>{title}</Text>
          <Text style={styles.settingsRowSubtitle}>{subtitle}</Text>
        </View>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <FinanceProvider>
        <MainApp />
      </FinanceProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  loadingText: {
    color: tokens.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  windowContainer: {
    flex: 1,
    flexDirection: 'row',
    maxWidth: tokens.layout.maxWidth,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: tokens.colors.containerBg,
  },
  mainCanvas: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colors.containerBg,
  },
  scrollCanvas: {
    flex: 1,
  },
  desktopScrollContent: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 48,
  },
  mobileScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 96,
  },
  homeContainer: {
    gap: 20,
  },
  greetingRowDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  greetingRowMobile: {
    gap: 14,
  },
  greetingTitleCol: {
    gap: 2,
  },
  greetingTitle: {
    color: tokens.colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  greetingSubtitle: {
    color: tokens.colors.textSecondary,
    fontSize: 13,
  },
  monthSelectorWrap: {
    alignItems: 'flex-end',
  },
  dashboardGridDesktop: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
  },
  dashboardGridMobile: {
    gap: 18,
  },
  left70Col: {
    flex: 0.7,
    gap: 16,
  },
  right30Col: {
    flex: 0.3,
    gap: 16,
  },
  fullCol: {
    gap: 16,
    width: '100%',
  },
  tabContentContainer: {
    gap: 16,
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
  },
  tabTitle: {
    color: tokens.colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  tabSubtitle: {
    color: tokens.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  transactionsTabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  filterSegmentedRow: {
    flexDirection: 'row',
    backgroundColor: tokens.colors.surfaceTertiary,
    borderRadius: tokens.radii.btn,
    padding: 3,
    gap: 3,
    flexWrap: 'wrap',
  },
  filterSegment: {
    flex: 1,
    minWidth: 110,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 7,
  },
  filterSegmentActive: {
    backgroundColor: tokens.colors.surface,
    ...tokens.shadows.segmentedPill,
  },
  filterSegmentText: {
    color: tokens.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  filterSegmentTextActive: {
    color: tokens.colors.textPrimary,
    fontWeight: '600',
  },
  scopeRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  transactionsCardWrapper: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.card,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    overflow: 'hidden',
    ...tokens.shadows.card,
  },
  settingsGroupCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.card,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    padding: 16,
    ...tokens.shadows.card,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    flexWrap: 'wrap',
  },
  settingsIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsTextCol: {
    flex: 1,
    gap: 4,
    minWidth: 240,
  },
  settingsRowTitle: {
    color: tokens.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  settingsRowSubtitle: {
    color: tokens.colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
  inlinePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  currencyPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: tokens.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: tokens.colors.borderDefault,
  },
  currencyPillActive: {
    backgroundColor: tokens.colors.brandLight,
    borderColor: tokens.colors.borderActive,
  },
  currencyPillText: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    fontWeight: '600',
  },
  currencyPillTextActive: {
    color: tokens.colors.brand,
  },
  analysisCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radii.card,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    overflow: 'hidden',
    ...tokens.shadows.card,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.separator,
  },
  analysisText: {
    flex: 1,
    gap: 4,
  },
  analysisAmount: {
    color: tokens.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  sectionHeaderRowNoPad: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    color: tokens.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    color: tokens.colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    color: tokens.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
  },
  fabMenuOverlay: {
    position: 'absolute',
    bottom: 84,
    alignSelf: 'center',
    gap: 10,
    alignItems: 'center',
    zIndex: 99,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: tokens.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: tokens.radii.pill,
    borderWidth: 1,
    borderColor: tokens.colors.borderDefault,
    ...tokens.shadows.cardElevated,
  },
  fabIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabMenuText: {
    color: tokens.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: 'rgba(255,255,255,.96)',
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderSubtle,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
    zIndex: 90,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    color: tokens.colors.textTertiary,
    fontSize: 10,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: tokens.colors.brand,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 28,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: tokens.colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    ...tokens.shadows.fab,
  },
});

