import React from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import Svg, {
  Rect,
  Circle,
  Path,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Ellipse,
} from 'react-native-svg';

export interface SceneIllustrationProps {
  width?: DimensionValue;
  height?: DimensionValue;
}

// =============================================================
// STORY 1: Grandpa's Morning Garden (Grandpa Anand)
// =============================================================

/**
 * Story 1 - Scene 1: Grandpa Anand wearing his straw hat standing in his sunny morning garden.
 */
export const GrandpaGardenScene1: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 195,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 340 195" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="g1Sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#BAE6FD" />
          <Stop offset="60%" stopColor="#E0F2FE" />
          <Stop offset="100%" stopColor="#DCFCE7" />
        </LinearGradient>
        <LinearGradient id="g1Lawn" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#4ADE80" />
          <Stop offset="100%" stopColor="#15803D" />
        </LinearGradient>
        <LinearGradient id="g1Skin" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FED7AA" />
          <Stop offset="100%" stopColor="#FDBA74" />
        </LinearGradient>
        <LinearGradient id="g1Hat" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FEF08A" />
          <Stop offset="100%" stopColor="#EAB308" />
        </LinearGradient>
        <LinearGradient id="g1Kurta" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#60A5FA" />
          <Stop offset="100%" stopColor="#2563EB" />
        </LinearGradient>
      </Defs>

      {/* Sky */}
      <Rect width="340" height="195" rx="8" fill="url(#g1Sky)" />

      {/* Warm Morning Sun with Aura */}
      <Circle cx="280" cy="38" r="28" fill="#FEF08A" opacity="0.4" />
      <Circle cx="280" cy="38" r="18" fill="#FDE047" />

      {/* Distant Hills & Trees */}
      <Path d="M 0 100 Q 100 80 220 95 Q 280 85 340 100 L 340 195 L 0 195 Z" fill="#86EFAC" opacity="0.6" />
      <Circle cx="240" cy="85" r="14" fill="#15803D" opacity="0.7" />
      <Circle cx="260" cy="80" r="18" fill="#16A34A" opacity="0.7" />
      <Circle cx="285" cy="86" r="15" fill="#15803D" opacity="0.7" />

      {/* Lawn */}
      <Path d="M 0 120 Q 120 105 240 115 Q 290 110 340 122 L 340 195 L 0 195 Z" fill="url(#g1Lawn)" />

      {/* Stone Garden Path */}
      <Path d="M 120 195 Q 140 160 165 145 Q 185 140 210 145" stroke="#CBD5E1" strokeWidth="26" strokeLinecap="round" fill="none" />
      <Ellipse cx="140" cy="175" rx="10" ry="4" fill="#94A3B8" opacity="0.5" />
      <Ellipse cx="165" cy="155" rx="12" ry="5" fill="#94A3B8" opacity="0.5" />

      {/* Garden Bush on Right with Red Flowers */}
      <G transform="translate(230, 115)">
        <Circle cx="30" cy="35" r="24" fill="#16A34A" />
        <Circle cx="55" cy="30" r="20" fill="#15803D" />
        <Circle cx="45" cy="50" r="22" fill="#14532D" />
        <Circle cx="25" cy="28" r="6" fill="#EF4444" />
        <Circle cx="50" cy="22" r="7" fill="#DC2626" />
        <Circle cx="62" cy="38" r="6" fill="#EF4444" />
      </G>

      {/* GRANDPA ANAND (Realistic Human Illustration) */}
      <G transform="translate(75, 12)">
        {/* Shadow on Path */}
        <Ellipse cx="58" cy="176" rx="28" ry="7" fill="#0F172A" opacity="0.2" />

        {/* Legs & Trousers */}
        <Path d="M 46 122 L 44 168 L 54 168 L 56 122 Z" fill="#78350F" />
        <Path d="M 60 122 L 62 168 L 72 168 L 70 122 Z" fill="#78350F" />
        {/* Shoes */}
        <Path d="M 40 166 Q 44 164 54 166 L 56 172 L 38 172 Z" fill="#1E293B" />
        <Path d="M 60 166 Q 66 164 76 166 L 78 172 L 58 172 Z" fill="#1E293B" />

        {/* Kurta Body with Draping Folds */}
        <Path
          d="M 38 72 C 32 85 30 115 32 126 C 45 130 72 130 84 126 C 86 115 84 85 78 72 Z"
          fill="url(#g1Kurta)"
        />
        {/* Kurta Collar & Buttons */}
        <Path d="M 52 68 L 58 84 L 64 68" stroke="#DBEAFE" strokeWidth="2.5" fill="none" />
        <Circle cx="58" cy="92" r="1.5" fill="#DBEAFE" />
        <Circle cx="58" cy="102" r="1.5" fill="#DBEAFE" />
        <Circle cx="58" cy="112" r="1.5" fill="#DBEAFE" />

        {/* Left Arm & Hand */}
        <Path d="M 38 72 Q 28 95 32 118" stroke="url(#g1Kurta)" strokeWidth="12" strokeLinecap="round" fill="none" />
        <Circle cx="32" cy="122" r="6" fill="url(#g1Skin)" />

        {/* Right Arm & Hand */}
        <Path d="M 78 72 Q 88 95 84 118" stroke="url(#g1Kurta)" strokeWidth="12" strokeLinecap="round" fill="none" />
        <Circle cx="84" cy="122" r="6" fill="url(#g1Skin)" />

        {/* Neck */}
        <Path d="M 52 56 L 52 70 L 64 70 L 64 56 Z" fill="url(#g1Skin)" />

        {/* Head Base */}
        <Path
          d="M 44 42 C 44 26 72 26 72 42 C 72 58 66 64 58 64 C 50 64 44 58 44 42 Z"
          fill="url(#g1Skin)"
        />
        {/* Blushing Cheeks */}
        <Circle cx="49" cy="48" r="4" fill="#F87171" opacity="0.3" />
        <Circle cx="67" cy="48" r="4" fill="#F87171" opacity="0.3" />

        {/* Ears */}
        <Circle cx="43" cy="44" r="4.5" fill="url(#g1Skin)" />
        <Circle cx="73" cy="44" r="4.5" fill="url(#g1Skin)" />

        {/* Silver Hair on Sides */}
        <Path d="M 43 36 Q 41 46 44 50" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" fill="none" />
        <Path d="M 73 36 Q 75 46 72 50" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" fill="none" />

        {/* Expressive Elderly Eyes & Glasses */}
        <Circle cx="51" cy="42" r="5.5" stroke="#0F172A" strokeWidth="1.8" fill="#FFFFFF" />
        <Circle cx="65" cy="42" r="5.5" stroke="#0F172A" strokeWidth="1.8" fill="#FFFFFF" />
        <Path d="M 56.5 42 L 59.5 42" stroke="#0F172A" strokeWidth="1.8" />
        <Circle cx="51" cy="42" r="2.5" fill="#451A03" />
        <Circle cx="65" cy="42" r="2.5" fill="#451A03" />
        <Circle cx="50" cy="41" r="0.8" fill="#FFFFFF" />
        <Circle cx="64" cy="41" r="0.8" fill="#FFFFFF" />

        {/* Silver Eyebrows */}
        <Path d="M 47 35 Q 52 33 56 36" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <Path d="M 60 36 Q 64 33 69 35" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Gentle Nose */}
        <Path d="M 58 40 Q 60 48 56 50" stroke="#EA580C" strokeWidth="1.6" strokeLinecap="round" fill="none" />

        {/* Friendly White Mustache */}
        <Path d="M 48 53 Q 58 57 68 53" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" fill="none" />

        {/* Warm Smiling Mouth */}
        <Path d="M 52 56 Q 58 60 64 56" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Woven Straw Sun Hat */}
        <Ellipse cx="58" cy="30" rx="34" ry="10" fill="url(#g1Hat)" stroke="#B45309" strokeWidth="2" />
        <Path d="M 38 30 C 38 12 78 12 78 30 Z" fill="url(#g1Hat)" stroke="#B45309" strokeWidth="2" />
        <Path d="M 39 29 Q 58 34 77 29" stroke="#DC2626" strokeWidth="3" fill="none" />
      </G>
    </Svg>
  </View>
);

