import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { tokens } from '../theme/tokens';

export type NavTab = 'home' | 'transactions' | 'accounts' | 'categories' | 'mario' | 'settings';

interface TopNavBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  profileName?: string;
  onOpenProfile?: () => void;
  onOpenMario?: () => void;
}

const NAV_ITEMS: { id: NavTab; label: string }[] = [
  { id: 'home', label: 'Inicio' },
  { id: 'transactions', label: 'Movimientos' },
  { id: 'accounts', label: 'Cuentas' },
  { id: 'categories', label: 'Análisis' },
  { id: 'mario', label: 'Mario IA' },
  { id: 'settings', label: 'Ajustes' },
];

export const TopNavBar: React.FC<TopNavBarProps> = ({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  profileName = 'Mario',
  onOpenProfile,
  onOpenMario,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isWide = width >= 1200;
  const isMobile = width < 768;
  const isSmallMobile = width < 380;

  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(localSearch);
    }, 250);
    return () => clearTimeout(handler);
  }, [localSearch, onSearchChange]);

  const handleTabPress = (tab: NavTab) => {
    if (tab === 'mario' && onOpenMario) {
      onOpenMario();
    } else {
      onSelectTab(tab);
    }
  };

  return (
    <View
      style={[
        styles.container,
        isMobile
          ? styles.containerMobile
          : isWide
          ? styles.containerWide
          : styles.containerTablet,
      ]}
    >
      {/* Brand & Horizontal Nav */}
      <View style={[styles.leftRow, isMobile && styles.leftRowMobile]}>
        <View style={[styles.brandRow, isSmallMobile && { gap: 6 }]}>
          <View style={styles.logoBadge}>
            <MaterialIcons name="eco" size={18} color="#FFFFFF" />
          </View>
          {!isSmallMobile && <Text style={styles.brandTitle}>AI Money</Text>}
        </View>

        {/* Desktop Nav Pills */}
        {isWide && (
          <View style={styles.navPillsRow}>
            {NAV_ITEMS.map((item) => {
              const isSelected = activeTab === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={item.label}
                  style={[styles.pill, isSelected ? styles.pillSelected : styles.pillInactive]}
                  onPress={() => handleTabPress(item.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isSelected ? styles.pillTextSelected : styles.pillTextInactive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.id === 'mario' && <View style={styles.onlineDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Right Row: Search, Date & Profile */}
      <View style={[styles.rightRow, isMobile && styles.rightRowMobile]}>
        {/* Search Input */}
        <View
          style={[
            styles.searchContainer,
            isMobile
              ? isSmallMobile
                ? styles.searchSmallMobile
                : styles.searchMobile
              : isWide
              ? styles.searchWide
              : styles.searchTablet,
          ]}
        >
          <Feather
            name="search"
            size={13}
            color={tokens.colors.textTertiary}
            style={{ marginRight: 6 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={isMobile ? 'Buscar…' : 'Buscar movimientos, cuentas…'}
            placeholderTextColor={tokens.colors.textTertiary}
            value={localSearch}
            onChangeText={setLocalSearch}
          />
          {localSearch.length > 0 && (
            <TouchableOpacity
              onPress={() => setLocalSearch('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x" size={12} color={tokens.colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Avatar */}
        <TouchableOpacity
          style={[styles.profileBtn, isMobile && styles.profileBtnMobile]}
          onPress={onOpenProfile}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Ajustes de perfil"
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{profileName.slice(0, 1).toUpperCase()}</Text>
          </View>
          {isWide && <Text style={styles.profileName}>{profileName}</Text>}
          {isDesktop && <Feather name="chevron-down" size={12} color={tokens.colors.textTertiary} />}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderSubtle,
    zIndex: 50,
  },
  containerMobile: {
    paddingHorizontal: 12,
    gap: 8,
  },
  containerTablet: {
    paddingHorizontal: 16,
    gap: 12,
  },
  containerWide: {
    paddingHorizontal: 28,
    gap: 16,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    flexShrink: 0,
  },
  leftRowMobile: {
    gap: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: tokens.colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.textPrimary,
    letterSpacing: -0.3,
  },
  navPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: tokens.radii.pill,
  },
  pillSelected: {
    backgroundColor: tokens.colors.navPillDark,
  },
  pillInactive: {
    backgroundColor: 'transparent',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  pillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  pillTextInactive: {
    color: tokens.colors.textSecondary,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.colors.brand,
    marginLeft: 6,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
    justifyContent: 'flex-end',
  },
  rightRowMobile: {
    gap: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surfaceSecondary,
    borderRadius: tokens.radii.btn,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    height: 34,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  searchSmallMobile: {
    width: 75,
    minWidth: 0,
  },
  searchMobile: {
    width: 105,
    minWidth: 0,
  },
  searchTablet: {
    width: 175,
    minWidth: 0,
  },
  searchWide: {
    width: 260,
    minWidth: 0,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    width: '100%',
    color: tokens.colors.textPrimary,
    fontSize: 13,
    padding: 0,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: tokens.radii.btn,
  },
  profileBtnMobile: {
    paddingHorizontal: 0,
    gap: 0,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: tokens.colors.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 12,
    fontWeight: '700',
    color: tokens.colors.brand,
  },
  profileName: {
    fontSize: 13,
    fontWeight: '600',
    color: tokens.colors.textPrimary,
  },
});

