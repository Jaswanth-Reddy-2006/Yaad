import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Link as LinkIcon, CheckCircle2 } from 'lucide-react-native';
import { Typography } from '../../components/common/Typography';
import { Button } from '../../components/common/Button';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const [identifier, setIdentifier] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendLink = () => {
    if (!identifier) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
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
          Forgot Password
        </Typography>
        <Typography size="xs" color={COLORS.textMuted} style={{ marginTop: 4, marginBottom: SPACING.lg, lineHeight: 20 }}>
          Enter your email or phone number and we'll send you a link to reset your password.
        </Typography>

        {sent ? (
          <View style={styles.successBanner}>
            <CheckCircle2 size={24} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Typography size="xs" color={COLORS.primaryDark} style={{ flex: 1 }}>
              Reset link sent! Please check your inbox or SMS messages.
            </Typography>
          </View>
        ) : null}

        {/* Input */}
        <View style={styles.inputGroup}>
          <Typography size="xs" weight="bold" color={COLORS.textMuted} style={{ marginBottom: 4 }}>
            Email or Phone Number
          </Typography>
          <View style={styles.inputWrapper}>
            <Mail size={20} color={COLORS.textMuted} style={{ marginLeft: 12, marginRight: 8 }} />
            <TextInput
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="e.g. john.doe@email.com"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              style={[styles.input, { flex: 1, borderWidth: 0 }]}
            />
          </View>
        </View>

        <Button
          title={loading ? 'Sending...' : 'Send Reset Link'}
          variant="primary"
          disabled={loading || sent}
          onPress={handleSendLink}
          style={styles.sendBtn}
        />

        {/* Bottom Envelope Link Illustration */}
        <View style={styles.envelopeIllustration}>
          <View style={styles.envelopeCard}>
            <LinkIcon size={32} color={COLORS.primary} />
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/auth/login')}
          style={styles.loginLink}
        >
          <Typography size="sm" color={COLORS.textMuted} align="center">
            Remember your password?{' '}
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    marginTop: SPACING.xs,
  },
  envelopeIllustration: {
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  envelopeCard: {
    width: 90,
    height: 70,
    borderRadius: RADIUS.lg,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BAE6FD',
  },
  loginLink: {
    marginTop: SPACING.md,
  },
});
