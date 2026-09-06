import React, { useEffect, useState, useRef } from 'react';
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
import { GameResultModal, LeaveGameModal } from '../../../components/games/GameResultModal';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { GameController, GameState } from '../../../features/games/engine/GameController';
import { GameDifficulty } from '../../../types';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';

export default function MatchTripletGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ difficulty?: string }>();
  const initialDifficulty: GameDifficulty = (params.difficulty as GameDifficulty) || 'EASY';

  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const [difficulty, setDifficulty] = useState<GameDifficulty>(initialDifficulty);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const controllerRef = useRef<GameController | null>(null);

  useEffect(() => {
    const controller = new GameController('TRIPLET', difficulty, (newState) => {
      setGameState(newState);
    });
    controllerRef.current = controller;
    controller.start();

    return () => {
      controller.dispose();
    };
  }, [difficulty]);

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

  const numColumns = gameState.cards.length <= 12 ? 3 : 4;

  // Prompt text
  const flippedUnmatched = gameState.cards.filter((c) => c.isFlipped && !c.isMatched);
  let promptText = t('triplet_instruction') || '👉 Tap 3 cards with the same picture';
  if (gameState.matchesCount === gameState.totalRequiredMatches && gameState.status === 'COMPLETED') {
    promptText = '🎉 ' + (t('wonderful_job') || 'Wonderful Job! All triplets matched!');
  } else if (flippedUnmatched.length === 2) {
    const symTitle = t(flippedUnmatched[0].symbolId) || flippedUnmatched[0].title;
    promptText = `✨ Find the 3rd matching ${symTitle}!`;
  } else if (gameState.status === 'FEEDBACK') {
    promptText = '🎉 ' + (t('great_job') || 'Great match!');
  }

  // Progress percentage
  const progressPercent = Math.min(
    100,
    Math.round((gameState.matchesCount / Math.max(1, gameState.totalRequiredMatches)) * 100)
  );

  const voiceInstructions = `Find Three. Look at the cards carefully and tap 3 cards to find matching pictures. Take your time.`;

  const levelNum = difficulty === 'EASY' ? 1 : difficulty === 'MEDIUM' ? 2 : difficulty === 'HARD' ? 3 : 4;
  const levelLabel = `Level ${levelNum}`;

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
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#D97706'} strokeWidth={2.5} />
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
          {t('find_three') || 'Find Three'}
        </Typography>
        <View style={styles.difficultyBadge}>
          <Typography size="xs" weight="bold" color="#D97706">
            {levelLabel} • {gameState.totalRequiredMatches} Triplets
          </Typography>
        </View>
      </View>

      {/* Clean Minimal Stat Chips Row (Matched, Time, Hint) */}
      <View style={styles.statsChipsRow}>
        {/* Stat 1: Matched Triplets */}
        <View style={[styles.statChip, { backgroundColor: isHc ? '#78350F' : '#FEF3C7', borderColor: '#FDE68A' }]}>
          <Target size={18} color="#D97706" />
          <Typography size="sm" weight="bold" color="#B45309" style={{ marginLeft: 6 }}>
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

      {/* Board Grid: 3-column responsive cards */}
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
      <LeaveGameModal
        visible={showLeaveModal}
        gameTitle="Match Triplet"
        onCancel={cancelLeave}
        onConfirm={confirmLeave}
      />

      {/* Completion Modal */}
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
    backgroundColor: '#FEF3C7',
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
});

