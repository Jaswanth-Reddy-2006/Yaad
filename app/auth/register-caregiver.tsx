import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckSquare, Square, Eye, EyeOff } from 'lucide-react-native';
import { Typography } from '../../components/common/Typography';
import { Button } from '../../components/common/Button';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { authService } from '../../services/AuthService';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export default function RegisterCaregiverScreen() {
  const router = useRouter();
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const caregiverSession = {
        accessToken: 'caregiver-jwt-token',
        refreshToken: 'caregiver-refresh-token',
        userId: 'cg-001',
        role: 'CAREGIVER' as const,
        displayName: fullName,
      };

      await authService.saveSession(caregiverSession);
      router.push('/auth/caregiver-connect');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isHc ? COLORS.hcBackground : COLORS.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={28} color={isHc ? COLORS.hcTextPrimary : '#0F172A'} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Typography size="xxl" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'}>
          Create Account
        </Typography>
        <Typography size="xs" color={COLORS.textMuted} style={{ marginTop: 4, marginBottom: SPACING.md }}>
          Caregiver Details
        </Typography>

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <Typography size="xs" color={COLORS.danger} align="center">
              {errorMsg}
            </Typography>
          </View>
        ) : null}

        {/* Input 1: Full Name */}
        <View style={styles.inputGroup}>
          <Typography size="xs" weight="bold" color={COLORS.textMuted} style={{ marginBottom: 4 }}>
            Full Name
          </Typography>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Aarav Sharma"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
          />
        </View>

        {/* Input 2: Email Address */}
        <View style={styles.inputGroup}>
          <Typography size="xs" weight="bold" color={COLORS.textMuted} style={{ marginBottom: 4 }}>
            Email Address
          </Typography>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="aarav.sharma@email.com"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        {/* Input 3: Phone Number */}
        <View style={styles.inputGroup}>
          <Typography size="xs" weight="bold" color={COLORS.textMuted} style={{ marginBottom: 4 }}>
            Phone Number
          </Typography>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 98765 43210"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>

        {/* Input 4: Password */}
        <View style={styles.inputGroup}>
          <Typography size="xs" weight="bold" color={COLORS.textMuted} style={{ marginBottom: 4 }}>
            Password
          </Typography>
          <View style={styles.passwordWrapper}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••••"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!showPassword}
              style={[styles.input, { flex: 1, borderWidth: 0 }]}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
              {showPassword ? <EyeOff size={20} color={COLORS.textMuted} /> : <Eye size={20} color={COLORS.textMuted} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Input 5: Confirm Password */}
        <View style={styles.inputGroup}>
          <Typography size="xs" weight="bold" color={COLORS.textMuted} style={{ marginBottom: 4 }}>
            Confirm Password
          </Typography>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••••••"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry={!showPassword}
            style={styles.input}
          />
        </View>

        {/* Terms Checkbox */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setAgreeTerms(!agreeTerms)}
          style={styles.termsRow}
        >
          {agreeTerms ? (
            <CheckSquare size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
          ) : (
            <Square size={20} color={COLORS.textMuted} style={{ marginRight: 8 }} />
          )}
          <Typography size="xs" color={COLORS.textMuted} style={{ flex: 1 }}>
            I agree to the{' '}
            <Typography size="xs" weight="bold" color={COLORS.primary}>
              Terms of Service
            </Typography>{' '}
            and{' '}
            <Typography size="xs" weight="bold" color={COLORS.primary}>
              Privacy Policy
            </Typography>
          </Typography>
        </TouchableOpacity>

        <Button
          title={loading ? 'Registering...' : 'Register'}
          variant="primary"
          disabled={loading}
          onPress={handleRegister}
          style={styles.registerBtn}
        />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/auth/login')}
          style={styles.loginLink}
        >
          <Typography size="sm" color={COLORS.textMuted} align="center">
            Already have an account?{' '}
            <Typography size="sm" weight="bold" color={COLORS.primary}>
              Login Now
            </Typography>
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
    paddingBottom: SPACING.xl,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#0F172A',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingRight: 8,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  registerBtn: {
    backgroundColor: COLORS.primary,
    marginTop: SPACING.md,
  },
  loginLink: {
    marginTop: SPACING.md,
  },
});
