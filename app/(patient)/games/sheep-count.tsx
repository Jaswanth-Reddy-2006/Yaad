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
  1: { level: 1, enterCount: 4, exitCount: 0, walkDurationMs: 2500, pauseBetweenSheepMs: 650, label: 'Level 1 • Going In' },
  2: { level: 2, enterCount: 5, exitCount: 1, walkDurationMs: 2300, pauseBetweenSheepMs: 600, label: 'Level 2 • 1 Sheep Leaves' },
  3: { level: 3, enterCount: 6, exitCount: 2, walkDurationMs: 2100, pauseBetweenSheepMs: 550, label: 'Level 3 • 2 Sheep Leave' },
  4: { level: 4, enterCount: 7, exitCount: 3, walkDurationMs: 1900, pauseBetweenSheepMs: 500, label: 'Level 4 • 3 Sheep Leave' },
};

type GamePhase = 'WALK_IN' | 'WALK_OUT' | 'GUESS' | 'RESULT';

/**
 * Open Meadow Pasture Scenery (No card box - expansive natural farm environment)
 */
const OpenPastureBackdrop: React.FC<{ width: number; height: number; barnCenterDoorX: number }> = ({
  width,
  height,
  barnCenterDoorX,
}) => (
  <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={StyleSheet.absoluteFill}>
    <Defs>
      {/* Sunny Sky Gradient */}
      <LinearGradient id="meadowSky" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#BAE6FD" />
        <Stop offset="45%" stopColor="#E0F2FE" />
        <Stop offset="70%" stopColor="#DCFCE7" />
        <Stop offset="100%" stopColor="#86EFAC" />
      </LinearGradient>
      {/* Rolling Hills Gradients */}
      <LinearGradient id="hillBack" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#86EFAC" />
        <Stop offset="100%" stopColor="#22C55E" />
      </LinearGradient>
      <LinearGradient id="hillFront" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#4ADE80" />
        <Stop offset="100%" stopColor="#15803D" />
      </LinearGradient>
      {/* Cobblestone Path Gradient */}
      <LinearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#E2E8F0" />
        <Stop offset="50%" stopColor="#CBD5E1" />
        <Stop offset="100%" stopColor="#E2E8F0" />
      </LinearGradient>
    </Defs>

    {/* Expansive Sky */}
    <Rect width={width} height={height} fill="url(#meadowSky)" />

    {/* Warm Morning Sun with Aura */}
    <Circle cx={44} cy={34} r={26} fill="#FEF08A" opacity={0.5} />
    <Circle cx={44} cy={34} r={18} fill="#FDE047" />

    {/* Soft Fluffy Cloud 1 */}
    <G fill="#FFFFFF" opacity={0.75} transform="translate(90, 20)">
      <Circle cx={12} cy={12} r={10} />
      <Circle cx={24} cy={8} r={14} />
      <Circle cx={38} cy={12} r={11} />
      <Rect x={12} y={10} width={26} height={12} rx={6} />
    </G>

    {/* Soft Fluffy Cloud 2 */}
    <G fill="#FFFFFF" opacity={0.65} transform={`translate(${width - 90}, 16)`}>
      <Circle cx={10} cy={10} r={8} />
      <Circle cx={20} cy={6} r={11} />
      <Circle cx={32} cy={10} r={9} />
    </G>

    {/* Distant Rolling Hills */}
    <Path
      d={`M -20 95 Q ${width * 0.25} 70 ${width * 0.55} 90 Q ${width * 0.8} 75 ${width + 20} 95 L ${width + 20} ${height} L -20 ${height} Z`}
      fill="url(#hillBack)"
      opacity={0.65}
    />

    {/* Distant Trees on Hilltop */}
    <G fill="#15803D" opacity={0.6}>
      <Circle cx={width * 0.18} cy={76} r={14} />
      <Circle cx={width * 0.23} cy={72} r={18} />
      <Circle cx={width * 0.28} cy={78} r={13} />
      <Circle cx={width * 0.82} cy={80} r={15} />
      <Circle cx={width * 0.88} cy={75} r={17} />
    </G>

    {/* Main Lush Meadow Lawn */}
    <Path
      d={`M -20 120 Q ${width * 0.3} 105 ${width * 0.6} 115 Q ${width * 0.85} 110 ${width + 20} 122 L ${width + 20} ${height} L -20 ${height} Z`}
      fill="url(#hillFront)"
    />

    {/* Left Pasture Wooden Fence */}
    <G stroke="#78350F" strokeWidth={2.2} fill="none">
      {/* Horizontal Rails */}
      <Path d={`M -10 112 L ${width * 0.42} 118 M -10 124 L ${width * 0.42} 130`} />
      {/* Vertical Posts */}
      <Path d="M 15 106 L 15 134 M 55 108 L 55 136 M 95 110 L 95 138 M 135 112 L 135 140" />
    </G>

    {/* Cobblestone Walking Path directly leading into the Barn Door */}
    <Path
      d={`M -20 ${height - 10} Q ${width * 0.25} ${height - 20} ${barnCenterDoorX} ${height - 22} L ${barnCenterDoorX + 38} ${height - 22} Q ${width * 0.28} ${height} -20 ${height + 15} Z`}
      fill="url(#pathGrad)"
      stroke="#94A3B8"
      strokeWidth={1.5}
    />

    {/* Stepping Stones on Path */}
    <Ellipse cx={30} cy={height - 14} rx={9} ry={3.5} fill="#94A3B8" opacity={0.6} />
    <Ellipse cx={70} cy={height - 18} rx={11} ry={4} fill="#94A3B8" opacity={0.6} />
    <Ellipse cx={115} cy={height - 20} rx={10} ry={3.5} fill="#94A3B8" opacity={0.6} />

    {/* Colorful Meadow Flowers in Grass */}
    <Circle cx={22} cy={height - 35} r={3.5} fill="#F43F5E" />
    <Circle cx={22} cy={height - 35} r={1.5} fill="#FEF08A" />
    <Circle cx={42} cy={height - 28} r={3} fill="#FACC15" />
    <Circle cx={width - 45} cy={height - 25} r={3.5} fill="#EC4899" />
    <Circle cx={width - 25} cy={height - 38} r={3.5} fill="#38BDF8" />
  </Svg>
);

