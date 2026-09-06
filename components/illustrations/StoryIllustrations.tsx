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

export interface SceneIllustrationProps {
  width?: DimensionValue;
  height?: DimensionValue;
}

// -------------------------------------------------------------
// STORY 1: Grandpa's Morning Garden
// -------------------------------------------------------------

/**
 * Story 1 - Scene 1: Grandpa Anand wearing a straw hat walking into his sunny morning backyard.
 */
export const GrandpaGardenScene1: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 190,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 320 190" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="g1Sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#BAE6FD" />
          <Stop offset="70%" stopColor="#E0F2FE" />
          <Stop offset="100%" stopColor="#DCFCE7" />
        </LinearGradient>
        <LinearGradient id="g1Grass" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#4ADE80" />
          <Stop offset="100%" stopColor="#15803D" />
        </LinearGradient>
        <LinearGradient id="hatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FEF08A" />
          <Stop offset="100%" stopColor="#EAB308" />
        </LinearGradient>
      </Defs>

      {/* Sky & Soft Background */}
      <Rect width="320" height="190" rx="14" fill="url(#g1Sky)" />

      {/* Morning Sun */}
      <Circle cx="260" cy="45" r="28" fill="#FDE047" opacity="0.9" />
      <Circle cx="260" cy="45" r="38" fill="#FEF08A" opacity="0.4" />

      {/* Gentle Green Hills / Lawn */}
      <Path d="M 0 115 Q 90 90 200 110 Q 270 120 320 105 L 320 190 L 0 190 Z" fill="url(#g1Grass)" />

      {/* Wooden Garden Fence in background */}
      <G stroke="#A16207" strokeWidth="2.5" fill="none">
        <Path d="M 190 95 L 190 125 M 215 95 L 215 125 M 240 95 L 240 125 M 265 95 L 265 125 M 290 95 L 290 125" />
        <Path d="M 180 102 L 305 102 M 180 115 L 305 115" />
      </G>

      {/* Garden Shrubs and Flower Sprouts */}
      <Circle cx="210" cy="130" r="16" fill="#16A34A" />
      <Circle cx="240" cy="132" r="14" fill="#15803D" />
      <Circle cx="280" cy="135" r="18" fill="#16A34A" />

      {/* Grandpa Anand */}
      <G transform="translate(60, 25)">
        {/* Legs & Brown Trousers */}
        <Rect x="30" y="105" width="9" height="42" rx="4" fill="#78350F" />
        <Rect x="43" y="105" width="9" height="42" rx="4" fill="#78350F" />
        {/* Shoes */}
        <Ellipse cx="33" cy="148" rx="8" ry="4" fill="#1E293B" />
        <Ellipse cx="49" cy="148" rx="8" ry="4" fill="#1E293B" />

        {/* Kurta / Shirt */}
        <Path d="M 20 62 L 62 62 L 68 112 L 14 112 Z" fill="#3B82F6" />
        <Path d="M 37 62 L 37 85" stroke="#1D4ED8" strokeWidth="2" />

        {/* Head & Neck */}
        <Rect x="36" y="48" width="10" height="16" fill="#FED7AA" />
        <Circle cx="41" cy="42" r="16" fill="#FED7AA" />

        {/* Friendly Elderly Facial Features & Glasses */}
        <Circle cx="36" cy="40" r="4.5" stroke="#0F172A" strokeWidth="1.6" fill="#FFFFFF" />
        <Circle cx="47" cy="40" r="4.5" stroke="#0F172A" strokeWidth="1.6" fill="#FFFFFF" />
        <Path d="M 40.5 40 L 42.5 40" stroke="#0F172A" strokeWidth="1.6" />
        {/* Smile */}
        <Path d="M 36 49 Q 41 54 47 49" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* White Mustache */}
        <Path d="M 34 46 Q 41 49 48 46" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Straw Sun Hat */}
        <Ellipse cx="41" cy="28" rx="28" ry="8" fill="url(#hatGrad)" stroke="#B45309" strokeWidth="1.8" />
        <Path d="M 24 28 C 24 12 58 12 58 28 Z" fill="url(#hatGrad)" stroke="#B45309" strokeWidth="1.8" />
        <Path d="M 25 27 Q 41 31 57 27" stroke="#DC2626" strokeWidth="2.5" fill="none" />
      </G>

      {/* Stone Pathway */}
      <Path d="M 70 190 Q 95 155 125 150 Q 150 148 180 155" stroke="#CBD5E1" strokeWidth="18" strokeLinecap="round" fill="none" />
    </Svg>
  </View>
);

