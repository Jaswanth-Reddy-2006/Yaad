import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { QrCode, CheckCircle2, ArrowLeft, RefreshCw, Smartphone, WifiOff, X, Camera } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { Typography } from './Typography';
import { Button } from './Button';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { offlineProximitySync } from '../../services/sync/OfflineProximitySync';

interface OfflineSyncModalProps {
  visible: boolean;
  mode: 'CAREGIVER_SHARE' | 'PATIENT_RECEIVE';
  onClose: () => void;
  onSuccess?: () => void;
}

export function OfflineSyncModal({ visible, mode, onClose, onSuccess }: OfflineSyncModalProps) {
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const [payloadString, setPayloadString] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [manualCodeInput, setManualCodeInput] = useState('');

  useEffect(() => {
    if (visible && mode === 'CAREGIVER_SHARE') {
      loadCaregiverPayload();
    }
    if (!visible) {
      setSyncStatus(null);
      setManualCodeInput('');
    }
  }, [visible, mode]);

  const loadCaregiverPayload = async () => {
    setLoading(true);
    try {
      const payload = await offlineProximitySync.generatePayload();
      setPayloadString(payload);
    } catch (err) {
      console.warn('Failed to generate offline payload', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPayload = async (raw: string) => {
    setLoading(true);
    try {
      const res = await offlineProximitySync.ingestPayload(raw);
      if (res.success) {
        setSyncStatus(res.message);
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
                  ? t('offline_sync_caregiver') || 'Offline Proximity Sync (QR)'
                  : t('offline_sync_patient') || 'Receive Offline Updates'}
              </Typography>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Info Notice */}
            <View style={styles.infoBanner}>
              <Typography size="xs" color="#1E293B" style={{ lineHeight: 18 }}>
                {mode === 'CAREGIVER_SHARE'
                  ? 'No internet connection needed. Show this QR code to the patient to instantly update their routine, reminders, and game alarms offline.'
                  : 'Scan the Caregiver’s Offline Sync QR code to receive your latest daily routine, hospital appointments, and game times.'}
              </Typography>
            </View>

            {syncStatus ? (
              <View style={styles.successBox}>
                <CheckCircle2 size={32} color="#15803D" style={{ marginBottom: 6 }} />
                <Typography size="sm" weight="bold" color="#15803D" align="center">
                  {syncStatus}
                </Typography>
                <Button
                  title={t('done') || 'Done'}
                  variant="primary"
                  onPress={onClose}
                  style={{ marginTop: SPACING.md, width: '100%' }}
                />
              </View>
            ) : mode === 'CAREGIVER_SHARE' ? (
              /* Caregiver Mode: Displays the QR Code */
              <View style={styles.qrSection}>
                {payloadString ? (
                  <View style={styles.qrWrapper}>
                    <QRCode
                      value={payloadString}
                      size={200}
                      color="#0F172A"
                      backgroundColor="#FFFFFF"
                    />
                  </View>
                ) : (
                  <Typography size="sm" color={COLORS.textMuted}>
                    Generating offline payload...
                  </Typography>
                )}

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={loadCaregiverPayload}
                  style={styles.refreshBtn}
                >
                  <RefreshCw size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Typography size="xs" weight="bold" color={COLORS.primary}>
                    {t('refresh_qr') || 'Refresh QR Payload'}
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
    maxWidth: 420,
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
  scrollContent: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  infoBanner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    width: '100%',
    marginBottom: SPACING.md,
  },
  qrSection: {
    alignItems: 'center',
    width: '100%',
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  manualInput: {
    backgroundColor: '#F8FAF8',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: SPACING.sm,
    height: 70,
    fontSize: 12,
    textAlignVertical: 'top',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    width: '100%',
  },
});
