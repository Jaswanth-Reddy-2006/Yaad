import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Volume2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LogOut,
  RotateCcw,
} from 'lucide-react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Typography } from '../../../components/common/Typography';
import { ListenButton } from '../../../components/common/ListenButton';
import { GameResultModal, LeaveGameModal } from '../../../components/games/GameResultModal';
import {
  DogIllustration,
  CatIllustration,
  CowIllustration,
  ChickenIllustration,
  GoatIllustration,
  HorseIllustration,
  ElephantIllustration,
  LionIllustration,
  FrogIllustration,
  BirdIllustration,
} from '../../../components/illustrations';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';
import { voiceService } from '../../../services/VoiceService';
import { animalAudioService } from '../../../services/AnimalAudioService';
import { GameResult } from '../../../types';
import { gameRepository } from '../../../repositories/GameRepository';

interface AnimalItem {
  id: string;
  name: string;
  soundText: string;
  component: React.ComponentType<{ size?: number }>;
  cardBg: string;
  borderColor: string;
  accentColor: string;
}

const ALL_ANIMALS: AnimalItem[] = [
  {
    id: 'dog',
    name: 'Dog',
    soundText: '🐶 Bark',
    component: DogIllustration,
    cardBg: '#FFF7ED',
    borderColor: '#FFEDD5',
    accentColor: '#EA580C',
  },
  {
    id: 'cat',
    name: 'Cat',
    soundText: '🐱 Meow',
    component: CatIllustration,
    cardBg: '#FEFCE8',
    borderColor: '#FEF08A',
    accentColor: '#CA8A04',
  },
  {
    id: 'cow',
    name: 'Cow',
    soundText: '🐮 Moo',
    component: CowIllustration,
    cardBg: '#FFF1F2',
    borderColor: '#FFE4E6',
    accentColor: '#E11D48',
  },
  {
    id: 'chicken',
    name: 'Chicken',
    soundText: '🐔 Cluck / Crow',
    component: ChickenIllustration,
    cardBg: '#FFFBEB',
    borderColor: '#FDE68A',
    accentColor: '#D97706',
  },
  {
    id: 'goat',
    name: 'Goat',
    soundText: '🐐 Bleat',
    component: GoatIllustration,
    cardBg: '#F8FAFC',
    borderColor: '#E2E8F0',
    accentColor: '#475569',
  },
  {
    id: 'horse',
    name: 'Horse',
    soundText: '🐴 Neigh',
    component: HorseIllustration,
    cardBg: '#FFF7ED',
    borderColor: '#FED7AA',
    accentColor: '#C2410C',
  },
  {
    id: 'elephant',
    name: 'Elephant',
    soundText: '🐘 Trumpet',
    component: ElephantIllustration,
    cardBg: '#F1F5F9',
    borderColor: '#CBD5E1',
    accentColor: '#475569',
  },
  {
    id: 'lion',
    name: 'Lion',
    soundText: '🦁 Roar',
    component: LionIllustration,
    cardBg: '#FFFBEB',
    borderColor: '#FDE68A',
    accentColor: '#D97706',
  },
  {
    id: 'frog',
    name: 'Frog',
    soundText: '🐸 Croak',
    component: FrogIllustration,
    cardBg: '#F0FDF4',
    borderColor: '#BBF7D0',
    accentColor: '#15803D',
  },
  {
    id: 'bird',
    name: 'Bird',
    soundText: '🐦 Chirp',
    component: BirdIllustration,
    cardBg: '#F0F9FF',
    borderColor: '#E0F2FE',
    accentColor: '#0284C7',
  },
];

interface LevelConfig {
  level: number;
  animalCount: number;
  cols: number;
  label: string;
}

const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: { level: 1, animalCount: 2, cols: 2, label: 'Level 1 • 2 Animals' },
  2: { level: 2, animalCount: 3, cols: 3, label: 'Level 2 • 3 Animals' },
  3: { level: 3, animalCount: 4, cols: 2, label: 'Level 3 • 4 Animals' },
  4: { level: 4, animalCount: 4, cols: 2, label: 'Level 4 • 4 Animals' },
};

