import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Trophy, Star, Target, Clock, ArrowRight, Home, Sparkles } from 'lucide-react-native';
import { Typography } from '../common/Typography';
import { COLORS, SPACING } from '../../constants/theme';
import { GameResult } from '../../types';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export interface GameResultModalProps {
  visible: boolean;
  result: GameResult | null;
  onPlayAgain: () => void;
  onGoHome: () => void;
  playAgainLabel?: string;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  visible,
  result,
  onPlayAgain,
  onGoHome,
  playAgainLabel,
}) => {
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;
  const { width, height } = useWindowDimensions();

  if (!result) return null;

  const score = result.score || 820;
  const accuracy = Math.round(result.accuracy || 100);
  const timeSecs = result.durationSeconds || 15;

  // Responsive calculations
  const cardWidth = Math.min(width * 0.90, 360);
  const isCompactScreen = height < 680;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.dialogCard,
            {
              width: cardWidth,
              backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF',
              paddingVertical: isCompactScreen ? SPACING.md : SPACING.lg,
              paddingHorizontal: isCompactScreen ? SPACING.md : SPACING.lg,
            },
          ]}
        >
          {/* 1. Compact Trophy Badge */}
          <View style={[styles.trophyWrapper, { marginBottom: isCompactScreen ? 4 : SPACING.xs }]}>
            <View style={[styles.trophyCircle, { width: isCompactScreen ? 56 : 64, height: isCompactScreen ? 56 : 64 }]}>
              <Trophy size={isCompactScreen ? 28 : 32} color="#D97706" />
            </View>
          </View>

          {/* 2. Congratulations Titles */}
          <Typography size={isCompactScreen ? "lg" : "xl"} weight="bold" align="center" color={isHc ? COLORS.hcTextPrimary : '#0F172A'}>
            {t('great_job') || 'Great Job!'}
          </Typography>
          <Typography size="sm" align="center" color={COLORS.primary} weight="bold" style={{ marginTop: 2 }}>
            {t('well_done') || 'Well done! Level complete.'}
          </Typography>

          {/* 3. Compact 3-Stat Metric Row */}
          <View
            style={[
              styles.metricsCard,
              {
                backgroundColor: isHc ? COLORS.hcBackground : '#F8FAFC',
                paddingVertical: isCompactScreen ? 10 : SPACING.md,
                marginVertical: isCompactScreen ? 10 : SPACING.md,
              },
            ]}
          >
            {/* Stat 1: Score */}
            <View style={styles.statCol}>
              <View style={[styles.statIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Star size={16} color="#16A34A" />
              </View>
              <Typography size="xs" color={COLORS.textMuted} style={{ marginTop: 4 }}>
                {t('your_score') || 'Score'}
              </Typography>
              <Typography size="base" weight="bold" color="#16A34A">
                {score}
              </Typography>
            </View>

            <View style={styles.statDivider} />

            {/* Stat 2: Accuracy */}
            <View style={styles.statCol}>
              <View style={[styles.statIconCircle, { backgroundColor: '#DBEAFE' }]}>
                <Target size={16} color="#2563EB" />
              </View>
              <Typography size="xs" color={COLORS.textMuted} style={{ marginTop: 4 }}>
                {t('accuracy') || 'Accuracy'}
              </Typography>
              <Typography size="base" weight="bold" color="#2563EB">
                {accuracy}%
              </Typography>
            </View>

            <View style={styles.statDivider} />

            {/* Stat 3: Time Taken */}
            <View style={styles.statCol}>
              <View style={[styles.statIconCircle, { backgroundColor: '#EDE9FE' }]}>
                <Clock size={16} color="#7C3AED" />
              </View>
              <Typography size="xs" color={COLORS.textMuted} style={{ marginTop: 4 }}>
                {t('time_taken') || 'Time'}
              </Typography>
              <Typography size="base" weight="bold" color="#7C3AED">
                {timeSecs}s
              </Typography>
            </View>
          </View>

          {/* 4. Cheerful Encouragement Card (Sharper corners) */}
          <View
            style={[
              styles.cheerCard,
              {
                marginBottom: isCompactScreen ? 10 : SPACING.md,
                paddingVertical: isCompactScreen ? 8 : 10,
              },
            ]}
          >
            <Sparkles size={16} color="#D97706" style={{ marginRight: 6, flexShrink: 0 }} />
            <Typography size="xs" weight="bold" color="#92400E" align="center" style={{ flexShrink: 1 }}>
              {t('brain_stronger_msg') || 'Every game keeps your brain active & sharp!'}
            </Typography>
          </View>

          {/* 5. Action Buttons (Crisp, sharp corners) */}
          <View style={styles.actionsStack}>
            {/* Primary Action Button: NEXT LEVEL */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={onPlayAgain}
              style={[styles.primaryActionBtn, { paddingVertical: isCompactScreen ? 12 : 14 }]}
            >
              <Typography size="base" weight="bold" color="#FFFFFF">
                {playAgainLabel || t('next_level') || 'NEXT LEVEL'}
              </Typography>
              <ArrowRight size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            {/* Secondary Action Button: Back to Games */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onGoHome}
              style={[styles.secondaryActionBtn, { paddingVertical: isCompactScreen ? 8 : 10 }]}
            >
              <Home size={18} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
              <Typography size="sm" weight="bold" color={COLORS.textSecondary}>
                {t('back_to_home') || 'Back to Games Hub'}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  dialogCard: {
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 8,
  },
  trophyWrapper: {
    alignItems: 'center',
  },
  trophyCircle: {
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#FDE68A',
  },
  metricsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: SPACING.xs,
    borderWidth: 0,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
    opacity: 0.6,
  },
  cheerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 0,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    width: '100%',
  },
  actionsStack: {
    width: '100%',
    gap: SPACING.xs,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 12,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
});