/**
 * Story 1 - Scene 2: Grandpa watering blooming red roses with his green watering can.
 */
export const GrandpaGardenScene2: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 195,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 340 195" preserveAspectRatio="xMidYMid meet">
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

      <Rect width="340" height="195" rx="8" fill="url(#g2Sky)" />

      {/* Lawn ground */}
      <Path d="M 0 135 L 340 135 L 340 195 L 0 195 Z" fill="#15803D" />

      {/* Grandpa Anand (Profile pose watering) */}
      <G transform="translate(35, 15)">
        {/* Legs */}
        <Rect x="30" y="122" width="12" height="48" rx="4" fill="#78350F" />
        <Rect x="48" y="122" width="12" height="48" rx="4" fill="#78350F" />
        <Path d="M 26 166 L 44 166 L 44 172 L 24 172 Z" fill="#1E293B" />
        <Path d="M 44 166 L 62 166 L 62 172 L 42 172 Z" fill="#1E293B" />

        {/* Torso */}
        <Path d="M 22 72 Q 22 125 24 126 C 40 130 68 130 76 126 Q 78 100 72 72 Z" fill="#2563EB" />
        <Path d="M 42 70 L 48 86 L 54 70" stroke="#DBEAFE" strokeWidth="2.5" fill="none" />

        {/* Head */}
        <Circle cx="48" cy="46" r="20" fill="#FED7AA" />
        <Circle cx="44" cy="44" r="5" stroke="#0F172A" strokeWidth="1.8" fill="#FFFFFF" />
        <Circle cx="56" cy="44" r="5" stroke="#0F172A" strokeWidth="1.8" fill="#FFFFFF" />
        <Circle cx="45" cy="44" r="2.2" fill="#451A03" />
        <Circle cx="57" cy="44" r="2.2" fill="#451A03" />
        <Path d="M 43 54 Q 52 57 60 54" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <Path d="M 46 58 Q 52 62 58 58" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Hat */}
        <Ellipse cx="48" cy="30" rx="30" ry="9" fill="#FDE047" stroke="#B45309" strokeWidth="2" />
        <Path d="M 30 30 C 30 14 66 14 66 30 Z" fill="#FDE047" stroke="#B45309" strokeWidth="2" />
        <Path d="M 31 29 Q 48 33 65 29" stroke="#DC2626" strokeWidth="2.5" fill="none" />

        {/* Arm reaching forward holding watering can */}
        <Path d="M 64 80 Q 95 80 115 90" stroke="#2563EB" strokeWidth="14" strokeLinecap="round" fill="none" />
        <Circle cx="118" cy="92" r="7" fill="#FED7AA" />

        {/* Bright Green Watering Can */}
        <G transform="translate(112, 75) rotate(24)">
          <Rect width="36" height="42" rx="6" fill="url(#canGrad)" stroke="#166534" strokeWidth="2" />
          <Path d="M 6 0 C 6 -16 30 -16 30 0" stroke="#15803D" strokeWidth="4.5" fill="none" />
          <Path d="M 32 20 L 58 8" stroke="#15803D" strokeWidth="6" strokeLinecap="round" />
          <Ellipse cx="60" cy="7" rx="6" ry="4" fill="#166534" />
        </G>
      </G>

      {/* Water Drops Sparkling */}
      <G fill="#38BDF8">
        <Circle cx="218" cy="115" r="2.5" />
        <Circle cx="228" cy="122" r="2.5" />
        <Circle cx="215" cy="130" r="2.5" />
        <Circle cx="235" cy="132" r="3" />
        <Circle cx="225" cy="142" r="2.5" />
        <Circle cx="242" cy="145" r="3" />
      </G>

      {/* Large Bush with Blooming Red Roses */}
      <G transform="translate(225, 95)">
        <Circle cx="40" cy="45" r="30" fill="#16A34A" />
        <Circle cx="72" cy="38" r="26" fill="#15803D" />
        <Circle cx="55" cy="62" r="28" fill="#14532D" />

        {/* Red Roses with Delicate Petals */}
        <Circle cx="30" cy="35" r="12" fill="#DC2626" />
        <Circle cx="30" cy="35" r="7" fill="#EF4444" />
        <Circle cx="30" cy="35" r="3" fill="#FCA5A5" />

        <Circle cx="62" cy="26" r="14" fill="#DC2626" />
        <Circle cx="62" cy="26" r="8" fill="#EF4444" />
        <Circle cx="62" cy="26" r="3" fill="#FCA5A5" />

        <Circle cx="82" cy="46" r="11" fill="#DC2626" />
        <Circle cx="82" cy="46" r="6" fill="#EF4444" />

        <Circle cx="48" cy="56" r="13" fill="#B91C1C" />
        <Circle cx="48" cy="56" r="7" fill="#DC2626" />
      </G>
    </Svg>
  </View>
);

