import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import {
  Sun,
  Flower2,
  Heart,
  Star,
  Apple,
  Bell,
  Key,
  Home,
  Trees,
  Clock,
  Umbrella,
  Droplet,
  HelpCircle,
} from 'lucide-react-native';
import { GameCardItem } from '../../types';
import { Typography } from '../common/Typography';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../constants/theme';
import { useAccessibilityStore } from '../../store/useAccessibilityStore';

export interface GameCardProps {
  card: GameCardItem;
  positionIndex?: number;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const renderIcon = (iconName: string, size: number, color: string) => {
  switch (iconName) {
    case 'Sun':
      return <Sun size={size} color={color} />;
    case 'Flower2':
      return <Flower2 size={size} color={color} />;
    case 'Heart':
      return <Heart size={size} color={color} />;
    case 'Star':
      return <Star size={size} color={color} />;
    case 'Apple':
      return <Apple size={size} color={color} />;
    case 'Bell':
      return <Bell size={size} color={color} />;
    case 'Key':
      return <Key size={size} color={color} />;
    case 'Home':
      return <Home size={size} color={color} />;
    case 'Trees':
      return <Trees size={size} color={color} />;
    case 'Clock':
      return <Clock size={size} color={color} />;
    case 'Umbrella':
      return <Umbrella size={size} color={color} />;
    case 'Droplet':
      return <Droplet size={size} color={color} />;
    default:
      return <HelpCircle size={size} color={color} />;
  }
};

export const GameCardComponent: React.FC<GameCardProps> = ({
  card,
  positionIndex = 0,
  onSelect,
  disabled = false,
}) => {
  const { preferences, t } = useAccessibilityStore();
  const isHc = preferences.highContrast;

  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const isRevealed = card.isFlipped || card.isMatched;

  useEffect(() => {
    rotation.value = withTiming(isRevealed ? 180 : 0, { duration: 300 });
  }, [isRevealed]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(rotation.value, [0, 180], [0, 180]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateValue}deg` },
        { scale: scale.value },
      ],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(rotation.value, [0, 180], [180, 360]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateValue}deg` },
        { scale: scale.value },
      ],
      backfaceVisibility: 'hidden',
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.94);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.0);
  };

  const isHinted = Boolean(card.isHighlightedHint);

  const cardBorderColor = isHinted
    ? COLORS.warning
    : card.isMatched
    ? COLORS.success
    : isHc
    ? COLORS.hcBorder
    : COLORS.primary;

  const cardBg = card.isMatched
    ? isHc ? '#003300' : COLORS.successLight
    : isRevealed
    ? isHc ? COLORS.hcCardBackground : COLORS.cardBackground
    : isHc ? '#1F2937' : COLORS.primaryLight;

  const iconColor = card.isMatched
    ? COLORS.success
    : isHc ? COLORS.hcTextPrimary : COLORS.primary;

  const displayTitle = t(card.symbolId) || card.title;

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
        isHinted ? styles.hintGlow : null,
      ]}
    >
      <View style={styles.cardWrapper}>
        {/* FRONT SIDE (Unrevealed Card Back) */}
        <Animated.View
          style={[
            styles.cardFace,
            frontAnimatedStyle,
            {
              backgroundColor: cardBg,
              borderColor: cardBorderColor,
              borderWidth: isHinted ? 3 : 2,
            },
          ]}
        >
          <HelpCircle size={32} color={isHc ? COLORS.hcPrimary : COLORS.primary} />
          <Typography size="xs" weight="bold" color={isHc ? COLORS.hcPrimary : COLORS.primary} style={{ marginTop: 4 }}>
            {t('tap')}
          </Typography>
        </Animated.View>

        {/* BACK SIDE (Revealed Symbol) */}
        <Animated.View
          style={[
            styles.cardFace,
            styles.cardFaceBack,
            backAnimatedStyle,
            {
              backgroundColor: cardBg,
              borderColor: cardBorderColor,
              borderWidth: isHinted || card.isMatched ? 3 : 2,
            },
          ]}
        >
          {renderIcon(card.iconName, 36, iconColor)}
          <Typography size="xs" weight="bold" color={iconColor} style={{ marginTop: 4 }}>
            {displayTitle}
          </Typography>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

export const GameCard = React.memo(GameCardComponent);

const styles = StyleSheet.create({
  touchContainer: {
    width: '22%',
    aspectRatio: 0.85,
    margin: '1.5%',
    borderRadius: RADIUS.lg,
    minHeight: 84,
  },
  hintGlow: {
    shadowColor: COLORS.warning,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
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
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardFaceBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xs,
  },
});

