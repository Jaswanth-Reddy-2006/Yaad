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
  Mask,
} from 'react-native-svg';

export interface IllustrationProps {
  width?: DimensionValue;
  height?: DimensionValue;
}

/**
 * Large, warm illustration of an elderly person happily playing a card memory game.
 */
export const PlayGameIllustration: React.FC<IllustrationProps> = ({
  width = '100%',
  height = 140,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 320 160" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="pgBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#DBEAFE" />
          <Stop offset="100%" stopColor="#BFDBFE" />
        </LinearGradient>
        <LinearGradient id="tableGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FED7AA" />
          <Stop offset="100%" stopColor="#FDBA74" />
        </LinearGradient>
        <LinearGradient id="cardGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#F8FAFC" />
        </LinearGradient>
      </Defs>

      {/* Background Soft Rounded Card */}
      <Rect width="320" height="160" rx="18" fill="url(#pgBgGrad)" />

      {/* Sun / Warm Window Glow in Background */}
      <Circle cx="270" cy="40" r="28" fill="#FEF08A" opacity="0.6" />
      <Circle cx="50" cy="50" r="20" fill="#93C5FD" opacity="0.4" />

      {/* Wooden Table Top */}
      <Path d="M 10 120 Q 160 110 310 120 L 310 160 L 10 160 Z" fill="url(#tableGrad)" />
      <Path d="M 10 120 Q 160 110 310 120" stroke="#EA580C" strokeWidth="2.5" fill="none" opacity="0.4" />

      {/* Elderly Person (Warm, Friendly, Mature Silhouette) */}
      <G transform="translate(60, 20)">
        {/* Torso & Shirt (Warm Kurta / Sweater) */}
        <Path d="M 20 85 Q 50 75 80 85 L 88 115 L 12 115 Z" fill="#2563EB" />
        {/* Collar / Scarf */}
        <Path d="M 38 82 Q 50 94 62 82" stroke="#FFFFFF" strokeWidth="3" fill="none" />

        {/* Head */}
        <Circle cx="50" cy="52" r="22" fill="#FDBA74" />
        {/* Gray/White Hair (Mature Elderly) */}
        <Path d="M 28 50 Q 28 26 50 26 Q 72 26 72 50 Q 64 34 50 34 Q 36 34 28 50 Z" fill="#E2E8F0" />
        {/* Smiling Eyes & Cheerful Glasses */}
        <Circle cx="42" cy="50" r="5" stroke="#1E293B" strokeWidth="1.8" fill="#FFFFFF" />
        <Circle cx="58" cy="50" r="5" stroke="#1E293B" strokeWidth="1.8" fill="#FFFFFF" />
        <Path d="M 47 50 L 53 50" stroke="#1E293B" strokeWidth="1.8" />
        {/* Warm Smile */}
        <Path d="M 43 62 Q 50 68 57 62" stroke="#9A3412" strokeWidth="2.2" strokeLinecap="round" fill="none" />

        {/* Arm reaching for card */}
        <Path d="M 75 90 Q 95 95 105 108" stroke="#FDBA74" strokeWidth="9" strokeLinecap="round" fill="none" />
      </G>

      {/* Memory Cards on Table (Matching Pair with Apple) */}
      {/* Card 1: Left Flipped Card */}
      <G transform="translate(170, 75) rotate(-6)">
        <Rect width="42" height="54" rx="7" fill="url(#cardGrad1)" stroke="#22C55E" strokeWidth="2.5" />
        {/* Apple Silhouette on card */}
        <Circle cx="21" cy="28" r="12" fill="#EF4444" />
        <Path d="M 21 16 Q 24 11 26 14" stroke="#15803D" strokeWidth="2" strokeLinecap="round" fill="none" />
      </G>

      {/* Sparkle between matching pair */}
      <Path d="M 218 80 L 222 72 L 226 80 L 234 84 L 226 88 L 222 96 L 218 88 L 210 84 Z" fill="#F59E0B" />

      {/* Card 2: Right Flipped Card (Matching!) */}
      <G transform="translate(230, 75) rotate(6)">
        <Rect width="42" height="54" rx="7" fill="url(#cardGrad1)" stroke="#22C55E" strokeWidth="2.5" />
        {/* Matching Apple Silhouette */}
        <Circle cx="21" cy="28" r="12" fill="#EF4444" />
        <Path d="M 21 16 Q 24 11 26 14" stroke="#15803D" strokeWidth="2" strokeLinecap="round" fill="none" />
      </G>
    </Svg>
  </View>
);

/**
 * Large, warm illustration of family scene / framed family memories.
 */
export const MemoriesIllustration: React.FC<IllustrationProps> = ({
  width = '100%',
  height = 140,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 320 160" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="memBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F3E8FF" />
          <Stop offset="100%" stopColor="#E9D5FF" />
        </LinearGradient>
        <LinearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FEF08A" />
          <Stop offset="100%" stopColor="#F59E0B" />
        </LinearGradient>
      </Defs>

      {/* Soft Background Card */}
      <Rect width="320" height="160" rx="18" fill="url(#memBgGrad)" />

      {/* Ambient Bokeh Hearts & Glows */}
      <Circle cx="50" cy="40" r="24" fill="#DDD6FE" opacity="0.5" />
      <Circle cx="280" cy="120" r="30" fill="#DDD6FE" opacity="0.5" />

      {/* Golden Wooden Photo Frame */}
      <G transform="translate(60, 18)">
        <Rect width="200" height="124" rx="14" fill="#FFFFFF" stroke="url(#frameGrad)" strokeWidth="6" />

        {/* Photo Scene Background (Warm Garden Sky) */}
        <Rect x="6" y="6" width="188" height="112" rx="10" fill="#E0F2FE" />
        {/* Soft Hills */}
        <Path d="M 6 95 Q 60 70 120 90 Q 160 80 194 95 L 194 118 L 6 118 Z" fill="#BBF7D0" />

        {/* Person 1: Loving Daughter (Left) */}
        <G transform="translate(35, 30)">
          {/* Hair */}
          <Path d="M 12 18 Q 24 8 36 18 Q 40 38 36 46 L 12 46 Z" fill="#1E293B" />
          {/* Face */}
          <Circle cx="24" cy="26" r="12" fill="#FDBA74" />
          <Circle cx="21" cy="25" r="2" fill="#1E293B" />
          <Circle cx="27" cy="25" r="2" fill="#1E293B" />
          <Path d="M 21 32 Q 24 35 27 32" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Saree / Dress */}
          <Path d="M 8 46 Q 24 38 40 46 L 44 80 L 4 80 Z" fill="#EC4899" />
        </G>

        {/* Person 2: Cheerful Elderly Parent (Center) */}
        <G transform="translate(85, 20)">
          {/* White Hair */}
          <Path d="M 14 18 Q 28 6 42 18 Q 44 32 38 38 L 18 38 Z" fill="#E2E8F0" />
          {/* Face */}
          <Circle cx="28" cy="25" r="13" fill="#FDBA74" />
          {/* Glasses */}
          <Circle cx="23" cy="24" r="3.5" stroke="#1E293B" strokeWidth="1.2" fill="#FFFFFF" />
          <Circle cx="33" cy="24" r="3.5" stroke="#1E293B" strokeWidth="1.2" fill="#FFFFFF" />
          <Path d="M 24 31 Q 28 35 32 31" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Kurta */}
          <Path d="M 10 42 Q 28 34 46 42 L 50 90 L 6 90 Z" fill="#7C3AED" />
        </G>

        {/* Person 3: Smiling Grandchild (Right) */}
        <G transform="translate(135, 42)">
          {/* Hair */}
          <Circle cx="20" cy="18" r="10" fill="#1E293B" />
          {/* Face */}
          <Circle cx="20" cy="20" r="9" fill="#FDBA74" />
          <Circle cx="17" cy="19" r="1.5" fill="#1E293B" />
          <Circle cx="23" cy="19" r="1.5" fill="#1E293B" />
          <Path d="M 18 24 Q 20 27 22 24" stroke="#9A3412" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          {/* Bright Shirt */}
          <Path d="M 8 32 Q 20 26 32 32 L 34 68 L 6 68 Z" fill="#F59E0B" />
        </G>
      </G>

      {/* Floating Love Heart on Top-Right */}
      <Path
        d="M 270 35 C 270 25 255 25 255 38 C 255 48 270 58 270 58 C 270 58 285 48 285 38 C 285 25 270 25 270 35 Z"
        fill="#EC4899"
      />
    </Svg>
  </View>
);

