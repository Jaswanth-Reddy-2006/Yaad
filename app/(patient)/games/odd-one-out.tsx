import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, LogOut } from 'lucide-react-native';
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

interface SymbolConfig {
  id: string;
  name: string;
  component: React.ComponentType<{ size?: number }>;
  cardBg: string;
  borderColor: string;
}

const AVAILABLE_SYMBOLS: SymbolConfig[] = [
  { id: 'apple', name: 'Apple', component: AppleIllustration, cardBg: '#FEF2F2', borderColor: '#FECDD3' },
  { id: 'banana', name: 'Banana', component: BananaIllustration, cardBg: '#FEFCE8', borderColor: '#FEF08A' },
  { id: 'mango', name: 'Mango', component: MangoIllustration, cardBg: '#FFF7ED', borderColor: '#FFEDD5' },
  { id: 'flower', name: 'Flower', component: FlowerIllustration, cardBg: '#FDF2F8', borderColor: '#FCE7F3' },
  { id: 'cup', name: 'Tea Cup', component: CupIllustration, cardBg: '#FFFBEB', borderColor: '#FDE68A' },
  { id: 'umbrella', name: 'Umbrella', component: UmbrellaIllustration, cardBg: '#F0F9FF', borderColor: '#E0F2FE' },
  { id: 'bicycle', name: 'Bicycle', component: BicycleIllustration, cardBg: '#F0FDF4', borderColor: '#DCFCE7' },
  { id: 'house', name: 'House', component: HouseIllustration, cardBg: '#FFF1F2', borderColor: '#FFE4E6' },
  { id: 'radio', name: 'Radio', component: RadioIllustration, cardBg: '#FEF3C7', borderColor: '#FDE68A' },
  { id: 'glasses', name: 'Glasses', component: GlassesIllustration, cardBg: '#EEF2FF', borderColor: '#E0E7FF' },
];

interface LevelConfig {
  level: number;
  totalCards: number; // e.g. 4, 6, 8, 12
  cols: number;
  label: string;
}

const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: { level: 1, totalCards: 4, cols: 2, label: 'Level 1 • 4 Pictures' },
  2: { level: 2, totalCards: 6, cols: 3, label: 'Level 2 • 6 Pictures' },
  3: { level: 3, totalCards: 8, cols: 4, label: 'Level 3 • 8 Pictures' },
  4: { level: 4, totalCards: 12, cols: 4, label: 'Level 4 • 12 Pictures' },
};

interface GridCard {
  id: string;
  symbolId: string;
  isOdd: boolean;
}

