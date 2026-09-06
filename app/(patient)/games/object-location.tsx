import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  ScrollView,
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
  LogOut,
  Sparkles,
  MapPin,
  Volume2,
  HelpCircle,
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
// 1. Illustrated Furniture Vector Components
// ==========================================

export const BookshelfFurniture: React.FC<{ size?: number }> = ({ size = 76 }) => (
  <Svg width={size} height={size * 0.88} viewBox="0 0 100 88">
    <Defs>
      <LinearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#A16207" />
        <Stop offset="100%" stopColor="#78350F" />
      </LinearGradient>
      <LinearGradient id="shelfBack" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FEF3C7" />
        <Stop offset="100%" stopColor="#FDE68A" />
      </LinearGradient>
    </Defs>
    <Rect x="8" y="8" width="84" height="74" rx="4" fill="url(#shelfBack)" stroke="url(#woodGrad)" strokeWidth="4" />
    <Rect x="8" y="44" width="84" height="5" fill="url(#woodGrad)" />
    <G transform="translate(14, 16)">
      <Rect x="0" y="2" width="9" height="24" rx="2" fill="#DC2626" />
      <Rect x="11" y="0" width="10" height="26" rx="2" fill="#2563EB" />
      <Rect x="23" y="4" width="8" height="22" rx="2" fill="#16A34A" />
      <Path d="M 33 26 L 41 8 L 48 11 L 40 26 Z" fill="#D97706" />
    </G>
    <G transform="translate(14, 51)">
      <Rect x="0" y="2" width="10" height="24" rx="2" fill="#7C3AED" />
      <Rect x="12" y="0" width="9" height="26" rx="2" fill="#0284C7" />
      <Rect x="23" y="3" width="10" height="23" rx="2" fill="#EA580C" />
      <Circle cx="52" cy="14" r="7" fill="#F59E0B" />
    </G>
  </Svg>
);

export const WindowSillFurniture: React.FC<{ size?: number }> = ({ size = 76 }) => (
  <Svg width={size} height={size * 0.88} viewBox="0 0 100 88">
    <Defs>
      <LinearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#60A5FA" />
        <Stop offset="100%" stopColor="#BAE6FD" />
      </LinearGradient>
      <LinearGradient id="curtainGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#F472B6" />
        <Stop offset="100%" stopColor="#EC4899" />
      </LinearGradient>
      <LinearGradient id="sillWood" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#D97706" />
        <Stop offset="100%" stopColor="#B45309" />
      </LinearGradient>
    </Defs>
    <Path d="M 16 68 L 16 32 C 16 14 32 8 50 8 C 68 8 84 14 84 32 L 84 68 Z" fill="url(#skyGrad)" stroke="#E2E8F0" strokeWidth="2.5" />
    <Circle cx="64" cy="24" r="10" fill="#FEF08A" opacity="0.9" />
    <Path d="M 28 32 Q 34 26 40 30 Q 48 26 52 32 Q 56 38 48 40 L 28 40 Z" fill="#FFFFFF" opacity="0.85" />
    <Path d="M 50 10 L 50 68 M 18 38 L 82 38" stroke="#FFFFFF" strokeWidth="2.5" />
    <Path d="M 16 14 Q 28 34 20 66 L 16 66 Z" fill="url(#curtainGrad)" opacity="0.9" />
    <Path d="M 84 14 Q 72 34 80 66 L 84 66 Z" fill="url(#curtainGrad)" opacity="0.9" />
    <Rect x="10" y="66" width="80" height="8" rx="2" fill="url(#sillWood)" />
    <G transform="translate(66, 50)">
      <Path d="M 2 16 L 14 16 L 12 22 L 4 22 Z" fill="#D97706" />
      <Path d="M 8 16 C 4 10 8 4 8 4 C 8 4 12 10 8 16 Z" fill="#22C55E" />
    </G>
  </Svg>
);

