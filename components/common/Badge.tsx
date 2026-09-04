import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'info' | 'purple' | 'danger';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'info' }) => {
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  let bg = COLORS.primaryLight;
  let textCol = COLORS.primaryDark;

  if (isHc) {
    bg = COLORS.hcCardBackground;
    textCol = COLORS.hcPrimary;
  } else {
    switch (variant) {
      case 'success':
        bg = COLORS.successLight;
        textCol = COLORS.success;
        break;
      case 'warning':
        bg = COLORS.warningLight;
        textCol = COLORS.warning;
        break;
      case 'purple':
        bg = COLORS.secondaryLight;
        textCol = COLORS.secondary;
        break;
      case 'danger':
        bg = COLORS.dangerLight;
        textCol = COLORS.danger;
        break;
      case 'info':
      default:
        bg = COLORS.accentLight;
        textCol = COLORS.accent;
        break;
    }
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: textCol, borderWidth: isHc ? 1.5 : 0 }]}>
      <Typography size="sm" weight="bold" color={textCol}>
        {label}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
});
