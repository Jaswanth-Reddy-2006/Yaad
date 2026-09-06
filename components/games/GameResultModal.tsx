import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Trophy, Star, Target, Clock, ArrowRight, Home, Sparkles, AlertCircle, LogOut } from 'lucide-react-native';
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
            {accuracy === 100 ? (t('perfect_memory') || '🌟 Perfect Memory!') : (t('great_effort') || '🎉 Great Job!')}
          </Typography>
          <Typography size="xs" color={COLORS.textSecondary} align="center" style={{ marginTop: 2, marginBottom: isCompactScreen ? SPACING.sm : SPACING.md }}>
            {t('game_completed_sub') || 'You finished this cognitive round successfully.'}
          </Typography>

          {/* 3. Three Metrics in Clean Row */}
          <View
            style={[
              styles.metricsCard,
              {
                backgroundColor: isHc ? '#1E293B' : '#F8FAFC',
                borderColor: isHc ? COLORS.hcBorder : '#E2E8F0',
                paddingVertical: isCompactScreen ? 8 : 10,
                marginBottom: isCompactScreen ? SPACING.sm : SPACING.md,
              },
            ]}
          >
            {/* Score */}
            <View style={styles.statCol}>
              <View style={[styles.statIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Star size={16} color="#D97706" />
              </View>
              <Typography size={isCompactScreen ? "base" : "lg"} weight="bold" color="#D97706" style={{ marginTop: 2 }}>
                {score}
              </Typography>
              <Typography size="xs" color={COLORS.textMuted}>
                {t('stat_score') || 'Points'}
              </Typography>
            </View>

            <View style={styles.statDivider} />

            {/* Accuracy */}
            <View style={styles.statCol}>
              <View style={[styles.statIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Target size={16} color="#16A34A" />
              </View>
              <Typography size={isCompactScreen ? "base" : "lg"} weight="bold" color="#16A34A" style={{ marginTop: 2 }}>
                {accuracy}%
              </Typography>
              <Typography size="xs" color={COLORS.textMuted}>
                {t('stat_accuracy') || 'Accuracy'}
              </Typography>
            </View>

            <View style={styles.statDivider} />

            {/* Time */}
            <View style={styles.statCol}>
              <View style={[styles.statIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Clock size={16} color="#2563EB" />
              </View>
              <Typography size={isCompactScreen ? "base" : "lg"} weight="bold" color="#2563EB" style={{ marginTop: 2 }}>
                {timeSecs}s
              </Typography>
              <Typography size="xs" color={COLORS.textMuted}>
                {t('stat_time') || 'Time'}
              </Typography>
            </View>
          </View>

          {/* 4. Encouragement Banner */}
          <View
            style={[
              styles.cheerCard,
              {
                paddingVertical: isCompactScreen ? 6 : 8,
                marginBottom: isCompactScreen ? SPACING.md : SPACING.lg,
              },
            ]}
          >
            <Sparkles size={16} color="#D97706" style={{ marginRight: 6 }} />
            <Typography size="xs" weight="bold" color="#B45309" align="center">
              {t('brain_workout_cheer') || 'Daily brain exercise keeps memory sharp!'}
            </Typography>
          </View>

          {/* 5. Action Buttons Stack */}
          <View style={styles.actionsStack}>
            {/* Primary Action Button: Play Again / Next Level */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={onPlayAgain}
              style={[styles.primaryActionBtn, { paddingVertical: isCompactScreen ? 12 : 14 }]}
            >
              <Typography size="base" weight="bold" color="#FFFFFF" style={{ marginRight: 6 }}>
                {playAgainLabel || t('play_again') || 'Play Next Round'}
              </Typography>
              <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.5} />
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

// =============================================================
// UNIFIED LEAVE GAME MODAL (Standardized across all Yaad games)
// =============================================================

export interface LeaveGameModalProps {
  visible: boolean;
  gameTitle?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const LeaveGameModal: React.FC<LeaveGameModalProps> = ({
  visible,
  gameTitle = 'this game',
  onCancel,
  onConfirm,
}) => {
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.leaveOverlay}>
        <View style={[styles.leaveCard, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' }]}>
          <AlertCircle size={44} color="#D97706" style={{ marginBottom: SPACING.sm }} />
          <Typography size="lg" weight="bold" align="center" color={isHc ? COLORS.hcTextPrimary : '#0F172A'}>
            {t('leave_game_title') || 'Leave Game?'}
          </Typography>
          <Typography size="sm" color={COLORS.textSecondary} align="center" style={{ marginTop: 6, marginBottom: SPACING.lg }}>
            {t('leave_game_msg') || `Are you sure you want to stop playing ${gameTitle}?`}
          </Typography>
          <View style={styles.leaveActionsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              accessibilityRole="button"
              onPress={onCancel}
              style={[styles.leaveCancelBtn, { borderColor: '#CBD5E1' }]}
            >
              <Typography size="sm" weight="bold" color="#475569">
                {t('stay_here') || 'Stay & Play'}
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              accessibilityRole="button"
              onPress={onConfirm}
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
    borderRadius: 8,
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
    borderRadius: 8,
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
    borderRadius: 8,
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
    borderRadius: 6,
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
    borderRadius: 6,
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
    borderRadius: 8,
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
    borderRadius: 6,
  },
  leaveOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  leaveCard: {
    width: '90%',
    maxWidth: 360,
    borderRadius: 8,
    padding: SPACING.lg,
    alignItems: 'center',
    elevation: 5,
  },
  leaveActionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
  },
  leaveCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
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
    borderRadius: 6,
  },
});
