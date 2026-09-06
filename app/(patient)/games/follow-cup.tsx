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
  Sparkles,
  Eye,
  Lock,
} from 'lucide-react-native';
import Svg, { Path, Ellipse, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Typography } from '../../../components/common/Typography';
import { ListenButton } from '../../../components/common/ListenButton';
import { GameResultModal, LeaveGameModal } from '../../../components/games/GameResultModal';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';
import { voiceService } from '../../../services/VoiceService';
import { GameResult } from '../../../types';
import { gameRepository } from '../../../repositories/GameRepository';

interface LevelConfig {
  level: number;
  cupCount: number; // 2, 3, or 4
  swapCount: number; // 3, 4, 5, 6
  swapDuration: number; // ms per swap
  label: string;
}

const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: { level: 1, cupCount: 2, swapCount: 3, swapDuration: 750, label: 'Level 1 • 2 Glasses' },
  2: { level: 2, cupCount: 3, swapCount: 4, swapDuration: 700, label: 'Level 2 • 3 Glasses' },
  3: { level: 3, cupCount: 3, swapCount: 5, swapDuration: 600, label: 'Level 3 • 3 Glasses' },
  4: { level: 4, cupCount: 4, swapCount: 6, swapDuration: 550, label: 'Level 4 • 4 Glasses' },
};

type GamePhase = 'REVEAL' | 'COVER' | 'SHUFFLE' | 'PICK' | 'RESULT';

/**
 * Solid 100% Opaque Purple Colored Glass SVG Illustration
 */
const PurpleCupIllustration: React.FC<{ size: number; isLifted?: boolean }> = ({ size = 90, isLifted = false }) => (
  <Svg width={size} height={size * 1.18} viewBox="0 0 100 118">
    <Defs>
      <LinearGradient id="purpleBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#7E22CE" />
        <Stop offset="30%" stopColor="#6B21A8" />
        <Stop offset="70%" stopColor="#581C87" />
        <Stop offset="100%" stopColor="#3B0764" />
      </LinearGradient>
      <LinearGradient id="purpleTop" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#A855F7" />
        <Stop offset="100%" stopColor="#6B21A8" />
      </LinearGradient>
      <LinearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#FDE047" />
        <Stop offset="50%" stopColor="#F59E0B" />
        <Stop offset="100%" stopColor="#D97706" />
      </LinearGradient>
    </Defs>

    {/* Solid 100% Opaque Inverted Purple Glass Body */}
    <Path
      d="M 22 20 L 8 104 C 8 108 92 108 92 104 L 78 20 Z"
      fill="url(#purpleBody)"
      stroke="#3B0764"
      strokeWidth="3.5"
    />

    {/* Elegant Gold Band Rings for Contrast */}
    <Path d="M 16 50 L 84 50" stroke="url(#goldRing)" strokeWidth="4" strokeLinecap="round" />
    <Path d="M 11 82 L 89 82" stroke="url(#goldRing)" strokeWidth="4" strokeLinecap="round" />

    {/* Vibrant Purple Glare Streak on Left */}
    <Path
      d="M 30 26 L 22 98"
      stroke="#C084FC"
      strokeWidth="3.5"
      strokeLinecap="round"
      opacity="0.6"
    />

    {/* Top Base of Inverted Glass */}
    <Ellipse cx="50" cy="20" rx="28" ry="7" fill="url(#purpleTop)" stroke="#3B0764" strokeWidth="2.5" />

    {/* Bottom Rim (Touching Table Surface) */}
    <Ellipse cx="50" cy="104" rx="42" ry="7" fill="#4C1D95" stroke="#3B0764" strokeWidth="3" />
    {/* Golden opening edge is visible ONLY when lifted up */}
    {isLifted && (
      <Ellipse cx="50" cy="104" rx="38" ry="5" fill="none" stroke="url(#goldRing)" strokeWidth="2.5" />
    )}
  </Svg>
);

/**
 * Bright Glowing Golden Ball
 */