/**
 * Layer 1 (Back): Barn Cozy Interior & Straw Bedding
 */
const SheepBarnBackdrop: React.FC<{ size: number }> = ({ size }) => (
  <Svg width={size} height={size * 0.95} viewBox="0 0 170 160">
    <Defs>
      <LinearGradient id="barnStrawGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FEF08A" />
        <Stop offset="100%" stopColor="#F59E0B" />
      </LinearGradient>
      <LinearGradient id="barnDarkInterior" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#2A1005" />
        <Stop offset="100%" stopColor="#5C1D07" />
      </LinearGradient>
      <LinearGradient id="doorShadow" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#1E0B03" />
        <Stop offset="100%" stopColor="#451A03" />
      </LinearGradient>
    </Defs>
    {/* Dark Cozy Interior Space */}
    <Rect x="48" y="68" width="74" height="82" fill="url(#barnDarkInterior)" rx="3" />
    <Path d="M 50 72 Q 85 62 120 72 L 120 148 L 50 148 Z" fill="url(#doorShadow)" />
    {/* Golden Straw Bedding on Floor */}
    <Path d="M 48 130 L 122 130 L 122 150 L 48 150 Z" fill="url(#barnStrawGrad)" />
    {/* Hay Stems */}
    <Path d="M 54 138 L 64 130 M 72 140 L 80 133 M 92 139 L 102 132 M 108 138 L 118 131" stroke="#B45309" strokeWidth="1.8" />
  </Svg>
);

