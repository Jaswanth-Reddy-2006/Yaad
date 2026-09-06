import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { isRTLLanguage } from '../../constants/translations';

export interface TypographyProps extends RNTextProps {
  size?: keyof typeof TYPOGRAPHY.fontSizes;
  weight?: keyof typeof TYPOGRAPHY.fontWeights;
  color?: string;
  align?: 'left' | 'center' | 'right';
  highContrastOverride?: boolean;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  size = 'base',
  weight = 'regular',
  color,
  align = 'left',
  style,
  ...props
}) => {
  const { preferences, fontScaleMultiplier, currentLanguage } = useAccessibilityStore();
  const baseSize = TYPOGRAPHY.fontSizes[size] || TYPOGRAPHY.fontSizes.base;
  const calculatedFontSize = Math.round(baseSize * fontScaleMultiplier);

  const isHighContrast = preferences.highContrast;
  const isRtl = isRTLLanguage(currentLanguage);

  const textColor = color || (isHighContrast ? COLORS.hcTextPrimary : COLORS.textPrimary);
  const resolvedAlign: 'left' | 'center' | 'right' = align !== 'left' ? align : (isRtl ? 'right' : 'left');

  const customStyle = {
    fontSize: calculatedFontSize,
    fontWeight: TYPOGRAPHY.fontWeights[weight],
    color: textColor,
    textAlign: resolvedAlign,
    writingDirection: (isRtl ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
    lineHeight: Math.round(calculatedFontSize * 1.35),
    letterSpacing: preferences.easyRead ? 0.4 : 0,
  };

  return (
    <RNText style={[customStyle, style]} {...props}>
      {children}
    </RNText>
  );
};
