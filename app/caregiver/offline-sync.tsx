import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bluetooth,
  QrCode,
  Radio,
  CheckCircle2,
  Calendar,
  Bell,
  Users,
  Eye,
  RefreshCw,
  Check,
} from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { CaregiverBottomNavBar } from '../../components/caregiver/CaregiverBottomNavBar';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useCaregiverStore } from '../../store/useCaregiverStore';
import { offlineProximitySync } from '../../services/sync/OfflineProximitySync';
import { proximitySyncService } from '../../services/sync/ProximitySyncService';
import {
  RoutineScheduleItem,
  Reminder,
  FamilyMemberRecallItem,
  ObjectRecallItem,
  ProximitySyncResult,
} from '../../types';

export default function CaregiverOfflineSyncScreen() {
  const router = useRouter();
  const { activePatientId, patients } = useCaregiverStore();

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0] || {
    id: 'p-1',
    name: 'Amma',
    relationship: 'Mother',
  };

  const [activeTab, setActiveTab] = useState<'NEARBY' | 'QR'>('NEARBY');
  const [qrType, setQrType] = useState<'QUICK' | 'FULL'>('QUICK');

  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<ProximitySyncResult | null>(null);
  const [payloadString, setPayloadString] = useState<string>('');

  // Live real data
  const [routineList, setRoutineList] = useState<RoutineScheduleItem[]>([]);
  const [remindersList, setRemindersList] = useState<Reminder[]>([]);
  const [familyList, setFamilyList] = useState<FamilyMemberRecallItem[]>([]);
  const [objectList, setObjectList] = useState<ObjectRecallItem[]>([]);

  // Load actual data for the active patient
  const loadPatientData = useCallback(async () => {
    try {
      const [routine, rems, fam, obj] = await Promise.all([
        offlineProximitySync.getRoutineSchedule(activePatient.id),
        offlineProximitySync.getOneTimeReminders(activePatient.id),
        offlineProximitySync.getFamilyMembers(activePatient.id),
        offlineProximitySync.getObjectRecallItems(activePatient.id),
      ]);
      setRoutineList(routine);
      setRemindersList(rems);
      setFamilyList(fam);
      setObjectList(obj);
    } catch (e) {
      console.warn('Failed to load patient data for offline sync', e);
    }
  }, [activePatient.id]);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  // Load QR payload
  const loadQRPayload = useCallback(async () => {
    setLoading(true);
    try {
      if (qrType === 'QUICK') {
        const str = await offlineProximitySync.generateQuickQRPayload(activePatient.id);
        setPayloadString(str);
      } else {
        const str = await offlineProximitySync.generatePayload(activePatient.id);
        setPayloadString(str);
      }
    } catch (e) {
      console.warn('Failed to generate QR payload', e);
    } finally {
      setLoading(false);
    }
  }, [activePatient.id, qrType]);

  useEffect(() => {
    if (activeTab === 'QR') {
      loadQRPayload();
    }
  }, [activeTab, qrType, loadQRPayload]);

  // Real counts
  const routineCount = routineList.length;
  const remindersCount = remindersList.length;
  const alarmsCount =
    remindersList.filter((r) => r.alarmEnabled).length + routineList.length;
  const familyPhotosCount = familyList.filter((f) => !!f.photoUri && f.photoUri.length > 0).length;
  const objectPhotosCount = objectList.filter((o) => !!o.photoUri && o.photoUri.length > 0).length;

  const handleNearbySync = async () => {
    setIsSyncing(true);
    try {
      const res = await proximitySyncService.syncWithNearbyDevice(activePatient.id);
      setSyncResult(res);
      await loadPatientData();
    } catch (err: any) {
      console.warn('Proximity sync error', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.mobileConstraint}>
        {/* Top Header Row */}
        <View style={styles.topHeaderRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityLabel="Go Back"
            accessibilityRole="button"
          >
            <ArrowLeft size={22} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerTitleCol}>
            <Text style={styles.headerTitleText}>Offline Sync</Text>
            <Text style={styles.headerSubtitleText}>
              Sync with <Text style={styles.boldPatient}>{activePatient.name}</Text>
            </Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setActiveTab('NEARBY');
              setSyncResult(null);
            }}
            style={[styles.tabBtn, activeTab === 'NEARBY' && styles.tabBtnActive]}
          >
            <Bluetooth
              size={18}
              color={activeTab === 'NEARBY' ? '#16A34A' : '#64748B'}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'NEARBY' && styles.tabBtnTextActive,
              ]}
            >
              Nearby Sync
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setActiveTab('QR');
              setSyncResult(null);
            }}
            style={[styles.tabBtn, activeTab === 'QR' && styles.tabBtnActive]}
          >
            <QrCode
              size={18}
              color={activeTab === 'QR' ? '#16A34A' : '#64748B'}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'QR' && styles.tabBtnTextActive,
              ]}
            >
              Offline QR Code
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {syncResult ? (
            /* Sync Complete Receipt */
            <View style={styles.successCard}>
              <View style={styles.successBadge}>
                <CheckCircle2 size={48} color="#16A34A" />
              </View>

              <Text style={styles.successTitle}>Sync Complete</Text>
              <Text style={styles.successSubtext}>
                All daily tasks, alarms, and photos updated on {activePatient.name}&apos;s device.
              </Text>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Calendar size={20} color="#059669" />
                  <Text style={styles.statValue}>{syncResult.syncedTasks}</Text>
                  <Text style={styles.statLabel}>Daily Tasks</Text>
                </View>

                <View style={styles.statCard}>
                  <Bell size={20} color="#D97706" />
                  <Text style={styles.statValue}>{syncResult.syncedAlarms}</Text>
                  <Text style={styles.statLabel}>Alarms</Text>
                </View>

                <View style={styles.statCard}>
                  <Users size={20} color="#7C3AED" />
                  <Text style={styles.statValue}>{syncResult.syncedFamilyPhotos}</Text>
                  <Text style={styles.statLabel}>Family Photos</Text>
                </View>

                <View style={styles.statCard}>
                  <Eye size={20} color="#2563EB" />
                  <Text style={styles.statValue}>{syncResult.syncedObjectPhotos}</Text>
                  <Text style={styles.statLabel}>Object Photos</Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => router.back()}
                style={styles.doneBtn}
              >
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : activeTab === 'NEARBY' ? (
            /* TAB 1: Nearby In-Range Sync */
            <View style={styles.sectionWrap}>
              {/* Device Detection Card */}
              <View style={styles.deviceStatusCard}>
                <View style={styles.deviceRadarCircle}>
                  <Radio size={32} color="#16A34A" />
                </View>
                <View style={styles.deviceInfoCol}>
                  <View style={styles.deviceRow}>
                    <Text style={styles.deviceNameText}>
                      {activePatient.name}&apos;s Phone
                    </Text>
                    <View style={styles.inRangeBadge}>
                      <Check size={12} color="#15803D" style={{ marginRight: 3 }} />
                      <Text style={styles.inRangeBadgeText}>In Range</Text>
                    </View>
                  </View>
                  <Text style={styles.deviceSubtext}>
                    Connected for offline synchronization
                  </Text>
                </View>
              </View>

              {/* Real Content Breakdown */}
              <View style={styles.payloadCard}>
                <Text style={styles.payloadTitle}>Items to Synchronize</Text>
                <View style={styles.pillList}>
                  <View style={styles.pillItem}>
                    <Calendar size={14} color="#059669" style={{ marginRight: 6 }} />
                    <Text style={styles.pillText}>{routineCount} Daily Tasks</Text>
                  </View>

                  <View style={styles.pillItem}>
                    <Bell size={14} color="#D97706" style={{ marginRight: 6 }} />
                    <Text style={styles.pillText}>{alarmsCount} Scheduled Alarms</Text>
                  </View>

                  <View style={styles.pillItem}>
                    <Users size={14} color="#7C3AED" style={{ marginRight: 6 }} />
                    <Text style={styles.pillText}>{familyPhotosCount} Family Photos</Text>
                  </View>

                  <View style={styles.pillItem}>
                    <Eye size={14} color="#2563EB" style={{ marginRight: 6 }} />
                    <Text style={styles.pillText}>{objectPhotosCount} Everyday Object Photos</Text>
                  </View>
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleNearbySync}
                disabled={isSyncing}
                style={[styles.syncActionBtn, isSyncing ? { opacity: 0.7 } : null]}
              >
                {isSyncing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 10 }} />
                ) : (
                  <Bluetooth size={22} color="#FFFFFF" style={{ marginRight: 10 }} />
                )}
                <Text style={styles.syncActionBtnText}>
                  {isSyncing ? 'Synchronizing...' : `Sync with ${activePatient.name} (1-Tap)`}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* TAB 2: QR Code */
            <View style={styles.sectionWrap}>
              <View style={styles.qrToggleBar}>
                <TouchableOpacity
                  onPress={() => setQrType('QUICK')}
                  style={[styles.qrToggleBtn, qrType === 'QUICK' && styles.qrToggleBtnActive]}
                >
                  <Text
                    style={[
                      styles.qrToggleBtnText,
                      qrType === 'QUICK' && styles.qrToggleBtnTextActive,
                    ]}
                  >
                    Tasks & Alarms QR
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setQrType('FULL')}
                  style={[styles.qrToggleBtn, qrType === 'FULL' && styles.qrToggleBtnActive]}
                >
                  <Text
                    style={[
                      styles.qrToggleBtnText,
                      qrType === 'FULL' && styles.qrToggleBtnTextActive,
                    ]}
                  >
                    Full Bundle QR
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.qrDisplayBox}>
                {loading ? (
                  <ActivityIndicator size="large" color="#16A34A" />
                ) : payloadString ? (
                  <View style={styles.qrFrame}>
                    <QRCode
                      value={payloadString}
                      size={210}
                      color="#0F172A"
                      backgroundColor="#FFFFFF"
                    />
                  </View>
                ) : null}
              </View>

              <Text style={styles.qrInstructions}>
                Open &quot;Offline QR Sync&quot; on {activePatient.name}&apos;s device and scan this QR code.
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={loadQRPayload}
                style={styles.refreshQrBtn}
              >
                <RefreshCw size={16} color="#16A34A" style={{ marginRight: 6 }} />
                <Text style={styles.refreshQrBtnText}>Refresh QR Code</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        <CaregiverBottomNavBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mobileConstraint: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitleText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 1,
  },
  boldPatient: {
    fontWeight: '700',
    color: '#16A34A',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: SPACING.md,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#16A34A',
  },
  tabBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#16A34A',
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  sectionWrap: {
    width: '100%',
  },
  deviceStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  deviceRadarCircle: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  deviceInfoCol: {
    flex: 1,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceNameText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  inRangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  inRangeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  deviceSubtext: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },
  payloadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.lg,
  },
  payloadTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
    marginBottom: SPACING.sm,
  },
  pillList: {
    gap: 8,
  },
  pillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  syncActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 16,
    borderRadius: RADIUS.xl,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  syncActionBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  qrToggleBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.full,
    padding: 4,
    marginBottom: SPACING.md,
  },
  qrToggleBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  qrToggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qrToggleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  qrToggleBtnTextActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  qrDisplayBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 260,
  },
  qrFrame: {
    padding: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    borderColor: '#86EFAC',
  },
  qrInstructions: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    lineHeight: 20,
  },
  refreshQrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: SPACING.md,
    paddingVertical: 10,
    paddingHorizontal: SPACING.lg,
    backgroundColor: '#DCFCE7',
    borderRadius: RADIUS.full,
  },
  refreshQrBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
  },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  successSubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    width: '100%',
    marginVertical: SPACING.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  doneBtn: {
    backgroundColor: '#16A34A',
    width: '100%',
    paddingVertical: 15,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
