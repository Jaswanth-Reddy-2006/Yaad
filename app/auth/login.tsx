import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, CheckSquare, Square, AlertCircle } from 'lucide-react-native';
import { AppLogo } from '../../components/common/AppLogo';
import { Typography } from '../../components/common/Typography';
import { Button } from '../../components/common/Button';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { authService } from '../../services/AuthService';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export default function LoginScreen() {
  const router = useRouter();
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!identifier) {
      setErrorMsg('Invalid email address or phone number.');
      return;
    }

    if (!password) {
      setErrorMsg('Incorrect password. Please try again.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // Authenticated session handling
      const isCaregiver = identifier.toLowerCase().includes('care') || identifier.toLowerCase().includes('aarav');
      const role = isCaregiver ? ('CAREGIVER' as const) : ('PATIENT' as const);

      const session = {
        accessToken: 'mitracare-valid-jwt-token',
        refreshToken: 'mitracare-valid-refresh-token',
        userId: isCaregiver ? 'cg-001' : 'pt-001',
        role: role,
        displayName: isCaregiver ? 'Aarav Sharma' : 'Ramesh Kumar',
      };

      await authService.saveSession(session);

      if (role === 'CAREGIVER') {
        router.replace('/caregiver/home');
      } else {
        router.replace('/(patient)');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isHc ? COLORS.hcBackground : COLORS.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Logo */}
        <View style={styles.logoRow}>
          <AppLogo size="large" />
        </View>

        <Typography size="xxl" weight="bold" align="center" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} style={{ marginTop: SPACING.md }}>
          Welcome Back
        </Typography>
        <Typography size="xs" color={COLORS.textMuted} align="center" style={{ marginTop: 4, marginBottom: SPACING.lg }}>
          Login to continue your journey of care and connection
        </Typography>

        {/* Input 1: Email or Phone */}
        <View style={styles.inputGroup}>
          <View style={[styles.inputWrapper, errorMsg ? styles.inputErrorBorder : null]}>
            <Mail size={20} color={COLORS.textMuted} style={{ marginLeft: 12, marginRight: 8 }} />
            <TextInput
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Email or Phone Number"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              style={[styles.input, { flex: 1, borderWidth: 0 }]}
            />
          </View>
        </View>

        {/* Input 2: Password */}
        <View style={styles.inputGroup}>
          <View style={[styles.inputWrapper, errorMsg ? styles.inputErrorBorder : null]}>
            <Lock size={20} color={COLORS.textMuted} style={{ marginLeft: 12, marginRight: 8 }} />
            <TextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!showPassword}
              style={[styles.input, { flex: 1, borderWidth: 0 }]}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 8 }}>
              {showPassword ? <EyeOff size={20} color={COLORS.textMuted} /> : <Eye size={20} color={COLORS.textMuted} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Validation Error Text */}
        {errorMsg ? (
          <View style={styles.errorAlertRow}>
            <AlertCircle size={16} color={COLORS.danger} style={{ marginRight: 6 }} />
            <Typography size="xs" color={COLORS.danger}>
              {errorMsg}
            </Typography>
          </View>
        ) : null}

        {/* Remember Me & Forgot Password Row */}
        <View style={styles.optionsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setRememberMe(!rememberMe)}
            style={styles.rememberRow}
          >
            {rememberMe ? (
              <CheckSquare size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
            ) : (
              <Square size={18} color={COLORS.textMuted} style={{ marginRight: 6 }} />
            )}
            <Typography size="xs" color={COLORS.textMuted}>
              Remember me
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
            <Typography size="xs" weight="semibold" color={COLORS.gameBlue}>
              Forgot Password?
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Primary Login Button */}
        <Button
          title={loading ? 'Logging in...' : 'Login'}
          variant="primary"
          disabled={loading}
          onPress={handleLogin}
          style={styles.loginBtn}
        />

        {/* Social Login Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Typography size="xs" color={COLORS.textMuted} style={{ marginHorizontal: SPACING.md }}>
            or continue with
          </Typography>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialRow}>
          <TouchableOpacity activeOpacity={0.8} style={styles.socialBtn}>
            <Typography size="base" weight="bold">
              Google
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={styles.socialBtn}>
            <Typography size="base" weight="bold">
              Apple
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/auth/role-select')}
          style={styles.signupLink}
        >
          <Typography size="sm" color={COLORS.textMuted} align="center">
            Don't have an account?{' '}
            <Typography size="sm" weight="bold" color={COLORS.gameBlue}>
              Sign Up
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
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  logoRow: {
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  inputGroup: {
    marginVertical: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  inputErrorBorder: {
    borderColor: COLORS.danger,
    backgroundColor: '#FEF2F2',
  },
  input: {
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  errorAlertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: SPACING.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    marginTop: SPACING.xs,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  socialRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  socialBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  signupLink: {
    marginTop: SPACING.xl,
  },
});