export const SofaFurniture: React.FC<{ size?: number }> = ({ size = 76 }) => (
  <Svg width={size} height={size * 0.88} viewBox="0 0 100 88">
    <Defs>
      <LinearGradient id="sofaBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#3B82F6" />
        <Stop offset="100%" stopColor="#1D4ED8" />
      </LinearGradient>
      <LinearGradient id="cushionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#60A5FA" />
        <Stop offset="100%" stopColor="#2563EB" />
      </LinearGradient>
    </Defs>
    <Rect x="16" y="70" width="8" height="10" rx="2" fill="#78350F" />
    <Rect x="76" y="70" width="8" height="10" rx="2" fill="#78350F" />
    <Path d="M 14 34 C 14 18 28 12 50 12 C 72 12 86 18 86 34 L 86 60 L 14 60 Z" fill="url(#sofaBody)" />
    <Circle cx="35" cy="28" r="2.5" fill="#1E40AF" />
    <Circle cx="50" cy="28" r="2.5" fill="#1E40AF" />
    <Circle cx="65" cy="28" r="2.5" fill="#1E40AF" />
    <Rect x="12" y="48" width="76" height="24" rx="6" fill="url(#cushionGrad)" stroke="#1E40AF" strokeWidth="1.5" />
    <Rect x="8" y="38" width="14" height="34" rx="6" fill="url(#sofaBody)" stroke="#1E40AF" strokeWidth="1.5" />
    <Rect x="78" y="38" width="14" height="34" rx="6" fill="url(#sofaBody)" stroke="#1E40AF" strokeWidth="1.5" />
  </Svg>
);

export const CoffeeTableFurniture: React.FC<{ size?: number }> = ({ size = 76 }) => (
  <Svg width={size} height={size * 0.88} viewBox="0 0 100 88">
    <Defs>
      <LinearGradient id="tableTop" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#F59E0B" />
        <Stop offset="50%" stopColor="#D97706" />
        <Stop offset="100%" stopColor="#B45309" />
      </LinearGradient>
      <LinearGradient id="tableLeg" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#B45309" />
        <Stop offset="100%" stopColor="#78350F" />
      </LinearGradient>
    </Defs>
    <Rect x="18" y="44" width="8" height="34" rx="2" fill="#78350F" opacity="0.7" />
    <Rect x="74" y="44" width="8" height="34" rx="2" fill="#78350F" opacity="0.7" />
    <Rect x="12" y="44" width="9" height="36" rx="2" fill="url(#tableLeg)" />
    <Rect x="79" y="44" width="9" height="36" rx="2" fill="url(#tableLeg)" />
    <Rect x="14" y="62" width="72" height="4" rx="1" fill="url(#tableLeg)" />
    <Ellipse cx="50" cy="40" rx="44" ry="16" fill="url(#tableTop)" stroke="#92400E" strokeWidth="2" />
    <Ellipse cx="50" cy="37" rx="38" ry="12" fill="#FBBF24" opacity="0.4" />
  </Svg>
);

export const BedsideTableFurniture: React.FC<{ size?: number }> = ({ size = 76 }) => (
  <Svg width={size} height={size * 0.88} viewBox="0 0 100 88">
    <Defs>
      <LinearGradient id="cabWood" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FB923C" />
        <Stop offset="100%" stopColor="#C2410C" />
      </LinearGradient>
      <LinearGradient id="lampShade" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FEF08A" />
        <Stop offset="100%" stopColor="#FACC15" />
      </LinearGradient>
    </Defs>
    <Rect x="24" y="74" width="6" height="8" rx="2" fill="#7C2D12" />
    <Rect x="70" y="74" width="6" height="8" rx="2" fill="#7C2D12" />
    <Rect x="20" y="42" width="60" height="34" rx="4" fill="url(#cabWood)" stroke="#9A3412" strokeWidth="2" />
    <Rect x="25" y="46" width="50" height="12" rx="2" fill="#FED7AA" stroke="#EA580C" strokeWidth="1" />
    <Circle cx="50" cy="52" r="2.5" fill="#7C2D12" />
    <Rect x="25" y="61" width="50" height="11" rx="2" fill="#7C2D12" opacity="0.4" />
    <Rect x="48" y="24" width="4" height="18" rx="1" fill="#D97706" />
    <Path d="M 36 24 L 42 10 L 58 10 L 64 24 Z" fill="url(#lampShade)" stroke="#CA8A04" strokeWidth="1.5" />
    <Circle cx="50" cy="18" r="12" fill="#FEF08A" opacity="0.5" />
  </Svg>
);