/**
 * Large, clear illustration of Daily Medicine Box, Tablets & Water Glass.
 */
export const MedicineIllustration: React.FC<IllustrationProps> = ({
  width = '100%',
  height = 140,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 320 160" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="medBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#DCFCE7" />
          <Stop offset="100%" stopColor="#BBF7D0" />
        </LinearGradient>
        <LinearGradient id="pillBoxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="100%" stopColor="#F1F5F9" />
        </LinearGradient>
      </Defs>

      {/* Soft Green Card Background */}
      <Rect width="320" height="160" rx="18" fill="url(#medBgGrad)" />

      {/* Sun / Clock Cue for Morning Routine */}
      <G transform="translate(30, 24)">
        <Circle cx="24" cy="24" r="20" fill="#FEF08A" stroke="#F59E0B" strokeWidth="3" />
        {/* Clock Hands indicating 9:00 AM */}
        <Path d="M 24 24 L 24 12" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
        <Path d="M 24 24 L 34 24" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
      </G>

      {/* Large Daily Pill Organizer Box (Center-Left) */}
      <G transform="translate(90, 42)">
        {/* Organizer Base */}
        <Rect width="125" height="85" rx="12" fill="url(#pillBoxGrad)" stroke="#16A34A" strokeWidth="3" />
        <Rect x="5" y="5" width="115" height="35" rx="8" fill="#E2E8F0" />

        {/* 3 Pill Compartments (Morning, Noon, Night) */}
        {/* Compartment 1: Morning (Sun Badge) */}
        <Rect x="8" y="44" width="34" height="34" rx="6" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.8" />
        <Circle cx="25" cy="55" r="5" fill="#EF4444" />
        <Circle cx="25" cy="67" r="4" fill="#3B82F6" />

        {/* Compartment 2: Afternoon */}
        <Rect x="46" y="44" width="34" height="34" rx="6" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.8" />
        <Circle cx="63" cy="61" r="5" fill="#10B981" />

        {/* Compartment 3: Evening */}
        <Rect x="84" y="44" width="34" height="34" rx="6" fill="#F3E8FF" stroke="#A855F7" strokeWidth="1.8" />
        <Circle cx="101" cy="61" r="5" fill="#F59E0B" />

        {/* Pill Box Label Bar */}
        <Path d="M 15 22 L 40 22" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
        <Path d="M 52 22 L 77 22" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
        <Path d="M 89 22 L 114 22" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
      </G>

      {/* Fresh Water Tumbler Glass (Right) */}
      <G transform="translate(235, 36)">
        {/* Glass Outline */}
        <Path d="M 12 18 L 18 96 Q 36 100 54 96 L 60 18 Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="3" />
        {/* Water Inside Glass */}
        <Path d="M 15 45 Q 36 48 57 45 L 53 92 Q 36 96 19 92 Z" fill="#38BDF8" opacity="0.8" />
        {/* Water Bubbles */}
        <Circle cx="32" cy="65" r="3.5" fill="#FFFFFF" opacity="0.8" />
        <Circle cx="42" cy="78" r="2.5" fill="#FFFFFF" opacity="0.8" />
        <Circle cx="28" cy="84" r="2" fill="#FFFFFF" opacity="0.8" />
      </G>
    </Svg>
  </View>
);

/**
 * Large, clear illustration of Drink Water / Hydration.
 */
export const DrinkWaterIllustration: React.FC<IllustrationProps> = ({
  width = '100%',
  height = 140,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 320 160" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="waterBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#E0F2FE" />
          <Stop offset="100%" stopColor="#BAE6FD" />
        </LinearGradient>
      </Defs>

      {/* Background */}
      <Rect width="320" height="160" rx="18" fill="url(#waterBgGrad)" />

      {/* Decorative Wave & Bubbles */}
      <Circle cx="45" cy="50" r="25" fill="#93C5FD" opacity="0.3" />
      <Circle cx="285" cy="110" r="20" fill="#93C5FD" opacity="0.3" />

      {/* Water Jug / Dispenser Bottle (Left) */}
      <G transform="translate(60, 22)">
        {/* Bottle Body */}
        <Path d="M 28 20 L 48 20 L 48 35 L 65 52 L 65 110 Q 38 118 11 110 L 11 52 L 28 35 Z" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3.2" />
        {/* Water Level */}
        <Path d="M 13 65 Q 38 70 63 65 L 63 108 Q 38 115 13 108 Z" fill="#0EA5E9" opacity="0.75" />
        {/* Cap */}
        <Rect x="26" y="10" width="24" height="10" rx="3" fill="#0284C7" />
        {/* Water Droplet Badge on Bottle */}
        <Circle cx="38" cy="85" r="10" fill="#E0F2FE" />
        <Path d="M 38 78 C 38 78 33 84 33 87 C 33 90 35 92 38 92 C 41 92 43 90 43 87 C 43 84 38 78 38 78 Z" fill="#0284C7" />
      </G>

      {/* Refreshing Tumbler Glass (Center-Right) */}
      <G transform="translate(165, 34)">
        <Path d="M 15 18 L 22 100 Q 45 106 68 100 L 75 18 Z" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3.2" />
        {/* Cold Ice Cubes & Water */}
        <Path d="M 18 42 Q 45 46 72 42 L 66 96 Q 45 102 24 96 Z" fill="#38BDF8" opacity="0.8" />
        {/* Ice Cube */}
        <Rect x="32" y="52" width="18" height="18" rx="4" fill="#FFFFFF" opacity="0.85" stroke="#BAE6FD" strokeWidth="1.5" />
        <Circle cx="54" cy="75" r="4" fill="#FFFFFF" opacity="0.9" />
        <Circle cx="36" cy="84" r="3" fill="#FFFFFF" opacity="0.9" />
      </G>

      {/* Big Cheerful Water Drops on Far Right */}
      <G transform="translate(255, 45)">
        <Path d="M 25 10 C 25 10 12 25 12 34 C 12 42 18 48 25 48 C 32 48 38 42 38 34 C 38 25 25 10 25 10 Z" fill="#0284C7" />
        <Circle cx="21" cy="32" r="3.5" fill="#FFFFFF" opacity="0.8" />
      </G>
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
