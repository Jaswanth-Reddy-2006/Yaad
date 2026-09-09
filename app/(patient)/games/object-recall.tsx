import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  MapPin,
  Sparkles,
  Home,
  Clock,
  Pill,
  Droplet,
  Footprints,
  Key,
} from 'lucide-react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Typography } from '../../../components/common/Typography';
import { ListenButton } from '../../../components/common/ListenButton';
import { GameResultModal, LeaveGameModal } from '../../../components/games/GameResultModal';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';
import { useVoiceStore } from '../../../store/useVoiceStore';
import { voiceService } from '../../../services/VoiceService';
import { offlineProximitySync } from '../../../services/sync/OfflineProximitySync';
import { ObjectRecallItem, GameResult } from '../../../types';
import { gameRepository } from '../../../repositories/GameRepository';

// Helper to render preset icon
function renderObjectIcon(preset?: string, size: number = 56, color: string = '#D97706') {
  switch (preset) {
    case 'keys':
      return <Key size={size} color={color} strokeWidth={2} />;
    case 'medicine':
      return <Pill size={size} color={color} strokeWidth={2} />;
    case 'walking_stick':
      return <Footprints size={size} color={color} strokeWidth={2} />;
    case 'water_bottle':
      return <Droplet size={size} color={color} strokeWidth={2} />;
    case 'watch':
      return <Clock size={size} color={color} strokeWidth={2} />;
    case 'glasses':
    default:
      return <Eye size={size} color={color} strokeWidth={2} />;
  }
}

const DISTRACTOR_LOCATIONS = [
  'In the refrigerator',
  'On the front porch',
  'Inside the wardrobe suitcase',
  'On the kitchen counter',
  'In the balcony garden',
  'Under the sofa cushion',
];

