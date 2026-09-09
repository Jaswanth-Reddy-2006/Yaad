import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Switch, Text, Platform, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
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
  Footprints,
  Utensils,
  Trash2,
  RefreshCw,
  Users,
  Eye,
  Activity,
  User,
  Key,
  Check,
  Camera,
  Image as ImageIcon,
} from 'lucide-react-native';
import { CaregiverBottomNavBar } from '../../components/caregiver/CaregiverBottomNavBar';
import { OfflineSyncModal } from '../../components/common/OfflineSyncModal';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useCaregiverStore } from '../../store/useCaregiverStore';
import { authService } from '../../services/AuthService';
import { offlineProximitySync } from '../../services/sync/OfflineProximitySync';
import { RoutineScheduleItem, Reminder, PatientGameSchedule, FamilyMemberRecallItem, ObjectRecallItem } from '../../types';

export default function CareScheduleScreen() {
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

  const [currentTab, setCurrentTab] = useState<'DAILY' | 'REMINDERS' | 'ALARMS' | 'RECALL'>('DAILY');
  const [recallSubTab, setRecallSubTab] = useState<'FAMILY' | 'OBJECTS'>('FAMILY');

  const [routineList, setRoutineList] = useState<RoutineScheduleItem[]>([]);
  const [remindersList, setRemindersList] = useState<Reminder[]>([]);
  const [gameSchedule, setGameSchedule] = useState<PatientGameSchedule>({
    patientId: activePatient.id,
    playTimes: ['11:00 AM', '05:00 PM'],
    minimumPlaytimeMinutes: 10,
    playedMinutesToday: 0,
    isAlarmEnabled: true,
  });

  const [isAddRoutineModal, setIsAddRoutineModal] = useState(false);
  const [isAddReminderModal, setIsAddReminderModal] = useState(false);
  const [isOfflineSyncModal, setIsOfflineSyncModal] = useState(false);

  // Form states - Routine
  const [routineTitle, setRoutineTitle] = useState('');
  const [routineTime, setRoutineTime] = useState('9:00 AM');
  const [routineCategory, setRoutineCategory] = useState<RoutineScheduleItem['category']>('MEDICINE');
  const [routineNotes, setRoutineNotes] = useState('');

  // Form states - One-Time Reminder
  const [remTitle, setRemTitle] = useState('');
  const [remDesc, setRemDesc] = useState('');
  const [remDate, setRemDate] = useState('Upcoming Saturday');
  const [remTime, setRemTime] = useState('10:00 AM');
  const [remCategory, setRemCategory] = useState<Reminder['category']>('HOSPITAL');

  // Form states - Game Alarm
  const [newPlayTime, setNewPlayTime] = useState('');

  // Live Lists for Recall Memory
  const [familyList, setFamilyList] = useState<FamilyMemberRecallItem[]>([]);
  const [objectList, setObjectList] = useState<ObjectRecallItem[]>([]);

  // Modals for Recall Memory
  const [isAddFamilyModal, setIsAddFamilyModal] = useState(false);
  const [isAddObjectModal, setIsAddObjectModal] = useState(false);

  // Form states - Family Member
  const [famName, setFamName] = useState('');
  const [famRelation, setFamRelation] = useState('Son');
  const [famNotes, setFamNotes] = useState('');
  const [famPreset, setFamPreset] = useState<'son' | 'daughter' | 'grandson' | 'granddaughter' | 'spouse' | 'brother' | 'sister' | 'friend'>('son');
  const [famPhotoUri, setFamPhotoUri] = useState<string | null>(null);

  // Form states - Object Recall
  const [objName, setObjName] = useState('');
  const [objLocation, setObjLocation] = useState('');
  const [objNotes, setObjNotes] = useState('');
  const [objPreset, setObjPreset] = useState<'glasses' | 'keys' | 'medicine' | 'walking_stick' | 'wallet' | 'watch' | 'water_bottle' | 'book'>('glasses');
  const [objPhotoUri, setObjPhotoUri] = useState<string | null>(null);

  const pickFamilyImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permission is required to select photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setFamPhotoUri(uri);
      }
    } catch (e) {
      console.warn('Error picking image', e);
    }
  };

  const pickObjectImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permission is required to select photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setObjPhotoUri(uri);
      }
    } catch (e) {
      console.warn('Error picking image', e);
    }
  };

  const loadData = useCallback(async () => {
    const routine = await offlineProximitySync.getRoutineSchedule(activePatient.id);
    const rems = await offlineProximitySync.getOneTimeReminders(activePatient.id);
    const games = await offlineProximitySync.getGameSchedule(activePatient.id);
    setRoutineList(routine);
    setRemindersList(rems);
    setGameSchedule(games);
    const fams = await offlineProximitySync.getFamilyMembers(activePatient.id);
    const objs = await offlineProximitySync.getObjectRecallItems(activePatient.id);
    setFamilyList(fams);
    setObjectList(objs);
  }, [activePatient.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleComplete = async (item: RoutineScheduleItem) => {
    const updated = await offlineProximitySync.toggleRoutineItem(item.id);
    setRoutineList(updated);
  };

  const handleSaveRoutine = async () => {
    if (!routineTitle.trim()) {
      Alert.alert('Missing Name', 'Please enter a task name.');
      return;
    }
    const updated = await offlineProximitySync.addRoutineItem({
      patientId: activePatient.id,
      time: routineTime,
      title: routineTitle.trim(),
      category: routineCategory,
      repeat: 'DAILY',
    });
    setRoutineList(updated);
    setRoutineTitle('');
    setRoutineNotes('');
    setIsAddRoutineModal(false);
  };

  const handleDeleteRoutine = async (id: string) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this daily task?', [
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

  const handleSaveReminder = async () => {
    if (!remTitle.trim()) {
      Alert.alert('Missing Title', 'Please provide a title for the reminder.');
      return;
    }
    const updated = await offlineProximitySync.addOneTimeReminder({
      patientId: activePatient.id,
      title: remTitle.trim(),
      description: remDesc.trim(),
      category: remCategory,
      scheduledTime: `${remDate} at ${remTime}`,
      repeat: 'ONCE',
      alarmEnabled: true,
    });
    setRemindersList(updated);
    setRemTitle('');
    setRemDesc('');
    setIsAddReminderModal(false);
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

  const handleSaveFamilyMember = async () => {
    if (!famName.trim()) {
      Alert.alert('Missing Name', "Please enter the family member's name.");
      return;
    }
    const updated = await offlineProximitySync.addFamilyMember({
      patientId: activePatient.id,
      name: famName.trim(),
      relation: famRelation.trim(),
      notes: famNotes.trim(),
      avatarPreset: famPreset,
      photoUri: famPhotoUri || undefined,
    });
    setFamilyList(updated);
    setFamName('');
    setFamNotes('');
    setFamPhotoUri(null);
    setIsAddFamilyModal(false);
  };

  const handleDeleteFamilyMember = async (id: string) => {
    Alert.alert('Delete Family Member', 'Are you sure you want to remove this family member?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = await offlineProximitySync.deleteFamilyMember(id);
          setFamilyList(updated);
        },
      },
    ]);
  };

  const handleSaveObject = async () => {
    if (!objName.trim()) {
      Alert.alert('Missing Name', 'Please enter the object name.');
      return;
    }
    if (!objLocation.trim()) {
      Alert.alert('Missing Location', 'Please specify where this item is usually kept.');
      return;
    }
    const updated = await offlineProximitySync.addObjectRecallItem({
      patientId: activePatient.id,
      name: objName.trim(),
      location: objLocation.trim(),
      notes: objNotes.trim(),
      iconPreset: objPreset,
      photoUri: objPhotoUri || undefined,
    });
    setObjectList(updated);
    setObjName('');
    setObjLocation('');
    setObjNotes('');
    setObjPhotoUri(null);
    setIsAddObjectModal(false);
  };

  const handleDeleteObject = async (id: string) => {
    Alert.alert('Delete Object', 'Are you sure you want to remove this object?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = await offlineProximitySync.deleteObjectRecallItem(id);
          setObjectList(updated);
        },
      },
    ]);
  };

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'MEDICINE':
        return { Icon: Pill, bg: '#DCFCE7', color: '#15803D', badge: 'MEDICINE' };
      case 'HYDRATION':
        return { Icon: Droplet, bg: '#DBEAFE', color: '#1D4ED8', badge: 'WATER' };
      case 'ACTIVITY':
        return { Icon: Activity, bg: '#FEF3C7', color: '#B45309', badge: 'ACTIVITY' };
      case 'WALK':
        return { Icon: Footprints, bg: '#F3E8FF', color: '#6D28D9', badge: 'WALK' };
      case 'MEAL':
        return { Icon: Utensils, bg: '#FFEDD5', color: '#C2410C', badge: 'MEAL' };
      default:
        return { Icon: Calendar, bg: '#F1F5F3', color: '#475569', badge: 'ROUTINE' };
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.mobileConstraint}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              accessibilityLabel="Go to Home"
              accessibilityRole="button"
              onPress={() => router.push('/caregiver/home')}
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={18} color="#111827" />
            </TouchableOpacity>
            <View style={styles.headerTitleCol}>
              <Text style={styles.headerTitle} numberOfLines={1}>Care Schedule</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                Routines for <Text style={styles.boldName}>{activePatient.name}</Text>
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsOfflineSyncModal(true)}
            style={styles.syncBtn}
          >
            <RefreshCw size={12} color="#16A34A" />
            <Text style={styles.syncBtnText}>Sync</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Patient Context Tag */}
          <View style={styles.patientContextRow}>
            <Text style={styles.patientContextText}>
              Care Schedule for <Text style={styles.patientContextName}>{activePatient.name}</Text>
            </Text>
          </View>

          {/* 4-Item Compact Summary Row */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{routineList.length || 6}</Text>
              <Text style={styles.summaryLabel}>Tasks</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{remindersList.length || 2}</Text>
              <Text style={styles.summaryLabel}>Visits</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{gameSchedule.minimumPlaytimeMinutes}m</Text>
              <Text style={styles.summaryLabel}>Goal</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{familyList.length + objectList.length || 9}</Text>
              <Text style={styles.summaryLabel}>Cards</Text>
            </View>
          </View>

          {/* Tabs: Daily | Reminders | Alarms | Recall */}
          <View style={styles.tabsContainer}>
            {[
              { key: 'DAILY', label: 'Daily' },
              { key: 'REMINDERS', label: 'Reminders' },
              { key: 'ALARMS', label: 'Alarms' },
              { key: 'RECALL', label: 'Recall' },
            ].map((tab) => {
              const isActive = currentTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  activeOpacity={0.8}
                  onPress={() => setCurrentTab(tab.key as any)}
                  style={[styles.tabButton, isActive && styles.tabButtonActive]}
                >
                  <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* TAB 1: DAILY ROUTINE */}
          {currentTab === 'DAILY' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Today's Routine</Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setIsAddRoutineModal(true)}
                  style={styles.addTaskBtn}
                >
                  <Plus size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.addTaskBtnText}>Add Task</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.taskList}>
                {routineList.map((item) => {
                  const config = getCategoryConfig(item.category);
                  const IconComponent = config.Icon;
                  return (
                    <View key={item.id} style={styles.structuredTaskCard}>
                      {/* Top Header Row in Card: Time + Category Badge + Delete Button */}
                      <View style={styles.cardHeaderRow}>
                        <View style={styles.cardHeaderLeft}>
                          <View style={[styles.miniCategoryIcon, { backgroundColor: config.bg }]}>
                            <IconComponent size={12} color={config.color} />
                          </View>
                          <Text style={styles.cardTimeText}>{item.time}</Text>
                          <View style={[styles.categoryBadge, { backgroundColor: config.bg }]}>
                            <Text style={[styles.categoryBadgeText, { color: config.color }]}>
                              {config.badge}
                            </Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleDeleteRoutine(item.id)}
                          style={styles.trashBtn}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Trash2 size={15} color="#94A3B8" />
                        </TouchableOpacity>
                      </View>

                      {/* Middle: Full-width Task Name (Zero Overlapping Guaranteed) */}
                      <Text style={styles.cardTaskTitle}>{item.title}</Text>

                      {/* Bottom Footer: Status Toggle Button */}
                      <View style={styles.cardFooterRow}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => handleToggleComplete(item)}
                          style={[
                            styles.statusBtn,
                            item.isCompleted ? styles.statusBtnCompleted : styles.statusBtnUpcoming,
                          ]}
                        >
                          {item.isCompleted ? (
                            <>
                              <Check size={13} color="#15803D" style={{ marginRight: 4 }} />
                              <Text style={styles.statusBtnTextCompleted}>Completed</Text>
                            </>
                          ) : (
                            <>
                              <View style={styles.upcomingDot} />
                              <Text style={styles.statusBtnTextUpcoming}>Mark as Done</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* TAB 2: REMINDERS / APPOINTMENTS */}
          {currentTab === 'REMINDERS' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Appointments & Reminders</Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setIsAddReminderModal(true)}
                  style={styles.addTaskBtn}
                >
                  <Plus size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.addTaskBtnText}>Add Reminder</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.taskList}>
                {remindersList.map((rem) => (
                  <View key={rem.id} style={styles.structuredTaskCard}>
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.cardHeaderLeft}>
                        <Calendar size={14} color="#2563EB" style={{ marginRight: 4 }} />
                        <Text style={styles.cardTimeText}>{rem.scheduledTime}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleDeleteReminder(rem.id)} style={styles.trashBtn}>
                        <Trash2 size={15} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.cardTaskTitle}>{rem.title}</Text>
                    {rem.description ? (
                      <Text style={styles.cardTaskNotes}>{rem.description}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 3: GAME ALARMS */}
          {currentTab === 'ALARMS' && (
            <View style={styles.tabContent}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Daily Game Times</Text>
              </View>

              <View style={styles.structuredTaskCard}>
                <View style={styles.settingRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.settingTitle}>Game Alarms Enabled</Text>
                    <Text style={styles.settingSub}>Plays audio reminder when it is game time</Text>
                  </View>
                  <Switch
                    value={gameSchedule.isAlarmEnabled}
                    onValueChange={handleToggleGameAlarm}
                    trackColor={{ false: '#E2E8E5', true: '#DCFCE7' }}
                    thumbColor={gameSchedule.isAlarmEnabled ? '#16A34A' : '#94A3B8'}
                  />
                </View>

                <View style={styles.cardDivider} />

                <Text style={styles.settingTitle}>Minimum Daily Playtime</Text>
                <View style={styles.playtimePillsRow}>
                  {[5, 10, 15, 20].map((mins) => (
                    <TouchableOpacity
                      key={mins}
                      onPress={() => handleChangeMinPlaytime(mins)}
                      style={[
                        styles.playtimePill,
                        gameSchedule.minimumPlaytimeMinutes === mins && styles.playtimePillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.playtimePillText,
                          gameSchedule.minimumPlaytimeMinutes === mins && styles.playtimePillTextActive,
                        ]}
                      >
                        {mins}m
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.cardDivider} />

                <Text style={styles.settingTitle}>Scheduled Alarm Times</Text>
                <View style={styles.alarmTimesList}>
                  {gameSchedule.playTimes.map((time) => (
                    <View key={time} style={styles.alarmTimePill}>
                      <Clock size={13} color="#16A34A" style={{ marginRight: 4 }} />
                      <Text style={styles.alarmTimeText}>{time}</Text>
                      <TouchableOpacity onPress={() => handleRemoveGameTime(time)} style={{ marginLeft: 6 }}>
                        <X size={13} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>

                <View style={styles.addTimeRow}>
                  <TextInput
                    style={styles.timeInput}
                    placeholder="e.g. 03:00 PM"
                    placeholderTextColor="#94A3B8"
                    value={newPlayTime}
                    onChangeText={setNewPlayTime}
                  />
                  <TouchableOpacity onPress={handleAddGameTime} style={styles.addTimeBtn}>
                    <Text style={styles.addTimeBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* TAB 4: RECALL CARDS */}
          {currentTab === 'RECALL' && (
            <View style={styles.tabContent}>
              <View style={styles.recallSubTabsRow}>
                <TouchableOpacity
                  onPress={() => setRecallSubTab('FAMILY')}
                  style={[styles.recallSubTab, recallSubTab === 'FAMILY' && styles.recallSubTabActive]}
                >
                  <Users size={14} color={recallSubTab === 'FAMILY' ? '#16A34A' : '#64748B'} style={{ marginRight: 4 }} />
                  <Text style={[styles.recallSubTabText, recallSubTab === 'FAMILY' && styles.recallSubTabTextActive]}>
                    Family ({familyList.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setRecallSubTab('OBJECTS')}
                  style={[styles.recallSubTab, recallSubTab === 'OBJECTS' && styles.recallSubTabActive]}
                >
                  <Eye size={14} color={recallSubTab === 'OBJECTS' ? '#16A34A' : '#64748B'} style={{ marginRight: 4 }} />
                  <Text style={[styles.recallSubTabText, recallSubTab === 'OBJECTS' && styles.recallSubTabTextActive]}>
                    Objects ({objectList.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {recallSubTab === 'FAMILY' ? (
                <View>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>Family Members</Text>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setIsAddFamilyModal(true)}
                      style={styles.addTaskBtn}
                    >
                      <Plus size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.addTaskBtnText}>Add Family</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.taskList}>
                    {familyList.map((fam) => (
                      <View key={fam.id} style={styles.recallCard}>
                        {fam.photoUri ? (
                          <Image source={{ uri: fam.photoUri }} style={[styles.recallPhotoThumb as any]} />
                        ) : (
                          <View style={styles.recallAvatarCircle}>
                            <User size={24} color="#15803D" />
                          </View>
                        )}
                        <View style={styles.recallDetails}>
                          <Text style={styles.recallTitle}>{fam.name}</Text>
                          <Text style={styles.recallRelation}>{fam.relation} to {activePatient.name}</Text>
                          {fam.notes ? <Text style={styles.recallNotes}>{fam.notes}</Text> : null}
                        </View>
                        <TouchableOpacity onPress={() => handleDeleteFamilyMember(fam.id)} style={styles.trashBtn}>
                          <Trash2 size={18} color="#94A3B8" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <View>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>Everyday Objects</Text>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setIsAddObjectModal(true)}
                      style={styles.addTaskBtn}
                    >
                      <Plus size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.addTaskBtnText}>Add Object</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.taskList}>
                    {objectList.map((obj) => (
                      <View key={obj.id} style={styles.recallCard}>
                        {obj.photoUri ? (
                          <Image source={{ uri: obj.photoUri }} style={[styles.recallPhotoThumb as any]} />
                        ) : (
                          <View style={[styles.recallAvatarCircle, { backgroundColor: '#FEF3C7' }]}>
                            <Key size={22} color="#B45309" />
                          </View>
                        )}
                        <View style={styles.recallDetails}>
                          <Text style={styles.recallTitle}>{obj.name}</Text>
                          <Text style={styles.recallLocation}>Kept at: {obj.location}</Text>
                          {obj.notes ? <Text style={styles.recallNotes}>{obj.notes}</Text> : null}
                        </View>
                        <TouchableOpacity onPress={() => handleDeleteObject(obj.id)} style={styles.trashBtn}>
                          <Trash2 size={18} color="#94A3B8" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Clearance for Bottom Nav */}
          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Add Routine Modal */}
        <Modal visible={isAddRoutineModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalSheetTitle}>Add Daily Task</Text>
                <TouchableOpacity onPress={() => setIsAddRoutineModal(false)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Text style={styles.inputLabel}>Task Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Morning Blood Pressure Medicine"
                  placeholderTextColor="#94A3B8"
                  value={routineTitle}
                  onChangeText={setRoutineTitle}
                />

                <Text style={styles.inputLabel}>Scheduled Time</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 9:00 AM"
                  placeholderTextColor="#94A3B8"
                  value={routineTime}
                  onChangeText={setRoutineTime}
                />

                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categoryPickerRow}>
                  {(['MEDICINE', 'HYDRATION', 'MEAL', 'WALK', 'ACTIVITY', 'ROUTINE'] as const).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setRoutineCategory(cat)}
                      style={[
                        styles.catPickerPill,
                        routineCategory === cat && styles.catPickerPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.catPickerText,
                          routineCategory === cat && styles.catPickerTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                  placeholder="e.g. Take with warm water"
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={routineNotes}
                  onChangeText={setRoutineNotes}
                />

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleSaveRoutine}
                  style={styles.saveSubmitBtn}
                >
                  <Text style={styles.saveSubmitBtnText}>Save Task to Routine</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Add Reminder Modal */}
        <Modal visible={isAddReminderModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalSheetTitle}>Add Reminder</Text>
                <TouchableOpacity onPress={() => setIsAddReminderModal(false)}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Dr. Sharma Clinic Checkup"
                  placeholderTextColor="#94A3B8"
                  value={remTitle}
                  onChangeText={setRemTitle}
                />

                <Text style={styles.inputLabel}>Date & Time</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Upcoming Saturday at 10:00 AM"
                  placeholderTextColor="#94A3B8"
                  value={remDate}
                  onChangeText={setRemDate}
                />

                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                  placeholder="e.g. Carry medical file"
                  placeholderTextColor="#94A3B8"
                  multiline
                  value={remDesc}
                  onChangeText={setRemDesc}
                />

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleSaveReminder}
                  style={styles.saveSubmitBtn}
                >
                  <Text style={styles.saveSubmitBtnText}>Save Reminder</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Add Family Modal */}
        <Modal visible={isAddFamilyModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalSheetTitle}>Add Family Member</Text>
                <TouchableOpacity onPress={() => {
                  setIsAddFamilyModal(false);
                  setFamPhotoUri(null);
                }}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Photo Picker */}
                <Text style={styles.inputLabel}>Family Member Photo</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={pickFamilyImage}
                  style={styles.photoUploadBox}
                >
                  {famPhotoUri ? (
                    <View style={styles.photoPreviewWrapper}>
                      <Image source={{ uri: famPhotoUri }} style={[styles.photoPreviewImage as any]} />
                      <View style={styles.photoOverlayBadge}>
                        <Camera size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={styles.photoOverlayText}>Change</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <View style={styles.cameraIconCircle}>
                        <Camera size={22} color="#16A34A" />
                      </View>
                      <Text style={styles.photoUploadPrompt}>Tap to add picture</Text>
                      <Text style={styles.photoUploadSub}>Helps patient recognize them easily</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {famPhotoUri ? (
                  <TouchableOpacity onPress={() => setFamPhotoUri(null)} style={styles.removePhotoBtn}>
                    <Text style={styles.removePhotoText}>Remove photo</Text>
                  </TouchableOpacity>
                ) : null}

                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Ramesh"
                  placeholderTextColor="#94A3B8"
                  value={famName}
                  onChangeText={setFamName}
                />

                <Text style={styles.inputLabel}>Relationship</Text>
                <View style={styles.categoryPickerRow}>
                  {['Son', 'Daughter', 'Grandson', 'Granddaughter', 'Spouse', 'Brother', 'Sister', 'Friend'].map((rel) => (
                    <TouchableOpacity
                      key={rel}
                      onPress={() => setFamRelation(rel)}
                      style={[styles.catPickerPill, famRelation === rel && styles.catPickerPillActive]}
                    >
                      <Text style={[styles.catPickerText, famRelation === rel && styles.catPickerTextActive]}>
                        {rel}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Memory Clue (Optional)</Text>
                <TextInput
                  style={[styles.textInput, { height: 54 }]}
                  placeholder="e.g. Calls every Sunday morning"
                  placeholderTextColor="#94A3B8"
                  value={famNotes}
                  onChangeText={setFamNotes}
                />

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleSaveFamilyMember}
                  style={styles.saveSubmitBtn}
                >
                  <Text style={styles.saveSubmitBtnText}>Save to Recall Cards</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Add Object Modal */}
        <Modal visible={isAddObjectModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalSheetTitle}>Add Everyday Object</Text>
                <TouchableOpacity onPress={() => {
                  setIsAddObjectModal(false);
                  setObjPhotoUri(null);
                }}>
                  <X size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Object Photo Picker */}
                <Text style={styles.inputLabel}>Object Photo</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={pickObjectImage}
                  style={styles.photoUploadBox}
                >
                  {objPhotoUri ? (
                    <View style={styles.photoPreviewWrapper}>
                      <Image source={{ uri: objPhotoUri }} style={[styles.photoPreviewImage as any]} />
                      <View style={styles.photoOverlayBadge}>
                        <Camera size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={styles.photoOverlayText}>Change</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <View style={[styles.cameraIconCircle, { backgroundColor: '#FEF3C7' }]}>
                        <Camera size={22} color="#D97706" />
                      </View>
                      <Text style={styles.photoUploadPrompt}>Tap to add photo of object</Text>
                      <Text style={styles.photoUploadSub}>e.g. Grandma's actual glasses, keys, or mug</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {objPhotoUri ? (
                  <TouchableOpacity onPress={() => setObjPhotoUri(null)} style={styles.removePhotoBtn}>
                    <Text style={styles.removePhotoText}>Remove photo</Text>
                  </TouchableOpacity>
                ) : null}

                <Text style={styles.inputLabel}>Object Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Reading Glasses"
                  placeholderTextColor="#94A3B8"
                  value={objName}
                  onChangeText={setObjName}
                />

                <Text style={styles.inputLabel}>Usual Location *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Bedside table top drawer"
                  placeholderTextColor="#94A3B8"
                  value={objLocation}
                  onChangeText={setObjLocation}
                />

                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.textInput, { height: 54 }]}
                  placeholder="e.g. In the blue case"
                  placeholderTextColor="#94A3B8"
                  value={objNotes}
                  onChangeText={setObjNotes}
                />

                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleSaveObject}
                  style={styles.saveSubmitBtn}
                >
                  <Text style={styles.saveSubmitBtnText}>Save Object Card</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Proximity QR Sync Modal */}
        <OfflineSyncModal
          visible={isOfflineSyncModal}
          mode="CAREGIVER_SHARE"
          patientName={activePatient.name}
          onClose={() => {
            setIsOfflineSyncModal(false);
            loadData();
          }}
          onSuccess={() => {
            loadData();
          }}
        />

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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.xs,
    backgroundColor: '#F7FAF8',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
    borderWidth: 1,
    borderColor: '#E2E8E5',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  boldName: {
    fontWeight: '700',
    color: '#16A34A',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  syncBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#12803A',
    marginLeft: 3,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
  },
  patientContextRow: {
    marginVertical: SPACING.xs,
    paddingHorizontal: 4,
  },
  patientContextText: {
    fontSize: 15,
    color: '#64748B',
  },
  patientContextName: {
    fontWeight: '800',
    color: '#16A34A',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E2E8E5',
    marginBottom: SPACING.xs,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#F1F5F3',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F3',
    borderRadius: RADIUS.full,
    padding: 4,
    marginBottom: SPACING.xs,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.full,
  },
  tabButtonActive: {
    backgroundColor: '#16A34A',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  tabContent: {
    marginTop: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  addTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
  },
  addTaskBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  taskList: {
    gap: SPACING.xs,
  },
  structuredTaskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E2E8E5',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniCategoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  cardTimeText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
    marginRight: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  trashBtn: {
    padding: 6,
  },
  cardTaskTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#111827',
    marginVertical: 4,
    lineHeight: 22,
  },
  cardTaskNotes: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 6,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  statusBtnUpcoming: {
    backgroundColor: '#F1F5F3',
  },
  statusBtnCompleted: {
    backgroundColor: '#DCFCE7',
  },
  upcomingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#94A3B8',
    marginRight: 6,
  },
  statusBtnTextUpcoming: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  statusBtnTextCompleted: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  settingSub: {
    fontSize: 13.5,
    color: '#64748B',
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F3',
    marginVertical: SPACING.sm,
  },
  playtimePillsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  playtimePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    backgroundColor: '#F1F5F3',
    alignItems: 'center',
  },
  playtimePillActive: {
    backgroundColor: '#16A34A',
  },
  playtimePillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  playtimePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  alarmTimesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  alarmTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  alarmTimeText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#15803D',
  },
  addTimeRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  timeInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#F7FAF8',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    fontSize: 14.5,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E2E8E5',
  },
  addTimeBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTimeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recallSubTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F3',
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.xs,
  },
  recallSubTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  recallSubTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  recallSubTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  recallSubTabTextActive: {
    color: '#16A34A',
    fontWeight: '800',
  },
  recallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E2E8E5',
  },
  recallPhotoThumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    marginRight: SPACING.sm,
    backgroundColor: '#E2E8E5',
  },
  recallAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  recallDetails: {
    flex: 1,
  },
  recallTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#111827',
  },
  recallRelation: {
    fontSize: 13.5,
    color: '#16A34A',
    fontWeight: '700',
    marginTop: 2,
  },
  recallLocation: {
    fontSize: 13.5,
    color: '#B45309',
    fontWeight: '700',
    marginTop: 2,
  },
  recallNotes: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  photoUploadBox: {
    backgroundColor: '#F8FAF8',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  photoPreviewWrapper: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOverlayBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoOverlayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  photoPlaceholder: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cameraIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  photoUploadPrompt: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#111827',
  },
  photoUploadSub: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  removePhotoBtn: {
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  removePhotoText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F3',
  },
  modalSheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modalBody: {
    marginTop: SPACING.sm,
  },
  inputLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
    marginTop: SPACING.xs,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#F7FAF8',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 10,
    fontSize: 14.5,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E2E8E5',
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  catPickerPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F3',
  },
  catPickerPillActive: {
    backgroundColor: '#16A34A',
  },
  catPickerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  catPickerTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  saveSubmitBtn: {
    backgroundColor: '#16A34A',
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  saveSubmitBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