const GoldenBallItem: React.FC<{ size: number }> = ({ size = 48 }) => (
  <Svg width={size} height={size} viewBox="0 0 60 60">
    <Defs>
      <LinearGradient id="ballGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FEF08A" />
        <Stop offset="30%" stopColor="#FBBF24" />
        <Stop offset="80%" stopColor="#F59E0B" />
        <Stop offset="100%" stopColor="#D97706" />
      </LinearGradient>
    </Defs>
    {/* Ambient Glow */}
    <Circle cx="30" cy="30" r="28" fill="#FEF3C7" opacity="0.9" />
    {/* Ball Body */}
    <Circle cx="30" cy="30" r="20" fill="url(#ballGrad)" stroke="#B45309" strokeWidth="2.5" />
    {/* Ball Highlight */}
    <Ellipse cx="23" cy="23" rx="5" ry="3" transform="rotate(-30 23 23)" fill="#FFFFFF" opacity="0.8" />
    {/* Center Star Sparkle */}
    <Path
      d="M 30 18 L 32 25 L 39 27 L 33 32 L 35 39 L 30 35 L 25 39 L 27 32 L 21 27 L 28 25 Z"
      fill="#FFFFFF"
    />
  </Svg>
);

interface CupItemState {
  id: number;
  slot: number;
  isWinner: boolean;
}

