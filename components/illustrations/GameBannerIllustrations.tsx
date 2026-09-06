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
  Ellipse,
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

/**
 * 6. Odd One Out: Find the distinct object amongst matching ones.
 */
export const OddOneOutBannerIllustration: React.FC<BannerProps> = ({ height = 120 }) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 280 120" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="oooBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFF1F2" />
          <Stop offset="100%" stopColor="#FFE4E6" />
        </LinearGradient>
      </Defs>
      <Rect width="280" height="120" rx="14" fill="url(#oooBg)" />

      {/* 3 Red Apples */}
      <G transform="translate(25, 24)">
        <Rect width="50" height="68" rx="8" fill="#FFFFFF" stroke="#FECDD3" strokeWidth="2" />
        <Circle cx="25" cy="34" r="14" fill="#EF4444" />
        <Path d="M 25 20 Q 29 15 32 17" stroke="#15803D" strokeWidth="2" strokeLinecap="round" fill="none" />
      </G>

      <G transform="translate(85, 24)">
        <Rect width="50" height="68" rx="8" fill="#FFFFFF" stroke="#FECDD3" strokeWidth="2" />
        <Circle cx="25" cy="34" r="14" fill="#EF4444" />
        <Path d="M 25 20 Q 29 15 32 17" stroke="#15803D" strokeWidth="2" strokeLinecap="round" fill="none" />
      </G>

      <G transform="translate(145, 24)">
        <Rect width="50" height="68" rx="8" fill="#FFFFFF" stroke="#FECDD3" strokeWidth="2" />
        <Circle cx="25" cy="34" r="14" fill="#EF4444" />
        <Path d="M 25 20 Q 29 15 32 17" stroke="#15803D" strokeWidth="2" strokeLinecap="round" fill="none" />
      </G>

      {/* 1 Different Highlighted Object (Golden Mango / Star) */}
      <G transform="translate(205, 20)">
        <Rect width="54" height="74" rx="10" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="3" />
        <Path d="M 27 24 C 18 28 14 44 22 56 C 28 65 42 66 48 54 C 54 42 50 28 38 24 Z" fill="#F59E0B" />
        <Circle cx="44" cy="22" r="7" fill="#EF4444" />
        <Path d="M 44 18 L 44 26 M 40 22 L 48 22" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
      </G>
    </Svg>
  </View>
);

/**
 * 7. Word Match: Picture and matching readable word label.
 */
export const WordMatchBannerIllustration: React.FC<BannerProps> = ({ height = 120 }) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 280 120" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="wmBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EFF6FF" />
          <Stop offset="100%" stopColor="#DBEAFE" />
        </LinearGradient>
      </Defs>
      <Rect width="280" height="120" rx="14" fill="url(#wmBg)" />

      {/* Large Object Card (Flower) */}
      <G transform="translate(45, 20)">
        <Rect width="80" height="80" rx="12" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="2.5" />
        <Circle cx="40" cy="40" r="16" fill="#EC4899" />
        <Circle cx="40" cy="40" r="7" fill="#FDE047" />
      </G>

      {/* Matching Word Pill Button */}
      <G transform="translate(145, 36)">
        <Rect width="95" height="46" rx="23" fill="#2563EB" />
        <Circle cx="168" cy="59" r="6" fill="#60A5FA" />
        <Path d="M 160 59 L 166 65 L 178 53" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </G>
    </Svg>
  </View>
);

/**
 * 8. Animal Sounds: Musical note & animal silhouettes (Dog, Bird, Cat) listening to sounds.
 */
