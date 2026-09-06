import React from 'react';
import { View, StyleSheet, Modal, ScrollView } from 'react-native';
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
  const hints = result.hintsUsed || 0;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.dialogCard, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={{ width: '100%' }}
          >
            {/* Top Hero Trophy Illustration with Confetti */}
            <View style={styles.trophyWrapper}>
              <View style={styles.confettiCircle}>
                <Trophy size={52} color="#D97706" />
              </View>
            </View>

          {/* Congratulations Title & Subtitle */}
          <Typography size="xxl" weight="bold" align="center" color={isHc ? COLORS.hcTextPrimary : '#0F172A'}>
            {t('great_job')}
          </Typography>

          <Typography size="base" align="center" color={COLORS.textSecondary} style={{ marginTop: 4 }}>
            {t('matched_all_pairs')}
          </Typography>

          <Typography size="lg" weight="bold" align="center" color={COLORS.primary} style={{ marginTop: 2 }}>
            {t('well_done')}
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
                    {t('your_score')}
                  </Typography>
                  <Typography size="xl" weight="bold" color={COLORS.primary}>
                    {score} <Typography size="xs" weight="bold" color={COLORS.primary}>{t('pts')}</Typography>
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
                    {t('accuracy')}
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
                    {t('time_taken')}
                  </Typography>
                  <Typography size="xl" weight="bold" color={COLORS.memoryPurple}>
                    {timeSecs} <Typography size="xs" weight="bold" color={COLORS.memoryPurple}>{t('sec')}</Typography>
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
                    {t('hints_used')}
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
                {t('keep_it_up')}
              </Typography>
              <Typography size="xs" color="#B45309" style={{ marginTop: 2, lineHeight: 18 }}>
                {t('brain_stronger_msg')}
              </Typography>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {/* Primary Solid Green: Next Level / Play Again */}
            <Button
              title={playAgainLabel || t('next_level') || 'NEXT LEVEL'}
              variant="primary"
              icon={<RefreshCw size={22} color="#FFFFFF" />}
              onPress={onPlayAgain}
              style={styles.playAgainBtn}
            />

            {/* Outline Green: Back to Home */}
            <Button
              title={t('back_to_home')}
              variant="outline"
              icon={<Home size={22} color={COLORS.primary} />}
              onPress={onGoHome}
              style={styles.backHomeBtn}
            />
          </View>
          </ScrollView>
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
    padding: SPACING.md,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
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
