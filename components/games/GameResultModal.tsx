import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Trophy, Star, Target, Clock, ArrowRight, Home, Sparkles } from 'lucide-react-native';
import { Typography } from '../common/Typography';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
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

  if (!result) return null;

  const score = result.score || 820;
  const accuracy = Math.round(result.accuracy || 100);
  const timeSecs = result.durationSeconds || 15;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.dialogCard, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' }]}>
          {/* 1. Compact Trophy Badge */}
          <View style={styles.trophyWrapper}>
            <View style={styles.trophyCircle}>
              <Trophy size={36} color="#D97706" />
            </View>
          </View>

          {/* 2. Congratulations Titles */}
          <Typography size="xl" weight="bold" align="center" color={isHc ? COLORS.hcTextPrimary : '#0F172A'}>
            {t('great_job') || 'Great Job!'}
          </Typography>
          <Typography size="sm" align="center" color={COLORS.primary} weight="bold" style={{ marginTop: 2 }}>
            {t('well_done') || 'Well done! Level complete.'}
          </Typography>

          {/* 3. Compact 3-Stat Metric Row (No overlap, clean spacing) */}
          <View style={[styles.metricsCard, { backgroundColor: isHc ? COLORS.hcBackground : '#F8FAFC' }]}>
            {/* Stat 1: Score */}
            <View style={styles.statCol}>
              <View style={[styles.statIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Star size={18} color="#16A34A" />
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
                <Target size={18} color="#2563EB" />
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
                <Clock size={18} color="#7C3AED" />
              </View>
              <Typography size="xs" color={COLORS.textMuted} style={{ marginTop: 4 }}>
                {t('time_taken') || 'Time'}
              </Typography>
              <Typography size="base" weight="bold" color="#7C3AED">
                {timeSecs}s
              </Typography>
            </View>
          </View>

          {/* 4. Cheerful Encouragement Pill */}
          <View style={styles.cheerPill}>
            <Sparkles size={16} color="#D97706" style={{ marginRight: 6 }} />
            <Typography size="xs" weight="bold" color="#92400E">
              {t('brain_stronger_msg') || 'Every game keeps your brain active & sharp!'}
            </Typography>
          </View>

          {/* 5. Action Buttons (Clean & Sleek) */}
          <View style={styles.actionsStack}>
            {/* Primary Action Button: NEXT LEVEL */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={onPlayAgain}
              style={styles.primaryActionBtn}
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
              style={styles.secondaryActionBtn}
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
    width: '100%',
    maxWidth: 360,
    borderRadius: RADIUS.xxl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  trophyWrapper: {
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  trophyCircle: {
    width: 68,
    height: 68,
    borderRadius: RADIUS.full,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3.5,
    borderColor: '#FDE68A',
  },
  metricsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    marginVertical: SPACING.md,
    borderWidth: 0,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
    opacity: 0.6,
  },
  cheerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 0,
    borderRadius: RADIUS.full,
    paddingVertical: 7,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
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
    paddingVertical: 13,
    borderRadius: RADIUS.full,
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
    paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
});
