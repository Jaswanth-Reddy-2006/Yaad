import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
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
  Eye,
  HelpCircle,
} from 'lucide-react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Typography } from '../../../components/common/Typography';
import { ListenButton } from '../../../components/common/ListenButton';
import { GameResultModal } from '../../../components/games/GameResultModal';
import { WalkingSheepIllustration } from '../../../components/illustrations/AnimalIllustrations';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';
import { voiceService } from '../../../services/VoiceService';
import { animalAudioService } from '../../../services/AnimalAudioService';
import { GameResult } from '../../../types';
import { gameRepository } from '../../../repositories/GameRepository';

interface LevelConfig {
  level: number;
  minSheep: number;
  maxSheep: number;
  walkDurationMs: number;
  pauseBetweenSheepMs: number;
  label: string;
}

const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: { level: 1, minSheep: 3, maxSheep: 4, walkDurationMs: 2400, pauseBetweenSheepMs: 600, label: 'Level 1 • 3–4 Sheep' },
  2: { level: 2, minSheep: 4, maxSheep: 5, walkDurationMs: 2100, pauseBetweenSheepMs: 500, label: 'Level 2 • 4–5 Sheep' },
  3: { level: 3, minSheep: 5, maxSheep: 7, walkDurationMs: 1800, pauseBetweenSheepMs: 450, label: 'Level 3 • 5–7 Sheep' },
  4: { level: 4, minSheep: 7, maxSheep: 9, walkDurationMs: 1600, pauseBetweenSheepMs: 400, label: 'Level 4 • 7–9 Sheep' },
};

type GamePhase = 'WALK' | 'GUESS' | 'RESULT';

/**
 * Cozy Farmhouse in the Meadow Center SVG Illustration
 */
const MeadowFarmhouse: React.FC<{
  size?: number;
  isDoorOpen?: boolean;
  insideCount?: number;
}> = ({ size = 180, isDoorOpen = true }) => {
  return (
    <Svg width={size} height={size * 0.92} viewBox="0 0 160 148">
      <Defs>
        <LinearGradient id="houseRoofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#EF4444" />
          <Stop offset="100%" stopColor="#B91C1C" />
        </LinearGradient>
        <LinearGradient id="houseBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFBEB" />
          <Stop offset="100%" stopColor="#FEF3C7" />
        </LinearGradient>
      </Defs>

      {/* Chimney */}
      <Rect x="108" y="8" width="16" height="26" fill="#991B1B" rx="2" />
      {/* Chimney Top Rim */}
      <Rect x="105" y="6" width="22" height="6" fill="#7F1D1D" rx="2" />
      {/* Gentle Smoke Puffs */}
      <Circle cx="116" cy="0" r="5" fill="#FFFFFF" opacity="0.75" />
      <Circle cx="122" cy="-8" r="7" fill="#FFFFFF" opacity="0.5" />

      {/* House Main Walls */}
      <Rect
        x="20"
        y="46"
        width="120"
        height="84"
        fill="url(#houseBodyGrad)"
        stroke="#B45309"
        strokeWidth="3"
        rx="6"
      />

      {/* Triangular Gabled Roof */}
      <Path
        d="M 10 50 L 80 8 L 150 50 Z"
        fill="url(#houseRoofGrad)"
        stroke="#7F1D1D"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Attic Round Window */}
      <Circle cx="80" cy="32" r="10" fill="#DBEAFE" stroke="#7F1D1D" strokeWidth="2.5" />
      <Path d="M 80 22 L 80 42 M 70 32 L 90 32" stroke="#7F1D1D" strokeWidth="1.8" />

      {/* Left Wall Window */}
      <Rect x="30" y="62" width="22" height="26" rx="3" fill="#DBEAFE" stroke="#B45309" strokeWidth="2" />
      <Path d="M 41 62 L 41 88 M 30 75 L 52 75" stroke="#B45309" strokeWidth="1.5" />

      {/* Right Wall Window */}
      <Rect x="108" y="62" width="22" height="26" rx="3" fill="#DBEAFE" stroke="#B45309" strokeWidth="2" />
      <Path d="M 119 62 L 119 88 M 108 75 L 130 75" stroke="#B45309" strokeWidth="1.5" />

      {/* Arch Doorway */}
      <Path
        d="M 64 130 L 64 80 Q 80 64 96 80 L 96 130 Z"
        fill="#78350F"
        stroke="#451A03"
        strokeWidth="2.5"
      />

      {/* Warm Golden Interior Light when Open */}
      {isDoorOpen ? (
        <Path
          d="M 67 130 L 67 82 Q 80 68 93 82 L 93 130 Z"
          fill="#FDE047"
          opacity="0.95"
        />
      ) : (
        /* Closed Wooden Door */
        <G>
          <Path
            d="M 67 130 L 67 82 Q 80 68 93 82 L 93 130 Z"
            fill="#92400E"
          />
          {/* Door Planks */}
          <Path d="M 80 76 L 80 130" stroke="#78350F" strokeWidth="1.5" />
          {/* Brass Doorknob */}
          <Circle cx="73" cy="106" r="3" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
        </G>
      )}

      {/* Doorstep Welcome Mat */}
      <Rect x="60" y="128" width="40" height="6" rx="2" fill="#D97706" stroke="#92400E" strokeWidth="1" />
    </Svg>
  );
};