/**
 * Story 1 - Scene 3: Yellow butterfly lands on Grandpa's shoulder as he smiles warmly.
 */
export const GrandpaGardenScene3: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 195,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 340 195" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="g3Bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FEF08A" />
          <Stop offset="50%" stopColor="#BBF7D0" />
          <Stop offset="100%" stopColor="#86EFAC" />
        </LinearGradient>
      </Defs>

      <Rect width="340" height="195" rx="8" fill="url(#g3Bg)" />

      {/* Sunbeams & Sparkles */}
      <Circle cx="60" cy="50" r="16" fill="#FEF9C3" opacity="0.8" />
      <Circle cx="280" cy="40" r="20" fill="#FEF9C3" opacity="0.8" />

      {/* Close-Up Portrait of Grandpa Anand */}
      <G transform="translate(100, 20)">
        {/* Torso & Blue Kurta */}
        <Path d="M 0 115 Q 70 100 140 115 L 148 175 L -8 175 Z" fill="#2563EB" />
        <Path d="M 52 108 Q 70 124 88 108" stroke="#DBEAFE" strokeWidth="3.5" fill="none" />

        {/* Neck */}
        <Path d="M 60 88 L 60 108 L 80 108 L 80 88 Z" fill="#FED7AA" />

        {/* Head */}
        <Path
          d="M 44 55 C 44 32 96 32 96 55 C 96 82 86 92 70 92 C 54 92 44 82 44 55 Z"
          fill="#FED7AA"
        />
        <Circle cx="52" cy="65" r="6" fill="#F87171" opacity="0.35" />
        <Circle cx="88" cy="65" r="6" fill="#F87171" opacity="0.35" />

        {/* Cheerful Smiling Eyes & Gold Glasses */}
        <Circle cx="56" cy="58" r="9" stroke="#0F172A" strokeWidth="2.4" fill="#FFFFFF" />
        <Circle cx="84" cy="58" r="9" stroke="#0F172A" strokeWidth="2.4" fill="#FFFFFF" />
        <Path d="M 65 58 L 75 58" stroke="#0F172A" strokeWidth="2.4" />
        <Circle cx="56" cy="58" r="4" fill="#451A03" />
        <Circle cx="84" cy="58" r="4" fill="#451A03" />
        <Circle cx="54" cy="56" r="1.5" fill="#FFFFFF" />
        <Circle cx="82" cy="56" r="1.5" fill="#FFFFFF" />

        {/* Smile Crinkles */}
        <Path d="M 44 58 L 47 56 M 44 61 L 46 61 M 96 58 L 93 56 M 96 61 L 94 61" stroke="#EA580C" strokeWidth="1.5" />

        {/* White Mustache & Warm Smile */}
        <Path d="M 52 74 Q 70 80 88 74" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" fill="none" />
        <Path d="M 58 80 Q 70 88 82 80" stroke="#9A3412" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Straw Sun Hat */}
        <Ellipse cx="70" cy="34" rx="52" ry="14" fill="#FDE047" stroke="#B45309" strokeWidth="2.5" />
        <Path d="M 38 34 C 38 8 102 8 102 34 Z" fill="#FDE047" stroke="#B45309" strokeWidth="2.5" />
        <Path d="M 40 33 Q 70 40 100 33" stroke="#DC2626" strokeWidth="4" fill="none" />

        {/* Friendly Yellow Butterfly on Shoulder */}
        <G transform="translate(14, 102)">
          <Ellipse cx="-8" cy="-10" rx="12" ry="16" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" transform="rotate(-25)" />
          <Ellipse cx="8" cy="-10" rx="12" ry="16" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" transform="rotate(25)" />
          <Ellipse cx="-5" cy="5" rx="8" ry="10" fill="#FBBF24" />
          <Ellipse cx="5" cy="5" rx="8" ry="10" fill="#FBBF24" />
          <Rect x="-2" y="-14" width="4" height="20" rx="2" fill="#451A03" />
          <Path d="M -1 -14 Q -6 -22 -10 -20 M 1 -14 Q 6 -22 10 -20" stroke="#451A03" strokeWidth="1.5" fill="none" />
        </G>
      </G>
    </Svg>
  </View>
);