/**
 * Story 1 - Scene 2: Grandpa watering vibrant blooming red roses with his bright green watering can.
 */
export const GrandpaGardenScene2: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 190,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 320 190" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="g2Sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#BAE6FD" />
          <Stop offset="100%" stopColor="#BBF7D0" />
        </LinearGradient>
        <LinearGradient id="canGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#22C55E" />
          <Stop offset="100%" stopColor="#15803D" />
        </LinearGradient>
      </Defs>

      <Rect width="320" height="190" rx="14" fill="url(#g2Sky)" />

      {/* Lawn ground */}
      <Path d="M 0 135 L 320 135 L 320 190 L 0 190 Z" fill="#15803D" />

      {/* Grandpa on left holding green watering can */}
      <G transform="translate(40, 20)">
        {/* Torso */}
        <Path d="M 20 65 L 56 65 L 60 118 L 16 118 Z" fill="#3B82F6" />
        <Rect x="26" y="118" width="9" height="36" rx="4" fill="#78350F" />
        <Rect x="42" y="118" width="9" height="36" rx="4" fill="#78350F" />

        {/* Head with straw hat */}
        <Circle cx="38" cy="42" r="16" fill="#FED7AA" />
        <Circle cx="34" cy="40" r="4" stroke="#0F172A" strokeWidth="1.5" fill="#FFFFFF" />
        <Circle cx="44" cy="40" r="4" stroke="#0F172A" strokeWidth="1.5" fill="#FFFFFF" />
        <Path d="M 34 49 Q 39 53 44 49" stroke="#9A3412" strokeWidth="2" fill="none" />
        <Ellipse cx="38" cy="28" rx="26" ry="7" fill="#FDE047" stroke="#B45309" strokeWidth="1.6" />
        <Path d="M 22 28 C 22 14 54 14 54 28 Z" fill="#FDE047" stroke="#B45309" strokeWidth="1.6" />

        {/* Arm extending forward */}
        <Path d="M 50 75 Q 75 75 90 85" stroke="#FED7AA" strokeWidth="10" strokeLinecap="round" fill="none" />

        {/* Bright Green Watering Can */}
        <G transform="translate(86, 72) rotate(18)">
          <Rect width="32" height="36" rx="4" fill="url(#canGrad)" stroke="#166534" strokeWidth="1.8" />
          {/* Top handle */}
          <Path d="M 4 0 C 4 -12 28 -12 28 0" stroke="#15803D" strokeWidth="4" fill="none" />
          {/* Spout */}
          <Path d="M 30 18 L 48 8" stroke="#15803D" strokeWidth="5" strokeLinecap="round" />
          <Ellipse cx="50" cy="7" rx="5" ry="3" fill="#166534" />
        </G>
      </G>

      {/* Water droplets sprinkling */}
      <G fill="#38BDF8" opacity="0.85">
        <Circle cx="195" cy="112" r="2.5" />
        <Circle cx="205" cy="118" r="2.5" />
        <Circle cx="192" cy="125" r="2.5" />
        <Circle cx="212" cy="128" r="2.5" />
        <Circle cx="202" cy="136" r="3" />
        <Circle cx="218" cy="138" r="2.5" />
      </G>

      {/* Large Bush with Blooming Red Roses */}
      <G transform="translate(200, 90)">
        {/* Bush greenery */}
        <Circle cx="35" cy="40" r="28" fill="#16A34A" />
        <Circle cx="65" cy="35" r="24" fill="#15803D" />
        <Circle cx="50" cy="55" r="26" fill="#166534" />

        {/* Rose 1 */}
        <Circle cx="25" cy="30" r="11" fill="#DC2626" />
        <Circle cx="25" cy="30" r="6" fill="#EF4444" />
        <Circle cx="25" cy="30" r="2.5" fill="#FCA5A5" />

        {/* Rose 2 */}
        <Circle cx="55" cy="22" r="13" fill="#DC2626" />
        <Circle cx="55" cy="22" r="7" fill="#EF4444" />
        <Circle cx="55" cy="22" r="3" fill="#FCA5A5" />

        {/* Rose 3 */}
        <Circle cx="72" cy="40" r="10" fill="#DC2626" />
        <Circle cx="72" cy="40" r="5.5" fill="#EF4444" />

        {/* Rose 4 */}
        <Circle cx="42" cy="48" r="12" fill="#B91C1C" />
        <Circle cx="42" cy="48" r="6" fill="#DC2626" />
      </G>
    </Svg>
  </View>
);

