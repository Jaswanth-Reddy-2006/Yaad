import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Volume2, VolumeX, Play, Calendar, Eye, Palette } from 'lucide-react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { Typography } from '../../components/common/Typography';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';
import { useVoiceStore } from '../../store/useVoiceStore';
import { voiceService } from '../../services/VoiceService';

interface RecallExerciseItem {
  id: string;
  titleKey: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  iconBg: string;
  badgeEn: string;
  badgeTe: string;
  badgeHi: string;
  subtitleEn: string;
  subtitleTe: string;
  subtitleHi: string;
  pastelBg: string;
  borderColor: string;
  titleColor: string;
  btnBg: string;
  route: string;
}

const EXERCISES_LIST: RecallExerciseItem[] = [
  {
    id: '1',
    titleKey: 'daily_routine_recall',
    icon: Calendar,
    iconBg: '#EDE9FE',
    badgeEn: 'Daily Routine',
    badgeTe: 'రోజువారీ దినచర్య',
    badgeHi: 'दैनिक दिनचर्या',
    subtitleEn: 'Recall your daily activities and timings',
    subtitleTe: 'మీ రోజువారీ పనులు మరియు సమయాలను గుర్తుచేసుకోండి',
    subtitleHi: 'अपने दैनिक कार्यों और समय को याद करें',
    pastelBg: '#F5EFFE',
    borderColor: '#C084FC',
    titleColor: '#6D28D9',
    btnBg: '#7C3AED',
    route: '/(patient)/games/daily-routine',
  },
  {
    id: '2',
    titleKey: 'name_the_object',
    icon: Eye,
    iconBg: '#DCFCE7',
    badgeEn: 'Picture Recall',
    badgeTe: 'చిత్రాల గుర్తింపు',
    badgeHi: 'चित्र पहचान',
    subtitleEn: 'Look at everyday objects and choose the name',
    subtitleTe: 'చిత్రాలను చూసి సరైన వస్తువు పేరును ఎంచుకోండి',
    subtitleHi: 'चित्र देखें और वस्तु का सही नाम चुनें',
    pastelBg: '#E6F9ED',
    borderColor: '#86EFAC',
    titleColor: '#15803D',
    btnBg: '#16A34A',
    route: '/(patient)/games/word-match',
  },
  {
    id: '3',
    titleKey: 'color_sequence',
    icon: Palette,
    iconBg: '#FEF3C7',
    badgeEn: 'Color Sequence',
    badgeTe: 'రంగుల క్రమం',
    badgeHi: 'रंग क्रम',
    subtitleEn: 'Remember and follow the shining color order',
    subtitleTe: 'రంగుల క్రమాన్ని గుర్తుంచుకుని అనుసరించండి',
    subtitleHi: 'रंगों के क्रम को याद रखें और दोहराएं',
    pastelBg: '#FFFBEB',
    borderColor: '#FDE68A',
    titleColor: '#D97706',
    btnBg: '#D97706',
    route: '/(patient)/games/color-sequence',
  },
];

export default function RecallMemoryScreen() {
  const router = useRouter();
  const { preferences, currentLanguage, t } = useAccessibilityStore();
  const { isVoiceEnabled, ttsLanguage } = useVoiceStore();
  const isHc = preferences.highContrast;

  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!isVoiceEnabled) return;
    setIsSpeaking(true);
    const timer = setTimeout(() => {
      voiceService.speak(
        `${t('recall_memory')}. ${t('choose_a_game')}`,
        ttsLanguage,
        {
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        },
        'NORMAL',
        'RECALL_MEMORY_INTRO'
      );
    }, 400);

    return () => {
      clearTimeout(timer);
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    };
  }, [isVoiceEnabled, ttsLanguage, t]);

  const [isMuted, setIsMuted] = useState(false);

  // Speaker button toggles between Mute and Unmute
  const handleToggleSpeaker = () => {
    if (!isMuted) {
      // Mute: immediately stop speech
      voiceService.stopSpeaking();
      voiceService.stop();
      setIsSpeaking(false);
      setIsMuted(true);
    } else {
      // Unmute: unmute and speak memory recall intro
      setIsMuted(false);
      setIsSpeaking(true);
      voiceService.speak(
        `${t('recall_memory')}. ${t('choose_a_game')}`,
        ttsLanguage,
        {
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        },
        'HIGH',
        'RECALL_MEMORY_INTRO'
      );
    }
  };

  const handleNavigate = (route: string) => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
    router.push(route as any);
  };

  return (
    <ScreenContainer scrollable={true} style={styles.container}>
      {/* Header: Back Arrow Button on Left + Bold Title Center + Top-Right Speaker Button */}
      <View style={styles.topHeaderRow}>
        <TouchableOpacity
          accessibilityLabel={t('go_back')}
          accessibilityRole="button"
          onPress={() => {
            voiceService.stopSpeaking();
            setIsSpeaking(false);
            router.back();
          }}
          style={styles.backSquareBtn}
        >
          <ArrowLeft size={26} color="#6D28D9" strokeWidth={2.5} />
        </TouchableOpacity>

        <Text style={[styles.headerTitleText, { color: isHc ? COLORS.hcTextPrimary : '#0F172A' }]}>
          {t('recall_memory')}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleToggleSpeaker}
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
            <Volume2 size={24} color={isSpeaking ? '#FFFFFF' : '#6D28D9'} />
          )}
        </TouchableOpacity>
      </View>

      {/* Cards matching Reminders card size and layout structure 1:1 */}
      <View style={styles.taskList}>
        {EXERCISES_LIST.map((item) => {
          const IconComp = item.icon;
          const badgeText =
            currentLanguage === 'te'
              ? item.badgeTe
              : currentLanguage === 'hi'
              ? item.badgeHi
              : item.badgeEn;

          const subtitleText =
            currentLanguage === 'te'
              ? item.subtitleTe
              : currentLanguage === 'hi'
              ? item.subtitleHi
              : item.subtitleEn;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.88}
              onPress={() => handleNavigate(item.route)}
              style={[
                styles.taskCard,
                {
                  backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF',
                  borderColor: item.borderColor,
                },
              ]}
            >
              {/* Left Icon Tile (62x62 matching Reminders iconBox 1:1) */}
              <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
                <IconComp size={32} color={item.titleColor} />
              </View>

              {/* Middle Details (matching Reminders taskDetails 1:1) */}
              <View style={styles.taskDetails}>
                <View style={styles.metaRow}>
                  <View style={[styles.categoryTag, { backgroundColor: item.pastelBg }]}>
                    <Typography size="xs" weight="bold" color={item.titleColor}>
                      {badgeText}
                    </Typography>
                  </View>
                </View>

                <Typography
                  size="lg"
                  weight="bold"
                  color={isHc ? COLORS.hcTextPrimary : item.titleColor}
                  style={styles.taskTitleText}
                >
                  {t(item.titleKey)}
                </Typography>

                <Typography size="xs" color="#64748B" style={styles.descText}>
                  {subtitleText}
                </Typography>
              </View>

              {/* Right Action Button (52x52 matching Reminders 52x52 checkboxArea) */}
              <View style={[styles.actionBtn, { backgroundColor: item.btnBg }]}>
                <Play size={24} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 3 }} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: SPACING.xl,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  backSquareBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E9D5FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitleText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSpeakerBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: '#F3E8FF',
    borderWidth: 1.5,
    borderColor: '#C084FC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerSpeakerBtnActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
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
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 114,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderWidth: 2,
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
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
  },
  actionBtn: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
});
