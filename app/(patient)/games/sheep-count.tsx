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
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
} from 'lucide-react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Ellipse,
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
  enterCount: number;
  exitCount: number;
  walkDurationMs: number;
  pauseBetweenSheepMs: number;
  label: string;
}

const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: { level: 1, enterCount: 4, exitCount: 0, walkDurationMs: 2600, pauseBetweenSheepMs: 650, label: 'Level 1 • Going In' },
  2: { level: 2, enterCount: 5, exitCount: 1, walkDurationMs: 2400, pauseBetweenSheepMs: 600, label: 'Level 2 • 1 Sheep Leaves' },
  3: { level: 3, enterCount: 6, exitCount: 2, walkDurationMs: 2200, pauseBetweenSheepMs: 550, label: 'Level 3 • 2 Sheep Leave' },
  4: { level: 4, enterCount: 7, exitCount: 3, walkDurationMs: 2000, pauseBetweenSheepMs: 500, label: 'Level 4 • 3 Sheep Leave' },
};

type GamePhase = 'WALK_IN' | 'WALK_OUT' | 'GUESS' | 'RESULT';

/**
 * Layer 1: Sheep Barn Interior & Background
 */
const SheepBarnBackdrop: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size * 0.95} viewBox="0 0 170 160">
    <Defs>
      <LinearGradient id="barnStrawGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FEF08A" />
        <Stop offset="100%" stopColor="#F59E0B" />
      </LinearGradient>
      <LinearGradient id="barnDarkInterior" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#451A03" />
        <Stop offset="100%" stopColor="#78350F" />
      </LinearGradient>
    </Defs>
    {/* Dark Cozy Interior Space */}
    <Rect x="48" y="70" width="74" height="78" fill="url(#barnDarkInterior)" rx="4" />
    {/* Golden Straw Bedding on Floor */}
    <Path d="M 48 132 L 122 132 L 122 148 L 48 148 Z" fill="url(#barnStrawGrad)" />
    {/* Hay Stems */}
    <Path d="M 54 136 L 62 130 M 70 138 L 78 132 M 90 137 L 98 131 M 106 136 L 114 130" stroke="#B45309" strokeWidth="1.5" />
  </Svg>
);

/**
 * Layer 3: Sheep Barn Front Wall, Timber Beams & Door Frame
 * Notice the transparent arch in the center (x: 52 to 118, y: 72 to 148)
 * so sheep walking behind are visible entering/exiting naturally without disappearing.
 */
