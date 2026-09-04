import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { AppLogo } from './AppLogo';
import { Typography } from './Typography';
import { COLORS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

interface AppHeaderProps {
  showBack?: boolean;
  title?: string;
  subtitle?: string;
  voicePrompt?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  showBack = false,
  title,
  subtitle,
}) => {
  const router = useRouter();
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  return (
    <View style={styles.container}>
      {showBack ? (
        <View style={styles.subScreenHeader}>
          <TouchableOpacity
            accessibilityLabel="Go back"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={28} color={isHc ? COLORS.hcTextPrimary : '#0F172A'} />
          </TouchableOpacity>
          <View style={{ marginLeft: SPACING.xs }}>
            {title ? (
              <Typography
                size="xl"
                weight="bold"
                color={isHc ? COLORS.hcTextPrimary : '#0F172A'}
              >
                {title}
              </Typography>
            ) : null}
            {subtitle ? (
              <Typography
                size="xs"
                color={COLORS.textMuted}
                style={{ marginTop: 2 }}
              >
                {subtitle}
              </Typography>
            ) : null}
          </View>
        </View>
      ) : (
        <View style={styles.homeHeader}>
          {/* ONLY App Logo ("Yaad"), NO settings icon on top right */}
          <AppLogo size="large" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
    justifyContent: 'center',
  },
  homeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
});
