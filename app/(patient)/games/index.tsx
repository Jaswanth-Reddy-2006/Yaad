import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Play, Brain, Clock, Sparkles, CheckCircle2, Volume2, VolumeX } from 'lucide-react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Typography } from '../../../components/common/Typography';
import {
  MatchCardsBannerIllustration,
  RememberPicturesBannerIllustration,
  FindThreeBannerIllustration,
  WordMatchBannerIllustration,
  AnimalSoundsBannerIllustration,
  FollowTheCupBannerIllustration,
  CountSheepBannerIllustration,
  StoryRecallBannerIllustration,
  ObjectLocationBannerIllustration,
  DailyRoutineBannerIllustration,
  ColorSequenceBannerIllustration,
} from '../../../components/illustrations';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';
import { useVoiceStore } from '../../../store/useVoiceStore';
import { voiceService } from '../../../services/VoiceService';
import { offlineProximitySync } from '../../../services/sync/OfflineProximitySync';

interface GameItem {
  id: string;
  name: string;
  speechText: string;
  cardBg: string;
  borderColor: string;
  titleColor: string;
  btnBg: string;
  route: string;
  renderBanner: () => React.ReactNode;
}

export default function GamesHomeScreen() {
  const router = useRouter();
  const { preferences, currentLanguage, t } = useAccessibilityStore();
  const { isVoiceEnabled, ttsLanguage } = useVoiceStore();
  const isHc = preferences.highContrast;

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Caregiver minimum playtime requirement & today's progress
  const [targetMinutes, setTargetMinutes] = useState(10);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    async function loadPlaytimeInfo() {
      const schedule = await offlineProximitySync.getGameSchedule();
      setTargetMinutes(schedule.minimumPlaytimeMinutes || 10);
      const secs = await offlineProximitySync.getPlaytimeSeconds();
      setPlayedSeconds(secs);
    }
    loadPlaytimeInfo();

    // Increment active play seconds while on games screen
    const ticker = setInterval(async () => {
      const updatedSecs = await offlineProximitySync.addPlaytimeSeconds(5);
      setPlayedSeconds(updatedSecs);
    }, 5000);

    return () => clearInterval(ticker);
  }, []);

  // Games list wrapped in useMemo to react immediately to language changes
  const gamesList: GameItem[] = useMemo(() => [
    {
      id: 'daily-routine',
      name: t('daily_routine_recall') || 'Daily Routine Recall',
      speechText: t('game_speech_daily_routine') || 'Daily Routine Recall. Look at the sequence of daily activities like morning breakfast, taking medicine, and going for a walk. Remember their order, then place them in the correct sequence.',
      cardBg: '#FFFBEB',
      borderColor: '#FDE68A',
      titleColor: '#B45309',
      btnBg: '#D97706',
      route: '/(patient)/games/daily-routine',
      renderBanner: () => <DailyRoutineBannerIllustration height={130} />,
    },
    {
      id: 'object-location',
      name: t('object_location') || 'Object–Location Memory',
      speechText: t('game_speech_object_location') || 'Object and Location Memory. Look closely at the room to remember where each item is placed. When the items disappear, tap on the room to show where each item was located.',
      cardBg: '#F0FDFA',
      borderColor: '#99F6E4',
      titleColor: '#0D9488',
      btnBg: '#0D9488',
      route: '/(patient)/games/object-location',
      renderBanner: () => <ObjectLocationBannerIllustration height={130} />,
    },
    {
      id: 'story-recall',
      name: t('story_recall') || 'Story Recall',
      speechText: t('game_speech_story_recall') || 'Story Recall. Look at the short picture story and listen carefully. Then answer simple questions about what the characters did and what happened.',
      cardBg: '#EEF2FF',
      borderColor: '#C7D2FE',
      titleColor: '#4338CA',
      btnBg: '#4F46E5',
      route: '/(patient)/games/story-recall',
      renderBanner: () => <StoryRecallBannerIllustration height={130} />,
    },
    {
      id: 'count-sheep',
      name: t('count_the_sheep') || 'Count the Sheep',
      speechText: t('game_speech_sheep_count') || 'Count the Sheep. Watch the sheep entering and leaving the house. Count how many sheep are inside, and tap the correct number.',
      cardBg: '#F0FDF4',
      borderColor: '#BBF7D0',
      titleColor: '#15803D',
      btnBg: '#16A34A',
      route: '/(patient)/games/sheep-count',
      renderBanner: () => <CountSheepBannerIllustration height={130} />,
    },
    {
      id: 'match-cards',
      name: t('match_the_cards') || 'Match the Cards',
      speechText: t('game_speech_pair') || 'Match the Cards. Tap on the cards to turn them over, and find two cards with the exact same picture. Take your time and find all pairs.',
      cardBg: '#FAF5FF',
      borderColor: '#DDD6FE',
      titleColor: '#6D28D9',
      btnBg: '#7C3AED',
      route: '/(patient)/games/pair',
      renderBanner: () => <MatchCardsBannerIllustration height={130} />,
    },
    {
      id: 'remember-pictures',
      name: t('remember_the_pictures') || 'Remember the Pictures',
      speechText: t('game_speech_remember_pictures') || 'Remember the Pictures. Study the pictures on the screen for a few seconds. When they are hidden, choose the pictures you remember seeing.',
      cardBg: '#F0FDF4',
      borderColor: '#BBF7D0',
      titleColor: '#15803D',
      btnBg: '#16A34A',
      route: '/(patient)/games/remember-pictures',
      renderBanner: () => <RememberPicturesBannerIllustration height={130} />,
    },
    {
      id: 'follow-cup',
      name: t('follow_the_cup') || 'Follow the Glass',
      speechText: t('game_speech_follow_cup') || 'Follow the Glass. Watch where the shining star is hidden under the glasses. Follow the glasses as they move and shuffle, then tap the glass with the star.',
      cardBg: '#F5F3FF',
      borderColor: '#DDD6FE',
      titleColor: '#7C3AED',
      btnBg: '#7C3AED',
      route: '/(patient)/games/follow-cup',
      renderBanner: () => <FollowTheCupBannerIllustration height={130} />,
    },
    {
      id: 'animal-sounds',
      name: t('animal_sounds') || 'Animal Sounds',
      speechText: t('game_speech_animal_sounds') || 'Animal Sounds. Listen carefully to the animal sound played aloud. Tap the picture of the animal that makes that sound.',
      cardBg: '#FEF3C7',
      borderColor: '#FDE68A',
      titleColor: '#D97706',
      btnBg: '#D97706',
      route: '/(patient)/games/animal-sounds',
      renderBanner: () => <AnimalSoundsBannerIllustration height={130} />,
    },
    {
      id: 'word-match',
      name: t('name_the_object') || 'Name the Object',
      speechText: t('game_speech_word_match') || 'Name the Object. Look at the clear picture shown on the screen, and tap the matching name of the object.',
      cardBg: '#EFF6FF',
      borderColor: '#BFDBFE',
      titleColor: '#1D4ED8',
      btnBg: '#2563EB',
      route: '/(patient)/games/word-match',
      renderBanner: () => <WordMatchBannerIllustration height={130} />,
    },
    {
      id: 'triplet',
      name: t('find_three') || 'Find Three',
      speechText: t('game_speech_triplet') || 'Find Three. Tap the cards to turn them over, and find three cards that belong together with the same picture.',
      cardBg: '#FFFBEB',
      borderColor: '#FDE68A',
      titleColor: '#D97706',
      btnBg: '#F59E0B',
      route: '/(patient)/games/triplet',
      renderBanner: () => <FindThreeBannerIllustration height={130} />,
    },
    {
      id: 'color-sequence',
      name: t('color_sequence') || 'Color Sequence',
      speechText: t('game_speech_color_sequence') || 'Color Sequence. Watch the colored tiles light up one after another in order. Remember the sequence and tap the tiles back in the exact same order.',
      cardBg: '#F0FDF4',
      borderColor: '#BBF7D0',
      titleColor: '#15803D',
      btnBg: '#16A34A',
      route: '/(patient)/games/color-sequence',
      renderBanner: () => <ColorSequenceBannerIllustration height={130} />,
    },
  ], [currentLanguage, t]);

  // Gentle pulse animation when a card is active
  useEffect(() => {
    if (!activeCardId) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [activeCardId, pulseAnim]);

  // Warm voice welcome when opening the Games screen
  useEffect(() => {
    if (!isVoiceEnabled) return;
    setIsSpeaking(true);
    const welcomeTimer = setTimeout(() => {
      const welcomeText = t('games_welcome_prompt') || "Let's play! Tap on any game to hear how to play, or tap Play to begin.";
      voiceService.speak(
        welcomeText,
        ttsLanguage,
        {
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        },
        'NORMAL',
        'GAMES_WELCOME'
      );
    }, 400);

    return () => {
      clearTimeout(welcomeTimer);
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    };
  }, [isVoiceEnabled, ttsLanguage, currentLanguage, t]);

  const [isMuted, setIsMuted] = useState(false);

  // Speaker button toggles between Mute and Unmute
  const handleToggleSpeaker = () => {
    if (!isMuted) {
      // Mute: immediately stop all speech
      voiceService.stopSpeaking();
      voiceService.stop();
      setIsSpeaking(false);
      setIsMuted(true);
      setActiveCardId(null);
    } else {
      // Unmute: unmute and speak welcome/instructions
      setIsMuted(false);
      setIsSpeaking(true);
      const welcomeText = t('games_welcome_prompt') || "Let's play! Tap on any game to hear how to play, or tap Play to begin.";
      voiceService.speak(
        welcomeText,
        ttsLanguage,
        {
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        },
        'HIGH',
        'GAMES_WELCOME'
      );
    }
  };

  // Tap on card body: reads out the full explanation of what the game is and what to do, or stops if speaking
  const handleCardPress = (game: GameItem) => {
    if (activeCardId === game.id && (isSpeaking || voiceService.isSpeaking())) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
      setActiveCardId(null);
      return;
    }
    setIsMuted(false);
    setActiveCardId(game.id);
    setIsSpeaking(true);
    voiceService.speak(
      game.speechText,
      ttsLanguage,
      {
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      },
      'HIGH',
      `GAME_EXPLAIN_${game.id}`
    );
  };

  // Tap on PLAY button: immediately stops voice and launches the game
  const handleSelectGame = (route: string) => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
    router.push(route as any);
  };

  const playedMinutes = Math.floor(playedSeconds / 60);
  const isGoalAchieved = playedMinutes >= targetMinutes;
  const percent = Math.min(100, Math.round((playedMinutes / (targetMinutes || 1)) * 100));

  return (
    <ScreenContainer scrollable={true} style={styles.container}>
      {/* Top Header Row with Back Button, Centered Title, Top-Right Speaker Button */}
      <View style={styles.topHeaderRow}>
        <TouchableOpacity
          accessibilityLabel={t('go_back') || 'Go Back'}
          accessibilityRole="button"
          onPress={() => {
            voiceService.stopSpeaking();
            setIsSpeaking(false);
            router.back();
          }}
          style={[styles.backSquareBtn, { backgroundColor: isHc ? '#1E293B' : '#FFFFFF' }]}
        >
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#6D28D9'} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerCenterText}>
          <Typography size="xl" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} align="center">
            {t('lets_play') || "Let's Play"}
          </Typography>
        </View>

        {/* Top-Right Speaker Button: toggles Mute / Unmute */}
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

      {/* Caregiver Daily Goal & Playtime Progress Banner */}
      <View style={[styles.goalBanner, isGoalAchieved ? styles.goalBannerAchieved : null]}>
        <View style={styles.goalLeft}>
          <View style={[styles.goalIconCircle, { backgroundColor: isGoalAchieved ? '#DCFCE7' : '#EFF6FF' }]}>
            {isGoalAchieved ? (
              <CheckCircle2 size={22} color="#15803D" />
            ) : (
              <Brain size={22} color="#2563EB" />
            )}
          </View>
          <View style={{ marginLeft: SPACING.sm }}>
            <Typography size="xs" weight="bold" color={isGoalAchieved ? '#15803D' : '#1E40AF'}>
              {isGoalAchieved ? '🎉 Daily Brain Target Completed!' : `Caregiver Goal: ${targetMinutes} Mins`}
            </Typography>
            <Typography size="xs" color="#64748B" style={{ marginTop: 2 }}>
              {isGoalAchieved
                ? `You played ${playedMinutes} mins! Mind is sharp.`
                : `${playedMinutes} of ${targetMinutes} mins played today`}
            </Typography>
          </View>
        </View>

        <View style={[styles.goalPercentBadge, { backgroundColor: isGoalAchieved ? '#15803D' : '#2563EB' }]}>
          <Typography size="xs" weight="bold" color="#FFFFFF">
            {percent}%
          </Typography>
        </View>
      </View>

      {/* Dedicated Large Visual Game Cards */}
      <View style={styles.gamesStack}>
        {gamesList.map((game) => {
          const isSelected = activeCardId === game.id;
          return (
            <Animated.View
              key={game.id}
              style={{
                transform: [{ scale: isSelected ? pulseAnim : 1 }],
              }}
            >
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={() => handleCardPress(game)}
                accessibilityLabel={`${game.name}. ${game.speechText}`}
                accessibilityRole="button"
                style={[
                  styles.gameCard,
                  {
                    backgroundColor: isHc ? COLORS.hcCardBackground : game.cardBg,
                    borderColor: isSelected
                      ? game.btnBg
                      : isHc
                      ? COLORS.hcBorder
                      : game.borderColor,
                    borderWidth: isSelected ? 3.5 : 2,
                  },
                ]}
              >
                {/* 1. Large Image Banner */}
                <View style={styles.bannerWrapper}>
                  {game.renderBanner()}
                </View>

                {/* 2. Bold, Elder-Friendly Title (Paragraph Description Removed) */}
                <View style={styles.cardTextContainer}>
                  <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : game.titleColor}>
                    {game.name}
                  </Typography>
                </View>

                {/* 3. Wide, Tactile Full-Width PLAY Button (Speech Button Beside Play Removed) */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('play') || 'Play'} ${game.name}`}
                    onPress={() => handleSelectGame(game.route)}
                    style={[styles.playBtn, { backgroundColor: game.btnBg }]}
                  >
                    <Play size={20} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 8 }} />
                    <Typography size="base" weight="bold" color="#FFFFFF">
                      {t('play') || 'PLAY'}
                    </Typography>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  backSquareBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerCenterText: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  headerSpeakerBtn: {
    width: 44,
    height: 44,
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
  gamesStack: {
    gap: SPACING.lg,
  },
  gameCard: {
    width: '100%',
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  bannerWrapper: {
    width: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  cardTextContainer: {
    width: '100%',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  actionsRow: {
    width: '100%',
    marginTop: SPACING.md,
  },
  playBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  goalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  goalBannerAchieved: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  goalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalPercentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginLeft: SPACING.sm,
  },
});
