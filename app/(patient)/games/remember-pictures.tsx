import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { RefreshCw, ArrowLeft } from 'lucide-react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { Card } from '../../../components/common/Card';
import { Typography } from '../../../components/common/Typography';
import { Button } from '../../../components/common/Button';
import { ListenButton } from '../../../components/common/ListenButton';
import { GamePicture } from '../../../components/games/GamePicture';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';

interface PictureItem {
  id: string;
  symbolId: string;
  titleKey: string;
  fallbackTitle: string;
  isTarget: boolean;
}

const ALL_PICTURES: PictureItem[] = [
  { id: '1', symbolId: 'apple', titleKey: 'apple', fallbackTitle: 'Apple', isTarget: true },
  { id: '2', symbolId: 'banana', titleKey: 'banana', fallbackTitle: 'Banana', isTarget: true },
  { id: '3', symbolId: 'flower', titleKey: 'flower', fallbackTitle: 'Flower', isTarget: true },
  { id: '4', symbolId: 'cup', titleKey: 'cup', fallbackTitle: 'Cup', isTarget: false },
  { id: '5', symbolId: 'umbrella', titleKey: 'umbrella', fallbackTitle: 'Umbrella', isTarget: false },
  { id: '6', symbolId: 'mango', titleKey: 'mango', fallbackTitle: 'Mango', isTarget: false },
  { id: '7', symbolId: 'bicycle', titleKey: 'bicycle', fallbackTitle: 'Bicycle', isTarget: false },
  { id: '8', symbolId: 'house', titleKey: 'house', fallbackTitle: 'House', isTarget: false },
  { id: '9', symbolId: 'glasses', titleKey: 'glasses', fallbackTitle: 'Glasses', isTarget: false },
];

