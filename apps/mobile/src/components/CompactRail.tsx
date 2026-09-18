import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { tokens } from '../theme/tokens';
import { NavTab } from './TopNavBar';

interface CompactRailProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewTx: () => void;
  onOpenQuickAI: () => void;
  onOpenMario: () => void;
}

const webTooltip = (title: string): { title?: string } => (Platform.OS === 'web' ? { title } : {});

export const CompactRail: React.FC<CompactRailProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewTx,
  onOpenQuickAI,
  onOpenMario,
}) => {
  return (
    <View style={styles.rail}>
      {/* macOS Traffic Lights */}
      <View style={styles.trafficLights}>
        <View style={[styles.dot, styles.dotClose]} />
        <View style={[styles.dot, styles.dotMinimize]} />
        <View style={[styles.dot, styles.dotMaximize]} />
      </View>

      {/* Navigation Icons */}
      <View style={styles.iconsCol}>
        {/* Inicio */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Inicio"
          style={[styles.railIconBtn, activeTab === 'home' && styles.railIconBtnActive]}
          onPress={() => onSelectTab('home')}
          activeOpacity={0.7}
          {...webTooltip('Inicio')}
        >
          <Feather
            name="home"
            size={18}
            color={activeTab === 'home' ? tokens.colors.brand : tokens.colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Movimientos */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Movimientos"
          style={[styles.railIconBtn, activeTab === 'transactions' && styles.railIconBtnActive]}
          onPress={() => onSelectTab('transactions')}
          activeOpacity={0.7}
          {...webTooltip('Movimientos')}
        >
          <Feather
            name="file-text"
            size={18}
            color={activeTab === 'transactions' ? tokens.colors.brand : tokens.colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Cuentas */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Cuentas"
          style={[styles.railIconBtn, activeTab === 'accounts' && styles.railIconBtnActive]}
          onPress={() => onSelectTab('accounts')}
          activeOpacity={0.7}
          {...webTooltip('Cuentas')}
        >
          <Feather
            name="credit-card"
            size={18}
            color={activeTab === 'accounts' ? tokens.colors.brand : tokens.colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Destacado: Nuevo movimiento */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Nuevo movimiento"
          style={styles.newActionBtn}
          onPress={onOpenNewTx}
          activeOpacity={0.85}
          {...webTooltip('Nuevo movimiento')}
        >
          <Feather name="plus" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Mario IA */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Mario IA"
          style={[styles.railIconBtn, activeTab === 'mario' && styles.railIconBtnActive]}
          onPress={onOpenMario}
          activeOpacity={0.7}
          {...webTooltip('Mario IA')}
        >
          <MaterialIcons
            name="auto-awesome"
            size={18}
            color={activeTab === 'mario' ? tokens.colors.brand : tokens.colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Registrar con IA */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Registrar con IA"
          style={styles.aiTriggerBtn}
          onPress={onOpenQuickAI}
          activeOpacity={0.7}
          {...webTooltip('Registrar con IA')}
        >
          <Feather name="zap" size={17} color={tokens.colors.brand} />
        </TouchableOpacity>
      </View>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Ajustes Bottom */}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Ajustes"
        style={[styles.railIconBtn, activeTab === 'settings' && styles.railIconBtnActive]}
        onPress={() => onSelectTab('settings')}
        activeOpacity={0.7}
        {...webTooltip('Ajustes')}
      >
        <Feather
          name="settings"
          size={18}
          color={activeTab === 'settings' ? tokens.colors.brand : tokens.colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  rail: {
    width: tokens.layout.railWidth,
    backgroundColor: '#F3F3F1',
    borderRightWidth: 1,
    borderRightColor: tokens.colors.borderSubtle,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 16,
    zIndex: 40,
  },
  trafficLights: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotClose: {
    backgroundColor: '#FF5F56',
  },
  dotMinimize: {
    backgroundColor: '#FFBD2E',
  },
  dotMaximize: {
    backgroundColor: '#27C93F',
  },
  iconsCol: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  railIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  railIconBtnActive: {
    backgroundColor: tokens.colors.surface,
    ...tokens.shadows.card,
  },
  newActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: tokens.colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    ...tokens.shadows.fab,
  },
  aiTriggerBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: tokens.colors.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