export const FloorRugFurniture: React.FC<{ size?: number }> = ({ size = 76 }) => (
  <Svg width={size} height={size * 0.88} viewBox="0 0 100 88">
    <Defs>
      <LinearGradient id="rugGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#F43F5E" />
        <Stop offset="100%" stopColor="#BE123C" />
      </LinearGradient>
      <LinearGradient id="rugCenter" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FEF08A" />
        <Stop offset="100%" stopColor="#FBBF24" />
      </LinearGradient>
    </Defs>
    <Rect x="6" y="24" width="88" height="42" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" strokeDasharray="2 2" />
    <Rect x="10" y="26" width="80" height="38" rx="4" fill="url(#rugGrad)" />
    <Rect x="14" y="30" width="72" height="30" rx="2" fill="none" stroke="#FEF08A" strokeWidth="1.5" />
    <Ellipse cx="50" cy="45" rx="16" ry="8" fill="url(#rugCenter)" />
    <Path d="M 44 45 L 50 40 L 56 45 L 50 50 Z" fill="#9F1239" />
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
  cardBg: string;
  borderColor: string;
  component: React.ComponentType<{ size?: number }>;
}

export const ROOM_LOCATIONS: LocationSlot[] = [
  {
    id: 'bookshelf',
    name: 'Bookshelf',
    shortName: 'Shelf',
    iconLabel: '📚',
    color: '#7C3AED',
    cardBg: '#FAF5FF',
    borderColor: '#DDD6FE',
    component: BookshelfFurniture,
  },
  {
    id: 'window',
    name: 'Window Sill',
    shortName: 'Window',
    iconLabel: '🪴',
    color: '#059669',
    cardBg: '#ECFDF5',
    borderColor: '#A7F3D0',
    component: WindowSillFurniture,
  },
  {
    id: 'sofa',
    name: 'Cozy Sofa',
    shortName: 'Sofa',
    iconLabel: '🛋️',
    color: '#2563EB',
    cardBg: '#EFF6FF',
    borderColor: '#BFDBFE',
    component: SofaFurniture,
  },
  {
    id: 'table',
    name: 'Center Table',
    shortName: 'Table',
    iconLabel: '🪵',
    color: '#D97706',
    cardBg: '#FFFBEB',
    borderColor: '#FDE68A',
    component: CoffeeTableFurniture,
  },
  {
    id: 'nightstand',
    name: 'Bedside Table',
    shortName: 'Bedside',
    iconLabel: '🛏️',
    color: '#EA580C',
    cardBg: '#FFF7ED',
    borderColor: '#FED7AA',
    component: BedsideTableFurniture,
  },
  {
    id: 'rug',
    name: 'Floor Rug',
    shortName: 'Rug',
    iconLabel: '🧺',
    color: '#DB2777',
    cardBg: '#FDF2F8',
    borderColor: '#FCE7F3',
    component: FloorRugFurniture,
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
  const [solvedPlacements, setSolvedPlacements] = useState<string[]>([]); // list of object ids already solved

  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentLevelConfig = LEVEL_CONFIGS[currentLevel] || LEVEL_CONFIGS[1];
  const targetPlacement = placements[currentQuestionIdx] || placements[0];

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

    // Voice prompt
    const speechItems = roundPlacements
      .map((p) => `${p.object.speechName} is on the ${p.location.name}`)
      .join(', and ');
    voiceService.speak(`Look at the room! Notice where each item is placed: ${speechItems}.`);
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
      voiceService.speak(`Where was the ${first.object.name} located? Tap on the room picture.`);
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
          // All objects solved!
          finishGame();
        }
      }, 1300);
    } else {
      // Incorrect location
      setIsWrong(true);
      setWrongSlotId(location.id);
      setMistakesCount((m) => m + 1);
      voiceService.speak(`Not here! The ${currentTarget.object.name} was not on the ${location.name}. Try another spot!`);
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
              ? placements.map((p) => `${p.object.speechName} is on the ${p.location.name}`).join(', and ')
              : `Where was the ${targetPlacement?.object.name} located?`
          }
          size="sm"
          variant="secondary"
        />
      </View>

      {/* 2. Phase 1: Memorize the Big Picture */}
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
                {t('memorize_placements') || 'Look at the Living Room!'}
              </Typography>
              <Typography size="xs" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
                {t('memorize_sub') || 'Remember which item is placed on each furniture piece.'}
              </Typography>
            </View>
          </View>

          {/* THE BIG PICTURE: Living Room Visual Scene */}
          <View style={[styles.bigPictureFrame, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFDF7' }]}>
            {/* Room Title Header */}
            <View style={styles.roomSceneHeader}>
              <Typography size="xs" weight="bold" color="#0D9488">
                🏡 LIVING ROOM SCENE
              </Typography>
              <Typography size="xs" color={COLORS.textMuted}>
                {placements.length} Items Placed
              </Typography>
            </View>

            {/* Living Room Spatial Furniture Grid */}
            <View style={styles.roomFurnitureGrid}>
              {activeSlots.map((slot) => {
                const matchedPlacement = placements.find((p) => p.location.id === slot.id);
                const ObjectComp = matchedPlacement?.object.component;
                const FurnitureComp = slot.component;

                return (
                  <View
                    key={slot.id}
                    style={[
                      styles.furnitureCard,
                      {
                        backgroundColor: isHc ? '#1E293B' : slot.cardBg,
                        borderColor: matchedPlacement ? slot.color : slot.borderColor,
                        borderWidth: matchedPlacement ? 2.5 : 1.5,
                      },
                    ]}
                  >
                    {/* Location Badge */}
                    <View style={[styles.locationBadge, { backgroundColor: slot.color }]}>
                      <Typography size="xs" weight="bold" color="#FFFFFF">
                        {slot.iconLabel} {slot.name}
                      </Typography>
                    </View>

                    {/* Integrated Furniture + Object Display */}
                    <View style={styles.furnitureStage}>
                      <FurnitureComp size={76} />

                      {/* Placed Object Overlay */}
                      {ObjectComp ? (
                        <View style={styles.placedItemAnchor}>
                          <View style={styles.placedItemHalo}>
                            <ObjectComp size={50} />
                          </View>
                          <View style={[styles.itemNameTag, { backgroundColor: matchedPlacement.object.themeColor }]}>
                            <Typography size="xs" weight="bold" color="#FFFFFF">
                              {matchedPlacement.object.name}
                            </Typography>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.emptyFurnitureTag}>
                          <Typography size="xs" color="#94A3B8">
                            (Empty)
                          </Typography>
                        </View>
                      )}
                    </View>
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
              {t('i_remember_btn') || "I'm Ready! Answer Questions 🎯"}
            </Typography>
          </TouchableOpacity>
        </View>
      )}

      {/* 3. Phase 2: Recall Flow with Interactive Big Picture */}
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

          {/* Interactive Living Room Big Picture */}
          <View style={[styles.bigPictureFrame, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFDF7' }]}>
            <View style={styles.roomSceneHeader}>
              <Typography size="xs" weight="bold" color="#4F46E5">
                🏡 TAP THE SPOT ON THE ROOM PICTURE:
              </Typography>
            </View>

            <View style={styles.roomFurnitureGrid}>
              {activeSlots.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                const isSlotWrong = wrongSlotId === slot.id;
                const isSlotCorrect = isSelected && targetPlacement?.location.id === slot.id;
                const isAlreadySolved = solvedPlacements.includes(
                  placements.find((p) => p.location.id === slot.id)?.object.id || ''
                );

                let cardBg = isHc ? '#1E293B' : slot.cardBg;
                let borderColor = isHc ? COLORS.hcBorder : slot.borderColor;

                if (isSlotCorrect || isAlreadySolved) {
                  cardBg = '#DCFCE7';
                  borderColor = '#16A34A';
                } else if (isSlotWrong) {
                  cardBg = '#FEE2E2';
                  borderColor = '#DC2626';
                }

                const matchedPlacement = placements.find((p) => p.location.id === slot.id);
                const SolvedComp = (isAlreadySolved || isSlotCorrect) && matchedPlacement ? matchedPlacement.object.component : null;
                const FurnitureComp = slot.component;

                return (
                  <TouchableOpacity
                    key={slot.id}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${slot.name}`}
                    onPress={() => handleSelectLocation(slot)}
                    style={[
                      styles.furnitureCard,
                      {
                        backgroundColor: cardBg,
                        borderColor: borderColor,
                        borderWidth: isSelected || isSlotWrong || isAlreadySolved ? 3 : 1.8,
                      },
                    ]}
                  >
                    {/* Location Badge */}
                    <View
                      style={[
                        styles.locationBadge,
                        {
                          backgroundColor: isSlotCorrect || isAlreadySolved ? '#16A34A' : isSlotWrong ? '#DC2626' : slot.color,
                        },
                      ]}
                    >
                      <Typography size="xs" weight="bold" color="#FFFFFF">
                        {slot.iconLabel} {slot.name}
                      </Typography>
                    </View>

                    {/* Furniture Stage with Interactive Prompt Anchor */}
                    <View style={styles.furnitureStage}>
                      <FurnitureComp size={76} />

                      {/* Display Solved Object OR Tap Question Hotspot */}
                      {SolvedComp && matchedPlacement ? (
                        <View style={styles.placedItemAnchor}>
                          <View style={styles.placedItemHalo}>
                            <SolvedComp size={50} />
                          </View>
                          <View style={[styles.solvedBadge]}>
                            <CheckCircle2 size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                            <Typography size="xs" weight="bold" color="#FFFFFF">
                              {matchedPlacement.object.name}
                            </Typography>
                          </View>
                        </View>
                      ) : isSlotWrong ? (
                        <View style={styles.wrongSpotAnchor}>
                          <XCircle size={36} color="#DC2626" />
                        </View>
                      ) : (
                        <View style={styles.tapTargetSpotAnchor}>
                          <View style={styles.tapTargetCircle}>
                            <MapPin size={22} color={slot.color} />
                          </View>
                          <Typography size="xs" weight="bold" color="#64748B" style={{ marginTop: 2 }}>
                            Tap Here
                          </Typography>
                        </View>
                      )}
                    </View>
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
                {t('try_another_spot') || 'Not here! Look at the room and tap another spot.'}
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
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0D9488',
  },
  bigPictureFrame: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  roomSceneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
    paddingBottom: SPACING.xs,
    marginBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  roomFurnitureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  furnitureCard: {
    width: '48%',
    borderRadius: 8,
    padding: 6,
    minHeight: 145,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  locationBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  furnitureStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 4,
  },
  placedItemAnchor: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 2,
  },
  placedItemHalo: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    elevation: 3,
  },
  itemNameTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    elevation: 2,
  },
  solvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  emptyFurnitureTag: {
    position: 'absolute',
    bottom: 4,
  },
  tapTargetSpotAnchor: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapTargetCircle: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#94A3B8',
    elevation: 2,
  },
  wrongSpotAnchor: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyPrimaryBtn: {
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: SPACING.md,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: SPACING.sm,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
});
