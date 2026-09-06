import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Sun,
  Coffee,
  Pill,
  Moon,
  Footprints,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LogOut,
} from 'lucide-react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Typography } from '../../../components/common/Typography';
import { ListenButton } from '../../../components/common/ListenButton';
import { GameResultModal } from '../../../components/games/GameResultModal';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';
import { voiceService } from '../../../services/VoiceService';
import { GameResult } from '../../../types';
import { gameRepository } from '../../../repositories/GameRepository';

interface RoutineStep {
  id: string;
  order: number;
  title: string;
  timeLabel: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  cardBg: string;
  borderColor: string;
  iconColor: string;
}

const ALL_ROUTINE_STEPS: RoutineStep[] = [
  { id: 'wakeup', order: 1, title: 'Wake Up', timeLabel: 'Morning', icon: Sun, cardBg: '#FEF3C7', borderColor: '#FDE68A', iconColor: '#D97706' },
  { id: 'brush', order: 2, title: 'Brush & Wash', timeLabel: 'Morning', icon: Sparkles, cardBg: '#E0F2FE', borderColor: '#BAE6FD', iconColor: '#0284C7' },
  { id: 'breakfast', order: 3, title: 'Morning Chai', timeLabel: 'Morning', icon: Coffee, cardBg: '#FFF7ED', borderColor: '#FFEDD5', iconColor: '#EA580C' },
  { id: 'medicine', order: 4, title: 'Take Medicine', timeLabel: 'Daytime', icon: Pill, cardBg: '#DCFCE7', borderColor: '#BBF7D0', iconColor: '#16A34A' },
  { id: 'reading', order: 5, title: 'Read Newspaper', timeLabel: 'Afternoon', icon: BookOpen, cardBg: '#F3E8FF', borderColor: '#E9D5FF', iconColor: '#9333EA' },
  { id: 'walk', order: 6, title: 'Evening Walk', timeLabel: 'Evening', icon: Footprints, cardBg: '#ECFDF5', borderColor: '#A7F3D0', iconColor: '#059669' },
  { id: 'sleep', order: 7, title: 'Go to Sleep', timeLabel: 'Night', icon: Moon, cardBg: '#EEF2FF', borderColor: '#E0E7FF', iconColor: '#4F46E5' },
];

interface LevelConfig {
  level: number;
  stepCount: number;
  steps: RoutineStep[];
  label: string;
}

const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: {
    level: 1,
    stepCount: 3,
    steps: [
      ALL_ROUTINE_STEPS[0], // Wake Up
      ALL_ROUTINE_STEPS[2], // Morning Chai
      ALL_ROUTINE_STEPS[6], // Sleep
    ],
    label: 'Level 1 • 3 Activities',
  },
  2: {
    level: 2,
    stepCount: 4,
    steps: [
      ALL_ROUTINE_STEPS[0], // Wake Up
      ALL_ROUTINE_STEPS[1], // Brush & Wash
      ALL_ROUTINE_STEPS[2], // Morning Chai
      ALL_ROUTINE_STEPS[3], // Medicine
    ],
    label: 'Level 2 • 4 Activities',
  },
  3: {
    level: 3,
    stepCount: 5,
    steps: [
      ALL_ROUTINE_STEPS[0], // Wake Up
      ALL_ROUTINE_STEPS[2], // Morning Chai
      ALL_ROUTINE_STEPS[3], // Medicine
      ALL_ROUTINE_STEPS[5], // Evening Walk
      ALL_ROUTINE_STEPS[6], // Sleep
    ],
    label: 'Level 3 • 5 Activities',
  },
  4: {
    level: 4,
    stepCount: 6,
    steps: [
      ALL_ROUTINE_STEPS[0], // Wake Up
      ALL_ROUTINE_STEPS[1], // Brush
      ALL_ROUTINE_STEPS[2], // Chai
      ALL_ROUTINE_STEPS[3], // Medicine
      ALL_ROUTINE_STEPS[5], // Walk
      ALL_ROUTINE_STEPS[6], // Sleep
    ],
    label: 'Level 4 • 6 Activities',
  },
};

