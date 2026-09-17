import React from 'react';
import { View } from 'react-native';
import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

export interface CategoryMeta {
  color: string;
  bg: string;
  iconName: string;
  iconSet: 'feather' | 'mci' | 'mi';
  label: string;
}

export function getCategoryMeta(name: string = ''): CategoryMeta {
  const n = name.toLowerCase();
  if (
    n.includes('vivienda') ||
    n.includes('servicio') ||
    n.includes('luz') ||
    n.includes('agua') ||
    n.includes('gas') ||
    n.includes('hogar') ||
    n.includes('alquiler')
  ) {
    return {
      color: '#4F8EF7',
      bg: '#EDF4FF',
      iconName: 'home',
      iconSet: 'feather',
      label: 'Vivienda y Servicios',
    };
  }
  if (
    n.includes('ropa') ||
    n.includes('compra') ||
    n.includes('shopping') ||
    n.includes('saga') ||
    n.includes('ripley') ||
    n.includes('tienda')
  ) {
    return {
      color: '#13A878',
      bg: '#EAF8F3',
      iconName: 'shopping-bag',
      iconSet: 'feather',
      label: 'Compras y Ropa',
    };
  }
  if (
    n.includes('aliment') ||
    n.includes('comida') ||
    n.includes('restaurante') ||
    n.includes('almuerzo') ||
    n.includes('supermercado') ||
    n.includes('vea') ||
    n.includes('metro')
  ) {
    return {
      color: '#FF6257',
      bg: '#FFF0EE',
      iconName: 'silverware-fork-knife',
      iconSet: 'mci',
      label: 'Alimentación',
    };
  }
  if (
    n.includes('transporte') ||
    n.includes('auto') ||
    n.includes('carro') ||
    n.includes('gasolina') ||
    n.includes('taxi') ||
    n.includes('uber') ||
    n.includes('pasaje')
  ) {
    return {
      color: '#F39A38',
      bg: '#FFF5E9',
      iconName: 'car',
      iconSet: 'mci',
      label: 'Transporte',
    };
  }
  if (
    n.includes('salud') ||
    n.includes('farmacia') ||
    n.includes('medico') ||
    n.includes('doctor') ||
    n.includes('clinica') ||
    n.includes('cuidado')
  ) {
    return {
      color: '#EE5A9E',
      bg: '#FFF0F7',
      iconName: 'heart-pulse',
      iconSet: 'mci',
      label: 'Salud',
    };
  }
  if (
    n.includes('entretenimiento') ||
    n.includes('cine') ||
    n.includes('pelicula') ||
    n.includes('juego') ||
    n.includes('streaming') ||
    n.includes('netflix') ||
    n.includes('spotify')
  ) {
    return {
      color: '#7657E8',
      bg: '#F2EFFF',
      iconName: 'movie-open',
      iconSet: 'mci',
      label: 'Entretenimiento',
    };
  }
  if (
    n.includes('educa') ||
    n.includes('curso') ||
    n.includes('libro') ||
    n.includes('universidad') ||
    n.includes('colegio')
  ) {
    return {
      color: '#556FE8',
      bg: '#EEF1FF',
      iconName: 'book-open',
      iconSet: 'feather',
      label: 'Educación',
    };
  }
  return {
    color: '#74777F',
    bg: '#F0F1F2',
    iconName: 'more-horizontal',
    iconSet: 'feather',
    label: name || 'Otros',
  };
}

export const CategoryIcon: React.FC<{
  categoryName: string;
  size?: number;
  boxSize?: number;
  borderRadius?: number;
}> = ({ categoryName, size = 15, boxSize = 32, borderRadius = 8 }) => {
  const meta = getCategoryMeta(categoryName);

  const renderIcon = () => {
    if (meta.iconSet === 'feather') {
      return <Feather name={meta.iconName as any} size={size} color={meta.color} />;
    }
    if (meta.iconSet === 'mci') {
      return <MaterialCommunityIcons name={meta.iconName as any} size={size} color={meta.color} />;
    }
    return <MaterialIcons name={meta.iconName as any} size={size} color={meta.color} />;
  };

  return (
    <View
      style={{
        width: boxSize,
        height: boxSize,
        borderRadius,
        backgroundColor: meta.bg,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {renderIcon()}
    </View>
  );
};

