import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, Sparkles } from 'lucide-react-native';
import { Typography } from '../../components/common/Typography';
import { Button } from '../../components/common/Button';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export default function RegistrationSuccessScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  return (
    <View style={[styles.container, { backgroundColor: isHc ? COLORS.hcBackground : COLORS.background }]}>
      <View style={styles.card}>
        {/* Celebration Wreath Hero */}
        <View style={styles.heroCircleWrapper}>
          <View style={styles.wreathOuterCircle}>
            <CheckCircle2 size={64} color="#FFFFFF" />
          </View>
          <View style={styles.sparkleTag}>
            <Sparkles size={20} color="#EAB308" />
          </View>
        </View>

        <Typography size="xxl" weight="bold" align="center" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} style={{ marginTop: SPACING.lg }}>
          {t('registration_success') || 'Registration Successful!'}
        </Typography>

        <Typography size="sm" color={COLORS.textMuted} align="center" style={{ marginTop: SPACING.xs, lineHeight: 22, paddingHorizontal: SPACING.md }}>
          {t('registration_success_desc') || 'Welcome to Yaad. You can now login and start your journey of care and connection.'}
        </Typography>

        <Button
          title={t('go_to_login') || 'Go to Login'}
          variant="primary"
          onPress={() => router.replace('/auth/login')}
          style={styles.goToLoginBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heroCircleWrapper: {
    position: 'relative',
    marginVertical: SPACING.md,
  },
  wreathOuterCircle: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#DCFCE7',
  },
  sparkleTag: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FEF3C7',
    borderRadius: RADIUS.full,
    padding: 4,
  },
  goToLoginBtn: {
    backgroundColor: COLORS.primary,
    width: '100%',
    marginTop: SPACING.xl,
  },
});