// =============================================================
// STORY 2: Grandma Maya's Afternoon Tea (Grandma Maya)
// =============================================================

/**
 * Story 2 - Scene 1: Grandma Maya sitting comfortably in her blue armchair wearing her purple cardigan.
 */
export const MayaTeaScene1: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 195,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 340 195" preserveAspectRatio="xMidYMid meet">
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

      <Rect width="340" height="195" rx="8" fill="url(#m1Wall)" />
      {/* Floor */}
      <Rect y="145" width="340" height="50" fill="#78350F" opacity="0.3" />

      {/* Wall Art Frame */}
      <Rect x="45" y="25" width="52" height="42" rx="4" fill="#FFFFFF" stroke="#92400E" strokeWidth="3" />
      <Circle cx="71" cy="46" r="12" fill="#F43F5E" />

      {/* Cozy Blue Armchair */}
      <G transform="translate(115, 35)">
        <Rect x="15" y="15" width="80" height="95" rx="16" fill="url(#chairGrad)" stroke="#1E40AF" strokeWidth="2.5" />
        <Rect x="0" y="52" width="24" height="60" rx="10" fill="#2563EB" stroke="#1E40AF" strokeWidth="2" />
        <Rect x="86" y="52" width="24" height="60" rx="10" fill="#2563EB" stroke="#1E40AF" strokeWidth="2" />
        <Rect x="10" y="108" width="8" height="24" rx="2" fill="#451A03" />
        <Rect x="92" y="108" width="8" height="24" rx="2" fill="#451A03" />

        {/* GRANDMA MAYA (Realistic Human Character) */}
        {/* Purple Cardigan Body */}
        <Path d="M 28 50 Q 55 44 82 50 L 85 105 L 25 105 Z" fill="#9333EA" />
        <Path d="M 45 48 L 55 68 L 65 48" stroke="#FFFFFF" strokeWidth="3" fill="none" />
        <Circle cx="55" cy="76" r="2" fill="#E9D5FF" />
        <Circle cx="55" cy="88" r="2" fill="#E9D5FF" />

        {/* Gentle Hands resting on lap */}
        <Circle cx="44" cy="100" r="6" fill="#FDBA74" />
        <Circle cx="66" cy="100" r="6" fill="#FDBA74" />

        {/* Neck */}
        <Rect x="48" y="38" width="14" height="14" fill="#FDBA74" />

        {/* Head */}
        <Path d="M 38 28 C 38 12 72 12 72 28 C 72 44 65 48 55 48 C 45 48 38 44 38 28 Z" fill="#FDBA74" />

        {/* Elegant Silver-Grey Hair Bun */}
        <Path d="M 36 26 C 36 8 74 8 74 26 Z" fill="#64748B" />
        <Circle cx="55" cy="8" r="9" fill="#64748B" />
        <Path d="M 48 8 L 62 8" stroke="#FDE047" strokeWidth="2" />

        {/* Pearl Earrings */}
        <Circle cx="37" cy="30" r="2.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
        <Circle cx="73" cy="30" r="2.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />

        {/* Kind Smiling Eyes & Features */}
        <Circle cx="47" cy="27" r="3.2" fill="#0F172A" />
        <Circle cx="63" cy="27" r="3.2" fill="#0F172A" />
        <Circle cx="46" cy="26" r="1" fill="#FFFFFF" />
        <Circle cx="62" cy="26" r="1" fill="#FFFFFF" />
        <Path d="M 44 22 Q 47 20 51 22" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <Path d="M 59 22 Q 63 20 66 22" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <Path d="M 48 35 Q 55 40 62 35" stroke="#B91C1C" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </G>
    </Svg>
  </View>
);

