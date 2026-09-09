import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Text, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  TrendingUp,
  Brain,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Info,
  Calendar,
} from 'lucide-react-native';
import { CaregiverTopHeader } from '../../components/caregiver/CaregiverTopHeader';
import { CaregiverBottomNavBar } from '../../components/caregiver/CaregiverBottomNavBar';
import { PatientStatusBadge } from '../../components/common/PatientStatusBadge';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useCaregiverStore } from '../../store/useCaregiverStore';

export default function CognitiveInsightsScreen() {
  const router = useRouter();
  const { patients, activePatientId } = useCaregiverStore();
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('30D');

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0] || {
    id: 'p-1',
    name: 'Amma',
    relationship: 'Mother',
  };

  // 4 Core Cognitive Domains
  const domains = [
    {
      name: 'Memory Recall',
      score: 87,
      color: '#16A34A',
      desc: 'High recognition of family members and loved ones',
    },
    {
      name: 'Attention & Focus',
      score: 80,
      color: '#2563EB',
      desc: 'Consistent focus during morning memory exercises',
    },
    {
      name: 'Visual Recognition',
      score: 84,
      color: '#E98200',
      desc: 'Accurate identification of everyday household objects',
    },
    {
      name: 'Daily Routine',
      score: 86,
      color: '#7C3AED',
      desc: 'Consistent adherence to medicine and hydration schedule',
    },
  ];

  // Trend chart mock data points
  const trendData = {
    '7D': [
      { label: 'Mon', score: 82 },
      { label: 'Tue', score: 84 },
      { label: 'Wed', score: 83 },
      { label: 'Thu', score: 85 },
      { label: 'Fri', score: 86 },
      { label: 'Sat', score: 84 },
      { label: 'Sun', score: 87 },
    ],
    '30D': [
      { label: 'W1', score: 80 },
      { label: 'W2', score: 82 },
      { label: 'W3', score: 83 },
      { label: 'W4', score: 86 },
    ],
    '90D': [
      { label: 'Month 1', score: 79 },
      { label: 'Month 2', score: 82 },
      { label: 'Month 3', score: 85 },
    ],
  };

  const activeTrend = trendData[timeRange];

  return (
    <View style={styles.outerContainer}>
      <View style={styles.mobileConstraint}>
      {/* Header with back button */}
      <CaregiverTopHeader showBack={true} onBackPress={() => router.push('/caregiver/home')} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Screen Title & Patient Context */}
        <View style={styles.titleArea}>
          <Text style={styles.pageTitle}>Cognitive Progress</Text>
          <Text style={styles.pageSubtitle}>
            Evidence-based observations for <Text style={styles.boldPatient}>{activePatient.name}</Text>
          </Text>
        </View>

        {/* -------------------------
            1. OVERALL COGNITIVE SCORE
        ------------------------- */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreCardTop}>
            <View>
              <Text style={styles.scoreNumber}>84%</Text>
              <Text style={styles.scoreLabel}>Overall Cognitive Score</Text>
            </View>
            <View style={styles.trendBadge}>
              <TrendingUp size={16} color="#15803D" style={{ marginRight: 4 }} />
              <Text style={styles.trendBadgeText}>Improving ↑</Text>
            </View>
          </View>

          <Text style={styles.scoreSummary}>
            {activePatient.name}'s cognitive score has maintained an upward trajectory over the past 30 days,
            reflecting strong engagement in recall games.
          </Text>

          <View style={styles.scoreFooter}>
            <PatientStatusBadge status="STABLE" size="sm" />
            <Text style={styles.updatedText}>Last updated today at 11:30 AM</Text>
          </View>
        </View>

        {/* -------------------------
            2. COGNITIVE DOMAINS
        ------------------------- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Cognitive Domains</Text>
        </View>

        <View style={styles.domainsCard}>
          {domains.map((d, index) => (
            <View key={index} style={[styles.domainRow, index < domains.length - 1 && styles.domainDivider]}>
              <View style={styles.domainRowTop}>
                <Text style={styles.domainTitle}>{d.name}</Text>
                <Text style={[styles.domainScoreValue, { color: d.color }]}>{d.score}%</Text>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${d.score}%`, backgroundColor: d.color }]} />
              </View>

              <Text style={styles.domainDesc}>{d.desc}</Text>
            </View>
          ))}
        </View>

        {/* -------------------------
            3. TREND CHART (7D / 30D / 90D)
        ------------------------- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Progress Trend</Text>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.timeFilterRow}>
            {(['7D', '30D', '90D'] as const).map((range) => (
              <TouchableOpacity
                key={range}
                activeOpacity={0.8}
                onPress={() => setTimeRange(range)}
                style={[styles.filterPill, timeRange === range && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, timeRange === range && styles.filterPillTextActive]}>
                  {range === '7D' ? '7 Days' : range === '30D' ? '30 Days' : '90 Days'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Simple Clean Bar Graph */}
          <View style={styles.barGraphArea}>
            {activeTrend.map((pt, i) => (
              <View key={i} style={styles.barColumn}>
                <Text style={styles.barScoreLabel}>{pt.score}%</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${(pt.score / 100) * 100}%` }]} />
                </View>
                <Text style={styles.barXLabel}>{pt.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* -------------------------
            4. STRENGTHS
        ------------------------- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Key Strengths</Text>
        </View>

        <View style={styles.strengthsCard}>
          <View style={styles.observationItem}>
            <CheckCircle2 size={18} color="#16A34A" style={styles.observationIcon} />
            <View style={styles.observationContent}>
              <Text style={styles.observationHeading}>Immediate Family Recognition</Text>
              <Text style={styles.observationText}>
                Achieved 95% accuracy on photos of son and daughter with zero hesitation delays.
              </Text>
            </View>
          </View>

          <View style={styles.observationItem}>
            <CheckCircle2 size={18} color="#16A34A" style={styles.observationIcon} />
            <View style={styles.observationContent}>
              <Text style={styles.observationHeading}>Morning Routine Precision</Text>
              <Text style={styles.observationText}>
                Prompt acknowledgment for 9:00 AM medication and breakfast schedules.
              </Text>
            </View>
          </View>
        </View>

        {/* -------------------------
            5. NEEDS ATTENTION
        ------------------------- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Needs Attention</Text>
        </View>

        <View style={styles.attentionCard}>
          <View style={styles.observationItem}>
            <AlertTriangle size={18} color="#E98200" style={styles.observationIcon} />
            <View style={styles.observationContent}>
              <Text style={styles.observationHeading}>Late Afternoon Fatigue</Text>
              <Text style={styles.observationText}>
                Slight dip in response speed when playing recall activities after 4:30 PM.
              </Text>
            </View>
          </View>

          <View style={styles.observationItem}>
            <AlertTriangle size={18} color="#E98200" style={styles.observationIcon} />
            <View style={styles.observationContent}>
              <Text style={styles.observationHeading}>Multi-Step Recall</Text>
              <Text style={styles.observationText}>
                Remembers object names quickly, but requires hints for less familiar placement areas.
              </Text>
            </View>
          </View>
        </View>

        {/* -------------------------
            6. CARE RECOMMENDATIONS
        ------------------------- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Care Recommendations</Text>
        </View>

        <View style={styles.recommendationsCard}>
          <View style={styles.recItem}>
            <View style={styles.recNumberCircle}>
              <Text style={styles.recNumberText}>1</Text>
            </View>
            <View style={styles.recContent}>
              <Text style={styles.recHeading}>Schedule Games in the Morning</Text>
              <Text style={styles.recText}>
                Peak focus occurs between 10:00 AM and 12:00 PM. Aim to complete recall exercises during this window.
              </Text>
            </View>
          </View>

          <View style={styles.recItem}>
            <View style={styles.recNumberCircle}>
              <Text style={styles.recNumberText}>2</Text>
            </View>
            <View style={styles.recContent}>
              <Text style={styles.recHeading}>Reinforce Daily Object Locations</Text>
              <Text style={styles.recText}>
                Keep everyday items (glasses, keys, medicine) in designated high-visibility areas like the bedside table.
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom clearance */}
        <View style={{ height: 110 }} />
      </ScrollView>

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
  titleArea: {
    marginBottom: SPACING.md,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  pageSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 2,
  },
  boldPatient: {
    fontWeight: '800',
    color: '#16A34A',
  },
  scoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8E5',
    marginBottom: SPACING.xs,
  },
  scoreCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  scoreNumber: {
    fontSize: 40,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 46,
  },
  scoreLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  trendBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
  },
  scoreSummary: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    marginVertical: SPACING.sm,
  },
  scoreFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F3',
  },
  updatedText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  sectionHeaderRow: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  domainsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8E5',
  },
  domainRow: {
    paddingVertical: SPACING.xs,
  },
  domainDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F3',
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  domainRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  domainTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  domainScoreValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F1F5F3',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  domainDesc: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8E5',
  },
  timeFilterRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F3',
    borderRadius: RADIUS.sm,
    padding: 3,
    marginBottom: SPACING.md,
  },
  filterPill: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: RADIUS.xs,
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#111827',
    fontWeight: '800',
  },
  barGraphArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 140,
    paddingTop: SPACING.sm,
  },
  barColumn: {
    alignItems: 'center',
    width: 36,
  },
  barScoreLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  barTrack: {
    width: 14,
    height: 90,
    backgroundColor: '#F1F5F3',
    borderRadius: RADIUS.full,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#16A34A',
    borderRadius: RADIUS.full,
  },
  barXLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 6,
  },
  strengthsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8E5',
    gap: SPACING.sm,
  },
  attentionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8E5',
    gap: SPACING.sm,
  },
  observationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  observationIcon: {
    marginRight: 8,
    marginTop: 2,
    flexShrink: 0,
  },
  observationContent: {
    flex: 1,
  },
  observationHeading: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#111827',
  },
  observationText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 2,
    lineHeight: 20,
  },
  recommendationsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8E5',
    gap: SPACING.md,
  },
  recItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recNumberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    marginTop: 1,
  },
  recNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
  },
  recContent: {
    flex: 1,
  },
  recHeading: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#111827',
  },
  recText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 2,
    lineHeight: 20,
  },
});
