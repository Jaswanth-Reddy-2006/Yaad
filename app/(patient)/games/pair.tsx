import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Sparkles,
  Clock,
  Target,
  LogOut,
} from 'lucide-react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Typography } from '../../../components/common/Typography';
import { ListenButton } from '../../../components/common/ListenButton';
import { GameCard } from '../../../components/games/GameCard';
import { GameResultModal } from '../../../components/games/GameResultModal';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { GameController, GameState } from '../../../features/games/engine/GameController';
import { GameDifficulty } from '../../../types';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';

export default function PairGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ difficulty?: string }>();
  const difficulty: GameDifficulty = (params.difficulty as GameDifficulty) || 'EASY';

  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const controllerRef = useRef<GameController | null>(null);

  useEffect(() => {
    const controller = new GameController('PAIR', difficulty, (updatedState) => {
      setGameState(updatedState);
    });
    controllerRef.current = controller;
    controller.start();

    return () => {
      controller.dispose();
    };
  }, [difficulty]);

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

  // Responsive column calculation: 2x2 for Easy (4 cards), 3x4 for Medium (12 cards), 4x4 for Hard (16 cards)
  const numColumns =
    gameState.cards.length <= 4 ? 2 : gameState.cards.length === 12 ? 3 : 4;

  // Prompt text
  const flippedUnmatched = gameState.cards.filter((c) => c.isFlipped && !c.isMatched);
  let promptText = t('match_pair_instruction') || '👉 Tap two cards to find matching pictures';
  if (gameState.matchesCount === gameState.totalRequiredMatches && gameState.status === 'COMPLETED') {
    promptText = '🎉 ' + (t('wonderful_job') || 'Wonderful Job! All pairs matched!');
  } else if (flippedUnmatched.length === 1) {
    const symTitle = t(flippedUnmatched[0].symbolId) || flippedUnmatched[0].title;
    promptText = `✨ Find the matching ${symTitle}!`;
  } else if (gameState.status === 'FEEDBACK') {
    promptText = '🎉 ' + (t('great_job') || 'Great match!');
  }

  // Progress percentage
  const progressPercent = Math.min(
    100,
    Math.round((gameState.matchesCount / Math.max(1, gameState.totalRequiredMatches)) * 100)
  );

  const voiceInstructions = `Match the Cards. Look at the cards carefully and tap two cards to find matching pictures. Take your time.`;

  return (
    <ScreenContainer scrollable={true} style={styles.container}>
      {/* Top Navigation Bar with Back Button, Title, and Listen Button */}
      <View style={styles.topHeaderRow}>
        <TouchableOpacity
          accessibilityLabel={t('go_back') || 'Go Back'}
          accessibilityRole="button"
          onPress={handleBackPress}
          style={[styles.backSquareBtn, { backgroundColor: isHc ? '#1E293B' : '#FFFFFF' }]}
        >
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#6D28D9'} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Typography size="xl" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} align="center">
            {t('match_the_cards') || 'Match the Cards'}
          </Typography>
          <View style={styles.difficultyPill}>
            <Typography size="xs" weight="bold" color="#6D28D9">
              {difficulty} • {gameState.totalRequiredMatches} Pairs
            </Typography>
          </View>
        </View>

        <ListenButton
          textToSpeak={voiceInstructions}
          label="LISTEN"
          size="sm"
          variant="secondary"
        />
      </View>

      {/* Stats Bar (Matches, Time, Hint) */}
      <View
        style={[
          styles.statsCard,
          {
            backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF',
            borderColor: isHc ? COLORS.hcBorder : '#E2E8F0',
          },
        ]}
      >
        {/* Stat 1: Matched Pairs */}
        <View style={styles.statBox}>
          <View style={[styles.statIconCircle, { backgroundColor: '#DCFCE7' }]}>
            <Target size={20} color="#16A34A" />
          </View>
          <View style={{ marginLeft: SPACING.xs }}>
            <Typography size="xs" color={COLORS.textMuted}>
              {t('matched') || 'Matched'}
            </Typography>
            <Typography size="base" weight="bold" color="#16A34A">
              {gameState.matchesCount} / {gameState.totalRequiredMatches}
            </Typography>
          </View>
        </View>

        <View style={styles.verticalDivider} />

        {/* Stat 2: Timer */}
        <View style={styles.statBox}>
          <View style={[styles.statIconCircle, { backgroundColor: '#DBEAFE' }]}>
            <Clock size={20} color="#2563EB" />
          </View>
          <View style={{ marginLeft: SPACING.xs }}>
            <Typography size="xs" color={COLORS.textMuted}>
              {t('time') || 'Time'}
            </Typography>
            <Typography size="base" weight="bold" color="#2563EB">
              {formatTimer(gameState.elapsedSeconds)}
            </Typography>
          </View>
        </View>

        <View style={styles.verticalDivider} />

        {/* Stat 3: Hint Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={hintDisabled}
          onPress={() => controllerRef.current?.useHint()}
          style={[styles.hintBtn, hintDisabled ? styles.hintBtnDisabled : null]}
        >
          <Sparkles size={16} color={hintDisabled ? COLORS.textMuted : '#D97706'} style={{ marginRight: 4 }} />
          <Typography size="xs" weight="bold" color={hintDisabled ? COLORS.textMuted : '#B45309'}>
            {t('hint') || 'Hint'} ({3 - gameState.hintsUsed})
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Match Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
      </View>

      {/* Gentle Guidance Prompt Banner */}
      <View
        style={[
          styles.promptBanner,
          {
            backgroundColor: isHc ? '#1E293B' : '#F5EFFE',
            borderColor: isHc ? '#475569' : '#DDD6FE',
          },
        ]}
      >
        <Typography size="sm" weight="bold" color={isHc ? '#93C5FD' : '#6D28D9'} align="center">
          {promptText}
        </Typography>
      </View>

      {/* Board Grid: Large 2x2, 3x4, or 4x4 cards */}
      <View style={styles.boardGrid}>
        {gameState.cards.map((card, idx) => (
          <GameCard
            key={card.id}
            card={card}
            positionIndex={idx}
            numColumns={numColumns}
            disabled={gameState.isLocked}
            onSelect={(id) => controllerRef.current?.selectCard(id)}
          />
        ))}
      </View>

      {/* Abandon Confirmation Modal */}
      <Modal visible={showLeaveModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <LogOut size={40} color="#DC2626" />
            <Typography size="xl" weight="bold" align="center" style={{ marginTop: SPACING.md }}>
              {t('leave_game_title') || 'Leave Game?'}
            </Typography>
            <Typography size="sm" color={COLORS.textMuted} align="center" style={{ marginTop: 4 }}>
              {t('leave_game_desc') || 'Your current game progress will not be saved.'}
            </Typography>

            <View style={{ flexDirection: 'row', marginTop: SPACING.lg, gap: SPACING.sm, width: '100%' }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={cancelLeave}
                style={[styles.modalActionBtn, { backgroundColor: COLORS.surfaceVariant }]}
              >
                <Typography size="sm" weight="bold" color="#0F172A">
                  {t('continue_game') || 'Continue'}
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={confirmLeave}
                style={[styles.modalActionBtn, { backgroundColor: '#DC2626' }]}
              >
                <Typography size="sm" weight="bold" color="#FFFFFF">
                  {t('leave') || 'Leave'}
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Victory Celebration Modal */}
      <GameResultModal
        visible={gameState.status === 'COMPLETED'}
        result={gameState.result || null}
        onPlayAgain={() => controllerRef.current?.restart()}
        onGoHome={() => router.replace('/(patient)/games')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.xl,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.xs,
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  difficultyPill: {
    backgroundColor: '#F5EFFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginTop: 2,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    marginVertical: SPACING.xs,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 2,
  },
  hintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1.2,
    borderColor: '#FDE68A',
  },
  hintBtnDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.55,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginTop: 2,
    marginBottom: SPACING.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: RADIUS.full,
  },
  promptBanner: {
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginVertical: 4,
  },
  boardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: SPACING.xs,
    paddingBottom: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  modalActionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
});