const SheepBarnFacade: React.FC<{
  size: number;
  isDoorOpen?: boolean;
}> = ({ size, isDoorOpen = true }) => (
  <Svg width={size} height={size * 0.95} viewBox="0 0 170 160">
    <Defs>
      <LinearGradient id="barnWoodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#B91C1C" />
        <Stop offset="40%" stopColor="#991B1B" />
        <Stop offset="100%" stopColor="#7F1D1D" />
      </LinearGradient>
      <LinearGradient id="barnRoofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#78350F" />
        <Stop offset="100%" stopColor="#451A03" />
      </LinearGradient>
      <LinearGradient id="hayLoftGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FEF08A" />
        <Stop offset="100%" stopColor="#F59E0B" />
      </LinearGradient>
    </Defs>

    {/* Barn Pitched Timber Roof */}
    <Path
      d="M 6 56 L 85 10 L 164 56 Z"
      fill="url(#barnRoofGrad)"
      stroke="#290E05"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    {/* Eaves Trim */}
    <Path d="M 2 58 L 85 12 L 168 58" stroke="#D97706" strokeWidth="2.5" fill="none" />

    {/* Upper Hayloft Triangular Wall */}
    <Path d="M 16 54 L 85 14 L 154 54 Z" fill="url(#barnWoodGrad)" />

    {/* Hayloft Door Window with Golden Straw Spilling Out */}
    <Rect x="72" y="24" width="26" height="24" rx="2" fill="#451A03" stroke="#F59E0B" strokeWidth="2" />
    <Path d="M 68 44 Q 85 52 102 44 Q 96 36 85 36 Q 74 36 68 44 Z" fill="url(#hayLoftGrad)" stroke="#B45309" strokeWidth="1" />

    {/* Left Barn Wall */}
    <Rect x="14" y="54" width="42" height="94" fill="url(#barnWoodGrad)" stroke="#7F1D1D" strokeWidth="2" rx="3" />
    {/* Left Barn X-Bracing */}
    <Path d="M 18 64 L 52 138 M 18 138 L 52 64" stroke="#FDE68A" strokeWidth="2.5" opacity="0.85" />

    {/* Right Barn Wall */}
    <Rect x="114" y="54" width="42" height="94" fill="url(#barnWoodGrad)" stroke="#7F1D1D" strokeWidth="2" rx="3" />
    {/* Right Barn X-Bracing */}
    <Path d="M 118 64 L 152 138 M 118 138 L 152 64" stroke="#FDE68A" strokeWidth="2.5" opacity="0.85" />

    {/* Top Header Beam Above Doorway */}
    <Rect x="50" y="54" width="70" height="22" fill="url(#barnWoodGrad)" stroke="#7F1D1D" strokeWidth="1.5" />
    <Path d="M 50 65 L 120 65" stroke="#7F1D1D" strokeWidth="2" />

    {/* Barn Doorframe Posts */}
    <Rect x="52" y="72" width="6" height="76" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
    <Rect x="112" y="72" width="6" height="76" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
    <Path d="M 52 74 Q 85 64 118 74" stroke="#78350F" strokeWidth="4" fill="none" />

    {/* Closed Barn Gates (Rendered when door is closed) */}
    {!isDoorOpen && (
      <G>
        {/* Left Gate */}
        <Rect x="56" y="74" width="29" height="74" fill="#9A3412" stroke="#451A03" strokeWidth="2" />
        <Path d="M 58 78 L 83 144 M 58 144 L 83 78" stroke="#FDE68A" strokeWidth="2" opacity="0.8" />
        {/* Right Gate */}
        <Rect x="85" y="74" width="29" height="74" fill="#9A3412" stroke="#451A03" strokeWidth="2" />
        <Path d="M 87 78 L 112 144 M 87 144 L 112 78" stroke="#FDE68A" strokeWidth="2" opacity="0.8" />
        {/* Iron Latch */}
        <Rect x="78" y="106" width="14" height="6" rx="2" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
      </G>
    )}

    {/* Barn Base Foundation */}
    <Rect x="8" y="146" width="154" height="6" rx="2" fill="#475569" stroke="#1E293B" strokeWidth="1" />
  </Svg>
);

