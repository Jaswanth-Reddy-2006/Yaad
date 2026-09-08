import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { AppLogo } from './AppLogo';
import { Typography } from './Typography';
import { COLORS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { voiceService } from '../../services/VoiceService';

interface AppHeaderProps {
  showBack?: boolean;
  title?: string;
  subtitle?: string;
  voicePrompt?: string;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  showBack = false,
  title,
  subtitle,
  rightAction,
}) => {
  const router = useRouter();
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const handleBack = () => {
    voiceService.stopSpeaking();
    router.back();
  };

  return (
    <View style={styles.container}>
      {showBack ? (
        <View style={styles.subScreenHeader}>
          <View style={styles.headerLeftGroup}>
            <TouchableOpacity
              accessibilityLabel="Go back"
              accessibilityRole="button"
              onPress={handleBack}
              style={styles.backButton}
            >
              <ArrowLeft size={28} color={isHc ? COLORS.hcTextPrimary : '#0F172A'} />
            </TouchableOpacity>
            <View style={{ marginLeft: SPACING.xs, flex: 1 }}>
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
          {rightAction ? (
            <View style={styles.rightActionWrapper}>{rightAction}</View>
          ) : null}
        </View>
      ) : (
        <View style={styles.homeHeader}>
          {/* ONLY App Logo ("Yaad"), NO settings icon on top right */}
          <AppLogo size="large" />
          {rightAction ? (
            <View style={styles.rightActionWrapper}>{rightAction}</View>
          ) : null}
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
    justifyContent: 'space-between',
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.xs,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightActionWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