/**
 * Story 2 - Scene 2: Maya pouring fragrant tea from a golden teapot into a cup with crispy biscuits.
 */
export const MayaTeaScene2: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 195,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 340 195" preserveAspectRatio="xMidYMid meet">
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

      <Rect width="340" height="195" rx="8" fill="url(#m2Bg)" />
      {/* Wooden Table Top */}
      <Rect y="115" width="340" height="80" fill="#FDBA74" stroke="#EA580C" strokeWidth="2" />

      {/* Human Hands Holding & Pouring Teapot */}
      {/* Hand on Handle */}
      <G transform="translate(60, 40) rotate(22)">
        <Ellipse cx="42" cy="36" rx="30" ry="24" fill="url(#goldPot)" stroke="#B45309" strokeWidth="2" />
        <Ellipse cx="42" cy="14" rx="14" ry="5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
        <Circle cx="42" cy="8" r="4" fill="#B45309" />
        <Path d="M 12 25 C -6 25 -6 50 14 50" stroke="#B45309" strokeWidth="6" fill="none" />
        <Path d="M 70 30 Q 86 22 96 10 L 92 8 Q 80 18 68 22 Z" fill="#D97706" stroke="#B45309" strokeWidth="1.5" />

        {/* Hand gripping handle */}
        <Circle cx="4" cy="38" r="7" fill="#FDBA74" />
        {/* Finger resting on lid knob */}
        <Circle cx="42" cy="4" r="5" fill="#FDBA74" />
      </G>

      {/* Stream of Tea */}
      <Path d="M 170 78 Q 178 98 182 120" stroke="#92400E" strokeWidth="4.5" strokeLinecap="round" fill="none" />

      {/* Porcelain Cup & Saucer */}
      <G transform="translate(165, 112)">
        <Ellipse cx="25" cy="40" rx="30" ry="9" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
        <Path d="M 6 18 L 10 36 Q 25 42 40 36 L 44 18 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
        <Ellipse cx="25" cy="18" rx="19" ry="6" fill="#92400E" />
        <Path d="M 42 22 C 52 22 52 34 40 34" stroke="#CBD5E1" strokeWidth="3" fill="none" />
        <Path d="M 18 10 Q 16 0 22 -8 M 28 12 Q 32 2 28 -6" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      </G>

      {/* Crispy Round Biscuit on Plate */}
      <G transform="translate(240, 122)">
        <Ellipse cx="25" cy="26" rx="24" ry="11" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
        <Circle cx="25" cy="24" r="15" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
        <Circle cx="20" cy="21" r="1.5" fill="#78350F" />
        <Circle cx="29" cy="20" r="1.5" fill="#78350F" />
        <Circle cx="24" cy="28" r="1.5" fill="#78350F" />
      </G>
    </Svg>
  </View>
);

/**
 * Story 2 - Scene 3: Her fluffy ginger cat Leo curls up asleep on the rug by her feet.
 */
export const MayaTeaScene3: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 195,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 340 195" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="rugGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FBCFE8" />
          <Stop offset="100%" stopColor="#F472B6" />
        </LinearGradient>
      </Defs>

      <Rect width="340" height="195" rx="8" fill="#FEF3C7" />
      {/* Oval Cozy Rug */}
      <Ellipse cx="170" cy="120" rx="120" ry="54" fill="url(#rugGrad)" stroke="#DB2777" strokeWidth="3" />
      <Ellipse cx="170" cy="120" rx="100" ry="42" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="6 4" fill="none" />

      {/* Sleeping Ginger Cat Leo */}
      <G transform="translate(125, 80)">
        <Ellipse cx="45" cy="40" rx="38" ry="26" fill="#FB923C" stroke="#C2410C" strokeWidth="2" />
        <Path d="M 35 22 Q 38 30 32 38 M 48 20 Q 52 30 46 40 M 60 24 Q 64 32 58 40" stroke="#9A3412" strokeWidth="2" fill="none" />
        <Circle cx="20" cy="36" r="18" fill="#FB923C" stroke="#C2410C" strokeWidth="1.8" />
        <Path d="M 10 24 L 6 10 L 20 18 Z" fill="#EA580C" />
        <Path d="M 20 18 L 28 10 L 32 24 Z" fill="#EA580C" />
        <Path d="M 12 38 Q 16 42 20 38" stroke="#431407" strokeWidth="2" strokeLinecap="round" fill="none" />
        <Circle cx="16" cy="43" r="2.5" fill="#F472B6" />
        <Path d="M 82 44 C 98 44 100 25 90 18" stroke="#EA580C" strokeWidth="8" strokeLinecap="round" fill="none" />
      </G>
    </Svg>
  </View>
);

