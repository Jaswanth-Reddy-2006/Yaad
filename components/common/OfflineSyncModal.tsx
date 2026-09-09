import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import {
  QrCode,
  CheckCircle2,
  RefreshCw,
  WifiOff,
  X,
  Camera,
  Bluetooth,
  Radio,
  Bell,
  Calendar,
  Users,
  Eye,
  Check,
} from 'lucide-react-native';
import { SafeQRCode } from './SafeQRCode';
import { Typography } from './Typography';
import { Button } from './Button';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { offlineProximitySync } from '../../services/sync/OfflineProximitySync';
import { proximitySyncService } from '../../services/sync/ProximitySyncService';
import { ProximityDevice, ProximitySyncResult, ProximitySyncState } from '../../types';

interface OfflineSyncModalProps {
  visible: boolean;
  mode: 'CAREGIVER_SHARE' | 'PATIENT_RECEIVE';
  onClose: () => void;
  onSuccess?: () => void;
  patientName?: string;
}

export function OfflineSyncModal({
  visible,
  mode,
  onClose,
  onSuccess,
  patientName = 'Amma',
}: OfflineSyncModalProps) {
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  // Active Tab: 'NEARBY' | 'QR'
  const [activeTab, setActiveTab] = useState<'NEARBY' | 'QR'>('NEARBY');

  const [payloadString, setPayloadString] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<ProximitySyncResult | null>(null);

  // Proximity Sync state
  const [proximityState, setProximityState] = useState<ProximitySyncState>('IDLE');
  const [nearbyDevice, setNearbyDevice] = useState<ProximityDevice | null>(null);

  useEffect(() => {
    if (!visible) {
      setSyncStatus(null);
      proximitySyncService.stopScanning();
      return;
    }

    // Subscribe to proximity changes
    const unsubscribe = proximitySyncService.subscribe((state) => {
      setProximityState(state.status);
      setNearbyDevice(state.nearbyDevice);
    });

    // Start auto-scanning for nearby patient device
    proximitySyncService.startScanning(patientName);

    if (mode === 'CAREGIVER_SHARE') {
      loadCaregiverPayload();
    }

    return () => {
      unsubscribe();
      proximitySyncService.stopScanning();
    };
  }, [visible, mode, patientName]);

  const loadCaregiverPayload = async () => {
    setLoading(true);
    try {
      const payload = await offlineProximitySync.generateQuickQRPayload();
      setPayloadString(payload);
    } catch (err) {
      console.warn('Failed to generate offline payload', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNearbySyncNow = async () => {
    setLoading(true);
    try {
      const res = await proximitySyncService.syncWithNearbyDevice();
      setSyncStatus(res);
      if (res.success) {
        onSuccess?.();
      }
    } catch (err: any) {
      Alert.alert('Sync Error', err?.message || 'Proximity synchronization failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPayload = async (raw: string) => {
    setLoading(true);
    try {
      const res = await offlineProximitySync.ingestPayload(raw);
      setSyncStatus(res);
      if (res.success) {
        onSuccess?.();
      } else {
        Alert.alert('Sync Failed', res.message);
      }
    } catch (err: any) {
      Alert.alert('Sync Error', err?.message || 'Could not process data');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalContainer, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleWithIcon}>
              <WifiOff size={22} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Typography size="lg" weight="bold" color="#0F172A">
                {mode === 'CAREGIVER_SHARE'
                  ? 'Offline Proximity Sync'
                  : t('offline_sync_patient') || 'Receive Offline Updates'}
              </Typography>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close">
              <X size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Mode Switcher Tabs for Caregiver */}
          {mode === 'CAREGIVER_SHARE' && (
            <View style={styles.tabBar}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveTab('NEARBY')}
                style={[styles.tabBtn, activeTab === 'NEARBY' && styles.tabBtnActive]}
              >
                <Bluetooth size={16} color={activeTab === 'NEARBY' ? '#16A34A' : '#64748B'} style={{ marginRight: 6 }} />
                <Typography
                  size="sm"
                  weight={activeTab === 'NEARBY' ? 'bold' : 'medium'}
                  color={activeTab === 'NEARBY' ? '#16A34A' : '#64748B'}
                >
                  Nearby In-Range Sync
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setActiveTab('QR');
                  loadCaregiverPayload();
                }}
                style={[styles.tabBtn, activeTab === 'QR' && styles.tabBtnActive]}
              >
                <QrCode size={16} color={activeTab === 'QR' ? '#16A34A' : '#64748B'} style={{ marginRight: 6 }} />
                <Typography
                  size="sm"
                  weight={activeTab === 'QR' ? 'bold' : 'medium'}
                  color={activeTab === 'QR' ? '#16A34A' : '#64748B'}
                >
                  Offline QR Code
                </Typography>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {syncStatus ? (
              /* Success Celebration & Receipt Breakdown */
              <View style={styles.successBox}>
                <View style={styles.successIconBadge}>
                  <CheckCircle2 size={40} color="#16A34A" />
                </View>
                <Typography size="lg" weight="bold" color="#0F172A" align="center" style={{ marginTop: 10 }}>
                  Sync Complete!
                </Typography>
                <Typography size="xs" color="#64748B" align="center" style={{ marginTop: 4, marginBottom: 14 }}>
                  All tasks, alarms, and recall photos synced with {nearbyDevice?.name || patientName} without internet.
                </Typography>

                {/* Stat Grid */}
                <View style={styles.receiptGrid}>
                  <View style={styles.receiptCard}>
                    <Calendar size={18} color="#059669" />
                    <Typography size="base" weight="bold" color="#0F172A" style={{ marginTop: 4 }}>
                      {syncStatus.syncedTasks}
                    </Typography>
                    <Typography size="xs" color="#64748B">
                      Daily Tasks
                    </Typography>
                  </View>

                  <View style={styles.receiptCard}>
                    <Bell size={18} color="#D97706" />
                    <Typography size="base" weight="bold" color="#0F172A" style={{ marginTop: 4 }}>
                      {syncStatus.syncedAlarms}
                    </Typography>
                    <Typography size="xs" color="#64748B">
                      Alarms Active
                    </Typography>
                  </View>

                  <View style={styles.receiptCard}>
                    <Users size={18} color="#7C3AED" />
                    <Typography size="base" weight="bold" color="#0F172A" style={{ marginTop: 4 }}>
                      {syncStatus.syncedFamilyPhotos}
                    </Typography>
                    <Typography size="xs" color="#64748B">
                      Family Photos
                    </Typography>
                  </View>

                  <View style={styles.receiptCard}>
                    <Eye size={18} color="#2563EB" />
                    <Typography size="base" weight="bold" color="#0F172A" style={{ marginTop: 4 }}>
                      {syncStatus.syncedObjectPhotos}
                    </Typography>
                    <Typography size="xs" color="#64748B">
                      Object Photos
                    </Typography>
                  </View>
                </View>

                <Button
                  title="Done"
                  variant="primary"
                  onPress={onClose}
                  style={{ marginTop: SPACING.lg, width: '100%' }}
                />
              </View>
            ) : activeTab === 'NEARBY' && mode === 'CAREGIVER_SHARE' ? (
              /* TAB 1: Nearby Bluetooth / Proximity In-Range Sync */
              <View style={styles.nearbySection}>
                {/* Radar / Signal Card */}
                <View style={styles.radarCard}>
                  <View style={styles.radarIconWrapper}>
                    <Radio size={36} color="#16A34A" />
                  </View>
                  <View style={styles.radarInfo}>
                    <View style={styles.radarHeaderRow}>
                      <Typography size="base" weight="bold" color="#0F172A">
                        {nearbyDevice ? nearbyDevice.name : `Scanning for ${patientName}...`}
                      </Typography>
                      <View style={styles.inRangeBadge}>
                        <Check size={12} color="#15803D" style={{ marginRight: 3 }} />
                        <Typography size="xs" weight="bold" color="#15803D">
                          In Range
                        </Typography>
                      </View>
                    </View>

                    <Typography size="xs" color="#475569" style={{ marginTop: 4 }}>
                      Estimated Distance: <Typography size="xs" weight="bold" color="#0F172A">{nearbyDevice?.distanceMeters || 1.2}m</Typography> • Signal: <Typography size="xs" weight="bold" color="#0F172A">{nearbyDevice?.rssi || -48} dBm (Strong)</Typography>
                    </Typography>
                    <Typography size="xs" color="#64748B" style={{ marginTop: 2 }}>
                      Direct local peer transfer • Zero mobile data required
                    </Typography>
                  </View>
                </View>

                {/* Items to Sync Summary Pill List */}
                <View style={styles.itemsToSyncBox}>
                  <Typography size="xs" weight="bold" color="#334155" style={{ marginBottom: 8 }}>
                    Payload includes:
                  </Typography>
                  <View style={styles.pillsRow}>
                    <View style={styles.itemPill}>
                      <Calendar size={13} color="#059669" style={{ marginRight: 4 }} />
                      <Typography size="xs" color="#0F172A">6 Daily Tasks</Typography>
                    </View>
                    <View style={styles.itemPill}>
                      <Bell size={13} color="#D97706" style={{ marginRight: 4 }} />
                      <Typography size="xs" color="#0F172A">Med & Game Alarms</Typography>
                    </View>
                    <View style={styles.itemPill}>
                      <Users size={13} color="#7C3AED" style={{ marginRight: 4 }} />
                      <Typography size="xs" color="#0F172A">Family Photos</Typography>
                    </View>
                    <View style={styles.itemPill}>
                      <Eye size={13} color="#2563EB" style={{ marginRight: 4 }} />
                      <Typography size="xs" color="#0F172A">Everyday Object Photos</Typography>
                    </View>
                  </View>
                </View>

                {/* Sync Action Button */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleNearbySyncNow}
                  disabled={loading}
                  style={styles.bigSyncActionBtn}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  ) : (
                    <Bluetooth size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  )}
                  <Typography size="base" weight="bold" color="#FFFFFF">
                    {loading ? 'Transmitting to Patient...' : 'Sync Everything (1-Tap)'}
                  </Typography>
                </TouchableOpacity>
              </View>
            ) : mode === 'CAREGIVER_SHARE' ? (
              /* TAB 2: Offline QR Code Share */
              <View style={styles.qrSection}>
                {loading ? (
                  <View style={styles.qrLoadingBox}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Typography size="xs" color="#64748B" style={{ marginTop: 8 }}>
                      Generating QR code...
                    </Typography>
                  </View>
                ) : payloadString ? (
                  <View style={styles.qrWrapper}>
                    <SafeQRCode
                      value={payloadString}
                      size={190}
                      color="#0F172A"
                      backgroundColor="#FFFFFF"
                    />
                  </View>
                ) : null}

                <Typography size="xs" color="#64748B" align="center" style={{ marginTop: 12, paddingHorizontal: 8 }}>
                  Ask the patient to open &quot;Offline QR Sync&quot; and point their camera at this screen.
                </Typography>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={loadCaregiverPayload}
                  style={styles.refreshBtn}
                >
                  <RefreshCw size={14} color="#16A34A" style={{ marginRight: 6 }} />
                  <Typography size="xs" weight="bold" color="#16A34A">
                    Refresh QR Code
                  </Typography>
                </TouchableOpacity>
              </View>
            ) : (
              /* Patient Mode: Ingests the QR Code */
              <View style={styles.receiveSection}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={async () => {
                    const mockPayload = await offlineProximitySync.generatePayload();
                    await handleApplyPayload(mockPayload);
                  }}
                  style={styles.scanActionBtn}
                >
                  <Camera size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Typography size="base" weight="bold" color="#FFFFFF">
                    {t('scan_caregiver_qr') || 'Scan Caregiver QR Code'}
                  </Typography>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F9',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: SPACING.md,
    paddingTop: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#16A34A',
  },
  scrollContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  nearbySection: {
    width: '100%',
    alignItems: 'center',
  },
  radarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  radarIconWrapper: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  radarInfo: {
    flex: 1,
  },
  radarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inRangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  itemsToSyncBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.lg,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  itemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  bigSyncActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    width: '100%',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  qrSection: {
    alignItems: 'center',
    width: '100%',
  },
  qrTypeToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.full,
    padding: 3,
    marginBottom: SPACING.md,
  },
  qrTypeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
  },
  qrTypeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qrLoadingBox: {
    height: 190,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrWrapper: {
    padding: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: '#86EFAC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#DCFCE7',
    borderRadius: RADIUS.full,
  },
  receiveSection: {
    width: '100%',
  },
  scanActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    width: '100%',
  },
  successIconBadge: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
    marginTop: SPACING.sm,
  },
  receiptCard: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
