import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { QrCode, ArrowRight, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react-native';
import { Typography } from '../../components/common/Typography';
import { Button } from '../../components/common/Button';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export default function CaregiverConnectScreen() {
  const router = useRouter();
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePairing = () => {
    if (!code || code.trim().length < 4) {
      setErrorMsg('Please enter a valid Patient Connection Code (e.g. YAAD-789).');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.replace('/caregiver/home');
      }, 1200);
    }, 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: isHc ? COLORS.hcBackground : COLORS.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCircleWrapper}>
          <View style={styles.heroCircle}>
            <QrCode size={52} color={COLORS.primary} />
          </View>
        </View>

        <Typography size="xxl" weight="bold" align="center" color={isHc ? COLORS.hcTextPrimary : '#0F172A'}>
          Connect with Patient
        </Typography>

        <Typography size="xs" color={COLORS.textMuted} align="center" style={{ marginTop: 4, marginBottom: SPACING.lg, paddingHorizontal: SPACING.md }}>
          As a caregiver, please connect with your patient by entering their 10-minute valid Connection Code or scanning their QR code.
        </Typography>

        {success ? (
          <View style={styles.successBanner}>
            <CheckCircle2 size={24} color="#15803D" style={{ marginRight: 8 }} />
            <Typography size="xs" weight="bold" color="#15803D" style={{ flex: 1 }}>
              Successfully paired with Ramesh Kumar (Amma)! Redirecting...
            </Typography>
          </View>
        ) : null}

        {errorMsg ? (
          <View style={styles.errorBanner}>
            <AlertCircle size={20} color={COLORS.danger} style={{ marginRight: 8 }} />
            <Typography size="xs" color={COLORS.danger} style={{ flex: 1 }}>
              {errorMsg}
            </Typography>
          </View>
        ) : null}

        {/* Input: Connection Code */}
        <View style={styles.inputGroup}>
          <Typography size="xs" weight="bold" color={COLORS.textMuted} style={{ marginBottom: 4 }}>
            Enter Patient Connection Code
          </Typography>
          <TextInput
            value={code}
            onChangeText={(text) => {
              setCode(text.toUpperCase());
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="e.g. YAAD-789"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="characters"
            maxLength={10}
            style={styles.codeInput}
          />
        </View>

        {/* Scan QR Code Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setCode('YAAD-789');
            handlePairing();
          }}
          style={styles.scanQrBtn}
        >
          <QrCode size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Typography size="sm" weight="bold" color={COLORS.primary}>
            Scan Patient QR Code
          </Typography>
        </TouchableOpacity>

        {/* Pair Patient Action */}
        <Button
          title={loading ? 'Verifying Code...' : 'Connect to Patient'}
          variant="primary"
          disabled={loading || success}
          onPress={handlePairing}
          style={styles.connectBtn}
        />
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
  heroCircleWrapper: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  heroCircle: {
    width: 90,
    height: 90,
    borderRadius: RADIUS.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#86EFAC',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  codeInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    color: '#0F172A',
    textAlign: 'center',
  },
  scanQrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  connectBtn: {
    backgroundColor: COLORS.primary,
  },
});
