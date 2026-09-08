import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Pill,
  Droplet,
  Brain,
  Utensils,
  Footprints,
  Clock,
  CheckCircle2,
  Circle,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppHeader } from '../../components/common/AppHeader';
import { Typography } from '../../components/common/Typography';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { useVoiceStore } from '../../store/useVoiceStore';
import { voiceService } from '../../services/VoiceService';
import { offlineProximitySync } from '../../services/sync/OfflineProximitySync';
import { RoutineScheduleItem } from '../../types';

function formatTimeForSpeech(timeStr: string, lang: string): string {
  if (!timeStr) return '';
  const isAM = /AM/i.test(timeStr);
  const isPM = /PM/i.test(timeStr);
  const cleanTime = timeStr.replace(/\s*(AM|PM)/i, '').trim();
  const hour = parseInt(cleanTime.split(':')[0], 10);

  if (lang === 'te') {
    let period = 'ఉదయం';
    if (isPM) {
      if (hour === 12 || hour <= 3) period = 'మధ్యాహ్నం';
      else if (hour < 8) period = 'సాయంత్రం';
      else period = 'రాత్రి';
    } else if (hour < 4) {
      period = 'రాత్రి';
    }
    return `${period} ${cleanTime} గంటలకు`;
  }

  if (lang === 'hi') {
    let period = 'सुबह';
    if (isPM) {
      if (hour === 12 || hour <= 3) period = 'दोपहर';
      else if (hour < 8) period = 'शाम';
      else period = 'रात';
    } else if (hour < 4) {
      period = 'रात';
    }
    return `${period} ${cleanTime} बजे`;
  }

  return `At ${timeStr}`;
}

function getTranslatedTaskTitle(title: string, t: (key: string) => string): string {
  if (!title) return '';
  const lower = title.toLowerCase();
  if (lower.includes('morning medicine')) return t('morning_medicine') || title;
  if (lower.includes('night medicine') || lower.includes('evening medicine')) return t('evening_medicine') || title;
  if (lower.includes('water') || lower.includes('hydration')) return t('drink_water') || title;
  if (lower.includes('mind sharp') || lower.includes('brain') || lower.includes('game')) return t('memory_activity') || title;
  if (lower.includes('lunch') || lower.includes('meal')) return t('lunch_time') || title;
  if (lower.includes('walk')) return t('evening_walk') || title;
  if (lower.includes('medicine') || lower.includes('pill')) return t('take_medicine') || title;
  return title;
}

