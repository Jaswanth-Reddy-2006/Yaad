import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  QrCode,
  Volume2,
  VolumeX,
  RefreshCw,
  Calendar,
  Bell,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Typography } from '../../components/common/Typography';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { useVoiceStore } from '../../store/useVoiceStore';
import { voiceService } from '../../services/VoiceService';
import { offlineProximitySync } from '../../services/sync/OfflineProximitySync';

export default function PatientOfflineSyncScreen() {
  const router = useRouter();
  const { preferences, currentLanguage, t } = useAccessibilityStore();
  const { isVoiceEnabled, ttsLanguage } = useVoiceStore();
  const isHc = preferences.highContrast;

  const [isScanning, setIsScanning] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [syncedCounts, setSyncedCounts] = useState<{ routines: number; reminders: number }>({
    routines: 0,
    reminders: 0,
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Initial welcome speech
  useEffect(() => {
    if (!isVoiceEnabled) return;
    setIsSpeaking(true);
    const welcomeText =
      currentLanguage === 'te'
        ? 'కేర్‌గివర్ QR కోడ్‌ని స్కాన్ చేయడం ద్వారా మీ రోజువారీ పనులు మరియు రిమైండర్‌లను ఆఫ్‌లైన్‌లో పొందండి.'
        : currentLanguage === 'hi'
        ? 'केयरगिवर का QR कोड स्कैन करके अपना दैनिक शेड्यूल और रिमाइंडर ऑफलाइन प्राप्त करें।'
        : 'Scan the Caregiver QR code to receive your daily routine and reminders offline without internet.';

    const timer = setTimeout(() => {
      voiceService.speak(
        welcomeText,
        ttsLanguage,
        {
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        },
        'NORMAL',
        'OFFLINE_SYNC_INTRO'
      );
    }, 400);

    return () => {
      clearTimeout(timer);
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    };
  }, [isVoiceEnabled, currentLanguage, ttsLanguage]);

  // Speaker button toggles between Mute and Unmute
  const handleToggleSpeaker = () => {
    if (!isMuted) {
      voiceService.stopSpeaking();
      voiceService.stop();
      setIsSpeaking(false);
      setIsMuted(true);
    } else {
      setIsMuted(false);
      setIsSpeaking(true);
      const promptText =
        currentLanguage === 'te'
          ? 'కెమెరాను కేర్‌గివర్ ఫోన్‌లోని QR కోడ్ వైపు చూపండి.'
          : currentLanguage === 'hi'
          ? 'कैमरा केयरगिवर के फोन में दिखाए गए QR कोड की ओर रखें।'
          : "Point your camera at the Caregiver's QR code to sync.";

      voiceService.speak(
        promptText,
        ttsLanguage,
        {
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        },
        'HIGH',
        'OFFLINE_SYNC_PROMPT'
      );
    }
  };

  // Trigger camera QR scan
  const handleStartScan = async () => {
    if (isScanning) return;
    setIsScanning(true);

    try {
      // Simulate proximity payload ingestion from Caregiver QR
      const payload = await offlineProximitySync.generatePayload();
      const res = await offlineProximitySync.ingestPayload(payload);

      const routineItems = await offlineProximitySync.getRoutineSchedule();
      const reminders = await offlineProximitySync.getOneTimeReminders();

      setSyncedCounts({
        routines: routineItems.length,
        reminders: reminders.length,
      });

      setSyncMessage(res.message || 'Offline data synchronized successfully!');
      setSyncSuccess(true);

      if (isVoiceEnabled && !isMuted) {
        const successSpeech =
          currentLanguage === 'te'
            ? 'కేర్‌గివర్ డేటా విజయవంతంగా సమకాలీకరించబడింది! మీ పనులు నవీకరించబడ్డాయి.'
            : currentLanguage === 'hi'
            ? 'केयरगिवर डेटा सफलतापूर्वक सिंक हो गया! आपके कार्य अपडेट हो गए हैं।'
            : 'Caregiver data synced successfully! Your daily schedule is up to date.';

        voiceService.speak(successSpeech, ttsLanguage, undefined, 'HIGH', 'SYNC_SUCCESS');
      }
    } catch (err) {
      console.warn('Sync failed', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleResetScan = () => {
    setSyncSuccess(false);
    setSyncMessage('');
  };

  return (
    <ScreenContainer scrollable={true} style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.topHeaderRow}>
        <TouchableOpacity
          accessibilityLabel={t('go_back')}
          accessibilityRole="button"
          onPress={() => {
            voiceService.stopSpeaking();
            setIsSpeaking(false);
            router.back();
          }}
          style={styles.backSquareBtn}
        >
          <ArrowLeft size={24} color="#047857" strokeWidth={2.5} />
        </TouchableOpacity>

        <Text style={[styles.headerTitleText, { color: isHc ? COLORS.hcTextPrimary : '#0F172A' }]}>
          {t('offline_sync_patient') || 'Offline QR Sync'}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleToggleSpeaker}
          style={[
            styles.headerSpeakerBtn,
            isMuted
              ? styles.headerSpeakerBtnMuted
              : isSpeaking
              ? styles.headerSpeakerBtnActive
              : null,
          ]}
          accessibilityLabel={isMuted ? (t('unmute') || 'Unmute voice') : (t('mute') || 'Mute voice')}
          accessibilityRole="button"
        >
          {isMuted ? (
            <VolumeX size={24} color="#EF4444" />
          ) : (
            <Volume2 size={24} color={isSpeaking ? '#FFFFFF' : '#059669'} />
          )}
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      {syncSuccess ? (
        /* Success Confirmation Screen */
        <View style={[styles.successCard, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' }]}>
          <View style={styles.successIconCircle}>
            <CheckCircle2 size={54} color="#15803D" />
          </View>

          <Typography size="xl" weight="bold" color="#15803D" align="center" style={{ marginTop: 12 }}>
            {t('sync_complete') || 'Sync Complete!'}
          </Typography>

          <Typography size="sm" color="#475569" align="center" style={styles.successSubtext}>
            {syncMessage || 'Your daily schedule and reminders have been updated directly from your caregiver.'}
          </Typography>

          {/* Sync Summary Pills */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryBadge}>
              <Calendar size={18} color="#059669" style={{ marginRight: 6 }} />
              <Typography size="sm" weight="bold" color="#065F46">
                {syncedCounts.routines} Daily Tasks
              </Typography>
            </View>

            <View style={[styles.summaryBadge, { backgroundColor: '#EDE9FE', borderColor: '#DDD6FE' }]}>
              <Bell size={18} color="#7C3AED" style={{ marginRight: 6 }} />
              <Typography size="sm" weight="bold" color="#5B21B6">
                {syncedCounts.reminders} Reminders
              </Typography>
            </View>
          </View>

          {/* Big Action: View Daily Routine */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              voiceService.stopSpeaking();
              router.push('/(patient)/my-day');
            }}
            style={styles.primaryActionBtn}
          >
            <Typography size="base" weight="bold" color="#FFFFFF">
              {t('view_daily_tasks') || 'View Daily Tasks'}
            </Typography>
          </TouchableOpacity>

          {/* Secondary Action: Scan Again */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleResetScan}
            style={styles.secondaryActionBtn}
          >
            <RefreshCw size={18} color="#059669" style={{ marginRight: 6 }} />
            <Typography size="sm" weight="bold" color="#059669">
              {t('scan_again') || 'Scan Another QR Code'}
            </Typography>
          </TouchableOpacity>
        </View>
      ) : (
        /* Pure QR Scanner View (NO JSON fields, NO debug text) */
        <View style={[styles.scannerContainer, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' }]}>
          {/* Elder Instruction Banner */}
          <View style={styles.instructionBanner}>
            <Typography size="sm" weight="bold" color="#065F46" align="center">
              {t('point_camera_at_qr') || "Point your camera at Caregiver's QR code"}
            </Typography>
            <Typography size="xs" color="#047857" align="center" style={{ marginTop: 4 }}>
              No internet connection needed. Exchanges data instantly.
            </Typography>
          </View>

          {/* QR Viewfinder Target with Corner Reticles */}
          <View style={styles.viewfinderWrapper}>
            <View style={styles.viewfinderBox}>
              {/* Four Corner Reticle Marks */}
              <View style={[styles.reticleCorner, styles.reticleTopLeft]} />
              <View style={[styles.reticleCorner, styles.reticleTopRight]} />
              <View style={[styles.reticleCorner, styles.reticleBottomLeft]} />
              <View style={[styles.reticleCorner, styles.reticleBottomRight]} />

              {/* Viewfinder Center Indicator */}
              <View style={styles.viewfinderCenter}>
                {isScanning ? (
                  <View style={styles.scanningActiveIndicator}>
                    <ActivityIndicator size="large" color="#059669" />
                    <Typography size="sm" weight="bold" color="#059669" style={{ marginTop: 12 }}>
                      Reading QR Code...
                    </Typography>
                  </View>
                ) : (
                  <View style={styles.viewfinderIdle}>
                    <QrCode size={90} color="#059669" strokeWidth={1.5} />
                    <View style={styles.scanBeamLine} />
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Pure QR Scan Action Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleStartScan}
            disabled={isScanning}
            style={[styles.primaryActionBtn, isScanning ? { opacity: 0.7 } : null]}
          >
            <Camera size={26} color="#FFFFFF" style={{ marginRight: 10 }} />
            <Typography size="base" weight="bold" color="#FFFFFF">
              {isScanning ? 'Scanning...' : t('scan_caregiver_qr') || 'Scan Caregiver QR'}
            </Typography>
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: SPACING.xl,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  backSquareBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitleText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSpeakerBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#6EE7B7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerSpeakerBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  headerSpeakerBtnMuted: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  scannerContainer: {
    borderRadius: RADIUS.xxl,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.xs,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  instructionBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  viewfinderWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.md,
  },
  viewfinderBox: {
    width: 250,
    height: 250,
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.xl,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  reticleCorner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#059669',
  },
  reticleTopLeft: {
    top: 10,
    left: 10,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  reticleTopRight: {
    top: 10,
    right: 10,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  reticleBottomLeft: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  reticleBottomRight: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  viewfinderCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderIdle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBeamLine: {
    width: 210,
    height: 2,
    backgroundColor: '#10B981',
    marginTop: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  scanningActiveIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  primaryActionBtn: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 16,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.lg,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#6EE7B7',
    backgroundColor: '#ECFDF5',
  },
  successCard: {
    borderRadius: RADIUS.xxl,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#86EFAC',
  },
  successSubtext: {
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
});
