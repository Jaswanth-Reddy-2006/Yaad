import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  BookOpen,
  Volume2,
  RotateCcw,
  User,
  Package,
  Calendar,
  Layers,
} from 'lucide-react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Typography } from '../../../components/common/Typography';
import { ListenButton } from '../../../components/common/ListenButton';
import { GameResultModal, LeaveGameModal } from '../../../components/games/GameResultModal';
import {
  GrandpaGardenScene1,
  GrandpaGardenScene2,
  GrandpaGardenScene3,
  MayaTeaScene1,
  MayaTeaScene2,
  MayaTeaScene3,
  RajuPicnicScene1,
  RajuPicnicScene2,
  RajuPicnicScene3,
  AnitaMangoScene1,
  AnitaMangoScene2,
  AnitaMangoScene3,
  SceneIllustrationProps,
} from '../../../components/illustrations';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';
import { voiceService } from '../../../services/VoiceService';
import { GameResult } from '../../../types';
import { gameRepository } from '../../../repositories/GameRepository';

export interface StoryScene {
  id: string;
  text: string;
  illustration: React.ComponentType<SceneIllustrationProps>;
}

export interface StoryQuestionOption {
  id: string;
  label: string;
  icon?: string;
  isCorrect: boolean;
}

export interface StoryQuestion {
  id: string;
  category: 'PEOPLE' | 'OBJECT' | 'EVENT' | 'DETAIL';
  categoryLabel: string;
  categoryColor: string;
  questionText: string;
  options: StoryQuestionOption[];
  explanation: string;
}

export interface StoryData {
  id: string;
  title: string;
  subtitle: string;
  badgeColor: string;
  cardBg: string;
  scenes: StoryScene[];
  questions: StoryQuestion[];
}