/**
 * Story 1 - Scene 3: A friendly yellow butterfly lands on Grandpa's shoulder as he smiles.
 */
export const GrandpaGardenScene3: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 190,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 320 190" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="g3Bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FEF08A" />
          <Stop offset="50%" stopColor="#BBF7D0" />
          <Stop offset="100%" stopColor="#86EFAC" />
        </LinearGradient>
      </Defs>

      <Rect width="320" height="190" rx="14" fill="url(#g3Bg)" />

      {/* Sunny aura sparkles */}
      <Circle cx="60" cy="50" r="12" fill="#FEF9C3" opacity="0.8" />
      <Circle cx="260" cy="40" r="16" fill="#FEF9C3" opacity="0.8" />

      {/* Grandpa Close-up Portrait */}
      <G transform="translate(100, 30)">
        {/* Torso & Blue Kurta */}
        <Path d="M 0 110 Q 60 95 120 110 L 128 160 L -8 160 Z" fill="#3B82F6" />
        <Path d="M 45 102 Q 60 116 75 102" stroke="#FFFFFF" strokeWidth="3" fill="none" />

        {/* Head */}
        <Circle cx="60" cy="62" r="28" fill="#FED7AA" />

        {/* Cheerful Smiling Eyes & Glasses */}
        <Circle cx="50" cy="60" r="7" stroke="#0F172A" strokeWidth="2.2" fill="#FFFFFF" />
        <Circle cx="72" cy="60" r="7" stroke="#0F172A" strokeWidth="2.2" fill="#FFFFFF" />
        <Path d="M 57 60 L 65 60" stroke="#0F172A" strokeWidth="2.2" />

        <Circle cx="50" cy="60" r="3" fill="#0F172A" />
        <Circle cx="72" cy="60" r="3" fill="#0F172A" />

        {/* Big Joyful Smile */}
        <Path d="M 49 76 Q 60 88 73 76" stroke="#B91C1C" strokeWidth="3" strokeLinecap="round" fill="none" />
        <Path d="M 45 72 Q 60 76 75 72" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="none" />

        {/* Straw Sun Hat */}
        <Ellipse cx="60" cy="38" rx="42" ry="12" fill="#FDE047" stroke="#B45309" strokeWidth="2" />
        <Path d="M 32 38 C 32 14 88 14 88 38 Z" fill="#FDE047" stroke="#B45309" strokeWidth="2" />
        <Path d="M 34 37 Q 60 42 86 37" stroke="#DC2626" strokeWidth="3.5" fill="none" />

        {/* Yellow Butterfly on Shoulder */}
        <G transform="translate(10, 95)">
          {/* Wings */}
          <Ellipse cx="-6" cy="-8" rx="10" ry="14" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" transform="rotate(-20)" />
          <Ellipse cx="6" cy="-8" rx="10" ry="14" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" transform="rotate(20)" />
          <Ellipse cx="-4" cy="4" rx="6" ry="8" fill="#FBBF24" />
          <Ellipse cx="4" cy="4" rx="6" ry="8" fill="#FBBF24" />
          {/* Body */}
          <Rect x="-2" y="-12" width="4" height="18" rx="2" fill="#451A03" />
          {/* Antennae */}
          <Path d="M -1 -12 Q -5 -18 -8 -16 M 1 -12 Q 5 -18 8 -16" stroke="#451A03" strokeWidth="1.4" fill="none" />
        </G>
      </G>
    </Svg>
  </View>
);

// -------------------------------------------------------------
// STORY 2: Maya's Cozy Afternoon Tea
// -------------------------------------------------------------

/**
 * Story 2 - Scene 1: Maya sitting comfortably in her blue armchair wearing a purple cardigan.
 */
