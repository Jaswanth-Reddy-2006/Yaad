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
import { GameResultModal, LeaveGameModal } from '../../../components/games/GameResultModal';
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
 * Open Meadow Pasture Scenery (Edge-to-edge full screen natural farm environment)
 */
const OpenPastureBackdrop: React.FC<{
  width: number;
  height: number;
  stageTopY: number;
  stageHeight: number;
  barnCenterDoorX: number;
  barnLeftX: number;
  barnSize: number;
}> = ({
  width,
  height,
  stageTopY,
  stageHeight,
  barnCenterDoorX,
  barnLeftX,
  barnSize,
}) => {
  const pathY = stageTopY + stageHeight - 16;
  const hillBackY = stageTopY + 40;
  const hillFrontY = stageTopY + 75;
  const fenceY = pathY - 56;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={StyleSheet.absoluteFill}>
      <Defs>
        {/* Sunny Sky Gradient */}
        <LinearGradient id="meadowSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#BAE6FD" />
          <Stop offset="45%" stopColor="#E0F2FE" />
          <Stop offset="75%" stopColor="#DCFCE7" />
          <Stop offset="100%" stopColor="#86EFAC" />
        </LinearGradient>
        {/* Rolling Hills Gradients */}
        <LinearGradient id="hillBack" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#86EFAC" />
          <Stop offset="100%" stopColor="#22C55E" />
        </LinearGradient>
        <LinearGradient id="hillFront" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#4ADE80" />
          <Stop offset="60%" stopColor="#22C55E" />
          <Stop offset="100%" stopColor="#15803D" />
        </LinearGradient>
        {/* Cobblestone Path Gradient */}
        <LinearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#E2E8F0" />
          <Stop offset="50%" stopColor="#CBD5E1" />
          <Stop offset="100%" stopColor="#E2E8F0" />
        </LinearGradient>
      </Defs>

      {/* 1. Expansive Edge-to-Edge Sky (Covering full screen length) */}
      <Rect width={width} height={height} fill="url(#meadowSky)" />

      {/* 2. Warm Morning Sun with Aura */}
      <Circle cx={width * 0.12} cy={44} r={32} fill="#FEF08A" opacity={0.45} />
      <Circle cx={width * 0.12} cy={44} r={20} fill="#FDE047" />

      {/* 3. Soft Fluffy Clouds in Sky */}
      <G fill="#FFFFFF" opacity={0.75} transform={`translate(${width * 0.22}, 24)`}>
        <Circle cx={12} cy={12} r={10} />
        <Circle cx={24} cy={8} r={14} />
        <Circle cx={38} cy={12} r={11} />
        <Rect x={12} y={10} width={26} height={12} rx={6} />
      </G>

      <G fill="#FFFFFF" opacity={0.65} transform={`translate(${width * 0.76}, 20)`}>
        <Circle cx={10} cy={10} r={8} />
        <Circle cx={20} cy={6} r={11} />
        <Circle cx={32} cy={10} r={9} />
        <Rect x={10} y={8} width={22} height={10} rx={5} />
      </G>

      {/* 4. Distant Rolling Hills */}
      <Path
        d={`M -20 ${hillBackY} Q ${width * 0.25} ${hillBackY - 25} ${width * 0.5} ${hillBackY - 5} Q ${width * 0.75} ${hillBackY - 20} ${width + 20} ${hillBackY} L ${width + 20} ${height} L -20 ${height} Z`}
        fill="url(#hillBack)"
        opacity={0.65}
      />

      {/* Distant Trees on Hilltops */}
      <G fill="#15803D" opacity={0.55}>
        <Circle cx={width * 0.08} cy={hillBackY - 18} r={14} />
        <Circle cx={width * 0.14} cy={hillBackY - 22} r={18} />
        <Circle cx={width * 0.86} cy={hillBackY - 16} r={16} />
        <Circle cx={width * 0.92} cy={hillBackY - 20} r={18} />
      </G>

      {/* 5. Main Lush Meadow Lawn (Spans all the way down the entire screen length) */}
      <Path
        d={`M -20 ${hillFrontY} Q ${width * 0.3} ${hillFrontY - 16} ${width * 0.55} ${hillFrontY - 6} Q ${width * 0.85} ${hillFrontY - 12} ${width + 20} ${hillFrontY + 2} L ${width + 20} ${height} L -20 ${height} Z`}
        fill="url(#hillFront)"
      />

      {/* 6. Wooden Farm Fences Left & Right */}
      <G stroke="#78350F" strokeWidth={2.2} fill="none">
        <Path d={`M -10 ${fenceY} L ${Math.max(20, barnLeftX - 10)} ${fenceY + 6} M -10 ${fenceY + 12} L ${Math.max(20, barnLeftX - 10)} ${fenceY + 18}`} />
        <Path d={`M 15 ${fenceY - 6} L 15 ${fenceY + 22} M 55 ${fenceY - 4} L 55 ${fenceY + 24} M 95 ${fenceY - 2} L 95 ${fenceY + 26}`} />
      </G>

      <G stroke="#78350F" strokeWidth={2.2} fill="none">
        <Path d={`M ${barnLeftX + barnSize + 10} ${fenceY + 6} L ${width + 10} ${fenceY} M ${barnLeftX + barnSize + 10} ${fenceY + 18} L ${width + 10} ${fenceY + 12}`} />
        <Path d={`M ${width - 95} ${fenceY - 2} L ${width - 95} ${fenceY + 26} M ${width - 55} ${fenceY - 4} L ${width - 55} ${fenceY + 24} M ${width - 15} ${fenceY - 6} L ${width - 15} ${fenceY + 22}`} />
      </G>

      {/* 7. CONTINUOUS COBBLESTONE ROAD PASSING THROUGH THE BARN */}
      {/* Left Exit Path */}
      <Path
        d={`M -20 ${pathY + 6} Q ${width * 0.22} ${pathY - 6} ${barnCenterDoorX + 10} ${pathY - 8} L ${barnCenterDoorX + 38} ${pathY - 8} Q ${width * 0.25} ${pathY + 18} -20 ${pathY + 30} Z`}
        fill="url(#pathGrad)"
        stroke="#94A3B8"
        strokeWidth={1.5}
      />

      {/* Right Entry Path */}
      <Path
        d={`M ${width + 20} ${pathY + 6} Q ${width * 0.78} ${pathY - 6} ${barnCenterDoorX + 28} ${pathY - 8} L ${barnCenterDoorX} ${pathY - 8} Q ${width * 0.75} ${pathY + 18} ${width + 20} ${pathY + 30} Z`}
        fill="url(#pathGrad)"
        stroke="#94A3B8"
        strokeWidth={1.5}
      />

      {/* Stepping Stones on Paths */}
      <Ellipse cx={35} cy={pathY + 4} rx={10} ry={4} fill="#94A3B8" opacity={0.6} />
      <Ellipse cx={75} cy={pathY} rx={11} ry={4} fill="#94A3B8" opacity={0.6} />
      <Ellipse cx={width - 35} cy={pathY + 4} rx={10} ry={4} fill="#94A3B8" opacity={0.6} />
      <Ellipse cx={width - 75} cy={pathY} rx={11} ry={4} fill="#94A3B8" opacity={0.6} />

      {/* 8. Wildflowers across the Upper & Lower Meadow Lawn */}
      <Circle cx={24} cy={pathY - 22} r={3.5} fill="#F43F5E" />
      <Circle cx={24} cy={pathY - 22} r={1.5} fill="#FEF08A" />
      <Circle cx={50} cy={pathY - 14} r={3} fill="#FACC15" />
      <Circle cx={width - 50} cy={pathY - 14} r={3.5} fill="#EC4899" />
      <Circle cx={width - 24} cy={pathY - 24} r={3.5} fill="#38BDF8" />

      {/* Lower Pasture Wildflowers (Around & Below choices) */}
      <Circle cx={36} cy={height - 60} r={4} fill="#F43F5E" />
      <Circle cx={36} cy={height - 60} r={1.8} fill="#FEF08A" />
      <Circle cx={width * 0.3} cy={height - 40} r={3.5} fill="#FACC15" />
      <Circle cx={width * 0.7} cy={height - 48} r={3.5} fill="#EC4899" />
      <Circle cx={width - 40} cy={height - 65} r={4} fill="#38BDF8" />
      <Circle cx={width - 40} cy={height - 65} r={1.8} fill="#FEF08A" />
    </Svg>
  );
};

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
    <Rect x="48" y="68" width="74" height="82" fill="url(#barnDarkInterior)" rx="3" />
    <Path d="M 50 72 Q 85 62 120 72 L 120 148 L 50 148 Z" fill="url(#doorShadow)" />
    <Path d="M 48 130 L 122 130 L 122 150 L 48 150 Z" fill="url(#barnStrawGrad)" />
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
    <Path d="M 2 58 L 85 12 L 168 58" stroke="#D97706" strokeWidth="2.5" fill="none" />
    <Path d="M 16 54 L 85 14 L 154 54 Z" fill="url(#barnWoodGrad)" />

    {/* Hayloft Window */}
    <Rect x="72" y="24" width="26" height="24" rx="2" fill="#451A03" stroke="#F59E0B" strokeWidth="2" />
    <Path d="M 68 44 Q 85 52 102 44 Q 96 36 85 36 Q 74 36 68 44 Z" fill="url(#hayLoftGrad)" stroke="#B45309" strokeWidth="1" />

    {/* Left Barn Wall */}
    <Rect x="14" y="54" width="38" height="94" fill="url(#barnWoodGrad)" stroke="#7F1D1D" strokeWidth="2" rx="2" />
    <Path d="M 18 64 L 48 138 M 18 138 L 48 64" stroke="#FDE68A" strokeWidth="2.5" opacity="0.85" />
    <Rect x="10" y="146" width="44" height="6" rx="2" fill="#475569" stroke="#1E293B" strokeWidth="1" />

    {/* Right Barn Wall */}
    <Rect x="118" y="54" width="38" height="94" fill="url(#barnWoodGrad)" stroke="#7F1D1D" strokeWidth="2" rx="2" />
    <Path d="M 122 64 L 152 138 M 122 138 L 152 64" stroke="#FDE68A" strokeWidth="2.5" opacity="0.85" />
    <Rect x="116" y="146" width="44" height="6" rx="2" fill="#475569" stroke="#1E293B" strokeWidth="1" />

    {/* Top Header Beam Above Doorway */}
    <Rect x="48" y="54" width="74" height="20" fill="url(#barnWoodGrad)" stroke="#7F1D1D" strokeWidth="1.5" />
    <Path d="M 48 64 L 122 64" stroke="#7F1D1D" strokeWidth="2" />

    {/* Barn Doorframe Posts */}
    <Rect x="50" y="70" width="6" height="78" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
    <Rect x="114" y="70" width="6" height="78" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
    <Path d="M 50 72 Q 85 62 120 72" stroke="#78350F" strokeWidth="4" fill="none" />

    {/* Closed Barn Gates (when closed) */}
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
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

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

  // Full Screen Edge-to-Edge Dimensions (Width & Full Length / Height)
  const fullMeadowHeight = Math.max(windowHeight - 60, 680);
  const stageWidth = windowWidth;
  const stageHeight = 260;
  const stageTopY = 120;
  const barnSize = Math.max(145, Math.min(185, stageWidth * 0.44));
  const sheepSize = Math.max(48, Math.min(62, stageWidth * 0.16));

  // Centered Barn placement on stage
  const barnLeftX = (stageWidth - barnSize) / 2;
  const barnCenterDoorX = barnLeftX + barnSize * 0.5 - sheepSize * 0.5;

  // Single-axis translation value + subtle vertical trot bob
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

  // Sequential walk sequence: Enter from RIGHT -> (Pause) -> Exit to LEFT -> Guess
  const startFullSequence = (enters: number, exits: number, config: LevelConfig) => {
    let inIndex = 0;
    const startXRight = stageWidth + 20; // Starts off-screen on the right side
    const startXLeft = -sheepSize - 30; // Exits off-screen on the left side

    // Step 1: Walk in sequence (Entering from RIGHT into the Barn Doorway)
    const walkNextEnteringSheep = () => {
      if (!isMountedRef.current) return;

      if (inIndex >= enters) {
        stopTrotBob();
        // Finished entering! If exits > 0, proceed to walk out sequence to the left
        if (exits > 0) {
          setTimeout(() => {
            if (!isMountedRef.current) return;
            setPhase('WALK_OUT');
            voiceService.speak('Look! Some sheep are leaving the barn to the left.');
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
      sheepTrackX.setValue(startXRight);
      startTrotBob();

      // Smooth horizontal walk from RIGHT side into the barn doorway
      Animated.timing(sheepTrackX, {
        toValue: barnCenterDoorX - 10, // Steps directly into the doorway from the right
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

    // Step 2: Walk out sequence (Exiting from Barn Doorway to LEFT side)
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

        // Smooth horizontal walk OUT of barn through the doorway to the LEFT edge
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
      voiceService.speak(`Watch closely! ${enters} sheep enter from the right, and ${exits} sheep leave to the left. Count how many stay inside.`);
    } else {
      voiceService.speak('Watch closely! Count the sheep as they walk into the barn from the right.');
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
        voiceService.speak(`Wonderful! ${enterCount} entered and ${exitCount} left, leaving exactly ${remainingCount} inside the barn.`);
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
      <View style={[styles.fullMeadowWrapper, { minHeight: fullMeadowHeight }]}>
        {/* Full Edge-to-Edge Pasture Scenery covering the entire screen length */}
        <OpenPastureBackdrop
          width={windowWidth}
          height={fullMeadowHeight}
          stageTopY={stageTopY}
          stageHeight={stageHeight}
          barnCenterDoorX={barnCenterDoorX}
          barnLeftX={barnLeftX}
          barnSize={barnSize}
        />

        {/* Top Header Row (In Sky Area) */}
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
            textToSpeak={`Count the Sheep. ${activeConfig.label}. Watch the sheep enter from the right, note any that leave to the left, and count how many remain inside.`}
            size="sm"
            variant="secondary"
          />
        </View>

        {/* Dynamic Status / Prompt Banner (In Sky/Hills Area) */}
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
              <ArrowRight size={18} color="#15803D" style={{ marginRight: 6, transform: [{ rotate: '180deg' }] }} />
              <Typography size="sm" weight="bold" color="#15803D">
                ⬅️ Sheep entering from the right...
              </Typography>
            </View>
          ) : phase === 'WALK_OUT' ? (
            <View style={[styles.phasePill, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
              <ArrowLeftIcon size={18} color="#EA580C" style={{ marginRight: 6 }} />
              <Typography size="sm" weight="bold" color="#C2410C">
                ⬅️ Watch! Sheep leaving to the left...
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

        {/* Barn Stage: Sheep walk across the road into the Barn */}
        <View style={[styles.stageArea, { width: windowWidth, height: stageHeight }]}>
          {/* LAYER 1 (BACK): Barn Interior & Straw Bedding */}
          <View style={[styles.barnLayerAnchor, { left: barnLeftX, bottom: 8, zIndex: 1 }]}>
            <SheepBarnBackdrop size={barnSize} />
          </View>

          {/* LAYER 2 (MIDDLE): Animated Walking Sheep with Trot Bobbing (Facing left) */}
          {(phase === 'WALK_IN' || phase === 'WALK_OUT') && currentSheepIndex >= 0 && (
            <Animated.View
              style={[
                styles.walkingSheepWrapper,
                {
                  bottom: 14,
                  transform: [{ translateX: sheepTrackX }, { translateY: sheepBobY }],
                  zIndex: 5,
                },
              ]}
            >
              <WalkingSheepIllustration
                size={sheepSize}
                facing="left"
              />
            </Animated.View>
          )}

          {/* LAYER 3 (FRONT): Barn Facade, Timber Walls & Doorway Arch */}
          <View
            pointerEvents="none"
            style={[styles.barnLayerAnchor, { left: barnLeftX, bottom: 8, zIndex: 10 }]}
          >
            <SheepBarnFacade
              size={barnSize}
              isDoorOpen={phase === 'WALK_IN' || phase === 'WALK_OUT' || (phase === 'RESULT' && !isWrong)}
            />
          </View>

          {/* Victory Celebration: Remaining Sheep happily peek out through doorway */}
          {phase === 'RESULT' && !isWrong && (
            <View style={[styles.celebrationSheepRow, { left: barnCenterDoorX, bottom: 16, zIndex: 6 }]}>
              <WalkingSheepIllustration size={34} facing="right" />
              <WalkingSheepIllustration size={30} facing="left" />
            </View>
          )}
        </View>

        {/* Answer Choice Section (On Lower Lush Pasture Grass) */}
        <View style={styles.choicesContainer}>
          <View style={styles.promptPill}>
            <Typography size="sm" color="#14532D" align="center" weight="bold">
              {phase === 'GUESS' ? '🤔 Tap how many sheep are left inside:' : '👀 Watch the sheep carefully...'}
            </Typography>
          </View>

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
                        : '#CBD5E1',
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
      </View>

      {/* Leave Confirmation Modal */}
      <LeaveGameModal
        visible={showLeaveModal}
        gameTitle="Count the Sheep"
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={() => {
          setShowLeaveModal(false);
          router.back();
        }}
      />

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
    paddingHorizontal: 0,
    paddingBottom: 0,
    flexGrow: 1,
  },
  fullMeadowWrapper: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    paddingBottom: SPACING.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  backSquareBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
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
    borderRadius: 4,
    marginTop: 2,
  },
  promptContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
  },
  phasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 253, 244, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  wrongBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254, 226, 226, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  stageArea: {
    position: 'relative',
    marginVertical: 0,
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
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    width: '100%',
    paddingBottom: SPACING.lg,
  },
  promptPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  choicesGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 420,
  },
  choiceNumberBtn: {
    flex: 1,
    height: 64,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  choiceCheckBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
});