export function getStories(t: (key: string) => string): StoryData[] {
  return [
    {
      id: 'story-1',
      title: t('story_1_title'),
      subtitle: t('story_1_sub'),
      badgeColor: '#16A34A',
      cardBg: '#F0FDF4',
      scenes: [
        {
          id: 's1-p1',
          text: t('story_1_s1'),
          illustration: GrandpaGardenScene1,
        },
        {
          id: 's1-p2',
          text: t('story_1_s2'),
          illustration: GrandpaGardenScene2,
        },
        {
          id: 's1-p3',
          text: t('story_1_s3'),
          illustration: GrandpaGardenScene3,
        },
      ],
      questions: [
        {
          id: 'q1-1',
          category: 'PEOPLE',
          categoryLabel: 'Person',
          categoryColor: '#2563EB',
          questionText: t('story_1_q1'),
          options: [
            { id: 'opt-1', label: t('grandpa_anand'), icon: '👴', isCorrect: true },
            { id: 'opt-2', label: t('school_teacher'), icon: '👨‍🏫', isCorrect: false },
            { id: 'opt-3', label: t('village_doctor'), icon: '👨‍⚕️', isCorrect: false },
          ],
          explanation: t('grandpa_anand'),
        },
        {
          id: 'q1-2',
          category: 'OBJECT',
          categoryLabel: 'Object',
          categoryColor: '#16A34A',
          questionText: t('story_1_q2'),
          options: [
            { id: 'opt-2', label: t('dark_purple'), icon: '💜', isCorrect: false },
            { id: 'opt-1', label: t('bright_green'), icon: '💚', isCorrect: true },
            { id: 'opt-3', label: t('shiny_silver'), icon: '🤍', isCorrect: false },
          ],
          explanation: t('bright_green'),
        },
        {
          id: 'q1-3',
          category: 'OBJECT',
          categoryLabel: 'Flowers',
          categoryColor: '#E11D48',
          questionText: t('story_1_q3'),
          options: [
            { id: 'opt-2', label: t('yellow_sunflowers'), icon: '🌻', isCorrect: false },
            { id: 'opt-3', label: t('white_lilies'), icon: '🪷', isCorrect: false },
            { id: 'opt-1', label: t('blooming_red_roses'), icon: '🌹', isCorrect: true },
          ],
          explanation: t('blooming_red_roses'),
        },
        {
          id: 'q1-4',
          category: 'EVENT',
          categoryLabel: 'Event',
          categoryColor: '#D97706',
          questionText: t('story_1_q4'),
          options: [
            { id: 'opt-1', label: t('yellow_butterfly'), icon: '🦋', isCorrect: true },
            { id: 'opt-2', label: t('blue_bird'), icon: '🐦', isCorrect: false },
            { id: 'opt-3', label: t('green_grasshopper'), icon: '🦗', isCorrect: false },
          ],
          explanation: t('yellow_butterfly'),
        },
      ],
    },
    {
      id: 'story-2',
      title: t('story_2_title'),
      subtitle: t('story_2_sub'),
      badgeColor: '#7C3AED',
      cardBg: '#FAF5FF',
      scenes: [
        {
          id: 's2-p1',
          text: t('story_2_s1'),
          illustration: MayaTeaScene1,
        },
        {
          id: 's2-p2',
          text: t('story_2_s2'),
          illustration: MayaTeaScene2,
        },
        {
          id: 's2-p3',
          text: t('story_2_s3'),
          illustration: MayaTeaScene3,
        },
      ],
      questions: [
        {
          id: 'q2-1',
          category: 'PEOPLE',
          categoryLabel: 'Person',
          categoryColor: '#2563EB',
          questionText: t('story_2_q1'),
          options: [
            { id: 'opt-2', label: 'Sunita', icon: '👩‍🦱', isCorrect: false },
            { id: 'opt-1', label: 'Maya', icon: '👩', isCorrect: true },
            { id: 'opt-3', label: 'Radha', icon: '👵', isCorrect: false },
          ],
          explanation: 'Maya',
        },
        {
          id: 'q2-2',
          category: 'OBJECT',
          categoryLabel: 'Furniture',
          categoryColor: '#0284C7',
          questionText: t('story_2_q2'),
          options: [
            { id: 'opt-2', label: 'Wooden Bench', icon: '🪵', isCorrect: false },
            { id: 'opt-3', label: 'Rocking Chair', icon: '🪑', isCorrect: false },
            { id: 'opt-1', label: t('blue_armchair'), icon: '🛋️', isCorrect: true },
          ],
          explanation: t('blue_armchair'),
        },
        {
          id: 'q2-3',
          category: 'EVENT',
          categoryLabel: 'Animal',
          categoryColor: '#EA580C',
          questionText: t('story_2_q3'),
          options: [
            { id: 'opt-1', label: t('ginger_cat_leo'), icon: '🐱', isCorrect: true },
            { id: 'opt-2', label: 'Puppy Bruno', icon: '🐶', isCorrect: false },
            { id: 'opt-3', label: 'Pet Parrot', icon: '🦜', isCorrect: false },
          ],
          explanation: t('ginger_cat_leo'),
        },
        {
          id: 'q2-4',
          category: 'OBJECT',
          categoryLabel: 'Food',
          categoryColor: '#B45309',
          questionText: t('story_2_q4'),
          options: [
            { id: 'opt-2', label: 'Fresh Apple', icon: '🍎', isCorrect: false },
            { id: 'opt-1', label: t('crispy_biscuit'), icon: '🍪', isCorrect: true },
            { id: 'opt-3', label: 'Ice Cream', icon: '🍨', isCorrect: false },
          ],
          explanation: t('crispy_biscuit'),
        },
      ],
    },
    {
      id: 'story-3',
      title: t('story_3_title'),
      subtitle: t('story_3_sub'),
      badgeColor: '#0284C7',
      cardBg: '#F0F9FF',
      scenes: [
        {
          id: 's3-p1',
          text: t('story_3_s1'),
          illustration: RajuPicnicScene1,
        },
        {
          id: 's3-p2',
          text: t('story_3_s2'),
          illustration: RajuPicnicScene2,
        },
        {
          id: 's3-p3',
          text: t('story_3_s3'),
          illustration: RajuPicnicScene3,
        },
      ],
      questions: [
        {
          id: 'q3-1',
          category: 'OBJECT',
          categoryLabel: 'Vehicle',
          categoryColor: '#16A34A',
          questionText: t('story_3_q1'),
          options: [
            { id: 'opt-2', label: 'Dark Blue', icon: '🚲', isCorrect: false },
            { id: 'opt-3', label: 'Bright Orange', icon: '🚲', isCorrect: false },
            { id: 'opt-1', label: t('bright_green_bike'), icon: '🚲', isCorrect: true },
          ],
          explanation: t('bright_green_bike'),
        },
        {
          id: 'q3-2',
          category: 'OBJECT',
          categoryLabel: 'Food',
          categoryColor: '#CA8A04',
          questionText: t('story_3_q2'),
          options: [
            { id: 'opt-1', label: t('sweet_yellow_bananas'), icon: '🍌', isCorrect: true },
            { id: 'opt-2', label: 'Red Apples', icon: '🍎', isCorrect: false },
            { id: 'opt-3', label: 'Juicy Oranges', icon: '🍊', isCorrect: false },
          ],
          explanation: t('sweet_yellow_bananas'),
        },
        {
          id: 'q3-3',
          category: 'EVENT',
          categoryLabel: 'Place',
          categoryColor: '#15803D',
          questionText: t('story_3_q3'),
          options: [
            { id: 'opt-2', label: 'Inside a tent', icon: '⛺', isCorrect: false },
            { id: 'opt-1', label: t('under_oak_tree'), icon: '🌳', isCorrect: true },
            { id: 'opt-3', label: 'On a boat', icon: '🚣', isCorrect: false },
          ],
          explanation: t('under_oak_tree'),
        },
        {
          id: 'q3-4',
          category: 'DETAIL',
          categoryLabel: 'Pattern',
          categoryColor: '#2563EB',
          questionText: t('story_3_q4'),
          options: [
            { id: 'opt-2', label: 'Yellow Polka Dots', icon: '🟡', isCorrect: false },
            { id: 'opt-3', label: 'Plain Red', icon: '🟥', isCorrect: false },
            { id: 'opt-1', label: t('blue_checkered'), icon: '🟦', isCorrect: true },
          ],
          explanation: t('blue_checkered'),
        },
      ],
    },
    {
      id: 'story-4',
      title: t('story_4_title'),
      subtitle: t('story_4_sub'),
      badgeColor: '#EA580C',
      cardBg: '#FFF7ED',
      scenes: [
        {
          id: 's4-p1',
          text: t('story_4_s1'),
          illustration: AnitaMangoScene1,
        },
        {
          id: 's4-p2',
          text: t('story_4_s2'),
          illustration: AnitaMangoScene2,
        },
        {
          id: 's4-p3',
          text: t('story_4_s3'),
          illustration: AnitaMangoScene3,
        },
      ],
      questions: [
        {
          id: 'q4-1',
          category: 'PEOPLE',
          categoryLabel: 'Clothing',
          categoryColor: '#EA580C',
          questionText: t('story_4_q1'),
          options: [
            { id: 'opt-2', label: 'Dark Navy Blue', icon: '🟦', isCorrect: false },
            { id: 'opt-1', label: t('bright_orange_apron'), icon: '🟧', isCorrect: true },
            { id: 'opt-3', label: 'Pure White', icon: '⬜', isCorrect: false },
          ],
          explanation: t('bright_orange_apron'),
        },
        {
          id: 'q4-2',
          category: 'DETAIL',
          categoryLabel: 'Count',
          categoryColor: '#CA8A04',
          questionText: t('story_4_q2'),
          options: [
            { id: 'opt-2', label: 'One (1) Mango', icon: '🥭', isCorrect: false },
            { id: 'opt-3', label: 'Five (5) Mangoes', icon: '🥭', isCorrect: false },
            { id: 'opt-1', label: t('three_mangoes'), icon: '🥭', isCorrect: true },
          ],
          explanation: t('three_mangoes'),
        },
        {
          id: 'q4-3',
          category: 'EVENT',
          categoryLabel: 'Dessert',
          categoryColor: '#D97706',
          questionText: t('story_4_q3'),
          options: [
            { id: 'opt-1', label: t('cold_mango_kulfi'), icon: '🍧', isCorrect: true },
            { id: 'opt-2', label: 'Chocolate Cake', icon: '🍫', isCorrect: false },
            { id: 'opt-3', label: 'Rice Pudding', icon: '🥣', isCorrect: false },
          ],
          explanation: t('cold_mango_kulfi'),
        },
      ],
    },
  ];
}

