import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { HeartHandshake, User, CheckCircle2, Circle, Users, LogIn, ArrowLeft } from 'lucide-react-native';
import { Typography } from '../../components/common/Typography';
import { Button } from '../../components/common/Button';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { authService } from '../../services/AuthService';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export default function RoleSelectScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'CAREGIVER' | 'PATIENT'>('CAREGIVER');
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const handleContinue = () => {
    if (selectedRole === 'CAREGIVER') {
      router.push('/auth/register-caregiver');
    } else {
      router.push('/auth/register-patient');
    }
  };

  const handleQuickPatientLogin = async () => {
    const patientSession = {
      accessToken: 'test-patient-jwt-token',
      refreshToken: 'test-patient-refresh-token',
      userId: 'pt-001',
      role: 'PATIENT' as const,
      displayName: 'Ramesh Kumar (Amma)',
    };
    await authService.saveSession(patientSession);
    router.replace('/(patient)');
  };

  const handleQuickCaregiverLogin = async () => {
    const caregiverSession = {
      accessToken: 'test-caregiver-jwt-token',
      refreshToken: 'test-caregiver-refresh-token',
      userId: 'cg-001',
      role: 'CAREGIVER' as const,
      displayName: 'Aarav Sharma',
    };
    await authService.saveSession(caregiverSession);
    router.replace('/caregiver/home');
  };

  return (
    <View style={[styles.container, { backgroundColor: isHc ? COLORS.hcBackground : COLORS.background }]}>
      {/* Top Header Row with Back Button */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          accessibilityLabel={t('go_back') || 'Go Back'}
          accessibilityRole="button"
          onPress={() => {
            router.replace('/auth/language');
          }}
          style={styles.backButton}
        >
          <ArrowLeft size={28} color={isHc ? COLORS.hcTextPrimary : '#0F172A'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Family Vector Icon Badge */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.familyCircle}>
            <Users size={48} color={COLORS.primary} />
          </View>
        </View>

        <Typography size="xxl" weight="bold" align="center" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} style={{ marginBottom: SPACING.md }}>
          {t('create_account') || 'Create Account'}
        </Typography>

        <Typography size="sm" weight="bold" color={COLORS.textMuted} style={{ marginBottom: SPACING.xs }}>
          {t('i_am_a') || 'I am a...'}
        </Typography>

        {/* Role Card 1: Caregiver */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedRole('CAREGIVER')}
          style={[
            styles.roleCard,
            selectedRole === 'CAREGIVER' ? styles.selectedRoleCard : null,
            { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
            <HeartHandshake size={28} color={COLORS.primary} />
          </View>

          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Typography size="lg" weight="bold">
              {t('caregiver') || 'Caregiver'}
            </Typography>
          </View>

          {selectedRole === 'CAREGIVER' ? (
            <CheckCircle2 size={24} color={COLORS.primary} />
          ) : (
            <Circle size={24} color={COLORS.textMuted} />
          )}
        </TouchableOpacity>

        {/* Role Card 2: Patient */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setSelectedRole('PATIENT')}
          style={[
            styles.roleCard,
            selectedRole === 'PATIENT' ? styles.selectedRoleCard : null,
            { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
            <User size={28} color={COLORS.gameBlue} />
          </View>

          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Typography size="lg" weight="bold">
              {t('patient') || 'Patient'}
            </Typography>
          </View>

          {selectedRole === 'PATIENT' ? (
            <CheckCircle2 size={24} color={COLORS.primary} />
          ) : (
            <Circle size={24} color={COLORS.textMuted} />
          )}
        </TouchableOpacity>

        <Button
          title={t('continue')}
          variant="primary"
          onPress={handleContinue}
          style={styles.continueBtn}
        />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/auth/login')}
          style={styles.loginLink}
        >
          <Typography size="sm" color={COLORS.textMuted} align="center">
            {t('already_have_account') || 'Already have an account?'}{' '}
            <Typography size="sm" weight="bold" color={COLORS.primary}>
              {t('login_now') || 'Login Now'}
            </Typography>
          </Typography>
        </TouchableOpacity>

        {/* Quick Test UI Shortcut Buttons */}
        <View style={styles.testShortcutContainer}>
          <Typography size="xs" weight="bold" color={COLORS.textMuted} align="center" style={{ marginBottom: SPACING.xs }}>
            {t('quick_login_shortcuts') || 'QUICK UI TEST LOGIN SHORTCUTS'}
          </Typography>

          <View style={styles.testBtnRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleQuickPatientLogin}
              style={[styles.testBtn, { backgroundColor: '#DBEAFE', borderColor: '#93C5FD' }]}
            >
              <User size={16} color="#1E40AF" style={{ marginRight: 6 }} />
              <Typography size="xs" weight="bold" color="#1E40AF">
                {t('login_as_patient') || 'Login as Patient'}
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleQuickCaregiverLogin}
              style={[styles.testBtn, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}
            >
              <HeartHandshake size={16} color="#15803D" style={{ marginRight: 6 }} />
              <Typography size="xs" weight="bold" color="#15803D">
                {t('login_as_caregiver') || 'Login as Caregiver'}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  illustrationWrapper: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  familyCircle: {
    width: 90,
    height: 90,
    borderRadius: RADIUS.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#86EFAC',
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginVertical: SPACING.xs,
    borderWidth: 1.5,
    borderColor: COLORS.surfaceVariant,
  },
  selectedRoleCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#DCFCE7',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
    marginTop: SPACING.lg,
  },
  loginLink: {
    marginTop: SPACING.md,
  },
  testShortcutContainer: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  testBtnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  testBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
});