export const AnimalSoundsBannerIllustration: React.FC<BannerProps> = ({ height = 120 }) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 280 120" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="asBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FEF3C7" />
          <Stop offset="100%" stopColor="#FDE68A" />
        </LinearGradient>
      </Defs>
      <Rect width="280" height="120" rx="14" fill="url(#asBg)" />

      {/* Sound Waves & Speaker in Center-Left */}
      <G transform="translate(30, 36)">
        <Rect width="48" height="48" rx="24" fill="#D97706" />
        <Path d="M 22 18 L 16 22 L 11 22 L 11 26 L 16 26 L 22 30 Z" fill="#FFFFFF" />
        {/* Sound Waves */}
        <Path d="M 27 20 Q 31 24 27 28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Path d="M 32 16 Q 38 24 32 32" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </G>

      {/* Musical Floating Notes */}
      <G transform="translate(90, 24)">
        <Circle cx="8" cy="18" r="4" fill="#B45309" />
        <Path d="M 12 18 L 12 6 L 22 3 L 22 15" stroke="#B45309" strokeWidth="2.5" fill="none" />
        <Circle cx="18" cy="15" r="4" fill="#B45309" />
      </G>

      {/* 3 Animal Cards */}
      {/* Dog Card */}
      <G transform="translate(130, 20)">
        <Rect width="42" height="52" rx="8" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
        <Circle cx="21" cy="24" r="11" fill="#FDBA74" />
        <Path d="M 10 18 Q 8 28 14 26" stroke="#EA580C" strokeWidth="2" fill="none" />
        <Path d="M 32 18 Q 34 28 28 26" stroke="#EA580C" strokeWidth="2" fill="none" />
      </G>

      {/* Bird Card */}
      <G transform="translate(178, 20)">
        <Rect width="42" height="52" rx="8" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
        <Circle cx="21" cy="24" r="10" fill="#38BDF8" />
        <Path d="M 27 22 L 34 24 L 27 26 Z" fill="#F59E0B" />
      </G>

      {/* Cat Card */}
      <G transform="translate(226, 20)">
        <Rect width="42" height="52" rx="8" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
        <Circle cx="21" cy="24" r="11" fill="#FED7AA" />
        <Path d="M 12 16 L 16 22 L 10 22 Z" fill="#FB923C" />
        <Path d="M 30 16 L 26 22 L 32 22 Z" fill="#FB923C" />
      </G>
    </Svg>
  </View>
);

/**
 * 9. Follow the Cup: 3 Solid Purple Glasses with one lifted showing a golden ball.
 */
export const FollowTheCupBannerIllustration: React.FC<BannerProps> = ({ height = 120 }) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 280 120" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="ftcBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FAF5FF" />
          <Stop offset="100%" stopColor="#F3E8FF" />
        </LinearGradient>
        <LinearGradient id="purpleCupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#7E22CE" />
          <Stop offset="40%" stopColor="#6B21A8" />
          <Stop offset="100%" stopColor="#3B0764" />
        </LinearGradient>
      </Defs>
      <Rect width="280" height="120" rx="14" fill="url(#ftcBg)" />

      {/* Wooden Table Surface Line */}
      <Path d="M 20 95 L 260 95" stroke="#DDD6FE" strokeWidth="4" strokeLinecap="round" />

      {/* Left Purple Glass (Down) */}
      <G transform="translate(45, 45)">
        <Path d="M 8 50 L 14 8 L 46 8 L 52 50 Z" fill="url(#purpleCupGrad)" stroke="#3B0764" strokeWidth="2.5" />
        <Path d="M 12 36 L 48 36" stroke="#F59E0B" strokeWidth="2.5" />
        <Ellipse cx="30" cy="8" rx="16" ry="4" fill="#A855F7" />
        <Ellipse cx="30" cy="50" rx="22" ry="6" fill="#3B0764" />
      </G>

      {/* Middle Golden Ball on Table */}
      <G transform="translate(130, 72)">
        <Circle cx="12" cy="12" r="12" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
        <Circle cx="8" cy="8" r="3" fill="#FFFFFF" />
        {/* Magic Sparkle */}
        <Path d="M 12 0 L 14 6 L 20 8 L 14 10 L 12 16 L 10 10 L 4 8 L 10 6 Z" fill="#F59E0B" />
      </G>

      {/* Middle Purple Glass (LIFTED - Showing Golden Ball) */}
      <G transform="translate(112, 16)">
        <Path d="M 8 50 L 14 8 L 46 8 L 52 50 Z" fill="url(#purpleCupGrad)" stroke="#3B0764" strokeWidth="2.5" />
        <Path d="M 12 36 L 48 36" stroke="#F59E0B" strokeWidth="2.5" />
        <Ellipse cx="30" cy="8" rx="16" ry="4" fill="#A855F7" />
        <Ellipse cx="30" cy="50" rx="22" ry="6" fill="#3B0764" />
        <Ellipse cx="30" cy="50" rx="19" ry="4" fill="none" stroke="#F59E0B" strokeWidth="2" />
      </G>

      {/* Right Purple Glass (Down) */}
      <G transform="translate(180, 45)">
        <Path d="M 8 50 L 14 8 L 46 8 L 52 50 Z" fill="url(#purpleCupGrad)" stroke="#3B0764" strokeWidth="2.5" />
        <Path d="M 12 36 L 48 36" stroke="#F59E0B" strokeWidth="2.5" />
        <Ellipse cx="30" cy="8" rx="16" ry="4" fill="#A855F7" />
        <Ellipse cx="30" cy="50" rx="22" ry="6" fill="#3B0764" />
      </G>
    </Svg>
  </View>
);