type GamePhase = 'STORY' | 'QUESTIONS' | 'COMPLETED';

export default function StoryRecallGameScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;
  const { width: windowWidth } = useWindowDimensions();

  const [storyIndex, setStoryIndex] = useState<number>(0);
  const [sceneIndex, setSceneIndex] = useState<number>(0);
  const [phase, setPhase] = useState<GamePhase>('STORY');

  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [shuffledOptions, setShuffledOptions] = useState<StoryQuestionOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isWrong, setIsWrong] = useState<boolean>(false);
  const [wrongOptionId, setWrongOptionId] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [showStoryPeekModal, setShowStoryPeekModal] = useState<boolean>(false);

  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const stories = getStories(t);
  const currentStory = stories[storyIndex] || stories[0];
  const currentScene = currentStory.scenes[sceneIndex] || currentStory.scenes[0];
  const currentQuestion = currentStory.questions[questionIndex] || currentStory.questions[0];

  // Shuffle question options so correct answer is randomly distributed across A, B, C on every question
  useEffect(() => {
    if (currentQuestion && currentQuestion.options) {
      const randomized = [...currentQuestion.options].sort(() => Math.random() - 0.5);
      setShuffledOptions(randomized);
    }
  }, [questionIndex, storyIndex, phase]);

  // Auto-read narrative when entering a scene
  useEffect(() => {
    if (phase === 'STORY') {
      voiceService.speak(currentScene.text);
    } else if (phase === 'QUESTIONS') {
      voiceService.speak(currentQuestion.questionText);
    }
  }, [phase, sceneIndex, questionIndex, storyIndex]);

  const handleNextScene = () => {
    if (sceneIndex < currentStory.scenes.length - 1) {
      setSceneIndex(sceneIndex + 1);
    } else {
      // Transition to questions
      startQuestions();
    }
  };

  const handlePrevScene = () => {
    if (sceneIndex > 0) {
      setSceneIndex(sceneIndex - 1);
    }
  };

  const startQuestions = () => {
    setPhase('QUESTIONS');
    setQuestionIndex(0);
    setSelectedOptionId(null);
    setIsWrong(false);
    setWrongOptionId(null);
    setCorrectAnswersCount(0);
    setMistakesCount(0);
    setHintsUsed(0);
  };

  const handleSelectOption = (option: StoryQuestionOption) => {
    if (selectedOptionId !== null && !isWrong) return;

    if (isWrong) {
      setIsWrong(false);
      setWrongOptionId(null);
    }

    setSelectedOptionId(option.id);

    if (option.isCorrect) {
      // Correct!
      voiceService.speak(`That's right! ${currentQuestion.explanation}`);
      setCorrectAnswersCount((prev) => prev + 1);

      setTimeout(() => {
        if (questionIndex < currentStory.questions.length - 1) {
          setQuestionIndex((prev) => prev + 1);
          setSelectedOptionId(null);
          setIsWrong(false);
          setWrongOptionId(null);
        } else {
          // Finished all questions!
          finishGame();
        }
      }, 1500);
    } else {
      // Incorrect choice
      setIsWrong(true);
      setWrongOptionId(option.id);
      setMistakesCount((prev) => prev + 1);
      voiceService.speak("That's okay, let's take another look or try again!");
    }
  };

  const finishGame = () => {
    const elapsedSecs = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const totalQ = currentStory.questions.length;
    const finalAccuracy = Math.round(
      ((totalQ) / Math.max(totalQ, totalQ + mistakesCount)) * 100
    );
    const score = Math.max(300, 1000 - mistakesCount * 120 - hintsUsed * 50);

    const result: GameResult = {
      id: `result-${Date.now()}`,
      sessionId: `session-${Date.now()}`,
      patientId: 'local-patient-1',
      gameId: 'PAIR',
      difficulty: 'EASY',
      score,
      accuracy: finalAccuracy,
      durationSeconds: elapsedSecs,
      attempts: 1,
      mistakes: mistakesCount,
      hintsUsed,
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

  const handleNextStory = () => {
    const nextIndex = (storyIndex + 1) % stories.length;
    setStoryIndex(nextIndex);
    setSceneIndex(0);
    setPhase('STORY');
    setGameResult(null);
    startTimeRef.current = Date.now();
  };

  const handleReplayStory = () => {
    setSceneIndex(0);
    setPhase('STORY');
    setGameResult(null);
    startTimeRef.current = Date.now();
  };

  const CurrentSceneIllustration = currentScene.illustration;

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
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#4338CA'} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} align="center">
            {t('story_recall') || 'Story Recall'}
          </Typography>
          <Typography size="xs" color={COLORS.textMuted} align="center">
            {phase === 'STORY' ? `Scene ${sceneIndex + 1} of ${currentStory.scenes.length}` : `Question ${questionIndex + 1} of ${currentStory.questions.length}`}
          </Typography>
        </View>

        <ListenButton
          textToSpeak={phase === 'STORY' ? currentScene.text : currentQuestion.questionText}
          size="sm"
          variant="secondary"
        />
      </View>

      {/* 2. Main Content Area */}
      {phase === 'STORY' && (
        <View style={styles.storyPhaseWrapper}>
          {/* Story Badge */}
          <View style={styles.storyBadgeRow}>
            <View style={[styles.storyTag, { backgroundColor: currentStory.cardBg, borderColor: currentStory.badgeColor }]}>
              <BookOpen size={16} color={currentStory.badgeColor} style={{ marginRight: 6 }} />
              <Typography size="sm" weight="bold" color={currentStory.badgeColor}>
                {currentStory.title}
              </Typography>
            </View>
          </View>

          {/* Large Picture Illustration — full-width, no border box */}
          <View style={styles.illustrationCard}>
            <CurrentSceneIllustration height={240} />
          </View>

          {/* Scene Progress Indicators */}
          <View style={styles.sceneDotsRow}>
            {currentStory.scenes.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSceneIndex(idx)}
                style={[
                  styles.sceneDot,
                  {
                    backgroundColor: idx === sceneIndex ? currentStory.badgeColor : '#CBD5E1',
                    width: idx === sceneIndex ? 24 : 10,
                  },
                ]}
              />
            ))}
          </View>

          {/* Large Story Narrative Box */}
          <View
            style={[
              styles.storyTextBox,
              {
                backgroundColor: isHc ? COLORS.hcCardBackground : currentStory.cardBg,
                borderColor: isHc ? COLORS.hcBorder : '#CBD5E1',
              },
            ]}
          >
            <Typography
              size="lg"
              weight="semibold"
              color={isHc ? COLORS.hcTextPrimary : '#1E293B'}
              style={{ lineHeight: 28 }}
            >
              {currentScene.text}
            </Typography>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => voiceService.speak(currentScene.text)}
              style={styles.inlineListenRow}
            >
              <Volume2 size={18} color={currentStory.badgeColor} style={{ marginRight: 6 }} />
              <Typography size="xs" weight="bold" color={currentStory.badgeColor}>
                {t('read_aloud') || 'Read aloud'}
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Navigation Controls: Prev, Next or Ready For Questions */}
          <View style={styles.storyNavigationRow}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Previous Scene"
              disabled={sceneIndex === 0}
              onPress={handlePrevScene}
              style={[
                styles.navBtn,
                {
                  backgroundColor: sceneIndex === 0 ? '#F1F5F9' : '#FFFFFF',
                  borderColor: '#CBD5E1',
                  opacity: sceneIndex === 0 ? 0.4 : 1,
                },
              ]}
            >
              <ChevronLeft size={22} color="#475569" strokeWidth={2.5} />
              <Typography size="sm" weight="bold" color="#475569">
                {t('previous') || 'Previous'}
              </Typography>
            </TouchableOpacity>

            {sceneIndex < currentStory.scenes.length - 1 ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Next Scene"
                onPress={handleNextScene}
                style={[styles.primaryActionBtn, { backgroundColor: currentStory.badgeColor }]}
              >
                <Typography size="base" weight="bold" color="#FFFFFF" style={{ marginRight: 6 }}>
                  {t('next_page') || 'Next Scene'}
                </Typography>
                <ChevronRight size={22} color="#FFFFFF" strokeWidth={2.5} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Ready for questions"
                onPress={startQuestions}
                style={[styles.primaryActionBtn, { backgroundColor: '#4338CA' }]}
              >
                <Sparkles size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Typography size="base" weight="bold" color="#FFFFFF">
                  {t('ready_for_questions') || "I'm Ready!"}
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* 3. Question Recall Phase */}
      {phase === 'QUESTIONS' && (
        <View style={styles.questionPhaseWrapper}>
          {/* Category Tag & Peek Story Button */}
          <View style={styles.questionTopBar}>
            <View style={[styles.categoryBadge, { backgroundColor: `${currentQuestion.categoryColor}15`, borderColor: currentQuestion.categoryColor }]}>
              {currentQuestion.category === 'PEOPLE' && <User size={14} color={currentQuestion.categoryColor} style={{ marginRight: 4 }} />}
              {currentQuestion.category === 'OBJECT' && <Package size={14} color={currentQuestion.categoryColor} style={{ marginRight: 4 }} />}
              {currentQuestion.category === 'EVENT' && <Calendar size={14} color={currentQuestion.categoryColor} style={{ marginRight: 4 }} />}
              {currentQuestion.category === 'DETAIL' && <Layers size={14} color={currentQuestion.categoryColor} style={{ marginRight: 4 }} />}
              <Typography size="xs" weight="bold" color={currentQuestion.categoryColor}>
                {currentQuestion.categoryLabel}
              </Typography>
            </View>

            {/* Peek at Story / Hint Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Peek at Story"
              onPress={() => {
                setHintsUsed((h) => h + 1);
                setShowStoryPeekModal(true);
              }}
              style={styles.hintBtn}
            >
              <HelpCircle size={18} color="#4F46E5" style={{ marginRight: 4 }} />
              <Typography size="xs" weight="bold" color="#4F46E5">
                {t('peek_story') || 'Peek Story'}
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Question Banner */}
          <View
            style={[
              styles.questionBanner,
              {
                backgroundColor: isHc ? COLORS.hcCardBackground : '#EEF2FF',
                borderColor: isHc ? COLORS.hcBorder : '#C7D2FE',
              },
            ]}
          >
            <Typography
              size="xl"
              weight="bold"
              color={isHc ? COLORS.hcTextPrimary : '#1E1B4B'}
              style={{ lineHeight: 28 }}
            >
              {currentQuestion.questionText}
            </Typography>
          </View>

          {/* Answer Options */}
          <View style={styles.optionsList}>
            {(shuffledOptions.length > 0 ? shuffledOptions : currentQuestion.options).map((option, idx) => {
              const isSelected = selectedOptionId === option.id;
              const isOptionWrong = wrongOptionId === option.id;
              const isOptionCorrect = isSelected && option.isCorrect;

              let optionBg = isHc ? COLORS.hcCardBackground : '#FFFFFF';
              let optionBorder = isHc ? COLORS.hcBorder : '#E2E8F0';
              let textColor = isHc ? COLORS.hcTextPrimary : '#1E293B';

              if (isOptionCorrect) {
                optionBg = '#DCFCE7';
                optionBorder = '#16A34A';
                textColor = '#14532D';
              } else if (isOptionWrong) {
                optionBg = '#FEE2E2';
                optionBorder = '#DC2626';
                textColor = '#7F1D1D';
              }

              return (
                <TouchableOpacity
                  key={option.id}
                  activeOpacity={0.88}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  onPress={() => handleSelectOption(option)}
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: optionBg,
                      borderColor: optionBorder,
                      borderWidth: isSelected || isOptionWrong ? 3 : 2,
                    },
                  ]}
                >
                  <View style={styles.optionIndexCircle}>
                    <Typography size="sm" weight="bold" color="#475569">
                      {String.fromCharCode(65 + idx)}
                    </Typography>
                  </View>

                  {option.icon && (
                    <Typography size="xl" style={{ marginRight: SPACING.sm }}>
                      {option.icon}
                    </Typography>
                  )}

                  <Typography
                    size="base"
                    weight="bold"
                    color={textColor}
                    style={styles.optionText}
                  >
                    {option.label}
                  </Typography>

                  {isOptionCorrect && (
                    <CheckCircle2 size={24} color="#16A34A" strokeWidth={2.5} />
                  )}
                  {isOptionWrong && (
                    <XCircle size={24} color="#DC2626" strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Feedback Banner */}
          {isWrong && (
            <View style={styles.wrongFeedbackRow}>
              <AlertCircle size={20} color="#DC2626" style={{ marginRight: 6 }} />
              <Typography size="sm" weight="bold" color="#B91C1C">
                {t('try_again') || 'Take your time and try again!'}
              </Typography>
            </View>
          )}
        </View>
      )}

      {/* 4. Peek Story Modal (Elder-Friendly Hint) */}
      <Modal visible={showStoryPeekModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.peekModalCard, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' }]}>
            <View style={styles.peekHeaderRow}>
              <Typography size="lg" weight="bold" color="#1E1B4B">
                📖 {currentStory.title}
              </Typography>
              <TouchableOpacity
                onPress={() => setShowStoryPeekModal(false)}
                style={styles.closePeekBtn}
              >
                <XCircle size={24} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.peekScrollContent} showsVerticalScrollIndicator={false}>
              {currentStory.scenes.map((scene, idx) => {
                const SceneComp = scene.illustration;
                return (
                  <View key={scene.id} style={styles.peekSceneItem}>
                    <Typography size="xs" weight="bold" color="#6366F1" style={{ marginBottom: 4 }}>
                      Scene {idx + 1}
                    </Typography>
                    <View style={styles.peekIllustrationBox}>
                      <SceneComp height={130} />
                    </View>
                    <Typography size="sm" color="#334155" style={{ marginTop: 6, lineHeight: 20 }}>
                      {scene.text}
                    </Typography>
                  </View>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowStoryPeekModal(false)}
              style={styles.closePeekPrimaryBtn}
            >
              <Typography size="base" weight="bold" color="#FFFFFF">
                {t('back_to_question') || 'Back to Question'}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 5. Safe Exit / Leave Confirmation Modal */}
      <LeaveGameModal
        visible={showLeaveModal}
        gameTitle="Story Recall"
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={() => {
          setShowLeaveModal(false);
          router.back();
        }}
      />

      {/* 6. Game Over / Scorecard Modal */}
      <GameResultModal
        visible={phase === 'COMPLETED'}
        result={gameResult}
        playAgainLabel="Next Story"
        onPlayAgain={handleNextStory}
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
  storyPhaseWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  storyBadgeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  storyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
  },
  illustrationCard: {
    width: '100%',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  sceneDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: SPACING.md,
  },
  sceneDot: {
    height: 10,
    borderRadius: 5,
  },
  storyTextBox: {
    width: '100%',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  inlineListenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  storyNavigationRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    elevation: 3,
  },
  questionPhaseWrapper: {
    width: '100%',
  },
  questionTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1.2,
  },
  hintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: '#EEF2FF',
    borderWidth: 1.2,
    borderColor: '#C7D2FE',
  },
  questionBanner: {
    width: '100%',
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  optionsList: {
    width: '100%',
    gap: SPACING.sm,
  },
  optionCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    elevation: 2,
  },
  optionIndexCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  optionText: {
    flex: 1,
    paddingRight: SPACING.xs,
  },
  wrongFeedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: '#FEF2F2',
    borderRadius: RADIUS.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  peekModalCard: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    elevation: 5,
  },
  peekHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  closePeekBtn: {
    padding: 4,
  },
  peekScrollContent: {
    marginVertical: SPACING.xs,
  },
  peekSceneItem: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  peekIllustrationBox: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  closePeekPrimaryBtn: {
    backgroundColor: '#4338CA',
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
});
