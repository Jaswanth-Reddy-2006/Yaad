import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Home, Bell, User } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export const CaregiverBottomNavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useAccessibilityStore();

  const isHome = pathname === '/caregiver/home' || pathname === '/caregiver' || pathname.includes('/caregiver/insights');
  const isReminders = pathname.includes('/caregiver/reminders');
  const isProfile = pathname.includes('/caregiver/profile');

  return (
    <View style={styles.outerFixedWrapper} pointerEvents="box-none">
      <View style={styles.navBarCard}>
        {/* Tab 1: Home */}
        <TouchableOpacity
          activeOpacity={0.85}
          accessibilityRole="tab"
          accessibilityLabel="Home"
          accessibilityState={{ selected: isHome }}
          onPress={() => router.push('/caregiver/home')}
          style={[styles.navTab, isHome && styles.navTabActive]}
        >
          <Home
            size={22}
            color={isHome ? '#16A34A' : '#64748B'}
            strokeWidth={isHome ? 2.5 : 2}
          />
          <Text style={[styles.tabLabel, isHome ? styles.tabLabelActive : styles.tabLabelInactive]}>
            Home
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Reminders */}
        <TouchableOpacity
          activeOpacity={0.85}
          accessibilityRole="tab"
          accessibilityLabel="Reminders"
          accessibilityState={{ selected: isReminders }}
          onPress={() => router.push('/caregiver/reminders')}
          style={[styles.navTab, isReminders && styles.navTabActive]}
        >
          <Bell
            size={22}
            color={isReminders ? '#16A34A' : '#64748B'}
            strokeWidth={isReminders ? 2.5 : 2}
          />
          <Text style={[styles.tabLabel, isReminders ? styles.tabLabelActive : styles.tabLabelInactive]}>
            Remembers
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Profile */}
        <TouchableOpacity
          activeOpacity={0.85}
          accessibilityRole="tab"
          accessibilityLabel="Profile"
          accessibilityState={{ selected: isProfile }}
          onPress={() => router.push('/caregiver/profile')}
          style={[styles.navTab, isProfile && styles.navTabActive]}
        >
          <User
            size={22}
            color={isProfile ? '#16A34A' : '#64748B'}
            strokeWidth={isProfile ? 2.5 : 2}
          />
          <Text style={[styles.tabLabel, isProfile ? styles.tabLabelActive : styles.tabLabelInactive]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerFixedWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  navBarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 420,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#E2E8E5',
    paddingHorizontal: SPACING.xs,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 6,
  },
  navTab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: RADIUS.full,
    paddingVertical: 4,
    minWidth: 48,
  },
  navTabActive: {
    backgroundColor: '#DCFCE7',
  },
  tabLabel: {
    fontSize: 13.5,
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '800',
    color: '#15803D',
  },
  tabLabelInactive: {
    fontWeight: '600',
    color: '#64748B',
  },
});
