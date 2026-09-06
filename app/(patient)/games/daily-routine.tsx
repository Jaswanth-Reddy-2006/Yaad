import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LogOut,
  Sparkles,
  ArrowRight,
  Clock,
  RotateCcw,
  Volume2,
  Calendar,
  Check,
} from 'lucide-react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Typography } from '../../../components/common/Typography';
import { ListenButton } from '../../../components/common/ListenButton';
import { GameResultModal, LeaveGameModal } from '../../../components/games/GameResultModal';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';
import { voiceService } from '../../../services/VoiceService';
import { GameResult } from '../../../types';
import { gameRepository } from '../../../repositories/GameRepository';

export interface RoutineActivity {
  id: string;
  name: string;
  time: string;
  icon: string;
  color: string;
  cardBg: string;
  borderColor: string;
  speechText: string;
}

export const ALL_ACTIVITIES: Record<string, RoutineActivity> = {
  breakfast: {
    id: 'breakfast',
    name: 'Eat Breakfast',
    time: '8:00 AM',
    icon: '🥣',
    color: '#EA580C',
    cardBg: '#FFF7ED',
    borderColor: '#FED7AA',
    speechText: 'Eat Breakfast at 8:00 AM',
  },
  medicine: {
    id: 'medicine',
    name: 'Take Medicine',
    time: '8:30 AM',
    icon: '💊',
    color: '#2563EB',
    cardBg: '#EFF6FF',
    borderColor: '#BFDBFE',
    speechText: 'Take Morning Medicine at 8:30 AM',
  },
  walk: {
    id: 'walk',
    name: 'Morning Walk',
    time: '9:00 AM',
    icon: '🚶',
    color: '#16A34A',
    cardBg: '#F0FDF4',
    borderColor: '#BBF7D0',
    speechText: 'Go for a Morning Walk at 9:00 AM',
  },
  water: {
    id: 'water',
    name: 'Drink Water',
    time: '11:00 AM',
    icon: '💧',
    color: '#0284C7',
    cardBg: '#F0F9FF',
    borderColor: '#BAE6FD',
    speechText: 'Drink a glass of Water at 11:00 AM',
  },
  lunch: {
    id: 'lunch',
    name: 'Eat Lunch',
    time: '1:00 PM',
    icon: '🥗',
    color: '#D97706',
    cardBg: '#FFFBEB',
    borderColor: '#FDE68A',
    speechText: 'Eat a healthy Lunch at 1:00 PM',
  },
  nap: {
    id: 'nap',
    name: 'Afternoon Rest',
    time: '2:30 PM',
    icon: '😴',
    color: '#7C3AED',
    cardBg: '#FAF5FF',
    borderColor: '#DDD6FE',
    speechText: 'Afternoon Rest and Nap at 2:30 PM',
  },
  chai: {
    id: 'chai',
    name: 'Evening Chai',
    time: '4:30 PM',
    icon: '🫖',
    color: '#B45309',
    cardBg: '#FEF3C7',
    borderColor: '#FDE68A',
    speechText: 'Drink warm Evening Chai at 4:30 PM',
  },
  call: {
    id: 'call',
    name: 'Call Family',
    time: '5:30 PM',
    icon: '📞',
    color: '#059669',
    cardBg: '#ECFDF5',
    borderColor: '#A7F3D0',
    speechText: 'Call your family and children at 5:30 PM',
  },
  evening_medicine: {
    id: 'evening_medicine',
    name: 'Evening Medicine',
    time: '7:30 PM',
    icon: '💊',
    color: '#DC2626',
    cardBg: '#FEF2F2',
    borderColor: '#FECDD3',
    speechText: 'Take Evening Medicine at 7:30 PM',
  },
  reading: {
    id: 'reading',
    name: 'Read Book / Paper',
    time: '8:30 PM',
    icon: '📖',
    color: '#4F46E5',
    cardBg: '#EEF2FF',
    borderColor: '#C7D2FE',
    speechText: 'Read your book or newspaper at 8:30 PM',
  },
};

export interface RoutineLevel {
  level: number;
  title: string;
  subtitle: string;
  activities: RoutineActivity[];
  memorizeSeconds: number;
}