export default function ObjectRecallGameScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { preferences, currentLanguage, t } = useAccessibilityStore();
  const { ttsLanguage } = useVoiceStore();
  const isHc = preferences.highContrast;

  const [objects, setObjects] = useState<ObjectRecallItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [wrongLocation, setWrongLocation] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  // Load objects configured by caregiver
  useEffect(() => {
    async function loadObjects() {
      const list = await offlineProximitySync.getObjectRecallItems();
      if (list && list.length > 0) {
        setObjects(list);
      }
    }
    loadObjects();
  }, []);

  const currentObject = objects[currentIndex] || objects[0];

  // Prepare location choices whenever current object changes
  useEffect(() => {
    if (!currentObject || objects.length === 0) return;

    // Pick distractors from other objects' locations or general fallback locations
    const otherLocations = objects
      .filter((o) => o.id !== currentObject.id)
      .map((o) => o.location);

    const availableDistractors = [...otherLocations, ...DISTRACTOR_LOCATIONS].filter(
      (loc) => loc.toLowerCase() !== currentObject.location.toLowerCase()
    );

    const shuffled = [...new Set(availableDistractors)].sort(() => Math.random() - 0.5);
    const pickedDistractors = shuffled.slice(0, 2);

    const roundChoices = [currentObject.location, ...pickedDistractors].sort(() => Math.random() - 0.5);
    setChoices(roundChoices);
    setSelectedLocation(null);
    setWrongLocation(null);

    // Voice prompt
    const promptText = `Where is the ${currentObject.name} usually kept? Tap the correct location.`;
    voiceService.speak(promptText, ttsLanguage, undefined, 'NORMAL', 'OBJECT_RECALL_PROMPT');
  }, [currentIndex, currentObject, objects, ttsLanguage]);

  const handleSelectChoice = (location: string) => {
    if (selectedLocation) return; // Prevent double taps

    if (location.toLowerCase() === currentObject.location.toLowerCase()) {
      // Correct answer!
      setSelectedLocation(location);
      setWrongLocation(null);
      const newScore = score + 10;
      setScore(newScore);

      const praise = `That's right! ${currentObject.name} is kept ${currentObject.location}.`;
      voiceService.speak(praise, ttsLanguage, undefined, 'HIGH', 'OBJECT_RECALL_PRAISE');

      setTimeout(() => {
        if (currentIndex + 1 < objects.length) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          // Game Completed!
          finishGame(newScore);
        }
      }, 1600);
    } else {
      // Incorrect answer
      setWrongLocation(location);
      const retryVoice = `Let's try again! Think about where you usually find your ${currentObject.name}.`;
      voiceService.speak(retryVoice, ttsLanguage, undefined, 'HIGH', 'OBJECT_RECALL_RETRY');
    }
  };

  const finishGame = async (finalScore: number) => {
    const totalQuestions = objects.length;
    const maxScore = Math.max(totalQuestions * 10, 10);
    const accuracy = Math.round((finalScore / maxScore) * 100);

    const now = new Date().toISOString();
    const res: GameResult = {
      id: `res-${Date.now()}`,
      sessionId: `session-${Date.now()}`,
      patientId: 'p-1',
      gameId: 'PAIR',
      difficulty: 'EASY',
      score: finalScore,
      accuracy,
      durationSeconds: 50,
      attempts: totalQuestions,
      mistakes: Math.max(0, totalQuestions - Math.round(finalScore / 10)),
      hintsUsed: 0,
      startedAt: now,
      completedAt: now,
      status: 'COMPLETED',
    };

    setGameResult(res);
    setShowResultModal(true);
    await gameRepository.saveResult(res).catch(() => {});
  };

  const handlePlayAgain = () => {
    setShowResultModal(false);
    setCurrentIndex(0);
    setScore(0);
    setSelectedLocation(null);
    setWrongLocation(null);
  };

  const objectCardSize = Math.min(width * 0.44, 180);

  return (
    <ScreenContainer scrollable={true} style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          accessibilityLabel="Go Back"
          onPress={() => setShowLeaveModal(true)}
          style={[styles.backSquareBtn, { backgroundColor: isHc ? '#1E293B' : '#FFFFFF' }]}
        >
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#D97706'} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} align="center">
            Objects & Locations
          </Typography>
          <View style={styles.progressPill}>
            <Typography size="xs" weight="bold" color="#D97706">
              Item {currentIndex + 1} of {objects.length || 1}
            </Typography>
          </View>
        </View>

        <ListenButton
          textToSpeak={`Where is the ${currentObject?.name || 'object'} kept? Tap the correct location below.`}
          size="sm"
          variant="secondary"
        />
      </View>

      {/* Prompt Banner */}
      <View style={styles.promptContainer}>
        {wrongLocation ? (
          <View style={styles.wrongBanner}>
            <AlertCircle size={22} color="#DC2626" />
            <Typography size="sm" weight="bold" color="#DC2626" style={{ marginLeft: 8 }}>
              Try again! Think about where you keep this item.
            </Typography>
          </View>
        ) : (
          <Typography size="base" weight="bold" color="#0F172A" align="center">
            📍 Where is this item usually kept?
          </Typography>
        )}
      </View>

      {/* Big Target Object Picture Display */}
      {currentObject && (
        <View style={styles.pictureCardWrapper}>
          <View
            style={[
              styles.objectCard,
              {
                width: objectCardSize,
                height: objectCardSize,
                backgroundColor: isHc ? '#0F172A' : '#FFFBEB',
                borderColor: isHc ? '#FDE68A' : '#FDE68A',
                overflow: 'hidden',
              },
            ]}
          >
            {currentObject.photoUri ? (
              <Image
                source={{ uri: currentObject.photoUri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              renderObjectIcon(currentObject.iconPreset, objectCardSize * 0.52, isHc ? '#FDE68A' : '#D97706')
            )}
          </View>

          <View style={styles.objectNameBadge}>
            <Typography size="base" weight="bold" color="#92400E">
              {currentObject.name}
            </Typography>
          </View>
        </View>
      )}

      {/* Location Choices Stack */}
      <View style={styles.choicesContainer}>
        {choices.map((location) => {
          const isThisCorrect = selectedLocation === location;
          const isThisWrong = wrongLocation === location;

          let btnBg = '#FFFFFF';
          let borderClr = '#E2E8F0';
          let textClr = '#0F172A';

          if (isThisCorrect) {
            btnBg = '#DCFCE7';
            borderClr = '#16A34A';
            textClr = '#15803D';
          } else if (isThisWrong) {
            btnBg = '#FEE2E2';
            borderClr = '#DC2626';
            textClr = '#991B1B';
          }

          return (
            <TouchableOpacity
              key={location}
              activeOpacity={0.8}
              onPress={() => handleSelectChoice(location)}
              style={[
                styles.choiceBtn,
                {
                  backgroundColor: btnBg,
                  borderColor: borderClr,
                },
              ]}
            >
              <View style={styles.choiceIconCircle}>
                {isThisCorrect ? (
                  <CheckCircle2 size={24} color="#16A34A" />
                ) : isThisWrong ? (
                  <XCircle size={24} color="#DC2626" />
                ) : (
                  <MapPin size={22} color="#D97706" />
                )}
              </View>

              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <Typography size="base" weight="bold" color={textClr} style={{ lineHeight: 22 }}>
                  {location}
                </Typography>
              </View>

              {isThisCorrect && (
                <Sparkles size={20} color="#16A34A" style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Result Modal */}
      {gameResult && (
        <GameResultModal
          visible={showResultModal}
          result={gameResult}
          onPlayAgain={handlePlayAgain}
          onGoHome={() => router.replace('/(patient)/recall-memory')}
        />
      )}

      {/* Leave Game Confirmation Modal */}
      <LeaveGameModal
        visible={showLeaveModal}
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={() => {
          setShowLeaveModal(false);
          router.replace('/(patient)/recall-memory');
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    marginBottom: SPACING.xs,
  },
  backSquareBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  headerCenter: {
    alignItems: 'center',
  },
  progressPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    marginTop: 3,
  },
  promptContainer: {
    marginVertical: SPACING.md,
    minHeight: 36,
    justifyContent: 'center',
  },
  wrongBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  pictureCardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.sm,
  },
  objectCard: {
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  objectNameBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  choicesContainer: {
    gap: 12,
    marginTop: SPACING.md,
  },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    minHeight: 64,
  },
  choiceIconCircle: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
