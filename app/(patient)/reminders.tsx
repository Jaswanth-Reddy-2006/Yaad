import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, Pill, Droplet, Brain, CheckCircle2, ChevronRight, Plus } from 'lucide-react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppHeader } from '../../components/common/AppHeader';
import { Card } from '../../components/common/Card';
import { Typography } from '../../components/common/Typography';
import { Button } from '../../components/common/Button';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

interface ReminderItem {
  id: string;
  category: 'MEDICINE' | 'WATER' | 'ACTIVITY';
  time: string;
  title: string;
  subtitle: string;
  isCompleted: boolean;
}

const INITIAL_REMINDERS: ReminderItem[] = [
  { id: '1', category: 'MEDICINE', time: '9:00 AM', title: 'Morning Medicine', subtitle: 'Take 1 Pill with water', isCompleted: true },
  { id: '2', category: 'WATER', time: '10:30 AM', title: 'Drink Water', subtitle: 'Drink a glass of water', isCompleted: false },
  { id: '3', category: 'ACTIVITY', time: '11:00 AM', title: 'Memory Activity', subtitle: 'Play memory game', isCompleted: false },
  { id: '4', category: 'WATER', time: '3:00 PM', title: 'Hydration', subtitle: 'Drink water', isCompleted: false },
  { id: '5', category: 'MEDICINE', time: '8:00 PM', title: 'Evening Medicine', subtitle: 'Take your medicine', isCompleted: false },
];

export default function RemindersScreen() {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Medicines' | 'Water' | 'Activities'>('All');
  const [reminders, setReminders] = useState<ReminderItem[]>(INITIAL_REMINDERS);
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const filteredReminders = reminders.filter((item) => {
    if (activeFilter === 'Medicines') return item.category === 'MEDICINE';
    if (activeFilter === 'Water') return item.category === 'WATER';
    if (activeFilter === 'Activities') return item.category === 'ACTIVITY';
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MEDICINE':
        return { Icon: Pill, bg: '#DCFCE7', color: COLORS.primary };
      case 'WATER':
        return { Icon: Droplet, bg: '#DBEAFE', color: COLORS.gameBlue };
      default:
        return { Icon: Brain, bg: '#EDE9FE', color: COLORS.memoryPurple };
    }
  };

  const handleToggle = (id: string) => {
    setReminders(
      reminders.map((r) => (r.id === id ? { ...r, isCompleted: !r.isCompleted } : r))
    );
  };

  return (
    <ScreenContainer scrollable>
      <AppHeader
        title="Reminders"
        subtitle="Stay on track with important things"
        showBack
        voicePrompt="Reminders list. Tap any reminder to mark it complete."
      />

      {/* Hero Bell Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.bellCircle}>
          <Bell size={48} color={COLORS.primary} />
        </View>
        <Typography size="base" weight="semibold" color={COLORS.textSecondary} style={{ marginTop: SPACING.xs }}>
          Stay on track with important things
        </Typography>
      </View>

      {/* Category Filter Chips */}
      <View style={styles.chipsRow}>
        {(['All', 'Medicines', 'Water', 'Activities'] as const).map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              activeOpacity={0.8}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? COLORS.primary : COLORS.cardBackground,
                  borderColor: isActive ? COLORS.primary : COLORS.surfaceVariant,
                },
              ]}
            >
              <Typography
                size="sm"
                weight="bold"
                color={isActive ? '#FFFFFF' : COLORS.textSecondary}
              >
                {filter}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Reminders List */}
      <View style={styles.listContainer}>
        {filteredReminders.map((item) => {
          const { Icon, bg, color } = getCategoryIcon(item.category);
          return (
            <Card
              key={item.id}
              onPress={() => handleToggle(item.id)}
              style={styles.card}
            >
              <View style={styles.cardRow}>
                <View style={[styles.iconBox, { backgroundColor: bg }]}>
                  <Icon size={28} color={color} />
                </View>

                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <Typography size="base" weight="bold">
                    {item.title}
                  </Typography>
                  <Typography size="xs" weight="bold" color={COLORS.textMuted}>
                    {item.time}
                  </Typography>
                  <Typography size="xs" color={COLORS.textMuted}>
                    {item.subtitle}
                  </Typography>
                </View>

                {item.isCompleted ? (
                  <CheckCircle2 size={28} color={COLORS.primary} />
                ) : (
                  <View style={styles.arrowCircle}>
                    <ChevronRight size={20} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </Card>
          );
        })}
      </View>

      {/* + Add Reminder Green Button */}
      <Button
        title="+ Add Reminder"
        variant="primary"
        style={styles.addReminderBtn}
        onPress={() => {}}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroBanner: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  bellCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  listContainer: {
    marginTop: SPACING.xs,
  },
  card: {
    marginVertical: SPACING.xs,
    padding: SPACING.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.gameBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addReminderBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
});