export default function DailySequenceGameScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;
  const { width: windowWidth } = useWindowDimensions();

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [shuffledCards, setShuffledCards] = useState<RoutineStep[]>([]);
  const [selectedSequence, setSelectedSequence] = useState<string[]>([]);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [wrongStepId, setWrongStepId] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const activeConfig = LEVEL_CONFIGS[currentLevel] || LEVEL_CONFIGS[1];

  const initRound = (lvl: number) => {
    const config = LEVEL_CONFIGS[lvl] || LEVEL_CONFIGS[1];
    const shuffled = [...config.steps].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setSelectedSequence([]);
    setIsWrong(false);
    setWrongStepId(null);
    setGameResult(null);
    startTimeRef.current = Date.now();
  };

  useEffect(() => {
    initRound(currentLevel);
  }, [currentLevel]);

  const handleStepPress = (step: RoutineStep) => {
    if (gameResult) return;
    if (selectedSequence.includes(step.id)) return;

    if (isWrong) {
      setIsWrong(false);
      setWrongStepId(null);
    }

    // Determine what order this should be
    const targetStepsInOrder = activeConfig.steps;
    const nextExpectedStep = targetStepsInOrder[selectedSequence.length];

    if (step.id === nextExpectedStep.id) {
      // Correct step tapped!
      const nextSequence = [...selectedSequence, step.id];
      setSelectedSequence(nextSequence);

      if (nextSequence.length === targetStepsInOrder.length) {
        // Complete victory!
        voiceService.speak('Wonderful! You remembered the entire daily routine.');
        const elapsedSecs = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
        const score = 600 + Math.max(0, 30 - elapsedSecs) * 20;

        const fallbackResult: GameResult = {
          id: `result-${Date.now()}`,
          sessionId: `session-${Date.now()}`,
          patientId: 'local-patient-1',
          gameId: 'PAIR',
          difficulty: currentLevel === 1 ? 'EASY' : currentLevel === 2 ? 'MEDIUM' : currentLevel === 3 ? 'HARD' : 'EXPERT',
          score,
          accuracy: 100,
          durationSeconds: elapsedSecs,
          attempts: targetStepsInOrder.length,
          mistakes: 0,
          hintsUsed: 0,
          startedAt: new Date(startTimeRef.current).toISOString(),
          completedAt: new Date().toISOString(),
          status: 'COMPLETED',
        };

        try {
          gameRepository.saveResult(fallbackResult);
        } catch (err) {
          console.warn('Game result save error:', err);
        }

        setGameResult(fallbackResult);
      } else {
        voiceService.speak(`${step.title}. Good! What comes next?`);
      }
    } else {
      // Wrong step tapped!
      setWrongStepId(step.id);
      setIsWrong(true);
      voiceService.speak(`Not quite. Think about what happens next in your day!`);

      setTimeout(() => {
        setIsWrong(false);
        setWrongStepId(null);
      }, 1600);
    }
  };

  const handleNextLevel = () => {
    setGameResult(null);
    if (currentLevel < 4) {
      setCurrentLevel((prev) => prev + 1);
    } else {
      setCurrentLevel(1);
    }
  };

  const contentWidth = Math.min(windowWidth - 32, 420);

  return (
    <ScreenContainer scrollable={true} style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          accessibilityLabel={t('go_back') || 'Go Back'}
          accessibilityRole="button"
          onPress={() => setShowLeaveModal(true)}
          style={[styles.backSquareBtn, { backgroundColor: isHc ? '#1E293B' : '#FFFFFF' }]}
        >
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#D97706'} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} align="center">
            {t('remember_my_day') || 'Remember My Day'}
          </Typography>
          <View style={styles.levelPill}>
            <Typography size="xs" weight="bold" color="#D97706">
              {activeConfig.label}
            </Typography>
          </View>
        </View>

        <ListenButton
          textToSpeak={`Remember My Day. ${activeConfig.label}. Tap the activities in order from morning to night.`}
          size="sm"
          variant="secondary"
        />
      </View>

      {/* Prompt or Error Banner */}
      <View style={styles.promptContainer}>
        {isWrong ? (
          <View style={styles.wrongBanner}>
            <AlertCircle size={22} color="#DC2626" />
            <Typography size="sm" weight="bold" color="#DC2626" style={{ marginLeft: 8 }}>
              Wrong activity order, try again!
            </Typography>
          </View>
        ) : (
          <Typography size="base" weight="bold" color="#0F172A" align="center">
            🌅 Tap activities in order (Morning $\rightarrow$ Night):
          </Typography>
        )}
      </View>

      {/* Progress pill indicator */}
      <View style={styles.pillRow}>
        <View style={styles.progressPill}>
          <Typography size="xs" weight="bold" color="#D97706">
            Completed: {selectedSequence.length} of {activeConfig.stepCount}
          </Typography>
        </View>
      </View>

      {/* Routine Cards Stack */}
      <View style={styles.cardsContainer}>
        <View style={[styles.cardsStack, { width: contentWidth }]}>
          {shuffledCards.map((step) => {
            const isCompleted = selectedSequence.includes(step.id);
            const stepNumber = selectedSequence.indexOf(step.id) + 1;
            const isThisWrong = wrongStepId === step.id;
            const IconComp = step.icon;

            return (
              <TouchableOpacity
                key={step.id}
                activeOpacity={0.85}
                disabled={isCompleted}
                onPress={() => handleStepPress(step)}
                style={[
                  styles.routineCard,
                  {
                    backgroundColor: isThisWrong
                      ? '#FEE2E2'
                      : isCompleted
                      ? '#DCFCE7'
                      : isHc
                      ? COLORS.hcCardBackground
                      : step.cardBg,
                    borderColor: isThisWrong
                      ? '#DC2626'
                      : isCompleted
                      ? '#16A34A'
                      : isHc
                      ? COLORS.hcBorder
                      : step.borderColor,
                    borderWidth: isThisWrong || isCompleted ? 3 : 2,
                    opacity: isCompleted ? 0.9 : 1,
                  },
                ]}
              >
                {/* Left Icon */}
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: isThisWrong
                        ? '#FECDD3'
                        : isCompleted
                        ? '#BBF7D0'
                        : '#FFFFFF',
                    },
                  ]}
                >
                  <IconComp size={28} color={isThisWrong ? '#DC2626' : step.iconColor} />
                </View>

                {/* Center Title & Time Label */}
                <View style={styles.cardInfo}>
                  <Typography
                    size="base"
                    weight="bold"
                    color={
                      isThisWrong
                        ? '#DC2626'
                        : isCompleted
                        ? '#15803D'
                        : isHc
                        ? COLORS.hcTextPrimary
                        : '#1E293B'
                    }
                  >
                    {step.title}
                  </Typography>
                  <Typography size="xs" color={COLORS.textMuted}>
                    {step.timeLabel}
                  </Typography>
                </View>

                {/* Right Badge (Step Number or Error) */}
                {isThisWrong ? (
                  <View style={[styles.statusBadge, { backgroundColor: '#DC2626' }]}>
                    <XCircle size={20} color="#FFFFFF" />
                  </View>
                ) : isCompleted ? (
                  <View style={[styles.statusBadge, { backgroundColor: '#16A34A' }]}>
                    <Typography size="xs" weight="bold" color="#FFFFFF">
                      {stepNumber}
                    </Typography>
                  </View>
                ) : (
                  <View style={styles.emptyBadge}>
                    <Typography size="xs" weight="bold" color={COLORS.textMuted}>
                      ?
                    </Typography>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Victory Celebration Modal */}
      {gameResult && (
        <GameResultModal
          visible={!!gameResult}
          result={gameResult}
          playAgainLabel={currentLevel === 4 ? 'PLAY AGAIN' : 'NEXT LEVEL'}
          onPlayAgain={handleNextLevel}
          onGoHome={() => router.replace('/(patient)/games')}
        />
      )}

      {/* Leave Modal */}
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
                onPress={() => setShowLeaveModal(false)}
                style={styles.continueModalBtn}
              >
                <Typography size="base" weight="bold" color="#FFFFFF">
                  {t('continue_playing') || 'CONTINUE PLAYING'}
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setShowLeaveModal(false);
                  router.back();
                }}
                style={styles.leaveModalBtn}
              >
                <Typography size="sm" weight="bold" color="#DC2626">
                  {t('leave_game') || 'LEAVE GAME'}
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  levelPill: {
    backgroundColor: '#FEF3C7',
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
  promptContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xs,
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
    borderRadius: RADIUS.full,
  },
  pillRow: {
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  progressPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  cardsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  cardsStack: {
    gap: SPACING.sm,
  },
  routineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cardInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBadge: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
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
