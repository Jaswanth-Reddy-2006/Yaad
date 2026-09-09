import React, { useState, useEffect, useRef } from 'react';
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
  Users,
  Heart,
  Sparkles,
  User,
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
import { FamilyMemberRecallItem, GameResult } from '../../../types';
import { gameRepository } from '../../../repositories/GameRepository';

export default function FamilyRecallGameScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { preferences, currentLanguage, t } = useAccessibilityStore();
  const { ttsLanguage } = useVoiceStore();
  const isHc = preferences.highContrast;

  const [members, setMembers] = useState<FamilyMemberRecallItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [choices, setChoices] = useState<FamilyMemberRecallItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  // Load family members configured by caregiver
  useEffect(() => {
    async function loadFamily() {
      const list = await offlineProximitySync.getFamilyMembers();
      if (list && list.length > 0) {
        setMembers(list);
      }
    }
    loadFamily();
  }, []);

  const currentMember = members[currentIndex] || members[0];

  // Prepare choices whenever current member changes
  useEffect(() => {
    if (!currentMember || members.length === 0) return;

    // Pick distractors from other members or fallback presets
    const others = members.filter((m) => m.id !== currentMember.id);
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5);
    const pickedDistractors = shuffledOthers.slice(0, 2);

    // Fallback if caregiver only entered 1 member
    if (pickedDistractors.length === 0) {
      pickedDistractors.push({
        id: 'dist-1',
        patientId: 'p-1',
        name: 'Ramesh',
        relation: 'Brother',
        avatarBg: '#DCFCE7',
      });
      pickedDistractors.push({
        id: 'dist-2',
        patientId: 'p-1',
        name: 'Lakshmi',
        relation: 'Sister',
        avatarBg: '#FEF3C7',
      });
    } else if (pickedDistractors.length === 1) {
      pickedDistractors.push({
        id: 'dist-2',
        patientId: 'p-1',
        name: 'Ravi',
        relation: 'Grandson',
        avatarBg: '#DBEAFE',
      });
    }

    const roundChoices = [currentMember, ...pickedDistractors].sort(() => Math.random() - 0.5);
    setChoices(roundChoices);
    setSelectedId(null);
    setWrongId(null);

    // Voice prompt
    const promptText = `Who is this family member? Tap the correct name below.`;
    voiceService.speak(promptText, ttsLanguage, undefined, 'NORMAL', 'FAMILY_RECALL_PROMPT');
  }, [currentIndex, currentMember, members, ttsLanguage]);

  const handleSelectChoice = (choice: FamilyMemberRecallItem) => {
    if (selectedId) return; // Prevent double taps

    if (choice.id === currentMember.id) {
      // Correct answer!
      setSelectedId(choice.id);
      setWrongId(null);
      const newScore = score + 10;
      setScore(newScore);

      const praise = `That's right! This is ${currentMember.name}, your ${currentMember.relation}.`;
      voiceService.speak(praise, ttsLanguage, undefined, 'HIGH', 'FAMILY_RECALL_PRAISE');

      setTimeout(() => {
        if (currentIndex + 1 < members.length) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          // Game Completed!
          finishGame(newScore);
        }
      }, 1600);
    } else {
      // Incorrect answer
      setWrongId(choice.id);
      const retryVoice = `Let's try again! Think about your ${currentMember.relation}.`;
      voiceService.speak(retryVoice, ttsLanguage, undefined, 'HIGH', 'FAMILY_RECALL_RETRY');
    }
  };

  const finishGame = async (finalScore: number) => {
    const totalQuestions = members.length;
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
      durationSeconds: 45,
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
    setSelectedId(null);
    setWrongId(null);
  };

  const avatarSize = Math.min(width * 0.44, 180);

  return (
    <ScreenContainer scrollable={true} style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          accessibilityLabel="Go Back"
          onPress={() => setShowLeaveModal(true)}
          style={[styles.backSquareBtn, { backgroundColor: isHc ? '#1E293B' : '#FFFFFF' }]}
        >
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#16A34A'} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Typography size="lg" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} align="center">
            Family & Loved Ones
          </Typography>
          <View style={styles.progressPill}>
            <Typography size="xs" weight="bold" color="#16A34A">
              Person {currentIndex + 1} of {members.length || 1}
            </Typography>
          </View>
        </View>

        <ListenButton
          textToSpeak={`Who is this family member? Look closely at the picture and tap their name.`}
          size="sm"
          variant="secondary"
        />
      </View>

      {/* Prompt Banner */}
      <View style={styles.promptContainer}>
        {wrongId ? (
          <View style={styles.wrongBanner}>
            <AlertCircle size={22} color="#DC2626" />
            <Typography size="sm" weight="bold" color="#DC2626" style={{ marginLeft: 8 }}>
              Try again! Think about your {currentMember?.relation}.
            </Typography>
          </View>
        ) : (
          <Typography size="base" weight="bold" color="#0F172A" align="center">
            ❤️ Who is this dear family member?
          </Typography>
        )}
      </View>

      {/* Family Member Picture Card */}
      {currentMember && (
        <View style={styles.pictureCardWrapper}>
          <View
            style={[
              styles.personCard,
              {
                width: avatarSize,
                height: avatarSize,
                backgroundColor: isHc ? '#0F172A' : currentMember.avatarBg || '#DCFCE7',
                borderColor: isHc ? '#86EFAC' : '#86EFAC',
                overflow: 'hidden',
              },
            ]}
          >
            {currentMember.photoUri ? (
              <Image
                source={{ uri: currentMember.photoUri }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <User size={avatarSize * 0.55} color={isHc ? '#86EFAC' : '#15803D'} strokeWidth={1.8} />
            )}
          </View>

          <View style={styles.relationHintBadge}>
            <Heart size={14} color="#DC2626" style={{ marginRight: 5 }} />
            <Typography size="xs" weight="bold" color="#991B1B">
              Relation: {currentMember.relation}
            </Typography>
          </View>
        </View>
      )}

      {/* Choices Stack */}
      <View style={styles.choicesContainer}>
        {choices.map((choice) => {
          const isThisCorrect = selectedId === choice.id;
          const isThisWrong = wrongId === choice.id;

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
              key={choice.id}
              activeOpacity={0.8}
              onPress={() => handleSelectChoice(choice)}
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
                  <User size={22} color="#64748B" />
                )}
              </View>

              <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                <Typography size="lg" weight="bold" color={textClr}>
                  {choice.name}
                </Typography>
                <Typography size="xs" color="#64748B">
                  {choice.relation}
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
    backgroundColor: '#DCFCE7',
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
  personCard: {
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
  relationHintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: '#FCA5A5',
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
    backgroundColor: '#F8FAF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
