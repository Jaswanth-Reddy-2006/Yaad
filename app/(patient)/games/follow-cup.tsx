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
} from 'lucide-react-native';
import Svg, { Path, Ellipse, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Typography } from '../../../components/common/Typography';
import { ListenButton } from '../../../components/common/ListenButton';
import { GameResultModal } from '../../../components/games/GameResultModal';
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

type GamePhase = 'REVEAL' | 'SHUFFLE' | 'PICK' | 'RESULT';

/**
 * Ceramic / Metallic Cup SVG Illustration with opaque body
 */
const CupIllustrationItem: React.FC<{ size: number }> = ({ size = 90 }) => (
  <Svg width={size} height={size * 1.18} viewBox="0 0 100 118">
    <Defs>
      <LinearGradient id="cupBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#9333EA" />
        <Stop offset="35%" stopColor="#7E22CE" />
        <Stop offset="100%" stopColor="#581C87" />
      </LinearGradient>
      <LinearGradient id="cupTopGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#C084FC" />
        <Stop offset="100%" stopColor="#A855F7" />
      </LinearGradient>
      <LinearGradient id="rimShine" x1="0%" y1="0%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#E9D5FF" />
        <Stop offset="100%" stopColor="#A855F7" />
      </LinearGradient>
    </Defs>

    {/* Opaque Inverted Cup Body */}
    <Path
      d="M 22 20 L 8 104 C 8 108 92 108 92 104 L 78 20 Z"
      fill="url(#cupBodyGrad)"
      stroke="#3B0764"
      strokeWidth="3"
    />

    {/* Elegant Golden Band Accents */}
    <Path d="M 17 48 L 83 48" stroke="#F59E0B" strokeWidth="3" opacity="0.85" />
    <Path d="M 12 82 L 88 82" stroke="#F59E0B" strokeWidth="3" opacity="0.85" />

    {/* Shiny Glare Streak on Left */}
    <Path
      d="M 30 26 L 22 98"
      stroke="#F3E8FF"
      strokeWidth="4"
      strokeLinecap="round"
      opacity="0.5"
    />

    {/* Top Base Rim */}
    <Ellipse cx="50" cy="20" rx="28" ry="7" fill="url(#cupTopGrad)" stroke="#3B0764" strokeWidth="2.5" />

    {/* Bottom Rim (Mouth of cup touching table) */}
    <Ellipse cx="50" cy="104" rx="42" ry="7" fill="url(#rimShine)" stroke="#3B0764" strokeWidth="2.5" />
  </Svg>
);

/**
 * Glowing Golden Ball Object that sits underneath cup
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
    <Ellipse cx="23" cy="23" rx="5" ry="3" transform="rotate(-30 23 23)" fill="#FFFFFF" opacity="0.75" />
    {/* Center Star Sparkle */}
    <Path
      d="M 30 18 L 32 25 L 39 27 L 33 32 L 35 39 L 30 35 L 25 39 L 27 32 L 21 27 L 28 25 Z"
      fill="#FFFFFF"
    />
  </Svg>
);

interface CupItemState {
  id: number; // Stable identifier of the cup (0, 1, 2, 3)
  slot: number; // Current slot index it occupies (0, 1, 2, 3)
  isWinner: boolean; // Does this cup hold the ball?
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

  // Helper to get X position for a given slot
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

  // Initialize round
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

      // Place cup at initial X position
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

