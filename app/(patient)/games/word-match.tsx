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
import { GameResultModal, LeaveGameModal } from '../../../components/games/GameResultModal';
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

interface ObjectItem {
  id: string;
  name: string;
  speechName: string;
  component: React.ComponentType<{ size?: number }>;
  cardBg: string;
  borderColor: string;
  accentColor: string;
}

const ALL_OBJECTS: ObjectItem[] = [
  { id: 'apple', name: 'Apple', speechName: 'an Apple', component: AppleIllustration, cardBg: '#FEF2F2', borderColor: '#FECDD3', accentColor: '#DC2626' },
  { id: 'banana', name: 'Banana', speechName: 'a Banana', component: BananaIllustration, cardBg: '#FEFCE8', borderColor: '#FEF08A', accentColor: '#CA8A04' },
  { id: 'mango', name: 'Mango', speechName: 'a Mango', component: MangoIllustration, cardBg: '#FFF7ED', borderColor: '#FFEDD5', accentColor: '#EA580C' },
  { id: 'flower', name: 'Flower', speechName: 'a Flower', component: FlowerIllustration, cardBg: '#FDF2F8', borderColor: '#FCE7F3', accentColor: '#DB2777' },
  { id: 'cup', name: 'Tea Cup', speechName: 'a Tea Cup', component: CupIllustration, cardBg: '#FFFBEB', borderColor: '#FDE68A', accentColor: '#D97706' },
  { id: 'umbrella', name: 'Umbrella', speechName: 'an Umbrella', component: UmbrellaIllustration, cardBg: '#F0F9FF', borderColor: '#E0F2FE', accentColor: '#0284C7' },
  { id: 'bicycle', name: 'Bicycle', speechName: 'a Bicycle', component: BicycleIllustration, cardBg: '#F0FDF4', borderColor: '#DCFCE7', accentColor: '#16A34A' },
  { id: 'house', name: 'House', speechName: 'a House', component: HouseIllustration, cardBg: '#FFF1F2', borderColor: '#FFE4E6', accentColor: '#E11D48' },
  { id: 'radio', name: 'Radio', speechName: 'a Radio', component: RadioIllustration, cardBg: '#FEF3C7', borderColor: '#FDE68A', accentColor: '#B45309' },
  { id: 'glasses', name: 'Glasses', speechName: 'Glasses', component: GlassesIllustration, cardBg: '#EEF2FF', borderColor: '#E0E7FF', accentColor: '#4F46E5' },
];

interface LevelConfig {
  level: number;
  choiceCount: number;
  label: string;
}

const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: { level: 1, choiceCount: 2, label: 'Level 1 • 2 Choices' },
  2: { level: 2, choiceCount: 3, label: 'Level 2 • 3 Choices' },
  3: { level: 3, choiceCount: 4, label: 'Level 3 • 4 Choices' },
  4: { level: 4, choiceCount: 4, label: 'Level 4 • 4 Choices' },
};

