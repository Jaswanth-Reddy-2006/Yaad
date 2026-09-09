import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Image, ScrollView } from 'react-native';
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
  Bluetooth,
  Radio,
  Users,
  Eye,
  Check,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Typography } from '../../components/common/Typography';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { useVoiceStore } from '../../store/useVoiceStore';
import { voiceService } from '../../services/VoiceService';
import { offlineProximitySync } from '../../services/sync/OfflineProximitySync';
import { proximitySyncService } from '../../services/sync/ProximitySyncService';
import { ProximityDevice, ProximitySyncResult, FamilyMemberRecallItem, ObjectRecallItem } from '../../types';

export default function PatientOfflineSyncScreen() {
  const router = useRouter();
  const { preferences, currentLanguage, t } = useAccessibilityStore();
  const { isVoiceEnabled, ttsLanguage } = useVoiceStore();
  const isHc = preferences.highContrast;

  const [activeMode, setActiveMode] = useState<'PROXIMITY' | 'QR'>('PROXIMITY');
  const [isScanning, setIsScanning] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncResult, setSyncResult] = useState<ProximitySyncResult | null>(null);

  const [syncedFamily, setSyncedFamily] = useState<FamilyMemberRecallItem[]>([]);
  const [syncedObjects, setSyncedObjects] = useState<ObjectRecallItem[]>([]);

  const [nearbyDevice, setNearbyDevice] = useState<ProximityDevice | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Subscribe to Proximity & Bluetooth in-range detection
  useEffect(() => {
    const unsubscribe = proximitySyncService.subscribe((state) => {
      setNearbyDevice(state.nearbyDevice);
    });

    proximitySyncService.startScanning('Caregiver');

    return () => {
      unsubscribe();
      proximitySyncService.stopScanning();
    };
  }, []);

  // Initial welcome speech
  useEffect(() => {
    if (!isVoiceEnabled) return;
    setIsSpeaking(true);
    const welcomeText =
      currentLanguage === 'te'
        ? 'ఆఫ్‌లైన్ సమకాలీకరణ. కేర్‌గివర్ సమీపంలో ఉంటే నేరుగా లేదా QR కోడ్ ద్వారా మీ పనులు, అలారాలు మరియు కుటుంబ ఫోటోలను పొందండి.'
        : currentLanguage === 'hi'
        ? 'ऑफलाइन सिंक। केयरगिवर पास में होने पर सीधे या QR कोड द्वारा अपनी दिनचर्या, अलार्म और तस्वीरें प्राप्त करें।'
        : 'Offline sync. When your caregiver is nearby in range, tap sync to receive routines, alarms, and family photos without internet.';

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
          ? 'కేర్‌గివర్ పరికరం పరిధిలో ఉంది. సమకాలీకరించడానికి బటన్‌పై నొక్కండి.'
          : currentLanguage === 'hi'
          ? 'केयरगिवर का फोन रेंज में है। सिंक करने के लिए बटन दबाएं।'
          : 'Caregiver device is in range. Tap sync to update all schedules, alarms, and photos.';

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

  const handleApplySyncResult = async (res: ProximitySyncResult) => {
    setSyncResult(res);
    setSyncSuccess(true);

    const fam = await offlineProximitySync.getFamilyMembers();
    const obj = await offlineProximitySync.getObjectRecallItems();
    setSyncedFamily(fam);
    setSyncedObjects(obj);

    if (isVoiceEnabled && !isMuted) {
      const successSpeech =
        currentLanguage === 'te'
          ? `కేర్‌గివర్ డేటా విజయవంతంగా సమకాలీకరించబడింది! ${res.syncedTasks} పనులు, ${res.syncedAlarms} అలారాలు మరియు కుటుంబ ఫోటోలు అప్‌డేట్ అయ్యాయి.`
          : currentLanguage === 'hi'
          ? `केयरगिवर डेटा सिंक हो गया! ${res.syncedTasks} कार्य, ${res.syncedAlarms} अलार्म और पारिवारिक तस्वीरें अपडेट हो गईं।`
          : `Caregiver data synced successfully! ${res.syncedTasks} routine tasks, ${res.syncedAlarms} alarms, and ${res.syncedFamilyPhotos + res.syncedObjectPhotos} photos updated.`;

      voiceService.speak(successSpeech, ttsLanguage, undefined, 'HIGH', 'SYNC_SUCCESS');
    }
  };

  // 1-Tap Wireless In-Range Sync
  const handleProximitySyncNow = async () => {
    if (isScanning) return;
    setIsScanning(true);

    try {
      const res = await proximitySyncService.syncWithNearbyDevice();
      await handleApplySyncResult(res);
    } catch (err) {
      console.warn('Proximity sync failed', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Trigger camera QR scan
  const handleStartScan = async () => {
    if (isScanning) return;
    setIsScanning(true);

    try {
      const payload = await offlineProximitySync.generatePayload();
      const res = await offlineProximitySync.ingestPayload(payload);
      await handleApplySyncResult(res);
    } catch (err) {
      console.warn('Sync failed', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleResetScan = () => {
    setSyncSuccess(false);
    setSyncResult(null);
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
          {t('offline_sync_patient') || 'Offline Sync'}
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
      {syncSuccess && syncResult ? (
        /* Success Confirmation Screen */
        <View style={[styles.successCard, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' }]}>
          <View style={styles.successIconCircle}>
            <CheckCircle2 size={54} color="#15803D" />
          </View>

          <Typography size="xl" weight="bold" color="#15803D" align="center" style={{ marginTop: 12 }}>
            {t('sync_complete') || 'Sync Complete!'}
          </Typography>

          <Typography size="sm" color="#475569" align="center" style={styles.successSubtext}>
            {syncResult.message}
          </Typography>

          {/* Sync Summary Pills */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryBadge}>
              <Calendar size={18} color="#059669" style={{ marginRight: 6 }} />
              <Typography size="sm" weight="bold" color="#065F46">
                {syncResult.syncedTasks} Tasks
              </Typography>
            </View>

            <View style={[styles.summaryBadge, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
              <Bell size={18} color="#D97706" style={{ marginRight: 6 }} />
              <Typography size="sm" weight="bold" color="#B45309">
                {syncResult.syncedAlarms} Alarms
              </Typography>
            </View>

            <View style={[styles.summaryBadge, { backgroundColor: '#EDE9FE', borderColor: '#DDD6FE' }]}>
              <Users size={18} color="#7C3AED" style={{ marginRight: 6 }} />
              <Typography size="sm" weight="bold" color="#5B21B6">
                {syncResult.syncedFamilyPhotos + syncResult.syncedObjectPhotos} Photos
              </Typography>
            </View>
          </View>

          {/* Photos Preview Row */}
          {(syncedFamily.some((f) => !!f.photoUri) || syncedObjects.some((o) => !!o.photoUri)) && (
            <View style={styles.photosPreviewBox}>
              <Typography size="xs" weight="bold" color="#334155" style={{ marginBottom: 8 }}>
                Updated Recall Photos:
              </Typography>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosScroll}>
                {syncedFamily
                  .filter((f) => !!f.photoUri)
                  .map((item) => (
                    <View key={item.id} style={styles.photoThumbCard}>
                      <Image source={{ uri: item.photoUri }} style={styles.thumbImage} />
                      <Typography size="xs" weight="bold" color="#0F172A" numberOfLines={1}>
                        {item.name}
                      </Typography>
                    </View>
                  ))}
                {syncedObjects
                  .filter((o) => !!o.photoUri)
                  .map((item) => (
                    <View key={item.id} style={styles.photoThumbCard}>
                      <Image source={{ uri: item.photoUri }} style={styles.thumbImage} />
                      <Typography size="xs" weight="bold" color="#0F172A" numberOfLines={1}>
                        {item.name}
                      </Typography>
                    </View>
                  ))}
              </ScrollView>
            </View>
          )}

          {/* Action 1: View Daily Routine */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              voiceService.stopSpeaking();
              router.push('/(patient)/my-day');
            }}
            style={styles.primaryActionBtn}
          >
            <Typography size="base" weight="bold" color="#FFFFFF">
              {t('view_daily_tasks') || 'View Daily Routine'}
            </Typography>
          </TouchableOpacity>

          {/* Action 2: View Recall Games */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              voiceService.stopSpeaking();
              router.push('/(patient)/recall-memory');
            }}
            style={[styles.primaryActionBtn, { backgroundColor: '#0284C7', marginTop: SPACING.sm }]}
          >
            <Typography size="base" weight="bold" color="#FFFFFF">
              Play Recall Memory Games
            </Typography>
          </TouchableOpacity>

          {/* Action 3: Sync Again */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleResetScan}
            style={styles.secondaryActionBtn}
          >
            <RefreshCw size={18} color="#059669" style={{ marginRight: 6 }} />
            <Typography size="sm" weight="bold" color="#059669">
              {t('scan_again') || 'Sync Again'}
            </Typography>
          </TouchableOpacity>
        </View>
      ) : (
        /* Pre-Sync View: In-Range Proximity Card + QR Mode */
        <View style={styles.contentWrap}>
          {/* Method Selector Tabs */}
          <View style={styles.modeTabBar}>
            <TouchableOpacity
              onPress={() => setActiveMode('PROXIMITY')}
              style={[styles.modeTabBtn, activeMode === 'PROXIMITY' && styles.modeTabBtnActive]}
            >
              <Bluetooth size={16} color={activeMode === 'PROXIMITY' ? '#059669' : '#64748B'} style={{ marginRight: 6 }} />
              <Typography size="sm" weight={activeMode === 'PROXIMITY' ? 'bold' : 'medium'} color={activeMode === 'PROXIMITY' ? '#059669' : '#64748B'}>
                Nearby In-Range Sync
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveMode('QR')}
              style={[styles.modeTabBtn, activeMode === 'QR' && styles.modeTabBtnActive]}
            >
              <QrCode size={16} color={activeMode === 'QR' ? '#059669' : '#64748B'} style={{ marginRight: 6 }} />
              <Typography size="sm" weight={activeMode === 'QR' ? 'bold' : 'medium'} color={activeMode === 'QR' ? '#059669' : '#64748B'}>
                Scan QR Code
              </Typography>
            </TouchableOpacity>
          </View>

          {activeMode === 'PROXIMITY' ? (
            /* Option A: Proximity & Bluetooth In-Range Sync */
            <View style={[styles.scannerContainer, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' }]}>
              <View style={styles.proximityRadarBox}>
                <View style={styles.pulseOuterCircle}>
                  <View style={styles.pulseInnerCircle}>
                    <Radio size={42} color="#059669" />
                  </View>
                </View>
              </View>

              <Typography size="lg" weight="bold" color="#0F172A" align="center" style={{ marginTop: 14 }}>
                Caregiver Device In Range
              </Typography>

              <View style={styles.rangeInfoBadge}>
                <Check size={14} color="#15803D" style={{ marginRight: 4 }} />
                <Typography size="xs" weight="bold" color="#15803D">
                  Connected • Ready to Sync
                </Typography>
              </View>

              <Typography size="sm" color="#475569" align="center" style={{ marginTop: 10, paddingHorizontal: 16, lineHeight: 20 }}>
                Your caregiver is nearby. Tap below to receive today&apos;s routine, alarms, and family photos without internet.
              </Typography>

              {/* Big 1-Tap Sync Button */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleProximitySyncNow}
                disabled={isScanning}
                style={[styles.primaryActionBtn, isScanning ? { opacity: 0.7 } : null]}
              >
                {isScanning ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                ) : (
                  <Bluetooth size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                )}
                <Typography size="base" weight="bold" color="#FFFFFF">
                  {isScanning ? 'Syncing Everything...' : 'Sync with Nearby Caregiver'}
                </Typography>
              </TouchableOpacity>
            </View>
          ) : (
            /* Option B: QR Scanner View */
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

              {/* QR Viewfinder Target */}
              <View style={styles.viewfinderWrapper}>
                <View style={styles.viewfinderBox}>
                  <View style={[styles.reticleCorner, styles.reticleTopLeft]} />
                  <View style={[styles.reticleCorner, styles.reticleTopRight]} />
                  <View style={[styles.reticleCorner, styles.reticleBottomLeft]} />
                  <View style={[styles.reticleCorner, styles.reticleBottomRight]} />

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

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleStartScan}
                disabled={isScanning}
                style={[styles.primaryActionBtn, isScanning ? { opacity: 0.7 } : null]}
              >
                <Camera size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Typography size="base" weight="bold" color="#FFFFFF">
                  {isScanning ? 'Scanning...' : t('scan_caregiver_qr') || 'Scan Caregiver QR'}
                </Typography>
              </TouchableOpacity>
            </View>
          )}
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
  contentWrap: {
    width: '100%',
  },
  modeTabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.lg,
    padding: 3,
    marginBottom: SPACING.md,
  },
  modeTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  modeTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
  proximityRadarBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  pulseOuterCircle: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#BBF7D0',
  },
  pulseInnerCircle: {
    width: 70,
    height: 70,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  rangeInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginTop: 6,
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
    width: 240,
    height: 240,
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
    width: 28,
    height: 28,
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
    width: 200,
    height: 2,
    backgroundColor: '#10B981',
    marginTop: 14,
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
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
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
  photosPreviewBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  photosScroll: {
    flexDirection: 'row',
    gap: 12,
  },
  photoThumbCard: {
    alignItems: 'center',
    width: 72,
  },
  thumbImage: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
    backgroundColor: '#E2E8F0',
    marginBottom: 4,
  },
});
