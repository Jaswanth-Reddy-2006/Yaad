import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { User, LogOut, Shield, Bell, HeartHandshake, ChevronRight, Users, Plus, Link2Off, Globe, Check } from 'lucide-react-native';
import { Typography } from '../../components/common/Typography';
import { CaregiverBottomNavBar } from '../../components/caregiver/CaregiverBottomNavBar';
import { ActivePatientSwitcher } from '../../components/caregiver/ActivePatientSwitcher';
import { AppLogo } from '../../components/common/AppLogo';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { authService } from '../../services/AuthService';
import { useCaregiverStore } from '../../store/useCaregiverStore';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { INDIAN_LANGUAGES, LanguageCode } from '../../constants/translations';

export default function CaregiverProfileScreen() {
  const router = useRouter();
  const { caregiverName, patients } = useCaregiverStore();
  const { currentLanguage, setLanguage, t } = useAccessibilityStore();
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
  };

  const handleRemoveConnection = (patientId: string, patientName: string) => {
    Alert.alert(
      'Remove Connection',
      `Are you sure you want to remove access for ${patientName}? Patient account records will remain preserved on MitraCare servers.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove Connection',
          style: 'destructive',
          onPress: () => {
            useCaregiverStore.setState((state) => {
              const updatedPatients = state.patients.filter((p) => p.id !== patientId);
              return {
                patients: updatedPatients,
                activePatientId: state.activePatientId === patientId ? (updatedPatients[0]?.id || '') : state.activePatientId
              };
            });
            Alert.alert('Connection Revoked', `Caregiver relationship for ${patientName} has been revoked.`);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header Row with Active Patient Switcher */}
        <View style={styles.topHeaderRow}>
          <AppLogo size="normal" />
          <ActivePatientSwitcher />
        </View>

        {/* User Profile Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <User size={40} color="#16A34A" />
          </View>
          <Typography size="xl" weight="bold" color="#0F172A" style={{ marginTop: SPACING.sm }}>
            {caregiverName}
          </Typography>
          <Typography size="xs" color="#64748B" style={{ marginTop: 2 }}>
            Registered Caregiver • Single Account Access
          </Typography>
        </View>

        {/* Section: Manage Connected Patients */}
        <Typography size="sm" weight="bold" color="#0F172A" style={{ marginBottom: SPACING.xs, marginLeft: 4 }}>
          MANAGE CONNECTED PATIENTS ({patients.length})
        </Typography>

        <View style={styles.patientsCard}>
          {patients.map((patient) => (
            <View key={patient.id} style={styles.patientRow}>
              <View style={[styles.patientAvatar, { backgroundColor: patient.avatarBg || '#DCFCE7' }]}>
                <User size={20} color="#0F172A" />
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <Typography size="sm" weight="bold" color="#0F172A">
                  {patient.name}
                </Typography>
                <Typography size="xs" color="#64748B">
                  {patient.relationshipType || 'Family Member'} • {patient.status}
                </Typography>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveConnection(patient.id, patient.name)}
                style={styles.removeConnBtn}
              >
                <Link2Off size={16} color="#DC2626" style={{ marginRight: 4 }} />
                <Typography size="xs" weight="bold" color="#DC2626">
                  Remove
                </Typography>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            onPress={() => router.push('/caregiver/connect-patient')}
            style={styles.addPatientRowBtn}
          >
            <Plus size={18} color="#16A34A" style={{ marginRight: 6 }} />
            <Typography size="sm" weight="bold" color="#16A34A">
              Connect Another Patient
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Options List */}
        <Typography size="sm" weight="bold" color="#0F172A" style={{ marginVertical: SPACING.xs, marginLeft: 4 }}>
          ACCOUNT & SECURITY
        </Typography>
        <View style={styles.optionsContainer}>
          <TouchableOpacity activeOpacity={0.8} style={styles.optionItem}>
            <HeartHandshake size={20} color="#16A34A" style={{ marginRight: SPACING.md }} />
            <Typography size="base" weight="semibold" color="#0F172A" style={{ flex: 1 }}>
              Caregiver Settings
            </Typography>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={styles.optionItem}>
            <Bell size={20} color="#2563EB" style={{ marginRight: SPACING.md }} />
            <Typography size="base" weight="semibold" color="#0F172A" style={{ flex: 1 }}>
              Alert Preferences
            </Typography>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={styles.optionItem}>
            <Shield size={20} color="#8B5CF6" style={{ marginRight: SPACING.md }} />
            <Typography size="base" weight="semibold" color="#0F172A" style={{ flex: 1 }}>
              Security & Active Sessions
            </Typography>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Language Selector Row */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowLanguagePicker(!showLanguagePicker)}
            style={styles.optionItem}
          >
            <Globe size={20} color="#059669" style={{ marginRight: SPACING.md }} />
            <View style={{ flex: 1 }}>
              <Typography size="base" weight="semibold" color="#0F172A">
                {t('language') || 'Language'}
              </Typography>
              <Typography size="xs" color="#64748B">
                {INDIAN_LANGUAGES.find((l) => l.code === currentLanguage)?.nativeName || 'English'} ({INDIAN_LANGUAGES.find((l) => l.code === currentLanguage)?.name || 'English'})
              </Typography>
            </View>
            <ChevronRight
              size={18}
              color="#94A3B8"
              style={{ transform: [{ rotate: showLanguagePicker ? '90deg' : '0deg' }] }}
            />
          </TouchableOpacity>

          {showLanguagePicker && (
            <View style={styles.languageDropdown}>
              <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled showsVerticalScrollIndicator={true}>
                {INDIAN_LANGUAGES.map((lang) => {
                  const isSelected = currentLanguage === lang.code;
                  return (
                    <TouchableOpacity
                      key={lang.code}
                      activeOpacity={0.7}
                      onPress={() => {
                        setLanguage(lang.code as LanguageCode);
                        setShowLanguagePicker(false);
                      }}
                      style={[
                        styles.langPickerRow,
                        isSelected && { backgroundColor: '#DCFCE7' },
                      ]}
                    >
                      <Typography
                        size="sm"
                        weight={isSelected ? 'bold' : 'regular'}
                        color={isSelected ? '#15803D' : '#0F172A'}
                        style={{ flex: 1 }}
                      >
                        {lang.nativeName} ({lang.name})
                      </Typography>
                      {isSelected && <Check size={16} color="#15803D" />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity activeOpacity={0.85} onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut size={20} color="#DC2626" style={{ marginRight: 8 }} />
          <Typography size="base" weight="bold" color="#DC2626">
            Log Out
          </Typography>
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Caregiver Navigation */}
      <CaregiverBottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: RADIUS.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#86EFAC',
  },
  patientsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  patientAvatar: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeConnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  addPatientRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    marginTop: 10,
  },
  optionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  languageDropdown: {
    backgroundColor: '#F8FAF8',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  langPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginVertical: 2,
  },
});