export const MayaTeaScene1: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 190,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 320 190" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="m1Wall" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FEF3C7" />
          <Stop offset="100%" stopColor="#FDE68A" />
        </LinearGradient>
        <LinearGradient id="chairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#1D4ED8" />
        </LinearGradient>
      </Defs>

      {/* Living Room Wall */}
      <Rect width="320" height="190" rx="14" fill="url(#m1Wall)" />
      {/* Floor */}
      <Rect y="145" width="320" height="45" fill="#78350F" opacity="0.35" />

      {/* Framed picture on wall */}
      <Rect x="40" y="25" width="48" height="38" rx="4" fill="#FFFFFF" stroke="#92400E" strokeWidth="3" />
      <Circle cx="64" cy="40" r="10" fill="#F43F5E" />

      {/* Cozy Blue Armchair */}
      <G transform="translate(110, 45)">
        {/* Back Cushion */}
        <Rect x="15" y="10" width="70" height="85" rx="14" fill="url(#chairGrad)" stroke="#1E40AF" strokeWidth="2.5" />
        {/* Armrest Left */}
        <Rect x="0" y="45" width="22" height="55" rx="10" fill="#2563EB" stroke="#1E40AF" strokeWidth="2" />
        {/* Armrest Right */}
        <Rect x="78" y="45" width="22" height="55" rx="10" fill="#2563EB" stroke="#1E40AF" strokeWidth="2" />
        {/* Chair Legs */}
        <Rect x="8" y="98" width="6" height="20" rx="2" fill="#451A03" />
        <Rect x="86" y="98" width="6" height="20" rx="2" fill="#451A03" />

        {/* Maya sitting inside armchair */}
        {/* Purple Cardigan Body */}
        <Path d="M 28 42 Q 50 36 72 42 L 75 90 L 25 90 Z" fill="#9333EA" />
        {/* White Inner Scarf */}
        <Path d="M 43 40 L 50 56 L 57 40" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />

        {/* Maya's Head */}
        <Circle cx="50" cy="24" r="16" fill="#FDBA74" />
        {/* Black/Silver Hair bun */}
        <Path d="M 34 22 C 34 8 66 8 66 22 Z" fill="#334155" />
        <Circle cx="50" cy="8" r="7" fill="#334155" />
        {/* Friendly eyes and smile */}
        <Circle cx="44" cy="24" r="2.5" fill="#0F172A" />
        <Circle cx="56" cy="24" r="2.5" fill="#0F172A" />
        <Path d="M 45 31 Q 50 35 55 31" stroke="#B91C1C" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </G>
    </Svg>
  </View>
);

/**
 * Story 2 - Scene 2: Maya pouring warm chai from a golden teapot into a white cup and a crispy biscuit.
 */
export const MayaTeaScene2: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 190,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 320 190" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="m2Bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F5F3FF" />
          <Stop offset="100%" stopColor="#EDE9FE" />
        </LinearGradient>
        <LinearGradient id="goldPot" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FDE047" />
          <Stop offset="100%" stopColor="#D97706" />
        </LinearGradient>
      </Defs>

      <Rect width="320" height="190" rx="14" fill="url(#m2Bg)" />

      {/* Wooden Table Top */}
      <Rect y="115" width="320" height="75" fill="#FDBA74" stroke="#EA580C" strokeWidth="2" />

      {/* Golden Teapot pouring */}
      <G transform="translate(60, 45) rotate(22)">
        {/* Pot body */}
        <Ellipse cx="40" cy="35" rx="28" ry="22" fill="url(#goldPot)" stroke="#B45309" strokeWidth="2" />
        {/* Lid & Knob */}
        <Ellipse cx="40" cy="14" rx="14" ry="5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
        <Circle cx="40" cy="8" r="4" fill="#B45309" />
        {/* Handle */}
        <Path d="M 12 25 C -5 25 -5 48 14 48" stroke="#B45309" strokeWidth="5" fill="none" />
        {/* Spout */}
        <Path d="M 66 30 Q 82 22 92 10 L 88 8 Q 76 18 64 22 Z" fill="#D97706" stroke="#B45309" strokeWidth="1.5" />
      </G>

      {/* Stream of Tea */}
      <Path d="M 162 76 Q 170 95 174 118" stroke="#92400E" strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* White Tea Cup on Saucer */}
      <G transform="translate(155, 110)">
        {/* Saucer */}
        <Ellipse cx="25" cy="40" rx="28" ry="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
        {/* Cup body */}
        <Path d="M 8 20 L 12 36 Q 25 40 38 36 L 42 20 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
        {/* Warm Tea surface */}
        <Ellipse cx="25" cy="20" rx="17" ry="5" fill="#92400E" />
        {/* Cup handle */}
        <Path d="M 40 24 C 48 24 48 34 38 34" stroke="#CBD5E1" strokeWidth="3" fill="none" />
        {/* Steam */}
        <Path d="M 20 12 Q 18 2 24 -6 M 28 14 Q 32 4 28 -4" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      </G>

      {/* Crispy Round Biscuit / Cookie on Side Plate */}
      <G transform="translate(225, 120)">
        <Ellipse cx="25" cy="25" rx="22" ry="10" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        <Circle cx="25" cy="23" r="14" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
        {/* Cookie dots */}
        <Circle cx="20" cy="20" r="1.5" fill="#78350F" />
        <Circle cx="28" cy="19" r="1.5" fill="#78350F" />
        <Circle cx="24" cy="26" r="1.5" fill="#78350F" />
        <Circle cx="30" cy="25" r="1.5" fill="#78350F" />
      </G>
    </Svg>
  </View>
);

