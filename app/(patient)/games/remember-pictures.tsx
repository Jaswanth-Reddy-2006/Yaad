import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, LogOut } from 'lucide-react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Typography } from '../../../components/common/Typography';
import { Button } from '../../../components/common/Button';
import { ListenButton } from '../../../components/common/ListenButton';
import { GamePicture, getSymbolConfig } from '../../../components/games/GamePicture';
import { GameResultModal } from '../../../components/games/GameResultModal';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';
import { GameDifficulty, GameResult } from '../../../types';
import { gameRepository } from '../../../repositories/GameRepository';

const SYMBOL_POOL = [
  'apple',
  'banana',
  'mango',
  'flower',
  'cup',
  'umbrella',
  'bicycle',
  'house',
  'radio',
  'glasses',
];

interface PictureItem {
  id: string;
  symbolId: string;
  isTarget: boolean;
}

export default function RememberPicturesGameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ difficulty?: string }>();
  const difficulty: GameDifficulty = (params.difficulty as GameDifficulty) || 'EASY';

  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;
  const { width: screenWidth } = useWindowDimensions();

  // Difficulty parameters: 1 target for EASY (4 choices), 2 for MEDIUM (6 choices), 3 for HARD (9 choices)
  const targetCount = difficulty === 'EASY' ? 1 : difficulty === 'MEDIUM' ? 2 : 3;
  const totalChoiceCount = difficulty === 'EASY' ? 4 : difficulty === 'MEDIUM' ? 6 : 9;

  const [phase, setPhase] = useState<'LOOK' | 'TEST' | 'COMPLETED'>('LOOK');
  const [countdown, setCountdown] = useState(5);
  const [targetItems, setTargetItems] = useState<PictureItem[]>([]);
  const [choiceItems, setChoiceItems] = useState<PictureItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize and start game round
  const initRound = () => {
    // 1. Pick random unique symbols from the pool
    const shuffledSymbols = [...SYMBOL_POOL].sort(() => 0.5 - Math.random());
    const selectedTargets = shuffledSymbols.slice(0, targetCount).map((sym, idx) => ({
      id: `target-${idx}-${sym}`,
      symbolId: sym,
      isTarget: true,
    }));

    // 2. Pick distractors
    const distractorSymbols = shuffledSymbols.slice(targetCount, totalChoiceCount);
    const selectedDistractors = distractorSymbols.map((sym, idx) => ({
      id: `distractor-${idx}-${sym}`,
      symbolId: sym,
      isTarget: false,
    }));

    // 3. Shuffle choices together
    const allChoices = [...selectedTargets, ...selectedDistractors].sort(() => 0.5 - Math.random());

    setTargetItems(selectedTargets);
    setChoiceItems(allChoices);
    setSelectedIds([]);
    setCountdown(5);
    setPhase('LOOK');
    setGameResult(null);
    startTimeRef.current = Date.now();
  };

  useEffect(() => {
    initRound();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [difficulty]);

  // 5-second countdown in LOOK phase
  useEffect(() => {
    if (phase === 'LOOK') {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setPhase('TEST');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const handleSelect = (id: string) => {
    if (phase !== 'TEST') return;
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else if (selectedIds.length < targetCount) {
      const next = [...selectedIds, id];
      setSelectedIds(next);
      // If user selected all needed pictures, enable submission
    }
  };

  const handleSubmit = () => {
    const elapsedSecs = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const targetIdList = choiceItems.filter((p) => p.isTarget).map((p) => p.id);
    const correctCount = selectedIds.filter((id) => targetIdList.includes(id)).length;
    const accuracy = Math.round((correctCount / targetCount) * 100);
    const mistakes = selectedIds.length - correctCount;
    const calculatedScore = correctCount * 350 + Math.max(0, 30 - elapsedSecs) * 10;
    
    const fallbackResult: GameResult = {
      id: `result-${Date.now()}`,
      sessionId: `session-${Date.now()}`,
      patientId: 'patient-local',
      gameId: 'PAIR' as any,
      difficulty,
      score: calculatedScore,
      accuracy,
      durationSeconds: elapsedSecs,
      attempts: selectedIds.length,
      mistakes: Math.max(0, mistakes),
      hintsUsed: 0,
      startedAt: new Date(startTimeRef.current).toISOString(),
      completedAt: new Date().toISOString(),
      status: 'COMPLETED',
    };

    setGameResult(fallbackResult);
    setPhase('COMPLETED');

    // Persist to local database
    gameRepository.saveResult({
      sessionId: fallbackResult.sessionId,
      gameId: 'PAIR' as any,
      difficulty,
      score: calculatedScore,
      accuracy,
      durationSeconds: elapsedSecs,
      attempts: selectedIds.length,
      mistakes: Math.max(0, mistakes),
      hintsUsed: 0,
      startedAt: fallbackResult.startedAt,
      completedAt: fallbackResult.completedAt,
      status: 'COMPLETED',
    }).then((saved) => {
      setGameResult(saved);
    }).catch(() => {
      // Keep fallback result
    });
  };

  const handleBackPress = () => {
    if (phase === 'LOOK' || phase === 'TEST') {
      setShowLeaveModal(true);
    } else {
      router.back();
    }
  };

  const confirmLeave = () => {
    setShowLeaveModal(false);
    router.back();
  };

  const cancelLeave = () => {
    setShowLeaveModal(false);
  };

  // Dynamic responsive tile sizing
  const targetPicSize = targetCount === 1 ? 120 : targetCount === 2 ? 88 : 72;
  const choiceCols = totalChoiceCount <= 4 ? 2 : 3;
  const choiceTileWidth = choiceCols === 2 ? '46%' : '30.5%';
  const choicePicSize = choiceCols === 2 ? Math.min(84, Math.floor(screenWidth * 0.19)) : Math.min(62, Math.floor(screenWidth * 0.14));

  const currentSpeech =
    phase === 'LOOK'
      ? targetCount === 1
        ? 'Look carefully at the picture and remember it. You have 5 seconds.'
        : `Look carefully at the ${targetCount} pictures and remember them. You have 5 seconds.`
      : targetCount === 1
      ? 'Which picture did you see earlier? Tap on the picture to select it.'
      : `Which ${targetCount} pictures did you see earlier? Tap the pictures to select them.`;

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
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#15803D'} strokeWidth={2.5} />
        </TouchableOpacity>

        <ListenButton
          textToSpeak={currentSpeech}
          label="LISTEN"
          size="sm"
          variant="secondary"
        />
      </View>

      {/* Game Title & Difficulty Pill */}
      <View style={styles.titleSection}>
        <Typography size="xxl" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} align="center">
          {t('remember_the_pictures') || 'Remember the Pictures'}
        </Typography>
        <View style={styles.difficultyBadge}>
          <Typography size="xs" weight="bold" color="#15803D">
            {difficulty} • {targetCount} {targetCount === 1 ? 'Picture' : 'Pictures'} to Remember
          </Typography>
        </View>
      </View>

      {/* ============================================================ */}
      {/* PHASE 1: "LOOK" / MEMORIZATION PHASE (Only show target items) */}
      {/* ============================================================ */}
      {phase === 'LOOK' && (
        <View style={styles.memorizeSection}>
          <Typography size="base" weight="bold" color="#15803D" align="center" style={{ marginBottom: SPACING.md }}>
            {targetCount === 1
              ? '👀 Look carefully and remember this picture!'
              : `👀 Look carefully and remember these ${targetCount} pictures!`}
          </Typography>

          {/* Clean Target Cards Display */}
          <View style={styles.targetsRow}>
            {targetItems.map((item) => {
              const cfg = getSymbolConfig(item.symbolId);
              return (
                <View
                  key={item.id}
                  style={[
                    styles.targetCard,
                    {
                      backgroundColor: isHc ? COLORS.hcCardBackground : cfg.cardBg,
                      borderColor: isHc ? COLORS.hcBorder : cfg.borderColor,
                      width: targetCount === 1 ? 160 : targetCount === 2 ? 130 : 100,
                    },
                  ]}
                >
                  <GamePicture symbolId={item.symbolId} size={targetPicSize} showLabel={false} />
                </View>
              );
            })}
          </View>

          {/* 5-Second Countdown Timer Ring */}
          <View style={styles.countdownContainer}>
            <View style={styles.countdownRing}>
              <Typography size="giant" weight="bold" color={COLORS.warning}>
                {countdown}
              </Typography>
            </View>
            <Typography size="sm" weight="bold" color={COLORS.textMuted} style={{ marginTop: SPACING.xs }}>
              {t('get_ready') || 'Memorize now...'}
            </Typography>
          </View>
        </View>
      )}

      {/* ============================================================ */}
      {/* PHASE 2: "TEST" / RECALL PHASE (Choices Grid with Distractors) */}
      {/* ============================================================ */}
      {phase === 'TEST' && (
        <View style={styles.recallSection}>
          <Typography size="base" weight="bold" color="#0F172A" align="center" style={{ marginBottom: SPACING.xs }}>
            {targetCount === 1
              ? '🤔 Which picture did you see earlier?'
              : `🤔 Tap the ${targetCount} pictures you saw earlier:`}
          </Typography>

          {/* Selection counter pill */}
          <View style={styles.selectionPill}>
            <Typography size="xs" weight="bold" color="#15803D">
              Selected: {selectedIds.length} / {targetCount}
            </Typography>
          </View>

          {/* Choice Grid */}
          <View style={styles.choiceGrid}>
            {choiceItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const cfg = getSymbolConfig(item.symbolId);

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() => handleSelect(item.id)}
                  style={[
                    styles.choiceTile,
                    {
                      width: choiceTileWidth as any,
                      backgroundColor: isSelected ? '#DCFCE7' : isHc ? COLORS.hcCardBackground : cfg.cardBg,
                      borderColor: isSelected ? '#16A34A' : isHc ? COLORS.hcBorder : cfg.borderColor,
                      borderWidth: isSelected ? 3.5 : 2,
                    },
                  ]}
                >
                  <GamePicture symbolId={item.symbolId} size={choicePicSize} showLabel={false} />

                  {/* Corner Checkmark Badge when Selected */}
                  {isSelected && (
                    <View style={styles.selectedCheckBadge}>
                      <CheckCircle2 size={20} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Submit Button */}
          <View style={styles.submitButtonWrapper}>
            <Button
              title={t('submit') || 'SUBMIT'}
              variant="primary"
              disabled={selectedIds.length !== targetCount}
              onPress={handleSubmit}
              style={styles.submitBtn}
            />
          </View>
        </View>
      )}

      {/* Abandon Confirmation Modal */}
      <Modal visible={showLeaveModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <LogOut size={32} color="#DC2626" />
            </View>
            <Typography size="lg" weight="bold" align="center" style={{ marginTop: SPACING.sm }}>
              {t('leave_game_title') || 'Leave this game?'}
            </Typography>
            <Typography size="sm" color={COLORS.textMuted} align="center" style={{ marginTop: 6, lineHeight: 20 }}>
              {t('leave_game_desc') || 'Your current game progress will not be saved.'}
            </Typography>

            <View style={styles.modalButtonsStack}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={cancelLeave}
                style={styles.continueModalBtn}
              >
                <Typography size="base" weight="bold" color="#FFFFFF">
                  {t('continue_game') || 'Continue Game'}
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={confirmLeave}
                style={styles.leaveModalBtn}
              >
                <Typography size="sm" weight="bold" color="#DC2626">
                  {t('leave') || 'Leave Game'}
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Victory Celebration Modal */}
      <GameResultModal
        visible={phase === 'COMPLETED'}
        result={gameResult}
        onPlayAgain={initRound}
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
  titleSection: {
    alignItems: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  difficultyBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginTop: 4,
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
  memorizeSection: {
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  targetsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginVertical: SPACING.sm,
  },
  targetCard: {
    aspectRatio: 0.95,
    borderRadius: RADIUS.xl,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  countdownContainer: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  countdownRing: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    borderWidth: 4,
    borderColor: COLORS.warning,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
  },
  recallSection: {
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  selectionPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    gap: 8,
    marginVertical: SPACING.xs,
  },
  choiceTile: {
    aspectRatio: 0.92,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  selectedCheckBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#16A34A',
    borderRadius: RADIUS.full,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  submitButtonWrapper: {
    width: '100%',
    marginTop: SPACING.md,
  },
  submitBtn: {
    backgroundColor: '#16A34A',
    width: '100%',
    paddingVertical: 14,
    borderRadius: RADIUS.full,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonsStack: {
    width: '100%',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  continueModalBtn: {
    width: '100%',
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  leaveModalBtn: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
