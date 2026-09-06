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
import Svg, { Path, Ellipse, Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';
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
  swapCount: number; // e.g. 3, 4, 5, 6
  swapDuration: number; // ms per swap
  label: string;
}

const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: { level: 1, cupCount: 2, swapCount: 3, swapDuration: 750, label: 'Level 1 • 2 Cups' },
  2: { level: 2, cupCount: 3, swapCount: 4, swapDuration: 700, label: 'Level 2 • 3 Cups' },
  3: { level: 3, cupCount: 3, swapCount: 5, swapDuration: 600, label: 'Level 3 • 3 Cups' },
  4: { level: 4, cupCount: 4, swapCount: 6, swapDuration: 550, label: 'Level 4 • 4 Cups' },
};

type GamePhase = 'REVEAL' | 'SHUFFLE' | 'PICK' | 'RESULT';

/**
 * Ceramic / Metallic Cup SVG Illustration
 */
const CupIllustrationItem: React.FC<{ size: number; isLifted?: boolean; colorGrad?: string }> = ({
  size = 90,
  isLifted = false,
}) => (
  <Svg width={size} height={size * 1.15} viewBox="0 0 100 115">
    <Defs>
      <LinearGradient id="cupBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#8B5CF6" />
        <Stop offset="40%" stopColor="#7C3AED" />
        <Stop offset="100%" stopColor="#5B21B6" />
      </LinearGradient>
      <LinearGradient id="cupRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#C4B5FD" />
        <Stop offset="100%" stopColor="#A78BFA" />
      </LinearGradient>
    </Defs>

    {/* Cup Shadow */}
    <Ellipse cx="50" cy="110" rx="42" ry="5" fill="#000000" opacity={isLifted ? 0.08 : 0.22} />

    {/* Inverted Cup Body (Mouth at bottom, base at top) */}
    <Path
      d="M 22 18 L 10 102 C 10 106 90 106 90 102 L 78 18 Z"
      fill="url(#cupBodyGrad)"
      stroke="#4C1D95"
      strokeWidth="3"
    />

    {/* Shiny Glare Streak */}
    <Path
      d="M 32 24 L 24 96"
      stroke="#DDD6FE"
      strokeWidth="4"
      strokeLinecap="round"
      opacity="0.6"
    />

    {/* Top Base of Inverted Cup */}
    <Ellipse cx="50" cy="18" rx="28" ry="7" fill="url(#cupRimGrad)" stroke="#4C1D95" strokeWidth="2.5" />

    {/* Bottom Rim of Inverted Cup */}
    <Ellipse cx="50" cy="102" rx="40" ry="7" fill="none" stroke="#4C1D95" strokeWidth="2.5" />
  </Svg>
);

/**
 * Golden Star / Ruby Sparkle Object underneath cup
 */
const GoldenStarObject: React.FC<{ size: number }> = ({ size = 54 }) => (
  <Svg width={size} height={size} viewBox="0 0 60 60">
    <Defs>
      <LinearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FEF08A" />
        <Stop offset="50%" stopColor="#F59E0B" />
        <Stop offset="100%" stopColor="#D97706" />
      </LinearGradient>
    </Defs>
    {/* Glow */}
    <Circle cx="30" cy="30" r="26" fill="#FEF3C7" opacity="0.8" />
    <Circle cx="30" cy="30" r="18" fill="url(#goldGrad)" stroke="#B45309" strokeWidth="2" />
    {/* Inner Star */}
    <Path
      d="M 30 14 L 34 24 L 44 26 L 36 33 L 39 43 L 30 38 L 21 43 L 24 33 L 16 26 L 26 24 Z"
      fill="#FFFFFF"
    />
    <Circle cx="26" cy="24" r="2" fill="#FFFFFF" />
  </Svg>
);