export default function WordMatchGameScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;
  const { width: windowWidth } = useWindowDimensions();

  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [targetObject, setTargetObject] = useState<ObjectItem>(ALL_OBJECTS[0]);
  const [choices, setChoices] = useState<ObjectItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const activeLevelConfig = LEVEL_CONFIGS[currentLevel] || LEVEL_CONFIGS[1];

  const initRound = (lvl: number) => {
    const config = LEVEL_CONFIGS[lvl] || LEVEL_CONFIGS[1];
    
    // Pick random target
    const shuffled = [...ALL_OBJECTS].sort(() => Math.random() - 0.5);
    const target = shuffled[0];
    
    // Pick distractors
    const distractors = shuffled.slice(1, config.choiceCount);
    const roundChoices = [target, ...distractors].sort(() => Math.random() - 0.5);

    setTargetObject(target);
    setChoices(roundChoices);
    setSelectedId(null);
    setWrongId(null);
    setIsWrong(false);
    setGameResult(null);
    startTimeRef.current = Date.now();
  };

  useEffect(() => {
    initRound(currentLevel);
  }, [currentLevel]);

  const handleChoicePress = (choice: ObjectItem) => {
    if (gameResult) return;

    if (isWrong) {
      setIsWrong(false);
      setWrongId(null);
    }

    setSelectedId(choice.id);

    if (choice.id === targetObject.id) {
      // Correct!
      voiceService.speak(`That's right! It is ${targetObject.speechName}.`);
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
      // Wrong choice
      setWrongId(choice.id);
      setIsWrong(true);
      voiceService.speak(`Not quite. Look at the picture and try again!`);

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

  const TargetComponent = targetObject.component;
  const contentWidth = Math.min(windowWidth - 32, 420);
  const targetCardSize = Math.min(contentWidth * 0.65, 220);

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
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#2563EB'} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} align="center">
            {t('name_the_object') || 'Name the Object'}
          </Typography>
          <View style={styles.levelPill}>
            <Typography size="xs" weight="bold" color="#2563EB">
              {activeLevelConfig.label}
            </Typography>
          </View>
        </View>

        <ListenButton
          textToSpeak={`Name the Object. ${activeLevelConfig.label}. Look at the picture and tap the matching word below.`}
          size="sm"
          variant="secondary"
        />
      </View>

      {/* Prompt or Error Banner */}
      <View style={styles.promptContainer}>
        {isWrong ? (
          <View style={styles.wrongBanner}>
            <AlertCircle size={22} color="#DC2626" />
            <Typography size="sm" weight="bold" color="#DC2626" style={{ marginLeft: 8 }}>
              Not quite, try again!
            </Typography>
          </View>
        ) : (
          <Typography size="base" weight="bold" color="#0F172A" align="center">
            🤔 What is this picture called?
          </Typography>
        )}
      </View>

      {/* Big Target Picture Display */}
      <View style={styles.targetDisplayWrapper}>
        <View
          style={[
            styles.targetCard,
            {
              width: targetCardSize,
              height: targetCardSize,
              backgroundColor: isHc ? COLORS.hcCardBackground : targetObject.cardBg,
              borderColor: isHc ? COLORS.hcBorder : targetObject.borderColor,
            },
          ]}
        >
          <TargetComponent size={targetCardSize * 0.72} />
        </View>
      </View>

      {/* Word Choices Column */}
      <View style={styles.choicesContainer}>
        <View style={[styles.choicesStack, { width: contentWidth }]}>
          {choices.map((choice) => {
            const isThisWrong = wrongId === choice.id;
            const isThisCorrect = selectedId === choice.id && choice.id === targetObject.id;
            const isSelected = selectedId === choice.id;

            return (
              <TouchableOpacity
                key={choice.id}
                activeOpacity={0.82}
                onPress={() => handleChoicePress(choice)}
                style={[
                  styles.choiceButton,
                  {
                    backgroundColor: isThisWrong
                      ? '#FEE2E2'
                      : isThisCorrect
                      ? '#DCFCE7'
                      : isHc
                      ? COLORS.hcCardBackground
                      : '#FFFFFF',
                    borderColor: isThisWrong
                      ? '#DC2626'
                      : isThisCorrect
                      ? '#16A34A'
                      : isHc
                      ? COLORS.hcBorder
                      : '#E2E8F0',
                    borderWidth: isThisWrong || isThisCorrect ? 3 : 2,
                  },
                ]}
              >
                <Typography
                  size="lg"
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
                >
                  {t(choice.id) || choice.name}
                </Typography>

                {isThisWrong && <XCircle size={24} color="#DC2626" />}
                {isThisCorrect && <CheckCircle2 size={24} color="#16A34A" />}
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
        gameTitle="Name the Object"
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
    backgroundColor: '#DBEAFE',
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
  targetDisplayWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.sm,
  },
  targetCard: {
    borderRadius: RADIUS.xxl,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  choicesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  choicesStack: {
    gap: SPACING.sm,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
});