export default function OddOneOutGameScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;
  const { width: windowWidth } = useWindowDimensions();

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [cards, setCards] = useState<GridCard[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const activeLevelConfig = LEVEL_CONFIGS[currentLevel] || LEVEL_CONFIGS[1];

  const initLevel = (lvlNum: number) => {
    const config = LEVEL_CONFIGS[lvlNum] || LEVEL_CONFIGS[1];
    
    // Pick two random distinct symbols
    const shuffledSymbols = [...AVAILABLE_SYMBOLS].sort(() => Math.random() - 0.5);
    const mainSymbol = shuffledSymbols[0];
    const oddSymbol = shuffledSymbols[1];

    const newCards: GridCard[] = [];
    const oddIndex = Math.floor(Math.random() * config.totalCards);

    for (let i = 0; i < config.totalCards; i++) {
      if (i === oddIndex) {
        newCards.push({
          id: `card-${i}-${oddSymbol.id}`,
          symbolId: oddSymbol.id,
          isOdd: true,
        });
      } else {
        newCards.push({
          id: `card-${i}-${mainSymbol.id}`,
          symbolId: mainSymbol.id,
          isOdd: false,
        });
      }
    }

    setCards(newCards);
    setSelectedId(null);
    setWrongId(null);
    setIsWrong(false);
    setGameResult(null);
    startTimeRef.current = Date.now();
  };

  useEffect(() => {
    initLevel(currentLevel);
  }, [currentLevel]);

  const handleCardPress = (card: GridCard) => {
    if (gameResult) return;

    if (isWrong) {
      setIsWrong(false);
      setWrongId(null);
    }

    setSelectedId(card.id);

    if (card.isOdd) {
      // Correct answer!
      voiceService.speak('Great job! That picture is different.');
      const elapsedSecs = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      const score = 500 + Math.max(0, 30 - elapsedSecs) * 20;

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

      setGameResult(fallbackResult);
    } else {
      // Wrong selection!
      setWrongId(card.id);
      setIsWrong(true);
      voiceService.speak('That is the same picture. Find the one that is different!');

      setTimeout(() => {
        setIsWrong(false);
        setWrongId(null);
        setSelectedId(null);
      }, 1600);
    }
  };

  const handleNextLevel = () => {
    setGameResult(null);
    if (currentLevel < 4) {
      setCurrentLevel((prev) => prev + 1);
    } else {
      // Reset to level 1 on final completion
      setCurrentLevel(1);
    }
  };

  const getSymbol = (symbolId: string) => {
    return AVAILABLE_SYMBOLS.find((s) => s.id === symbolId) || AVAILABLE_SYMBOLS[0];
  };

  // Card dimension math
  const contentWidth = Math.min(windowWidth - 32, 440);
  const cols = activeLevelConfig.cols;
  const gap = 10;
  const cardWidth = Math.floor((contentWidth - (cols - 1) * gap) / cols);
  const iconSize = Math.max(38, Math.min(68, cardWidth * 0.65));

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
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#EF4444'} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} align="center">
            {t('odd_one_out') || 'Odd One Out'}
          </Typography>
          <View style={styles.levelPill}>
            <Typography size="xs" weight="bold" color="#EF4444">
              {activeLevelConfig.label}
            </Typography>
          </View>
        </View>

        <ListenButton
          textToSpeak={`Odd One Out. ${activeLevelConfig.label}. Look closely at the pictures and tap the one that is different.`}
          size="sm"
          variant="secondary"
        />
      </View>

      {/* Prompt / Error Banner */}
      <View style={styles.promptContainer}>
        {isWrong ? (
          <View style={styles.wrongBanner}>
            <AlertCircle size={22} color="#DC2626" />
            <Typography size="sm" weight="bold" color="#DC2626" style={{ marginLeft: 8 }}>
              Wrong picture, try again!
            </Typography>
          </View>
        ) : (
          <Typography size="base" weight="bold" color="#0F172A" align="center">
            🔍 Which picture is different? Tap it!
          </Typography>
        )}
      </View>

      {/* Cards Grid */}
      <View style={styles.gridContainer}>
        <View style={[styles.grid, { width: contentWidth, gap }]}>
          {cards.map((card) => {
            const sym = getSymbol(card.symbolId);
            const Illustration = sym.component;
            const isThisWrong = wrongId === card.id;
            const isThisSelected = selectedId === card.id;

            return (
              <TouchableOpacity
                key={card.id}
                activeOpacity={0.8}
                onPress={() => handleCardPress(card)}
                style={[
                  styles.cardTile,
                  {
                    width: cardWidth,
                    backgroundColor: isThisWrong
                      ? '#FEE2E2'
                      : isThisSelected && card.isOdd
                      ? '#DCFCE7'
                      : isHc
                      ? COLORS.hcCardBackground
                      : sym.cardBg,
                    borderColor: isThisWrong
                      ? '#DC2626'
                      : isThisSelected && card.isOdd
                      ? '#16A34A'
                      : isHc
                      ? COLORS.hcBorder
                      : sym.borderColor,
                    borderWidth: isThisWrong || isThisSelected ? 3.5 : 2,
                  },
                ]}
              >
                <Illustration size={iconSize} />

                {isThisWrong && (
                  <View style={[styles.badge, { backgroundColor: '#DC2626' }]}>
                    <XCircle size={20} color="#FFFFFF" />
                  </View>
                )}

                {isThisSelected && card.isOdd && (
                  <View style={[styles.badge, { backgroundColor: '#16A34A' }]}>
                    <CheckCircle2 size={20} color="#FFFFFF" />
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
    backgroundColor: '#FFE4E6',
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
  gridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTile: {
    aspectRatio: 0.95,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    borderRadius: RADIUS.full,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
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