export default function MyDayScreen() {
  const router = useRouter();
  const { preferences, currentLanguage, t } = useAccessibilityStore();
  const { isVoiceEnabled, ttsLanguage } = useVoiceStore();
  const isHc = preferences.highContrast;

  const [scheduleItems, setScheduleItems] = useState<RoutineScheduleItem[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const hasSpokenRef = useRef(false);

  const loadSchedule = useCallback(async () => {
    const items = await offlineProximitySync.getRoutineSchedule();
    setScheduleItems(items);
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const speakAllTasks = useCallback(() => {
    if (scheduleItems.length === 0) {
      voiceService.speak(
        t('no_tasks_speech') || 'No tasks scheduled for today.',
        ttsLanguage,
        undefined,
        'NORMAL',
        'PATIENT_NO_TASKS'
      );
      return;
    }

    setIsSpeaking(true);
    const prefix = t('daily_routine_speech_prefix') || 'Here is your plan for today:';
    const taskNarrations = scheduleItems.map((item) => {
      const timeSpoken = formatTimeForSpeech(item.time, currentLanguage);
      const titleSpoken = getTranslatedTaskTitle(item.title, t);
      return `${timeSpoken}, ${titleSpoken}`;
    });

    const fullNarration = `${prefix} ${taskNarrations.join('. ')}.`;
    voiceService.speak(
      fullNarration,
      ttsLanguage,
      {
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      },
      'HIGH',
      'PATIENT_ROUTINE_AUTO_READ'
    );
  }, [scheduleItems, currentLanguage, ttsLanguage, t]);

  // Automatic Sequential Voice Narration upon Opening
  useEffect(() => {
    if (isMuted || !isVoiceEnabled || scheduleItems.length === 0 || hasSpokenRef.current) return;

    const timer = setTimeout(() => {
      hasSpokenRef.current = true;
      speakAllTasks();
    }, 600);

    return () => clearTimeout(timer);
  }, [scheduleItems, isVoiceEnabled, speakAllTasks]);

  // Stop speaking when navigating away
  useEffect(() => {
    return () => {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    };
  }, []);

  const [isMuted, setIsMuted] = useState(false);

  // Speaker button toggles between Mute and Unmute
  const handleToggleMuteSpeaker = () => {
    if (!isMuted) {
      // Mute: immediately silence any active voice and remember muted state
      voiceService.stopSpeaking();
      voiceService.stop();
      setIsSpeaking(false);
      setIsMuted(true);
    } else {
      // Unmute: unmute and read aloud the daily routine
      setIsMuted(false);
      if (isVoiceEnabled && scheduleItems.length > 0) {
        setIsSpeaking(true);
        const prefix = t('daily_routine_speech_prefix') || 'Here is your plan for today:';
        const taskNarrations = scheduleItems.map((item) => {
          const timeSpoken = formatTimeForSpeech(item.time, currentLanguage);
          const titleSpoken = getTranslatedTaskTitle(item.title, t);
          return `${timeSpoken}, ${titleSpoken}`;
        });
        const fullNarration = `${prefix} ${taskNarrations.join('. ')}.`;
        voiceService.speak(
          fullNarration,
          ttsLanguage,
          {
            onDone: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
          },
          'HIGH',
          'PATIENT_ROUTINE_AUTO_READ'
        );
      }
    }
  };

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'MEDICINE':
        return { icon: Pill, bg: '#DCFCE7', color: '#15803D', label: t('medicine') || 'Medicine' };
      case 'HYDRATION':
        return { icon: Droplet, bg: '#DBEAFE', color: '#1D4ED8', label: t('water') || 'Water' };
      case 'ACTIVITY':
        return { icon: Brain, bg: '#EDE9FE', color: '#6D28D9', label: t('activity') || 'Activity' };
      case 'MEAL':
        return { icon: Utensils, bg: '#FFEDD5', color: '#C2410C', label: t('meal') || 'Meal' };
      case 'WALK':
        return { icon: Footprints, bg: '#FEF08A', color: '#A16207', label: t('walk') || 'Walking' };
      default:
        return { icon: Clock, bg: '#F1F5F9', color: '#475569', label: t('routine') || 'Routine' };
    }
  };

  const handleToggleTask = async (id: string, title: string, wasCompleted: boolean) => {
    const updated = await offlineProximitySync.toggleRoutineItem(id);
    setScheduleItems(updated);

    if (isVoiceEnabled) {
      const statusText = !wasCompleted
        ? currentLanguage === 'te'
          ? `${title} పూర్తయింది. చాలా బాగుంది!`
          : currentLanguage === 'hi'
          ? `${title} पूरा हो गया। बहुत बढ़िया!`
          : `${title} completed. Well done!`
        : currentLanguage === 'te'
        ? `${title} ఇంకా పూర్తి కాలేదు.`
        : currentLanguage === 'hi'
        ? `${title} अभी बाकी है।`
        : `${title} marked as pending.`;

      voiceService.speak(statusText, ttsLanguage, undefined, 'HIGH', `TASK_${id}`);
    }
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      {/* Elder Top Header with Speaker placed at top-right */}
      <AppHeader
        title={t('day_schedule')}
        subtitle={t('my_day_subtitle')}
        showBack
        rightAction={
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleToggleMuteSpeaker}
            style={[
              styles.headerSpeakerBtn,
              isMuted
                ? styles.headerSpeakerBtnMuted
                : isSpeaking
                ? styles.headerSpeakerBtnActive
                : null,
            ]}
            accessibilityLabel={isMuted ? (t('unmute') || 'Unmute voice') : (t('mute') || 'Mute voice')}
            accessibilityRole="button"
          >
            {isMuted ? (
              <VolumeX size={24} color="#EF4444" />
            ) : (
              <Volume2 size={24} color={isSpeaking ? '#FFFFFF' : COLORS.primary} />
            )}
          </TouchableOpacity>
        }
      />

      {/* Routine Task List - Substantial cards with dynamic text-based height */}
      <View style={styles.taskList}>
        {scheduleItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Typography size="base" color={COLORS.textSecondary}>
              {t('no_tasks_speech')}
            </Typography>
          </View>
        ) : (
          scheduleItems.map((item) => {
            const cfg = getCategoryConfig(item.category);
            const IconComp = cfg.icon;
            const isDone = item.isCompleted;
            const translatedTitle = getTranslatedTaskTitle(item.title, t);

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                onPress={() => handleToggleTask(item.id, translatedTitle, item.isCompleted)}
                style={[
                  styles.taskCard,
                  {
                    backgroundColor: isDone
                      ? '#F0FDF4'
                      : isHc
                      ? COLORS.hcCardBackground
                      : '#FFFFFF',
                    borderColor: isDone ? '#86EFAC' : isHc ? COLORS.hcBorder : '#E2E8F0',
                    borderWidth: isDone ? 2.5 : 1.8,
                  },
                ]}
              >
                {/* Category Icon */}
                <View style={[styles.iconBox, { backgroundColor: cfg.bg }]}>
                  <IconComp size={32} color={cfg.color} />
                </View>

                {/* Task Details - prominent, large text with dynamic scaling */}
                <View style={styles.taskDetails}>
                  <View style={styles.metaRow}>
                    <View style={styles.timeBadge}>
                      <Clock size={13} color="#475569" style={{ marginRight: 4 }} />
                      <Typography size="xs" weight="bold" color="#475569" numberOfLines={1}>
                        {item.time}
                      </Typography>
                    </View>

                    <View style={[styles.categoryTag, { backgroundColor: cfg.bg }]}>
                      <Typography size="xs" weight="bold" color={cfg.color} numberOfLines={1}>
                        {cfg.label}
                      </Typography>
                    </View>
                  </View>

                  <Typography
                    size="lg"
                    weight="bold"
                    color={isDone ? '#15803D' : isHc ? COLORS.hcTextPrimary : '#0F172A'}
                    style={[
                      styles.taskTitleText,
                      isDone ? { textDecorationLine: 'line-through', opacity: 0.7 } : null,
                    ]}
                  >
                    {translatedTitle}
                  </Typography>
                </View>

                {/* Clean, Large 40px Checkbox */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleToggleTask(item.id, translatedTitle, item.isCompleted)}
                  style={styles.checkboxArea}
                  accessibilityLabel={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {isDone ? (
                    <CheckCircle2 size={44} color="#16A34A" fill="#DCFCE7" />
                  ) : (
                    <Circle size={44} color="#94A3B8" strokeWidth={2.2} />
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: SPACING.xl,
  },
  headerSpeakerBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerSpeakerBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  headerSpeakerBtnMuted: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  taskList: {
    marginTop: SPACING.md,
    gap: 16,
    paddingBottom: SPACING.xl,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 104,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  iconBox: {
    width: 62,
    height: 62,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  taskDetails: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 8,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.md,
  },
  taskTitleText: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  checkboxArea: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
