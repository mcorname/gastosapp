import React from 'react';
import { View, Text, StyleSheet, Platform, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import { Feather, MaterialCommunityIcons, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import {
  resolveCategoryMeta,
  CATEGORY_CATALOG,
  type CategoryVisualConfig,
  type SupportedIconSet,
} from '../theme/categoryCatalog';

export type { CategoryVisualConfig, SupportedIconSet };
export { CATEGORY_CATALOG, resolveCategoryMeta };

export interface CategoryMeta {
  color: string;
  bg: string;
  border: string;
  iconName: string;
  iconSet: SupportedIconSet;
  label: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
}

export function getCategoryMeta(name: string = ''): CategoryMeta {
  const meta = resolveCategoryMeta(name);
  return {
    color: meta.color,
    bg: meta.bg,
    border: meta.border,
    iconName: meta.iconName,
    iconSet: meta.iconSet,
    label: meta.label,
    activeBg: meta.activeBg,
    activeBorder: meta.activeBorder,
    activeText: meta.activeText,
  };
}

export interface CategoryIconProps {
  categoryName: string;
  size?: number;
  boxSize?: number;
  borderRadius?: number;
  containerStyle?: StyleProp<ViewStyle>;
  customColor?: string;
  customBg?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  categoryName,
  size = 15,
  boxSize = 28,
  borderRadius = 7,
  containerStyle,
  customColor,
  customBg,
}) => {
  const meta = resolveCategoryMeta(categoryName);
  const iconColor = customColor || meta.color;
  const bgColor = customBg || meta.bg;

  const renderIcon = () => {
    switch (meta.iconSet) {
      case 'fa6':
        return (
          <FontAwesome6
            name={meta.iconName as any}
            size={size}
            color={iconColor}
          />
        );
      case 'mci':
        return (
          <MaterialCommunityIcons
            name={meta.iconName as any}
            size={size}
            color={iconColor}
          />
        );
      case 'mi':
        return (
          <MaterialIcons
            name={meta.iconName as any}
            size={size}
            color={iconColor}
          />
        );
      case 'feather':
      default:
        return (
          <Feather
            name={meta.iconName as any}
            size={size}
            color={iconColor}
          />
        );
    }
  };

  return (
    <View
      accessibilityElementsHidden={true}
      importantForAccessibility="no"
      {...(Platform.OS === 'web' ? ({ 'aria-hidden': 'true' } as any) : {})}
      style={[
        styles.iconWrapper,
        {
          width: boxSize,
          height: boxSize,
          borderRadius,
          backgroundColor: bgColor,
        },
        containerStyle,
      ]}
    >
      {renderIcon()}
    </View>
  );
};

export interface CategoryDisplayProps {
  categoryName: string;
  size?: number;
  boxSize?: number;
  borderRadius?: number;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  showLabel?: boolean;
}

/**
 * Componente unificado para renderizar categoría (icono de ancho fijo 28px + texto alineado).
 * Garantiza que todos los iconos comiencen exactamente en la misma coordenada X
 * y que el texto comience siempre a 8px exactos de distancia.
 */
export const CategoryDisplay: React.FC<CategoryDisplayProps> = ({
  categoryName,
  size = 15,
  boxSize = 28,
  borderRadius = 7,
  numberOfLines = 1,
  style,
  textStyle,
  showLabel = true,
}) => {
  const meta = resolveCategoryMeta(categoryName);

  return (
    <View style={[styles.displayRow, style]}>
      <CategoryIcon
        categoryName={categoryName}
        size={size}
        boxSize={boxSize}
        borderRadius={borderRadius}
      />
      {showLabel && (
        <Text
          style={[styles.labelText, textStyle]}
          numberOfLines={numberOfLines}
          {...(Platform.OS === 'web' ? ({ title: categoryName || meta.label } as any) : {})}
        >
          {categoryName || meta.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  displayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  labelText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1E293B',
    minWidth: 0,
    flexShrink: 1,
  },
});
