import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Trophy, Star, Target, Clock, Lightbulb, RefreshCw, Home, Sun } from 'lucide-react-native';
import { Typography } from '../common/Typography';
import { Button } from '../common/Button';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { GameResult } from '../../types';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export interface GameResultModalProps {
  visible: boolean;
  result: GameResult | null;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const GameResultModal: React.FC<GameResultModalProps> = ({
  visible,
  result,
  onPlayAgain,
  onGoHome,
}) => {
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  if (!result) return null;

  const score = result.score || 820;
  const accuracy = Math.round(result.accuracy || 100);
  const timeSecs = result.durationSeconds || 15;
  const hints = result.hintsUsed || 0;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.dialogCard, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' }]}>
          {/* Top Hero Trophy Illustration with Confetti */}
          <View style={styles.trophyWrapper}>
            <View style={styles.confettiCircle}>
              <Trophy size={56} color="#D97706" />
            </View>
          </View>

          {/* Congratulations Title & Subtitle */}
          <Typography size="xxl" weight="bold" align="center" color={isHc ? COLORS.hcTextPrimary : '#0F172A'}>
            Great Job!
          </Typography>

          <Typography size="base" align="center" color={COLORS.textSecondary} style={{ marginTop: 4 }}>
            You matched all the pairs.
          </Typography>

          <Typography size="lg" weight="bold" align="center" color={COLORS.primary} style={{ marginTop: 2 }}>
            Well done!
          </Typography>

          {/* 4-Stat Metric Performance Card (Matching Reference UI Image) */}
          <View style={[styles.metricsCard, { backgroundColor: isHc ? COLORS.hcBackground : '#F8FAF8' }]}>
            {/* Top Row */}
            <View style={styles.metricsRow}>
              {/* Stat 1: Your Score */}
              <View style={styles.statBox}>
                <View style={[styles.statIconBadge, { backgroundColor: '#DCFCE7' }]}>
                  <Star size={20} color={COLORS.primary} />
                </View>
                <View style={{ marginLeft: SPACING.xs }}>
                  <Typography size="xs" color={COLORS.textMuted}>
                    Your Score
                  </Typography>
                  <Typography size="xl" weight="bold" color={COLORS.primary}>
                    {score} <Typography size="xs" weight="bold" color={COLORS.primary}>pts</Typography>
                  </Typography>
                </View>
              </View>

              <View style={styles.verticalDivider} />

              {/* Stat 2: Accuracy */}
              <View style={styles.statBox}>
                <View style={[styles.statIconBadge, { backgroundColor: '#DBEAFE' }]}>
                  <Target size={20} color={COLORS.gameBlue} />
                </View>
                <View style={{ marginLeft: SPACING.xs }}>
                  <Typography size="xs" color={COLORS.textMuted}>
                    Accuracy
                  </Typography>
                  <Typography size="xl" weight="bold" color={COLORS.gameBlue}>
                    {accuracy}%
                  </Typography>
                </View>
              </View>
            </View>

            <View style={styles.horizontalDivider} />

            {/* Bottom Row */}
            <View style={styles.metricsRow}>
              {/* Stat 3: Time Taken */}
              <View style={styles.statBox}>
                <View style={[styles.statIconBadge, { backgroundColor: '#EDE9FE' }]}>
                  <Clock size={20} color={COLORS.memoryPurple} />
                </View>
                <View style={{ marginLeft: SPACING.xs }}>
                  <Typography size="xs" color={COLORS.textMuted}>
                    Time Taken
                  </Typography>
                  <Typography size="xl" weight="bold" color={COLORS.memoryPurple}>
                    {timeSecs} <Typography size="xs" weight="bold" color={COLORS.memoryPurple}>sec</Typography>
                  </Typography>
                </View>
              </View>

              <View style={styles.verticalDivider} />

              {/* Stat 4: Hints Used */}
              <View style={styles.statBox}>
                <View style={[styles.statIconBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Lightbulb size={20} color={COLORS.warning} />
                </View>
                <View style={{ marginLeft: SPACING.xs }}>
                  <Typography size="xs" color={COLORS.textMuted}>
                    Hints Used
                  </Typography>
                  <Typography size="xl" weight="bold" color={COLORS.warning}>
                    {hints}
                  </Typography>
                </View>
              </View>
            </View>
          </View>

          {/* Encouragement Banner (Smiling Sun) */}
          <View style={styles.encouragementBanner}>
            <View style={styles.sunIconWrapper}>
              <Sun size={36} color="#F59E0B" />
            </View>
            <View style={{ flex: 1, marginLeft: SPACING.sm }}>
              <Typography size="base" weight="bold" color="#92400E">
                Keep it up!
              </Typography>
              <Typography size="xs" color="#B45309" style={{ marginTop: 2, lineHeight: 18 }}>
                You're doing amazing. Every game makes your brain stronger!
              </Typography>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {/* Primary Solid Green: Play Again */}
            <Button
              title="Play Again"
              variant="primary"
              icon={<RefreshCw size={22} color="#FFFFFF" />}
              onPress={onPlayAgain}
              style={styles.playAgainBtn}
            />

            {/* Outline Green: Back to Home */}
            <Button
              title="Back to Home"
              variant="outline"
              icon={<Home size={22} color={COLORS.primary} />}
              onPress={onGoHome}
              style={styles.backHomeBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  trophyWrapper: {
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  confettiCircle: {
    width: 100,
    height: 100,
    borderRadius: RADIUS.full,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FDE68A',
  },
  metricsCard: {
    width: '100%',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: SPACING.xs,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconBadge: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
    marginHorizontal: SPACING.xs,
  },
  horizontalDivider: {
    height: 1,
    width: '100%',
    backgroundColor: '#E2E8F0',
    marginVertical: SPACING.xs,
  },
  encouragementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#FDE68A',
    width: '100%',
  },
  sunIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonsContainer: {
    width: '100%',
  },
  playAgainBtn: {
    backgroundColor: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  backHomeBtn: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
});
