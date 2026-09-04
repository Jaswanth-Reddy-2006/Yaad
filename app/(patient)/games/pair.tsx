import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Sparkles, Trophy, RotateCcw, Award, LogOut } from 'lucide-react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Typography } from '../../../components/common/Typography';
import { GameCard } from '../../../components/games/GameCard';
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
    if (gameState && (gameState.status === 'PLAYING' || gameState.status === 'EVALUATING' || gameState.status === 'FEEDBACK')) {
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

  const hintDisabled = gameState.hintCooldownActive || gameState.hintsUsed >= 3 || gameState.isLocked;

  return (
    <ScreenContainer scrollable style={styles.container}>
      {/* Header */}
      <View style={styles.topHeaderRow}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={handleBackPress}
          style={styles.backBtn}
        >
          <ArrowLeft size={28} color={isHc ? COLORS.hcTextPrimary : '#0F172A'} />
        </TouchableOpacity>

        <Typography size="xxl" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} style={{ marginLeft: SPACING.xs }}>
          {t('play_game')} • Match Pair ({difficulty})
        </Typography>
      </View>

      {/* Game Stats & Hint Button Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Typography size="xs" color={COLORS.textMuted}>
            Matched
          </Typography>
          <Typography size="lg" weight="bold" color="#16A34A">
            {gameState.matchesCount} / {gameState.totalRequiredMatches}
          </Typography>
        </View>

        <View style={styles.statBox}>
          <Typography size="xs" color={COLORS.textMuted}>
            Time
          </Typography>
          <Typography size="lg" weight="bold" color="#2563EB">
            {formatTimer(gameState.elapsedSeconds)}
          </Typography>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={hintDisabled}
          onPress={() => controllerRef.current?.useHint()}
          style={[styles.hintBtn, hintDisabled ? styles.hintBtnDisabled : null]}
        >
          <Sparkles size={18} color={hintDisabled ? COLORS.textMuted : '#D97706'} style={{ marginRight: 4 }} />
          <Typography size="xs" weight="bold" color={hintDisabled ? COLORS.textMuted : '#B45309'}>
            Hint ({3 - gameState.hintsUsed})
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Board Grid */}
      <View style={styles.boardGrid}>
        {gameState.cards.map((card, idx) => (
          <GameCard
            key={card.id}
            card={card}
            positionIndex={idx}
            disabled={gameState.isLocked}
            onSelect={(id) => controllerRef.current?.selectCard(id)}
          />
        ))}
      </View>

      {/* Encouragement Box */}
      <View style={styles.encouragementBox}>
        <Award size={20} color="#16A34A" style={{ marginRight: 8 }} />
        <Typography size="xs" color="#166534" weight="bold">
          Great job! Take your time and flip matching pictures.
        </Typography>
      </View>

      {/* Abandon Confirmation Modal */}
      <Modal visible={showLeaveModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <LogOut size={40} color="#DC2626" />
            <Typography size="xl" weight="bold" align="center" style={{ marginTop: SPACING.md }}>
              Leave this game?
            </Typography>
            <Typography size="sm" color={COLORS.textMuted} align="center" style={{ marginTop: 4 }}>
              Your current progress will not be saved as completed.
            </Typography>

            <View style={{ flexDirection: 'row', marginTop: SPACING.lg, gap: SPACING.sm }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={cancelLeave}
                style={[styles.modalActionBtn, { backgroundColor: COLORS.surfaceVariant }]}
              >
                <Typography size="sm" weight="bold" color="#0F172A">
                  Continue Game
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={confirmLeave}
                style={[styles.modalActionBtn, { backgroundColor: '#DC2626' }]}
              >
                <Typography size="sm" weight="bold" color="#FFFFFF">
                  Leave
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Celebratory Results Modal */}
      <Modal visible={gameState.status === 'COMPLETED'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.trophyCircle}>
              <Trophy size={48} color="#D97706" />
            </View>

            <Typography size="xxl" weight="bold" align="center" style={{ marginTop: SPACING.md }}>
              Wonderful Job!
            </Typography>

            <Typography size="sm" color={COLORS.textMuted} align="center" style={{ marginTop: 4 }}>
              You matched all {gameState.totalRequiredMatches} pairs in {formatTimer(gameState.elapsedSeconds)}!
            </Typography>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => controllerRef.current?.restart()}
              style={styles.playAgainBtn}
            >
              <RotateCcw size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Typography size="base" weight="bold" color="#FFFFFF">
                Play Next Level
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              style={{ marginTop: SPACING.md }}
            >
              <Typography size="sm" color={COLORS.textMuted} weight="bold">
                Back to Games
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.lg,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  statBox: {
    alignItems: 'center',
  },
  hintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  hintBtnDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  boardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: SPACING.sm,
  },
  encouragementBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#86EFAC',
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
  trophyCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.full,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.lg,
    width: '100%',
  },
});
