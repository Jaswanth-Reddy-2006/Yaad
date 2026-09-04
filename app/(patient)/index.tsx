import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Gamepad2, Brain, Calendar, Bell, ChevronRight } from 'lucide-react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppHeader } from '../../components/common/AppHeader';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export default function PatientHomeScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      {/* Top Header: App Logo ("Yaad") */}
      <AppHeader />

      {/* 4-Card Primary Menu */}
      <View style={styles.verticalStackContainer}>
        {/* Card 1: Play Game */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/(patient)/games')}
          style={[
            styles.horizontalPatientCard,
            {
              backgroundColor: isHc ? COLORS.hcCardBackground : '#E8F2FF',
              borderColor: '#60A5FA',
            },
          ]}
        >
          <View style={[styles.iconCircleBadge, { backgroundColor: '#2563EB' }]}>
            <Gamepad2 size={32} color="#FFFFFF" />
          </View>

          <View style={styles.textCenterPortion}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={[styles.cardTitleText, { color: isHc ? COLORS.hcTextPrimary : '#1E40AF' }]}
            >
              {t('play_game')}
            </Text>
          </View>

          <View style={styles.rightChevronPortion}>
            <ChevronRight size={26} color={isHc ? COLORS.hcTextPrimary : '#1E40AF'} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>

        {/* Card 2: Recall Memory */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/(patient)/recall-memory')}
          style={[
            styles.horizontalPatientCard,
            {
              backgroundColor: isHc ? COLORS.hcCardBackground : '#F3E8FF',
              borderColor: '#C084FC',
            },
          ]}
        >
          <View style={[styles.iconCircleBadge, { backgroundColor: '#8B5CF6' }]}>
            <Brain size={32} color="#FFFFFF" />
          </View>

          <View style={styles.textCenterPortion}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={[styles.cardTitleText, { color: isHc ? COLORS.hcTextPrimary : '#6D28D9' }]}
            >
              {t('recall_memory')}
            </Text>
          </View>

          <View style={styles.rightChevronPortion}>
            <ChevronRight size={26} color={isHc ? COLORS.hcTextPrimary : '#6D28D9'} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>

        {/* Card 3: Day Schedule */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/(patient)/my-day')}
          style={[
            styles.horizontalPatientCard,
            {
              backgroundColor: isHc ? COLORS.hcCardBackground : '#FFF0E5',
              borderColor: '#FDBA74',
            },
          ]}
        >
          <View style={[styles.iconCircleBadge, { backgroundColor: '#EA580C' }]}>
            <Calendar size={32} color="#FFFFFF" />
          </View>

          <View style={styles.textCenterPortion}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={[styles.cardTitleText, { color: isHc ? COLORS.hcTextPrimary : '#C2410C' }]}
            >
              {t('day_schedule')}
            </Text>
          </View>

          <View style={styles.rightChevronPortion}>
            <ChevronRight size={26} color={isHc ? COLORS.hcTextPrimary : '#C2410C'} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>

        {/* Card 4: Reminders */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/(patient)/reminders')}
          style={[
            styles.horizontalPatientCard,
            {
              backgroundColor: isHc ? COLORS.hcCardBackground : '#E6F9ED',
              borderColor: '#86EFAC',
            },
          ]}
        >
          <View style={[styles.iconCircleBadge, { backgroundColor: '#16A34A' }]}>
            <Bell size={32} color="#FFFFFF" />
          </View>

          <View style={styles.textCenterPortion}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={[styles.cardTitleText, { color: isHc ? COLORS.hcTextPrimary : '#15803D' }]}
            >
              {t('reminders')}
            </Text>
          </View>

          <View style={styles.rightChevronPortion}>
            <ChevronRight size={26} color={isHc ? COLORS.hcTextPrimary : '#15803D'} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  verticalStackContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    marginVertical: SPACING.xs,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  horizontalPatientCard: {
    width: '100%',
    flex: 1,
    minHeight: 84,
    maxHeight: 105,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircleBadge: {
    width: 58,
    height: 58,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCenterPortion: {
    flex: 1,
    marginHorizontal: SPACING.md,
    justifyContent: 'center',
  },
  cardTitleText: {
    fontSize: 20,
    fontWeight: '700',
  },
  rightChevronPortion: {
    width: 28,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
