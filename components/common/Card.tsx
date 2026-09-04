import React from 'react';
import { View, ViewProps, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export interface CardProps extends ViewProps {
  onPress?: () => void;
  variant?: 'flat' | 'elevated' | 'bordered' | 'accent';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = 'elevated',
  style,
  ...props
}) => {
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  let bg = isHc ? COLORS.hcCardBackground : COLORS.cardBackground;
  let borderColor = isHc ? COLORS.hcBorder : COLORS.surfaceVariant;
  let borderWidth = isHc ? 2 : 1;

  if (!isHc && variant === 'accent') {
    bg = COLORS.accentLight;
    borderColor = COLORS.accent;
  }

  const shadowStyle = (!isHc && variant === 'elevated') ? SHADOWS.md : {};

  const cardStyle = [
    styles.card,
    shadowStyle,
    {
      backgroundColor: bg,
      borderColor,
      borderWidth,
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginVertical: SPACING.sm,
  },
});