/**
 * 10. Count the Sheep: Meadow farmhouse in center with cute sheep walking in.
 */
export const CountSheepBannerIllustration: React.FC<BannerProps> = ({ height = 120 }) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 280 120" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="sheepMeadowBg" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#E0F2FE" />
          <Stop offset="55%" stopColor="#BAE6FD" />
          <Stop offset="56%" stopColor="#86EFAC" />
          <Stop offset="100%" stopColor="#4ADE80" />
        </LinearGradient>
        <LinearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#EF4444" />
          <Stop offset="100%" stopColor="#B91C1C" />
        </LinearGradient>
        <LinearGradient id="houseWallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FEF3C7" />
          <Stop offset="100%" stopColor="#FDE68A" />
        </LinearGradient>
      </Defs>

      {/* Sky and Meadow Grass */}
      <Rect width="280" height="120" rx="14" fill="url(#sheepMeadowBg)" />

      {/* Distant Hills */}
      <Path d="M 0 70 Q 70 50 140 68 T 280 65 L 280 120 L 0 120 Z" fill="#22C55E" opacity="0.4" />

      {/* Sun & Cloud */}
      <Circle cx="35" cy="28" r="14" fill="#FDE047" stroke="#F59E0B" strokeWidth="2" />
      <G fill="#FFFFFF" opacity="0.85">
        <Circle cx="240" cy="24" r="10" />
        <Circle cx="252" cy="20" r="13" />
        <Circle cx="264" cy="24" r="10" />
      </G>

      {/* Wooden Fence on Left */}
      <G stroke="#78350F" strokeWidth="2" fill="none">
        <Path d="M 12 75 L 12 96 M 28 75 L 28 96 M 44 75 L 44 96" />
        <Path d="M 8 80 L 48 80 M 8 90 L 48 90" />
      </G>

      {/* Cobblestone Path to House */}
      <Path d="M 60 115 Q 110 95 140 85 L 175 85 Q 150 115 110 120 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />

      {/* Cozy Center Farm House */}
      <G transform="translate(130, 30)">
        {/* Chimney & Smoke */}
        <Rect x="54" y="6" width="12" height="18" fill="#991B1B" rx="1" />
        <Circle cx="60" cy="2" r="4" fill="#FFFFFF" opacity="0.7" />
        <Circle cx="64" cy="-5" r="5" fill="#FFFFFF" opacity="0.5" />

        {/* House Main Body */}
        <Rect x="10" y="24" width="65" height="42" fill="url(#houseWallGrad)" stroke="#B45309" strokeWidth="2" rx="3" />

        {/* Triangular Gabled Roof */}
        <Path d="M 4 26 L 42 2 L 81 26 Z" fill="url(#roofGrad)" stroke="#7F1D1D" strokeWidth="2.5" strokeLinejoin="round" />

        {/* Loft Window */}
        <Circle cx="42.5" cy="16" r="6" fill="#DBEAFE" stroke="#7F1D1D" strokeWidth="1.5" />
        <Path d="M 42.5 10 L 42.5 22 M 36.5 16 L 48.5 16" stroke="#7F1D1D" strokeWidth="1" />

        {/* Open Arch Doorway */}
        <Path d="M 30 66 L 30 42 Q 42.5 32 55 42 L 55 66 Z" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
        {/* Warm Golden Interior Light */}
        <Path d="M 33 66 L 33 44 Q 42.5 36 52 44 L 52 66 Z" fill="#FDE047" opacity="0.9" />

        {/* Side Window */}
        <Rect x="14" y="34" width="12" height="14" rx="2" fill="#DBEAFE" stroke="#B45309" strokeWidth="1.5" />
        <Path d="M 20 34 L 20 48 M 14 41 L 26 41" stroke="#B45309" strokeWidth="1" />
      </G>

      {/* 2 Walking Sheep Heading into the House */}
      {/* Sheep 1: Right at the Doorway */}
      <G transform="translate(150, 68) scale(0.42)">
        {/* Legs */}
        <Rect x="24" y="52" width="6" height="20" rx="3" fill="#475569" />
        <Rect x="36" y="54" width="6" height="18" rx="3" fill="#475569" />
        <Rect x="60" y="54" width="6" height="18" rx="3" fill="#475569" />
        <Rect x="72" y="52" width="6" height="20" rx="3" fill="#475569" />
        {/* Wool Cloud Body */}
        <G fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2">
          <Circle cx="30" cy="38" r="14" />
          <Circle cx="48" cy="28" r="15" />
          <Circle cx="66" cy="36" r="14" />
          <Circle cx="50" cy="46" r="15" />
          <Circle cx="34" cy="46" r="13" />
        </G>
        {/* Head */}
        <Ellipse cx="76" cy="32" rx="10" ry="12" fill="#FFEDD5" stroke="#FB923C" strokeWidth="1.5" />
        <Circle cx="80" cy="30" r="2.5" fill="#1E293B" />
      </G>

      {/* Sheep 2: Approaching on Path */}
      <G transform="translate(85, 74) scale(0.48)">
        {/* Legs */}
        <Rect x="24" y="52" width="6" height="22" rx="3" fill="#475569" />
        <Rect x="36" y="54" width="6" height="20" rx="3" fill="#475569" />
        <Rect x="60" y="54" width="6" height="20" rx="3" fill="#475569" />
        <Rect x="72" y="52" width="6" height="22" rx="3" fill="#475569" />
        {/* Wool Cloud Body */}
        <G fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2">
          <Circle cx="30" cy="38" r="14" />
          <Circle cx="48" cy="28" r="15" />
          <Circle cx="66" cy="36" r="14" />
          <Circle cx="50" cy="46" r="15" />
          <Circle cx="34" cy="46" r="13" />
        </G>
        {/* Head */}
        <Ellipse cx="76" cy="32" rx="10" ry="12" fill="#FFEDD5" stroke="#FB923C" strokeWidth="1.5" />
        <Circle cx="80" cy="30" r="2.5" fill="#1E293B" />
      </G>
    </Svg>
  </View>
);

