import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Switch } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  Clock,
  Pill,
  Droplet,
  Brain,
  Calendar,
  X,
  Building2,
  Stethoscope,
  Footprints,
  Utensils,
  Trash2,
  WifiOff,
  Bell,
  Sparkles,
  Edit3,
  CalendarDays,
  Activity,
  HeartPulse,
  UserCheck,
} from 'lucide-react-native';
import { Typography } from '../../components/common/Typography';
import { CaregiverBottomNavBar } from '../../components/caregiver/CaregiverBottomNavBar';
import { ActivePatientSwitcher } from '../../components/caregiver/ActivePatientSwitcher';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useCaregiverStore } from '../../store/useCaregiverStore';
import { authService } from '../../services/AuthService';
import { offlineProximitySync } from '../../services/sync/OfflineProximitySync';
import { OfflineSyncModal } from '../../components/common/OfflineSyncModal';
import { RoutineScheduleItem, Reminder, PatientGameSchedule } from '../../types';

export default function RemindersScreen() {
  const router = useRouter();
  const { patients, activePatientId } = useCaregiverStore();

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

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0] || {
    id: 'p-1',
    name: 'Amma',
  };

  // 3 Primary Tabs: Routine (Daily Tasks), Remembers (One-Time/Hospital), GameAlarm (Game Times & Playtime)
  const [currentTab, setCurrentTab] = useState<'ROUTINE' | 'REMEMBERS' | 'GAME_ALARM'>('ROUTINE');

  // Live Lists
  const [routineList, setRoutineList] = useState<RoutineScheduleItem[]>([]);
  const [remindersList, setRemindersList] = useState<Reminder[]>([]);
  const [gameSchedule, setGameSchedule] = useState<PatientGameSchedule>({
    patientId: activePatient.id,
    playTimes: ['11:00 AM', '05:00 PM'],
    minimumPlaytimeMinutes: 10,
    playedMinutesToday: 0,
    isAlarmEnabled: true,
  });

  // Modal states
  const [isAddRoutineModal, setIsAddRoutineModal] = useState(false);
  const [isAddReminderModal, setIsAddReminderModal] = useState(false);
  const [isOfflineSyncModal, setIsOfflineSyncModal] = useState(false);

  // Form states - Routine
  const [routineTitle, setRoutineTitle] = useState('');
  const [routineTime, setRoutineTime] = useState('9:00 AM');
  const [routineCategory, setRoutineCategory] = useState<RoutineScheduleItem['category']>('MEDICINE');

  // Form states - One-Time Reminder
  const [remTitle, setRemTitle] = useState('');
  const [remDesc, setRemDesc] = useState('');
  const [remDate, setRemDate] = useState('Upcoming Saturday');
  const [remTime, setRemTime] = useState('10:00 AM');
  const [remCategory, setRemCategory] = useState<Reminder['category']>('HOSPITAL');

  // Form states - Game Alarm
  const [newPlayTime, setNewPlayTime] = useState('');

  const loadData = useCallback(async () => {
    const routine = await offlineProximitySync.getRoutineSchedule(activePatient.id);
    const rems = await offlineProximitySync.getOneTimeReminders(activePatient.id);
    const games = await offlineProximitySync.getGameSchedule(activePatient.id);
    setRoutineList(routine);
    setRemindersList(rems);
    setGameSchedule(games);
  }, [activePatient.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Routine Handlers
  const handleSaveRoutine = async () => {
    if (!routineTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a task name.');
      return;
    }
    const updated = await offlineProximitySync.addRoutineItem({
      patientId: activePatient.id,
      title: routineTitle.trim(),
      time: routineTime.trim() || '9:00 AM',
      category: routineCategory,
      repeat: 'DAILY',
    });
    setRoutineList(updated);
    setRoutineTitle('');
    setIsAddRoutineModal(false);
    Alert.alert('Routine Added', 'Daily task has been added to the patient schedule.');
  };

  const handleDeleteRoutine = async (id: string) => {
    Alert.alert('Delete Routine Task', 'Are you sure you want to remove this daily task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = await offlineProximitySync.deleteRoutineItem(id);
          setRoutineList(updated);
        },
      },
    ]);
  };

  // One-time Reminder Handlers
  const handleSaveReminder = async () => {
    if (!remTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a reminder title.');
      return;
    }
    const updated = await offlineProximitySync.addOneTimeReminder({
      patientId: activePatient.id,
      title: remTitle.trim(),
      description: remDesc.trim(),
      category: remCategory,
      scheduledDate: remDate.trim() || 'Upcoming Day',
      scheduledTime: remTime.trim() || '10:00 AM',
      repeat: 'ONCE',
      alarmEnabled: true,
    });
    setRemindersList(updated);
    setRemTitle('');
    setRemDesc('');
    setIsAddReminderModal(false);
    Alert.alert('Reminder Added', 'One-time task has been saved.');
  };

  const handleDeleteReminder = async (id: string) => {
    Alert.alert('Delete Reminder', 'Are you sure you want to remove this appointment reminder?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = await offlineProximitySync.deleteReminder(id);
          setRemindersList(updated);
        },
      },
    ]);
  };

  // Game Alarm Handlers
  const handleToggleGameAlarm = async (val: boolean) => {
    const updated = { ...gameSchedule, isAlarmEnabled: val };
    setGameSchedule(updated);
    await offlineProximitySync.saveGameSchedule(updated);
  };

  const handleChangeMinPlaytime = async (mins: number) => {
    const updated = { ...gameSchedule, minimumPlaytimeMinutes: mins };
    setGameSchedule(updated);
    await offlineProximitySync.saveGameSchedule(updated);
  };

  const handleAddGameTime = async () => {
    if (!newPlayTime.trim()) return;
    const time = newPlayTime.trim();
    if (!gameSchedule.playTimes.includes(time)) {
      const updated = { ...gameSchedule, playTimes: [...gameSchedule.playTimes, time] };
      setGameSchedule(updated);
      await offlineProximitySync.saveGameSchedule(updated);
      setNewPlayTime('');
    }
  };

  const handleRemoveGameTime = async (time: string) => {
    const updated = { ...gameSchedule, playTimes: gameSchedule.playTimes.filter((t) => t !== time) };
    setGameSchedule(updated);
    await offlineProximitySync.saveGameSchedule(updated);
  };

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'MEDICINE':
        return { Icon: Pill, bg: '#DCFCE7', color: '#15803D', badge: 'MEDICINE' };
      case 'HYDRATION':
        return { Icon: Droplet, bg: '#DBEAFE', color: '#1D4ED8', badge: 'WATER' };
      case 'ACTIVITY':
        return { Icon: Brain, bg: '#EDE9FE', color: '#6D28D9', badge: 'BRAIN' };
      case 'MEAL':
        return { Icon: Utensils, bg: '#FFEDD5', color: '#C2410C', badge: 'MEAL' };
      case 'WALK':
        return { Icon: Footprints, bg: '#FEF08A', color: '#A16207', badge: 'WALK' };
      case 'HOSPITAL':
        return { Icon: Building2, bg: '#FEE2E2', color: '#DC2626', badge: 'HOSPITAL' };
      case 'DOCTOR':
      case 'APPOINTMENT':
        return { Icon: Stethoscope, bg: '#CCFBF1', color: '#0F766E', badge: 'DOCTOR' };
      default:
        return { Icon: Clock, bg: '#F1F5F9', color: '#475569', badge: 'GENERAL' };
    }
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Clinical Header Bar */}
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backSquareBtn}>
            <ArrowLeft size={22} color="#0F172A" />
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: SPACING.md }}>
            <Typography size="xl" weight="bold" color="#0F172A">
              Care Schedules & Alarms
            </Typography>
            <Typography size="xs" color="#64748B" style={{ marginTop: 2 }}>
              Clinical Management • {activePatient.name}
            </Typography>
          </View>

          {/* Offline Proximity Sync Header Pill */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setIsOfflineSyncModal(true)}
            style={styles.offlineSyncTopBtn}
            accessibilityLabel="Offline Proximity Sync QR"
          >
            <WifiOff size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Typography size="xs" weight="bold" color="#FFFFFF">
              Sync Offline
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Active Patient Switcher */}
        <ActivePatientSwitcher />

        {/* 3 Status KPI Cards */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrapper, { backgroundColor: '#FFEDD5' }]}>
              <CalendarDays size={18} color="#C2410C" />
            </View>
            <Typography size="lg" weight="bold" color="#0F172A" style={{ marginTop: 4 }}>
              {routineList.length}
            </Typography>
            <Typography size="xs" color="#64748B">
              Daily Tasks
            </Typography>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrapper, { backgroundColor: '#FEE2E2' }]}>
              <Building2 size={18} color="#DC2626" />
            </View>
            <Typography size="lg" weight="bold" color="#0F172A" style={{ marginTop: 4 }}>
              {remindersList.length}
            </Typography>
            <Typography size="xs" color="#64748B">
              Hospital / Visits
            </Typography>
          </View>

          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconWrapper, { backgroundColor: '#EDE9FE' }]}>
              <Brain size={18} color="#6D28D9" />
            </View>
            <Typography size="lg" weight="bold" color="#0F172A" style={{ marginTop: 4 }}>
              {gameSchedule.minimumPlaytimeMinutes}m
            </Typography>
            <Typography size="xs" color="#64748B">
              Game Target
            </Typography>
          </View>
        </View>

        {/* Segmented Tab Controller */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setCurrentTab('ROUTINE')}
            style={[styles.tabBtn, currentTab === 'ROUTINE' ? styles.activeTabBtn : null]}
          >
            <Typography
              size="xs"
              weight="bold"
              color={currentTab === 'ROUTINE' ? '#FFFFFF' : '#64748B'}
            >
              Daily Routine ({routineList.length})
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setCurrentTab('REMEMBERS')}
            style={[styles.tabBtn, currentTab === 'REMEMBERS' ? styles.activeTabBtn : null]}
          >
            <Typography
              size="xs"
              weight="bold"
              color={currentTab === 'REMEMBERS' ? '#FFFFFF' : '#64748B'}
            >
              Remembers ({remindersList.length})
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setCurrentTab('GAME_ALARM')}
            style={[styles.tabBtn, currentTab === 'GAME_ALARM' ? styles.activeTabBtn : null]}
          >
            <Typography
              size="xs"
              weight="bold"
              color={currentTab === 'GAME_ALARM' ? '#FFFFFF' : '#64748B'}
            >
              Game Alarms
            </Typography>
          </TouchableOpacity>
        </View>

        {/* TAB 1: DAILY ROUTINE (RECURRING) */}
        {currentTab === 'ROUTINE' && (
          <View>
            <View style={styles.tabHeaderRow}>
              <View>
                <Typography size="sm" weight="bold" color="#0F172A">
                  Recurring Daily Schedule
                </Typography>
                <Typography size="xs" color="#64748B">
                  These tasks repeat every day for {activePatient.name}.
                </Typography>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setIsAddRoutineModal(true)}
                style={styles.addPrimaryBtn}
              >
                <Plus size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Typography size="xs" weight="bold" color="#FFFFFF">
                  Add Daily Task
                </Typography>
              </TouchableOpacity>
            </View>

            <View style={styles.cardList}>
              {routineList.map((item) => {
                const cfg = getCategoryConfig(item.category);
                const IconComp = cfg.Icon;

                return (
                  <View key={item.id} style={styles.managementCard}>
                    <View style={[styles.cardIconBox, { backgroundColor: cfg.bg }]}>
                      <IconComp size={24} color={cfg.color} />
                    </View>

                    <View style={{ flex: 1, marginLeft: SPACING.md }}>
                      <View style={styles.cardBadgeRow}>
                        <View style={styles.timeTag}>
                          <Clock size={12} color="#475569" style={{ marginRight: 4 }} />
                          <Typography size="xs" weight="bold" color="#475569">
                            {item.time}
                          </Typography>
                        </View>
                        <View style={[styles.categoryPill, { backgroundColor: cfg.bg }]}>
                          <Typography size="xs" weight="bold" color={cfg.color}>
                            {cfg.badge}
                          </Typography>
                        </View>
                      </View>

                      <Typography size="base" weight="bold" color="#0F172A" style={{ marginTop: 2 }}>
                        {item.title}
                      </Typography>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleDeleteRoutine(item.id)}
                      style={styles.deleteIconButton}
                      accessibilityLabel="Delete task"
                    >
                      <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* TAB 2: REMEMBERS (ONE-TIME / HOSPITAL VISITS) */}
        {currentTab === 'REMEMBERS' && (
          <View>
            <View style={styles.tabHeaderRow}>
              <View>
                <Typography size="sm" weight="bold" color="#0F172A">
                  One-Time Reminders & Hospital Visits
                </Typography>
                <Typography size="xs" color="#64748B">
                  Specific date appointments and hospital consultations.
                </Typography>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setIsAddReminderModal(true)}
                style={styles.addPrimaryBtn}
              >
                <Plus size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Typography size="xs" weight="bold" color="#FFFFFF">
                  Add Reminder
                </Typography>
              </TouchableOpacity>
            </View>

            <View style={styles.cardList}>
              {remindersList.map((item) => {
                const cfg = getCategoryConfig(item.category);
                const IconComp = cfg.Icon;

                return (
                  <View key={item.id} style={styles.managementCard}>
                    <View style={[styles.cardIconBox, { backgroundColor: cfg.bg }]}>
                      <IconComp size={24} color={cfg.color} />
                    </View>

                    <View style={{ flex: 1, marginLeft: SPACING.md }}>
                      <View style={styles.cardBadgeRow}>
                        <View style={styles.dateTag}>
                          <Calendar size={12} color="#B45309" style={{ marginRight: 4 }} />
                          <Typography size="xs" weight="bold" color="#B45309">
                            {item.scheduledDate} • {item.scheduledTime}
                          </Typography>
                        </View>
                        <View style={[styles.categoryPill, { backgroundColor: cfg.bg }]}>
                          <Typography size="xs" weight="bold" color={cfg.color}>
                            {cfg.badge}
                          </Typography>
                        </View>
                      </View>

                      <Typography size="base" weight="bold" color="#0F172A" style={{ marginTop: 2 }}>
                        {item.title}
                      </Typography>

                      {item.description ? (
                        <Typography size="xs" color="#64748B" style={{ marginTop: 2, lineHeight: 18 }}>
                          {item.description}
                        </Typography>
                      ) : null}
                    </View>

                    <TouchableOpacity
                      onPress={() => handleDeleteReminder(item.id)}
                      style={styles.deleteIconButton}
                      accessibilityLabel="Delete reminder"
                    >
                      <Trash2 size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* TAB 3: GAME ALARMS & MINIMUM PLAYTIME */}
        {currentTab === 'GAME_ALARM' && (
          <View>
            {/* Alarm Switch Card */}
            <View style={styles.settingCard}>
              <View style={styles.settingHeaderRow}>
                <View style={[styles.settingIconBox, { backgroundColor: '#EDE9FE' }]}>
                  <Brain size={22} color="#6D28D9" />
                </View>
                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <Typography size="base" weight="bold" color="#0F172A">
                    Cognitive Game Alarm
                  </Typography>
                  <Typography size="xs" color="#64748B" style={{ marginTop: 2 }}>
                    Rings on the patient tablet/phone at scheduled times prompting memory exercise.
                  </Typography>
                </View>
                <Switch
                  value={gameSchedule.isAlarmEnabled}
                  onValueChange={handleToggleGameAlarm}
                  trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
                  thumbColor={gameSchedule.isAlarmEnabled ? '#16A34A' : '#F1F5F9'}
                />
              </View>
            </View>

            {/* Minimum Daily Playtime Mandate */}
            <View style={styles.settingCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Clock size={18} color="#2563EB" style={{ marginRight: 6 }} />
                <Typography size="sm" weight="bold" color="#0F172A">
                  Minimum Daily Playtime Requirement
                </Typography>
              </View>
              <Typography size="xs" color="#64748B" style={{ marginTop: 4, marginBottom: SPACING.md }}>
                The patient must play brain games for at least this long each day before completion is acknowledged.
              </Typography>

              <View style={styles.minutesSelectorRow}>
                {[5, 10, 15, 20, 30].map((mins) => {
                  const isSelected = gameSchedule.minimumPlaytimeMinutes === mins;
                  return (
                    <TouchableOpacity
                      key={mins}
                      activeOpacity={0.8}
                      onPress={() => handleChangeMinPlaytime(mins)}
                      style={[styles.minutePill, isSelected ? styles.minutePillSelected : null]}
                    >
                      <Typography
                        size="sm"
                        weight="bold"
                        color={isSelected ? '#FFFFFF' : '#0F172A'}
                      >
                        {mins}m
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Scheduled Game Times */}
            <View style={styles.settingCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Bell size={18} color="#D97706" style={{ marginRight: 6 }} />
                <Typography size="sm" weight="bold" color="#0F172A">
                  Scheduled Alarm Times
                </Typography>
              </View>
              <Typography size="xs" color="#64748B" style={{ marginTop: 4, marginBottom: SPACING.md }}>
                At these specific times, the cognitive alarm chime will sound on the patient device.
              </Typography>

              <View style={styles.timesChipContainer}>
                {gameSchedule.playTimes.map((time) => (
                  <View key={time} style={styles.timeChip}>
                    <Clock size={14} color="#2563EB" style={{ marginRight: 6 }} />
                    <Typography size="sm" weight="bold" color="#1E40AF">
                      {time}
                    </Typography>
                    <TouchableOpacity onPress={() => handleRemoveGameTime(time)} style={{ marginLeft: 8 }}>
                      <X size={16} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Add New Time Input */}
              <View style={styles.addTimeRow}>
                <TextInput
                  placeholder="e.g. 03:30 PM"
                  placeholderTextColor="#94A3B8"
                  value={newPlayTime}
                  onChangeText={setNewPlayTime}
                  style={styles.timeInput}
                />
                <TouchableOpacity onPress={handleAddGameTime} style={styles.addTimeBtn}>
                  <Plus size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add Routine Modal */}
      <Modal visible={isAddRoutineModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography size="lg" weight="bold" color="#0F172A">
                Add Daily Routine Task
              </Typography>
              <TouchableOpacity onPress={() => setIsAddRoutineModal(false)}>
                <X size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Typography size="xs" weight="bold" color="#64748B" style={{ marginTop: SPACING.sm }}>
              CATEGORY
            </Typography>
            <View style={styles.categorySelectRow}>
              {(['MEDICINE', 'HYDRATION', 'ACTIVITY', 'MEAL', 'WALK'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setRoutineCategory(cat)}
                  style={[styles.catSelectPill, routineCategory === cat ? styles.activeCatSelectPill : null]}
                >
                  <Typography size="xs" weight="bold" color={routineCategory === cat ? '#FFFFFF' : '#64748B'}>
                    {cat}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>

            <Typography size="xs" weight="bold" color="#64748B" style={{ marginTop: SPACING.md }}>
              TASK TITLE *
            </Typography>
            <TextInput
              placeholder="e.g. Morning Blood Pressure Medication"
              placeholderTextColor="#94A3B8"
              value={routineTitle}
              onChangeText={setRoutineTitle}
              style={styles.modalInput}
            />

            <Typography size="xs" weight="bold" color="#64748B" style={{ marginTop: SPACING.sm }}>
              TIME *
            </Typography>
            <TextInput
              placeholder="e.g. 9:00 AM"
              placeholderTextColor="#94A3B8"
              value={routineTime}
              onChangeText={setRoutineTime}
              style={styles.modalInput}
            />

            <TouchableOpacity onPress={handleSaveRoutine} style={styles.modalSaveBtn}>
              <Typography size="base" weight="bold" color="#FFFFFF">
                Save Daily Routine
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add One-Time Reminder Modal */}
      <Modal visible={isAddReminderModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography size="lg" weight="bold" color="#0F172A">
                Add One-Time Reminder / Hospital
              </Typography>
              <TouchableOpacity onPress={() => setIsAddReminderModal(false)}>
                <X size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Typography size="xs" weight="bold" color="#64748B" style={{ marginTop: SPACING.sm }}>
              CATEGORY
            </Typography>
            <View style={styles.categorySelectRow}>
              {(['HOSPITAL', 'DOCTOR', 'APPOINTMENT', 'MEDICINE'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setRemCategory(cat)}
                  style={[styles.catSelectPill, remCategory === cat ? styles.activeCatSelectPill : null]}
                >
                  <Typography size="xs" weight="bold" color={remCategory === cat ? '#FFFFFF' : '#64748B'}>
                    {cat}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>

            <Typography size="xs" weight="bold" color="#64748B" style={{ marginTop: SPACING.md }}>
              TITLE (e.g. Hospital Visit) *
            </Typography>
            <TextInput
              placeholder="e.g. Apollo Hospital Cardiology Consultation"
              placeholderTextColor="#94A3B8"
              value={remTitle}
              onChangeText={setRemTitle}
              style={styles.modalInput}
            />

            <Typography size="xs" weight="bold" color="#64748B" style={{ marginTop: SPACING.sm }}>
              DATE / DAY
            </Typography>
            <TextInput
              placeholder="e.g. Upcoming Saturday or 15th Sep"
              placeholderTextColor="#94A3B8"
              value={remDate}
              onChangeText={setRemDate}
              style={styles.modalInput}
            />

            <Typography size="xs" weight="bold" color="#64748B" style={{ marginTop: SPACING.sm }}>
              TIME
            </Typography>
            <TextInput
              placeholder="e.g. 10:00 AM"
              placeholderTextColor="#94A3B8"
              value={remTime}
              onChangeText={setRemTime}
              style={styles.modalInput}
            />

            <Typography size="xs" weight="bold" color="#64748B" style={{ marginTop: SPACING.sm }}>
              NOTES / INSTRUCTIONS
            </Typography>
            <TextInput
              placeholder="e.g. Take fasting reports and doctor prescription"
              placeholderTextColor="#94A3B8"
              value={remDesc}
              onChangeText={setRemDesc}
              style={styles.modalInput}
            />

            <TouchableOpacity onPress={handleSaveReminder} style={styles.modalSaveBtn}>
              <Typography size="base" weight="bold" color="#FFFFFF">
                Save One-Time Reminder
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Offline Proximity Sync Modal */}
      <OfflineSyncModal
        visible={isOfflineSyncModal}
        mode="CAREGIVER_SHARE"
        onClose={() => setIsOfflineSyncModal(false)}
      />

      {/* Caregiver Bottom Nav */}
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
    paddingBottom: 110,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
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
  offlineSyncTopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  kpiIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: RADIUS.lg,
    padding: 3,
    marginVertical: SPACING.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  activeTabBtn: {
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingHorizontal: 2,
  },
  addPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cardList: {
    gap: SPACING.xs,
  },
  managementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  dateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  categoryPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginLeft: 6,
  },
  deleteIconButton: {
    padding: 8,
    borderRadius: RADIUS.md,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: SPACING.md,
  },
  settingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minutesSelectorRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  minutePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  minutePillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timesChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  addTimeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  timeInput: {
    flex: 1,
    backgroundColor: '#F8FAF8',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  addTimeBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categorySelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  catSelectPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    backgroundColor: '#F1F5F9',
  },
  activeCatSelectPill: {
    backgroundColor: COLORS.primary,
  },
  modalInput: {
    backgroundColor: '#F8FAF8',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    marginTop: 4,
  },
  modalSaveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
});
