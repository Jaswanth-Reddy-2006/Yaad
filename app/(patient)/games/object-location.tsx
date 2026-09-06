import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LogOut,
  Sparkles,
  Eye,
  RotateCcw,
  Volume2,
  MapPin,
  HelpCircle,
  Armchair,
  BookOpen,
  Sun,
  LayoutGrid,
} from 'lucide-react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Typography } from '../../../components/common/Typography';
import { ListenButton } from '../../../components/common/ListenButton';
import { GameResultModal } from '../../../components/games/GameResultModal';
import {
  AppleIllustration,
  BananaIllustration,
  MangoIllustration,
  FlowerIllustration,
  CupIllustration,
  UmbrellaIllustration,
  BicycleIllustration,
  HouseIllustration,
  RadioIllustration,
  GlassesIllustration,
} from '../../../components/illustrations';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';
import { voiceService } from '../../../services/VoiceService';
import { GameResult } from '../../../types';
import { gameRepository } from '../../../repositories/GameRepository';

export interface LocationSlot {
  id: string;
  name: string;
  shortName: string;
  iconLabel: string;
  color: string;
  cardBg: string;
  borderColor: string;
}

export const ROOM_LOCATIONS: LocationSlot[] = [
  {
    id: 'table',
    name: 'Center Table',
    shortName: 'Table',
    iconLabel: '🪵',
    color: '#D97706',
    cardBg: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  {
    id: 'sofa',
    name: 'Cozy Sofa',
    shortName: 'Sofa',
    iconLabel: '🛋️',
    color: '#2563EB',
    cardBg: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  {
    id: 'bookshelf',
    name: 'Bookshelf',
    shortName: 'Shelf',
    iconLabel: '📚',
    color: '#7C3AED',
    cardBg: '#FAF5FF',
    borderColor: '#DDD6FE',
  },
  {
    id: 'window',
    name: 'Window Sill',
    shortName: 'Window',
    iconLabel: '🪴',
    color: '#059669',
    cardBg: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  {
    id: 'nightstand',
    name: 'Bedside Table',
    shortName: 'Bedside',
    iconLabel: '🛏️',
    color: '#EA580C',
    cardBg: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  {
    id: 'rug',
    name: 'Floor Rug',
    shortName: 'Rug',
    iconLabel: '🧺',
    color: '#DB2777',
    cardBg: '#FDF2F8',
    borderColor: '#FCE7F3',
  },
];

export interface GameObject {
  id: string;
  name: string;
  speechName: string;
  component: React.ComponentType<{ size?: number }>;
  themeColor: string;
}

export const OBJECTS_POOL: GameObject[] = [
  { id: 'glasses', name: 'Glasses', speechName: 'the Reading Glasses', component: GlassesIllustration, themeColor: '#4F46E5' },
  { id: 'apple', name: 'Apple', speechName: 'the Red Apple', component: AppleIllustration, themeColor: '#DC2626' },
  { id: 'cup', name: 'Tea Cup', speechName: 'the Tea Cup', component: CupIllustration, themeColor: '#D97706' },
  { id: 'flower', name: 'Flower', speechName: 'the Pink Flower', component: FlowerIllustration, themeColor: '#DB2777' },
  { id: 'radio', name: 'Radio', speechName: 'the Vintage Radio', component: RadioIllustration, themeColor: '#B45309' },
  { id: 'banana', name: 'Banana', speechName: 'the Yellow Banana', component: BananaIllustration, themeColor: '#CA8A04' },
  { id: 'mango', name: 'Mango', speechName: 'the Sweet Mango', component: MangoIllustration, themeColor: '#EA580C' },
  { id: 'umbrella', name: 'Umbrella', speechName: 'the Blue Umbrella', component: UmbrellaIllustration, themeColor: '#0284C7' },
];

export interface LevelConfig {
  level: number;
  objectCount: number;
  totalSlots: number;
  memorizeSeconds: number;
  label: string;
}

const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: { level: 1, objectCount: 2, totalSlots: 4, memorizeSeconds: 6, label: 'Level 1 • 2 Objects' },
  2: { level: 2, objectCount: 3, totalSlots: 5, memorizeSeconds: 8, label: 'Level 2 • 3 Objects' },
  3: { level: 3, objectCount: 4, totalSlots: 6, memorizeSeconds: 10, label: 'Level 3 • 4 Objects' },
  4: { level: 4, objectCount: 4, totalSlots: 6, memorizeSeconds: 8, label: 'Level 4 • Quick Recall' },
};

export interface ObjectPlacement {
  object: GameObject;
  location: LocationSlot;
}

type GamePhase = 'MEMORIZE' | 'RECALL' | 'COMPLETED';

export default function ObjectLocationMemoryGameScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;
  const { width: windowWidth } = useWindowDimensions();

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [phase, setPhase] = useState<GamePhase>('MEMORIZE');
  const [countdown, setCountdown] = useState<number>(6);

  const [activeSlots, setActiveSlots] = useState<LocationSlot[]>([]);
  const [placements, setPlacements] = useState<ObjectPlacement[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [wrongSlotId, setWrongSlotId] = useState<string | null>(null);
  const [solvedPlacements, setSolvedPlacements] = useState<string[]>([]); // list of object ids already solved

  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const currentLevelConfig = LEVEL_CONFIGS[currentLevel] || LEVEL_CONFIGS[1];
  const targetPlacement = placements[currentQuestionIdx] || placements[0];

  // Start breathing pulse animation during memorize phase
  useEffect(() => {
    if (phase === 'MEMORIZE') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [phase]);

  // Initialize round
  const initRound = (lvl: number) => {
    const config = LEVEL_CONFIGS[lvl] || LEVEL_CONFIGS[1];

    // Pick active locations
    const shuffledLocations = [...ROOM_LOCATIONS].slice(0, config.totalSlots);

    // Pick unique objects
    const shuffledObjects = [...OBJECTS_POOL].sort(() => Math.random() - 0.5).slice(0, config.objectCount);

    // Pair objects to distinct locations
    const roundPlacements: ObjectPlacement[] = shuffledObjects.map((obj, idx) => ({
      object: obj,
      location: shuffledLocations[idx],
    }));

    setActiveSlots(shuffledLocations);
    setPlacements(roundPlacements);
    setCurrentQuestionIdx(0);
    setSelectedSlotId(null);
    setIsWrong(false);
    setWrongSlotId(null);
    setSolvedPlacements([]);
    setMistakesCount(0);
    setCountdown(config.memorizeSeconds);
    setPhase('MEMORIZE');
    setGameResult(null);
    startTimeRef.current = Date.now();

    // Read initial placement prompt
    const speechItems = roundPlacements
      .map((p) => `${p.object.speechName} is on the ${p.location.name}`)
      .join(', and ');
    voiceService.speak(`Remember the locations: ${speechItems}.`);
  };

  useEffect(() => {
    initRound(currentLevel);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentLevel]);

  // Countdown timer in MEMORIZE phase
  useEffect(() => {
    if (phase === 'MEMORIZE') {
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
    setCurrentQuestionIdx(0);
    setSelectedSlotId(null);
    setIsWrong(false);
    setWrongSlotId(null);

    const first = placements[0];
    if (first) {
      voiceService.speak(`Where was the ${first.object.name} located?`);
    }
  };

  const handleSelectLocation = (location: LocationSlot) => {
    if (phase !== 'RECALL') return;
    if (selectedSlotId !== null && !isWrong) return;

    if (isWrong) {
      setIsWrong(false);
      setWrongSlotId(null);
    }

    setSelectedSlotId(location.id);

    const currentTarget = placements[currentQuestionIdx];
    if (!currentTarget) return;

    if (location.id === currentTarget.location.id) {
      // Correct location chosen!
      voiceService.speak(`That's right! The ${currentTarget.object.name} was on the ${location.name}!`);
      setSolvedPlacements((prev) => [...prev, currentTarget.object.id]);

      setTimeout(() => {
        if (currentQuestionIdx < placements.length - 1) {
          const nextIdx = currentQuestionIdx + 1;
          setCurrentQuestionIdx(nextIdx);
          setSelectedSlotId(null);
          setIsWrong(false);
          setWrongSlotId(null);
          const nextTarget = placements[nextIdx];
          if (nextTarget) {
            voiceService.speak(`Where was the ${nextTarget.object.name} located?`);
          }
        } else {
          // All objects solved for this round!
          finishGame();
        }
      }, 1400);
    } else {
      // Incorrect location
      setIsWrong(true);
      setWrongSlotId(location.id);
      setMistakesCount((m) => m + 1);
      voiceService.speak(`Not quite, the ${currentTarget.object.name} was not on the ${location.name}. Try another spot!`);
    }
  };

  const finishGame = () => {
    const elapsedSecs = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const totalQ = placements.length;
    const finalAccuracy = Math.round((totalQ / Math.max(totalQ, totalQ + mistakesCount)) * 100);
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
    const nextLvl = currentLevel < 4 ? currentLevel + 1 : 1;
    setCurrentLevel(nextLvl);
  };

  const handleReplay = () => {
    initRound(currentLevel);
  };

  const TargetObjectComponent = targetPlacement?.object.component;

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
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#0D9488'} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} align="center">
            {t('object_location') || 'Object–Location Memory'}
          </Typography>
          <Typography size="xs" color={COLORS.textMuted} align="center">
            {currentLevelConfig.label}
          </Typography>
        </View>

        <ListenButton
          textToSpeak={
            phase === 'MEMORIZE'
              ? placements.map((p) => `${p.object.speechName} is on the ${p.location.name}`).join(', and ')
              : `Where was the ${targetPlacement?.object.name} placed?`
          }
          size="sm"
          variant="secondary"
        />
      </View>

      {/* 2. Phase 1: Memorization View */}
      {phase === 'MEMORIZE' && (
        <View style={styles.phaseContainer}>
          {/* Top Instruction Banner with Countdown Timer */}
          <View
            style={[
              styles.instructionBanner,
              {
                backgroundColor: isHc ? COLORS.hcCardBackground : '#F0FDFA',
                borderColor: isHc ? COLORS.hcBorder : '#99F6E4',
              },
            ]}
          >
            <View style={styles.timerCircle}>
              <Typography size="xl" weight="bold" color="#0D9488">
                {countdown}
              </Typography>
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Typography size="base" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#134E4A'}>
                {t('memorize_placements') || 'Memorize Where Items Are!'}
              </Typography>
              <Typography size="xs" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
                {t('memorize_sub') || 'Look closely at each item’s location in the room.'}
              </Typography>
            </View>
          </View>

          {/* Spatial Room Layout Grid */}
          <View style={styles.roomGrid}>
            {activeSlots.map((slot) => {
              const matchedPlacement = placements.find((p) => p.location.id === slot.id);
              const ObjectComp = matchedPlacement?.object.component;

              return (
                <Animated.View
                  key={slot.id}
                  style={[
                    styles.spatialSlotCard,
                    {
                      width: '48%',
                      backgroundColor: isHc ? COLORS.hcCardBackground : slot.cardBg,
                      borderColor: matchedPlacement ? slot.color : slot.borderColor,
                      borderWidth: matchedPlacement ? 3 : 1.5,
                      transform: matchedPlacement ? [{ scale: pulseAnim }] : [{ scale: 1 }],
                    },
                  ]}
                >
                  {/* Location Header */}
                  <View style={styles.slotHeaderRow}>
                    <Typography size="base">{slot.iconLabel}</Typography>
                    <Typography size="xs" weight="bold" color={slot.color} style={{ marginLeft: 4 }}>
                      {slot.name}
                    </Typography>
                  </View>

                  {/* Object Placement Display */}
                  <View style={styles.slotContentBox}>
                    {ObjectComp ? (
                      <View style={styles.objectDisplayWrapper}>
                        <ObjectComp size={64} />
                        <Typography size="sm" weight="bold" color="#0F172A" style={{ marginTop: 4 }}>
                          {matchedPlacement.object.name}
                        </Typography>
                      </View>
                    ) : (
                      <View style={styles.emptySlotIndicator}>
                        <Typography size="xs" color="#94A3B8">
                          (Empty)
                        </Typography>
                      </View>
                    )}
                  </View>
                </Animated.View>
              );
            })}
          </View>

          {/* "I'm Ready / I Remember" Fast-Forward Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="I'm ready"
            onPress={startRecallPhase}
            style={styles.readyPrimaryBtn}
          >
            <Sparkles size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Typography size="base" weight="bold" color="#FFFFFF">
              {t('i_remember_btn') || "I'm Ready! Test Me 🎯"}
            </Typography>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. Phase 2: Spatial Recall View */}
      {phase === 'RECALL' && (
        <View style={styles.phaseContainer}>
          {/* Prompt Banner with Target Object to locate */}
          <View
            style={[
              styles.questionBanner,
              {
                backgroundColor: isHc ? COLORS.hcCardBackground : '#EEF2FF',
                borderColor: isHc ? COLORS.hcBorder : '#C7D2FE',
              },
            ]}
          >
            <View style={styles.targetObjectBadge}>
              {TargetObjectComponent && <TargetObjectComponent size={56} />}
            </View>

            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Typography size="xs" weight="bold" color="#4F46E5">
                QUESTION {currentQuestionIdx + 1} OF {placements.length}
              </Typography>
              <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#1E1B4B'} style={{ marginTop: 2 }}>
                Where was the {targetPlacement?.object.name}?
              </Typography>
            </View>
          </View>

          {/* Interactive Room Grid: User can tap on the slot directly */}
          <Typography size="xs" weight="bold" color={COLORS.textMuted} style={{ marginBottom: 6, textTransform: 'uppercase' }}>
            Tap the matching spot in the room:
          </Typography>

          <View style={styles.roomGrid}>
            {activeSlots.map((slot) => {
              const isSelected = selectedSlotId === slot.id;
              const isSlotWrong = wrongSlotId === slot.id;
              const isSlotCorrect = isSelected && targetPlacement?.location.id === slot.id;
              const isAlreadySolved = solvedPlacements.includes(
                placements.find((p) => p.location.id === slot.id)?.object.id || ''
              );

              let slotBg = isHc ? COLORS.hcCardBackground : slot.cardBg;
              let slotBorder = isHc ? COLORS.hcBorder : slot.borderColor;

              if (isSlotCorrect || isAlreadySolved) {
                slotBg = '#DCFCE7';
                slotBorder = '#16A34A';
              } else if (isSlotWrong) {
                slotBg = '#FEE2E2';
                slotBorder = '#DC2626';
              }

              // If solved, show the object
              const solvedPlacement = placements.find((p) => p.location.id === slot.id);
              const SolvedComp = isAlreadySolved || isSlotCorrect ? solvedPlacement?.object.component : null;

              return (
                <TouchableOpacity
                  key={slot.id}
                  activeOpacity={0.88}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${slot.name}`}
                  onPress={() => handleSelectLocation(slot)}
                  style={[
                    styles.spatialSlotCard,
                    {
                      width: '48%',
                      backgroundColor: slotBg,
                      borderColor: slotBorder,
                      borderWidth: isSelected || isSlotWrong || isAlreadySolved ? 3 : 1.8,
                    },
                  ]}
                >
                  <View style={styles.slotHeaderRow}>
                    <Typography size="base">{slot.iconLabel}</Typography>
                    <Typography size="xs" weight="bold" color={slot.color} style={{ marginLeft: 4 }}>
                      {slot.name}
                    </Typography>
                  </View>

                  <View style={styles.slotContentBox}>
                    {SolvedComp ? (
                      <View style={styles.objectDisplayWrapper}>
                        <SolvedComp size={54} />
                        <CheckCircle2 size={18} color="#16A34A" style={{ marginTop: 2 }} />
                      </View>
                    ) : isSlotWrong ? (
                      <XCircle size={32} color="#DC2626" />
                    ) : (
                      <View style={styles.questionMarkCircle}>
                        <MapPin size={22} color={slot.color} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Feedback message */}
          {isWrong && (
            <View style={styles.wrongBanner}>
              <AlertCircle size={20} color="#DC2626" style={{ marginRight: 6 }} />
              <Typography size="sm" weight="bold" color="#B91C1C">
                {t('try_another_spot') || 'Not here! Take another look and tap another spot.'}
              </Typography>
            </View>
          )}
        </View>
      )}

      {/* 4. Exit Confirmation Modal */}
      <Modal visible={showLeaveModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.leaveModalCard, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' }]}>
            <AlertCircle size={44} color="#D97706" style={{ marginBottom: SPACING.sm }} />
            <Typography size="lg" weight="bold" align="center" color={isHc ? COLORS.hcTextPrimary : '#0F172A'}>
              {t('leave_game_title') || 'Leave Game?'}
            </Typography>
            <Typography size="sm" color={COLORS.textSecondary} align="center" style={{ marginTop: 6, marginBottom: SPACING.lg }}>
              {t('leave_game_msg') || 'Are you sure you want to stop playing Object–Location Memory?'}
            </Typography>
            <View style={styles.leaveModalActions}>
              <TouchableOpacity
                onPress={() => setShowLeaveModal(false)}
                style={[styles.leaveCancelBtn, { borderColor: '#CBD5E1' }]}
              >
                <Typography size="sm" weight="bold" color="#475569">
                  {t('stay_here') || 'Stay & Play'}
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowLeaveModal(false);
                  router.back();
                }}
                style={styles.leaveConfirmBtn}
              >
                <LogOut size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Typography size="sm" weight="bold" color="#FFFFFF">
                  {t('leave') || 'Leave'}
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 5. Game Over / Scorecard Modal */}
      <GameResultModal
        visible={phase === 'COMPLETED'}
        result={gameResult}
        playAgainLabel="Next Level"
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
    borderRadius: RADIUS.md,
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
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    marginBottom: SPACING.md,
  },
  timerCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0D9488',
  },
  roomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  spatialSlotCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    minHeight: 125,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  slotHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  slotContentBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  objectDisplayWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlotIndicator: {
    paddingVertical: 12,
  },
  readyPrimaryBtn: {
    backgroundColor: '#0D9488',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  questionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    marginBottom: SPACING.md,
  },
  targetObjectBadge: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C7D2FE',
  },
  questionMarkCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  wrongBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  leaveModalCard: {
    width: '90%',
    maxWidth: 360,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    elevation: 5,
  },
  leaveModalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  leaveCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  leaveConfirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: RADIUS.full,
  },
});
