import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AppLogo } from '../../components/common/AppLogo';
import { Typography } from '../../components/common/Typography';
import { Button } from '../../components/common/Button';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { authService } from '../../services/AuthService';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    if (!displayName || !password) {
      setErrorMsg('Please enter your name and a password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const dummySession = {
        accessToken: 'dummy-reg-access-token',
        refreshToken: 'dummy-reg-refresh-token',
        userId: 'usr-new-001',
        role: 'PATIENT' as const,
        displayName,
      };

      await authService.saveSession(dummySession);
      router.replace('/(patient)');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isHc ? COLORS.hcBackground : COLORS.background }]}>
      <View style={styles.card}>
        <View style={styles.logoRow}>
          <AppLogo size="large" />
        </View>

        <Typography size="xl" weight="bold" align="center" style={{ marginTop: SPACING.md }}>
          Create Patient Account
        </Typography>
        <Typography size="sm" color={COLORS.textMuted} align="center" style={{ marginTop: 4, marginBottom: SPACING.lg }}>
          Fill details to get started with Yaad
        </Typography>

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Typography size="xs" color={COLORS.danger} align="center">
              {errorMsg}
            </Typography>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Typography size="xs" weight="bold" color={COLORS.textMuted} style={{ marginBottom: 4 }}>
            Full Name (e.g. Amma)
          </Typography>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Typography size="xs" weight="bold" color={COLORS.textMuted} style={{ marginBottom: 4 }}>
            Email Address (Optional)
          </Typography>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="e.g. name@example.com"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Typography size="xs" weight="bold" color={COLORS.textMuted} style={{ marginBottom: 4 }}>
            Password
          </Typography>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
            style={styles.input}
          />
        </View>

        <Button
          title={loading ? 'Creating Account...' : 'REGISTER'}
          variant="primary"
          disabled={loading}
          onPress={handleRegister}
          style={{ marginTop: SPACING.md }}
        />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/auth/login')}
          style={{ marginTop: SPACING.lg }}
        >
          <Typography size="sm" weight="bold" color={COLORS.primary} align="center">
            Already have an account? Sign in
          </Typography>
        </TouchableOpacity>
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
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  logoRow: {
    alignItems: 'center',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: '#F8FAF8',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#0F172A',
  },
});