export default function SheepCountGameScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;
  const { width: windowWidth } = useWindowDimensions();

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [phase, setPhase] = useState<GamePhase>('WALK_IN');
  const [enterCount, setEnterCount] = useState<number>(4);
  const [exitCount, setExitCount] = useState<number>(0);
  const [remainingCount, setRemainingCount] = useState<number>(4);
  const [currentSheepIndex, setCurrentSheepIndex] = useState<number>(-1);
  const [walkingDirection, setWalkingDirection] = useState<'IN' | 'OUT'>('IN');
  const [choices, setChoices] = useState<number[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  const activeConfig = LEVEL_CONFIGS[currentLevel] || LEVEL_CONFIGS[1];

  // Responsive stage sizing
  const contentWidth = Math.min(windowWidth - 32, 440);
  const stageWidth = contentWidth - 24;
  const barnSize = Math.max(140, Math.min(185, stageWidth * 0.48));
  const sheepSize = Math.max(48, Math.min(64, stageWidth * 0.17));

  // Smooth single-axis translation value
  const sheepTrackX = useRef(new Animated.Value(0)).current;

  const isMountedRef = useRef<boolean>(true);
  const startTimeRef = useRef<number>(Date.now());

  // Generate 4 distinct multiple-choice numbers
  const generateChoices = (correctRemaining: number): number[] => {
    const opts = new Set<number>();
    opts.add(correctRemaining);

    if (correctRemaining > 1) opts.add(correctRemaining - 1);
    opts.add(correctRemaining + 1);

    if (opts.size < 3) opts.add(correctRemaining + 2);
    if (opts.size < 4 && correctRemaining > 2) opts.add(correctRemaining - 2);
    if (opts.size < 4) opts.add(correctRemaining + 3);

    const arr = Array.from(opts).slice(0, 4);
    return arr.sort(() => Math.random() - 0.5);
  };

  // Full sequential walk sequence: Enter -> (optional Pause) -> Exit -> Guess
  const startFullSequence = (enters: number, exits: number, config: LevelConfig) => {
    let inIndex = 0;

    const startXLeft = -sheepSize - 12;
    const barnCenterDoorX = (stageWidth - barnSize) / 2 + barnSize * 0.5 - sheepSize * 0.5;

    // Step 1: Walk in sequence
    const walkNextEnteringSheep = () => {
      if (!isMountedRef.current) return;

      if (inIndex >= enters) {
        // Finished entering! If exits > 0, proceed to walk out sequence
        if (exits > 0) {
          setTimeout(() => {
            if (!isMountedRef.current) return;
            setPhase('WALK_OUT');
            voiceService.speak('Look! Some sheep are leaving the barn.');
            setTimeout(() => startExitSequence(exits, config), 600);
          }, 800);
        } else {
          // No exits (Level 1): proceed directly to GUESS
          setTimeout(() => {
            if (!isMountedRef.current) return;
            setPhase('GUESS');
            voiceService.speak('How many sheep went into the barn? Tap your answer!');
          }, 600);
        }
        return;
      }

      setWalkingDirection('IN');
      setCurrentSheepIndex(inIndex);
      sheepTrackX.setValue(startXLeft);

      // Smooth horizontal trot into the barn door
      Animated.timing(sheepTrackX, {
        toValue: barnCenterDoorX + 16, // Walks fully past the door frame inside
        duration: config.walkDurationMs,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        if (!isMountedRef.current) return;
        animalAudioService.playAnimalSound('sheep');
        inIndex++;
        setTimeout(walkNextEnteringSheep, config.pauseBetweenSheepMs);
      });
    };

    // Step 2: Walk out sequence (Levels 2+)
    const startExitSequence = (totalExits: number, cfg: LevelConfig) => {
      let outIndex = 0;

      const walkNextExitingSheep = () => {
        if (!isMountedRef.current) return;

        if (outIndex >= totalExits) {
          // Finished all exits! Proceed to GUESS
          setTimeout(() => {
            if (!isMountedRef.current) return;
            setPhase('GUESS');
            voiceService.speak('How many sheep are left inside the barn? Tap your answer!');
          }, 600);
          return;
        }

        setWalkingDirection('OUT');
        setCurrentSheepIndex(outIndex);
        sheepTrackX.setValue(barnCenterDoorX);

        // Smooth horizontal walk OUT of barn to the left
        Animated.timing(sheepTrackX, {
          toValue: startXLeft,
          duration: cfg.walkDurationMs,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }).start(() => {
          if (!isMountedRef.current) return;
          animalAudioService.playAnimalSound('sheep');
          outIndex++;
          setTimeout(walkNextExitingSheep, cfg.pauseBetweenSheepMs);
        });
      };

      walkNextExitingSheep();
    };

    // Start entering after 600ms
    setTimeout(walkNextEnteringSheep, 600);
  };

  const initRound = (lvl: number) => {
    const config = LEVEL_CONFIGS[lvl] || LEVEL_CONFIGS[1];
    const enters = config.enterCount;
    const exits = config.exitCount;
    const remaining = enters - exits;

    setEnterCount(enters);
    setExitCount(exits);
    setRemainingCount(remaining);
    setChoices(generateChoices(remaining));
    setSelectedChoice(null);
    setIsWrong(false);
    setGameResult(null);
    setCurrentSheepIndex(-1);
    setWalkingDirection('IN');
    setPhase('WALK_IN');
    startTimeRef.current = Date.now();

    if (exits > 0) {
      voiceService.speak(`Watch closely! ${enters} sheep enter, and ${exits} sheep will leave. Count how many stay inside.`);
    } else {
      voiceService.speak('Watch closely! Count the sheep as they walk into the barn.');
    }

    startFullSequence(enters, exits, config);
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

    if (chosenNum === remainingCount) {
      // Correct!
      setIsWrong(false);
      if (exitCount > 0) {
        voiceService.speak(`Wonderful! ${enterCount} went in and ${exitCount} left, leaving exactly ${remainingCount} inside the barn.`);
      } else {
        voiceService.speak(`That's right! Exactly ${remainingCount} sheep went into the barn. Wonderful focus!`);
      }

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
      }, 1100);
    } else {
      // Incorrect!
      setIsWrong(true);
      if (exitCount > 0) {
        voiceService.speak(`Not quite. ${enterCount} entered and ${exitCount} left, so ${remainingCount} sheep remain. Let's try again!`);
      } else {
        voiceService.speak(`Not quite! ${remainingCount} sheep went inside. Let's try again!`);
      }

      setTimeout(() => {
        if (isMountedRef.current) {
          initRound(currentLevel);
        }
      }, 3000);
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
          textToSpeak={`Count the Sheep. ${activeConfig.label}. Watch the sheep walk into the barn, note any that leave, and count how many remain inside.`}
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
              {exitCount > 0 ? `${enterCount} in - ${exitCount} out = ${remainingCount} left!` : `Not quite! ${remainingCount} sheep went in.`}
            </Typography>
          </View>
        ) : phase === 'WALK_IN' ? (
          <View style={styles.phasePill}>
            <ArrowRight size={18} color="#15803D" style={{ marginRight: 6 }} />
            <Typography size="sm" weight="bold" color="#15803D">
              ➡️ Sheep walking into the barn...
            </Typography>
          </View>
        ) : phase === 'WALK_OUT' ? (
          <View style={[styles.phasePill, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
            <ArrowLeftIcon size={18} color="#EA580C" style={{ marginRight: 6 }} />
            <Typography size="sm" weight="bold" color="#C2410C">
              ⬅️ Watch! Sheep walking back out...
            </Typography>
          </View>
        ) : (
          <View style={[styles.phasePill, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
            <HelpCircle size={18} color="#D97706" style={{ marginRight: 6 }} />
            <Typography size="sm" weight="bold" color="#B45309">
              🏠 How many sheep are left inside?
            </Typography>
          </View>
        )}
      </View>

      {/* Meadow Farm Stage Area with Depth Layering */}
      <View style={styles.stageWrapper}>
        <View style={[styles.meadowSurface, { width: contentWidth }]}>
          {/* Blue Sky Header */}
          <View style={styles.skyBackground}>
            <View style={styles.sunCircle} />
          </View>

          {/* Wooden Pasture Fence */}
          <View style={styles.fenceRow}>
            <View style={styles.fencePost} />
            <View style={styles.fencePost} />
            <View style={styles.fencePost} />
          </View>

          {/* Cobblestone Meadow Walking Stage */}
          <View style={[styles.walkTrack, { width: stageWidth }]}>
            {/* LAYER 1 (BACK): Sheep Barn Interior & Straw Bedding */}
            <View style={[styles.barnLayerAnchor, { left: (stageWidth - barnSize) / 2, zIndex: 1 }]}>
              <SheepBarnBackdrop size={barnSize} />
            </View>

            {/* LAYER 2 (MIDDLE): Animated Walking Sheep */}
            {(phase === 'WALK_IN' || phase === 'WALK_OUT') && currentSheepIndex >= 0 && (
              <Animated.View
                style={[
                  styles.walkingSheepWrapper,
                  {
                    transform: [{ translateX: sheepTrackX }],
                    zIndex: 5,
                  },
                ]}
              >
                <WalkingSheepIllustration
                  size={sheepSize}
                  facing={walkingDirection === 'IN' ? 'right' : 'left'}
                />
              </Animated.View>
            )}

            {/* LAYER 3 (FRONT): Barn Facade, Timber Walls & Doorframe */}
            <View
              pointerEvents="none"
              style={[styles.barnLayerAnchor, { left: (stageWidth - barnSize) / 2, zIndex: 10 }]}
            >
              <SheepBarnFacade
                size={barnSize}
                isDoorOpen={phase === 'WALK_IN' || phase === 'WALK_OUT' || (phase === 'RESULT' && !isWrong)}
              />
            </View>

            {/* Victory Celebration: Remaining Sheep happily peek out through doorway */}
            {phase === 'RESULT' && !isWrong && (
              <View style={[styles.celebrationSheepRow, { left: (stageWidth - barnSize) / 2 + 32, zIndex: 6 }]}>
                <WalkingSheepIllustration size={34} facing="right" />
                <WalkingSheepIllustration size={30} facing="left" />
              </View>
            )}
          </View>

          {/* Lush Green Lawn Ground Base */}
          <View style={styles.grassLawnBase} />
        </View>
      </View>

      {/* Answer Choice Section (Sharp 12px corners) */}
      <View style={[styles.choicesContainer, { width: contentWidth }]}>
        <Typography size="sm" color={COLORS.textSecondary} align="center" weight="medium" style={{ marginBottom: 10 }}>
          {phase === 'GUESS' ? 'Tap how many sheep are left inside:' : 'Watch carefully...'}
        </Typography>

        <View style={styles.choicesGrid}>
          {choices.map((num) => {
            const isSelected = selectedChoice === num;
            const isCorrect = isSelected && num === remainingCount;
            const isWrongChoice = isSelected && num !== remainingCount;

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
                    opacity: phase === 'GUESS' ? 1 : 0.6,
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
  skyBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
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
    height: 175,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  barnLayerAnchor: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  walkingSheepWrapper: {
    position: 'absolute',
    bottom: 4,
    left: 0,
  },
  celebrationSheepRow: {
    position: 'absolute',
    bottom: 8,
    flexDirection: 'row',
    gap: 6,
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