export default function FollowTheCupGameScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;
  const { width: windowWidth } = useWindowDimensions();

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [phase, setPhase] = useState<GamePhase>('REVEAL');
  const [cups, setCups] = useState<CupItemState[]>([]);
  const [selectedCupId, setSelectedCupId] = useState<number | null>(null);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  const activeConfig = LEVEL_CONFIGS[currentLevel] || LEVEL_CONFIGS[1];
  const cupCount = activeConfig.cupCount;

  // Responsive dimension math
  const contentWidth = Math.min(windowWidth - 32, 440);
  const stageWidth = contentWidth - 24;
  const slotWidth = stageWidth / cupCount;
  const cupSize = Math.max(64, Math.min(92, slotWidth - 12));
  const ballSize = Math.floor(cupSize * 0.52);

  const getSlotX = (slotIndex: number) => {
    return slotIndex * slotWidth + (slotWidth - cupSize) / 2;
  };

  // Animated values for each cup (0, 1, 2, 3)
  const posAnims = useRef<Animated.Value[]>([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const liftAnims = useRef<Animated.Value[]>([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const scaleAnims = useRef<Animated.Value[]>([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  const isMountedRef = useRef<boolean>(true);
  const startTimeRef = useRef<number>(Date.now());

  // Initialize round: 1. Show Ball at beginning -> 2. Lower Dark Glass to Hide it -> 3. Shuffle Glasses -> 4. Guess
  const initRound = (lvl: number) => {
    const config = LEVEL_CONFIGS[lvl] || LEVEL_CONFIGS[1];
    const winningCupIndex = Math.floor(Math.random() * config.cupCount);

    const initialCups: CupItemState[] = [];
    for (let i = 0; i < config.cupCount; i++) {
      initialCups.push({
        id: i,
        slot: i,
        isWinner: i === winningCupIndex,
      });

      posAnims[i].setValue(getSlotX(i));
      liftAnims[i].setValue(0);
      scaleAnims[i].setValue(1);
    }

    setCups(initialCups);
    setSelectedCupId(null);
    setIsWrong(false);
    setGameResult(null);
    setPhase('REVEAL');
    startTimeRef.current = Date.now();

    // Step 1 (REVEAL): Smoothly lift the winning purple glass to show the ball clearly
    Animated.spring(liftAnims[winningCupIndex], {
      toValue: -80,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    voiceService.speak('Look at the ball! Watch it get covered.');

    // Step 2 (COVER): After 2.4s, smoothly lower the glass to completely hide the ball
    setTimeout(() => {
      if (!isMountedRef.current) return;

      setPhase('COVER');

      Animated.timing(liftAnims[winningCupIndex], {
        toValue: 0,
        duration: 500,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        // Pause 500ms after covering, then start sliding the glasses
        setTimeout(() => {
          if (!isMountedRef.current) return;
          startShuffleProcess(config, initialCups);
        }, 500);
      });
    }, 2400);
  };

  // Step 3 (SHUFFLE): Slide glasses horizontally across positions
  const startShuffleProcess = (config: LevelConfig, currentCups: CupItemState[]) => {
    setPhase('SHUFFLE');
    voiceService.speak('Follow the glass as it moves!');

    let stateCups = [...currentCups];
    let swapsDone = 0;

    const executeSwap = () => {
      if (swapsDone >= config.swapCount || !isMountedRef.current) {
        // Step 4 (PICK): Stop and ask the user to guess
        setPhase('PICK');
        voiceService.speak('Where is the ball? Tap the glass to guess!');
        return;
      }

      // Pick two distinct cups to swap slots
      const idxA = Math.floor(Math.random() * config.cupCount);
      let idxB = Math.floor(Math.random() * config.cupCount);
      while (idxB === idxA) {
        idxB = Math.floor(Math.random() * config.cupCount);
      }

      const cupA = stateCups[idxA];
      const cupB = stateCups[idxB];

      const newSlotA = cupB.slot;
      const newSlotB = cupA.slot;

      const newXA = getSlotX(newSlotA);
      const newXB = getSlotX(newSlotB);

      // Smooth horizontal sliding animations
      Animated.parallel([
        // Cup A slides to Slot B (slides slightly forward with scale)
        Animated.timing(posAnims[cupA.id], {
          toValue: newXA,
          duration: config.swapDuration,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scaleAnims[cupA.id], {
            toValue: 1.08,
            duration: config.swapDuration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnims[cupA.id], {
            toValue: 1,
            duration: config.swapDuration / 2,
            useNativeDriver: true,
          }),
        ]),

        // Cup B slides to Slot A (slides slightly behind)
        Animated.timing(posAnims[cupB.id], {
          toValue: newXB,
          duration: config.swapDuration,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scaleAnims[cupB.id], {
            toValue: 0.94,
            duration: config.swapDuration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnims[cupB.id], {
            toValue: 1,
            duration: config.swapDuration / 2,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Update slot state
        cupA.slot = newSlotA;
        cupB.slot = newSlotB;
        swapsDone++;
        setTimeout(executeSwap, 120);
      });
    };

    setTimeout(executeSwap, 350);
  };

  useEffect(() => {
    isMountedRef.current = true;
    initRound(currentLevel);
    return () => {
      isMountedRef.current = false;
    };
  }, [currentLevel]);

  // Step 5 (GUESS & RESULT)
  const handleCupPress = (cup: CupItemState) => {
    if (phase !== 'PICK' || selectedCupId !== null) return;

    setSelectedCupId(cup.id);
    setPhase('RESULT');

    // Lift chosen glass
    Animated.spring(liftAnims[cup.id], {
      toValue: -80,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    if (cup.isWinner) {
      // Correct glass!
      setIsWrong(false);
      voiceService.speak('You found the ball! Wonderful focus!');
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
      // Wrong glass!
      setIsWrong(true);
      voiceService.speak('Not under this glass. Look where it was!');

      // Lift the actual winning glass so patient sees the ball
      const winningCup = cups.find((c) => c.isWinner);
      if (winningCup) {
        setTimeout(() => {
          if (isMountedRef.current) {
            Animated.spring(liftAnims[winningCup.id], {
              toValue: -80,
              friction: 6,
              tension: 40,
              useNativeDriver: true,
            }).start();
          }
        }, 550);
      }

      // Automatically restart round after viewing
      setTimeout(() => {
        if (isMountedRef.current) {
          initRound(currentLevel);
        }
      }, 2800);
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
      {/* Top Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          accessibilityLabel={t('go_back') || 'Go Back'}
          accessibilityRole="button"
          onPress={() => setShowLeaveModal(true)}
          style={[styles.backSquareBtn, { backgroundColor: isHc ? '#1E293B' : '#FFFFFF' }]}
        >
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#6B21A8'} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} align="center">
            {t('follow_the_cup') || 'Follow the Glass'}
          </Typography>
          <View style={styles.levelPill}>
            <Typography size="xs" weight="bold" color="#6B21A8">
              {activeConfig.label}
            </Typography>
          </View>
        </View>

        <ListenButton
          textToSpeak={`Follow the Glass. ${activeConfig.label}. Watch where the ball is placed, follow the glasses as they move, and guess where it is.`}
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
              Not this glass! Look where it was.
            </Typography>
          </View>
        ) : phase === 'REVEAL' ? (
          <View style={styles.phasePill}>
            <Eye size={18} color="#6B21A8" style={{ marginRight: 6 }} />
            <Typography size="sm" weight="bold" color="#6B21A8">
              👀 Look at the ball! It is under this glass.
            </Typography>
          </View>
        ) : phase === 'COVER' ? (
          <View style={[styles.phasePill, { backgroundColor: '#F3E8FF', borderColor: '#E9D5FF' }]}>
            <Lock size={18} color="#6B21A8" style={{ marginRight: 6 }} />
            <Typography size="sm" weight="bold" color="#6B21A8">
              🔒 Glass lowered! Get ready...
            </Typography>
          </View>
        ) : phase === 'SHUFFLE' ? (
          <View style={[styles.phasePill, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
            <Sparkles size={18} color="#D97706" style={{ marginRight: 6 }} />
            <Typography size="sm" weight="bold" color="#B45309">
              🔀 Shuffling the glasses... Keep your eyes on it!
            </Typography>
          </View>
        ) : (
          <Typography size="base" weight="bold" color="#0F172A" align="center">
            🌟 Where is the ball? Tap the glass!
          </Typography>
        )}
      </View>

      {/* Table Stage Area */}
      <View style={styles.stageWrapper}>
        <View style={[styles.tableSurface, { width: contentWidth }]}>
          {/* Track for sliding dark glasses */}
          <View style={[styles.cupsTrack, { width: stageWidth }]}>
            {cups.map((cup) => {
              const isSelected = selectedCupId === cup.id;
              const isCorrect = isSelected && cup.isWinner;
              const isWrongChoice = isSelected && !cup.isWinner;

              const isCupLifted =
                (phase === 'REVEAL' && cup.isWinner) ||
                (phase === 'RESULT' && (selectedCupId === cup.id || (isWrong && cup.isWinner)));

              return (
                <Animated.View
                  key={`cup-${cup.id}`}
                  style={[
                    styles.animatedCupWrapper,
                    {
                      width: cupSize,
                      transform: [
                        { translateX: posAnims[cup.id] },
                        { scale: scaleAnims[cup.id] },
                      ],
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.88}
                    disabled={phase !== 'PICK'}
                    onPress={() => handleCupPress(cup)}
                    style={styles.cupTouchTarget}
                  >
                    {/* The Golden Ball sits directly on the table inside the winning cup */}
                    {cup.isWinner && (
                      <View style={styles.ballAnchor}>
                        <GoldenBallItem size={ballSize} />
                      </View>
                    )}

                    {/* The Opaque Purple Glass sits directly on top of the ball and completely encloses it */}
                    <Animated.View
                      style={[
                        styles.cupGraphicContainer,
                        {
                          transform: [{ translateY: liftAnims[cup.id] }],
                        },
                      ]}
                    >
                      <PurpleCupIllustration size={cupSize} isLifted={isCupLifted} />
                    </Animated.View>

                    {/* Result Badges */}
                    {isCorrect && (
                      <View style={[styles.resultBadge, { backgroundColor: '#16A34A' }]}>
                        <CheckCircle2 size={24} color="#FFFFFF" />
                      </View>
                    )}
                    {isWrongChoice && (
                      <View style={[styles.resultBadge, { backgroundColor: '#DC2626' }]}>
                        <XCircle size={24} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {/* Wooden Table Edge / Base Line */}
          <View style={styles.tableWoodBase} />
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
      <LeaveGameModal
        visible={showLeaveModal}
        gameTitle="Follow the Cup"
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={() => {
          setShowLeaveModal(false);
          router.replace('/(patient)/games');
        }}
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  levelPill: {
    backgroundColor: '#F1F5F9',
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
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  stageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  tableSurface: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingTop: 90,
    paddingBottom: SPACING.md,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
  },
  cupsTrack: {
    height: 140,
    position: 'relative',
  },
  animatedCupWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 140,
  },
  cupTouchTarget: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  ballAnchor: {
    position: 'absolute',
    bottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  cupGraphicContainer: {
    zIndex: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableWoodBase: {
    width: '100%',
    height: 8,
    backgroundColor: '#CBD5E1',
    borderRadius: 4,
    marginTop: 4,
  },
  resultBadge: {
    position: 'absolute',
    top: -16,
    alignSelf: 'center',
    borderRadius: 10,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 20,
  },
});