export default function RememberPicturesGameScreen() {
  const router = useRouter();
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;
  const { width: screenWidth } = useWindowDimensions();

  const [phase, setPhase] = useState<'LOOK' | 'TEST' | 'RESULT'>('LOOK');
  const [countdown, setCountdown] = useState(5);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const tilePicSize = Math.min(72, Math.max(48, Math.floor(screenWidth * 0.16)));
  const slotPicSize = Math.min(46, Math.max(34, Math.floor(screenWidth * 0.10)));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase('TEST');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSelect = (id: string) => {
    if (phase !== 'TEST') return;
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSubmit = () => {
    const targets = ALL_PICTURES.filter((p) => p.isTarget).map((p) => p.id);
    const correctCount = selectedIds.filter((id) => targets.includes(id)).length;
    setScore(correctCount);
    setPhase('RESULT');
  };

  const handleRestart = () => {
    setSelectedIds([]);
    setCountdown(5);
    setPhase('LOOK');
  };

  const currentSpeech =
    phase === 'LOOK'
      ? 'Look carefully at the pictures. Memorize them before time runs out.'
      : phase === 'TEST'
      ? 'Which pictures did you see earlier? Tap 3 pictures to select them.'
      : `Game completed! You remembered ${score} out of 3 pictures correctly.`;

  return (
    <ScreenContainer scrollable={true} style={styles.container}>
      {/* Top Navigation Row: Back Button & Listen Button */}
      <View style={styles.navRow}>
        <TouchableOpacity
          accessibilityLabel={t('go_back') || 'Go Back'}
          accessibilityRole="button"
          onPress={() => router.back()}
          style={[styles.backSquareBtn, { backgroundColor: isHc ? '#1E293B' : '#FFFFFF' }]}
        >
          <ArrowLeft size={24} color={isHc ? COLORS.hcTextPrimary : '#15803D'} strokeWidth={2.5} />
        </TouchableOpacity>

        <ListenButton
          textToSpeak={currentSpeech}
          label="LISTEN"
          size="sm"
          variant="secondary"
        />
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Typography size="xxl" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'} align="center">
          {t('remember_the_pictures') || 'Remember the Pictures'}
        </Typography>
      </View>

      {/* Instruction Card */}
      <Card
        style={[
          styles.instructionCard,
          { backgroundColor: isHc ? COLORS.hcCardBackground : '#F0FDF4', borderColor: '#BBF7D0' },
        ]}
      >
        <Typography size="base" weight="bold" align="center" color={isHc ? COLORS.hcTextPrimary : '#15803D'}>
          {phase === 'LOOK'
            ? t('memorize_pictures_instruction') || '👀 Look carefully and remember these pictures!'
            : phase === 'TEST'
            ? t('what_did_you_see') || '🤔 Which pictures did you see? Tap 3 pictures.'
            : t('game_result') || '🎉 Game Result'}
        </Typography>
      </Card>

      {/* 3x3 Grid of Pictures */}
      <View style={styles.gridContainer}>
        {ALL_PICTURES.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const isTargetInLookPhase = phase === 'LOOK' && item.isTarget;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              disabled={phase !== 'TEST'}
              onPress={() => handleSelect(item.id)}
              style={[
                styles.gridTile,
                isSelected ? styles.selectedTile : null,
                isTargetInLookPhase ? styles.targetGlowTile : null,
                { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' },
              ]}
            >
              <GamePicture
                symbolId={item.symbolId}
                size={tilePicSize}
                showLabel={false}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* PHASE 1: Countdown Ring */}
      {phase === 'LOOK' ? (
        <View style={styles.countdownContainer}>
          <View style={styles.countdownRing}>
            <Typography size="giant" weight="bold" color={COLORS.warning}>
              {countdown}
            </Typography>
          </View>
          <Typography size="base" weight="bold" color={COLORS.textMuted} style={{ marginTop: SPACING.xs }}>
            {t('get_ready') || 'Memorize now...'}
          </Typography>
        </View>
      ) : null}

      {/* PHASE 2: Selection Slots & Large Submit Button */}
      {phase === 'TEST' ? (
        <View style={styles.testActionsContainer}>
          {/* 3 Selection Slots */}
          <View style={styles.slotsRow}>
            {[0, 1, 2].map((idx) => {
              const selectedItem = ALL_PICTURES.find((p) => p.id === selectedIds[idx]);
              return (
                <View key={idx} style={styles.slotBox}>
                  {selectedItem ? (
                    <GamePicture
                      symbolId={selectedItem.symbolId}
                      size={slotPicSize}
                      showLabel={false}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>

          {/* Submit Button */}
          <Button
            title={t('submit') || 'SUBMIT'}
            variant="primary"
            disabled={selectedIds.length !== 3}
            onPress={handleSubmit}
            style={styles.submitBtn}
          />
        </View>
      ) : null}

      {/* RESULT PHASE */}
      {phase === 'RESULT' ? (
        <Card style={styles.resultCard}>
          <Typography size="xxl" weight="bold" align="center" color="#15803D">
            {t('score_label') || 'Score'}: {score} / 3
          </Typography>
          <Typography size="base" color={COLORS.textMuted} align="center" style={{ marginTop: 4 }}>
            {score === 3
              ? (t('perfect_memory') || '🌟 Perfect! You remembered all 3 pictures!')
              : (t('keep_practicing') || '👏 Great effort! Keep exercising your memory.')}
          </Typography>

          <Button
            title={t('play_again') || 'PLAY AGAIN'}
            variant="primary"
            icon={<RefreshCw size={22} color="#FFFFFF" />}
            onPress={handleRestart}
            style={{ marginTop: SPACING.md }}
          />
        </Card>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: SPACING.xl,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  titleSection: {
    alignItems: 'center',
    marginTop: SPACING.xs,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionCard: {
    marginVertical: SPACING.xs,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: SPACING.sm,
  },
  gridTile: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedTile: {
    borderColor: '#16A34A',
    borderWidth: 3,
    backgroundColor: '#DCFCE7',
  },
  targetGlowTile: {
    borderColor: '#F59E0B',
    borderWidth: 3,
    backgroundColor: '#FEF3C7',
  },
  countdownContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  countdownRing: {
    width: 76,
    height: 76,
    borderRadius: RADIUS.full,
    borderWidth: 4.5,
    borderColor: COLORS.warning,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
  },
  testActionsContainer: {
    marginVertical: SPACING.sm,
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  slotBox: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    borderWidth: 2.5,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  submitBtn: {
    backgroundColor: '#16A34A',
  },
  resultCard: {
    marginVertical: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
  },
});
