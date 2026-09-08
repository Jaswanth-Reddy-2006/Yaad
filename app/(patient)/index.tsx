import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Gamepad2, Brain, Calendar, Bell, ChevronRight, LogOut } from 'lucide-react-native';
import { authService } from '../../services/AuthService';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppHeader } from '../../components/common/AppHeader';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { useVoiceStore } from '../../store/useVoiceStore';
import { voiceService } from '../../services/VoiceService';
import { voiceContentResolver } from '../../services/voice/VoiceContentResolver';
import { offlineProximitySync } from '../../services/sync/OfflineProximitySync';
import { GameAlarmModal } from '../../components/games/GameAlarmModal';
import { PatientGameSchedule } from '../../types';

export default function PatientHomeScreen() {
  const router = useRouter();
  const { preferences, currentLanguage, t } = useAccessibilityStore();
  const { isVoiceEnabled } = useVoiceStore();
  const isHc = preferences.highContrast;

  const handleLogout = async () => {
    voiceService.stopSpeaking();
    await authService.clearSession();
    router.replace('/');
  };


  const hasSpokenWelcomeRef = useRef(false);
  const lastLanguageRef = useRef(currentLanguage);

  const [isGameAlarmVisible, setIsGameAlarmVisible] = useState(false);
  const [gameSchedule, setGameSchedule] = useState<PatientGameSchedule | null>(null);

  useEffect(() => {
    async function checkAlarmSchedule() {
      const schedule = await offlineProximitySync.getGameSchedule();
      setGameSchedule(schedule);

      if (schedule.isAlarmEnabled && schedule.playTimes && schedule.playTimes.length > 0) {
        // Format current time e.g. "11:00 AM"
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const hasMatchingTime = schedule.playTimes.some(
          (t) => t.toLowerCase() === timeStr.toLowerCase()
        );
        if (hasMatchingTime) {
          setIsGameAlarmVisible(true);
        }
      }
    }

    checkAlarmSchedule();
    const interval = setInterval(checkAlarmSchedule, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isVoiceEnabled) return;
    const isNewLang = lastLanguageRef.current !== currentLanguage;
    if (hasSpokenWelcomeRef.current && !isNewLang) return;

    const timer = setTimeout(() => {
      const welcomeText = t('welcome_yaad');
      voiceService.speak(welcomeText, undefined, undefined, 'NORMAL', 'WELCOME_YAAD');
      hasSpokenWelcomeRef.current = true;
      lastLanguageRef.current = currentLanguage;
    }, 600);

    return () => clearTimeout(timer);
  }, [isVoiceEnabled, currentLanguage, t]);

  const handleNavigate = (route: string) => {
    voiceService.stopSpeaking();
    router.push(route as any);
  };

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      {/* Top Header: App Logo ("Yaad") */}
      <AppHeader
        rightAction={
          <TouchableOpacity
            accessibilityLabel={t('logout') || 'Log Out'}
            accessibilityRole="button"
            onPress={handleLogout}
            style={styles.homeLogoutBtn}
          >
            <LogOut size={20} color="#DC2626" />
          </TouchableOpacity>
        }
      />

      {/* 4-Card Primary Menu */}
      <View style={styles.verticalStackContainer}>
        {/* Card 1: Play Game */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => handleNavigate('/(patient)/games')}
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
          onPress={() => handleNavigate('/(patient)/recall-memory')}
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
          onPress={() => handleNavigate('/(patient)/my-day')}
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
          onPress={() => handleNavigate('/(patient)/reminders')}
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

      {/* Cognitive Game Alarm Modal */}
      <GameAlarmModal
        visible={isGameAlarmVisible}
        targetMinutes={gameSchedule?.minimumPlaytimeMinutes || 10}
        onDismiss={() => setIsGameAlarmVisible(false)}
        onStartPlaying={() => {
          setIsGameAlarmVisible(false);
          router.push('/(patient)/games');
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  homeLogoutBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