/**
 * Story 2 - Scene 3: Her fluffy ginger cat Leo curls up asleep on the rug by her feet.
 */
export const MayaTeaScene3: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 190,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 320 190" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="rugGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FBCFE8" />
          <Stop offset="100%" stopColor="#F472B6" />
        </LinearGradient>
        <LinearGradient id="catFur" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FB923C" />
          <Stop offset="100%" stopColor="#EA580C" />
        </LinearGradient>
      </Defs>

      {/* Room Background */}
      <Rect width="320" height="190" rx="14" fill="#FEF3C7" />

      {/* Oval Cozy Rug */}
      <Ellipse cx="160" cy="120" rx="110" ry="50" fill="url(#rugGrad)" stroke="#DB2777" strokeWidth="3" />
      {/* Rug fringe/pattern */}
      <Ellipse cx="160" cy="120" rx="90" ry="38" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="6 4" fill="none" />

      {/* Sleeping Ginger Cat Leo */}
      <G transform="translate(115, 80)">
        {/* Curled Body */}
        <Ellipse cx="45" cy="38" rx="36" ry="24" fill="url(#catFur)" stroke="#C2410C" strokeWidth="2" />
        {/* Striped Markings */}
        <Path d="M 35 20 Q 38 28 32 36 M 48 18 Q 52 28 46 38 M 60 22 Q 64 30 58 38" stroke="#9A3412" strokeWidth="2" fill="none" />

        {/* Head tucked in */}
        <Circle cx="22" cy="34" r="16" fill="#FB923C" stroke="#C2410C" strokeWidth="1.8" />
        {/* Ears */}
        <Path d="M 12 24 L 8 10 L 22 18 Z" fill="#EA580C" />
        <Path d="M 22 18 L 30 10 L 34 24 Z" fill="#EA580C" />
        {/* Closed Peaceful Eyes */}
        <Path d="M 14 36 Q 18 39 22 36" stroke="#431407" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        {/* Cute Pink Nose */}
        <Circle cx="18" cy="41" r="2" fill="#F472B6" />

        {/* Curled Tail */}
        <Path d="M 80 42 C 95 42 98 25 88 18" stroke="#EA580C" strokeWidth="7" strokeLinecap="round" fill="none" />

        {/* Zzz floating bubbles */}
        <G fill="#9333EA">
          <Circle cx="5" cy="10" r="3" fill="#A855F7" opacity="0.6" />
          <Circle cx="-5" cy="-2" r="4.5" fill="#A855F7" opacity="0.7" />
          <Circle cx="-15" cy="-15" r="6" fill="#A855F7" opacity="0.8" />
        </G>
      </G>
    </Svg>
  </View>
);

// -------------------------------------------------------------
// STORY 3: Raju's Picnic in the Park
// -------------------------------------------------------------

/**
 * Story 3 - Scene 1: Young Raju packing a red picnic basket with sweet yellow bananas and water.
 */
