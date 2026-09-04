import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { COLORS, MIN_TOUCH_TARGET, RADIUS, SPACING } from '../../constants/theme';
import { Typography } from './Typography';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger';
  size?: 'normal' | 'large';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'large',
  icon,
  loading = false,
  disabled,
  style,
  onPress,
  ...props
}) => {
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  let bg = COLORS.primary;
  let textCol = COLORS.textLight;
  let borderCol = 'transparent';

  if (isHc) {
    bg = variant === 'outline' ? COLORS.hcBackground : COLORS.hcPrimary;
    textCol = variant === 'outline' ? COLORS.hcPrimary : COLORS.hcBackground;
    borderCol = COLORS.hcPrimary;
  } else {
    switch (variant) {
      case 'primary':
        bg = COLORS.primary;
        textCol = COLORS.textLight;
        break;
      case 'secondary':
        bg = COLORS.secondary;
        textCol = COLORS.textLight;
        break;
      case 'accent':
        bg = COLORS.accent;
        textCol = COLORS.textLight;
        break;
      case 'outline':
        bg = 'transparent';
        textCol = COLORS.primary;
        borderCol = COLORS.primary;
        break;
      case 'danger':
        bg = COLORS.danger;
        textCol = COLORS.textLight;
        break;
    }
  }

  const minHeight = size === 'large' ? 64 : MIN_TOUCH_TARGET;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? COLORS.surfaceVariant : bg,
          borderColor: disabled ? COLORS.textMuted : borderCol,
          minHeight,
        },
        style as ViewStyle,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textCol} size="small" />
      ) : (
        <>
          {icon && <React.Fragment>{icon}</React.Fragment>}
          <Typography
            size={size === 'large' ? 'lg' : 'base'}
            weight="bold"
            color={disabled ? COLORS.textMuted : textCol}
            style={icon ? { marginLeft: SPACING.sm } : undefined}
          >
            {title}
          </Typography>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    marginVertical: SPACING.xs,
  },
});