export default function SheepCountGameScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;
  const { width: windowWidth } = useWindowDimensions();

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [phase, setPhase] = useState<GamePhase>('WALK');
  const [totalSheep, setTotalSheep] = useState<number>(3);
  const [currentSheepIndex, setCurrentSheepIndex] = useState<number>(-1);
  const [choices, setChoices] = useState<number[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  const activeConfig = LEVEL_CONFIGS[currentLevel] || LEVEL_CONFIGS[1];

  // Responsive stage calculations
  const contentWidth = Math.min(windowWidth - 32, 440);
  const stageWidth = contentWidth - 24;
  const houseSize = Math.max(140, Math.min(180, stageWidth * 0.46));
  const sheepSize = Math.max(48, Math.min(68, stageWidth * 0.18));

  // Animation values
  const sheepTrackX = useRef(new Animated.Value(0)).current;
  const sheepBobY = useRef(new Animated.Value(0)).current;
  const sheepOpacity = useRef(new Animated.Value(1)).current;

  const isMountedRef = useRef<boolean>(true);
  const startTimeRef = useRef<number>(Date.now());

  // Generate distinct multiple-choice option numbers
  const generateChoices = (correctCount: number): number[] => {
    const opts = new Set<number>();
    opts.add(correctCount);

    // Add adjacent choices
    if (correctCount > 1) opts.add(correctCount - 1);
    opts.add(correctCount + 1);

    if (opts.size < 3) opts.add(correctCount + 2);
    if (opts.size < 4 && correctCount > 2) opts.add(correctCount - 2);

    const arr = Array.from(opts).slice(0, 4);
    return arr.sort(() => Math.random() - 0.5);
  };

  // Run the sequence of sheep walking into the house
  const startSheepSequence = (count: number, config: LevelConfig) => {
    let index = 0;

    const walkNextSheep = () => {
      if (!isMountedRef.current) return;

      if (index >= count) {
        // All sheep entered! Move to GUESS phase
        setTimeout(() => {
          if (!isMountedRef.current) return;
          setPhase('GUESS');
          voiceService.speak('How many sheep went into the house? Tap your answer!');
        }, 500);
        return;
      }

      setCurrentSheepIndex(index);

      // Sheep starts from left edge (-sheepSize) and walks to doorway center
      const startX = -sheepSize - 10;
      const targetDoorX = (stageWidth - houseSize) / 2 + houseSize * 0.5 - sheepSize * 0.6;

      sheepTrackX.setValue(startX);
      sheepBobY.setValue(0);
      sheepOpacity.setValue(1);

      // Bobbing walking step animation
      const bobLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(sheepBobY, {
            toValue: -6,
            duration: config.walkDurationMs / 8,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(sheepBobY, {
            toValue: 0,
            duration: config.walkDurationMs / 8,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      bobLoop.start();

      // Horizontal walk animation
      Animated.parallel([
        Animated.timing(sheepTrackX, {
          toValue: targetDoorX,
          duration: config.walkDurationMs,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        // Fade inside doorway at the end of walk
        Animated.sequence([
          Animated.delay(config.walkDurationMs * 0.82),
          Animated.timing(sheepOpacity, {
            toValue: 0,
            duration: config.walkDurationMs * 0.18,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        bobLoop.stop();
        if (!isMountedRef.current) return;

        // Play authentic sheep sound effect as sheep enters
        animalAudioService.playAnimalSound('sheep');

        index++;
        setTimeout(walkNextSheep, config.pauseBetweenSheepMs);
      });
    };

    // Begin first sheep after 800ms
    setTimeout(walkNextSheep, 800);
  };

  const initRound = (lvl: number) => {
    const config = LEVEL_CONFIGS[lvl] || LEVEL_CONFIGS[1];
    const targetCount =
      Math.floor(Math.random() * (config.maxSheep - config.minSheep + 1)) + config.minSheep;

    setTotalSheep(targetCount);
    setChoices(generateChoices(targetCount));
    setSelectedChoice(null);
    setIsWrong(false);
    setGameResult(null);
    setCurrentSheepIndex(-1);
    setPhase('WALK');
    startTimeRef.current = Date.now();

    voiceService.speak('Watch closely! Count each sheep as it walks into the house.');
    startSheepSequence(targetCount, config);
  };

  useEffect(() => {
    isMountedRef.current = true;
    initRound(currentLevel);
    return () => {
      isMountedRef.current = false;
      animalAudioService.stop();
    };
  }, [currentLevel]);

  const handleChoicePress = (chosenNum: number) => {
    if (phase !== 'GUESS' || selectedChoice !== null) return;

    setSelectedChoice(chosenNum);
    setPhase('RESULT');

    if (chosenNum === totalSheep) {
      // Correct!
      setIsWrong(false);
      voiceService.speak(`That's right! Exactly ${totalSheep} sheep went into the house. Great counting!`);

      const elapsedSecs = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      const score = 600 + Math.max(0, 30 - elapsedSecs) * 20;

      const fallbackResult: GameResult = {
        id: `result-${Date.now()}`,
        sessionId: `session-${Date.now()}`,
        patientId: 'local-patient-1',
        gameId: 'PAIR',
        difficulty:
          currentLevel === 1 ? 'EASY' : currentLevel === 2 ? 'MEDIUM' : currentLevel === 3 ? 'HARD' : 'EXPERT',
        score,
        accuracy: 100,
        durationSeconds: elapsedSecs,
        attempts: 1,
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

      setTimeout(() => {
        if (isMountedRef.current) {
          setGameResult(fallbackResult);
        }
      }, 1000);
    } else {
      // Incorrect!
      setIsWrong(true);
      voiceService.speak(`Not quite! ${totalSheep} sheep went inside. Let's try again!`);

      setTimeout(() => {
        if (isMountedRef.current) {
          initRound(currentLevel);
        }
      }, 2500);
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

  return (
    <ScreenContainer scrollable={true} style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          accessibilityLabel={t('go_back') || 'Go Back'}
          accessibilityRole="button"
          onPress={() => setShowLeaveModal(true)}
          style={[styles.backSquareBtn, { backgroundColor: isHc ? '#1E293B' : '#FFFFFF' }]}
        >
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#15803D'} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} align="center">
            {t('count_the_sheep') || 'Count the Sheep'}
          </Typography>
          <View style={styles.levelPill}>
            <Typography size="xs" weight="bold" color="#15803D">
              {activeConfig.label}
            </Typography>
          </View>
        </View>

        <ListenButton
          textToSpeak={`Count the Sheep. ${activeConfig.label}. Watch the sheep walk into the house and count how many went inside.`}
          size="sm"
          variant="secondary"
        />
      </View>

      {/* Dynamic Status / Prompt Banner */}
      <View style={styles.promptContainer}>
        {isWrong ? (
          <View style={styles.wrongBanner}>
            <AlertCircle size={22} color="#DC2626" />
            <Typography size="sm" weight="bold" color="#DC2626" style={{ marginLeft: 8 }}>
              Not quite! {totalSheep} sheep went in.
            </Typography>
          </View>
        ) : phase === 'WALK' ? (
          <View style={styles.phasePill}>
            <Eye size={18} color="#15803D" style={{ marginRight: 6 }} />
            <Typography size="sm" weight="bold" color="#15803D">
              👀 Count the sheep as they walk in!
            </Typography>
          </View>
        ) : (
          <View style={[styles.phasePill, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
            <HelpCircle size={18} color="#D97706" style={{ marginRight: 6 }} />
            <Typography size="sm" weight="bold" color="#B45309">
              🏠 How many sheep went inside?
            </Typography>
          </View>
        )}
      </View>

      {/* Scenic Meadow Stage Area */}
      <View style={styles.stageWrapper}>
        <View style={[styles.meadowSurface, { width: contentWidth }]}>
          {/* Distant Hills & Sunny Sky */}
          <View style={styles.skyHeaderBackground}>
            {/* Sun */}
            <View style={styles.sunCircle} />
          </View>

          {/* Wooden Pasture Fence */}
          <View style={styles.fenceRow}>
            <View style={styles.fencePost} />
            <View style={styles.fencePost} />
            <View style={styles.fencePost} />
          </View>

          {/* Cobblestone Walking Track */}
          <View style={[styles.walkTrack, { width: stageWidth }]}>
            {/* Center Farmhouse */}
            <View style={[styles.houseAnchor, { left: (stageWidth - houseSize) / 2 }]}>
              <MeadowFarmhouse
                size={houseSize}
                isDoorOpen={phase === 'WALK' || (phase === 'RESULT' && !isWrong)}
                insideCount={totalSheep}
              />
            </View>

            {/* Walking Animated Sheep (Visible during WALK phase) */}
            {phase === 'WALK' && currentSheepIndex >= 0 && (
              <Animated.View
                style={[
                  styles.walkingSheepWrapper,
                  {
                    transform: [
                      { translateX: sheepTrackX },
                      { translateY: sheepBobY },
                    ],
                    opacity: sheepOpacity,
                  },
                ]}
              >
                <WalkingSheepIllustration size={sheepSize} facing="right" />
              </Animated.View>
            )}

            {/* Victory Celebration: Sheeps peek out happily */}
            {phase === 'RESULT' && !isWrong && (
              <View style={[styles.celebrationSheepRow, { left: (stageWidth - houseSize) / 2 + 18 }]}>
                <WalkingSheepIllustration size={36} facing="right" />
                <WalkingSheepIllustration size={32} facing="left" />
              </View>
            )}
          </View>

          {/* Lush Green Lawn Surface Base */}
          <View style={styles.grassLawnBase} />
        </View>
      </View>

      {/* Multiple-Choice Answer Section (Sharp 12px corners) */}
      <View style={[styles.choicesContainer, { width: contentWidth }]}>
        <Typography size="sm" color={COLORS.textSecondary} align="center" weight="medium" style={{ marginBottom: 10 }}>
          {phase === 'WALK' ? 'Watch carefully...' : 'Tap the correct count:'}
        </Typography>

        <View style={styles.choicesGrid}>
          {choices.map((num) => {
            const isSelected = selectedChoice === num;
            const isCorrect = isSelected && num === totalSheep;
            const isWrongChoice = isSelected && num !== totalSheep;

            return (
              <TouchableOpacity
                key={`choice-${num}`}
                activeOpacity={0.85}
                disabled={phase !== 'GUESS'}
                onPress={() => handleChoicePress(num)}
                style={[
                  styles.choiceNumberBtn,
                  {
                    backgroundColor: isCorrect
                      ? '#DCFCE7'
                      : isWrongChoice
                      ? '#FEE2E2'
                      : isSelected
                      ? '#F1F5F9'
                      : '#FFFFFF',
                    borderColor: isCorrect
                      ? '#16A34A'
                      : isWrongChoice
                      ? '#DC2626'
                      : '#CBD5E1',
                    opacity: phase === 'WALK' ? 0.6 : 1,
                  },
                ]}
              >
                <Typography
                  size="xl"
                  weight="bold"
                  color={
                    isCorrect
                      ? '#16A34A'
                      : isWrongChoice
                      ? '#DC2626'
                      : '#0F172A'
                  }
                >
                  {num}
                </Typography>
                {isCorrect && (
                  <View style={styles.choiceCheckBadge}>
                    <CheckCircle2 size={18} color="#16A34A" />
                  </View>
                )}
                {isWrongChoice && (
                  <View style={styles.choiceCheckBadge}>
                    <XCircle size={18} color="#DC2626" />
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

      {/* Leave Confirmation Modal */}
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
  promptContainer: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
    minHeight: 44,
    justifyContent: 'center',
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
  },
  phasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  stageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
  meadowSurface: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingTop: 16,
    paddingBottom: SPACING.sm,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#BAE6FD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  skyHeaderBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#E0F2FE',
  },
  sunCircle: {
    position: 'absolute',
    top: 10,
    left: 16,
    width: 28,
    height: 28,
    borderRadius: RADIUS.full,
    backgroundColor: '#FDE047',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  fenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 18,
    marginBottom: 4,
  },
  fencePost: {
    width: 6,
    height: 18,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
  },
  walkTrack: {
    height: 170,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  houseAnchor: {
    position: 'absolute',
    bottom: 0,
    zIndex: 5,
    alignItems: 'center',
  },
  walkingSheepWrapper: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    zIndex: 10,
  },
  celebrationSheepRow: {
    position: 'absolute',
    bottom: 8,
    flexDirection: 'row',
    gap: 8,
    zIndex: 12,
  },
  grassLawnBase: {
    width: '100%',
    height: 12,
    backgroundColor: '#22C55E',
    borderRadius: 6,
    marginTop: 2,
  },
  choicesContainer: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  choicesGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  choiceNumberBtn: {
    flex: 1,
    height: 64,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  choiceCheckBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
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
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 14,
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
    borderRadius: 12,
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
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