/**
 * 8. Story Recall: Illustrated open storybook with vibrant characters, sunny scenery, and recall thought bubbles.
 */
export const StoryRecallBannerIllustration: React.FC<BannerProps> = ({ height = 120 }) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 280 120" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="srBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#EFF6FF" />
          <Stop offset="50%" stopColor="#DBEAFE" />
          <Stop offset="100%" stopColor="#BFDBFE" />
        </LinearGradient>
        <LinearGradient id="bookCover" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#4338CA" />
          <Stop offset="100%" stopColor="#312E81" />
        </LinearGradient>
        <LinearGradient id="pageLeft" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#F8FAFC" />
          <Stop offset="100%" stopColor="#FFFFFF" />
        </LinearGradient>
      </Defs>

      {/* Card Background */}
      <Rect width="280" height="120" rx="14" fill="url(#srBg)" />

      {/* Soft Background Clouds & Memory Sparkles */}
      <Circle cx="40" cy="25" r="14" fill="#FFFFFF" opacity="0.6" />
      <Circle cx="55" cy="20" r="18" fill="#FFFFFF" opacity="0.7" />
      <Circle cx="70" cy="25" r="14" fill="#FFFFFF" opacity="0.6" />
      <Circle cx="240" cy="25" r="16" fill="#FEF08A" opacity="0.7" />

      {/* Open Storybook in Center */}
      <G transform="translate(42, 16)">
        {/* Book Hardcover Base */}
        <Path d="M 0 82 Q 98 90 98 84 Q 98 90 196 82 L 192 88 Q 98 96 98 90 Q 98 96 4 88 Z" fill="url(#bookCover)" />

        {/* Left Page (Illustrated Scene) */}
        <Path d="M 6 10 Q 52 14 96 18 L 96 82 Q 52 78 6 74 Z" fill="url(#pageLeft)" stroke="#CBD5E1" strokeWidth="1.5" />

        {/* Inside Left Page: Mini Sunny Garden Scene */}
        <G transform="translate(14, 18)">
          {/* Mini Sky and Grass */}
          <Rect width="72" height="52" rx="4" fill="#DCFCE7" />
          <Circle cx="58" cy="12" r="7" fill="#FDE047" />
          {/* Mini Character (Grandpa) */}
          <Circle cx="25" cy="22" r="8" fill="#FED7AA" />
          <Path d="M 14 46 L 36 46 L 33 28 L 17 28 Z" fill="#3B82F6" />
          {/* Red Rose Bush */}
          <Circle cx="52" cy="38" r="9" fill="#16A34A" />
          <Circle cx="52" cy="35" r="4.5" fill="#EF4444" />
          {/* Yellow Butterfly */}
          <Circle cx="37" cy="18" r="3" fill="#EAB308" />
        </G>

        {/* Book Center Spine Crease */}
        <Path d="M 97 18 L 97 83" stroke="#94A3B8" strokeWidth="2.5" />

        {/* Right Page (Text & Questions) */}
        <Path d="M 98 18 Q 144 14 190 10 L 190 74 Q 144 78 98 82 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />

        {/* Inside Right Page: Story Lines & Question Mark */}
        <G transform="translate(108, 22)">
          {/* Story Text Lines */}
          <Rect x="4" y="6" width="46" height="4" rx="2" fill="#93C5FD" />
          <Rect x="4" y="14" width="60" height="4" rx="2" fill="#CBD5E1" />
          <Rect x="4" y="22" width="52" height="4" rx="2" fill="#CBD5E1" />

          {/* Golden Episodic Memory Question Badge */}
          <Circle cx="54" cy="42" r="14" fill="#FEF08A" stroke="#F59E0B" strokeWidth="1.8" />
          <Path d="M 50 36 C 50 32 58 32 58 36 C 58 39 54 40 54 43 M 54 47 L 54 49" stroke="#B45309" strokeWidth="2" strokeLinecap="round" fill="none" />
        </G>
      </G>

      {/* Floating Sparkles */}
      <Path d="M 28 50 L 30 44 L 36 42 L 30 40 L 28 34 L 26 40 L 20 42 L 26 44 Z" fill="#F59E0B" />
      <Path d="M 252 65 L 254 59 L 260 57 L 254 55 L 252 49 L 250 55 L 244 57 L 250 59 Z" fill="#3B82F6" />
    </Svg>
  </View>
);

