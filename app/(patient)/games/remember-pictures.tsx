import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  RefreshCw,
  Apple,
  Home as HomeIcon,
  Flower2,
  Car,
  CircleDot,
  Umbrella,
  Trees,
  Coffee,
  Clock,
} from 'lucide-react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppHeader } from '../../../components/common/AppHeader';
import { Card } from '../../../components/common/Card';
import { Typography } from '../../../components/common/Typography';
import { Button } from '../../../components/common/Button';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { useAccessibilityStore } from '../../../store/useAccessibilityStore';

interface PictureItem {
  id: string;
  title: string;
  iconName: string;
  isTarget: boolean;
}

const ALL_PICTURES: PictureItem[] = [
  { id: '1', title: 'Apple', iconName: 'Apple', isTarget: true },
  { id: '2', title: 'Chair', iconName: 'HomeIcon', isTarget: true },
  { id: '3', title: 'Flower', iconName: 'Flower2', isTarget: true },
  { id: '4', title: 'Car', iconName: 'Car', isTarget: false },
  { id: '5', title: 'Beach Ball', iconName: 'CircleDot', isTarget: false },
  { id: '6', title: 'Umbrella', iconName: 'Umbrella', isTarget: false },
  { id: '7', title: 'Tree', iconName: 'Trees', isTarget: false },
  { id: '8', title: 'Cup', iconName: 'Coffee', isTarget: false },
  { id: '9', title: 'Clock', iconName: 'Clock', isTarget: false },
];

const renderIcon = (name: string, size: number, color: string) => {
  switch (name) {
    case 'Apple':
      return <Apple size={size} color={color} />;
    case 'HomeIcon':
      return <HomeIcon size={size} color={color} />;
    case 'Flower2':
      return <Flower2 size={size} color={color} />;
    case 'Car':
      return <Car size={size} color={color} />;
    case 'CircleDot':
      return <CircleDot size={size} color={color} />;
    case 'Umbrella':
      return <Umbrella size={size} color={color} />;
    case 'Trees':
      return <Trees size={size} color={color} />;
    case 'Coffee':
      return <Coffee size={size} color={color} />;
    case 'Clock':
      return <Clock size={size} color={color} />;
    default:
      return <Apple size={size} color={color} />;
  }
};

export default function RememberPicturesGameScreen() {
  const router = useRouter();
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const [phase, setPhase] = useState<'LOOK' | 'TEST' | 'RESULT'>('LOOK');
  const [countdown, setCountdown] = useState(5);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);

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

  return (
    <ScreenContainer scrollable>
      <AppHeader
        title="Remember Pictures"
        showBack
      />

      {/* Instruction Card */}
      <Card style={styles.instructionCard}>
        <Typography size="lg" weight="bold" align="center" color={COLORS.primaryDark}>
          {phase === 'LOOK'
            ? 'Look at the pictures carefully for 5 seconds.'
            : phase === 'TEST'
            ? 'What did you see? Tap on the pictures.'
            : 'Game Result'}
        </Typography>
      </Card>

      {/* 3x3 Grid of Pictures */}
      <View style={styles.gridContainer}>
        {ALL_PICTURES.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const iconColor = isSelected ? COLORS.primary : isHc ? COLORS.hcTextPrimary : COLORS.textPrimary;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              disabled={phase !== 'TEST'}
              onPress={() => handleSelect(item.id)}
              style={[
                styles.gridTile,
                isSelected ? styles.selectedTile : null,
                { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' },
              ]}
            >
              {renderIcon(item.iconName, 36, iconColor)}
              <Typography size="xs" weight="bold" align="center" style={{ marginTop: 4 }}>
                {item.title}
              </Typography>
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
          <Typography size="base" weight="semibold" color={COLORS.textMuted} style={{ marginTop: SPACING.xs }}>
            Get ready...
          </Typography>
        </View>
      ) : null}

      {/* PHASE 2: Selection Boxes & Action Buttons */}
      {phase === 'TEST' ? (
        <View style={styles.testActionsContainer}>
          {/* 3 Selection Slots */}
          <View style={styles.slotsRow}>
            {[0, 1, 2].map((idx) => {
              const selectedItem = ALL_PICTURES.find((p) => p.id === selectedIds[idx]);
              return (
                <View key={idx} style={styles.slotBox}>
                  {selectedItem ? (
                    renderIcon(selectedItem.iconName, 28, COLORS.primary)
                  ) : null}
                </View>
              );
            })}
          </View>

          {/* Submit Button */}
          <Button
            title="Submit"
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
          <Typography size="xxl" weight="bold" align="center" color={COLORS.primary}>
            Score: {score} / 3
          </Typography>
          <Typography size="base" color={COLORS.textMuted} align="center" style={{ marginTop: 4 }}>
            {score === 3 ? 'Perfect Memory!' : 'Keep practicing every day.'}
          </Typography>

          <Button
            title="Play Again"
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
  instructionCard: {
    marginVertical: SPACING.xs,
    padding: SPACING.md,
    backgroundColor: COLORS.primaryLight,
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
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    borderWidth: 2,
    borderColor: COLORS.surfaceVariant,
    padding: SPACING.xs,
  },
  selectedTile: {
    borderColor: COLORS.primary,
    backgroundColor: '#DCFCE7',
  },
  countdownContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  countdownRing: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    borderWidth: 4,
    borderColor: COLORS.warning,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
  },
  resultCard: {
    marginVertical: SPACING.md,
    padding: SPACING.lg,
  },
});
