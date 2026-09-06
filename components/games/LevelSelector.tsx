import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../common/Typography';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { GameDifficulty } from '../../types';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export interface LevelOption {
  key: GameDifficulty;
  levelNum: number;
  label: string;
  subtitle?: string;
}

export interface LevelSelectorProps {
  currentLevel: GameDifficulty;
  onSelectLevel: (level: GameDifficulty) => void;
  options?: LevelOption[];
  themeColor?: string;
}

const DEFAULT_LEVEL_OPTIONS: LevelOption[] = [
  { key: 'EASY', levelNum: 1, label: 'Level 1' },
  { key: 'MEDIUM', levelNum: 2, label: 'Level 2' },
  { key: 'HARD', levelNum: 3, label: 'Level 3' },
  { key: 'EXPERT', levelNum: 4, label: 'Level 4' },
];

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  currentLevel,
  onSelectLevel,
  options = DEFAULT_LEVEL_OPTIONS,
  themeColor = '#6D28D9',
}) => {
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  return (
    <View style={styles.container}>
      <View style={styles.levelRow}>
        {options.map((opt) => {
          const isActive = currentLevel === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`${opt.label} ${opt.subtitle || ''}`}
              accessibilityState={{ selected: isActive }}
              onPress={() => onSelectLevel(opt.key)}
              style={[
                styles.levelPill,
                {
                  backgroundColor: isActive
                    ? themeColor
                    : isHc
                    ? COLORS.hcCardBackground
                    : '#FFFFFF',
                  borderColor: isActive
                    ? themeColor
                    : isHc
                    ? COLORS.hcBorder
                    : '#E2E8F0',
                },
              ]}
            >
              <Typography
                size="xs"
                weight="bold"
                color={isActive ? '#FFFFFF' : isHc ? COLORS.hcTextPrimary : COLORS.textPrimary}
              >
                {opt.label}
              </Typography>
              {opt.subtitle ? (
                <Typography
                  size="xs"
                  color={isActive ? '#F3E8FF' : COLORS.textMuted}
                  style={{ marginTop: 1, fontSize: 10, lineHeight: 12 }}
                >
                  {opt.subtitle}
                </Typography>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
  },
  levelPill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
