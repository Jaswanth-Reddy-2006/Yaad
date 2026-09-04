import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, User, CheckCircle2, TrendingUp, MessageSquare, FileText, Activity, Brain, Clock, ShieldCheck, Calendar } from 'lucide-react-native';
import { Typography } from '../../components/common/Typography';
import { CaregiverBottomNavBar } from '../../components/caregiver/CaregiverBottomNavBar';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useCaregiverStore } from '../../store/useCaregiverStore';

export default function PatientDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const patientId = (params.patientId as string) || 'p-1';

  const patients = useCaregiverStore((state) => state.patients);
  const reminders = useCaregiverStore((state) => state.reminders);

  const patient = patients.find((p) => p.id === patientId) || patients[0] || {
    id: '',
    name: 'Patient',
    activityStatus: 'Activity: Stable',
    status: 'Connected',
    activitiesDone: '0/6',
    mood: 'Good',
    lastActive: 'Today',
    avatarBg: '#FEF3C7'
  };

  const [liveOverview, setLiveOverview] = useState<any>(null);
  const [liveAnalytics, setLiveAnalytics] = useState<any>(null);

  React.useEffect(() => {
    if (!patient.id) return;
    let isMounted = true;
    async function fetchDetailData() {
      try {
        const [oRes, aRes] = await Promise.all([
          fetch(`http://localhost:8000/api/v1/caregiver/patients/${patient.id}/overview`),
          fetch(`http://localhost:8000/api/v1/caregiver/patients/${patient.id}/analytics`)
        ]);
        if (isMounted) {
          if (oRes.ok) setLiveOverview(await oRes.json());
          if (aRes.ok) setLiveAnalytics(await aRes.json());
        }
      } catch (err) {}
    }
    fetchDetailData();
    return () => { isMounted = false; };
  }, [patient.id]);

  const patientReminders = reminders.filter((r) => r.patientId === patient.id);

  const [activeTab, setActiveTab] = useState<'Overview' | 'Activities' | 'Reminders' | 'Care Plan'>('Overview');
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header Row */}
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backSquareBtn}>
            <ArrowLeft size={22} color="#0F172A" />
          </TouchableOpacity>

          <View style={styles.headerPatientInfo}>
            <View style={[styles.avatarCircleSmall, { backgroundColor: patient.avatarBg || '#FEF3C7' }]}>
              <User size={24} color="#0F172A" />
            </View>
            <View style={{ marginLeft: SPACING.xs, flex: 1 }}>
              <Typography size="base" weight="bold" color="#0F172A">
                {patient.name}
              </Typography>
              <Typography size="xs" color="#64748B">
                {patient.activityStatus}
              </Typography>
            </View>
          </View>

          <View style={styles.connectedBadge}>
            <CheckCircle2 size={12} color="#16A34A" style={{ marginRight: 3 }} />
            <Typography size="xs" weight="bold" color="#16A34A">
              Connected
            </Typography>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabsRow}>
          {(['Overview', 'Activities', 'Reminders', 'Care Plan'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabPill, isActive ? styles.activeTabPill : null]}
              >
                <Typography
                  size="xs"
                  weight={isActive ? 'bold' : 'medium'}
                  color={isActive ? '#FFFFFF' : '#64748B'}
                >
                  {tab}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab 1: Overview */}
        {activeTab === 'Overview' && (
          <>
            <Typography size="base" weight="bold" color="#0F172A" style={{ marginTop: SPACING.xs }}>
              Today's Activity Status
            </Typography>

            <View style={styles.statusGrid}>
              <View style={styles.statusTile}>
                <Typography size="xs" color="#64748B">
                  Games Completed
                </Typography>
                <Typography size="xxl" weight="bold" color="#0F172A" style={{ marginTop: 4 }}>
                  {liveOverview?.today_status?.games_played || patient.activitiesDone || '0/6'}
                </Typography>
              </View>

              <View style={styles.statusTile}>
                <Typography size="xs" color="#64748B">
                  Accuracy vs Baseline
                </Typography>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
                  <Typography size="xxl" weight="bold" color="#16A34A">
                    {liveOverview?.today_status?.activity_accuracy || '100%'}
                  </Typography>
                </View>
              </View>

              <View style={styles.statusTile}>
                <Typography size="xs" color="#64748B">
                  Self-Reported Mood
                </Typography>
                <Typography size="lg" weight="bold" color="#16A34A" style={{ marginTop: 4 }}>
                  {liveOverview?.today_status?.mood || patient.mood || 'Good'}
                </Typography>
              </View>

              <View style={styles.statusTile}>
                <Typography size="xs" color="#64748B">
                  Last Active Time
                </Typography>
                <Typography size="lg" weight="bold" color="#0F172A" style={{ marginTop: 4 }}>
                  {liveOverview?.today_status?.last_active || patient.lastActive || 'Today'}
                </Typography>
              </View>
            </View>

            {/* Non-Diagnostic Activity Baseline Comparison */}
            <View style={styles.trendCard}>
              <View style={styles.trendCardHeader}>
                <Typography size="sm" weight="bold" color="#0F172A">
                  7-Day Activity Trend vs Baseline
                </Typography>
                <View style={styles.improvingBadge}>
                  <Typography size="xs" weight="bold" color="#16A34A">
                    Stable Trend
                  </Typography>
                </View>
              </View>
              <Typography size="xs" color="#64748B" style={{ marginTop: 4 }}>
                Observed application activity is 4% higher than recent 30-day baseline (74%).
              </Typography>

              <View style={styles.chartArea}>
                <View style={styles.chartLinePointContainer}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                    <View key={day} style={styles.chartColumn}>
                      <View style={[styles.chartBarFill, { height: `${52 + idx * 6}%` }]} />
                      <Typography size="xs" color="#94A3B8" style={{ marginTop: 4 }}>
                        {day}
                      </Typography>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}

        {/* Tab 2: Activities */}
        {activeTab === 'Activities' && (
          <View style={{ gap: SPACING.xs, marginTop: SPACING.xs }}>
            <Typography size="base" weight="bold" color="#0F172A">
              Recorded Cognitive Sessions
            </Typography>
            <View style={styles.activityItem}>
              <View style={styles.activityIconCircleGreen}>
                <Brain size={18} color="#16A34A" />
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <Typography size="sm" weight="bold" color="#0F172A">
                  Match Pair Memory Game
                </Typography>
                <Typography size="xs" color="#64748B">
                  Domain: Memory • Score: 85% • Time: 3m 20s
                </Typography>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityIconCircleGreen}>
                <Activity size={18} color="#2563EB" />
              </View>
              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <Typography size="sm" weight="bold" color="#0F172A">
                  Topic Talk Voice Activity
                </Typography>
                <Typography size="xs" color="#64748B">
                  Domain: Recall • Completed 3 voice prompts
                </Typography>
              </View>
            </View>
          </View>
        )}

        {/* Tab 3: Reminders */}
        {activeTab === 'Reminders' && (
          <View style={{ gap: SPACING.xs, marginTop: SPACING.xs }}>
            <Typography size="base" weight="bold" color="#0F172A">
              Scheduled Care Reminders ({patientReminders.length})
            </Typography>
            {patientReminders.map((rem) => (
              <View key={rem.id} style={styles.activityItem}>
                <View style={styles.activityIconCircleBlue}>
                  <Clock size={18} color="#2563EB" />
                </View>
                <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                  <Typography size="sm" weight="bold" color="#0F172A">
                    {rem.title}
                  </Typography>
                  <Typography size="xs" color="#64748B">
                    {rem.scheduledTime} • {rem.category}
                  </Typography>
                </View>
                <View style={rem.status === 'COMPLETED' ? styles.statusBadgeGreen : styles.statusBadgeBlue}>
                  <Typography size="xs" weight="bold" color={rem.status === 'COMPLETED' ? '#15803D' : '#1E40AF'}>
                    {rem.status}
                  </Typography>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tab 4: Care Plan */}
        {activeTab === 'Care Plan' && (
          <View style={{ gap: SPACING.sm, marginTop: SPACING.xs }}>
            <Typography size="base" weight="bold" color="#0F172A">
              Daily Care Plan Schedule
            </Typography>

            <View style={styles.carePlanBlock}>
              <Typography size="xs" weight="bold" color="#15803D">
                MORNING ROUTINE (8:00 AM - 12:00 PM)
              </Typography>
              <Typography size="sm" color="#0F172A" style={{ marginTop: 4 }}>
                • 9:00 AM — Morning Medicine (Blood Pressure)
              </Typography>
              <Typography size="sm" color="#0F172A" style={{ marginTop: 2 }}>
                • 10:00 AM — Hydration Check (1 Glass Water)
              </Typography>
            </View>

            <View style={styles.carePlanBlock}>
              <Typography size="xs" weight="bold" color="#1E40AF">
                AFTERNOON ROUTINE (12:00 PM - 5:00 PM)
              </Typography>
              <Typography size="sm" color="#0F172A" style={{ marginTop: 4 }}>
                • 2:00 PM — Cognitive Game (Match Pair or Topic Talk)
              </Typography>
              <Typography size="sm" color="#0F172A" style={{ marginTop: 2 }}>
                • 4:00 PM — Evening Hydration
              </Typography>
            </View>

            <View style={styles.carePlanBlock}>
              <Typography size="xs" weight="bold" color="#6B21A8">
                EVENING ROUTINE (5:00 PM - 9:00 PM)
              </Typography>
              <Typography size="sm" color="#0F172A" style={{ marginTop: 4 }}>
                • 8:00 PM — Night Medicine & Family Check-in Call
              </Typography>
            </View>
          </View>
        )}

        {/* Action Buttons Row */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsReportModalVisible(true)}
            style={styles.messageBtn}
          >
            <FileText size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Typography size="sm" weight="bold" color="#FFFFFF">
              Export PDF Report
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/caregiver/reminders')}
            style={styles.carePlanBtn}
          >
            <Calendar size={18} color="#16A34A" style={{ marginRight: 6 }} />
            <Typography size="sm" weight="bold" color="#16A34A">
              Add Reminder
            </Typography>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* PDF Care Summary Report Modal */}
      <Modal visible={isReportModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Typography size="lg" weight="bold" color="#0F172A" align="center">
              MitraCare Progress Report
            </Typography>
            <Typography size="xs" color="#64748B" align="center" style={{ marginTop: 2 }}>
              Generated from MitraCare application metrics.
            </Typography>

            <View style={styles.reportCard}>
              <Typography size="xs" weight="bold" color="#64748B">
                PATIENT IDENTIFIER
              </Typography>
              <Typography size="sm" weight="bold" color="#0F172A" style={{ marginTop: 2 }}>
                Patient: {patient.name} • Status: Connected
              </Typography>

              <View style={{ height: 1, backgroundColor: '#E2E8F0', marginVertical: SPACING.sm }} />

              <Typography size="xs" weight="bold" color="#64748B">
                30-DAY ENGAGEMENT SUMMARY
              </Typography>
              <Typography size="sm" color="#0F172A" style={{ marginTop: 2 }}>
                • Games Completed: 24 sessions
              </Typography>
              <Typography size="sm" color="#0F172A" style={{ marginTop: 2 }}>
                • Average Activity Score: 78%
              </Typography>
              <Typography size="sm" color="#0F172A" style={{ marginTop: 2 }}>
                • Reminder Adherence: 83% (Medicine & Hydration)
              </Typography>

              <View style={{ height: 1, backgroundColor: '#E2E8F0', marginVertical: SPACING.sm }} />

              <Typography size="xs" weight="bold" color="#64748B">
                OBSERVED TREND & POLICY
              </Typography>
              <Typography size="xs" color="#64748B" style={{ marginTop: 2, lineHeight: 16 }}>
                Non-diagnostic report summarizing observed application participation and adherence.
              </Typography>
            </View>

            <TouchableOpacity
              onPress={() => {
                setIsReportModalVisible(false);
                Alert.alert('Report Exported!', `Progress summary for ${patient.name} saved as PDF.`);
              }}
              style={styles.downloadPdfBtn}
            >
              <Typography size="base" weight="bold" color="#FFFFFF">
                Download PDF Report
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsReportModalVisible(false)} style={{ marginTop: 12, alignItems: 'center' }}>
              <Typography size="sm" weight="bold" color="#64748B">
                Close
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  backSquareBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  headerPatientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: SPACING.xs,
  },
  avatarCircleSmall: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginVertical: SPACING.md,
  },
  tabPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F9',
  },
  activeTabPill: {
    backgroundColor: '#16A34A',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  statusTile: {
    width: '47.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  trendCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  trendCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  improvingBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  chartArea: {
    height: 110,
    marginTop: SPACING.md,
    justifyContent: 'flex-end',
  },
  chartLinePointContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '100%',
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: 8,
    backgroundColor: '#16A34A',
    borderRadius: RADIUS.full,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activityIconCircleGreen: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIconCircleBlue: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeGreen: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  statusBadgeBlue: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  carePlanBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  messageBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
  },
  carePlanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    padding: SPACING.lg,
  },
  reportCard: {
    backgroundColor: '#F8FAF8',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  downloadPdfBtn: {
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
});
