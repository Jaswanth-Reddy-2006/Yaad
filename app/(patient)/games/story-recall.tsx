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
import { GameResultModal } from '../../../components/games/GameResultModal';
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

const STORIES: StoryData[] = [
  {
    id: 'story-1',
    title: "Grandpa's Morning Garden",
    subtitle: 'A peaceful stroll among morning flowers',
    badgeColor: '#16A34A',
    cardBg: '#F0FDF4',
    scenes: [
      {
        id: 's1-p1',
        text: 'Early in the morning, Grandpa Anand wore his straw hat and stepped outside into the sunny garden.',
        illustration: GrandpaGardenScene1,
      },
      {
        id: 's1-p2',
        text: 'He picked up his bright green watering can and gently watered the blooming red roses.',
        illustration: GrandpaGardenScene2,
      },
      {
        id: 's1-p3',
        text: 'As Grandpa smiled, a friendly yellow butterfly fluttered down and landed right on his shoulder.',
        illustration: GrandpaGardenScene3,
      },
    ],
    questions: [
      {
        id: 'q1-1',
        category: 'PEOPLE',
        categoryLabel: 'Person',
        categoryColor: '#2563EB',
        questionText: 'Who went out into the sunny morning garden?',
        options: [
          { id: 'opt-1', label: 'Grandpa Anand', isCorrect: true },
          { id: 'opt-2', label: 'A young school teacher', isCorrect: false },
          { id: 'opt-3', label: 'The village doctor', isCorrect: false },
        ],
        explanation: 'Grandpa Anand walked into the morning garden.',
      },
      {
        id: 'q1-2',
        category: 'OBJECT',
        categoryLabel: 'Object',
        categoryColor: '#16A34A',
        questionText: 'What color was Grandpa’s watering can?',
        options: [
          { id: 'opt-1', label: 'Bright Green', isCorrect: true },
          { id: 'opt-2', label: 'Dark Purple', isCorrect: false },
          { id: 'opt-3', label: 'Shiny Silver', isCorrect: false },
        ],
        explanation: 'Grandpa used a bright green watering can.',
      },
      {
        id: 'q1-3',
        category: 'OBJECT',
        categoryLabel: 'Flowers',
        categoryColor: '#E11D48',
        questionText: 'Which flowers was Grandpa watering in the garden?',
        options: [
          { id: 'opt-1', label: 'Blooming Red Roses', isCorrect: true },
          { id: 'opt-2', label: 'Yellow Sunflowers', isCorrect: false },
          { id: 'opt-3', label: 'White Lilies', isCorrect: false },
        ],
        explanation: 'Grandpa watered the blooming red roses.',
      },
      {
        id: 'q1-4',
        category: 'EVENT',
        categoryLabel: 'Event',
        categoryColor: '#D97706',
        questionText: 'What gentle creature landed on Grandpa’s shoulder?',
        options: [
          { id: 'opt-1', label: 'A Yellow Butterfly', isCorrect: true },
          { id: 'opt-2', label: 'A Little Blue Bird', isCorrect: false },
          { id: 'opt-3', label: 'A Green Grasshopper', isCorrect: false },
        ],
        explanation: 'A friendly yellow butterfly landed on his shoulder.',
      },
    ],
  },
  {
    id: 'story-2',
    title: "Maya's Cozy Afternoon Tea",
    subtitle: 'A warm tea break with a furry friend',
    badgeColor: '#7C3AED',
    cardBg: '#FAF5FF',
    scenes: [
      {
        id: 's2-p1',
        text: 'On a quiet afternoon, Maya sat comfortably in her cozy blue armchair wearing her purple cardigan.',
        illustration: MayaTeaScene1,
      },
      {
        id: 's2-p2',
        text: 'She poured warm chai from a golden teapot into her white cup and enjoyed a crispy biscuit.',
        illustration: MayaTeaScene2,
      },
      {
        id: 's2-p3',
        text: 'Her fluffy ginger cat Leo curled up peacefully on the soft pink rug near her feet and fell fast asleep.',
        illustration: MayaTeaScene3,
      },
    ],
    questions: [
      {
        id: 'q2-1',
        category: 'PEOPLE',
        categoryLabel: 'Person',
        categoryColor: '#2563EB',
        questionText: 'What was the name of the lady enjoying tea?',
        options: [
          { id: 'opt-1', label: 'Maya', isCorrect: true },
          { id: 'opt-2', label: 'Sunita', isCorrect: false },
          { id: 'opt-3', label: 'Radha', isCorrect: false },
        ],
        explanation: 'Maya was sitting in the cozy armchair.',
      },
      {
        id: 'q2-2',
        category: 'OBJECT',
        categoryLabel: 'Furniture',
        categoryColor: '#0284C7',
        questionText: 'What color was the cozy armchair Maya sat in?',
        options: [
          { id: 'opt-1', label: 'Blue Armchair', isCorrect: true },
          { id: 'opt-2', label: 'Green Wooden Bench', isCorrect: false },
          { id: 'opt-3', label: 'Red Rocking Chair', isCorrect: false },
        ],
        explanation: 'Maya sat in a cozy blue armchair.',
      },
      {
        id: 'q2-3',
        category: 'EVENT',
        categoryLabel: 'Animal',
        categoryColor: '#EA580C',
        questionText: 'Who curled up to sleep by Maya’s feet on the rug?',
        options: [
          { id: 'opt-1', label: 'Ginger Cat Leo', isCorrect: true },
          { id: 'opt-2', label: 'Puppy Bruno', isCorrect: false },
          { id: 'opt-3', label: 'A pet parrot', isCorrect: false },
        ],
        explanation: 'Her fluffy ginger cat Leo curled up to sleep.',
      },
      {
        id: 'q2-4',
        category: 'OBJECT',
        categoryLabel: 'Food',
        categoryColor: '#B45309',
        questionText: 'What snack did Maya enjoy with her warm tea?',
        options: [
          { id: 'opt-1', label: 'A Crispy Biscuit', isCorrect: true },
          { id: 'opt-2', label: 'A Fresh Apple', isCorrect: false },
          { id: 'opt-3', label: 'A Bowl of Ice Cream', isCorrect: false },
        ],
        explanation: 'Maya enjoyed a crispy biscuit with her tea.',
      },
    ],
  },
  {
    id: 'story-3',
    title: "Raju's Picnic in the Park",
    subtitle: 'A bicycle ride and lunch under the oak tree',
    badgeColor: '#0284C7',
    cardBg: '#F0F9FF',
    scenes: [
      {
        id: 's3-p1',
        text: 'Young Raju packed a red picnic basket with sweet yellow bananas and cold water for a fun outing.',
        illustration: RajuPicnicScene1,
      },
      {
        id: 's3-p2',
        text: 'He rode his bright green bicycle down the park path all the way to the big oak tree by the pond.',
        illustration: RajuPicnicScene2,
      },
      {
        id: 's3-p3',
        text: 'Under the cool shade of the tree, Raju spread a blue checkered blanket and shared bananas with his friend.',
        illustration: RajuPicnicScene3,
      },
    ],
    questions: [
      {
        id: 'q3-1',
        category: 'OBJECT',
        categoryLabel: 'Vehicle',
        categoryColor: '#16A34A',
        questionText: 'What color was the bicycle that Raju rode to the park?',
        options: [
          { id: 'opt-1', label: 'Bright Green', isCorrect: true },
          { id: 'opt-2', label: 'Dark Blue', isCorrect: false },
          { id: 'opt-3', label: 'Bright Orange', isCorrect: false },
        ],
        explanation: 'Raju rode his bright green bicycle.',
      },
      {
        id: 'q3-2',
        category: 'OBJECT',
        categoryLabel: 'Food',
        categoryColor: '#CA8A04',
        questionText: 'What sweet fruit did Raju pack inside his red picnic basket?',
        options: [
          { id: 'opt-1', label: 'Sweet Yellow Bananas', isCorrect: true },
          { id: 'opt-2', label: 'Red Apples', isCorrect: false },
          { id: 'opt-3', label: 'Juicy Oranges', isCorrect: false },
        ],
        explanation: 'Raju packed sweet yellow bananas.',
      },
      {
        id: 'q3-3',
        category: 'EVENT',
        categoryLabel: 'Place',
        categoryColor: '#15803D',
        questionText: 'Where did Raju stop and spread his picnic blanket?',
        options: [
          { id: 'opt-1', label: 'Under the Big Oak Tree', isCorrect: true },
          { id: 'opt-2', label: 'Inside a camping tent', isCorrect: false },
          { id: 'opt-3', label: 'On a rowboat in the lake', isCorrect: false },
        ],
        explanation: 'Raju stopped under the shade of the big oak tree.',
      },
      {
        id: 'q3-4',
        category: 'DETAIL',
        categoryLabel: 'Pattern',
        categoryColor: '#2563EB',
        questionText: 'What color pattern was on the picnic blanket?',
        options: [
          { id: 'opt-1', label: 'Blue Checkered', isCorrect: true },
          { id: 'opt-2', label: 'Yellow Polka Dots', isCorrect: false },
          { id: 'opt-3', label: 'Plain Red', isCorrect: false },
        ],
        explanation: 'Raju spread a blue checkered blanket.',
      },
    ],
  },
  {
    id: 'story-4',
    title: "Anita's Sweet Mango Treat",
    subtitle: 'Making homemade dessert in the sunny kitchen',
    badgeColor: '#EA580C',
    cardBg: '#FFF7ED',
    scenes: [
      {
        id: 's4-p1',
        text: 'Anita put on her bright orange apron and stepped into the sunlit kitchen ready to make a dessert.',
        illustration: AnitaMangoScene1,
      },
      {
        id: 's4-p2',
        text: 'From a wooden bowl on the table, she selected three ripe, golden mangoes smelling sweet and fresh.',
        illustration: AnitaMangoScene2,
      },
      {
        id: 's4-p3',
        text: 'She blended them with milk into delicious cold mango kulfi in glasses topped with green pistachios.',
        illustration: AnitaMangoScene3,
      },
    ],
    questions: [
      {
        id: 'q4-1',
        category: 'PEOPLE',
        categoryLabel: 'Clothing',
        categoryColor: '#EA580C',
        questionText: 'What color apron was Anita wearing in the kitchen?',
        options: [
          { id: 'opt-1', label: 'Bright Orange', isCorrect: true },
          { id: 'opt-2', label: 'Dark Navy Blue', isCorrect: false },
          { id: 'opt-3', label: 'Pure White', isCorrect: false },
        ],
        explanation: 'Anita wore a bright orange apron.',
      },
      {
        id: 'q4-2',
        category: 'DETAIL',
        categoryLabel: 'Count',
        categoryColor: '#CA8A04',
        questionText: 'How many ripe golden mangoes did Anita pick from the bowl?',
        options: [
          { id: 'opt-1', label: 'Three (3) Mangoes', isCorrect: true },
          { id: 'opt-2', label: 'One (1) Mango', isCorrect: false },
          { id: 'opt-3', label: 'Five (5) Mangoes', isCorrect: false },
        ],
        explanation: 'Anita selected three ripe golden mangoes.',
      },
      {
        id: 'q4-3',
        category: 'EVENT',
        categoryLabel: 'Dessert',
        categoryColor: '#D97706',
        questionText: 'What delicious sweet treat did Anita make for everyone?',
        options: [
          { id: 'opt-1', label: 'Cold Mango Kulfi', isCorrect: true },
          { id: 'opt-2', label: 'Hot Chocolate Cake', isCorrect: false },
          { id: 'opt-3', label: 'Warm Rice Pudding', isCorrect: false },
        ],
        explanation: 'Anita made delicious cold mango kulfi.',
      },
    ],
  },
];

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
  const currentStory = STORIES[storyIndex] || STORIES[0];
  const currentScene = currentStory.scenes[sceneIndex] || currentStory.scenes[0];
  const currentQuestion = currentStory.questions[questionIndex] || currentStory.questions[0];

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
    const nextIndex = (storyIndex + 1) % STORIES.length;
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

          {/* Large Picture Illustration Card */}
          <View
            style={[
              styles.illustrationCard,
              {
                backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF',
                borderColor: isHc ? COLORS.hcBorder : '#E2E8F0',
              },
            ]}
          >
            <CurrentSceneIllustration height={200} />
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
            {currentQuestion.options.map((option, idx) => {
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
      <Modal visible={showLeaveModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.leaveModalCard, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' }]}>
            <AlertCircle size={44} color="#D97706" style={{ marginBottom: SPACING.sm }} />
            <Typography size="lg" weight="bold" align="center" color={isHc ? COLORS.hcTextPrimary : '#0F172A'}>
              {t('leave_game_title') || 'Leave Game?'}
            </Typography>
            <Typography size="sm" color={COLORS.textSecondary} align="center" style={{ marginTop: 6, marginBottom: SPACING.lg }}>
              {t('leave_game_msg') || 'Are you sure you want to stop playing Story Recall?'}
            </Typography>
            <View style={styles.leaveModalActions}>
              <TouchableOpacity
                onPress={() => setShowLeaveModal(false)}
                style={[styles.leaveCancelBtn, { borderColor: '#CBD5E1' }]}
              >
                <Typography size="sm" weight="bold" color="#475569">
                  {t('stay_here') || 'Stay & Play'}
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowLeaveModal(false);
                  router.back();
                }}
                style={styles.leaveConfirmBtn}
              >
                <LogOut size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Typography size="sm" weight="bold" color="#FFFFFF">
                  {t('leave') || 'Leave'}
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
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
  leaveModalCard: {
    width: '90%',
    maxWidth: 360,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    elevation: 5,
  },
  leaveModalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  leaveCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  leaveConfirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: RADIUS.full,
  },
});
