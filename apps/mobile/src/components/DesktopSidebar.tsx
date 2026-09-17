import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { tokens } from '../theme/tokens';

interface DesktopSidebarProps {
  activeTab: 'home' | 'transactions' | 'settings' | 'mario';
  onSelectTab: (tab: 'home' | 'transactions' | 'settings' | 'mario') => void;
  onOpenNewTx: () => void;
  onOpenQuickAI: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewTx,
  onOpenQuickAI,
}) => {
  return (
    <View style={styles.sidebar}>
      {/* macOS Window Controls (Traffic Lights) */}
      <View style={styles.trafficLights}>
        <View style={[styles.dot, styles.dotClose]} />
        <View style={[styles.dot, styles.dotMinimize]} />
        <View style={[styles.dot, styles.dotMaximize]} />
      </View>

      {/* Brand Header */}
      <View style={styles.brandContainer}>
        <View style={styles.logoBox}>
          <Feather name="shield" size={16} color={tokens.colors.brand} />
        </View>
        <View style={styles.brandTextCol}>
          <Text style={styles.brandTitle}>AI Money</Text>
          <Text style={styles.brandSubtitle}>Tus finanzas, más claras</Text>
        </View>
      </View>

      {/* Navigation Items */}
      <View style={styles.navSection}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Inicio"
          style={[styles.navItem, activeTab === 'home' && styles.navItemActive]}
          onPress={() => onSelectTab('home')}
          activeOpacity={0.7}
        >
          <Feather
            name="home"
            size={17}
            color={activeTab === 'home' ? tokens.colors.brand : tokens.colors.textSecondary}
          />
          <Text
            style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}
          >
            Inicio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Movimientos"
          style={[styles.navItem, activeTab === 'transactions' && styles.navItemActive]}
          onPress={() => onSelectTab('transactions')}
          activeOpacity={0.7}
        >
          <Feather
            name="file-text"
            size={17}
            color={activeTab === 'transactions' ? tokens.colors.brand : tokens.colors.textSecondary}
          />
          <Text
            style={[styles.navLabel, activeTab === 'transactions' && styles.navLabelActive]}
          >
            Movimientos
          </Text>
        </TouchableOpacity>

        {/* Action Button: Nuevo Movimiento */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Nuevo movimiento"
          style={styles.newActionBtn}
          onPress={onOpenNewTx}
          activeOpacity={0.85}
        >
          <View style={styles.newActionIconCircle}>
            <Feather name="plus" size={14} color="#FFFFFF" />
          </View>
          <Text style={styles.newActionText}>Nuevo movimiento</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Mario IA"
          style={[styles.navItem, activeTab === 'mario' && styles.navItemActive]}
          onPress={() => onSelectTab('mario')}
          activeOpacity={0.7}
        >
          <Feather
            name="message-square"
            size={17}
            color={activeTab === 'mario' ? tokens.colors.brand : tokens.colors.textSecondary}
          />
          <Text
            style={[styles.navLabel, activeTab === 'mario' && styles.navLabelActive]}
          >
            Mario IA
          </Text>
          <View style={styles.onlineBadgeDot} />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Ajustes"
          style={[styles.navItem, activeTab === 'settings' && styles.navItemActive]}
          onPress={() => onSelectTab('settings')}
          activeOpacity={0.7}
        >
          <Feather
            name="settings"
            size={17}
            color={activeTab === 'settings' ? tokens.colors.brand : tokens.colors.textSecondary}
          />
          <Text
            style={[styles.navLabel, activeTab === 'settings' && styles.navLabelActive]}
          >
            Ajustes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick AI Trigger */}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Registrar con IA"
        style={styles.aiQuickTrigger}
        onPress={onOpenQuickAI}
        activeOpacity={0.7}
      >
        <Feather name="zap" size={14} color={tokens.colors.brand} />
        <Text style={styles.aiQuickTriggerText}>Registrar con IA</Text>
      </TouchableOpacity>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Bottom Motivational / Peace of Mind Card */}
      <View style={styles.peaceCard}>
        <View style={styles.peaceIconCircle}>
          <MaterialIcons name="eco" size={14} color={tokens.colors.brand} />
        </View>
        <View style={styles.peaceTextCol}>
          <Text style={styles.peaceTitle}>Vive con más calma</Text>
          <Text style={styles.peaceSubtitle}>Pequeñas decisiones, grandes resultados.</Text>
        </View>
        <Feather name="chevron-right" size={14} color={tokens.colors.textTertiary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: tokens.layout.sidebarWidth,
    backgroundColor: 'rgba(245, 245, 247, 0.85)',
    borderRightWidth: 1,
    borderRightColor: tokens.colors.borderSubtle,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  trafficLights: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotClose: {
    backgroundColor: '#FF5F56',
    borderWidth: 0.5,
    borderColor: '#E0443E',
  },
  dotMinimize: {
    backgroundColor: '#FFBD2E',
    borderWidth: 0.5,
    borderColor: '#DEA123',
  },
  dotMaximize: {
    backgroundColor: '#27C93F',
    borderWidth: 0.5,
    borderColor: '#1AAB29',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: tokens.colors.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTextCol: {
    flex: 1,
  },
  brandTitle: {
    color: tokens.colors.textPrimary,
    fontSize: 15,
    fontWeight: '650' as any,
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    color: tokens.colors.textSecondary,
    fontSize: 11,
    fontWeight: '400',
  },
  navSection: {
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: tokens.radii.btn,
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: tokens.colors.surfaceSelected,
  },
  navLabel: {
    color: tokens.colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  navLabelActive: {
    color: tokens.colors.textPrimary,
    fontWeight: '600',
  },
  onlineBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.colors.brand,
  },
  newActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 6,
    marginBottom: 6,
    borderRadius: tokens.radii.btn,
    backgroundColor: 'rgba(10, 159, 114, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(10, 159, 114, 0.15)',
  },
  newActionIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: tokens.colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newActionText: {
    color: tokens.colors.brand,
    fontSize: 13,
    fontWeight: '600',
  },
  aiQuickTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    borderRadius: tokens.radii.btn,
    backgroundColor: 'transparent',
  },
  aiQuickTriggerText: {
    color: tokens.colors.brand,
    fontSize: 12,
    fontWeight: '500',
  },
  peaceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: tokens.colors.surface,
    padding: 10,
    borderRadius: tokens.radii.cardSm,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    ...tokens.shadows.card,
  },
  peaceIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: tokens.colors.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  peaceTextCol: {
    flex: 1,
  },
  peaceTitle: {
    color: tokens.colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  peaceSubtitle: {
    color: tokens.colors.textSecondary,
    fontSize: 10,
    lineHeight: 13,
  },
});