/**
 * 9. Object-Location Memory: Illustrated cozy room layout with spatial slots, objects placed on furniture, and location markers.
 */
export const ObjectLocationBannerIllustration: React.FC<BannerProps> = ({ height = 120 }) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 280 120" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="olBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F0FDFA" />
          <Stop offset="50%" stopColor="#CCFBF1" />
          <Stop offset="100%" stopColor="#99F6E4" />
        </LinearGradient>
        <LinearGradient id="slotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#F0FDFA" />
        </LinearGradient>
      </Defs>

      {/* Card Background */}
      <Rect width="280" height="120" rx="14" fill="url(#olBg)" />

      {/* Grid Floor Line Guide */}
      <Path d="M 20 60 L 260 60" stroke="#5EEAD4" strokeWidth="1.5" strokeDasharray="4 4" />
      <Path d="M 140 10 L 140 110" stroke="#5EEAD4" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* Spatial Slot 1: Top-Left (Bookshelf with Book) */}
      <G transform="translate(30, 16)">
        <Rect width="52" height="42" rx="8" fill="url(#slotGrad)" stroke="#0D9488" strokeWidth="2" />
        {/* Bookshelf Icon Base */}
        <Rect x="8" y="28" width="36" height="4" rx="1" fill="#78350F" />
        {/* Red Book */}
        <Rect x="14" y="14" width="10" height="14" rx="2" fill="#EF4444" />
        <Rect x="26" y="12" width="12" height="16" rx="2" fill="#3B82F6" />
      </G>

      {/* Spatial Slot 2: Top-Right (Window with Flower) */}
      <G transform="translate(198, 16)">
        <Rect width="52" height="42" rx="8" fill="url(#slotGrad)" stroke="#0D9488" strokeWidth="2" />
        {/* Flower pot */}
        <Path d="M 18 26 L 34 26 L 31 36 L 21 36 Z" fill="#D97706" />
        <Circle cx="26" cy="18" r="7" fill="#EC4899" />
        <Circle cx="26" cy="18" r="3" fill="#FDE047" />
      </G>

      {/* Spatial Slot 3: Center Table (with Glasses) */}
      <G transform="translate(114, 38)">
        <Rect width="52" height="44" rx="8" fill="#FFFFFF" stroke="#0F766E" strokeWidth="2.5" />
        {/* Table top icon */}
        <Ellipse cx="26" cy="30" rx="20" ry="7" fill="#FED7AA" stroke="#EA580C" strokeWidth="1" />
        {/* Glasses */}
        <Circle cx="19" cy="23" r="4.5" stroke="#4F46E5" strokeWidth="1.5" fill="#EEF2FF" />
        <Circle cx="33" cy="23" r="4.5" stroke="#4F46E5" strokeWidth="1.5" fill="#EEF2FF" />
        <Path d="M 23.5 23 L 28.5 23" stroke="#4F46E5" strokeWidth="1.5" />
      </G>

      {/* Spatial Slot 4: Bottom-Left (Sofa with Apple) */}
      <G transform="translate(30, 68)">
        <Rect width="52" height="42" rx="8" fill="url(#slotGrad)" stroke="#0D9488" strokeWidth="2" />
        {/* Sofa cushion */}
        <Rect x="8" y="24" width="36" height="10" rx="3" fill="#3B82F6" />
        {/* Apple */}
        <Circle cx="26" cy="18" r="8" fill="#EF4444" />
        <Path d="M 26 10 Q 28 6 30 7" stroke="#15803D" strokeWidth="1.5" fill="none" />
      </G>

      {/* Spatial Slot 5: Bottom-Right (Floor Rug with Cup) */}
      <G transform="translate(198, 68)">
        <Rect width="52" height="42" rx="8" fill="url(#slotGrad)" stroke="#0D9488" strokeWidth="2" />
        {/* Rug */}
        <Ellipse cx="26" cy="28" rx="18" ry="8" fill="#FBCFE8" stroke="#DB2777" strokeWidth="1" />
        {/* Tea Cup */}
        <Rect x="20" y="16" width="12" height="10" rx="2" fill="#D97706" />
      </G>

      {/* Memory Location Pin in center top */}
      <G transform="translate(133, 10)">
        <Circle cx="7" cy="7" r="7" fill="#F59E0B" />
        <Path d="M 3 6 C 3 4 11 4 11 6 C 11 9 7 9 7 11 M 7 13 L 7 14" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
      </G>
    </Svg>
  </View>
);

