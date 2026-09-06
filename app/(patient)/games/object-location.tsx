import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Svg, {
  Rect,
  Circle,
  Path,
  G,
  Defs,
  LinearGradient,
  Stop,
  Ellipse,
} from 'react-native-svg';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  MapPin,
} from 'lucide-react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Typography } from '../../../components/common/Typography';
import { ListenButton } from '../../../components/common/ListenButton';
import { GameResultModal, LeaveGameModal } from '../../../components/games/GameResultModal';
import {
  AppleIllustration,
  BananaIllustration,
  MangoIllustration,
  FlowerIllustration,
  CupIllustration,
  UmbrellaIllustration,
  RadioIllustration,
  GlassesIllustration,
} from '../../../components/illustrations';
import { COLORS, SPACING } from '../../../constants/theme';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';
import { voiceService } from '../../../services/VoiceService';
import { GameResult } from '../../../types';
import { gameRepository } from '../../../repositories/GameRepository';

// ==========================================
// 1. Single Complete Living Room Scene Canvas
// ==========================================

export const LivingRoomSceneCanvas: React.FC<{ width: number; height: number }> = ({ width, height }) => (
  <Svg width={width} height={height} viewBox="0 0 420 330">
    <Defs>
      <LinearGradient id="wallBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FEF3C7" />
        <Stop offset="100%" stopColor="#FDE68A" />
      </LinearGradient>
      <LinearGradient id="floorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#B45309" />
        <Stop offset="40%" stopColor="#92400E" />
        <Stop offset="100%" stopColor="#78350F" />
      </LinearGradient>
      <LinearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#38BDF8" />
        <Stop offset="100%" stopColor="#BAE6FD" />
      </LinearGradient>
      <LinearGradient id="curtainGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#F472B6" />
        <Stop offset="100%" stopColor="#DB2777" />
      </LinearGradient>
      <LinearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#A16207" />
        <Stop offset="100%" stopColor="#78350F" />
      </LinearGradient>
      <LinearGradient id="shelfBack" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FEF9C3" />
        <Stop offset="100%" stopColor="#FEF08A" />
      </LinearGradient>
      <LinearGradient id="sofaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#3B82F6" />
        <Stop offset="100%" stopColor="#1D4ED8" />
      </LinearGradient>
      <LinearGradient id="cushionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#60A5FA" />
        <Stop offset="100%" stopColor="#2563EB" />
      </LinearGradient>
      <LinearGradient id="tableTop" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#F59E0B" />
        <Stop offset="50%" stopColor="#D97706" />
        <Stop offset="100%" stopColor="#B45309" />
      </LinearGradient>
      <LinearGradient id="cabWood" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FB923C" />
        <Stop offset="100%" stopColor="#C2410C" />
      </LinearGradient>
      <LinearGradient id="lampShade" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FEF08A" />
        <Stop offset="100%" stopColor="#FACC15" />
      </LinearGradient>
      <LinearGradient id="rugGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#F43F5E" />
        <Stop offset="100%" stopColor="#BE123C" />
      </LinearGradient>
      <LinearGradient id="rugCenter" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FEF08A" />
        <Stop offset="100%" stopColor="#FBBF24" />
      </LinearGradient>
    </Defs>

    {/* 1. ROOM BACKGROUND: Wall & Floor */}
    <Rect x="0" y="0" width="420" height="200" fill="url(#wallBg)" />
    <Rect x="0" y="0" width="420" height="8" fill="#FEF08A" opacity="0.6" />
    <Path d="M 0 8 L 420 8" stroke="#FBBF24" strokeWidth="1.5" />
    <Path
      d="M 30 8 L 30 196 M 70 8 L 70 196 M 110 8 L 110 196 M 310 8 L 310 196 M 350 8 L 350 196 M 390 8 L 390 196"
      stroke="#FDE047"
      strokeWidth="1"
      opacity="0.35"
    />
    <Rect x="0" y="194" width="420" height="10" fill="#78350F" />
    <Rect x="0" y="194" width="420" height="2.5" fill="#A16207" />
    <Rect x="0" y="204" width="420" height="126" fill="url(#floorGrad)" />
    <Path
      d="M 40 204 L 0 330 M 110 204 L 70 330 M 180 204 L 160 330 M 240 204 L 260 330 M 310 204 L 350 330 M 380 204 L 420 330"
      stroke="#78350F"
      strokeWidth="1.5"
      opacity="0.45"
    />
    <Path d="M 0 240 L 420 240 M 0 280 L 420 280" stroke="#78350F" strokeWidth="1" opacity="0.3" />

    {/* 2. FRAMED WALL ART */}
    <Rect x="94" y="32" width="34" height="42" rx="3" fill="#FFFBEB" stroke="#92400E" strokeWidth="2.5" />
    <Circle cx="111" cy="50" r="10" fill="#FDE68A" />
    <Path d="M 98 68 L 106 56 L 115 65 L 122 58 L 126 68 Z" fill="#16A34A" />

    {/* 3. WINDOW IN CENTER */}
    <G>
      <Path
        d="M 152 114 L 152 46 C 152 24 175 16 210 16 C 245 16 268 24 268 46 L 268 114 Z"
        fill="url(#skyGrad)"
        stroke="#FFFFFF"
        strokeWidth="4"
      />
      <Circle cx="236" cy="40" r="14" fill="#FEF08A" opacity="0.9" />
      <Path d="M 172 52 Q 180 44 190 48 Q 198 42 206 50 Q 212 56 202 60 L 172 60 Z" fill="#FFFFFF" opacity="0.85" />
      <Path d="M 210 18 L 210 114 M 154 64 L 266 64" stroke="#FFFFFF" strokeWidth="3" />
      <Path d="M 148 20 Q 166 54 156 112 L 148 112 Z" fill="url(#curtainGrad)" opacity="0.92" />
      <Path d="M 272 20 Q 254 54 264 112 L 272 112 Z" fill="url(#curtainGrad)" opacity="0.92" />
      <Rect x="140" y="112" width="140" height="12" rx="3" fill="#D97706" stroke="#92400E" strokeWidth="2" />
      {/* Small Potted Plant sitting ON the window sill bar */}
      <G transform="translate(198, 102)">
        <Path d="M 10 20 L 14 28 L 6 28 Z" fill="#EA580C" />
        <Path d="M 10 20 C 4 12 8 4 10 4 C 12 4 16 12 10 20 Z" fill="#22C55E" />
        <Path d="M 10 14 C 2 12 0 8 0 8 C 0 8 4 10 10 14 Z" fill="#16A34A" />
      </G>
    </G>

    {/* 4. BOOKSHELF ON LEFT WALL */}
    <G>
      <Rect x="12" y="36" width="76" height="156" rx="4" fill="url(#shelfBack)" stroke="url(#woodGrad)" strokeWidth="4" />
      <Rect x="12" y="78" width="76" height="6" fill="url(#woodGrad)" />
      <Rect x="12" y="122" width="76" height="6" fill="url(#woodGrad)" />
      <Rect x="12" y="164" width="76" height="6" fill="url(#woodGrad)" />
      <G transform="translate(18, 46)">
        <Rect x="0" y="2" width="9" height="28" rx="2" fill="#DC2626" />
        <Rect x="11" y="0" width="10" height="30" rx="2" fill="#2563EB" />
        <Rect x="23" y="4" width="8" height="26" rx="2" fill="#16A34A" />
        <Path d="M 33 30 L 41 10 L 48 13 L 40 30 Z" fill="#D97706" />
      </G>
      <G transform="translate(18, 88)">
        <Rect x="0" y="4" width="10" height="28" rx="2" fill="#7C3AED" />
        <Rect x="12" y="0" width="9" height="32" rx="2" fill="#0284C7" />
        <Rect x="23" y="5" width="10" height="27" rx="2" fill="#EA580C" />
        <Circle cx="50" cy="18" r="8" fill="#F59E0B" />
        <Rect x="49" y="26" width="3" height="6" fill="#78350F" />
      </G>
      <G transform="translate(18, 132)">
        <Rect x="2" y="4" width="24" height="26" rx="3" fill="#D97706" />
        <Rect x="30" y="2" width="10" height="28" rx="2" fill="#059669" />
        <Rect x="42" y="0" width="11" height="30" rx="2" fill="#DC2626" />
      </G>
    </G>

    {/* 5. BEDSIDE / SIDE TABLE ON RIGHT */}
    <G transform="translate(320, 80)">
      <Rect x="12" y="86" width="7" height="24" rx="2" fill="#7C2D12" />
      <Rect x="63" y="86" width="7" height="24" rx="2" fill="#7C2D12" />
      <Rect x="8" y="46" width="66" height="42" rx="4" fill="url(#cabWood)" stroke="#9A3412" strokeWidth="2.5" />
      <Rect x="14" y="51" width="54" height="15" rx="2" fill="#FED7AA" stroke="#EA580C" strokeWidth="1" />
      <Circle cx="41" cy="58.5" r="3" fill="#7C2D12" />
      <Rect x="14" y="69" width="54" height="14" rx="2" fill="#FED7AA" stroke="#EA580C" strokeWidth="1" />
      <Circle cx="41" cy="76" r="3" fill="#7C2D12" />
      <Rect x="38" y="26" width="6" height="22" rx="1" fill="#D97706" />
      <Path d="M 24 26 L 33 6 L 49 6 L 58 26 Z" fill="url(#lampShade)" stroke="#CA8A04" strokeWidth="2" />
      <Circle cx="41" cy="18" r="16" fill="#FEF08A" opacity="0.45" />
    </G>

    {/* 6. COZY SOFA */}
    <G transform="translate(42, 160)">
      <Rect x="16" y="80" width="10" height="14" rx="2" fill="#78350F" />
      <Rect x="122" y="80" width="10" height="14" rx="2" fill="#78350F" />
      <Path d="M 12 36 C 12 16 28 8 74 8 C 120 8 136 16 136 36 L 136 68 L 12 68 Z" fill="url(#sofaGrad)" />
      <Circle cx="42" cy="28" r="3.5" fill="#1E40AF" />
      <Circle cx="74" cy="28" r="3.5" fill="#1E40AF" />
      <Circle cx="106" cy="28" r="3.5" fill="#1E40AF" />
      <Rect x="12" y="52" width="124" height="30" rx="8" fill="url(#cushionGrad)" stroke="#1E40AF" strokeWidth="2" />
      <Rect x="4" y="40" width="20" height="42" rx="8" fill="url(#sofaGrad)" stroke="#1E40AF" strokeWidth="2" />
      <Rect x="124" y="40" width="20" height="42" rx="8" fill="url(#sofaGrad)" stroke="#1E40AF" strokeWidth="2" />
    </G>

    {/* 7. CENTER COFFEE TABLE */}
    <G transform="translate(208, 185)">
      <Rect x="18" y="38" width="10" height="38" rx="2" fill="#78350F" opacity="0.8" />
      <Rect x="106" y="38" width="10" height="38" rx="2" fill="#78350F" opacity="0.8" />
      <Rect x="10" y="38" width="12" height="42" rx="2" fill="#B45309" />
      <Rect x="112" y="38" width="12" height="42" rx="2" fill="#B45309" />
      <Rect x="14" y="58" width="106" height="5" rx="2" fill="#78350F" />
      <Ellipse cx="67" cy="34" rx="64" ry="22" fill="url(#tableTop)" stroke="#92400E" strokeWidth="2.5" />
      <Ellipse cx="67" cy="31" rx="56" ry="16" fill="#FBBF24" opacity="0.45" />
    </G>

    {/* 8. FLOOR RUG */}
    <G transform="translate(118, 252)">
      <Rect x="0" y="0" width="184" height="66" rx="16" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" strokeDasharray="3 3" />
      <Rect x="6" y="4" width="172" height="58" rx="12" fill="url(#rugGrad)" />
      <Rect x="12" y="8" width="160" height="50" rx="8" fill="none" stroke="#FEF08A" strokeWidth="2" />
      <Ellipse cx="92" cy="33" rx="34" ry="16" fill="url(#rugCenter)" />
      <Path d="M 80 33 L 92 24 L 104 33 L 92 42 Z" fill="#9F1239" />
    </G>
  </Svg>
);

