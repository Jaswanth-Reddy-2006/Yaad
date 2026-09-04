import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Plus, User, CheckCircle2, ChevronRight, WifiOff } from 'lucide-react-native';
import { Typography } from '../../components/common/Typography';
import { CaregiverBottomNavBar } from '../../components/caregiver/CaregiverBottomNavBar';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useCaregiverStore } from '../../store/useCaregiverStore';

export default function MyPatientsScreen() {
  const router = useRouter();
  const { patients, isOfflineMode, lastSyncedTime, fetchDashboardData, isLoading } = useCaregiverStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16A34A']} />}
      >
        {/* Header Row */}
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backSquareBtn}>
            <ArrowLeft size={22} color="#0F172A" />
          </TouchableOpacity>
          <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
            <Typography size="xxl" weight="bold" color="#0F172A">
              My Patients
            </Typography>
            {isOfflineMode && (
              <View style={styles.offlinePill}>
                <WifiOff size={12} color="#D97706" style={{ marginRight: 4 }} />
                <Typography size="xs" color="#D97706" weight="bold">
                  Offline • Cached {lastSyncedTime || 'Data'}
                </Typography>
              </View>
            )}
          </View>
        </View>

        {/* Search Input Box */}
        <View style={styles.searchBox}>
          <Search size={20} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search patient by name..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* List of Patients */}
        <View style={styles.patientsList}>
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <TouchableOpacity
                key={patient.id}
                activeOpacity={0.88}
                onPress={() => router.push({ pathname: '/caregiver/patient-detail', params: { patientId: patient.id } })}
                style={styles.patientCard}
              >
                {/* Top Row: Avatar, Name, Connected Badge */}
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.avatarCircle, { backgroundColor: patient.avatarBg || '#DCFCE7' }]}>
                    <User size={32} color="#0F172A" />
                  </View>

                  <View style={{ flex: 1, marginLeft: SPACING.md }}>
                    <Typography size="lg" weight="bold" color="#0F172A">
                      {patient.name}
                    </Typography>
                    <Typography size="xs" color="#64748B" style={{ marginTop: 2 }}>
                      {patient.activityStatus}
                    </Typography>
                  </View>

                  <View style={styles.connectedBadge}>
                    <CheckCircle2 size={12} color="#16A34A" style={{ marginRight: 4 }} />
                    <Typography size="xs" weight="bold" color="#16A34A">
                      {patient.status}
                    </Typography>
                  </View>
                </View>

                {/* Bottom Metrics Pill Row */}
                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Typography size="xs" color="#64748B">
                      Activities
                    </Typography>
                    <Typography size="sm" weight="bold" color="#0F172A" style={{ marginTop: 2 }}>
                      {patient.activitiesDone}
                    </Typography>
                  </View>

                  <View style={styles.dividerLine} />

                  <View style={styles.metricItem}>
                    <Typography size="xs" color="#64748B">
                      Mood
                    </Typography>
                    <Typography size="sm" weight="bold" color="#0F172A" style={{ marginTop: 2 }}>
                      {patient.mood}
                    </Typography>
                  </View>

                  <View style={styles.dividerLine} />

                  <View style={styles.metricItem}>
                    <Typography size="xs" color="#64748B">
                      Last Active
                    </Typography>
                    <Typography size="sm" weight="bold" color="#0F172A" style={{ marginTop: 2 }}>
                      {patient.lastActive}
                    </Typography>
                  </View>

                  <ChevronRight size={18} color="#94A3B8" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyPatientsBox}>
              <Typography size="base" weight="bold" color="#0F172A" align="center">
                No patients found
              </Typography>
              <Typography size="xs" color="#64748B" align="center" style={{ marginTop: 4 }}>
                Connect a patient using their connection code or QR scanner.
              </Typography>
            </View>
          )}
        </View>

        {/* Primary Add New Patient Button */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/caregiver/connect-patient')}
          style={styles.addPatientBtn}
        >
          <Plus size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Typography size="base" weight="bold" color="#FFFFFF">
            Add New Patient
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
  offlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    marginTop: 2
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginVertical: SPACING.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  patientsList: {
    gap: SPACING.md,
  },
  emptyPatientsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 54,
    height: 54,
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
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAF8',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    marginTop: SPACING.md,
  },
  metricItem: {
    alignItems: 'center',
  },
  dividerLine: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
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
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
});
