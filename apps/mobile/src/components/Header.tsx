import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, useWindowDimensions } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { tokens } from '../theme/tokens';

interface HeaderProps {
  onOpenMario: () => void;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  profileName?: string;
  onOpenProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMario,
  searchQuery = '',
  onSearchChange,
  profileName = 'Mario',
  onOpenProfile,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  if (isDesktop) {
    return (
      <View style={styles.desktopTopBar}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={15} color={tokens.colors.textTertiary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar movimientos..."
            placeholderTextColor={tokens.colors.textTertiary}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>

        {/* Right Actions */}
        <View style={styles.topRightCol}>
          <TouchableOpacity style={styles.profileRow} onPress={onOpenProfile} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Abrir ajustes de perfil">
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{profileName.slice(0, 1).toUpperCase()}</Text>
            </View>
            <Text style={styles.profileName}>{profileName}</Text>
            <Feather name="chevron-down" size={13} color={tokens.colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Mobile Header
  return (
    <View style={styles.mobileHeader}>
      <View style={styles.mobileBrandRow}>
        <View style={styles.mobileLogoRow}>
          <View style={styles.mobileLogoBox}>
            <MaterialIcons name="eco" size={16} color={tokens.colors.brand} />
          </View>
          <Text style={styles.mobileBrandTitle}>AI Money</Text>
        </View>

        <TouchableOpacity style={styles.marioPill} onPress={onOpenMario} activeOpacity={0.8}>
          <View style={styles.marioDot} />
          <Text style={styles.marioPillText}>Mario IA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Desktop Top Bar
  desktopTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderSubtle,
    backgroundColor: tokens.colors.surface,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surfaceSecondary,
    borderRadius: tokens.radii.btn,
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
    paddingHorizontal: 12,
    height: 36,
    width: 280,
  },
  searchInput: {
    flex: 1,
    color: tokens.colors.textPrimary,
    fontSize: 13,
  },
  topRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: tokens.colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.borderSubtle,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
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
    color: tokens.colors.brand,
    fontSize: 12,
    fontWeight: '700',
  },
  profileName: {
    color: tokens.colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },

  // Mobile Top Bar
  mobileHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderSubtle,
  },
  mobileBrandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mobileLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileLogoBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: tokens.colors.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileBrandTitle: {
    color: tokens.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  marioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: tokens.colors.brandLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: tokens.radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(10, 159, 114, 0.2)',
  },
  marioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.colors.brand,
  },
  marioPillText: {
    color: tokens.colors.brand,
    fontSize: 12,
    fontWeight: '600',
  },
});

