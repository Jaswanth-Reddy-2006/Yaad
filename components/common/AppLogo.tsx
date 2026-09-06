import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Brain, Glasses } from 'lucide-react-native';
import { Typography } from './Typography';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export interface AppLogoProps {
  size?: 'normal' | 'large';
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 'normal' }) => {
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const iconSize = size === 'large' ? 32 : 24;

  return (
    <View style={styles.container}>
      {/* Old Person's Brain Icon (Brain with Glasses Badge) */}
      <View style={[styles.iconWrapper, { backgroundColor: isHc ? COLORS.hcCardBackground : '#EDE9FE', borderColor: COLORS.memoryPurple }]}>
        <Brain size={iconSize} color={COLORS.memoryPurple} />
        <View style={styles.glassesOverlay}>
          <Glasses size={iconSize - 8} color={COLORS.primary} />
        </View>
      </View>

      <Typography
        size={size === 'large' ? 'xxl' : 'xl'}
        weight="bold"
        color={isHc ? COLORS.hcTextPrimary : COLORS.primary}
        style={{ marginLeft: SPACING.xs }}
      >
        {t('app_name')}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  glassesOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.full,
    padding: 1,
  },
});
