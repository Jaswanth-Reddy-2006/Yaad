import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, RefreshCw } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export default function PatientConnectionScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const [secondsRemaining, setSecondsRemaining] = useState(596); // 09:56 min
  const [connectionCode, setConnectionCode] = useState('YAAD-789');

  // Live 10-minute countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const generateNewCode = () => {
    const randomHex = Math.floor(100 + Math.random() * 900);
    setConnectionCode(`YAAD-${randomHex}`);
    setSecondsRemaining(600);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Real QR Code Value Payload (Scannable JSON payload for Caregiver app)
  const qrPayload = JSON.stringify({
    app: 'Yaad',
    type: 'PATIENT_CONNECT',
    code: connectionCode,
    patientName: 'Ramesh Kumar',
  });

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      {/* Top Header with Back Arrow Square Button */}
      <View style={styles.topHeaderRow}>
        <TouchableOpacity
          accessibilityLabel={t('go_back')}
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backSquareBtn}
        >
          <ArrowLeft size={24} color="#0F172A" strokeWidth={2.5} />
        </TouchableOpacity>

        <Text style={[styles.headerTitleText, { color: isHc ? COLORS.hcTextPrimary : '#0F172A' }]}>
          {t('connection_qr')}
        </Text>
      </View>

      {/* Main Connection Page Card matching media_1788281320474.png EXACTLY */}
      <View style={styles.verticalStackContainer}>
        <View style={[styles.mainCard, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' }]}>
          {/* Top Yellow Timer Badge */}
          <View style={styles.timerBadge}>
            <Clock size={20} color="#D97706" style={{ marginRight: 8 }} />
            <Text style={styles.timerText}>
              {t('valid_for')} {formatTimer(secondsRemaining)} {t('min')}
            </Text>
          </View>

          {/* Real Scannable Working QR Code */}
          <View style={styles.qrContainer}>
            <QRCode
              value={qrPayload}
              size={170}
              color="#0F172A"
              backgroundColor="#FFFFFF"
            />
          </View>

          {/* Patient Connection Code Pill (STRICT SINGLE LINE) */}
          <View style={styles.codePill}>
            <Text style={styles.codePillLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {t('patient_connection_code')}
            </Text>
            <Text style={styles.codePillValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {connectionCode}
            </Text>
          </View>

          {/* Full-Width Solid Green Generate New Code Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={generateNewCode}
            style={styles.generateBtn}
          >
            <RefreshCw size={22} color="#FFFFFF" style={{ marginRight: 10 }} />
            <Text style={styles.generateBtnText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
              {t('generate_new_code')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '800',
    marginLeft: SPACING.sm,
  },
  verticalStackContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: SPACING.xs,
  },
  mainCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.md,
  },
  timerText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B45309',
  },
  qrContainer: {
    padding: SPACING.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginVertical: SPACING.sm,
  },
  codePill: {
    backgroundColor: '#E6F9ED',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    width: '100%',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  codePillLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  codePillValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#16A34A',
    letterSpacing: 4,
    marginTop: 4,
  },
  generateBtn: {
    width: '100%',
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    borderRadius: RADIUS.full,
    marginTop: SPACING.xs,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  generateBtnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
