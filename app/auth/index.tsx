import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Brain, Bell, LineChart, ShieldCheck, Globe, HeartHandshake } from 'lucide-react-native';
import { AppLogo } from '../../components/common/AppLogo';
import { Typography } from '../../components/common/Typography';
import { Button } from '../../components/common/Button';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export default function OnboardingScreen() {
  const router = useRouter();
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  return (
    <View style={[styles.container, { backgroundColor: isHc ? COLORS.hcBackground : '#FFFFFF' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Logo */}
        <View style={styles.logoSection}>
          <AppLogo size="large" />
          <Typography size="xs" color={COLORS.textMuted} align="center" style={{ marginTop: 4 }}>
            Together in Every Memory, Every Day
          </Typography>
        </View>

        {/* Hero Vector Icon Badge */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.avatarGroupCircle}>
            <HeartHandshake size={56} color={COLORS.primary} />
          </View>
        </View>

        {/* 4 Feature Bullet Cards */}
        <View style={styles.bulletsContainer}>
          {/* Bullet 1 */}
          <View style={styles.bulletRow}>
            <View style={[styles.bulletIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Brain size={24} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Typography size="base" weight="bold">
                Cognitive Activities
              </Typography>
              <Typography size="xs" color={COLORS.textMuted} style={{ marginTop: 2 }}>
                Engaging exercises to keep the mind active.
              </Typography>
            </View>
          </View>

          {/* Bullet 2 */}
          <View style={styles.bulletRow}>
            <View style={[styles.bulletIconBox, { backgroundColor: '#DBEAFE' }]}>
              <Bell size={24} color={COLORS.gameBlue} />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Typography size="base" weight="bold">
                Smart Reminders
              </Typography>
              <Typography size="xs" color={COLORS.textMuted} style={{ marginTop: 2 }}>
                Timely alerts for medications, tasks & more.
              </Typography>
            </View>
          </View>

          {/* Bullet 3 */}
          <View style={styles.bulletRow}>
            <View style={[styles.bulletIconBox, { backgroundColor: '#EDE9FE' }]}>
              <LineChart size={24} color={COLORS.memoryPurple} />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Typography size="base" weight="bold">
                Caregiver Insights
              </Typography>
              <Typography size="xs" color={COLORS.textMuted} style={{ marginTop: 2 }}>
                Track progress and important insights.
              </Typography>
            </View>
          </View>

          {/* Bullet 4 */}
          <View style={styles.bulletRow}>
            <View style={[styles.bulletIconBox, { backgroundColor: '#CCFBF1' }]}>
              <ShieldCheck size={24} color={COLORS.accent} />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Typography size="base" weight="bold">
                Secure & Trusted
              </Typography>
              <Typography size="xs" color={COLORS.textMuted} style={{ marginTop: 2 }}>
                Your data is safe, private and protected.
              </Typography>
            </View>
          </View>
        </View>

        {/* Primary Action Button: Get Started */}
        <Button
          title="Get Started"
          variant="primary"
          onPress={() => router.push('/auth/role-select')}
          style={styles.getStartedBtn}
        />

        {/* Choose Language Link */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/auth/language')}
          style={styles.languageLink}
        >
          <Globe size={18} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
          <Typography size="sm" weight="semibold" color={COLORS.textSecondary}>
            Choose Language
          </Typography>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  illustrationWrapper: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  avatarGroupCircle: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#86EFAC',
  },
  bulletsContainer: {
    marginVertical: SPACING.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  bulletIconBox: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedBtn: {
    backgroundColor: COLORS.primary,
    marginTop: SPACING.md,
  },
  languageLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.xs,
  },
});