export default function FollowTheCupGameScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;
  const { width: windowWidth } = useWindowDimensions();

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [phase, setPhase] = useState<GamePhase>('REVEAL');
  const [targetSlot, setTargetSlot] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  // Positions animation: map slot index to x offset
  const activeLevelConfig = LEVEL_CONFIGS[currentLevel] || LEVEL_CONFIGS[1];
  const cupCount = activeLevelConfig.cupCount;

  // Cup animation refs
  const liftAnims = useRef<Animated.Value[]>([]).current;
  const isMountedRef = useRef<boolean>(true);
  const startTimeRef = useRef<number>(Date.now());

  // Ensure liftAnims array matches cupCount
  while (liftAnims.length < 4) {
    liftAnims.push(new Animated.Value(0));
  }

  const contentWidth = Math.min(windowWidth - 32, 440);
  const cupWidth = Math.floor((contentWidth - (cupCount - 1) * 8) / cupCount);
  const cupSize = Math.max(68, Math.min(100, cupWidth - 4));

  // Initialize round
  const initRound = (lvl: number) => {
    const config = LEVEL_CONFIGS[lvl] || LEVEL_CONFIGS[1];
    const initialTarget = Math.floor(Math.random() * config.cupCount);

    setTargetSlot(initialTarget);
    setSelectedSlot(null);
    setIsWrong(false);
    setGameResult(null);
    setPhase('REVEAL');
    startTimeRef.current = Date.now();

    // Reset all lift animations
    for (let i = 0; i < 4; i++) {
      liftAnims[i].setValue(0);
    }

    // Lift target cup to reveal object
    Animated.spring(liftAnims[initialTarget], {
      toValue: -55,
      useNativeDriver: true,
    }).start();

    voiceService.speak('Watch closely! The golden star is under this cup.');

    // Wait 2.2s, lower the cup, then start shuffling
    setTimeout(() => {
      if (!isMountedRef.current) return;

      Animated.timing(liftAnims[initialTarget], {
        toValue: 0,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        startShuffleSequence(config, initialTarget);
      });
    }, 2200);
  };

  const startShuffleSequence = (config: LevelConfig, currentTarget: number) => {
    setPhase('SHUFFLE');
    voiceService.speak('Follow the cup!');

    let runningTarget = currentTarget;
    let swapsDone = 0;

    const performSwap = () => {
      if (swapsDone >= config.swapCount || !isMountedRef.current) {
        // Shuffling complete!
        setPhase('PICK');
        voiceService.speak('Where is the golden star? Tap the cup!');
        return;
      }

      // Pick two random distinct slots to swap
      const slotA = Math.floor(Math.random() * config.cupCount);
      let slotB = Math.floor(Math.random() * config.cupCount);
      while (slotB === slotA) {
        slotB = Math.floor(Math.random() * config.cupCount);
      }

      // If runningTarget is in slotA, move to slotB, or vice versa
      if (runningTarget === slotA) {
        runningTarget = slotB;
      } else if (runningTarget === slotB) {
        runningTarget = slotA;
      }
      setTargetSlot(runningTarget);

      // Brief hop animation during swap
      Animated.sequence([
        Animated.timing(liftAnims[slotA], {
          toValue: -15,
          duration: config.swapDuration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(liftAnims[slotA], {
          toValue: 0,
          duration: config.swapDuration / 2,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.sequence([
        Animated.timing(liftAnims[slotB], {
          toValue: -15,
          duration: config.swapDuration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(liftAnims[slotB], {
          toValue: 0,
          duration: config.swapDuration / 2,
          useNativeDriver: true,
        }),
      ]).start(() => {
        swapsDone++;
        setTimeout(performSwap, 120);
      });
    };

    setTimeout(performSwap, 400);
  };

  useEffect(() => {
    isMountedRef.current = true;
    initRound(currentLevel);
    return () => {
      isMountedRef.current = false;
    };
  }, [currentLevel]);

  const handleCupTap = (slotIndex: number) => {
    if (phase !== 'PICK' || selectedSlot !== null) return;

    setSelectedSlot(slotIndex);
    setPhase('RESULT');

    // Lift chosen cup
    Animated.spring(liftAnims[slotIndex], {
      toValue: -60,
      useNativeDriver: true,
    }).start();

    if (slotIndex === targetSlot) {
      // Correct!
      setIsWrong(false);
      voiceService.speak('You found the golden star! Great focus!');
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
      // Wrong cup tapped!
      setIsWrong(true);
      voiceService.speak('Not under this cup. Look where it was!');

      // Also reveal the actual winning cup so the patient sees it
      setTimeout(() => {
        if (isMountedRef.current) {
          Animated.spring(liftAnims[targetSlot], {
            toValue: -60,
            useNativeDriver: true,
          }).start();
        }
      }, 600);

      // Reset for retry after delay
      setTimeout(() => {
        if (isMountedRef.current) {
          initRound(currentLevel);
        }
      }, 2600);
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
              {activeLevelConfig.label}
            </Typography>
          </View>
        </View>

        <ListenButton
          textToSpeak={`Follow the Glass. ${activeLevelConfig.label}. Watch closely where the star is hidden, follow the glasses, and tap the right one.`}
          size="sm"
          variant="secondary"
        />
      </View>

      {/* Instructions & Phase Banner */}
      <View style={styles.promptContainer}>
        {isWrong ? (
          <View style={styles.wrongBanner}>
            <AlertCircle size={22} color="#DC2626" />
            <Typography size="sm" weight="bold" color="#DC2626" style={{ marginLeft: 8 }}>
              Not this one! Look where it was.
            </Typography>
          </View>
        ) : phase === 'REVEAL' ? (
          <View style={styles.phasePill}>
            <Eye size={18} color="#7C3AED" style={{ marginRight: 6 }} />
            <Typography size="sm" weight="bold" color="#6D28D9">
              👀 Remember: The star is under this glass!
            </Typography>
          </View>
        ) : phase === 'SHUFFLE' ? (
          <View style={[styles.phasePill, { backgroundColor: '#FEF3C7' }]}>
            <Sparkles size={18} color="#D97706" style={{ marginRight: 6 }} />
            <Typography size="sm" weight="bold" color="#B45309">
              🔀 Shuffling... Keep your eyes on it!
            </Typography>
          </View>
        ) : (
          <Typography size="base" weight="bold" color="#0F172A" align="center">
            🌟 Where is the golden star? Tap the glass!
          </Typography>
        )}
      </View>

      {/* Table Stage with Cups */}
      <View style={styles.stageWrapper}>
        {/* Wooden Table Top Graphic */}
        <View style={[styles.tableSurface, { width: contentWidth }]}>
          {/* Cup Columns */}
          <View style={styles.cupsRow}>
            {Array.from({ length: cupCount }).map((_, index) => {
              const isTarget = index === targetSlot;
              const isSelected = index === selectedSlot;
              const isCorrectSelection = isSelected && isTarget;
              const isWrongSelection = isSelected && !isTarget;

              return (
                <TouchableOpacity
                  key={`cup-slot-${index}`}
                  activeOpacity={0.9}
                  disabled={phase !== 'PICK'}
                  onPress={() => handleCupTap(index)}
                  style={[styles.cupSlot, { width: cupWidth }]}
                >
                  {/* The Golden Object placed underneath */}
                  {isTarget && (
                    <View style={styles.objectUnderneath}>
                      <GoldenStarObject size={cupSize * 0.55} />
                    </View>
                  )}

                  {/* Animated Liftable Cup */}
                  <Animated.View
                    style={{
                      transform: [{ translateY: liftAnims[index] }],
                    }}
                  >
                    <CupIllustrationItem size={cupSize} isLifted={phase === 'REVEAL' && isTarget} />
                  </Animated.View>

                  {/* Badges on Selection */}
                  {isCorrectSelection && (
                    <View style={[styles.resultBadge, { backgroundColor: '#16A34A' }]}>
                      <CheckCircle2 size={22} color="#FFFFFF" />
                    </View>
                  )}
                  {isWrongSelection && (
                    <View style={[styles.resultBadge, { backgroundColor: '#DC2626' }]}>
                      <XCircle size={22} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
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
    marginTop: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  tableSurface: {
    backgroundColor: '#FDF8F6',
    borderBottomWidth: 6,
    borderBottomColor: '#E7E5E4',
    borderRadius: RADIUS.xxl,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.xs,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cupsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
    position: 'relative',
  },
  cupSlot: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    height: 150,
  },
  objectUnderneath: {
    position: 'absolute',
    bottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  resultBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    borderRadius: RADIUS.full,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 10,
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