export default function AnimalSoundsGameScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;
  const { width: windowWidth } = useWindowDimensions();

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [targetAnimal, setTargetAnimal] = useState<AnimalItem>(ALL_ANIMALS[0]);
  const [choices, setChoices] = useState<AnimalItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const activeLevelConfig = LEVEL_CONFIGS[currentLevel] || LEVEL_CONFIGS[1];

  const playAnimalSound = (animal: AnimalItem) => {
    setIsPlayingSound(true);
    animalAudioService.playAnimalSound(animal.id);
    setTimeout(() => {
      setIsPlayingSound(false);
    }, 2200);
  };

  const initRound = (lvl: number) => {
    const config = LEVEL_CONFIGS[lvl] || LEVEL_CONFIGS[1];

    // Pick random target animal and distractors
    const shuffled = [...ALL_ANIMALS].sort(() => Math.random() - 0.5);
    const target = shuffled[0];
    const distractors = shuffled.slice(1, config.animalCount);
    const roundChoices = [target, ...distractors].sort(() => Math.random() - 0.5);

    setTargetAnimal(target);
    setChoices(roundChoices);
    setSelectedId(null);
    setWrongId(null);
    setIsWrong(false);
    setGameResult(null);
    startTimeRef.current = Date.now();

    // Automatically play animal sound on round start
    setTimeout(() => {
      playAnimalSound(target);
    }, 400);
  };

  useEffect(() => {
    initRound(currentLevel);
    return () => {
      animalAudioService.stop();
    };
  }, [currentLevel]);

  const handleAnimalPress = (animal: AnimalItem) => {
    if (gameResult) return;

    if (isWrong) {
      setIsWrong(false);
      setWrongId(null);
    }

    setSelectedId(animal.id);

    if (animal.id === targetAnimal.id) {
      // Correct animal selected!
      voiceService.speak(`That's right! The ${targetAnimal.name} made that sound.`);
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
      // Wrong animal!
      setWrongId(animal.id);
      setIsWrong(true);
      voiceService.speak(`Not quite. Listen to the sound again and tap the right animal.`);

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
      setCurrentLevel(1);
    }
  };

  // Dimensions
  const contentWidth = Math.min(windowWidth - 32, 420);
  const cols = activeLevelConfig.cols;
  const gap = 12;
  const cardWidth = Math.floor((contentWidth - (cols - 1) * gap) / cols);
  const iconSize = Math.max(48, Math.min(78, cardWidth * 0.58));

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
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#D97706'} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} align="center">
            {t('animal_sounds') || 'Animal Sounds'}
          </Typography>
          <View style={styles.levelPill}>
            <Typography size="xs" weight="bold" color="#D97706">
              {activeLevelConfig.label}
            </Typography>
          </View>
        </View>

        <ListenButton
          textToSpeak={`Animal Sounds. ${activeLevelConfig.label}. Listen to the sound and tap the animal that made it.`}
          size="sm"
          variant="secondary"
        />
      </View>

      {/* Big Sound Player Banner / Button */}
      <View style={styles.soundBannerWrapper}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => playAnimalSound(targetAnimal)}
          style={[
            styles.soundPlayButton,
            { backgroundColor: isPlayingSound ? '#FDE68A' : '#FEF3C7' },
          ]}
        >
          <View style={styles.soundIconCircle}>
            <Volume2 size={32} color="#D97706" strokeWidth={2.5} />
          </View>
          <View style={styles.soundTextCol}>
            <Typography size="base" weight="bold" color="#92400E">
              🔊 Listen to the Sound
            </Typography>
            <Typography size="xs" color="#B45309" style={{ marginTop: 2 }}>
              Tap here to hear it again
            </Typography>
          </View>
          <RotateCcw size={20} color="#D97706" />
        </TouchableOpacity>
      </View>

      {/* Prompt / Error Banner */}
      <View style={styles.promptContainer}>
        {isWrong ? (
          <View style={styles.wrongBanner}>
            <AlertCircle size={22} color="#DC2626" />
            <Typography size="sm" weight="bold" color="#DC2626" style={{ marginLeft: 8 }}>
              Wrong animal, try again!
            </Typography>
          </View>
        ) : (
          <Typography size="base" weight="bold" color="#0F172A" align="center">
            🐾 Which animal made this noise?
          </Typography>
        )}
      </View>

      {/* Animal Choice Grid */}
      <View style={styles.gridContainer}>
        <View style={[styles.grid, { width: contentWidth, gap }]}>
          {choices.map((animal) => {
            const isThisWrong = wrongId === animal.id;
            const isThisCorrect = selectedId === animal.id && animal.id === targetAnimal.id;
            const isSelected = selectedId === animal.id;
            const Illustration = animal.component;

            return (
              <TouchableOpacity
                key={animal.id}
                activeOpacity={0.82}
                onPress={() => handleAnimalPress(animal)}
                style={[
                  styles.animalCard,
                  {
                    width: cardWidth,
                    backgroundColor: isThisWrong
                      ? '#FEE2E2'
                      : isThisCorrect
                      ? '#DCFCE7'
                      : isHc
                      ? COLORS.hcCardBackground
                      : animal.cardBg,
                    borderColor: isThisWrong
                      ? '#DC2626'
                      : isThisCorrect
                      ? '#16A34A'
                      : isHc
                      ? COLORS.hcBorder
                      : animal.borderColor,
                    borderWidth: isThisWrong || isThisCorrect ? 3.5 : 2,
                  },
                ]}
              >
                <Illustration size={iconSize} />

                <Typography
                  size="base"
                  weight="bold"
                  color={
                    isThisWrong
                      ? '#DC2626'
                      : isThisCorrect
                      ? '#16A34A'
                      : isHc
                      ? COLORS.hcTextPrimary
                      : '#1E293B'
                  }
                  style={{ marginTop: SPACING.xs }}
                >
                  {animal.name}
                </Typography>

                {/* Status Badges */}
                {isThisWrong && (
                  <View style={[styles.cornerBadge, { backgroundColor: '#DC2626' }]}>
                    <XCircle size={20} color="#FFFFFF" />
                  </View>
                )}
                {isThisCorrect && (
                  <View style={[styles.cornerBadge, { backgroundColor: '#16A34A' }]}>
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
      <LeaveGameModal
        visible={showLeaveModal}
        gameTitle="Animal Sounds"
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
    backgroundColor: '#FEF3C7',
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
  soundBannerWrapper: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  soundPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 420,
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FDE68A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  soundIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  soundTextCol: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  promptContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xs,
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
  animalCard: {
    aspectRatio: 0.95,
    borderRadius: 14,
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
  cornerBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    borderRadius: 8,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
});
