import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Brain, Bell, Clock, Play, X } from 'lucide-react-native';
import { Typography } from '../common/Typography';
import { Button } from '../common/Button';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { voiceService } from '../../services/VoiceService';

interface GameAlarmModalProps {
  visible: boolean;
  targetMinutes?: number;
  onDismiss: () => void;
  onStartPlaying: () => void;
}

export function GameAlarmModal({
  visible,
  targetMinutes = 10,
  onDismiss,
  onStartPlaying,
}: GameAlarmModalProps) {
  const router = useRouter();
  const { preferences, currentLanguage, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  useEffect(() => {
    if (visible) {
      const speech = currentLanguage === 'te'
        ? `మెదడు వ్యాయామ సమయం అయ్యింది! మీ సంరక్షకులు రోజువారీ మైండ్ ఆటలను నిర్ణయించారు. కనీసం ${targetMinutes} నిమిషాలు ఆడి మీ జ్ఞాపకశక్తిని చురుగ్గా ఉంచుకోండి.`
        : currentLanguage === 'hi'
        ? `दिमागी खेल का समय हो गया है! आपके देखभालकर्ता ने आपके दैनिक दिमागी खेल निर्धारित किए हैं। कम से कम ${targetMinutes} मिनट खेलें और अपनी याददाश्त को तेज़ रखें।`
        : `It is time for your memory exercise! Your caregiver has scheduled your daily brain games. Play for at least ${targetMinutes} minutes to keep your mind sharp.`;

      voiceService.speak(speech, undefined, undefined, 'HIGH', 'GAME_ALARM');
    }
  }, [visible, currentLanguage, targetMinutes]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' }]}>
          {/* Close / Snooze X button */}
          <TouchableOpacity onPress={onDismiss} style={styles.closeBtn} accessibilityLabel="Dismiss">
            <X size={24} color="#64748B" />
          </TouchableOpacity>

          {/* Alarm Ringing Icon Badge */}
          <View style={styles.iconCircle}>
            <Brain size={56} color="#FFFFFF" />
            <View style={styles.bellBadge}>
              <Bell size={20} color="#FFFFFF" />
            </View>
          </View>

          {/* Title */}
          <Typography size="xxl" weight="bold" align="center" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} style={{ marginTop: SPACING.md }}>
            {t('game_alarm_title') || 'Time for Brain Games!'}
          </Typography>

          {/* Explanation */}
          <Typography size="sm" color={COLORS.textSecondary} align="center" style={{ marginTop: SPACING.xs, lineHeight: 22, paddingHorizontal: SPACING.sm }}>
            {t('game_alarm_desc') ||
              'Your caregiver has scheduled your daily memory exercises. Playing a little every day strengthens memory and focus.'}
          </Typography>

          {/* Minimum Target Box */}
          <View style={styles.targetPill}>
            <Clock size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Typography size="sm" weight="bold" color={COLORS.primary}>
              {t('target_playtime') || 'Daily Goal'}: {targetMinutes} {t('min') || 'mins'}
            </Typography>
          </View>

          {/* Action: Start Playing */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              voiceService.stopSpeaking();
              onStartPlaying();
            }}
            style={styles.playNowBtn}
          >
            <Play size={24} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 10 }} />
            <Typography size="lg" weight="bold" color="#FFFFFF">
              {t('lets_play_btn') || "Let's Play Now"}
            </Typography>
          </TouchableOpacity>

          {/* Snooze 10 Mins */}
          <TouchableOpacity activeOpacity={0.8} onPress={onDismiss} style={styles.snoozeBtn}>
            <Typography size="sm" weight="semibold" color={COLORS.textMuted}>
              {t('snooze_10m') || 'Remind Me in 10 Mins'}
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.full,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  bellBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
  },
  targetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  playNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: RADIUS.xl,
    marginTop: SPACING.xs,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  snoozeBtn: {
    marginTop: SPACING.md,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
  },
});
