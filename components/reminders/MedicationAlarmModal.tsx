import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text } from 'react-native';
import { Pill, Droplet, Brain, Clock, CheckCircle2, Volume2, RotateCcw, X, Music } from 'lucide-react-native';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { gentleAlarmService } from '../../services/audio/GentleAlarmService';
import { Reminder } from '../../types';

interface MedicationAlarmModalProps {
  visible: boolean;
  reminder: Reminder | null;
  patientName?: string;
  onComplete: (reminderId: string) => void;
  onSnooze: (reminderId: string) => void;
}

export function MedicationAlarmModal({
  visible,
  reminder,
  patientName = 'Amma',
  onComplete,
  onSnooze,
}: MedicationAlarmModalProps) {
  const { preferences, currentLanguage, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    if (visible && reminder) {
      gentleAlarmService.startGentleAlarm({
        voiceNoteUrl: reminder.voiceNoteUrl,
        tone: reminder.gentleAlarmTone || 'CHIME',
        reminderTitle: reminder.title,
        patientName,
        language: currentLanguage,
        onStatusChange: (status) => setIsPlayingAudio(status),
      });
    } else {
      gentleAlarmService.stopAlarm();
      setIsPlayingAudio(false);
    }

    return () => {
      gentleAlarmService.stopAlarm();
    };
  }, [visible, reminder, patientName, currentLanguage]);

  if (!visible || !reminder) return null;

  const handleComplete = () => {
    gentleAlarmService.stopAlarm();
    onComplete(reminder.id);
  };

  const handleSnooze = () => {
    gentleAlarmService.stopAlarm();
    onSnooze(reminder.id);
  };

  const handleReplayVoice = () => {
    gentleAlarmService.startGentleAlarm({
      voiceNoteUrl: reminder.voiceNoteUrl,
      tone: reminder.gentleAlarmTone || 'CHIME',
      reminderTitle: reminder.title,
      patientName,
      language: currentLanguage,
      onStatusChange: (status) => setIsPlayingAudio(status),
    });
  };

  const isMedicine = reminder.category === 'MEDICINE';
  const isHydration = reminder.category === 'HYDRATION';

  const categoryColor = isMedicine ? '#059669' : isHydration ? '#0284C7' : '#7C3AED';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleSnooze}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF',
              borderColor: isHc ? COLORS.hcBorder : '#E2E8F0',
            },
          ]}
        >
          {/* Close/Snooze X Button */}
          <TouchableOpacity
            onPress={handleSnooze}
            style={styles.closeBtn}
            accessibilityLabel="Snooze reminder"
            accessibilityRole="button"
          >
            <X size={24} color="#64748B" />
          </TouchableOpacity>

          {/* Category Icon Badge */}
          <View style={[styles.iconCircle, { backgroundColor: categoryColor }]}>
            {isMedicine ? (
              <Pill size={44} color="#FFFFFF" />
            ) : isHydration ? (
              <Droplet size={44} color="#FFFFFF" />
            ) : (
              <Brain size={44} color="#FFFFFF" />
            )}
          </View>

          {/* Alarm Banner / Time */}
          <View style={styles.timeTag}>
            <Clock size={16} color={categoryColor} style={{ marginRight: 6 }} />
            <Text style={[styles.timeTagText, { color: categoryColor }]}>
              {reminder.scheduledTime}
            </Text>
          </View>

          {/* Title in Dementia-Friendly Large Typography */}
          <Text
            numberOfLines={2}
            style={[
              styles.titleText,
              { color: isHc ? COLORS.hcTextPrimary : '#0F172A' },
            ]}
          >
            {reminder.title}
          </Text>

          {/* Instructions / Description */}
          {reminder.description ? (
            <Text
              numberOfLines={3}
              style={[
                styles.descText,
                { color: isHc ? COLORS.hcTextSecondary : '#475569' },
              ]}
            >
              {reminder.description}
            </Text>
          ) : null}

          {/* Audio Status Card (Caregiver Voice Note vs Gentle Chime) */}
          {reminder.voiceNoteUrl ? (
            <View style={styles.voiceNoteCard}>
              <View style={styles.voiceHeaderRow}>
                <Volume2 size={22} color="#0D9488" />
                <Text style={styles.voiceCardTitle}>
                  {t('caregiver_voice_note') || 'Caregiver Voice Message'}
                </Text>
              </View>
              <Text style={styles.voiceCardSub}>
                {isPlayingAudio
                  ? t('playing_voice') || 'Playing familiar voice of your caregiver...'
                  : t('voice_note_ready') || 'Message from your family caregiver'}
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleReplayVoice}
                style={styles.replayBtn}
              >
                <RotateCcw size={18} color="#0D9488" style={{ marginRight: 6 }} />
                <Text style={styles.replayBtnText}>
                  {t('replay_voice_note') || 'Listen Again'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.gentleChimeCard}>
              <View style={styles.voiceHeaderRow}>
                <Music size={20} color="#2563EB" />
                <Text style={styles.gentleChimeTitle}>
                  {t('gentle_alarm') || 'Gentle Soothing Chime'}
                </Text>
              </View>
              <Text style={styles.gentleChimeSub}>
                {t('take_your_time') || 'Calm tone playing. Please take your time.'}
              </Text>
            </View>
          )}

          {/* Large Accessible Primary Action Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleComplete}
            style={[styles.primaryActionBtn, { backgroundColor: '#059669' }]}
            accessibilityRole="button"
            accessibilityLabel={t('took_medicine_btn') || 'I Took It'}
          >
            <CheckCircle2 size={28} color="#FFFFFF" style={{ marginRight: 10 }} />
            <Text style={styles.primaryActionText}>
              {isMedicine
                ? t('took_medicine_btn') || 'I Took My Medicine'
                : t('mark_completed') || 'Done, I Did This'}
            </Text>
          </TouchableOpacity>

          {/* Snooze 10 Mins */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSnooze}
            style={styles.snoozeBtn}
            accessibilityRole="button"
            accessibilityLabel={t('snooze_10m') || 'Remind Me in 10 Mins'}
          >
            <Text style={styles.snoozeText}>
              {t('snooze_10m') || 'Remind Me in 10 Minutes'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.xs,
    zIndex: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  timeTagText: {
    fontSize: 15,
    fontWeight: '700',
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.xs,
    lineHeight: 30,
  },
  descText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  voiceNoteCard: {
    width: '100%',
    backgroundColor: '#CCFBF1',
    borderColor: '#5EEAD4',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  voiceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  voiceCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F766E',
    marginLeft: 6,
  },
  voiceCardSub: {
    fontSize: 13,
    color: '#115E59',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#99F6E4',
    marginTop: 4,
  },
  replayBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F766E',
  },
  gentleChimeCard: {
    width: '100%',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  gentleChimeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D4ED8',
    marginLeft: 6,
  },
  gentleChimeSub: {
    fontSize: 13,
    color: '#1E40AF',
    textAlign: 'center',
  },
  primaryActionBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  snoozeBtn: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  snoozeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
});