/**
 * Layer 3 (Front): Barn Facade, Timber Walls & Open Door Arch
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

    {/* Hayloft Window with Golden Straw Spilling Out */}
    <Rect x="72" y="24" width="26" height="24" rx="2" fill="#451A03" stroke="#F59E0B" strokeWidth="2" />
    <Path d="M 68 44 Q 85 52 102 44 Q 96 36 85 36 Q 74 36 68 44 Z" fill="url(#hayLoftGrad)" stroke="#B45309" strokeWidth="1" />

    {/* Left Barn Wall (x: 14 to 52) */}
    <Rect x="14" y="54" width="38" height="94" fill="url(#barnWoodGrad)" stroke="#7F1D1D" strokeWidth="2" rx="2" />
    <Path d="M 18 64 L 48 138 M 18 138 L 48 64" stroke="#FDE68A" strokeWidth="2.5" opacity="0.85" />
    {/* Left Wall Foundation */}
    <Rect x="10" y="146" width="44" height="6" rx="2" fill="#475569" stroke="#1E293B" strokeWidth="1" />

    {/* Right Barn Wall (x: 118 to 156) */}
    <Rect x="118" y="54" width="38" height="94" fill="url(#barnWoodGrad)" stroke="#7F1D1D" strokeWidth="2" rx="2" />
    <Path d="M 122 64 L 152 138 M 122 138 L 152 64" stroke="#FDE68A" strokeWidth="2.5" opacity="0.85" />
    {/* Right Wall Foundation */}
    <Rect x="116" y="146" width="44" height="6" rx="2" fill="#475569" stroke="#1E293B" strokeWidth="1" />

    {/* Top Header Beam Above Doorway */}
    <Rect x="48" y="54" width="74" height="20" fill="url(#barnWoodGrad)" stroke="#7F1D1D" strokeWidth="1.5" />
    <Path d="M 48 64 L 122 64" stroke="#7F1D1D" strokeWidth="2" />

    {/* Barn Doorframe Posts */}
    <Rect x="50" y="70" width="6" height="78" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
    <Rect x="114" y="70" width="6" height="78" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
    <Path d="M 50 72 Q 85 62 120 72" stroke="#78350F" strokeWidth="4" fill="none" />

    {/* Closed Barn Gates (Rendered when door is closed) */}
    {!isDoorOpen && (
      <G>
        <Rect x="56" y="74" width="28" height="74" fill="#9A3412" stroke="#451A03" strokeWidth="2" />
        <Path d="M 58 78 L 82 144 M 58 144 L 82 78" stroke="#FDE68A" strokeWidth="2" opacity="0.8" />
        <Rect x="86" y="74" width="28" height="74" fill="#9A3412" stroke="#451A03" strokeWidth="2" />
        <Path d="M 88 78 L 112 144 M 88 144 L 112 78" stroke="#FDE68A" strokeWidth="2" opacity="0.8" />
        <Rect x="78" y="106" width="14" height="6" rx="2" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
      </G>
    )}
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

  // Stage Sizing
  const stageWidth = Math.min(windowWidth - 32, 460);
  const stageHeight = 240;
  const barnSize = Math.max(145, Math.min(185, stageWidth * 0.44));
  const sheepSize = Math.max(48, Math.min(62, stageWidth * 0.16));

  // Barn placement on stage
  const barnLeftX = (stageWidth - barnSize) / 2 + 10;
  const barnCenterDoorX = barnLeftX + barnSize * 0.5 - sheepSize * 0.5;

  // Smooth single-axis translation value + subtle vertical trot bob
  const sheepTrackX = useRef(new Animated.Value(0)).current;
  const sheepBobY = useRef(new Animated.Value(0)).current;

  const isMountedRef = useRef<boolean>(true);
  const startTimeRef = useRef<number>(Date.now());

  // Trot animation loop
  const startTrotBob = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sheepBobY, {
          toValue: -4,
          duration: 180,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(sheepBobY, {
          toValue: 0,
          duration: 180,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopTrotBob = () => {
    sheepBobY.stopAnimation();
    sheepBobY.setValue(0);
  };

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
    const startXLeft = -sheepSize - 20;

    // Step 1: Walk in sequence
    const walkNextEnteringSheep = () => {
      if (!isMountedRef.current) return;

      if (inIndex >= enters) {
        stopTrotBob();
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
      startTrotBob();

      // Smooth horizontal walk across pasture right through the barn doorway
      Animated.timing(sheepTrackX, {
        toValue: barnCenterDoorX + 18, // Steps right through the door opening into the interior
        duration: config.walkDurationMs,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        if (!isMountedRef.current) return;
        stopTrotBob();
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
          stopTrotBob();
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
        startTrotBob();

        // Smooth horizontal walk OUT of barn through the doorway to the left pasture
        Animated.timing(sheepTrackX, {
          toValue: startXLeft,
          duration: cfg.walkDurationMs,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => {
          if (!isMountedRef.current) return;
          stopTrotBob();
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

      {/* Open Farm Pasture Stage (Completely Open - No boxed card border) */}
      <View style={styles.stageWrapper}>
        <View style={[styles.openStageContainer, { width: stageWidth, height: stageHeight }]}>
          {/* Natural Farm Pasture Scenery Background */}
          <OpenPastureBackdrop width={stageWidth} height={stageHeight} barnCenterDoorX={barnCenterDoorX} />

          {/* LAYER 1 (BACK): Sheep Barn Interior & Golden Straw Bedding */}
          <View style={[styles.barnLayerAnchor, { left: barnLeftX, bottom: 12, zIndex: 1 }]}>
            <SheepBarnBackdrop size={barnSize} />
          </View>

          {/* LAYER 2 (MIDDLE): Animated Walking Sheep with Trot Bobbing */}
          {(phase === 'WALK_IN' || phase === 'WALK_OUT') && currentSheepIndex >= 0 && (
            <Animated.View
              style={[
                styles.walkingSheepWrapper,
                {
                  bottom: 18,
                  transform: [{ translateX: sheepTrackX }, { translateY: sheepBobY }],
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

          {/* LAYER 3 (FRONT): Barn Facade, Timber Walls & Open Doorway Arch */}
          <View
            pointerEvents="none"
            style={[styles.barnLayerAnchor, { left: barnLeftX, bottom: 12, zIndex: 10 }]}
          >
            <SheepBarnFacade
              size={barnSize}
              isDoorOpen={phase === 'WALK_IN' || phase === 'WALK_OUT' || (phase === 'RESULT' && !isWrong)}
            />
          </View>

          {/* Victory Celebration: Remaining Sheep happily peek out through doorway */}
          {phase === 'RESULT' && !isWrong && (
            <View style={[styles.celebrationSheepRow, { left: barnCenterDoorX, bottom: 20, zIndex: 6 }]}>
              <WalkingSheepIllustration size={34} facing="right" />
              <WalkingSheepIllustration size={30} facing="left" />
            </View>
          )}
        </View>
      </View>

      {/* Answer Choice Section */}
      <View style={[styles.choicesContainer, { width: stageWidth }]}>
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
                key={num}
                activeOpacity={0.88}
                disabled={phase !== 'GUESS'}
                accessibilityLabel={`Number ${num}`}
                accessibilityRole="button"
                onPress={() => handleChoicePress(num)}
                style={[
                  styles.choiceNumberBtn,
                  {
                    backgroundColor: isCorrect
                      ? '#DCFCE7'
                      : isWrongChoice
                      ? '#FEE2E2'
                      : isHc
                      ? COLORS.hcCardBackground
                      : '#FFFFFF',
                    borderColor: isCorrect
                      ? '#16A34A'
                      : isWrongChoice
                      ? '#DC2626'
                      : isHc
                      ? COLORS.hcBorder
                      : '#E2E8F0',
                    opacity: phase !== 'GUESS' && !isSelected ? 0.6 : 1,
                  },
                ]}
              >
                <Typography
                  size="xxl"
                  weight="bold"
                  color={
                    isCorrect
                      ? '#15803D'
                      : isWrongChoice
                      ? '#B91C1C'
                      : isHc
                      ? COLORS.hcTextPrimary
                      : '#0F172A'
                  }
                >
                  {num}
                </Typography>
                {isCorrect && (
                  <View style={styles.choiceCheckBadge}>
                    <CheckCircle2 size={16} color="#16A34A" />
                  </View>
                )}
                {isWrongChoice && (
                  <View style={styles.choiceCheckBadge}>
                    <XCircle size={16} color="#DC2626" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Leave Confirmation Modal */}
      <Modal visible={showLeaveModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' }]}>
            <View style={styles.modalIconCircle}>
              <LogOut size={28} color="#DC2626" />
            </View>

            <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} style={{ marginTop: 12 }}>
              {t('leave_game_title') || 'Leave Game?'}
            </Typography>

            <Typography size="sm" color={COLORS.textSecondary} align="center" style={{ marginTop: 6, lineHeight: 20 }}>
              {t('leave_game_desc') || 'Your progress in this round will be lost.'}
            </Typography>

            <View style={styles.modalButtonsStack}>
              <TouchableOpacity
                activeOpacity={0.85}
                accessibilityRole="button"
                onPress={() => setShowLeaveModal(false)}
                style={styles.continueModalBtn}
              >
                <Typography size="base" weight="bold" color="#FFFFFF">
                  {t('continue_game') || 'Continue Playing'}
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                accessibilityRole="button"
                onPress={() => {
                  setShowLeaveModal(false);
                  router.back();
                }}
                style={styles.leaveModalBtn}
              >
                <Typography size="sm" weight="semibold" color="#DC2626">
                  {t('leave') || 'Exit Game'}
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Result Scorecard Modal */}
      <GameResultModal
        visible={phase === 'RESULT' && !!gameResult}
        result={gameResult}
        playAgainLabel={currentLevel < 4 ? 'Next Level' : 'Play Again'}
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
  headerRow: {
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
    elevation: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  levelPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginTop: 2,
  },
  promptContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  phasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  wrongBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: '#FECDD3',
  },
  stageWrapper: {
    width: '100%',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  openStageContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: RADIUS.xl,
  },
  barnLayerAnchor: {
    position: 'absolute',
    alignItems: 'center',
  },
  walkingSheepWrapper: {
    position: 'absolute',
    left: 0,
  },
  celebrationSheepRow: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 6,
  },
  choicesContainer: {
    alignItems: 'center',
    marginTop: SPACING.md,
    alignSelf: 'center',
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
