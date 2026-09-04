import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, Layers, Brain, Sparkles } from 'lucide-react-native';
import { Typography } from '../common/Typography';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export interface GameHeaderProps {
  title?: string;
  subtitle?: string;
  formattedTime?: string;
  elapsedSeconds?: number;
  matchedPairs?: number;
  matchesCount?: number;
  totalPairs?: number;
  totalRequiredMatches?: number;
  difficulty?: string;
  hintsUsed?: number;
  onHint?: () => void;
  onRestart?: () => void;
  gameInstruction?: string;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  title = 'Match the Pair',
  subtitle = 'Find and match all the pairs!',
  formattedTime,
  elapsedSeconds = 0,
  matchedPairs,
  matchesCount = 0,
  totalPairs,
  totalRequiredMatches = 4,
}) => {
  const router = useRouter();
  const { preferences } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const displayTime = formattedTime || (() => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  })();

  const currentMatched = matchedPairs !== undefined ? matchedPairs : matchesCount;
  const currentTotal = totalPairs !== undefined ? totalPairs : totalRequiredMatches;

  return (
    <View style={styles.container}>
      {/* Top Header Row with Back Arrow, Centered Title, and Pink Brain Character */}
      <View style={styles.headerTopRow}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={28} color={isHc ? COLORS.hcTextPrimary : '#0F172A'} />
        </TouchableOpacity>

        <View style={styles.titleWrapper}>
          <Typography size="xxl" weight="bold" align="center" color={isHc ? COLORS.hcTextPrimary : '#0F172A'}>
            {title}
          </Typography>
          <Typography size="sm" color={COLORS.textMuted} align="center" style={{ marginTop: 2 }}>
            {subtitle}
          </Typography>
        </View>

        {/* Cute Pink Brain Character Illustration */}
        <View style={styles.brainBadge}>
          <Brain size={38} color="#EC4899" />
          <View style={styles.puzzlePiece}>
            <Sparkles size={14} color="#F59E0B" />
          </View>
        </View>
      </View>

      {/* Top Stats Bar Card (Divided into Time & Pairs Matched) */}
      <View style={[styles.statsCard, { backgroundColor: isHc ? COLORS.hcCardBackground : '#FFFFFF' }]}>
        {/* Left Side: Time */}
        <View style={styles.statBox}>
          <View style={styles.statIconCircle}>
            <Clock size={24} color="#6B21A8" />
          </View>
          <View style={{ marginLeft: SPACING.xs }}>
            <Typography size="xs" color={COLORS.textMuted}>
              Time
            </Typography>
            <Typography size="xl" weight="bold" color={isHc ? COLORS.hcTextPrimary : '#0F172A'}>
              {displayTime}
            </Typography>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Right Side: Pairs Matched */}
        <View style={styles.statBox}>
          <View style={styles.statIconCircle}>
            <Layers size={24} color="#6B21A8" />
          </View>
          <View style={{ marginLeft: SPACING.xs }}>
            <Typography size="xs" color={COLORS.textMuted}>
              Pairs Matched
            </Typography>
            <Typography size="xl" weight="bold" color={COLORS.primary}>
              {currentMatched} <Typography size="lg" color={COLORS.textMuted}>/ {currentTotal}</Typography>
            </Typography>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xs,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xs,
  },
  brainBadge: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  puzzlePiece: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FEF3C7',
    borderRadius: RADIUS.full,
    padding: 2,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.surfaceVariant,
  },
});