export const RajuPicnicScene1: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 190,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 320 190" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="r1Bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#E0F2FE" />
          <Stop offset="100%" stopColor="#BAE6FD" />
        </LinearGradient>
      </Defs>

      <Rect width="320" height="190" rx="14" fill="url(#r1Bg)" />
      <Rect y="130" width="320" height="60" fill="#FED7AA" stroke="#F97316" strokeWidth="2" />

      {/* Raju happily preparing picnic */}
      <G transform="translate(45, 25)">
        {/* Torso in green shirt */}
        <Path d="M 25 65 L 60 65 L 64 110 L 20 110 Z" fill="#16A34A" />
        <Circle cx="42" cy="40" r="16" fill="#FED7AA" />
        {/* Smile and eyes */}
        <Circle cx="37" cy="38" r="2.5" fill="#0F172A" />
        <Circle cx="48" cy="38" r="2.5" fill="#0F172A" />
        <Path d="M 37 46 Q 42 51 48 46" stroke="#9A3412" strokeWidth="2" fill="none" />
        {/* Hair */}
        <Path d="M 28 36 C 28 22 56 22 56 36 Z" fill="#1E293B" />
        {/* Arm reaching toward basket */}
        <Path d="M 55 75 Q 75 75 90 85" stroke="#FED7AA" strokeWidth="8" strokeLinecap="round" fill="none" />
      </G>

      {/* Red Picnic Basket */}
      <G transform="translate(160, 70)">
        {/* Basket body */}
        <Rect x="0" y="25" width="85" height="50" rx="6" fill="#EF4444" stroke="#B91C1C" strokeWidth="2.5" />
        {/* Wicker crosshatch pattern */}
        <Path d="M 15 25 L 15 75 M 35 25 L 35 75 M 55 25 L 55 75 M 75 25 L 75 75" stroke="#F87171" strokeWidth="2" />
        <Path d="M 0 40 L 85 40 M 0 58 L 85 58" stroke="#F87171" strokeWidth="2" />
        {/* Basket Handle */}
        <Path d="M 10 25 C 10 -5 75 -5 75 25" stroke="#B91C1C" strokeWidth="5" fill="none" />

        {/* Yellow Bananas peeking out */}
        <G transform="translate(20, 5)">
          <Path d="M 5 22 C 15 6 35 10 40 22 C 32 15 18 14 5 22 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
          <Path d="M 12 18 C 22 2 42 6 47 18 C 39 11 25 10 12 18 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
          <Circle cx="6" cy="22" r="2" fill="#78350F" />
          <Circle cx="13" cy="18" r="2" fill="#78350F" />
        </G>
      </G>
    </Svg>
  </View>
);

/**
 * Story 3 - Scene 2: Raju riding his green bicycle down the path to the big oak tree by the pond.
 */
export const RajuPicnicScene2: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 190,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 320 190" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="r2Park" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#BAE6FD" />
          <Stop offset="60%" stopColor="#DCFCE7" />
          <Stop offset="100%" stopColor="#86EFAC" />
        </LinearGradient>
      </Defs>

      <Rect width="320" height="190" rx="14" fill="url(#r2Park)" />

      {/* Big Oak Tree on Right */}
      <G transform="translate(230, 20)">
        {/* Trunk */}
        <Path d="M 28 80 L 22 150 L 48 150 L 42 80 Z" fill="#78350F" />
        {/* Foliage Canopy */}
        <Circle cx="35" cy="50" r="38" fill="#15803D" />
        <Circle cx="15" cy="40" r="28" fill="#16A34A" />
        <Circle cx="55" cy="40" r="28" fill="#16A34A" />
        <Circle cx="35" cy="20" r="26" fill="#22C55E" />
      </G>

      {/* Sparkling Pond */}
      <Ellipse cx="260" cy="165" rx="50" ry="18" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />

      {/* Winding Trail */}
      <Path d="M 0 170 Q 120 135 240 160" stroke="#CBD5E1" strokeWidth="28" fill="none" />

      {/* Raju on Green Bicycle */}
      <G transform="translate(50, 65)">
        {/* Wheels */}
        <Circle cx="25" cy="75" r="20" stroke="#334155" strokeWidth="4" fill="#F8FAFC" />
        <Circle cx="85" cy="75" r="20" stroke="#334155" strokeWidth="4" fill="#F8FAFC" />
        {/* Spokes */}
        <Path d="M 25 55 L 25 95 M 5 75 L 45 75 M 85 55 L 85 95 M 65 75 L 105 75" stroke="#94A3B8" strokeWidth="1.5" />

        {/* Green Bicycle Frame */}
        <Path d="M 25 75 L 50 75 L 70 48 L 42 48 Z" stroke="#16A34A" strokeWidth="4.5" fill="none" />
        <Path d="M 50 75 L 42 38" stroke="#16A34A" strokeWidth="4.5" />
        <Path d="M 85 75 L 70 48" stroke="#16A34A" strokeWidth="4.5" />

        {/* Red Basket on Handlebar */}
        <Rect x="74" y="32" width="16" height="12" rx="2" fill="#EF4444" />

        {/* Raju Rider */}
        <Circle cx="48" cy="18" r="12" fill="#FED7AA" />
        <Path d="M 40 15 C 40 6 58 6 58 15 Z" fill="#1E293B" />
        <Path d="M 42 30 L 52 56 L 68 56" stroke="#15803D" strokeWidth="10" strokeLinecap="round" fill="none" />
      </G>
    </Svg>
  </View>
);

/**
 * Story 3 - Scene 3: Under the tree, Raju spreads a blue checkered blanket and shares bananas.
 */