// ==========================================
// 2. Types & Room Location Definitions
// ==========================================

export interface LocationSlot {
  id: string;
  name: string;
  shortName: string;
  iconLabel: string;
  color: string;
  posX: number; // in 420 base coordinate space
  posY: number; // in 330 base coordinate space
}

export const ROOM_LOCATIONS: LocationSlot[] = [
  {
    id: 'bookshelf',
    name: 'Bookshelf',
    shortName: 'Shelf',
    iconLabel: '📚',
    color: '#7C3AED',
    posX: 50,   // center of bookshelf (x: 12 to 88, center = 50)
    posY: 140,  // middle shelf surface (y: 122+6 = 128, items sit just above = 135)
  },
  {
    id: 'window',
    name: 'Window Sill',
    shortName: 'Window',
    iconLabel: '🪴',
    color: '#059669',
    posX: 210,  // center of window
    posY: 120,  // window sill bar is at y=112 in SVG, item sits on top = 118
  },
  {
    id: 'nightstand',
    name: 'Bedside Table',
    shortName: 'Side Table',
    iconLabel: '🛏️',
    color: '#EA580C',
    posX: 360,  // side table center (x: 320+8=328 to 320+74=394, center = 361)
    posY: 122,  // top surface of the cabinet (y: 80+46=126 in scene SVG)
  },
  {
    id: 'sofa',
    name: 'Cozy Sofa',
    shortName: 'Sofa',
    iconLabel: '🛋️',
    color: '#2563EB',
    posX: 115,  // sofa center (x: 42+12=54 to 42+136=178, center = 116)
    posY: 205,  // sofa seat cushion top surface (y: 160+52=212)
  },
  {
    id: 'table',
    name: 'Center Table',
    shortName: 'Table',
    iconLabel: '🪵',
    color: '#D97706',
    posX: 275,  // table center (x: 208+67=275)
    posY: 208,  // table top surface (y: 185+34=219 ellipse center, top edge ~200)
  },
  {
    id: 'rug',
    name: 'Floor Rug',
    shortName: 'Rug',
    iconLabel: '🧺',
    color: '#DB2777',
    posX: 210,  // rug center (x: 118+92=210)
    posY: 270,  // rug surface center (y: 252+33=285, slightly above center)
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
  1: { level: 1, objectCount: 2, totalSlots: 4, memorizeSeconds: 8, label: 'Level 1 • 2 Objects' },
  2: { level: 2, objectCount: 3, totalSlots: 5, memorizeSeconds: 10, label: 'Level 2 • 3 Objects' },
  3: { level: 3, objectCount: 4, totalSlots: 6, memorizeSeconds: 12, label: 'Level 3 • 4 Objects' },
  4: { level: 4, objectCount: 4, totalSlots: 6, memorizeSeconds: 9, label: 'Level 4 • Fast Recall' },
};

export interface ObjectPlacement {
  object: GameObject;
  location: LocationSlot;
}

type GamePhase = 'MEMORIZE' | 'RECALL' | 'COMPLETED';

// ==========================================
// 3. Main Screen Component
// ==========================================

export default function ObjectLocationMemoryGameScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [phase, setPhase] = useState<GamePhase>('MEMORIZE');
  const [countdown, setCountdown] = useState<number>(8);

  const [activeSlots, setActiveSlots] = useState<LocationSlot[]>([]);
  const [placements, setPlacements] = useState<ObjectPlacement[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [wrongSlotId, setWrongSlotId] = useState<string | null>(null);
  const [solvedPlacements, setSolvedPlacements] = useState<string[]>([]);

  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentLevelConfig = LEVEL_CONFIGS[currentLevel] || LEVEL_CONFIGS[1];
  const targetPlacement = placements[currentQuestionIdx] || placements[0];

  // Responsive scene dimensions (viewBox is 420 x 330)
  const sceneWidth = Math.min(windowWidth - 32, 420);
  const sceneHeight = Math.round(sceneWidth * (330 / 420));
  const scale = sceneWidth / 420;

  // Initialize round
  const initRound = (lvl: number) => {
    const config = LEVEL_CONFIGS[lvl] || LEVEL_CONFIGS[1];

    const shuffledLocations = [...ROOM_LOCATIONS].slice(0, config.totalSlots);
    const shuffledObjects = [...OBJECTS_POOL].sort(() => Math.random() - 0.5).slice(0, config.objectCount);

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

    voiceService.speak('Look at the living room! Remember where each item is placed.');
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

    voiceService.speak('Where was this item located? Tap the spot on the room picture.');
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
      voiceService.speak('That is right! Great job!');
      setSolvedPlacements((prev) => [...prev, currentTarget.object.id]);

      setTimeout(() => {
        if (currentQuestionIdx < placements.length - 1) {
          const nextIdx = currentQuestionIdx + 1;
          setCurrentQuestionIdx(nextIdx);
          setSelectedSlotId(null);
          setIsWrong(false);
          setWrongSlotId(null);
          voiceService.speak('Where was this item located?');
        } else {
          finishGame();
        }
      }, 1200);
    } else {
      setIsWrong(true);
      setWrongSlotId(location.id);
      setMistakesCount((m) => m + 1);
      voiceService.speak('Not here! Try another spot on the picture.');
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
              ? 'Remember where each item is placed in the living room.'
              : 'Where was this item located? Tap the spot on the room picture.'
          }
          size="sm"
          variant="secondary"
        />
      </View>

      {/* 2. Phase 1: Memorize the Single Complete Room Scene */}
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
                {t('remember_object_placements')}
              </Typography>
              <Typography size="xs" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
                {t('remember_object_placements')}
              </Typography>
            </View>
          </View>

          {/* THE COMPLETE PICTURE: Single Unified Living Room Image Canvas */}
          <View style={[styles.bigPictureFrame, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFDF7' }]}>
            {/* Single SVG Scene with Objects Placed in Location Context (Pure Visual, No Names) */}
            <View style={[styles.canvasWrapper, { width: sceneWidth, height: sceneHeight }]}>
              <LivingRoomSceneCanvas width={sceneWidth} height={sceneHeight} />

              {/* Render placed items as exact SVG illustrations */}
              {placements.map((p) => {
                const slot = p.location;
                const ObjectComp = p.object.component;
                const posX = slot.posX * scale;
                const posY = slot.posY * scale;
                const itemSize = Math.max(38, Math.round(48 * scale));
                const anchorSize = itemSize + 14;

                return (
                  <View
                    key={slot.id}
                    style={[
                      styles.sceneObjectAnchor,
                      {
                        left: posX - anchorSize / 2,
                        top: posY - anchorSize / 2,
                        width: anchorSize,
                        height: anchorSize,
                      },
                    ]}
                  >
                    {/* Object rendered directly on the room scene — no box or card */}
                    <ObjectComp size={itemSize} />
                  </View>
                );
              })}
            </View>
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
              {t('ready_to_test')}
            </Typography>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. Phase 2: Recall Flow with Interactive Big Picture */}
      {phase === 'RECALL' && (
        <View style={styles.phaseContainer}>
          {/* Prompt Banner with Target Object to locate (Visual Object, No Name text) */}
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
              {TargetObjectComponent && <TargetObjectComponent size={54} />}
            </View>

            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Typography size="xs" weight="bold" color="#4F46E5">
                QUESTION {currentQuestionIdx + 1} OF {placements.length}
              </Typography>
              <Typography size="base" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#1E1B4B'} style={{ marginTop: 2 }}>
                {t('where_was_the_item')}
              </Typography>
            </View>
          </View>

          {/* Interactive Complete Living Room Scene Picture */}
          <View style={[styles.bigPictureFrame, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFDF7' }]}>
            {/* Single Canvas with Interactive Hotspots directly on the Image */}
            <View style={[styles.canvasWrapper, { width: sceneWidth, height: sceneHeight }]}>
              <LivingRoomSceneCanvas width={sceneWidth} height={sceneHeight} />

              {/* Hotspot Touch Targets Overlaid on each Furniture Location */}
              {activeSlots.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                const isSlotWrong = wrongSlotId === slot.id;
                const isSlotCorrect = isSelected && targetPlacement?.location.id === slot.id;
                const matchedPlacement = placements.find((p) => p.location.id === slot.id);
                const isAlreadySolved = !!matchedPlacement && solvedPlacements.includes(matchedPlacement.object.id);

                const posX = slot.posX * scale;
                const posY = slot.posY * scale;
                const SolvedComp = (isAlreadySolved || isSlotCorrect) && matchedPlacement ? matchedPlacement.object.component : null;
                const itemSize = Math.max(38, Math.round(48 * scale));
                const touchSize = Math.max(48, Math.round(56 * scale));

                return (
                  <TouchableOpacity
                    key={slot.id}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="Select spot"
                    onPress={() => handleSelectLocation(slot)}
                    style={[
                      styles.sceneTouchTarget,
                      {
                        left: posX - touchSize / 2,
                        top: posY - touchSize / 2,
                        width: touchSize,
                        height: touchSize,
                      },
                    ]}
                  >
                    {SolvedComp ? (
                      /* Solved Object State — shown directly on scene, no box */
                      <View style={styles.solvedContainer}>
                        <SolvedComp size={itemSize} />
                        <View style={styles.solvedCheckCorner}>
                          <CheckCircle2 size={18} color="#16A34A" />
                        </View>
                      </View>
                    ) : isSlotWrong ? (
                      /* Wrong Attempt State */
                      <View style={styles.wrongPinHalo}>
                        <XCircle size={36} color="#DC2626" />
                      </View>
                    ) : (
                      /* Interactive Hotspot Pin (Pure Visual Pin) */
                      <View
                        style={[
                          styles.hotspotPinCircle,
                          {
                            borderColor: isSelected ? '#16A34A' : slot.color,
                            backgroundColor: isSelected ? '#DCFCE7' : 'rgba(255, 255, 255, 0.94)',
                          },
                        ]}
                      >
                        <MapPin size={24} color={slot.color} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Feedback message on mistake */}
          {isWrong && (
            <View style={styles.wrongBanner}>
              <AlertCircle size={20} color="#DC2626" style={{ marginRight: 6 }} />
              <Typography size="sm" weight="bold" color="#B91C1C">
                {t('try_another_spot') || 'Not here! Tap another spot on the picture.'}
              </Typography>
            </View>
          )}
        </View>
      )}

      {/* 4. Exit Confirmation Modal */}
      <LeaveGameModal
        visible={showLeaveModal}
        gameTitle="Object–Location Memory"
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={() => {
          setShowLeaveModal(false);
          router.back();
        }}
      />

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
    alignItems: 'center',
  },
  instructionBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 1.5,
    marginBottom: SPACING.sm,
  },
  timerCircle: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0D9488',
  },
  bigPictureFrame: {
    width: '100%',
    padding: 0,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  canvasWrapper: {
    position: 'relative',
    borderRadius: 6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
  },
  sceneObjectAnchor: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  placedObjectCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  sceneTouchTarget: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  solvedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  solvedItemHalo: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 8,
    padding: 4,
    borderWidth: 2,
    borderColor: '#16A34A',
    elevation: 3,
    position: 'relative',
  },
  solvedCheckCorner: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },
  wrongPinHalo: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 2,
    borderWidth: 2,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotspotPinCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  readyPrimaryBtn: {
    width: '100%',
    backgroundColor: '#0D9488',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  questionBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: SPACING.sm,
  },
  targetObjectBadge: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C7D2FE',
  },
  wrongBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: SPACING.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginBottom: SPACING.sm,
  },
});
