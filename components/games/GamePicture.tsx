import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  AppleIllustration,
  BananaIllustration,
  MangoIllustration,
  FlowerIllustration,
  CupIllustration,
  UmbrellaIllustration,
  BicycleIllustration,
  HouseIllustration,
  RadioIllustration,
  GlassesIllustration,
} from '../illustrations/GameIllustrations';

export interface GamePictureProps {
  symbolId: string;
  iconName?: string;
  displayTitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showLabel?: boolean;
}

/**
 * Renders large, mature, warm, high-contrast illustrated everyday objects for memory cards.
 */
export const GamePicture: React.FC<GamePictureProps> = ({
  symbolId,
  size = 'md',
}) => {
  const normalizedKey = (symbolId || '').toLowerCase().trim();

  const pixelSizes = {
    sm: 44,
    md: 62,
    lg: 78,
    xl: 96,
  };

  const pixelSize = typeof size === 'number' ? size : pixelSizes[size] || 62;

  const renderIllustration = () => {
    switch (normalizedKey) {
      case 'apple':
        return <AppleIllustration size={pixelSize} />;
      case 'banana':
        return <BananaIllustration size={pixelSize} />;
      case 'mango':
        return <MangoIllustration size={pixelSize} />;
      case 'flower':
        return <FlowerIllustration size={pixelSize} />;
      case 'cup':
        return <CupIllustration size={pixelSize} />;
      case 'umbrella':
        return <UmbrellaIllustration size={pixelSize} />;
      case 'bicycle':
        return <BicycleIllustration size={pixelSize} />;
      case 'house':
      case 'home':
        return <HouseIllustration size={pixelSize} />;
      case 'radio':
      case 'bell':
        return <RadioIllustration size={pixelSize} />;
      case 'glasses':
      case 'clock':
        return <GlassesIllustration size={pixelSize} />;
      default:
        return <AppleIllustration size={pixelSize} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderIllustration()}
    </View>
  );
};

export const getSymbolConfig = (symbolId: string, _fallback?: string) => {
  const normalizedKey = (symbolId || '').toLowerCase().trim();

  const colorPalettes: Record<string, { cardBg: string; borderColor: string; displayName: string }> = {
    apple: { cardBg: '#FFF1F2', borderColor: '#FECDD3', displayName: 'Apple' },
    banana: { cardBg: '#FEFCE8', borderColor: '#FEF08A', displayName: 'Banana' },
    mango: { cardBg: '#FFF7ED', borderColor: '#FED7AA', displayName: 'Mango' },
    flower: { cardBg: '#FDF2F8', borderColor: '#FBCFE8', displayName: 'Flower' },
    cup: { cardBg: '#FFFBEB', borderColor: '#FDE68A', displayName: 'Cup' },
    umbrella: { cardBg: '#F0F9FF', borderColor: '#BAE6FD', displayName: 'Umbrella' },
    bicycle: { cardBg: '#F0FDF4', borderColor: '#BBF7D0', displayName: 'Bicycle' },
    house: { cardBg: '#FFF7ED', borderColor: '#FED7AA', displayName: 'House' },
    radio: { cardBg: '#FFFBEB', borderColor: '#FDE68A', displayName: 'Radio' },
    glasses: { cardBg: '#EEF2FF', borderColor: '#C7D2FE', displayName: 'Glasses' },
  };

  return (
    colorPalettes[normalizedKey] || {
      cardBg: '#FFFFFF',
      borderColor: '#E2E8F0',
      displayName: symbolId || 'Card',
    }
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