export const RajuPicnicScene3: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 190,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 320 190" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="r3Lawn" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#DCFCE7" />
          <Stop offset="100%" stopColor="#4ADE80" />
        </LinearGradient>
      </Defs>

      <Rect width="320" height="190" rx="14" fill="url(#r3Lawn)" />

      {/* Tree trunk canopy shade overhead */}
      <Path d="M 0 0 Q 160 60 320 0 Z" fill="#15803D" opacity="0.8" />

      {/* Blue Checkered Blanket */}
      <G transform="translate(60, 65)">
        <Rect width="200" height="100" rx="10" fill="#DBEAFE" stroke="#2563EB" strokeWidth="3" />
        {/* Grid lines */}
        <Path d="M 40 0 L 40 100 M 80 0 L 80 100 M 120 0 L 120 100 M 160 0 L 160 100" stroke="#93C5FD" strokeWidth="3" />
        <Path d="M 0 25 L 200 25 M 0 50 L 200 50 M 0 75 L 200 75" stroke="#93C5FD" strokeWidth="3" />

        {/* Red Picnic Basket open on blanket */}
        <Rect x="20" y="25" width="45" height="35" rx="4" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />

        {/* Bananas Plate */}
        <Ellipse cx="105" cy="50" rx="26" ry="16" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
        <Path d="M 90 52 C 98 42 112 44 118 52 C 112 47 100 46 90 52 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
        <Path d="M 95 56 C 103 48 116 49 122 56 C 116 52 104 51 95 56 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />

        {/* Raju sitting happily on left */}
        <Circle cx="35" cy="10" r="14" fill="#FED7AA" />
        <Path d="M 28 8 C 28 0 44 0 44 8 Z" fill="#1E293B" />
        <Circle cx="33" cy="9" r="2" fill="#0F172A" />
        <Circle cx="40" cy="9" r="2" fill="#0F172A" />

        {/* Friend sitting on right */}
        <Circle cx="170" cy="10" r="14" fill="#FED7AA" />
        <Path d="M 160 8 C 160 -2 180 -2 180 8 Z" fill="#9333EA" />
        <Circle cx="166" cy="9" r="2" fill="#0F172A" />
        <Circle cx="174" cy="9" r="2" fill="#0F172A" />
      </G>
    </Svg>
  </View>
);

// -------------------------------------------------------------
// STORY 4: Anita's Sweet Mango Treat
// -------------------------------------------------------------

/**
 * Story 4 - Scene 1: Anita in her bright kitchen wearing an orange apron.
 */
export const AnitaMangoScene1: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 190,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 320 190" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="k1Wall" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FEF3C7" />
          <Stop offset="100%" stopColor="#FDE68A" />
        </LinearGradient>
      </Defs>

      <Rect width="320" height="190" rx="14" fill="url(#k1Wall)" />
      {/* Kitchen Countertop */}
      <Rect y="125" width="320" height="65" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />

      {/* Sunlit Kitchen Window */}
      <Rect x="200" y="20" width="70" height="60" rx="4" fill="#BAE6FD" stroke="#78350F" strokeWidth="3" />
      <Path d="M 235 20 L 235 80 M 200 50 L 270 50" stroke="#78350F" strokeWidth="2" />

      {/* Anita with Orange Apron */}
      <G transform="translate(90, 25)">
        {/* Head */}
        <Circle cx="50" cy="38" r="18" fill="#FED7AA" />
        {/* Silver/Black Hair in tidy bun */}
        <Path d="M 32 35 C 32 18 68 18 68 35 Z" fill="#475569" />
        <Circle cx="50" cy="16" r="8" fill="#475569" />
        {/* Cheerful Smile and Glasses */}
        <Circle cx="44" cy="38" r="4.5" stroke="#0F172A" strokeWidth="1.6" fill="#FFFFFF" />
        <Circle cx="56" cy="38" r="4.5" stroke="#0F172A" strokeWidth="1.6" fill="#FFFFFF" />
        <Path d="M 44 48 Q 50 53 56 48" stroke="#B91C1C" strokeWidth="2" fill="none" />

        {/* Orange Apron over Yellow Kurta */}
        <Path d="M 30 58 L 70 58 L 78 125 L 22 125 Z" fill="#F97316" stroke="#EA580C" strokeWidth="2" />
        {/* Apron Pocket */}
        <Rect x="38" y="85" width="24" height="20" rx="3" fill="#EA580C" />
      </G>
    </Svg>
  </View>
);

/**
 * Story 4 - Scene 2: Anita picking 3 ripe golden mangoes from a wooden bowl.
 */