// =============================================================
// STORY 3: Raju's Picnic in the Park (Raju)
// =============================================================

/**
 * Story 3 - Scene 1: Young boy Raju packing his red picnic basket with bananas and water.
 */
export const RajuPicnicScene1: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 195,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 340 195" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="r1Bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#E0F2FE" />
          <Stop offset="100%" stopColor="#BAE6FD" />
        </LinearGradient>
      </Defs>

      <Rect width="340" height="195" rx="8" fill="url(#r1Bg)" />
      <Rect y="130" width="340" height="65" fill="#FED7AA" stroke="#F97316" strokeWidth="2" />

      {/* RAJU (Realistic Energetic Boy Character) */}
      <G transform="translate(45, 18)">
        {/* Torso in Bright Green Shirt */}
        <Path d="M 24 64 L 62 64 L 66 114 L 20 114 Z" fill="#16A34A" />
        <Path d="M 38 64 L 43 76 L 48 64" stroke="#DCFCE7" strokeWidth="2.5" fill="none" />

        {/* Neck */}
        <Rect x="38" y="50" width="10" height="15" fill="#FED7AA" />

        {/* Head */}
        <Path d="M 28 32 C 28 14 58 14 58 32 C 58 50 52 54 43 54 C 34 54 28 50 28 32 Z" fill="#FED7AA" />
        <Circle cx="34" cy="38" r="4" fill="#F87171" opacity="0.35" />
        <Circle cx="52" cy="38" r="4" fill="#F87171" opacity="0.35" />

        {/* Wavy Boy Hair */}
        <Path d="M 26 30 C 26 10 60 10 60 30 C 60 20 54 14 43 14 C 32 14 26 20 26 30 Z" fill="#1E293B" />

        {/* Big Bright Eyes & Smile */}
        <Circle cx="36" cy="32" r="3.5" fill="#0F172A" />
        <Circle cx="50" cy="32" r="3.5" fill="#0F172A" />
        <Circle cx="35" cy="31" r="1" fill="#FFFFFF" />
        <Circle cx="49" cy="31" r="1" fill="#FFFFFF" />
        <Path d="M 36 42 Q 43 49 50 42" stroke="#9A3412" strokeWidth="2.4" strokeLinecap="round" fill="none" />

        {/* Arm reaching towards basket */}
        <Path d="M 58 74 Q 85 75 105 85" stroke="#16A34A" strokeWidth="12" strokeLinecap="round" fill="none" />
        <Circle cx="108" cy="87" r="6" fill="#FED7AA" />
      </G>

      {/* Red Woven Picnic Basket */}
      <G transform="translate(170, 65)">
        <Rect x="0" y="25" width="95" height="55" rx="8" fill="#EF4444" stroke="#B91C1C" strokeWidth="2.5" />
        <Path d="M 18 25 L 18 80 M 40 25 L 40 80 M 62 25 L 62 80 M 84 25 L 84 80" stroke="#F87171" strokeWidth="2" />
        <Path d="M 0 42 L 95 42 M 0 62 L 95 62" stroke="#F87171" strokeWidth="2" />
        <Path d="M 12 25 C 12 -8 83 -8 83 25" stroke="#B91C1C" strokeWidth="5.5" fill="none" />

        {/* Bananas peeking out */}
        <G transform="translate(24, 6)">
          <Path d="M 5 22 C 15 6 35 10 40 22 C 32 15 18 14 5 22 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
          <Path d="M 12 18 C 22 2 42 6 47 18 C 39 11 25 10 12 18 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
        </G>
      </G>
    </Svg>
  </View>
);

/**
 * Story 3 - Scene 2: Raju riding his green bicycle down the park path.
 */
export const RajuPicnicScene2: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 195,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 340 195" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="r2Park" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#BAE6FD" />
          <Stop offset="60%" stopColor="#DCFCE7" />
          <Stop offset="100%" stopColor="#86EFAC" />
        </LinearGradient>
      </Defs>

      <Rect width="340" height="195" rx="8" fill="url(#r2Park)" />

      {/* Big Oak Tree on Right */}
      <G transform="translate(245, 15)">
        <Path d="M 30 80 L 24 155 L 52 155 L 46 80 Z" fill="#78350F" />
        <Circle cx="38" cy="50" r="42" fill="#15803D" />
        <Circle cx="16" cy="40" r="30" fill="#16A34A" />
        <Circle cx="60" cy="40" r="30" fill="#16A34A" />
      </G>

      {/* Path */}
      <Path d="M 0 170 Q 140 135 280 160" stroke="#CBD5E1" strokeWidth="32" fill="none" />

      {/* Raju on Green Bicycle */}
      <G transform="translate(55, 55)">
        {/* Wheels */}
        <Circle cx="25" cy="85" r="22" stroke="#334155" strokeWidth="4.5" fill="#F8FAFC" />
        <Circle cx="95" cy="85" r="22" stroke="#334155" strokeWidth="4.5" fill="#F8FAFC" />
        <Path d="M 25 85 L 55 85 L 78 54 L 46 54 Z" stroke="#16A34A" strokeWidth="5" fill="none" />
        <Path d="M 55 85 L 46 44" stroke="#16A34A" strokeWidth="5" />
        <Path d="M 95 85 L 78 54" stroke="#16A34A" strokeWidth="5" />
        <Rect x="82" y="38" width="18" height="14" rx="3" fill="#EF4444" />

        {/* Raju Cycling */}
        <Circle cx="52" cy="20" r="14" fill="#FED7AA" />
        <Path d="M 44 16 C 44 4 60 4 60 16 Z" fill="#1E293B" />
        <Circle cx="56" cy="20" r="2.5" fill="#0F172A" />
        <Path d="M 46 34 L 56 60 L 72 60" stroke="#15803D" strokeWidth="12" strokeLinecap="round" fill="none" />
        <Path d="M 52 36 L 76 46" stroke="#15803D" strokeWidth="10" strokeLinecap="round" fill="none" />
      </G>
    </Svg>
  </View>
);

