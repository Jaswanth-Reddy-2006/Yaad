import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, QrCode, Settings } from 'lucide-react-native';
import { Typography } from './Typography';
import { VoiceButton } from './VoiceButton';
import { COLORS, MIN_TOUCH_TARGET, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export interface HeaderProps {
  title: string;
  showBack?: boolean;
  showConnectionShortcut?: boolean;
  showSettingsShortcut?: boolean;
  voicePrompt?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  showConnectionShortcut = true,
  showSettingsShortcut = true,
  voicePrompt,
}) => {
  const router = useRouter();
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const iconColor = isHc ? COLORS.hcTextPrimary : COLORS.textPrimary;

  return (
    <View style={[styles.container, { borderBottomColor: isHc ? COLORS.hcBorder : COLORS.surfaceVariant }]}>
      <View style={styles.leftRow}>
        {showBack ? (
          <TouchableOpacity
            accessibilityLabel="Go Back"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <ArrowLeft size={30} color={iconColor} />
          </TouchableOpacity>
        ) : null}
        <Typography size="xl" weight="bold" style={styles.title}>
          {title}
        </Typography>
      </View>

      <View style={styles.rightRow}>
        {voicePrompt ? <VoiceButton textToSpeak={voicePrompt} /> : null}

        {showConnectionShortcut ? (
          <TouchableOpacity
            accessibilityLabel="My Connection QR"
            accessibilityRole="button"
            onPress={() => router.push('/(patient)/connection')}
            style={styles.iconButton}
          >
            <QrCode size={26} color={iconColor} />
          </TouchableOpacity>
        ) : null}

        {showSettingsShortcut ? (
          <TouchableOpacity
            accessibilityLabel="Settings"
            accessibilityRole="button"
            onPress={() => router.push('/(patient)/settings')}
            style={styles.iconButton}
          >
            <Settings size={26} color={iconColor} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: SPACING.xs,
    flexShrink: 1,
  },
  iconButton: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
  },
});
