import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Sparkles,
  Clock,
  Target,
  LogOut,
  Volume2,
  Play,
} from 'lucide-react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Typography } from '../../../components/common/Typography';
import { ListenButton } from '../../../components/common/ListenButton';
import { GameCard } from '../../../components/games/GameCard';
import { GameResultModal, LeaveGameModal } from '../../../components/games/GameResultModal';
import { MatchCardsBannerIllustration } from '../../../components/illustrations';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { GameController, GameState } from '../../../features/games/engine/GameController';
import { GameDifficulty } from '../../../types';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';
import { useVoiceStore } from '../../../store/useVoiceStore';
import { voiceService } from '../../../services/VoiceService';
import { voiceContentResolver } from '../../../services/voice/VoiceContentResolver';

export default function PairGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ difficulty?: string }>();
  const initialDifficulty: GameDifficulty = (params.difficulty as GameDifficulty) || 'EASY';

  const { preferences, t, currentLanguage } = useAccessibilityStore();
  const { isVoiceEnabled, ttsLanguage } = useVoiceStore();
  const isHc = preferences.highContrast;
  const { width: screenWidth } = useWindowDimensions();

  const [difficulty, setDifficulty] = useState<GameDifficulty>(initialDifficulty);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(true);
  const controllerRef = useRef<GameController | null>(null);
  const gameStartedRef = useRef<boolean>(false);

  const speakInstructions = () => {
    const text1 = t('pair_inst_1') || 'You will see cards on the screen.';
    const text2 = t('pair_inst_2') || 'Tap two cards to turn them over. Find two cards that look the same.';
    const text3 = t('pair_inst_3') || "When you are ready, tap Let's Play.";
    const fullText = `${text1} ${text2} ${text3}`;
    voiceService.speak(
      fullText,
      ttsLanguage,
      {
        onDone: () => {
          if (!gameStartedRef.current && showHowToPlay) {
            handleStartGame();
          }
        },
      },
      'HIGH',
      'PAIR_INSTRUCTIONS'
    );
  };

  useEffect(() => {
    if (showHowToPlay && isVoiceEnabled) {
      const timer = setTimeout(() => {
        speakInstructions();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showHowToPlay, isVoiceEnabled]);

  useEffect(() => {
    const controller = new GameController('PAIR', difficulty, (updatedState) => {
      setGameState(updatedState);
    });
    controllerRef.current = controller;

    return () => {
      controller.dispose();
    };
  }, [difficulty]);

  const handleStartGame = () => {
    if (gameStartedRef.current) return;
    gameStartedRef.current = true;
    setShowHowToPlay(false);
    voiceService.stopSpeaking();
    controllerRef.current?.start();
  };

  const handleSelectLevel = (newDifficulty: GameDifficulty) => {
    if (newDifficulty === difficulty) return;
    setDifficulty(newDifficulty);
  };

  const handleNextLevel = () => {
    if (difficulty === 'EASY') setDifficulty('MEDIUM');
    else if (difficulty === 'MEDIUM') setDifficulty('HARD');
    else if (difficulty === 'HARD') setDifficulty('EXPERT');
    else controllerRef.current?.restart();
  };

  const handleBackPress = () => {
    if (
      gameState &&
      (gameState.status === 'PLAYING' ||
        gameState.status === 'EVALUATING' ||
        gameState.status === 'FEEDBACK')
    ) {
      controllerRef.current?.pause();
      setShowLeaveModal(true);
    } else {
      router.back();
    }
  };

  const confirmLeave = () => {
    setShowLeaveModal(false);
    controllerRef.current?.abandon();
    router.back();
  };

  const cancelLeave = () => {
    setShowLeaveModal(false);
    controllerRef.current?.resume();
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!gameState) return null;

  const hintDisabled =
    gameState.hintCooldownActive || gameState.hintsUsed >= 3 || gameState.isLocked;

  // Responsive column calculation: 2x2 for Easy (4 cards), 3x4 for Medium (12 cards), 4x4 for Hard/Expert (16 cards)
  const numColumns =
    gameState.cards.length <= 4 ? 2 : gameState.cards.length === 12 ? 3 : 4;

  // Compute exact pixel card sizes to avoid percentage+gap conflicts in flexWrap
  const horizontalPadding = SPACING.md * 2; // container paddingHorizontal on both sides
  const cardGap = 10; // gap between cards (px)
  const totalGaps = (numColumns - 1) * cardGap;
  const cardPixelWidth = Math.floor((screenWidth - horizontalPadding - totalGaps) / numColumns);
  const cardPixelHeight = Math.round(cardPixelWidth * (numColumns === 2 ? 0.95 : numColumns === 3 ? 0.88 : 0.82));

  // Chunk cards into rows for stable rendering
  const cardRows: typeof gameState.cards[] = [];
  for (let i = 0; i < gameState.cards.length; i += numColumns) {
    cardRows.push(gameState.cards.slice(i, i + numColumns));
  }

  // Prompt text
  const flippedUnmatched = gameState.cards.filter((c) => c.isFlipped && !c.isMatched);
  let promptText = t('match_pair_instruction') || 'Tap two cards to find matching pictures';
  if (gameState.matchesCount === gameState.totalRequiredMatches && gameState.status === 'COMPLETED') {
    promptText = t('wonderful_job') || 'Wonderful Job! All pairs matched!';
  } else if (flippedUnmatched.length === 1) {
    const symTitle = t(flippedUnmatched[0].symbolId) || flippedUnmatched[0].title;
    promptText = `Find the matching ${symTitle}!`;
  } else if (gameState.status === 'FEEDBACK') {
    promptText = t('great_job') || 'Great match!';
  }

  // Progress percentage
  const progressPercent = Math.min(
    100,
    Math.round((gameState.matchesCount / Math.max(1, gameState.totalRequiredMatches)) * 100)
  );

  const voiceInstructions = `Match the Cards. Look at the cards carefully and tap two cards to find matching pictures. Take your time.`;

  const levelNum = difficulty === 'EASY' ? 1 : difficulty === 'MEDIUM' ? 2 : difficulty === 'HARD' ? 3 : 4;
  const levelLabel = `Level ${levelNum}`;

  if (showHowToPlay) {
    return (
      <ScreenContainer scrollable={true} style={styles.container}>
        <View style={styles.navRow}>
          <TouchableOpacity
            accessibilityLabel={t('go_back') || 'Go Back'}
            accessibilityRole="button"
            onPress={() => router.back()}
            style={[styles.backSquareBtn, { backgroundColor: isHc ? '#1E293B' : '#FFFFFF' }]}
          >
            <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#6D28D9'} strokeWidth={2.5} />
          </TouchableOpacity>

          <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'}>
            {t('match_the_cards') || 'Match the Cards'}
          </Typography>

          <View style={{ width: 44 }} />
        </View>

        <View style={styles.howToPlayCard}>
          <View style={styles.illustrationWrapper}>
            <MatchCardsBannerIllustration height={160} />
          </View>

          <Typography size="xl" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#6D28D9'} align="center" style={{ marginTop: SPACING.md }}>
            How to Play
          </Typography>

          <View style={styles.instructionStepsContainer}>
            <View style={styles.stepRow}>
              <View style={styles.stepBadge}><Typography size="sm" weight="bold" color="#FFFFFF">1</Typography></View>
              <Typography size="base" color={isHc ? COLORS.hcTextPrimary : '#334155'} style={styles.stepText}>
                {t('pair_inst_1') || 'You will see cards on the screen.'}
              </Typography>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepBadge}><Typography size="sm" weight="bold" color="#FFFFFF">2</Typography></View>
              <Typography size="base" color={isHc ? COLORS.hcTextPrimary : '#334155'} style={styles.stepText}>
                {t('pair_inst_2') || 'Tap two cards to turn them over. Find two cards that look the same.'}
              </Typography>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepBadge}><Typography size="sm" weight="bold" color="#FFFFFF">3</Typography></View>
              <Typography size="base" color={isHc ? COLORS.hcTextPrimary : '#334155'} style={styles.stepText}>
                {t('pair_inst_3') || 'When you are ready, tap Let\'s Play.'}
              </Typography>
            </View>
          </View>

          <View style={styles.howToPlayActions}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={speakInstructions}
              style={styles.hearAgainBtn}
            >
              <Volume2 size={22} color="#6D28D9" style={{ marginRight: 8 }} />
              <Typography size="base" weight="bold" color="#6D28D9">
                {t('hear_instructions_again') || 'Hear Instructions Again'}
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleStartGame}
              style={styles.letsPlayBigBtn}
            >
              <Play size={24} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 8 }} />
              <Typography size="lg" weight="bold" color="#FFFFFF">
                {t('lets_play_btn') || "Let's Play"}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={true} style={styles.container}>
      {/* Top Navigation Row: Back Button & Listen Button */}
      <View style={styles.navRow}>
        <TouchableOpacity
          accessibilityLabel={t('go_back') || 'Go Back'}
          accessibilityRole="button"
          onPress={handleBackPress}
          style={[styles.backSquareBtn, { backgroundColor: isHc ? '#1E293B' : '#FFFFFF' }]}
        >
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#6D28D9'} strokeWidth={2.5} />
        </TouchableOpacity>

        <ListenButton
          textToSpeak={voiceInstructions}
          size="sm"
          variant="secondary"
        />
      </View>

      {/* Title & Level Header */}
      <View style={styles.titleSection}>
        <Typography size="xxl" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} align="center">
          {t('match_the_cards') || 'Match the Cards'}
        </Typography>
        <View style={styles.difficultyBadge}>
          <Typography size="xs" weight="bold" color="#6D28D9">
            {levelLabel} • {gameState.totalRequiredMatches} {t('pairs_label') || 'Pairs'}
          </Typography>
        </View>
      </View>

      {/* Clean Minimal Stat Chips Row (Matched, Time, Hint) */}
      <View style={styles.statsChipsRow}>
        {/* Stat 1: Matched Pairs */}
        <View style={[styles.statChip, { backgroundColor: isHc ? '#064E3B' : '#DCFCE7', borderColor: '#BBF7D0' }]}>
          <Target size={18} color="#16A34A" />
          <Typography size="sm" weight="bold" color="#15803D" style={{ marginLeft: 6 }}>
            {gameState.matchesCount} / {gameState.totalRequiredMatches}
          </Typography>
        </View>

        {/* Stat 2: Timer */}
        <View style={[styles.statChip, { backgroundColor: isHc ? '#1E3A8A' : '#DBEAFE', borderColor: '#BFDBFE' }]}>
          <Clock size={18} color="#2563EB" />
          <Typography size="sm" weight="bold" color="#1D4ED8" style={{ marginLeft: 6 }}>
            {formatTimer(gameState.elapsedSeconds)}
          </Typography>
        </View>

        {/* Stat 3: Hint Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={hintDisabled}
          onPress={() => controllerRef.current?.useHint()}
          style={[
            styles.statChip,
            { backgroundColor: isHc ? '#78350F' : '#FEF3C7', borderColor: '#FDE68A' },
            hintDisabled ? styles.hintBtnDisabled : null,
          ]}
        >
          <Sparkles size={16} color={hintDisabled ? COLORS.textMuted : '#D97706'} />
          <Typography size="sm" weight="bold" color={hintDisabled ? COLORS.textMuted : '#B45309'} style={{ marginLeft: 5 }}>
            {t('hint') || 'Hint'} ({3 - gameState.hintsUsed})
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Board Grid: Row-by-row layout with exact pixel widths to ensure correct wrapping */}
      <View style={styles.boardGrid}>
        {cardRows.map((row, rowIdx) => (
          <View key={`row-${rowIdx}`} style={[styles.cardRow, { gap: cardGap }]}>
            {row.map((card, colIdx) => (
              <GameCard
                key={card.id}
                card={card}
                positionIndex={rowIdx * numColumns + colIdx}
                numColumns={numColumns}
                customWidth={cardPixelWidth}
                disabled={gameState.isLocked}
                onSelect={(id) => controllerRef.current?.selectCard(id)}
              />
            ))}
          </View>
        ))}
      </View>

      {/* Abandon Confirmation Modal */}
      <LeaveGameModal
        visible={showLeaveModal}
        gameTitle="Match the Pairs"
        onCancel={cancelLeave}
        onConfirm={confirmLeave}
      />

      {/* Victory Celebration Modal */}
      <GameResultModal
        visible={gameState.status === 'COMPLETED'}
        result={gameState.result || null}
        playAgainLabel={difficulty === 'EXPERT' ? 'PLAY AGAIN' : 'NEXT LEVEL'}
        onPlayAgain={handleNextLevel}
        onGoHome={() => router.replace('/(patient)/games')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
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
  titleSection: {
    alignItems: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  difficultyBadge: {
    backgroundColor: '#F5EFFE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginTop: 4,
  },
  statsChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: SPACING.xs,
    gap: 8,
  },
  statChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  hintBtnDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.55,
  },
  boardGrid: {
    flexDirection: 'column',
    gap: 10,
    marginTop: SPACING.sm,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  howToPlayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginTop: SPACING.xs,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: '#FAF5FF',
  },
  instructionStepsContainer: {
    marginVertical: SPACING.md,
    gap: SPACING.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  stepText: {
    flex: 1,
    fontWeight: '600',
  },
  howToPlayActions: {
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  hearAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: '#7C3AED',
    backgroundColor: '#F5EFFE',
  },
  letsPlayBigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: RADIUS.full,
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
});
