import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, CheckCircle2, Clock, Pill, Droplet, Brain, Calendar, X } from 'lucide-react-native';
import { Typography } from '../../components/common/Typography';
import { CaregiverBottomNavBar } from '../../components/caregiver/CaregiverBottomNavBar';
import { ActivePatientSwitcher } from '../../components/caregiver/ActivePatientSwitcher';
import { AppLogo } from '../../components/common/AppLogo';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useCaregiverStore, CaregiverReminder } from '../../store/useCaregiverStore';

export default function RemindersScreen() {
  const router = useRouter();
  const { reminders, addReminder, toggleReminderStatus, patients, activePatientId } = useCaregiverStore();

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0] || {
    id: 'p-1',
    name: 'Amma'
  };

  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Manage'>('Upcoming');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Medicine' | 'Water' | 'Activities'>('All');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  // New Reminder Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CaregiverReminder['category']>('MEDICINE');
  const [scheduledTime, setScheduledTime] = useState('9:00 AM');
  const [repeat, setRepeat] = useState<CaregiverReminder['repeat']>('DAILY');

  const activePatientReminders = reminders.filter((r) => r.patientId === activePatient.id);

  React.useEffect(() => {
    if (!activePatient.id) return;
    async function fetchReminders() {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/caregiver/patients/${activePatient.id}/reminders`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const mappedReminders: CaregiverReminder[] = data.map((item: any) => ({
              id: item.id,
              patientId: item.patient_id,
              title: item.title,
              description: item.description,
              category: item.category || 'MEDICINE',
              scheduledTime: item.scheduled_time || '9:00 AM',
              status: item.status || 'UPCOMING',
              repeat: 'DAILY'
            }));
            // Merge into store
            useCaregiverStore.setState((state) => {
              const otherReminders = state.reminders.filter(r => r.patientId !== activePatient.id);
              return { reminders: [...otherReminders, ...mappedReminders] };
            });
          }
        }
      } catch (err) {}
    }
    fetchReminders();
  }, [activePatient.id]);

  const filteredReminders = activePatientReminders.filter((r) => {
    if (activeCategory === 'Medicine') return r.category === 'MEDICINE';
    if (activeCategory === 'Water') return r.category === 'HYDRATION';
    if (activeCategory === 'Activities') return r.category === 'ACTIVITY';
    return true;
  });

  const handleSaveReminder = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for the reminder.');
      return;
    }

    addReminder({
      patientId: activePatient.id,
      title,
      description,
      category,
      scheduledTime,
      repeat
    });

    setTitle('');
    setDescription('');
    setIsAddModalVisible(false);
    Alert.alert('Reminder Created', `New care reminder added for ${activePatient.name}.`);
  };

  const getCategoryIcon = (cat: CaregiverReminder['category']) => {
    switch (cat) {
      case 'MEDICINE':
        return <Pill size={22} color="#EA580C" />;
      case 'HYDRATION':
        return <Droplet size={22} color="#2563EB" />;
      case 'ACTIVITY':
        return <Brain size={22} color="#8B5CF6" />;
      case 'APPOINTMENT':
        return <Calendar size={22} color="#DC2626" />;
      default:
        return <Clock size={22} color="#16A34A" />;
    }
  };

  const getCategoryBg = (cat: CaregiverReminder['category']) => {
    switch (cat) {
      case 'MEDICINE':
        return '#FFEDD5';
      case 'HYDRATION':
        return '#DBEAFE';
      case 'ACTIVITY':
        return '#F3E8FF';
      case 'APPOINTMENT':
        return '#FEE2E2';
      default:
        return '#DCFCE7';
    }
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header Row with Active Patient Switcher */}
        <View style={styles.topHeaderRow}>
          <AppLogo size="normal" />
          <ActivePatientSwitcher />
        </View>

        {/* Header Title */}
        <View style={{ marginVertical: SPACING.sm }}>
          <Typography size="xxl" weight="bold" color="#0F172A">
            Reminders & Care Plan
          </Typography>
          <Typography size="xs" color="#64748B" style={{ marginTop: 2 }}>
            Scheduled care tasks for <Typography size="xs" weight="bold" color="#16A34A">{activePatient.name}</Typography>
          </Typography>
        </View>

        {/* Tab Pills */}
        <View style={styles.tabsRow}>
          {(['Upcoming', 'Manage'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabPill, isActive ? styles.activeTabPill : null]}
              >
                <Typography size="sm" weight={isActive ? 'bold' : 'medium'} color={isActive ? '#16A34A' : '#64748B'}>
                  {tab}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {(['All', 'Medicine', 'Water', 'Activities'] as const).map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.8}
                onPress={() => setActiveCategory(cat)}
                style={[styles.categoryPill, isActive ? styles.activeCategoryPill : null]}
              >
                <Typography size="xs" weight={isActive ? 'bold' : 'medium'} color={isActive ? '#FFFFFF' : '#64748B'}>
                  {cat}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Today's Care Schedule */}
        <Typography size="base" weight="bold" color="#0F172A" style={{ marginTop: SPACING.md }}>
          Today's Care Schedule ({activePatient.name})
        </Typography>

        <View style={styles.remindersList}>
          {filteredReminders.map((rem) => {
            const isCompleted = rem.status === 'COMPLETED';
            return (
              <TouchableOpacity
                key={rem.id}
                activeOpacity={0.88}
                onPress={() => toggleReminderStatus(rem.id, isCompleted ? 'UPCOMING' : 'COMPLETED')}
                style={styles.reminderCard}
              >
                <View style={[styles.iconCircle, { backgroundColor: getCategoryBg(rem.category) }]}>
                  {getCategoryIcon(rem.category)}
                </View>
                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <Typography size="base" weight="bold" color="#0F172A">
                    {rem.title}
                  </Typography>
                  <Typography size="xs" color="#64748B" style={{ marginTop: 2 }}>
                    {rem.scheduledTime} • {rem.description || rem.category}
                  </Typography>
                </View>

                {isCompleted ? (
                  <View style={styles.completedBadge}>
                    <CheckCircle2 size={16} color="#16A34A" style={{ marginRight: 4 }} />
                    <Typography size="xs" weight="bold" color="#16A34A">
                      Done {rem.completedAt ? `(${rem.completedAt})` : ''}
                    </Typography>
                  </View>
                ) : (
                  <View style={styles.pendingPill}>
                    <Typography size="xs" weight="bold" color="#D97706">
                      Pending
                    </Typography>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add Reminder Primary Button */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => setIsAddModalVisible(true)}
          style={styles.addReminderBtn}
        >
          <Plus size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Typography size="base" weight="bold" color="#FFFFFF">
            Add New Reminder for {activePatient.name}
          </Typography>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Reminder Interactive Form Modal */}
      <Modal visible={isAddModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography size="lg" weight="bold" color="#0F172A">
                Create Care Reminder ({activePatient.name})
              </Typography>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Category Select */}
            <Typography size="xs" weight="bold" color="#64748B" style={{ marginTop: SPACING.sm }}>
              CATEGORY
            </Typography>
            <View style={styles.categorySelectRow}>
              {(['MEDICINE', 'HYDRATION', 'ACTIVITY', 'APPOINTMENT', 'ROUTINE'] as const).map((catItem) => (
                <TouchableOpacity
                  key={catItem}
                  onPress={() => setCategory(catItem)}
                  style={[styles.catSelectPill, category === catItem ? styles.activeCatSelectPill : null]}
                >
                  <Typography size="xs" weight="bold" color={category === catItem ? '#FFFFFF' : '#64748B'}>
                    {catItem}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>

            {/* Title Input */}
            <Typography size="xs" weight="bold" color="#64748B" style={{ marginTop: SPACING.md }}>
              TITLE *
            </Typography>
            <TextInput
              placeholder="e.g. Evening Blood Pressure Medication"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
              style={styles.modalInput}
            />

            {/* Description Input */}
            <Typography size="xs" weight="bold" color="#64748B" style={{ marginTop: SPACING.sm }}>
              DESCRIPTION / INSTRUCTIONS
            </Typography>
            <TextInput
              placeholder="e.g. Take with 1 glass of water after meal"
              placeholderTextColor="#94A3B8"
              value={description}
              onChangeText={setDescription}
              style={styles.modalInput}
            />

            {/* Time & Repeat Row */}
            <View style={{ flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm }}>
              <View style={{ flex: 1 }}>
                <Typography size="xs" weight="bold" color="#64748B">
                  TIME
                </Typography>
                <TextInput
                  placeholder="e.g. 9:00 PM"
                  placeholderTextColor="#94A3B8"
                  value={scheduledTime}
                  onChangeText={setScheduledTime}
                  style={styles.modalInput}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Typography size="xs" weight="bold" color="#64748B">
                  REPEAT
                </Typography>
                <View style={styles.repeatPill}>
                  <Typography size="xs" weight="bold" color="#16A34A">
                    {repeat}
                  </Typography>
                </View>
              </View>
            </View>

            {/* Modal Save Button */}
            <TouchableOpacity onPress={handleSaveReminder} style={styles.modalSaveBtn}>
              <Typography size="base" weight="bold" color="#FFFFFF">
                Save Care Reminder
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
  tabsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.md,
  },
  tabPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    backgroundColor: '#F1F5F9',
  },
  activeTabPill: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  categoriesScroll: {
    marginBottom: SPACING.xs,
  },
  categoryPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F9',
    marginRight: SPACING.xs,
  },
  activeCategoryPill: {
    backgroundColor: '#16A34A',
  },
  remindersList: {
    gap: SPACING.xs,
    marginVertical: SPACING.xs,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  addReminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.lg,
    height: 52,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 6,
  },
  categorySelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: 6,
  },
  catSelectPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#F1F5F9',
  },
  activeCatSelectPill: {
    backgroundColor: '#16A34A',
  },
  modalInput: {
    backgroundColor: '#F8FAF8',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginTop: 4,
  },
  repeatPill: {
    backgroundColor: '#DCFCE7',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  modalSaveBtn: {
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
});
