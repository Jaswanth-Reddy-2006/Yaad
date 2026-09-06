import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Sparkles,
  CheckCircle2,
  Eye,
  Clock,
  Search,
  Layers,
  Calendar,
  Zap,
} from 'lucide-react-native';
import { Typography } from '../common/Typography';
import { GamePicture } from './GamePicture';
import { RADIUS, SPACING } from '../../constants/theme';

export interface LocalGamePreviewVideoProps {
  gameType: 'PAIR' | 'REMEMBER' | 'SPOT' | 'SORT' | 'OBJECT' | 'EVENTS';
  pastelBg?: string;
}

/**
 * High-quality, clean visual game preview illustration for patient game selection cards.
 * Native, responsive, accessible, with clear graphical differentiation.
 */
export const LocalGamePreviewVideo: React.FC<LocalGamePreviewVideoProps> = ({
  gameType,
  pastelBg = 'transparent',
}) => {
  if (gameType === 'PAIR') {
    return (
      <View style={[styles.container, { backgroundColor: pastelBg }]}>
        <View style={styles.pairCardsContainer}>
          {/* Card 1: Apple */}
          <View style={[styles.miniCard, styles.cardTiltedLeft]}>
            <GamePicture symbolId="apple" size="sm" showLabel={false} />
          </View>

          {/* Sparkle Match Badge */}
          <View style={styles.matchLinkBadge}>
            <Sparkles size={16} color="#EAB308" />
          </View>

          {/* Card 2: Apple (Matching) */}
          <View style={[styles.miniCard, styles.cardTiltedRight, styles.matchingCardBorder]}>
            <GamePicture symbolId="apple" size="sm" showLabel={false} />
            <View style={styles.miniCheckBadge}>
              <CheckCircle2 size={12} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Bottom Tag */}
        <View style={styles.previewTag}>
          <Typography size="xs" weight="bold" color="#16A34A">
            Match Pairs
          </Typography>
        </View>
      </View>
    );
  }

  if (gameType === 'REMEMBER') {
    return (
      <View style={[styles.container, { backgroundColor: pastelBg }]}>
        <View style={styles.rememberSequenceContainer}>
          <View style={[styles.miniSequenceCard, { borderColor: '#FECDD3' }]}>
            <GamePicture symbolId="flower" size="sm" showLabel={false} />
          </View>
          <View style={[styles.miniSequenceCard, { borderColor: '#FDE68A' }]}>
            <GamePicture symbolId="sun" size="sm" showLabel={false} />
          </View>
          <View style={[styles.miniSequenceCard, { borderColor: '#BBF7D0' }]}>
            <GamePicture symbolId="tree" size="sm" showLabel={false} />
          </View>
        </View>

        {/* Bottom Tag with Memory Icon */}
        <View style={[styles.previewTag, { backgroundColor: '#DCFCE7' }]}>
          <Eye size={13} color="#15803D" style={{ marginRight: 4 }} />
          <Typography size="xs" weight="bold" color="#15803D">
            Memorize
          </Typography>
        </View>
      </View>
    );
  }

  if (gameType === 'SPOT') {
    return (
      <View style={[styles.container, { backgroundColor: pastelBg }]}>
        <View style={styles.spotScenesContainer}>
          <View style={[styles.miniSceneBox, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
            <GamePicture symbolId="sun" size="sm" showLabel={false} />
          </View>
          <View style={styles.searchIndicator}>
            <Search size={14} color="#D97706" />
          </View>
          <View style={[styles.miniSceneBox, { backgroundColor: '#FFEDD5', borderColor: '#FED7AA' }]}>
            <GamePicture symbolId="star" size="sm" showLabel={false} />
          </View>
        </View>

        <View style={[styles.previewTag, { backgroundColor: '#FEF3C7' }]}>
          <Typography size="xs" weight="bold" color="#B45309">
            Spot Details
          </Typography>
        </View>
      </View>
    );
  }

  if (gameType === 'EVENTS') {
    return (
      <View style={[styles.container, { backgroundColor: pastelBg }]}>
        <View style={styles.rememberSequenceContainer}>
          <View style={[styles.miniSequenceCard, { borderColor: '#C7D2FE' }]}>
            <Calendar size={22} color="#4F46E5" />
          </View>
          <View style={[styles.miniSequenceCard, { borderColor: '#E0E7FF' }]}>
            <Clock size={22} color="#6366F1" />
          </View>
        </View>
        <View style={[styles.previewTag, { backgroundColor: '#EDE9FE' }]}>
          <Typography size="xs" weight="bold" color="#6D28D9">
            Daily Events
          </Typography>
        </View>
      </View>
    );
  }

  if (gameType === 'OBJECT') {
    return (
      <View style={[styles.container, { backgroundColor: pastelBg }]}>
        <View style={styles.rememberSequenceContainer}>
          <View style={[styles.miniSequenceCard, { borderColor: '#BBF7D0' }]}>
            <GamePicture symbolId="home" size="sm" showLabel={false} />
          </View>
          <View style={[styles.miniSequenceCard, { borderColor: '#FED7AA' }]}>
            <GamePicture symbolId="cup" size="sm" showLabel={false} />
          </View>
        </View>
        <View style={[styles.previewTag, { backgroundColor: '#DCFCE7' }]}>
          <Typography size="xs" weight="bold" color="#15803D">
            Name Objects
          </Typography>
        </View>
      </View>
    );
  }

  // Fallback / SORT
  return (
    <View style={[styles.container, { backgroundColor: pastelBg }]}>
      <View style={styles.rememberSequenceContainer}>
        <View style={[styles.miniSequenceCard, { borderColor: '#FDE68A' }]}>
          <Layers size={22} color="#D97706" />
        </View>
        <View style={[styles.miniSequenceCard, { borderColor: '#FDE68A' }]}>
          <Zap size={22} color="#EAB308" />
        </View>
      </View>
      <View style={[styles.previewTag, { backgroundColor: '#FEF3C7' }]}>
        <Typography size="xs" weight="bold" color="#B45309">
          Sequence
        </Typography>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xs,
  },
  pairCardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  miniCard: {
    width: 48,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTiltedLeft: {
    transform: [{ rotate: '-8deg' }],
    marginRight: -6,
    zIndex: 1,
  },
  cardTiltedRight: {
    transform: [{ rotate: '8deg' }],
    marginLeft: -6,
    zIndex: 2,
  },
  matchingCardBorder: {
    borderColor: '#16A34A',
    borderWidth: 2.2,
    backgroundColor: '#F0FDF4',
  },
  matchLinkBadge: {
    zIndex: 3,
    backgroundColor: '#FEF3C7',
    borderRadius: RADIUS.full,
    padding: 3,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  miniCheckBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#16A34A',
    borderRadius: RADIUS.full,
    padding: 2,
  },
  rememberSequenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 6,
  },
  miniSequenceCard: {
    width: 42,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  spotScenesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 6,
  },
  miniSceneBox: {
    width: 44,
    height: 54,
    borderRadius: RADIUS.md,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIndicator: {
    backgroundColor: '#FEF3C7',
    borderRadius: RADIUS.full,
    padding: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  previewTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
});