/**
 * Story 3 - Scene 3: Raju spreading a blue checkered blanket under the tree sharing bananas.
 */
export const RajuPicnicScene3: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 195,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 340 195" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="r3Lawn" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#DCFCE7" />
          <Stop offset="100%" stopColor="#4ADE80" />
        </LinearGradient>
      </Defs>

      <Rect width="340" height="195" rx="8" fill="url(#r3Lawn)" />
      <Path d="M 0 0 Q 170 65 340 0 Z" fill="#15803D" opacity="0.8" />

      {/* Blue Checkered Blanket */}
      <G transform="translate(65, 60)">
        <Rect width="210" height="110" rx="10" fill="#DBEAFE" stroke="#2563EB" strokeWidth="3" />
        <Path d="M 42 0 L 42 110 M 84 0 L 84 110 M 126 0 L 126 110 M 168 0 L 168 110" stroke="#93C5FD" strokeWidth="3" />
        <Path d="M 0 28 L 210 28 M 0 56 L 210 56 M 0 84 L 210 84" stroke="#93C5FD" strokeWidth="3" />

        {/* Picnic Basket & Bananas */}
        <Rect x="25" y="28" width="50" height="40" rx="6" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
        <Ellipse cx="115" cy="55" rx="28" ry="18" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
        <Path d="M 100 57 C 108 47 122 49 128 57 C 122 52 110 51 100 57 Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />

        {/* Raju Sitting & Smiling */}
        <G transform="translate(20, -10)">
          <Circle cx="35" cy="18" r="16" fill="#FED7AA" />
          <Path d="M 26 15 C 26 2 44 2 44 15 Z" fill="#1E293B" />
          <Circle cx="32" cy="18" r="2.5" fill="#0F172A" />
          <Circle cx="40" cy="18" r="2.5" fill="#0F172A" />
          <Path d="M 32 25 Q 36 29 40 25" stroke="#9A3412" strokeWidth="2" fill="none" />
        </G>
      </G>
    </Svg>
  </View>
);

// =============================================================
// STORY 4: Anita's Sweet Mango Treat (Anita)
// =============================================================

/**
 * Story 4 - Scene 1: Anita in her bright kitchen wearing an orange apron.
 */
export const AnitaMangoScene1: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 195,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 340 195" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="k1Wall" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FEF3C7" />
          <Stop offset="100%" stopColor="#FDE68A" />
        </LinearGradient>
      </Defs>

      <Rect width="340" height="195" rx="8" fill="url(#k1Wall)" />
      <Rect y="125" width="340" height="70" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />

      {/* Sunlit Window */}
      <Rect x="210" y="20" width="75" height="65" rx="4" fill="#BAE6FD" stroke="#78350F" strokeWidth="3" />
      <Path d="M 247 20 L 247 85 M 210 52 L 285 52" stroke="#78350F" strokeWidth="2" />

      {/* ANITA (Realistic Indian Woman with Braid and Apron) */}
      <G transform="translate(95, 18)">
        {/* Yellow Kurta & Orange Apron */}
        <Path d="M 26 62 L 74 62 L 82 135 L 18 135 Z" fill="#F97316" stroke="#EA580C" strokeWidth="2" />
        <Rect x="36" y="90" width="28" height="24" rx="4" fill="#EA580C" />

        {/* Neck */}
        <Rect x="44" y="48" width="12" height="16" fill="#FED7AA" />

        {/* Head */}
        <Path d="M 34 32 C 34 14 66 14 66 32 C 66 50 60 54 50 54 C 40 54 34 50 34 32 Z" fill="#FED7AA" />
        <Circle cx="40" cy="38" r="4" fill="#F87171" opacity="0.3" />
        <Circle cx="60" cy="38" r="4" fill="#F87171" opacity="0.3" />

        {/* Sleek Dark Hair & Braid */}
        <Path d="M 32 30 C 32 10 68 10 68 30 Z" fill="#1E293B" />
        <Path d="M 66 30 Q 75 55 72 85" stroke="#1E293B" strokeWidth="8" strokeLinecap="round" fill="none" />
        {/* Flower in hair */}
        <Circle cx="68" cy="32" r="5" fill="#F43F5E" />

        {/* Red Bindi */}
        <Circle cx="50" cy="27" r="1.8" fill="#DC2626" />

        {/* Expressive Almond Eyes & Smile */}
        <Circle cx="43" cy="33" r="3.2" fill="#0F172A" />
        <Circle cx="57" cy="33" r="3.2" fill="#0F172A" />
        <Circle cx="42" cy="32" r="1" fill="#FFFFFF" />
        <Circle cx="56" cy="32" r="1" fill="#FFFFFF" />
        <Path d="M 44 43 Q 50 49 56 43" stroke="#B91C1C" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </G>
    </Svg>
  </View>
);

