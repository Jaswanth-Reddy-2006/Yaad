import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { QrCode, ArrowLeft, ArrowRight, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react-native';
import { Typography } from '../../components/common/Typography';
import { Button } from '../../components/common/Button';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export default function CaregiverConnectScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/auth/role-select');
    }
  };

  const handlePairing = () => {
    if (!code || code.trim().length < 4) {
      setErrorMsg(t('enter_patient_code') || 'Please enter a valid Patient Connection Code.');
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
        {/* Top Header Row with Back Button */}
        <View style={styles.topHeaderRow}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backSquareBtn}
            accessibilityLabel={t('go_back') || 'Go Back'}
            accessibilityRole="button"
          >
            <ArrowLeft size={22} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroCircleWrapper}>
          <View style={styles.heroCircle}>
            <QrCode size={52} color={COLORS.primary} />
          </View>
        </View>

        <Typography size="xxl" weight="bold" align="center" color={isHc ? COLORS.hcTextPrimary : '#0F172A'}>
          {t('connect_with_patient') || 'Connect with Patient'}
        </Typography>

        <Typography size="xs" color={COLORS.textMuted} align="center" style={{ marginTop: 4, marginBottom: SPACING.lg, paddingHorizontal: SPACING.md }}>
          {t('caregiver_connect_desc') || 'As a caregiver, please connect with your patient by entering their 10-minute valid Connection Code or scanning their QR code.'}
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
            {t('patient_connection_code')}
          </Typography>
          <TextInput
            value={code}
            onChangeText={(text) => {
              setCode(text.toUpperCase());
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="---"
            placeholderTextColor="#94A3B8"
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
            {t('scan_patient_qr')}
          </Typography>
        </TouchableOpacity>

        {/* Pair Patient Action */}
        <Button
          title={loading ? t('loading') : t('connect_with_patient')}
          variant="primary"
          disabled={loading || success}
          onPress={handlePairing}
          style={styles.connectBtn}
        />

        {/* Skip to Dashboard Option */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.replace('/caregiver/home')}
          style={{ marginTop: SPACING.md, paddingVertical: 8, alignItems: 'center' }}
        >
          <Typography size="sm" weight="semibold" color={COLORS.textSecondary}>
            {t('skip') || 'Skip for now'} → {t('go_to_home') || 'Go to Home'}
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
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  backSquareBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 4,
    borderWidth: 2,
    borderColor: '#86EFAC',
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