/**
 * 10. Daily Routine Recall: Illustrated sequential timeline (Breakfast → Medicine → Walk) with step badges and chronological arrows.
 */
export const DailyRoutineBannerIllustration: React.FC<BannerProps> = ({ height = 120 }) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 280 120" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="drBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FEF3C7" />
          <Stop offset="50%" stopColor="#FFFBEB" />
          <Stop offset="100%" stopColor="#FDE68A" />
        </LinearGradient>
        <LinearGradient id="drCard" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#F8FAFC" />
        </LinearGradient>
      </Defs>

      {/* Background */}
      <Rect width="280" height="120" rx="14" fill="url(#drBg)" />

      {/* Clock / Sun in background */}
      <Circle cx="30" cy="22" r="14" fill="#FDE047" opacity="0.6" />
      <Circle cx="250" cy="22" r="14" fill="#38BDF8" opacity="0.4" />

      {/* Horizontal Timeline Connector Line */}
      <Path d="M 45 60 L 235 60" stroke="#F59E0B" strokeWidth="3.5" strokeDasharray="6 4" />

      {/* Step 1: Breakfast (Bowl + Spoon) */}
      <G transform="translate(20, 25)">
        <Rect width="64" height="70" rx="10" fill="url(#drCard)" stroke="#F59E0B" strokeWidth="2.2" />
        {/* Step 1 badge */}
        <Rect x="6" y="6" width="18" height="14" rx="4" fill="#EA580C" />
        <Path d="M 14 10 L 14 17" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />

        {/* Breakfast bowl & steam */}
        <Path d="M 18 46 Q 32 62 46 46 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
        <Ellipse cx="32" cy="46" rx="14" ry="4" fill="#FDE047" />
        <Path d="M 28 38 Q 26 32 30 28 M 36 39 Q 38 33 34 29" stroke="#EA580C" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </G>

      {/* Arrow 1 */}
      <Path d="M 92 60 L 98 60 M 96 56 L 100 60 L 96 64" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Step 2: Medicine (Pill Capsule + Glass) */}
      <G transform="translate(108, 25)">
        <Rect width="64" height="70" rx="10" fill="url(#drCard)" stroke="#3B82F6" strokeWidth="2.2" />
        {/* Step 2 badge */}
        <Rect x="6" y="6" width="18" height="14" rx="4" fill="#2563EB" />
        <Circle cx="15" cy="13" r="2" fill="#FFFFFF" />

        {/* Pill Capsule */}
        <G transform="translate(20, 36) rotate(-30)">
          <Rect width="24" height="12" rx="6" fill="#EF4444" />
          <Rect x="12" width="12" height="12" rx="6" fill="#3B82F6" />
        </G>
      </G>

      {/* Arrow 2 */}
      <Path d="M 180 60 L 186 60 M 184 56 L 188 60 L 184 64" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Step 3: Morning Walk (Sneakers / Trees) */}
      <G transform="translate(196, 25)">
        <Rect width="64" height="70" rx="10" fill="url(#drCard)" stroke="#16A34A" strokeWidth="2.2" />
        {/* Step 3 badge */}
        <Rect x="6" y="6" width="18" height="14" rx="4" fill="#15803D" />
        <Circle cx="15" cy="13" r="2" fill="#FFFFFF" />

        {/* Tree & Walking path */}
        <Circle cx="32" cy="40" r="14" fill="#22C55E" />
        <Circle cx="24" cy="44" r="10" fill="#16A34A" />
        <Circle cx="40" cy="44" r="10" fill="#15803D" />
        <Rect x="29" y="48" width="6" height="12" rx="1" fill="#78350F" />
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