    // Reveal: Smoothly lift the winning cup to show the ball
    Animated.spring(liftAnims[winningCupIndex], {
      toValue: -70,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    voiceService.speak('Watch closely! The golden ball is under this glass.');

    // Wait 2.2s, lower the cup to cover the ball, then start sliding
    setTimeout(() => {
      if (!isMountedRef.current) return;

      Animated.timing(liftAnims[winningCupIndex], {
        toValue: 0,
        duration: 450,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        startShuffleProcess(config, initialCups);
      });
    }, 2200);
  };

  const startShuffleProcess = (config: LevelConfig, currentCups: CupItemState[]) => {
    setPhase('SHUFFLE');
    voiceService.speak('Follow the glass!');

    let stateCups = [...currentCups];
    let swapsDone = 0;

    const executeSwap = () => {
      if (swapsDone >= config.swapCount || !isMountedRef.current) {
        // Shuffle complete!
        setPhase('PICK');
        voiceService.speak('Where is the golden ball? Tap the glass!');
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

  const handleCupPress = (cup: CupItemState) => {
    if (phase !== 'PICK' || selectedCupId !== null) return;

    setSelectedCupId(cup.id);
    setPhase('RESULT');

    // Lift chosen cup
    Animated.spring(liftAnims[cup.id], {
      toValue: -75,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    if (cup.isWinner) {
      // Correct cup!
      setIsWrong(false);
      voiceService.speak('You found the golden ball! Great focus!');
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
      // Wrong cup!
      setIsWrong(true);
      voiceService.speak('Not under this glass. Look where it was!');

      // Find the winning cup and lift it too so patient sees where the ball was
      const winningCup = cups.find((c) => c.isWinner);
      if (winningCup) {
        setTimeout(() => {
          if (isMountedRef.current) {
            Animated.spring(liftAnims[winningCup.id], {
              toValue: -75,
              friction: 6,
              tension: 40,
              useNativeDriver: true,
            }).start();
          }
        }, 550);
      }

      // Automatically reset for a fresh round after adequate viewing
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
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#7C3AED'} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} align="center">
            {t('follow_the_cup') || 'Follow the Glass'}
          </Typography>
          <View style={styles.levelPill}>
            <Typography size="xs" weight="bold" color="#7C3AED">
              {activeConfig.label}
            </Typography>
          </View>
        </View>

        <ListenButton
          textToSpeak={`Follow the Glass. ${activeConfig.label}. Watch where the ball is placed, follow the glasses as they slide, and guess.`}
          size="sm"
          variant="secondary"
        />
      </View>

      {/* Instructions & Phase Status Banner */}
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
            <Eye size={18} color="#7C3AED" style={{ marginRight: 6 }} />
            <Typography size="sm" weight="bold" color="#6D28D9">
              👀 Watch closely! The ball is under this glass.
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
            🌟 Where is the golden ball? Tap the glass!
          </Typography>
        )}
      </View>

      {/* Table Stage Area */}
      <View style={styles.stageWrapper}>
        <View style={[styles.tableSurface, { width: contentWidth }]}>
          {/* Table Surface Track for sliding cups */}
          <View style={[styles.cupsTrack, { width: stageWidth }]}>
            {cups.map((cup) => {
              const isSelected = selectedCupId === cup.id;
              const isCorrect = isSelected && cup.isWinner;
              const isWrongChoice = isSelected && !cup.isWinner;

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
                    {/* The Golden Ball is anchored inside the winning cup container */}
                    {cup.isWinner && (
                      <View style={styles.ballAnchor}>
                        <GoldenBallItem size={ballSize} />
                      </View>
                    )}

                    {/* The Cup sits directly on top of the ball. When down, it completely hides it! */}
                    <Animated.View
                      style={[
                        styles.cupGraphicContainer,
                        {
                          transform: [{ translateY: liftAnims[cup.id] }],
                        },
                      ]}
                    >
                      <CupIllustrationItem size={cupSize} />
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
    backgroundColor: '#EDE9FE',
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
    borderRadius: RADIUS.full,
  },
  phasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
  },
  stageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  tableSurface: {
    backgroundColor: '#FAF5FF',
    borderRadius: RADIUS.xxl,
    paddingTop: 80,
    paddingBottom: SPACING.md,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#E9D5FF',
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
    backgroundColor: '#DDD6FE',
    borderRadius: RADIUS.full,
    marginTop: 4,
  },
  resultBadge: {
    position: 'absolute',
    top: -16,
    alignSelf: 'center',
    borderRadius: RADIUS.full,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 20,
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
