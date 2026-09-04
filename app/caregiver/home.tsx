import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Bell, AlertTriangle, CheckCircle2, ChevronRight, Plus, User, WifiOff, Activity, Clock } from 'lucide-react-native';
import { Typography } from '../../components/common/Typography';
import { AppLogo } from '../../components/common/AppLogo';
import { CaregiverBottomNavBar } from '../../components/caregiver/CaregiverBottomNavBar';
import { ActivePatientSwitcher } from '../../components/caregiver/ActivePatientSwitcher';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { useCaregiverStore } from '../../store/useCaregiverStore';

export default function CaregiverHomeScreen() {
  const router = useRouter();
  const { t } = useAccessibilityStore();
  const {
    caregiverName,
    activePatientId,
    patients,
    alerts,
    reminders,
    isOfflineMode,
    lastSyncedTime,
    fetchDashboardData
  } = useCaregiverStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];

  const activePatientAlerts = activePatient
    ? alerts.filter((a) => (!a.isResolved && a.patientId === activePatient.id) || (!a.isResolved && a.patientName === activePatient.name))
    : [];

  const activePatientReminders = activePatient
    ? reminders.filter((r) => r.patientId === activePatient.id)
    : [];

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16A34A']} />}
      >
        {/* Top Header Row with Active Patient Switcher */}
        <View style={styles.topHeaderRow}>
          <AppLogo size="normal" />
          <ActivePatientSwitcher />
        </View>

        {/* Greeting Banner & Active Patient Identity */}
        <View style={styles.greetingSection}>
          <Typography size="xxl" weight="bold" color="#0F172A">
            Good Morning, {caregiverName}
          </Typography>
          {activePatient ? (
            <Typography size="xs" color="#64748B" style={{ marginTop: 2 }}>
              Currently viewing care workspace for <Typography size="xs" weight="bold" color="#16A34A">{activePatient.name}</Typography>
            </Typography>
          ) : (
            <Typography size="xs" color="#64748B" style={{ marginTop: 2 }}>
              No active patient connected. Pair with a patient to begin.
            </Typography>
          )}

          {isOfflineMode && (
            <View style={styles.offlinePill}>
              <WifiOff size={12} color="#D97706" style={{ marginRight: 4 }} />
              <Typography size="xs" color="#D97706" weight="bold">
                Offline Mode • Cached {lastSyncedTime || 'Data'}
              </Typography>
            </View>
          )}
        </View>

        {activePatient ? (
          <>
            {/* Active Patient Summary Card */}
            <View style={styles.atAGlanceCard}>
              <Typography size="xs" weight="bold" color="#64748B" style={{ letterSpacing: 0.5 }}>
                {activePatient.name.toUpperCase()}'S DAILY OVERVIEW
              </Typography>
              <View style={styles.glanceRow}>
                <View style={styles.glanceItem}>
                  <Typography size="xl" weight="bold" color="#16A34A">
                    {activePatient.activitiesDone}
                  </Typography>
                  <Typography size="xs" color="#64748B" style={{ marginTop: 2 }}>
                    Activities
                  </Typography>
                </View>

                <View style={styles.glanceDivider} />

                <View style={styles.glanceItem}>
                  <Typography size="xl" weight="bold" color="#2563EB">
                    {activePatientReminders.filter((r) => r.status === 'COMPLETED').length} / {activePatientReminders.length || 1}
                  </Typography>
                  <Typography size="xs" color="#64748B" style={{ marginTop: 2 }}>
                    Reminders
                  </Typography>
                </View>

                <View style={styles.glanceDivider} />

                <View style={styles.glanceItem}>
                  <Typography size="xl" weight="bold" color="#D97706">
                    {activePatient.mood}
                  </Typography>
                  <Typography size="xs" color="#64748B" style={{ marginTop: 2 }}>
                    Mood Check
                  </Typography>
                </View>

                <View style={styles.glanceDivider} />

                <View style={styles.glanceItem}>
                  <Typography size="xl" weight="bold" color="#DC2626">
                    {activePatientAlerts.length}
                  </Typography>
                  <Typography size="xs" color="#64748B" style={{ marginTop: 2 }}>
                    Alerts
                  </Typography>
                </View>
              </View>
            </View>

            {/* Active Patient Status Card */}
            <View style={styles.patientsSummaryCard}>
              <View style={styles.summaryLeft}>
                <View style={[styles.avatarCircle, { backgroundColor: activePatient.avatarBg || '#DCFCE7' }]}>
                  <User size={26} color="#0F172A" />
                </View>
                <View style={{ marginLeft: SPACING.md }}>
                  <Typography size="base" weight="bold" color="#0F172A">
                    {activePatient.name}
                  </Typography>
                  <Typography size="xs" color="#16A34A" weight="bold" style={{ marginTop: 2 }}>
                    {activePatient.activityStatus}
                  </Typography>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/caregiver/patient-detail', params: { patientId: activePatient.id } })}
                style={styles.viewAllPill}
              >
                <Typography size="xs" weight="bold" color="#64748B" style={{ marginRight: 4 }}>
                  Details
                </Typography>
                <ChevronRight size={14} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Actionable Attention Required Feed */}
            <View style={styles.sectionHeader}>
              <Typography size="base" weight="bold" color="#0F172A">
                ATTENTION REQUIRED ({activePatient.name.toUpperCase()})
              </Typography>
            </View>

            <View style={styles.highlightsContainer}>
              {activePatientAlerts.length > 0 ? (
                activePatientAlerts.map((alert) => (
                  <View
                    key={alert.id}
                    style={[
                      styles.highlightCard,
                      alert.severity === 'CRITICAL' || alert.severity === 'WARNING'
                        ? { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }
                        : null
                    ]}
                  >
                    <View style={alert.severity === 'CRITICAL' || alert.severity === 'WARNING' ? styles.highlightIconRed : styles.highlightIconGreen}>
                      <AlertTriangle size={18} color={alert.severity === 'CRITICAL' || alert.severity === 'WARNING' ? '#DC2626' : '#16A34A'} />
                    </View>
                    <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                      <Typography size="sm" weight="bold" color={alert.severity === 'CRITICAL' || alert.severity === 'WARNING' ? '#991B1B' : '#0F172A'}>
                        {alert.title}
                      </Typography>
                      <Typography size="xs" color={alert.severity === 'CRITICAL' || alert.severity === 'WARNING' ? '#991B1B' : '#64748B'} style={{ marginTop: 2 }}>
                        {alert.message} • {alert.timestamp}
                      </Typography>
                    </View>
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: '/caregiver/patient-detail', params: { patientId: activePatient.id } })}
                      style={styles.viewAlertBtn}
                    >
                      <Typography size="xs" weight="bold" color="#DC2626">
                        Inspect
                      </Typography>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.emptyAttentionBox}>
                  <CheckCircle2 size={24} color="#16A34A" />
                  <Typography size="sm" weight="medium" color="#64748B" style={{ marginLeft: 8 }}>
                    Everything looks good for {activePatient.name}. No urgent alerts.
                  </Typography>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyNoPatientCard}>
            <Users size={48} color="#94A3B8" />
            <Typography size="lg" weight="bold" color="#0F172A" align="center" style={{ marginTop: SPACING.md }}>
              No Connected Patient
            </Typography>
            <Typography size="sm" color="#64748B" align="center" style={{ marginTop: 4 }}>
              Pair with a patient using a 6-character connection code or QR code to view real-time care data.
            </Typography>
          </View>
        )}

        {/* Primary Action Button: Add New Patient Connection */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/caregiver/connect-patient')}
          style={styles.addPatientBtn}
        >
          <Plus size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Typography size="base" weight="bold" color="#FFFFFF">
            Add New Patient Connection
          </Typography>
        </TouchableOpacity>
      </ScrollView>

      {/* Caregiver 4-Tab Floating Bottom Navigation */}
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
  greetingSection: {
    marginVertical: SPACING.md,
  },
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginTop: 6
  },
  atAGlanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  glanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: SPACING.sm,
  },
  glanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  glanceDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  emptyAttentionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyNoPatientCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginVertical: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  patientsSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.md,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  sectionHeader: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  highlightsContainer: {
    gap: SPACING.xs,
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  highlightIconGreen: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightIconRed: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAlertBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  addPatientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.lg,
    height: 52,
  },
});