export const AnitaMangoScene2: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 190,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 320 190" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="mangoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FDE047" />
          <Stop offset="50%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#EA580C" />
        </LinearGradient>
      </Defs>

      <Rect width="320" height="190" rx="14" fill="#FFFBEB" />

      {/* Kitchen Table */}
      <Rect y="110" width="320" height="80" fill="#FED7AA" stroke="#F97316" strokeWidth="2" />

      {/* Large Wooden Bowl with 3 Mangoes */}
      <G transform="translate(100, 60)">
        {/* Wooden Bowl */}
        <Path d="M 10 50 Q 60 95 110 50 Z" fill="#92400E" stroke="#78350F" strokeWidth="3" />

        {/* Mango 1 (Left) */}
        <G transform="translate(20, 15) rotate(-15)">
          <Path d="M 15 5 C 28 -2 38 12 30 32 C 24 45 6 38 4 24 C 2 12 8 8 15 5 Z" fill="url(#mangoGrad)" stroke="#D97706" strokeWidth="1.5" />
          <Circle cx="18" cy="4" r="2.5" fill="#15803D" />
        </G>

        {/* Mango 2 (Center) */}
        <G transform="translate(42, 5)">
          <Path d="M 16 5 C 30 -2 40 14 32 34 C 26 48 8 40 5 26 C 3 13 9 8 16 5 Z" fill="url(#mangoGrad)" stroke="#D97706" strokeWidth="1.5" />
          <Circle cx="20" cy="4" r="2.5" fill="#15803D" />
        </G>

        {/* Mango 3 (Right) */}
        <G transform="translate(68, 15) rotate(15)">
          <Path d="M 15 5 C 28 -2 38 12 30 32 C 24 45 6 38 4 24 C 2 12 8 8 15 5 Z" fill="url(#mangoGrad)" stroke="#D97706" strokeWidth="1.5" />
          <Circle cx="18" cy="4" r="2.5" fill="#15803D" />
        </G>
      </G>
    </Svg>
  </View>
);

/**
 * Story 4 - Scene 3: Anita blending sweet cold mango kulfi in beautiful glasses to share.
 */
export const AnitaMangoScene3: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 190,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 320 190" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="kulfiGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FEF08A" />
          <Stop offset="100%" stopColor="#F59E0B" />
        </LinearGradient>
      </Defs>

      <Rect width="320" height="190" rx="14" fill="#FEF3C7" />

      {/* Serving tray */}
      <Ellipse cx="160" cy="135" rx="120" ry="38" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="3" />

      {/* Kulfi Dessert Cup 1 */}
      <G transform="translate(85, 55)">
        <Path d="M 8 15 L 14 55 Q 25 60 36 55 L 42 15 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
        <Path d="M 10 18 L 15 50 Q 25 54 35 50 L 40 18 Z" fill="url(#kulfiGrad)" />
        {/* Stick */}
        <Rect x="23" y="-2" width="4" height="24" rx="2" fill="#D97706" />
        {/* Pistachio sprinkles */}
        <Circle cx="20" cy="24" r="1.5" fill="#15803D" />
        <Circle cx="30" cy="22" r="1.5" fill="#15803D" />
        <Circle cx="25" cy="32" r="1.5" fill="#DC2626" />
      </G>

      {/* Kulfi Dessert Cup 2 (Center) */}
      <G transform="translate(138, 45)">
        <Path d="M 8 15 L 14 62 Q 25 68 36 62 L 42 15 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
        <Path d="M 10 18 L 15 56 Q 25 61 35 56 L 40 18 Z" fill="url(#kulfiGrad)" />
        {/* Stick */}
        <Rect x="23" y="-6" width="4" height="28" rx="2" fill="#D97706" />
        {/* Sprinkles */}
        <Circle cx="22" cy="25" r="1.5" fill="#15803D" />
        <Circle cx="28" cy="23" r="1.5" fill="#DC2626" />
      </G>

      {/* Kulfi Dessert Cup 3 */}
      <G transform="translate(190, 55)">
        <Path d="M 8 15 L 14 55 Q 25 60 36 55 L 42 15 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
        <Path d="M 10 18 L 15 50 Q 25 54 35 50 L 40 18 Z" fill="url(#kulfiGrad)" />
        {/* Stick */}
        <Rect x="23" y="-2" width="4" height="24" rx="2" fill="#D97706" />
        {/* Pistachio sprinkles */}
        <Circle cx="22" cy="24" r="1.5" fill="#15803D" />
        <Circle cx="28" cy="30" r="1.5" fill="#15803D" />
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
