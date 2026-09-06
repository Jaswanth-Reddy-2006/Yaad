import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Sparkles, CheckCircle2 } from 'lucide-react-native';
import { GameCardItem } from '../../types';
import { Typography } from '../common/Typography';
import { GamePicture, getSymbolConfig } from './GamePicture';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export interface GameCardProps {
  card: GameCardItem;
  positionIndex?: number;
  onSelect: (id: string) => void;
  disabled?: boolean;
  numColumns?: number;
  customWidth?: string | number;
}

export const GameCardComponent: React.FC<GameCardProps> = ({
  card,
  positionIndex = 0,
  onSelect,
  disabled = false,
  numColumns = 4,
  customWidth,
}) => {
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;
  const { width: screenWidth } = useWindowDimensions();

  const rotation = useSharedValue(card.isFlipped || card.isMatched ? 180 : 0);
  const scale = useSharedValue(1);

  const isRevealed = card.isFlipped || card.isMatched;

  useEffect(() => {
    rotation.value = withTiming(isRevealed ? 180 : 0, { duration: 300 });
  }, [isRevealed]);

  // Front (Unrevealed Card Back) - explicitly hides at 90 degrees so Android never renders half-slices
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(rotation.value, [0, 180], [0, 180]);
    const opacityValue = interpolate(rotation.value, [0, 89, 90, 180], [1, 1, 0, 0]);
    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${rotateValue}deg` },
        { scale: scale.value },
      ],
      opacity: opacityValue,
      backfaceVisibility: 'hidden',
    };
  });

  // Back (Revealed Picture Face) - explicitly appears at 90 degrees so it stays fully sized and static
  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(rotation.value, [0, 180], [180, 360]);
    const opacityValue = interpolate(rotation.value, [0, 89, 90, 180], [0, 0, 1, 1]);
    return {
      transform: [
        { perspective: 1200 },
        { rotateY: `${rotateValue}deg` },
        { scale: scale.value },
      ],
      opacity: opacityValue,
      backfaceVisibility: 'hidden',
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0);
  };

  const isHinted = Boolean(card.isHighlightedHint);
  const symbolConfig = getSymbolConfig(card.symbolId, card.iconName);
  const displayTitle = t(card.symbolId) || card.title || symbolConfig.displayName;

  // Visual card borders and backgrounds
  const cardBorderColor = isHinted
    ? '#F59E0B'
    : card.isMatched
    ? '#16A34A'
    : isHc
    ? COLORS.hcBorder
    : symbolConfig.borderColor;

  const cardFaceBg = card.isMatched
    ? isHc ? '#064E3B' : '#F0FDF4'
    : isHc ? COLORS.hcCardBackground : symbolConfig.cardBg;

  // Dynamic Responsive Card Widths and Proportions
  const cardWidth = customWidth
    ? customWidth
    : numColumns === 2
    ? '46%'
    : numColumns === 3
    ? '30.5%'
    : '22.5%';

  const cardMargin = numColumns === 2 ? '1.8%' : numColumns === 3 ? '1.3%' : '1.1%';
  const cardAspectRatio = numColumns === 2 ? 0.95 : numColumns === 3 ? 0.88 : 0.82;

  // Dynamically calculate responsive illustration pixel size based on viewport width
  const responsivePicSize =
    numColumns === 2
      ? Math.min(94, Math.max(68, Math.floor(screenWidth * 0.22)))
      : numColumns === 3
      ? Math.min(68, Math.max(50, Math.floor(screenWidth * 0.15)))
      : Math.min(52, Math.max(38, Math.floor(screenWidth * 0.11)));

  const accessibleLabel = card.isMatched
    ? `Matched ${displayTitle} card`
    : isRevealed
    ? `${displayTitle} card, position ${positionIndex + 1}`
    : `Hidden card, position ${positionIndex + 1}`;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibleLabel}
      accessibilityState={{
        selected: isRevealed,
        disabled: disabled || card.isMatched || isRevealed,
      }}
      disabled={disabled || card.isMatched || isRevealed}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onSelect(card.id)}
      style={[
        styles.touchContainer,
        {
          width: cardWidth as any,
          aspectRatio: cardAspectRatio,
          // Only apply percentage margin when not using explicit pixel width (parent row uses gap instead)
          ...(typeof customWidth !== 'number' ? { margin: cardMargin as any } : {}),
        },
        isHinted ? styles.hintGlow : null,
      ]}
    >
      <View style={styles.cardWrapper}>
        {/* UNREVEALED CARD BACK (Sparkles + TAP) */}
        <Animated.View
          style={[
            styles.cardFace,
            frontAnimatedStyle,
            {
              backgroundColor: isHc ? '#1E293B' : '#4F46E5',
              borderColor: isHinted ? '#F59E0B' : isHc ? '#475569' : '#4338CA',
              borderWidth: isHinted ? 3.5 : 2.5,
            },
          ]}
        >
          <View style={styles.centerContent}>
            <Sparkles size={numColumns === 2 ? 36 : 24} color={isHc ? '#93C5FD' : '#E0E7FF'} />
            <Typography
              size={numColumns === 2 ? 'sm' : 'xs'}
              weight="bold"
              color="#FFFFFF"
              style={{ marginTop: 6, letterSpacing: 1 }}
            >
              {t('tap') || 'TAP'}
            </Typography>
          </View>
        </Animated.View>

        {/* REVEALED PICTURE CARD FRONT */}
        <Animated.View
          style={[
            styles.cardFace,
            backAnimatedStyle,
            {
              backgroundColor: cardFaceBg,
              borderColor: cardBorderColor,
              borderWidth: isHinted || card.isMatched ? 3.5 : 2.5,
            },
          ]}
        >
          <View style={styles.centerContent}>
            <GamePicture
              symbolId={card.symbolId}
              iconName={card.iconName}
              displayTitle={displayTitle}
              size={responsivePicSize}
              showLabel={false}
            />
          </View>

          {/* Matched Checkmark Corner Badge */}
          {card.isMatched && (
            <View style={styles.matchedBadge}>
              <CheckCircle2 size={numColumns === 2 ? 22 : 16} color="#FFFFFF" />
            </View>
          )}

          {/* Hint Sparkle Badge */}
          {isHinted && !card.isMatched && (
            <View style={styles.hintBadge}>
              <Sparkles size={numColumns === 2 ? 18 : 14} color="#D97706" />
            </View>
          )}
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

export const GameCard = React.memo(GameCardComponent);

const styles = StyleSheet.create({
  touchContainer: {
    borderRadius: RADIUS.xl,
  },
  hintGlow: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 12,
    elevation: 10,
  },
  cardWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  matchedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#16A34A',
    borderRadius: RADIUS.full,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
  hintBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: RADIUS.full,
    padding: 4,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
});
