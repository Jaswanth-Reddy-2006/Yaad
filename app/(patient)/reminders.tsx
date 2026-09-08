import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  Pill,
  Building2,
  Stethoscope,
  Calendar,
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
import { Reminder } from '../../types';

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

function getTranslatedReminderTitle(title: string, t: (key: string) => string): string {
  if (!title) return '';
  const lower = title.toLowerCase();
  if (lower.includes('cardiology') || lower.includes('heart')) return t('cardiology_checkup') || title;
  if (lower.includes('blood') || lower.includes('sugar')) return t('blood_sugar_test') || title;
  if (lower.includes('doctor') || lower.includes('consultation')) return t('doctor_appointment') || title;
  return title;
}

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const hasSpokenRef = useRef(false);

  const { preferences, currentLanguage, t } = useAccessibilityStore();
  const { isVoiceEnabled, ttsLanguage } = useVoiceStore();
  const isHc = preferences.highContrast;

  const loadReminders = useCallback(async () => {
    const list = await offlineProximitySync.getOneTimeReminders();
    setReminders(list);
  }, []);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  const speakAllReminders = useCallback(() => {
    const upcoming = reminders.filter((r) => r.status !== 'COMPLETED');
    if (upcoming.length === 0) {
      voiceService.speak(
        t('no_reminders_speech') || 'You have no upcoming reminders right now.',
        ttsLanguage,
        undefined,
        'NORMAL',
        'REMINDERS_CLEAR'
      );
      return;
    }

    setIsSpeaking(true);
    const prefix = t('reminders_speech_prefix') || 'Here are your upcoming reminders:';
    const itemsNarrations = upcoming.map((item) => {
      const timeSpoken = formatTimeForSpeech(item.scheduledTime, currentLanguage);
      const titleSpoken = getTranslatedReminderTitle(item.title, t);
      const dateSpoken = item.scheduledDate ? `${item.scheduledDate}, ` : '';
      return `${dateSpoken}${timeSpoken}, ${titleSpoken}`;
    });

    const fullNarration = `${prefix} ${itemsNarrations.join('. ')}.`;
    voiceService.speak(
      fullNarration,
      ttsLanguage,
      {
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      },
      'HIGH',
      'PATIENT_REMINDERS_AUTO_READ'
    );
  }, [reminders, currentLanguage, ttsLanguage, t]);

  // Automatic Sequential Voice Narration upon Opening
  useEffect(() => {
    if (isMuted || !isVoiceEnabled || reminders.length === 0 || hasSpokenRef.current) return;

    const timer = setTimeout(() => {
      hasSpokenRef.current = true;
      speakAllReminders();
    }, 600);

    return () => clearTimeout(timer);
  }, [reminders, isVoiceEnabled, speakAllReminders]);

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
      // Unmute: unmute and read aloud all reminders
      setIsMuted(false);
      if (isVoiceEnabled && reminders.length > 0) {
        setIsSpeaking(true);
        const prefix = t('reminders_speech_prefix') || 'Here are your reminders for today:';
        const reminderNarrations = reminders.map((item) => {
          const timeSpoken = formatTimeForSpeech(item.scheduledTime, currentLanguage);
          const titleSpoken = getTranslatedReminderTitle(item.title, t);
          return `${timeSpoken}, ${titleSpoken}`;
        });
        const fullNarration = `${prefix} ${reminderNarrations.join('. ')}.`;
        voiceService.speak(
          fullNarration,
          ttsLanguage,
          {
            onDone: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
          },
          'HIGH',
          'PATIENT_REMINDERS_AUTO_READ'
        );
      }
    }
  };

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'HOSPITAL':
        return {
          icon: Building2,
          bg: '#FEE2E2',
          color: '#DC2626',
          label: t('hospital') || 'Hospital',
        };
      case 'DOCTOR':
      case 'APPOINTMENT':
        return {
          icon: Stethoscope,
          bg: '#CCFBF1',
          color: '#0F766E',
          label: t('doctor') || 'Doctor',
        };
      case 'MEDICINE':
        return {
          icon: Pill,
          bg: '#DCFCE7',
          color: '#15803D',
          label: t('medicine') || 'Medicine',
        };
      default:
        return {
          icon: Bell,
          bg: '#EDE9FE',
          color: '#6D28D9',
          label: t('reminder') || 'Reminder',
        };
    }
  };

  const handleToggle = async (id: string, title: string, currentStatus: string) => {
    const updated = await offlineProximitySync.toggleReminderCompletion(id);
    setReminders(updated);

    const isNowCompleted = currentStatus !== 'COMPLETED';
    if (isVoiceEnabled) {
      const speechText = isNowCompleted
        ? currentLanguage === 'te'
          ? `${title} పూర్తయింది.`
          : currentLanguage === 'hi'
          ? `${title} पूरा हो गया।`
          : `${title} marked as completed.`
        : currentLanguage === 'te'
        ? `${title} ఇంకా పూర్తి కాలేదు.`
        : currentLanguage === 'hi'
        ? `${title} अभी बाकी है।`
        : `${title} marked as upcoming.`;

      voiceService.speak(speechText, ttsLanguage, undefined, 'HIGH', `REMINDER_${id}`);
    }
  };

  return (
    <ScreenContainer scrollable style={styles.container}>
      {/* Top Header with Speaker placed at top-right (Identical to Daily Task) */}
      <AppHeader
        title={t('reminders')}
        subtitle={t('reminders_subtitle')}
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

      {/* Reminders List - EXACT same UI as Daily Task with substantial, larger cards */}
      <View style={styles.taskList}>
        {reminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Typography size="base" color={COLORS.textSecondary}>
              {t('no_reminders_speech')}
            </Typography>
          </View>
        ) : (
          reminders.map((item) => {
            const cfg = getCategoryConfig(item.category);
            const IconComp = cfg.icon;
            const isDone = item.status === 'COMPLETED';
            const translatedTitle = getTranslatedReminderTitle(item.title, t);

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                onPress={() => handleToggle(item.id, translatedTitle, item.status)}
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

                {/* Details - substantial, highly legible card layout without overlapping */}
                <View style={styles.taskDetails}>
                  <View style={styles.metaRow}>
                    <View style={styles.timeBadge}>
                      <Clock size={14} color="#475569" style={{ marginRight: 5 }} />
                      <Typography size="xs" weight="bold" color="#475569">
                        {item.scheduledTime}
                      </Typography>
                    </View>

                    {item.scheduledDate ? (
                      <View style={styles.dateBadge}>
                        <Typography size="xs" weight="bold" color="#475569">
                          {item.scheduledDate}
                        </Typography>
                      </View>
                    ) : null}

                    <View style={[styles.categoryTag, { backgroundColor: cfg.bg }]}>
                      <Typography size="xs" weight="bold" color={cfg.color}>
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

                  {item.description ? (
                    <Typography size="sm" color={COLORS.textSecondary} style={styles.descText}>
                      {item.description}
                    </Typography>
                  ) : null}
                </View>

                {/* Clean, Large 40px Checkbox */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleToggle(item.id, translatedTitle, item.status)}
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
    minHeight: 114,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 18,
    paddingVertical: 20,
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
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 9,
    paddingVertical: 4,
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
    marginBottom: 4,
  },
  descText: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
  },
  checkboxArea: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