/**
 * Story 4 - Scene 2: Anita picking 3 ripe golden mangoes from a wooden bowl.
 */
export const AnitaMangoScene2: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 195,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 340 195" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="mangoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FDE047" />
          <Stop offset="50%" stopColor="#F59E0B" />
          <Stop offset="100%" stopColor="#EA580C" />
        </LinearGradient>
      </Defs>

      <Rect width="340" height="195" rx="8" fill="#FFFBEB" />
      <Rect y="110" width="340" height="85" fill="#FED7AA" stroke="#F97316" strokeWidth="2" />

      {/* Large Wooden Bowl with 3 Golden Mangoes */}
      <G transform="translate(110, 55)">
        <Path d="M 10 55 Q 60 105 110 55 Z" fill="#92400E" stroke="#78350F" strokeWidth="3" />

        {/* Mango 1 */}
        <G transform="translate(20, 18) rotate(-15)">
          <Path d="M 15 5 C 28 -2 38 12 30 32 C 24 45 6 38 4 24 C 2 12 8 8 15 5 Z" fill="url(#mangoGrad)" stroke="#D97706" strokeWidth="1.5" />
          <Circle cx="18" cy="4" r="2.5" fill="#15803D" />
        </G>

        {/* Mango 2 */}
        <G transform="translate(42, 8)">
          <Path d="M 16 5 C 30 -2 40 14 32 34 C 26 48 8 40 5 26 C 3 13 9 8 16 5 Z" fill="url(#mangoGrad)" stroke="#D97706" strokeWidth="1.5" />
          <Circle cx="20" cy="4" r="2.5" fill="#15803D" />
        </G>

        {/* Mango 3 */}
        <G transform="translate(68, 18) rotate(15)">
          <Path d="M 15 5 C 28 -2 38 12 30 32 C 24 45 6 38 4 24 C 2 12 8 8 15 5 Z" fill="url(#mangoGrad)" stroke="#D97706" strokeWidth="1.5" />
          <Circle cx="18" cy="4" r="2.5" fill="#15803D" />
        </G>
      </G>
    </Svg>
  </View>
);

/**
 * Story 4 - Scene 3: Anita serving sweet mango kulfi in beautiful glasses to share.
 */
export const AnitaMangoScene3: React.FC<SceneIllustrationProps> = ({
  width = '100%',
  height = 195,
}) => (
  <View style={[styles.container, { height }]}>
    <Svg width="100%" height="100%" viewBox="0 0 340 195" preserveAspectRatio="xMidYMid meet">
      <Defs>
        <LinearGradient id="kulfiGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FEF08A" />
          <Stop offset="100%" stopColor="#F59E0B" />
        </LinearGradient>
      </Defs>

      <Rect width="340" height="195" rx="8" fill="#FEF3C7" />
      <Ellipse cx="170" cy="135" rx="130" ry="42" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="3" />

      {/* 3 Mango Kulfi Cups */}
      <G transform="translate(90, 55)">
        <Path d="M 8 15 L 14 55 Q 25 60 36 55 L 42 15 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
        <Path d="M 10 18 L 15 50 Q 25 54 35 50 L 40 18 Z" fill="url(#kulfiGrad)" />
        <Rect x="23" y="-2" width="4" height="24" rx="2" fill="#D97706" />
        <Circle cx="20" cy="24" r="1.5" fill="#15803D" />
        <Circle cx="30" cy="22" r="1.5" fill="#15803D" />
      </G>

      <G transform="translate(148, 45)">
        <Path d="M 8 15 L 14 62 Q 25 68 36 62 L 42 15 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
        <Path d="M 10 18 L 15 56 Q 25 61 35 56 L 40 18 Z" fill="url(#kulfiGrad)" />
        <Rect x="23" y="-6" width="4" height="28" rx="2" fill="#D97706" />
        <Circle cx="22" cy="25" r="1.5" fill="#15803D" />
        <Circle cx="28" cy="23" r="1.5" fill="#DC2626" />
      </G>

      <G transform="translate(205, 55)">
        <Path d="M 8 15 L 14 55 Q 25 60 36 55 L 42 15 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
        <Path d="M 10 18 L 15 50 Q 25 54 35 50 L 40 18 Z" fill="url(#kulfiGrad)" />
        <Rect x="23" y="-2" width="4" height="24" rx="2" fill="#D97706" />
        <Circle cx="22" cy="24" r="1.5" fill="#15803D" />
        <Circle cx="28" cy="30" r="1.5" fill="#15803D" />
      </G>
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

