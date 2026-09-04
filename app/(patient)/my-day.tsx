import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  CalendarDays,
  Pill,
  Droplet,
  Brain,
  Utensils,
  Stethoscope,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppHeader } from '../../components/common/AppHeader';
import { Card } from '../../components/common/Card';
import { Typography } from '../../components/common/Typography';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useTaskStore } from '../../store/useTaskStore';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  isCompleted: boolean;
}

const SCHEDULE_ITEMS: ScheduleItem[] = [
  { id: '1', time: '9:00 AM', title: 'Take Medicine', icon: Pill, iconBg: '#DCFCE7', iconColor: COLORS.primary, isCompleted: true },
  { id: '2', time: '10:30 AM', title: 'Drink Water', icon: Droplet, iconBg: '#DBEAFE', iconColor: COLORS.gameBlue, isCompleted: false },
  { id: '3', time: '11:00 AM', title: 'Memory Game', icon: Brain, iconBg: '#EDE9FE', iconColor: COLORS.memoryPurple, isCompleted: false },
  { id: '4', time: '1:00 PM', title: 'Lunch Time', icon: Utensils, iconBg: '#FFEDD5', iconColor: COLORS.scheduleOrange, isCompleted: false },
  { id: '5', time: '4:00 PM', title: 'Doctor Appointment', icon: Stethoscope, iconBg: '#CCFBF1', iconColor: COLORS.accent, isCompleted: false },
];

export default function MyDayScreen() {
  const router = useRouter();
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  return (
    <ScreenContainer scrollable>
      <AppHeader
        title="My Day (Schedule)"
        subtitle="Your plan for today"
        showBack
        voicePrompt="Your plan for today includes 9 AM Take Medicine, 10:30 AM Drink Water, 11 AM Memory Game, 1 PM Lunch Time, and 4 PM Doctor Appointment."
      />

      {/* Hero Calendar Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.calendarCircle}>
          <CalendarDays size={48} color={COLORS.scheduleOrange} />
        </View>
        <Typography size="base" weight="semibold" color={COLORS.textSecondary} style={{ marginTop: SPACING.xs }}>
          Your plan for today
        </Typography>
      </View>

      {/* Today's Plan Section */}
      <View style={styles.sectionHeader}>
        <Typography size="lg" weight="bold" color={COLORS.scheduleOrange}>
          Today's Plan
        </Typography>
      </View>

      <View style={styles.listContainer}>
        {SCHEDULE_ITEMS.map((item) => {
          const IconComp = item.icon;
          return (
            <Card
              key={item.id}
              onPress={() => router.push('/(patient)/reminders')}
              style={styles.card}
            >
              <View style={styles.cardRow}>
                <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                  <IconComp size={28} color={item.iconColor} />
                </View>

                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <Typography size="xs" weight="bold" color={COLORS.textMuted}>
                    {item.time}
                  </Typography>
                  <Typography size="lg" weight="bold" style={{ marginTop: 2 }}>
                    {item.title}
                  </Typography>
                </View>

                {item.isCompleted ? (
                  <View style={styles.checkCircle}>
                    <CheckCircle2 size={28} color={COLORS.primary} />
                  </View>
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroBanner: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  calendarCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    marginVertical: SPACING.xs,
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
  checkCircle: {
    paddingHorizontal: 4,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.scheduleOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
