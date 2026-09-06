import React from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import Svg, {
  Rect,
  Circle,
  Path,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

export interface BannerProps {
  height?: DimensionValue;
}

/**
 * 1. Match the Cards: Illustrated memory cards with a matching pair and celebratory sparkle.
 */
export const MatchCardsBannerIllustration: React.FC<BannerProps> = ({ height = 120 }) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 280 120" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="mcBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F5EFFE" />
          <Stop offset="100%" stopColor="#EDE9FE" />
        </LinearGradient>
      </Defs>
      <Rect width="280" height="120" rx="14" fill="url(#mcBg)" />

      {/* Card 1: Left Flipped Matching Card (Apple) */}
      <G transform="translate(65, 20) rotate(-8)">
        <Rect width="64" height="80" rx="10" fill="#FFFFFF" stroke="#16A34A" strokeWidth="3" />
        <Circle cx="32" cy="42" r="16" fill="#EF4444" />
        <Path d="M 32 26 Q 36 20 39 23" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </G>

      {/* Match Sparkle in Center */}
      <G transform="translate(132, 48)">
        <Circle cx="8" cy="8" r="14" fill="#FEF08A" />
        <Path d="M 8 0 L 10 6 L 16 8 L 10 10 L 8 16 L 6 10 L 0 8 L 6 6 Z" fill="#F59E0B" />
      </G>

      {/* Card 2: Right Flipped Matching Card (Apple) */}
      <G transform="translate(150, 20) rotate(8)">
        <Rect width="64" height="80" rx="10" fill="#FFFFFF" stroke="#16A34A" strokeWidth="3" />
        <Circle cx="32" cy="42" r="16" fill="#EF4444" />
        <Path d="M 32 26 Q 36 20 39 23" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </G>
    </Svg>
  </View>
);

/**
 * 2. Remember the Pictures: Large familiar objects (Apple, Flower, Cup, Umbrella).
 */
export const RememberPicturesBannerIllustration: React.FC<BannerProps> = ({ height = 120 }) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 280 120" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="rpBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#E6F9ED" />
          <Stop offset="100%" stopColor="#DCFCE7" />
        </LinearGradient>
      </Defs>
      <Rect width="280" height="120" rx="14" fill="url(#rpBg)" />

      {/* 4 Illustrated Familiar Object Tiles */}
      {/* Tile 1: Flower */}
      <G transform="translate(20, 24)">
        <Rect width="52" height="68" rx="8" fill="#FFFFFF" stroke="#86EFAC" strokeWidth="2.2" />
        <Circle cx="26" cy="34" r="12" fill="#EC4899" />
        <Circle cx="26" cy="34" r="5" fill="#FDE047" />
      </G>

      {/* Tile 2: Apple */}
      <G transform="translate(82, 24)">
        <Rect width="52" height="68" rx="8" fill="#FFFFFF" stroke="#86EFAC" strokeWidth="2.2" />
        <Circle cx="26" cy="35" r="13" fill="#EF4444" />
        <Path d="M 26 22 Q 30 17 33 19" stroke="#15803D" strokeWidth="2" strokeLinecap="round" fill="none" />
      </G>

      {/* Tile 3: Cup */}
      <G transform="translate(144, 24)">
        <Rect width="52" height="68" rx="8" fill="#FFFFFF" stroke="#86EFAC" strokeWidth="2.2" />
        <Rect x="18" y="27" width="16" height="14" rx="2" fill="#D97706" />
      </G>

      {/* Tile 4: Umbrella */}
      <G transform="translate(206, 24)">
        <Rect width="52" height="68" rx="8" fill="#FFFFFF" stroke="#86EFAC" strokeWidth="2.2" />
        <Path d="M 16 35 C 16 26 36 26 36 35 Z" fill="#0284C7" />
        <Path d="M 26 35 L 26 44" stroke="#78350F" strokeWidth="1.8" />
      </G>
    </Svg>
  </View>
);

/**
 * 3. Find Three: Three related objects (Apple, Banana, Mango).
 */
export const FindThreeBannerIllustration: React.FC<BannerProps> = ({ height = 120 }) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 280 120" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="ftBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFBEB" />
          <Stop offset="100%" stopColor="#FEF3C7" />
        </LinearGradient>
      </Defs>
      <Rect width="280" height="120" rx="14" fill="url(#ftBg)" />

      {/* 3 Related Fruit Items Connected with Golden Rings */}
      <G transform="translate(32, 22)">
        <Rect width="64" height="74" rx="10" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="2.5" />
        <Circle cx="32" cy="39" r="15" fill="#EF4444" />
      </G>

      <G transform="translate(108, 22)">
        <Rect width="64" height="74" rx="10" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="2.5" />
        <Path d="M 42 26 C 24 36 26 50 30 52 C 34 54 36 48 44 30 Z" fill="#EAB308" />
      </G>

      <G transform="translate(184, 22)">
        <Rect width="64" height="74" rx="10" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="2.5" />
        <Path d="M 30 28 C 22 34 20 44 26 50 C 32 54 40 48 42 38 C 42 32 34 26 30 28 Z" fill="#EA580C" />
      </G>
    </Svg>
  </View>
);

