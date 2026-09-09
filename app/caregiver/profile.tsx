import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Text, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  User,
  LogOut,
  Shield,
  Bell,
  ChevronRight,
  Plus,
  Globe,
  Check,
  CheckCircle2,
  Calendar,
  Lock,
  HeartHandshake,
} from 'lucide-react-native';
import { CaregiverTopHeader } from '../../components/caregiver/CaregiverTopHeader';
import { CaregiverBottomNavBar } from '../../components/caregiver/CaregiverBottomNavBar';
import { PatientStatusBadge } from '../../components/common/PatientStatusBadge';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { authService } from '../../services/AuthService';
import { useCaregiverStore } from '../../store/useCaregiverStore';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { INDIAN_LANGUAGES, LanguageCode } from '../../constants/translations';

export default function CaregiverProfileScreen() {
  const router = useRouter();
  const { caregiverName, patients, activePatientId, setActivePatientId } = useCaregiverStore();
  const { currentLanguage, setLanguage } = useAccessibilityStore();
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      async function verifyAuth() {
        const isAuth = await authService.isAuthenticated();
        const role = await authService.getUserRole();
        if (isMounted && (!isAuth || role !== 'CAREGIVER')) {
          router.replace('/');
        }
      }
      verifyAuth();
      return () => {
        isMounted = false;
      };
    }, [router])
  );

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to sign out of your caregiver session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await authService.clearSession();
          useCaregiverStore.setState({
            caregiverName: 'Caregiver',
            activePatientId: '',
            patients: [],
            reminders: [],
            alerts: [],
            lastSyncedTime: null,
          });
          if (router.canDismiss?.()) {
            router.dismissAll();
          }
          router.replace('/');
        },
      },
    ]);
  };

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0] || {
    id: 'p-1',
    name: 'Amma',
    relationship: 'Mother',
  };

  const currentLangLabel =
    INDIAN_LANGUAGES.find((l) => l.code === currentLanguage)?.nativeName || 'English';

  return (
    <View style={styles.outerContainer}>
      <View style={styles.mobileConstraint}>
      {/* Top Header */}
      <CaregiverTopHeader />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* -------------------------
            15. TOP PROFILE BANNER
            YAAD Caregiver
            Connected Patient: AMMA
        ------------------------- */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarWrapper}>
            <User size={32} color="#16A34A" />
          </View>
          <View style={styles.profileHeaderInfo}>
            <Text style={styles.caregiverRoleText}>YAAD Caregiver</Text>
            <Text style={styles.caregiverNameText}>{caregiverName || 'Jaswanth'}</Text>
            <Text style={styles.connectedPatientText}>
              Connected Patient:{' '}
              <Text style={styles.connectedPatientBold}>{activePatient.name}</Text>
            </Text>
          </View>
        </View>

        {/* -------------------------
            PATIENTS SECTION
            Tappable Patient Card
            + Add Another Patient
        ------------------------- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Connected Patients</Text>
        </View>

        <View style={styles.patientsList}>
          {patients.map((patient) => {
            const isActive = patient.id === (activePatientId || activePatient.id);
            return (
              <TouchableOpacity
                key={patient.id}
                activeOpacity={0.8}
                onPress={() => setActivePatientId(patient.id)}
                style={[styles.patientCard, isActive && styles.patientCardActive]}
              >
                <View style={[styles.patientAvatarCircle, isActive && styles.patientAvatarCircleActive]}>
                  <User size={22} color={isActive ? '#15803D' : '#64748B'} />
                </View>

                <View style={styles.patientCardMiddle}>
                  <Text style={styles.patientCardName}>{patient.name}</Text>
                  <Text style={styles.patientCardRelation}>{patient.relationshipType || 'Mother'}</Text>
                </View>

                <View style={styles.patientCardRight}>
                  {isActive ? (
                    <View style={styles.activePill}>
                      <CheckCircle2 size={13} color="#15803D" style={{ marginRight: 3 }} />
                      <Text style={styles.activePillText}>Active</Text>
                    </View>
                  ) : (
                    <PatientStatusBadge status="STABLE" size="sm" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/caregiver/connect-patient')}
            style={styles.addPatientBtn}
          >
            <Plus size={18} color="#16A34A" style={{ marginRight: 6 }} />
            <Text style={styles.addPatientBtnText}>+ Add Another Patient</Text>
          </TouchableOpacity>
        </View>

        {/* -------------------------
            16. ACCOUNT & SECURITY
            Grouped Settings Rows
        ------------------------- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Account & Security</Text>
        </View>

        <View style={styles.groupedSettingsCard}>
          {/* Row 1: Care Schedule & Recall Memory */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/caregiver/reminders')}
            style={styles.settingRow}
          >
            <View style={[styles.settingIconCircle, { backgroundColor: '#DCFCE7' }]}>
              <Calendar size={18} color="#15803D" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingItemTitle}>Care Schedule & Recall Memory</Text>
              <Text style={styles.settingItemSubtitle}>Manage daily routines, alarms, and family cards</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Row 2: Alert Preferences */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert('Alert Preferences', 'All care notifications and game reminder sounds are currently active.')
            }
            style={styles.settingRow}
          >
            <View style={[styles.settingIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Bell size={18} color="#B45309" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingItemTitle}>Alert Preferences</Text>
              <Text style={styles.settingItemSubtitle}>Auditory alarms and missed schedule notifications</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Row 3: Security & Active Sessions */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert('Security & Sessions', 'Your caregiver session is encrypted and securely stored on-device.')
            }
            style={styles.settingRow}
          >
            <View style={[styles.settingIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Lock size={18} color="#2563EB" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingItemTitle}>Security & Active Sessions</Text>
              <Text style={styles.settingItemSubtitle}>Single caregiver access on this verified device</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Row 4: Language */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowLanguagePicker(true)}
            style={[styles.settingRow, { borderBottomWidth: 0 }]}
          >
            <View style={[styles.settingIconCircle, { backgroundColor: '#F3E8FF' }]}>
              <Globe size={18} color="#7C3AED" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingItemTitle}>Language</Text>
              <Text style={styles.settingItemSubtitle}>{currentLangLabel}</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* -------------------------
            17. LOG OUT
            Soft red/pink container
        ------------------------- */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            <LogOut size={18} color="#DC2626" style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom clearance */}
        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Language Picker Modal */}
      <Modal visible={showLanguagePicker} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Application Language</Text>
            <ScrollView style={{ maxHeight: 300, marginVertical: SPACING.sm }}>
              {INDIAN_LANGUAGES.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => {
                      setLanguage(lang.code as LanguageCode);
                      setShowLanguagePicker(false);
                    }}
                    style={[styles.langRow, isSelected && styles.langRowActive]}
                  >
                    <View>
                      <Text style={styles.langName}>{lang.nativeName}</Text>
                      <Text style={styles.langSub}>{lang.name}</Text>
                    </View>
                    {isSelected && <Check size={18} color="#16A34A" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowLanguagePicker(false)} style={styles.closeModalBtn}>
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

        {/* Fixed Bottom Navigation */}
        <CaregiverBottomNavBar />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F7FAF8',
  },
  mobileConstraint: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: '#F7FAF8',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
  },
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8E5',
    marginVertical: SPACING.xs,
  },
  avatarWrapper: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  profileHeaderInfo: {
    flex: 1,
  },
  caregiverRoleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  caregiverNameText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginVertical: 2,
  },
  connectedPatientText: {
    fontSize: 15,
    color: '#64748B',
  },
  connectedPatientBold: {
    fontWeight: '800',
    color: '#111827',
  },
  sectionHeaderRow: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 18.5,
    fontWeight: '800',
    color: '#111827',
  },
  patientsList: {
    gap: SPACING.xs,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E2E8E5',
  },
  patientCardActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  patientAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  patientAvatarCircleActive: {
    backgroundColor: '#DCFCE7',
  },
  patientCardMiddle: {
    flex: 1,
  },
  patientCardName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  patientCardRelation: {
    fontSize: 14.5,
    color: '#64748B',
    marginTop: 2,
  },
  patientCardRight: {},
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  activePillText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#15803D',
  },
  addPatientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8E5',
    borderStyle: 'dashed',
    marginTop: 6,
  },
  addPatientBtnText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  groupedSettingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8E5',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F3',
    minHeight: 68,
  },
  settingIconCircle: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  settingItemSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  logoutContainer: {
    marginTop: SPACING.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutButtonText: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: SPACING.xs,
  },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F3',
  },
  langRowActive: {
    backgroundColor: '#F0FDF4',
    borderRadius: RADIUS.sm,
  },
  langName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  langSub: {
    fontSize: 12,
    color: '#64748B',
  },
  closeModalBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
  },
  closeModalText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
});