export const ROUTINE_LEVELS: RoutineLevel[] = [
  {
    level: 1,
    title: 'Morning Routine',
    subtitle: 'Breakfast, Medicine, and Garden Walk',
    activities: [ALL_ACTIVITIES.breakfast, ALL_ACTIVITIES.medicine, ALL_ACTIVITIES.walk],
    memorizeSeconds: 8,
  },
  {
    level: 2,
    title: 'Afternoon Routine',
    subtitle: 'Lunch, Hydration, and Rest',
    activities: [ALL_ACTIVITIES.lunch, ALL_ACTIVITIES.water, ALL_ACTIVITIES.nap],
    memorizeSeconds: 8,
  },
  {
    level: 3,
    title: 'Evening Routine',
    subtitle: 'Chai, Calling Family, Medicine, and Reading',
    activities: [
      ALL_ACTIVITIES.chai,
      ALL_ACTIVITIES.call,
      ALL_ACTIVITIES.evening_medicine,
      ALL_ACTIVITIES.reading,
    ],
    memorizeSeconds: 10,
  },
  {
    level: 4,
    title: 'Daily Well-Being Routine',
    subtitle: 'Morning Walk, Breakfast, Hydration, and Family Time',
    activities: [
      ALL_ACTIVITIES.walk,
      ALL_ACTIVITIES.breakfast,
      ALL_ACTIVITIES.water,
      ALL_ACTIVITIES.call,
    ],
    memorizeSeconds: 10,
  },
];

type GamePhase = 'PRESENTATION' | 'RECALL' | 'COMPLETED';

const STEP_LABELS = ['1st', '2nd', '3rd', '4th'];

export default function DailyRoutineRecallGameScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;
  const { width: windowWidth } = useWindowDimensions();

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [phase, setPhase] = useState<GamePhase>('PRESENTATION');
  const [countdown, setCountdown] = useState<number>(8);

  const [shuffledChoices, setShuffledChoices] = useState<RoutineActivity[]>([]);
  const [placedActivities, setPlacedActivities] = useState<RoutineActivity[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [wrongActivityId, setWrongActivityId] = useState<string | null>(null);

  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentLevelConfig = ROUTINE_LEVELS[currentLevel - 1] || ROUTINE_LEVELS[0];
  const targetStepActivity = currentLevelConfig.activities[currentStepIndex];

  // Init round
  const initRound = (lvl: number) => {
    const config = ROUTINE_LEVELS[lvl - 1] || ROUTINE_LEVELS[0];
    const shuffled = [...config.activities].sort(() => Math.random() - 0.5);

    setShuffledChoices(shuffled);
    setPlacedActivities([]);
    setCurrentStepIndex(0);
    setSelectedActivityId(null);
    setIsWrong(false);
    setWrongActivityId(null);
    setMistakesCount(0);
    setCountdown(config.memorizeSeconds);
    setPhase('PRESENTATION');
    setGameResult(null);
    startTimeRef.current = Date.now();

    // Voice reading sequence
    const speech = config.activities
      .map((a, idx) => `Step ${idx + 1}: ${a.name}`)
      .join('. Then, ');
    voiceService.speak(`Remember the routine sequence: ${speech}.`);
  };

  useEffect(() => {
    initRound(currentLevel);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentLevel]);

  // Countdown timer in PRESENTATION phase
  useEffect(() => {
    if (phase === 'PRESENTATION') {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            startRecallPhase();
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

  const startRecallPhase = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('RECALL');
    setCurrentStepIndex(0);
    setPlacedActivities([]);
    setSelectedActivityId(null);
    setIsWrong(false);
    setWrongActivityId(null);

    voiceService.speak(`What is the 1st activity in the routine?`);
  };

  const handleSelectActivity = (activity: RoutineActivity) => {
    if (phase !== 'RECALL') return;
    if (placedActivities.some((p) => p.id === activity.id)) return; // already placed
    if (selectedActivityId !== null && !isWrong) return;

    if (isWrong) {
      setIsWrong(false);
      setWrongActivityId(null);
    }

    setSelectedActivityId(activity.id);

    const currentExpected = currentLevelConfig.activities[currentStepIndex];

    if (activity.id === currentExpected.id) {
      // Correct activity chosen!
      const nextPlaced = [...placedActivities, activity];
      setPlacedActivities(nextPlaced);

      const stepOrdinal = STEP_LABELS[currentStepIndex] || `Step ${currentStepIndex + 1}`;
      voiceService.speak(`Correct! The ${stepOrdinal} activity is ${activity.name}!`);

      setTimeout(() => {
        if (currentStepIndex < currentLevelConfig.activities.length - 1) {
          const nextIdx = currentStepIndex + 1;
          setCurrentStepIndex(nextIdx);
          setSelectedActivityId(null);
          setIsWrong(false);
          setWrongActivityId(null);
          const nextOrdinal = STEP_LABELS[nextIdx] || `Step ${nextIdx + 1}`;
          voiceService.speak(`What comes ${nextOrdinal}?`);
        } else {
          // Finished routine!
          finishGame();
        }
      }, 1400);
    } else {
      // Incorrect activity
      setIsWrong(true);
      setWrongActivityId(activity.id);
      setMistakesCount((m) => m + 1);
      voiceService.speak(`Not quite, ${activity.name} was not the ${STEP_LABELS[currentStepIndex]} activity. Try again!`);
    }
  };

  const finishGame = () => {
    const elapsedSecs = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const totalSteps = currentLevelConfig.activities.length;
    const finalAccuracy = Math.round((totalSteps / Math.max(totalSteps, totalSteps + mistakesCount)) * 100);
    const score = Math.max(300, 1000 - mistakesCount * 100);

    const result: GameResult = {
      id: `result-${Date.now()}`,
      sessionId: `session-${Date.now()}`,
      patientId: 'local-patient-1',
      gameId: 'PAIR',
      difficulty: currentLevel === 1 ? 'EASY' : currentLevel === 2 ? 'MEDIUM' : currentLevel === 3 ? 'HARD' : 'EXPERT',
      score,
      accuracy: finalAccuracy,
      durationSeconds: elapsedSecs,
      attempts: 1,
      mistakes: mistakesCount,
      hintsUsed: 0,
      startedAt: new Date(startTimeRef.current).toISOString(),
      completedAt: new Date().toISOString(),
      status: 'COMPLETED',
    };

    setPhase('COMPLETED');
    setGameResult(result);

    try {
      gameRepository.saveResult(result);
    } catch {
      // Fail safely
    }
  };

  const handleNextLevel = () => {
    const nextLvl = currentLevel < ROUTINE_LEVELS.length ? currentLevel + 1 : 1;
    setCurrentLevel(nextLvl);
  };

  return (
    <ScreenContainer scrollable={true} style={styles.container}>
      {/* 1. Header Bar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          accessibilityLabel={t('go_back') || 'Go Back'}
          accessibilityRole="button"
          onPress={() => setShowLeaveModal(true)}
          style={[styles.backBtn, { backgroundColor: isHc ? '#1E293B' : '#FFFFFF' }]}
        >
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#D97706'} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} align="center">
            {t('daily_routine_recall') || 'Daily Routine Recall'}
          </Typography>
          <Typography size="xs" color={COLORS.textMuted} align="center">
            {currentLevelConfig.title}
          </Typography>
        </View>

        <ListenButton
          textToSpeak={
            phase === 'PRESENTATION'
              ? currentLevelConfig.activities.map((a, idx) => `Step ${idx + 1}: ${a.name}`).join('. Then, ')
              : `What is the ${STEP_LABELS[currentStepIndex]} activity in the routine?`
          }
          size="sm"
          variant="secondary"
        />
      </View>

      {/* 2. Phase 1: Presentation & Study Mode */}
      {phase === 'PRESENTATION' && (
        <View style={styles.phaseContainer}>
          {/* Top Countdown Banner */}
          <View
            style={[
              styles.instructionBanner,
              {
                backgroundColor: isHc ? COLORS.hcCardBackground : '#FEF3C7',
                borderColor: isHc ? COLORS.hcBorder : '#FDE68A',
              },
            ]}
          >
            <View style={styles.timerCircle}>
              <Typography size="xl" weight="bold" color="#D97706">
                {countdown}
              </Typography>
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Typography size="base" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#92400E'}>
                {t('memorize_routine_order') || 'Memorize the Routine Order!'}
              </Typography>
              <Typography size="xs" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
                {t('memorize_routine_sub') || 'Notice what happens 1st, 2nd, and 3rd in the day.'}
              </Typography>
            </View>
          </View>

          {/* Sequential Routine Flow Card */}
          <View style={styles.routineTimelineList}>
            {currentLevelConfig.activities.map((activity, idx) => (
              <React.Fragment key={activity.id}>
                <View
                  style={[
                    styles.timelineStepCard,
                    {
                      backgroundColor: isHc ? COLORS.hcCardBackground : activity.cardBg,
                      borderColor: isHc ? COLORS.hcBorder : activity.borderColor,
                      borderWidth: 2,
                    },
                  ]}
                >
                  {/* Step Badge */}
                  <View style={[styles.stepNumberBadge, { backgroundColor: activity.color }]}>
                    <Typography size="sm" weight="bold" color="#FFFFFF">
                      {STEP_LABELS[idx]}
                    </Typography>
                  </View>

                  {/* Icon */}
                  <Typography size="xxl" style={{ marginHorizontal: SPACING.sm }}>
                    {activity.icon}
                  </Typography>

                  {/* Activity Details */}
                  <View style={{ flex: 1 }}>
                    <Typography size="base" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#1E293B'}>
                      {t(activity.id) || activity.name}
                    </Typography>
                    <View style={styles.timeTag}>
                      <Clock size={12} color="#64748B" style={{ marginRight: 4 }} />
                      <Typography size="xs" color="#64748B">
                        {activity.time}
                      </Typography>
                    </View>
                  </View>
                </View>

                {/* Arrow Connector between steps */}
                {idx < currentLevelConfig.activities.length - 1 && (
                  <View style={styles.arrowConnectorRow}>
                    <ArrowRight size={20} color="#D97706" strokeWidth={2.5} />
                  </View>
                )}
              </React.Fragment>
            ))}
          </View>

          {/* "I Remember!" Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="I'm ready"
            onPress={startRecallPhase}
            style={styles.readyPrimaryBtn}
          >
            <Sparkles size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Typography size="base" weight="bold" color="#FFFFFF">
              {t('i_remember_routine_btn') || "I'm Ready! Order Routine 🎯"}
            </Typography>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. Phase 2: Ordering & Recall Phase */}
      {phase === 'RECALL' && (
        <View style={styles.phaseContainer}>
          {/* Question Banner */}
          <View
            style={[
              styles.questionBanner,
              {
                backgroundColor: isHc ? COLORS.hcCardBackground : '#FEF3C7',
                borderColor: isHc ? COLORS.hcBorder : '#FDE68A',
              },
            ]}
          >
            <View style={styles.targetStepCircle}>
              <Typography size="base" weight="bold" color="#D97706">
                {STEP_LABELS[currentStepIndex]}
              </Typography>
            </View>

            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Typography size="xs" weight="bold" color="#B45309">
                STEP {currentStepIndex + 1} OF {currentLevelConfig.activities.length}
              </Typography>
              <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#78350F'} style={{ marginTop: 2 }}>
                What happens {STEP_LABELS[currentStepIndex]} in the routine?
              </Typography>
            </View>
          </View>

          {/* Timeline Slots (Shows Placed Activities) */}
          <View style={styles.placedSlotsRow}>
            {currentLevelConfig.activities.map((_, idx) => {
              const placed = placedActivities[idx];
              const isCurrent = idx === currentStepIndex;

              return (
                <View
                  key={idx}
                  style={[
                    styles.timelineSlot,
                    {
                      backgroundColor: placed ? '#DCFCE7' : isCurrent ? '#FEF3C7' : '#F1F5F9',
                      borderColor: placed ? '#16A34A' : isCurrent ? '#D97706' : '#CBD5E1',
                      borderWidth: isCurrent ? 2.5 : 1.5,
                    },
                  ]}
                >
                  <Typography size="xs" weight="bold" color={placed ? '#15803D' : '#64748B'}>
                    {STEP_LABELS[idx]}
                  </Typography>
                  {placed ? (
                    <>
                      <Typography size="lg" style={{ marginTop: 2 }}>{placed.icon}</Typography>
                      <Typography size="xs" weight="bold" numberOfLines={1} color="#15803D" style={{ marginTop: 2 }}>
                        {t(placed.id) || placed.name}
                      </Typography>
                    </>
                  ) : (
                    <Typography size="xs" color="#94A3B8" style={{ marginTop: 8 }}>
                      (Empty)
                    </Typography>
                  )}
                </View>
              );
            })}
          </View>

          {/* Activity Choices to Select */}
          <Typography size="xs" weight="bold" color={COLORS.textMuted} style={{ marginVertical: SPACING.sm, textTransform: 'uppercase' }}>
            Tap the activity that happens {STEP_LABELS[currentStepIndex]}:
          </Typography>

          <View style={styles.choicesList}>
            {shuffledChoices.map((activity) => {
              const isAlreadyPlaced = placedActivities.some((p) => p.id === activity.id);
              const isSelected = selectedActivityId === activity.id;
              const isChoiceWrong = wrongActivityId === activity.id;

              let cardBg = isHc ? COLORS.hcCardBackground : '#FFFFFF';
              let borderColor = isHc ? COLORS.hcBorder : '#E2E8F0';
              let textColor = isHc ? COLORS.hcTextPrimary : '#1E293B';

              if (isAlreadyPlaced) {
                cardBg = '#F1F5F9';
                borderColor = '#CBD5E1';
                textColor = '#94A3B8';
              } else if (isChoiceWrong) {
                cardBg = '#FEE2E2';
                borderColor = '#DC2626';
                textColor = '#7F1D1D';
              }

              return (
                <TouchableOpacity
                  key={activity.id}
                  activeOpacity={0.88}
                  disabled={isAlreadyPlaced}
                  accessibilityRole="button"
                  accessibilityLabel={activity.name}
                  onPress={() => handleSelectActivity(activity)}
                  style={[
                    styles.activityChoiceCard,
                    {
                      backgroundColor: cardBg,
                      borderColor: borderColor,
                      borderWidth: isSelected || isChoiceWrong ? 3 : 2,
                      opacity: isAlreadyPlaced ? 0.5 : 1,
                    },
                  ]}
                >
                  <Typography size="xxl" style={{ marginRight: SPACING.sm }}>
                    {activity.icon}
                  </Typography>

                  <View style={{ flex: 1 }}>
                    <Typography size="base" weight="bold" color={textColor}>
                      {t(activity.id) || activity.name}
                    </Typography>
                    <Typography size="xs" color={COLORS.textSecondary}>
                      {activity.time}
                    </Typography>
                  </View>

                  {isAlreadyPlaced && <CheckCircle2 size={24} color="#16A34A" />}
                  {isChoiceWrong && <XCircle size={24} color="#DC2626" />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Feedback banner on mistake */}
          {isWrong && (
            <View style={styles.wrongFeedbackRow}>
              <AlertCircle size={20} color="#DC2626" style={{ marginRight: 6 }} />
              <Typography size="sm" weight="bold" color="#B91C1C">
                {t('try_again_routine') || 'Take another look and choose the correct step!'}
              </Typography>
            </View>
          )}
        </View>
      )}

      {/* 4. Leave Confirmation Modal */}
      <LeaveGameModal
        visible={showLeaveModal}
        gameTitle="Daily Routine Recall"
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={() => {
          setShowLeaveModal(false);
          router.back();
        }}
      />

      {/* 5. Game Result Modal */}
      <GameResultModal
        visible={phase === 'COMPLETED'}
        result={gameResult}
        playAgainLabel="Next Routine"
        onPlayAgain={handleNextLevel}
        onGoHome={() => router.back()}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  phaseContainer: {
    width: '100%',
  },
  instructionBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1.5,
    marginBottom: SPACING.md,
  },
  timerCircle: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D97706',
  },
  routineTimelineList: {
    width: '100%',
    gap: 4,
    marginBottom: SPACING.lg,
  },
  timelineStepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepNumberBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  arrowConnectorRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  readyPrimaryBtn: {
    backgroundColor: '#D97706',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 3,
  },
  questionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: SPACING.md,
  },
  targetStepCircle: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D97706',
  },
  placedSlotsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    width: '100%',
    marginBottom: SPACING.sm,
  },
  timelineSlot: {
    flex: 1,
    minHeight: 84,
    borderRadius: 8,
    padding: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choicesList: {
    width: '100%',
    gap: SPACING.sm,
  },
  activityChoiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    elevation: 2,
  },
  wrongFeedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: SPACING.sm,
    borderRadius: 6,
    marginTop: SPACING.md,
  },
});
