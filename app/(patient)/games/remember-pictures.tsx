import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, LogOut, AlertCircle, XCircle, RotateCcw } from 'lucide-react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Typography } from '../../../components/common/Typography';
import { Button } from '../../../components/common/Button';
import { ListenButton } from '../../../components/common/ListenButton';
import { GamePicture, getSymbolConfig } from '../../../components/games/GamePicture';
import { GameResultModal, LeaveGameModal } from '../../../components/games/GameResultModal';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';
import { GameDifficulty, GameResult } from '../../../types';
import { gameRepository } from '../../../repositories/GameRepository';
import { voiceService } from '../../../services/VoiceService';

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
  const initialDifficulty: GameDifficulty = (params.difficulty as GameDifficulty) || 'EASY';

  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;
  const { width: screenWidth } = useWindowDimensions();

  const [difficulty, setDifficulty] = useState<GameDifficulty>(initialDifficulty);

  // Difficulty parameters: 1 target (4 choices), 2 targets (6 choices), 3 targets (8 choices), 4 targets (10 choices)
  const targetCount = difficulty === 'EASY' ? 1 : difficulty === 'MEDIUM' ? 2 : difficulty === 'HARD' ? 3 : 4;
  const totalChoiceCount = difficulty === 'EASY' ? 4 : difficulty === 'MEDIUM' ? 6 : difficulty === 'HARD' ? 8 : 10;

  const [phase, setPhase] = useState<'LOOK' | 'TEST' | 'COMPLETED'>('LOOK');
  const [countdown, setCountdown] = useState(5);
  const [targetItems, setTargetItems] = useState<PictureItem[]>([]);
  const [choiceItems, setChoiceItems] = useState<PictureItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [isWrong, setIsWrong] = useState(false);
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
    setWrongIds([]);
    setIsWrong(false);
    setCountdown(5);
    setPhase('LOOK');
    setGameResult(null);
    startTimeRef.current = Date.now();
  };

  const handleLookAgain = () => {
    setIsWrong(false);
    setWrongIds([]);
    setSelectedIds([]);
    setCountdown(3);
    setPhase('LOOK');
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
    if (isWrong) {
      setIsWrong(false);
      setWrongIds([]);
      setSelectedIds([id]);
      return;
    }
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else if (selectedIds.length < targetCount) {
      const next = [...selectedIds, id];
      setSelectedIds(next);
    }
  };

  const handleSubmit = () => {
    const elapsedSecs = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const targetIdList = choiceItems.filter((p) => p.isTarget).map((p) => p.id);
    const correctCount = selectedIds.filter((id) => targetIdList.includes(id)).length;
    const isAllCorrect = correctCount === targetCount && selectedIds.length === targetCount;

    if (!isAllCorrect) {
      const wrongSelected = selectedIds.filter((id) => !targetIdList.includes(id));
      setWrongIds(wrongSelected);
      setIsWrong(true);

      // Voice audio feedback
      voiceService.speak('Wrong picture, try again!');

      // Automatically reset selection after short delay so the user can try again
      setTimeout(() => {
        setIsWrong(false);
        setWrongIds([]);
        setSelectedIds([]);
      }, 1800);
      return;
    }

    const accuracy = 100;
    const calculatedScore = targetCount * 350 + Math.max(0, 30 - elapsedSecs) * 10;
    
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
      mistakes: 0,
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
      mistakes: 0,
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

  const handleSelectLevel = (newDifficulty: GameDifficulty) => {
    if (newDifficulty === difficulty) return;
    setDifficulty(newDifficulty);
  };

  const handleNextLevel = () => {
    if (difficulty === 'EASY') setDifficulty('MEDIUM');
    else if (difficulty === 'MEDIUM') setDifficulty('HARD');
    else if (difficulty === 'HARD') setDifficulty('EXPERT');
    else initRound();
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
  const targetPicSize = targetCount === 1 ? 120 : targetCount === 2 ? 88 : targetCount === 3 ? 72 : 62;
  const choiceCols = totalChoiceCount <= 4 ? 2 : totalChoiceCount <= 6 ? 3 : 4;
  const choiceTileWidth = choiceCols === 2 ? '46%' : choiceCols === 3 ? '30.5%' : '22.5%';
  const choicePicSize =
    choiceCols === 2
      ? Math.min(84, Math.floor(screenWidth * 0.19))
      : choiceCols === 3
      ? Math.min(62, Math.floor(screenWidth * 0.14))
      : Math.min(48, Math.floor(screenWidth * 0.11));

  const currentSpeech =
    phase === 'LOOK'
      ? targetCount === 1
        ? 'Look carefully at the picture and remember it. You have 5 seconds.'
        : `Look carefully at the ${targetCount} pictures and remember them. You have 5 seconds.`
      : targetCount === 1
      ? 'Which picture did you see earlier? Tap on the picture to select it.'
      : `Which ${targetCount} pictures did you see earlier? Tap the pictures to select them.`;

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
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#15803D'} strokeWidth={2.5} />
        </TouchableOpacity>

        <ListenButton
          textToSpeak={currentSpeech}
          label="LISTEN"
          size="sm"
          variant="secondary"
        />
      </View>

      {/* Game Title & Level Badge */}
      <View style={styles.titleSection}>
        <Typography size="xxl" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} align="center">
          {t('remember_the_pictures') || 'Remember the Pictures'}
        </Typography>
        <View style={styles.difficultyBadge}>
          <Typography size="xs" weight="bold" color="#15803D">
            {levelLabel} • {targetCount} {targetCount === 1 ? 'Picture' : 'Pictures'} to Remember
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
          {isWrong ? (
            <View style={styles.wrongBanner}>
              <AlertCircle size={22} color="#DC2626" />
              <Typography size="sm" weight="bold" color="#DC2626" style={{ marginLeft: 8 }}>
                Wrong picture, try again!
              </Typography>
            </View>
          ) : (
            <Typography size="base" weight="bold" color="#0F172A" align="center" style={{ marginBottom: SPACING.xs }}>
              {targetCount === 1
                ? '🤔 Which picture did you see earlier?'
                : `🤔 Tap the ${targetCount} pictures you saw earlier:`}
            </Typography>
          )}

          {/* Selection counter pill */}
          <View style={styles.selectionPill}>
            <Typography size="xs" weight="bold" color={isWrong ? '#DC2626' : '#15803D'}>
              Selected: {selectedIds.length} / {targetCount}
            </Typography>
          </View>

          {/* Choice Grid */}
          <View style={styles.choiceGrid}>
            {choiceItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isItemWrong = wrongIds.includes(item.id);
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
                      backgroundColor: isItemWrong
                        ? '#FEE2E2'
                        : isSelected
                        ? '#DCFCE7'
                        : isHc
                        ? COLORS.hcCardBackground
                        : cfg.cardBg,
                      borderColor: isItemWrong
                        ? '#DC2626'
                        : isSelected
                        ? '#16A34A'
                        : isHc
                        ? COLORS.hcBorder
                        : cfg.borderColor,
                      borderWidth: isItemWrong || isSelected ? 3.5 : 2,
                    },
                  ]}
                >
                  <GamePicture symbolId={item.symbolId} size={choicePicSize} showLabel={false} />

                  {/* Corner Icon Badge when Selected or Wrong */}
                  {isItemWrong ? (
                    <View style={[styles.selectedCheckBadge, { backgroundColor: '#DC2626' }]}>
                      <XCircle size={20} color="#FFFFFF" />
                    </View>
                  ) : isSelected ? (
                    <View style={styles.selectedCheckBadge}>
                      <CheckCircle2 size={20} color="#FFFFFF" />
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Submit Button */}
          <View style={styles.submitButtonWrapper}>
            <Button
              title={t('submit') || 'SUBMIT'}
              variant="primary"
              disabled={selectedIds.length !== targetCount || isWrong}
              onPress={handleSubmit}
              style={styles.submitBtn}
            />
          </View>
        </View>
      )}

      {/* Abandon Confirmation Modal */}
      <LeaveGameModal
        visible={showLeaveModal}
        gameTitle="Remember the Pictures"
        onCancel={cancelLeave}
        onConfirm={confirmLeave}
      />

      {/* Victory Celebration Modal */}
      <GameResultModal
        visible={phase === 'COMPLETED'}
        result={gameResult}
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
  titleSection: {
    alignItems: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  difficultyBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  backSquareBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    borderRadius: 14,
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
    width: 68,
    height: 68,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: COLORS.warning,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
  },
  recallSection: {
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  wrongBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderColor: '#FECDD3',
    borderWidth: 1.5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: SPACING.xs,
  },
  selectionPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 8,
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
    borderRadius: 14,
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
    borderRadius: 8,
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
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