/**
 * 4. Remember My Day: Daily activities sequence (Morning walk, chai tea, reading, evening medicine).
 */
export const RememberMyDayBannerIllustration: React.FC<BannerProps> = ({ height = 120 }) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 280 120" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="rmdBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFF0E5" />
          <Stop offset="100%" stopColor="#FFEDD5" />
        </LinearGradient>
      </Defs>
      <Rect width="280" height="120" rx="14" fill="url(#rmdBg)" />

      {/* Path Sequence Line */}
      <Path d="M 35 60 Q 140 30 245 60" stroke="#FB923C" strokeWidth="3" strokeDasharray="6,6" fill="none" />

      {/* 4 Activity Milestones */}
      {/* 1. Morning Sun / Walk */}
      <G transform="translate(25, 36)">
        <Circle cx="24" cy="24" r="20" fill="#FFFFFF" stroke="#EA580C" strokeWidth="2.5" />
        <Circle cx="24" cy="24" r="10" fill="#F59E0B" />
      </G>

      {/* 2. Morning Chai Cup */}
      <G transform="translate(95, 30)">
        <Circle cx="24" cy="24" r="20" fill="#FFFFFF" stroke="#EA580C" strokeWidth="2.5" />
        <Rect x="17" y="18" width="14" height="12" rx="2" fill="#D97706" />
      </G>

      {/* 3. Newspaper / Reading */}
      <G transform="translate(165, 30)">
        <Circle cx="24" cy="24" r="20" fill="#FFFFFF" stroke="#EA580C" strokeWidth="2.5" />
        <Rect x="16" y="16" width="16" height="16" rx="2" fill="#3B82F6" />
        <Path d="M 19 21 L 29 21 M 19 25 L 29 25 M 19 29 L 26 29" stroke="#FFFFFF" strokeWidth="1.5" />
      </G>

      {/* 4. Evening Medicine */}
      <G transform="translate(230, 36)">
        <Circle cx="24" cy="24" r="20" fill="#FFFFFF" stroke="#EA580C" strokeWidth="2.5" />
        <Circle cx="24" cy="24" r="8" fill="#10B981" />
      </G>
    </Svg>
  </View>
);

/**
 * 5. Family Memories: Warm family illustration.
 */
export const FamilyMemoriesBannerIllustration: React.FC<BannerProps> = ({ height = 120 }) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 280 120" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="fmBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F5EFFE" />
          <Stop offset="100%" stopColor="#E9D5FF" />
        </LinearGradient>
      </Defs>
      <Rect width="280" height="120" rx="14" fill="url(#fmBg)" />

      {/* Framed Family Gathering */}
      <G transform="translate(45, 14)">
        <Rect width="190" height="92" rx="10" fill="#FFFFFF" stroke="#C084FC" strokeWidth="2.5" />

        {/* Daughter */}
        <G transform="translate(30, 20)">
          <Circle cx="18" cy="18" r="9" fill="#FDBA74" />
          <Path d="M 9 12 Q 18 6 27 12 Q 30 26 27 30 L 9 30 Z" fill="#1E293B" />
          <Path d="M 6 32 Q 18 26 30 32 L 32 58 L 4 58 Z" fill="#EC4899" />
        </G>

        {/* Grandparent */}
        <G transform="translate(75, 12)">
          <Circle cx="20" cy="18" r="10" fill="#FDBA74" />
          <Path d="M 10 12 Q 20 4 30 12 Q 32 20 28 24 L 12 24 Z" fill="#E2E8F0" />
          <Circle cx="16" cy="18" r="2.5" stroke="#1E293B" strokeWidth="1" fill="#FFFFFF" />
          <Circle cx="24" cy="18" r="2.5" stroke="#1E293B" strokeWidth="1" fill="#FFFFFF" />
          <Path d="M 6 30 Q 20 24 34 30 L 36 68 L 4 68 Z" fill="#7C3AED" />
        </G>

        {/* Grandchild */}
        <G transform="translate(122, 28)">
          <Circle cx="16" cy="14" r="8" fill="#FDBA74" />
          <Circle cx="16" cy="12" r="8" fill="#1E293B" />
          <Path d="M 6 24 Q 16 18 26 24 L 28 50 L 4 50 Z" fill="#F59E0B" />
        </G>
      </G>
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
