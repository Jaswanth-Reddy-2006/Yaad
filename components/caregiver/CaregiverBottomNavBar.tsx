import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, BarChart3, Bell, User } from 'lucide-react-native';
import { Typography } from '../common/Typography';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { RADIUS, SPACING } from '../../constants/theme';

export const CaregiverBottomNavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useAccessibilityStore();

  const isHome = pathname === '/caregiver/home' || pathname === '/caregiver';
  const isInsights = pathname.includes('/caregiver/insights');
  const isReminders = pathname.includes('/caregiver/reminders');
  const isProfile = pathname.includes('/caregiver/profile');

  return (
    <View style={styles.floatingContainer}>
      <View style={styles.wrapper}>
        {/* Tab 1: Home */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/caregiver/home')}
          style={styles.tabItem}
        >
          <Home
            size={22}
            color={isHome ? '#16A34A' : '#64748B'}
            strokeWidth={isHome ? 2.5 : 2}
          />
          <Typography
            size="xs"
            weight={isHome ? 'bold' : 'medium'}
            color={isHome ? '#16A34A' : '#64748B'}
            style={{ marginTop: 2 }}
          >
            {t('home')}
          </Typography>
        </TouchableOpacity>

        {/* Tab 2: Insights */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/caregiver/insights')}
          style={styles.tabItem}
        >
          <BarChart3
            size={22}
            color={isInsights ? '#16A34A' : '#64748B'}
            strokeWidth={isInsights ? 2.5 : 2}
          />
          <Typography
            size="xs"
            weight={isInsights ? 'bold' : 'medium'}
            color={isInsights ? '#16A34A' : '#64748B'}
            style={{ marginTop: 2 }}
          >
            {t('insights')}
          </Typography>
        </TouchableOpacity>

        {/* Tab 3: Reminders */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/caregiver/reminders')}
          style={styles.tabItem}
        >
          <Bell
            size={22}
            color={isReminders ? '#16A34A' : '#64748B'}
            strokeWidth={isReminders ? 2.5 : 2}
          />
          <Typography
            size="xs"
            weight={isReminders ? 'bold' : 'medium'}
            color={isReminders ? '#16A34A' : '#64748B'}
            style={{ marginTop: 2 }}
          >
            {t('reminders')}
          </Typography>
        </TouchableOpacity>

        {/* Tab 4: Profile */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/caregiver/profile')}
          style={styles.tabItem}
        >
          <User
            size={22}
            color={isProfile ? '#16A34A' : '#64748B'}
            strokeWidth={isProfile ? 2.5 : 2}
          />
          <Typography
            size="xs"
            weight={isProfile ? 'bold' : 'medium'}
            color={isProfile ? '#16A34A' : '#64748B'}
            style={{ marginTop: 2 }}
          >
            {t('profile')}
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: 'transparent',
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
