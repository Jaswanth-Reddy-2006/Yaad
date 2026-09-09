import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Text, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Clock,
  Pill,
  Droplet,
  Brain,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Calendar,
  Activity,
  Smile,
  ShieldCheck,
  AlertTriangle,
  Check,
  User,
} from 'lucide-react-native';
import { CaregiverTopHeader } from '../../components/caregiver/CaregiverTopHeader';
import { CaregiverBottomNavBar } from '../../components/caregiver/CaregiverBottomNavBar';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useCaregiverStore } from '../../store/useCaregiverStore';
import { authService } from '../../services/AuthService';
import { offlineProximitySync } from '../../services/sync/OfflineProximitySync';
import { RoutineScheduleItem, Reminder } from '../../types';

export default function CaregiverHomeScreen() {
  const router = useRouter();
  const {
    caregiverName,
    activePatientId,
    patients,
    alerts,
    reminders,
    isOfflineMode,
    lastSyncedTime,
    fetchDashboardData,
  } = useCaregiverStore();

  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [todayRoutine, setTodayRoutine] = useState<RoutineScheduleItem[]>([]);
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      async function verifyAuth() {
        const isAuth = await authService.isAuthenticated();
        const role = await authService.getUserRole();
        if (isMounted && (!isAuth || role !== 'CAREGIVER')) {
          router.replace('/');
          return;
        }
        if (isMounted) {
          fetchDashboardData();
        }
      }
      verifyAuth();
      return () => {
        isMounted = false;
      };
    }, [router])
  );

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0] || {
    id: 'p-1',
    name: 'Amma',
    relationship: 'Mother',
  };

  // Dynamic greeting based on current time
  const currentHour = new Date().getHours();
  const greetingText = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  const loadPatientInsights = useCallback(async () => {
    if (!activePatient?.id) return;
    try {
      const [anaRes, routineData, remData] = await Promise.all([
        fetch(`http://localhost:8000/api/v1/caregiver/patients/${activePatient.id}/analytics`).catch(() => null),
        offlineProximitySync.getRoutineSchedule(activePatient.id).catch(() => []),
        offlineProximitySync.getOneTimeReminders(activePatient.id).catch(() => []),
      ]);

      if (anaRes && anaRes.ok) {
        const data = await anaRes.json();
        setAnalytics(data);
      } else {
        setAnalytics({
          avg_accuracy: 84,
          total_sessions: 16,
          days: 30,
          trend_status: 'Stable & Active',
        });
      }

      setTodayRoutine(Array.isArray(routineData) ? routineData : []);
      setTodayReminders(Array.isArray(remData) ? remData : []);
    } catch {
      setAnalytics({
        avg_accuracy: 84,
        total_sessions: 16,
        days: 30,
        trend_status: 'Stable & Active',
      });
    }
  }, [activePatient?.id]);

  useEffect(() => {
    loadPatientInsights();
  }, [loadPatientInsights]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardData(), loadPatientInsights()]);
    setRefreshing(false);
  };

  const activePatientAlerts = activePatient
    ? alerts.filter(
        (a) =>
          (!a.isResolved && a.patientId === activePatient.id) ||
          (!a.isResolved && a.patientName === activePatient.name)
      )
    : [];

  const completedRoutineCount = todayRoutine.filter((r) => r.isCompleted).length;
  const totalRoutineCount = todayRoutine.length || 6;
  const displayCompletedRoutine = todayRoutine.length > 0 ? completedRoutineCount : 4;
  const displayTotalRoutine = totalRoutineCount;

  const totalRemindersCount = todayReminders.length || 18;
  const completedRemindersCount = todayReminders.filter((r) => r.status === 'COMPLETED').length;

  const avgAccuracy = analytics?.avg_accuracy ?? 84;

  const domainScores = [
    { label: 'Memory Recall', score: 87, color: '#16A34A' },
    { label: 'Attention & Focus', score: 80, color: '#2563EB' },
    { label: 'Visual Recognition', score: 84, color: '#E98200' },
    { label: 'Daily Routine', score: 86, color: '#7C3AED' },
  ];

  // Top 3 relevant priority tasks
  const topPriorities = [
    {
      id: 'p1',
      time: '9:00 AM',
      category: 'Medicine',
      title: 'Morning Medicine',
      status: 'Completed',
      isCompleted: true,
      Icon: Pill,
      iconColor: '#16A34A',
      iconBg: '#DCFCE7',
    },
    {
      id: 'p2',
      time: '10:30 AM',
      category: 'Hydration',
      title: 'Drink Fresh Water',
      status: 'Pending',
      isCompleted: false,
      Icon: Droplet,
      iconColor: '#2563EB',
      iconBg: '#EFF6FF',
    },
    {
      id: 'p3',
      time: '11:00 AM',
      category: 'Activity',
      title: 'Mind Sharp Game',
      status: 'Pending',
      isCompleted: false,
      Icon: Brain,
      iconColor: '#7C3AED',
      iconBg: '#F3E8FF',
    },
  ];

  return (
    <View style={styles.outerContainer}>
      <View style={styles.mobileConstraint}>
        {/* 4. Top Header */}
        <CaregiverTopHeader />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16A34A']} />}
        >
          {/* Today's Care At-A-Glance Card */}
          <View style={styles.atAGlanceCard}>
            {/* Top Row: Title + View Profile */}
            <View style={styles.atAGlanceHeaderRow}>
              <Text style={styles.atAGlanceTitle}>TODAY'S CARE AT-A-GLANCE</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/caregiver/profile')}
                style={styles.viewProfilePill}
              >
                <Text style={styles.viewProfileText}>View Profile</Text>
                <ChevronRight size={14} color="#16A34A" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>

            {/* Patient Info Row */}
            <View style={styles.patientInfoRow}>
              <View style={styles.patientAvatarCircle}>
                <User size={22} color="#16A34A" />
              </View>
              <View style={styles.patientNameCol}>
                <Text style={styles.patientNameTitle}>{activePatient.name}</Text>
                <View style={styles.activityStatusRow}>
                  <View style={styles.activityStatusDot} />
                  <Text style={styles.activityStatusText}>Activity: Stable & Active</Text>
                </View>
              </View>
            </View>

            {/* Inner Metrics Container */}
            <View style={styles.innerMetricsContainer}>
              {/* Metric 1: Activities */}
              <View style={styles.metricColumn}>
                <Text style={[styles.metricNumberText, { color: '#16A34A' }]}>
                  {displayCompletedRoutine}/{displayTotalRoutine}
                </Text>
                <Text style={styles.metricLabelText} numberOfLines={1}>
                  Activities
                </Text>
              </View>

              {/* Divider */}
              <View style={styles.columnDivider} />

              {/* Metric 2: Reminders */}
              <View style={styles.metricColumn}>
                <Text style={[styles.metricNumberText, { color: '#2563EB' }]}>
                  {completedRemindersCount} / {todayReminders.length || 1}
                </Text>
                <Text style={styles.metricLabelText} numberOfLines={1}>
                  Reminders
                </Text>
              </View>

              {/* Divider */}
              <View style={styles.columnDivider} />

              {/* Metric 3: Mood Check */}
              <View style={styles.metricColumn}>
                <Text
                  style={[styles.metricNumberText, { color: '#D97706', fontSize: 18 }]}
                  numberOfLines={1}
                >
                  Calm
                </Text>
                <Text style={styles.metricLabelText} numberOfLines={1}>
                  Mood Check
                </Text>
              </View>

              {/* Divider */}
              <View style={styles.columnDivider} />

              {/* Metric 4: Alerts */}
              <View style={styles.metricColumn}>
                <Text
                  style={[
                    styles.metricNumberText,
                    { color: activePatientAlerts.length > 0 ? '#DC2626' : '#16A34A' },
                  ]}
                  numberOfLines={1}
                >
                  {activePatientAlerts.length}
                </Text>
                <Text style={styles.metricLabelText} numberOfLines={1}>
                  Alerts
                </Text>
              </View>
            </View>
          </View>

          {/* 10, 11. Today's Priorities */}
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionHeading}>Today's care</Text>
            <Text style={styles.sectionSubtitle}>What needs attention today</Text>
          </View>

          <View style={styles.prioritiesCard}>
            {topPriorities.map((item, index) => {
              const Icon = item.Icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => router.push('/caregiver/reminders')}
                  style={[styles.priorityRow, index < topPriorities.length - 1 && styles.priorityRowBorder]}
                >
                  <View style={[styles.priorityIconCircle, { backgroundColor: item.iconBg }]}>
                    <Icon size={18} color={item.iconColor} />
                  </View>

                  <View style={styles.priorityTextGroup}>
                    <View style={styles.priorityMetaLine}>
                      <Text style={styles.priorityTimeText}>{item.time}</Text>
                      <Text style={styles.priorityBullet}>•</Text>
                      <Text style={styles.priorityCategoryText}>{item.category}</Text>
                    </View>
                    <Text style={styles.priorityTaskName}>{item.title}</Text>
                  </View>

                  <View style={styles.priorityStatusWrap}>
                    <Text
                      style={[
                        styles.priorityStatusLabel,
                        item.isCompleted ? styles.statusCompletedGreen : styles.statusPendingOrange,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.push('/caregiver/reminders')}
              style={styles.fullScheduleLinkBtn}
            >
              <Text style={styles.fullScheduleLinkText}>View full schedule →</Text>
            </TouchableOpacity>
          </View>

          {/* 12, 13. Cognitive Progress */}
          <View style={styles.sectionHeaderWithAction}>
            <Text style={styles.sectionHeading}>Cognitive progress</Text>
            <View style={styles.rangeIndicator}>
              <Text style={styles.rangeIndicatorText}>Last 30 days ˅</Text>
            </View>
          </View>

          <View style={styles.cognitiveCard}>
            <View style={styles.cognitiveScoreHeader}>
              <View>
                <Text style={styles.scoreBigText}>{avgAccuracy}%</Text>
                <Text style={styles.scoreSubLabel}>Average accuracy</Text>
              </View>
              <View style={styles.cognitiveStatusBadge}>
                <View style={styles.statusDotGreen} />
                <Text style={styles.statusTextGreen}>Stable & Active</Text>
              </View>
            </View>

            {/* 4 Compact Progress Indicators */}
            <View style={styles.domainProgressList}>
              {domainScores.map((d, i) => (
                <View key={i} style={styles.domainRow}>
                  <View style={styles.domainInfoRow}>
                    <Text style={styles.domainLabel}>{d.label}</Text>
                    <Text style={[styles.domainPercent, { color: d.color }]}>{d.score}%</Text>
                  </View>
                  <View style={styles.domainTrack}>
                    <View style={[styles.domainFill, { width: `${d.score}%`, backgroundColor: d.color }]} />
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.push('/caregiver/insights')}
              style={styles.cognitiveInsightsLink}
            >
              <Text style={styles.cognitiveInsightsLinkText}>View cognitive insights →</Text>
            </TouchableOpacity>
          </View>

          {/* 14. Care Guidance */}
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionHeading}>Care guidance</Text>
          </View>

          <View style={styles.guidanceCard}>
            <Text style={styles.guidanceObservation}>
              Morning cognitive activities are going well.
            </Text>

            <View style={styles.suggestedActionBox}>
              <Text style={styles.suggestedActionLabel}>Suggested action</Text>
              <Text style={styles.suggestedActionText}>
                Encourage the morning recall exercise to reinforce daily memory routines.
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.push('/caregiver/insights')}
              style={styles.guidanceLinkRow}
            >
              <Text style={styles.guidanceLinkText}>View guidance →</Text>
            </TouchableOpacity>
          </View>

          {/* 15. Attention State (State-Based) */}
          {activePatientAlerts.length > 0 ? (
            <View style={styles.attentionNeededCard}>
              <AlertTriangle size={20} color="#DC2626" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.attentionNeededTitle}>⚠ Attention needed</Text>
                <Text style={styles.attentionNeededSub}>
                  {activePatientAlerts[0]?.title || 'A care reminder or schedule requires your attention.'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.allClearCard}>
              <CheckCircle2 size={20} color="#15803D" style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.allClearTitle}>✓ All clear</Text>
                <Text style={styles.allClearSub}>No urgent alerts or missed medications.</Text>
              </View>
            </View>
          )}

          {/* 16. One Primary Action */}
          <View style={styles.primaryActionSection}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push('/caregiver/reminders')}
              style={styles.primaryCtaButton}
            >
              <Text style={styles.primaryCtaText}>View Today's Schedule →</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Nav Clearance */}
          <View style={{ height: 110 }} />
        </ScrollView>

        {/* 19. Fixed Bottom Navigation */}
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
    paddingTop: SPACING.md,
  },
  atAGlanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.md,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  atAGlanceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  atAGlanceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
  },
  viewProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16A34A',
  },
  patientInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  patientAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  patientNameCol: {
    flex: 1,
    justifyContent: 'center',
  },
  patientNameTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  activityStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  activityStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  activityStatusText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#15803D',
  },
  statusDotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  statusTextGreen: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
  },
  innerMetricsContainer: {
    backgroundColor: '#F8FAF8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  columnDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
  },
  metricNumberText: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
    textAlign: 'center',
  },
  metricLabelText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 21,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 15.5,
    color: '#64748B',
    marginTop: 2,
  },
  sectionHeaderWrap: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  sectionHeaderWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  rangeIndicator: {
    backgroundColor: '#F1F5F3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  rangeIndicatorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  prioritiesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8E5',
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  priorityRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F3',
  },
  priorityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  priorityTextGroup: {
    flex: 1,
  },
  priorityMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityTimeText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#64748B',
  },
  priorityBullet: {
    fontSize: 13,
    color: '#CBD5E1',
    marginHorizontal: 5,
  },
  priorityCategoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  priorityTaskName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  priorityStatusWrap: {
    marginLeft: 10,
  },
  priorityStatusLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusCompletedGreen: {
    color: '#15803D',
  },
  statusPendingOrange: {
    color: '#E98200',
  },
  fullScheduleLinkBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FAFAF9',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F3',
  },
  fullScheduleLinkText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  cognitiveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8E5',
    marginBottom: SPACING.md,
  },
  cognitiveScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  scoreBigText: {
    fontSize: 38,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 44,
  },
  scoreSubLabel: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  cognitiveStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  domainProgressList: {
    gap: 12,
  },
  domainRow: {},
  domainInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  domainLabel: {
    fontSize: 15.5,
    fontWeight: '500',
    color: '#334155',
  },
  domainPercent: {
    fontSize: 15.5,
    fontWeight: '800',
  },
  domainTrack: {
    height: 7,
    backgroundColor: '#F1F5F3',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  domainFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  cognitiveInsightsLink: {
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F3',
  },
  cognitiveInsightsLinkText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#16A34A',
  },
  guidanceCard: {
    backgroundColor: '#FFFDF5',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: SPACING.md,
  },
  guidanceObservation: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 24,
    marginBottom: 8,
  },
  suggestedActionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.sm,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#E98200',
    marginBottom: 10,
  },
  suggestedActionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  suggestedActionText: {
    fontSize: 15.5,
    color: '#475569',
    lineHeight: 22,
  },
  guidanceLinkRow: {
    alignItems: 'flex-start',
  },
  guidanceLinkText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#B45309',
  },
  allClearCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: SPACING.md,
  },
  allClearTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#15803D',
  },
  allClearSub: {
    fontSize: 15,
    color: '#166534',
    marginTop: 2,
  },
  attentionNeededCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: SPACING.md,
  },
  attentionNeededTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  attentionNeededSub: {
    fontSize: 15,
    color: '#991B1B',
    marginTop: 2,
  },
  primaryActionSection: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  primaryCtaButton: {
    height: 54,
    backgroundColor: '#16A34A',
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryCtaText: {
    fontSize: 17.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
