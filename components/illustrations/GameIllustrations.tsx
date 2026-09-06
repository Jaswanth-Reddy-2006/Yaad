import React from 'react';
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

export interface ObjectIllustrationProps {
  size?: number;
}

/**
 * 1. Apple: Crisp, bright red apple with green leaf.
 */
export const AppleIllustration: React.FC<ObjectIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="appleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#EF4444" />
        <Stop offset="100%" stopColor="#B91C1C" />
      </LinearGradient>
      <LinearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#4ADE80" />
        <Stop offset="100%" stopColor="#15803D" />
      </LinearGradient>
    </Defs>

    {/* Apple Body */}
    <Path
      d="M 50 32 C 38 22 20 30 20 52 C 20 74 38 88 50 86 C 62 88 80 74 80 52 C 80 30 62 22 50 32 Z"
      fill="url(#appleGrad)"
      stroke="#991B1B"
      strokeWidth="2.5"
    />
    {/* Apple Highlight */}
    <Ellipse cx="36" cy="46" rx="5" ry="12" transform="rotate(-20 36 46)" fill="#FFFFFF" opacity="0.4" />

    {/* Stem */}
    <Path d="M 50 32 Q 54 18 60 16" stroke="#78350F" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    {/* Leaf */}
    <Path d="M 53 26 Q 70 18 72 30 Q 60 36 53 26 Z" fill="url(#leafGrad)" stroke="#166534" strokeWidth="1.5" />
  </Svg>
);

/**
 * 2. Banana: Golden ripe yellow banana bunch.
 */
export const BananaIllustration: React.FC<ObjectIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="bananaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FDE047" />
        <Stop offset="100%" stopColor="#EAB308" />
      </LinearGradient>
    </Defs>

    {/* Banana Bunch */}
    {/* Back Banana */}
    <Path
      d="M 68 25 Q 40 45 42 75 Q 48 80 54 75 Q 52 50 74 30 Z"
      fill="#CA8A04"
      opacity="0.85"
    />
    {/* Front Banana */}
    <Path
      d="M 64 22 C 30 40 32 72 38 78 C 45 84 52 74 48 64 C 44 46 66 30 68 24 Z"
      fill="url(#bananaGrad)"
      stroke="#A16207"
      strokeWidth="2.5"
    />
    {/* Crown / Top Stem */}
    <Rect x="62" y="18" width="8" height="8" rx="2" fill="#713F12" />
    {/* Banana Tip */}
    <Circle cx="37" cy="78" r="2.5" fill="#713F12" />
  </Svg>
);

/**
 * 3. Mango: Juicy golden-orange Indian mango with leaf.
 */
export const MangoIllustration: React.FC<ObjectIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="mangoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FBBF24" />
        <Stop offset="100%" stopColor="#EA580C" />
      </LinearGradient>
      <LinearGradient id="mangoLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#22C55E" />
        <Stop offset="100%" stopColor="#15803D" />
      </LinearGradient>
    </Defs>

    {/* Mango Silhouette (Classic Paisley / Indian Mango Curve) */}
    <Path
      d="M 46 26 C 28 32 22 55 32 72 C 40 85 62 86 70 70 C 78 54 72 34 56 26 C 52 24 48 24 46 26 Z"
      fill="url(#mangoGrad)"
      stroke="#C2410C"
      strokeWidth="2.5"
    />
    {/* Highlight */}
    <Ellipse cx="42" cy="48" rx="5" ry="14" transform="rotate(-25 42 48)" fill="#FFFFFF" opacity="0.35" />

    {/* Stem & Leaf */}
    <Path d="M 50 25 Q 52 16 56 14" stroke="#78350F" strokeWidth="3" strokeLinecap="round" fill="none" />
    <Path d="M 52 20 Q 68 12 70 24 Q 58 28 52 20 Z" fill="url(#mangoLeaf)" stroke="#166534" strokeWidth="1.5" />
  </Svg>
);

/**
 * 4. Flower: Blooming pink flower.
 */
export const FlowerIllustration: React.FC<ObjectIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="petalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#F472B6" />
        <Stop offset="100%" stopColor="#DB2777" />
      </LinearGradient>
    </Defs>

    {/* 5 Petals */}
    <G transform="translate(50, 50)">
      {/* Petal Top */}
      <Path d="M 0 0 C -12 -18 -10 -35 0 -38 C 10 -35 12 -18 0 0 Z" fill="url(#petalGrad)" stroke="#9D174D" strokeWidth="1.8" />
      {/* Petal Top-Right */}
      <Path d="M 0 0 C 14 -16 32 -18 36 -8 C 34 4 18 12 0 0 Z" fill="url(#petalGrad)" stroke="#9D174D" strokeWidth="1.8" />
      {/* Petal Bottom-Right */}
      <Path d="M 0 0 C 18 8 28 26 22 34 C 10 36 2 20 0 0 Z" fill="url(#petalGrad)" stroke="#9D174D" strokeWidth="1.8" />
      {/* Petal Bottom-Left */}
      <Path d="M 0 0 C -2 20 -10 36 -22 34 C -28 26 -18 8 0 0 Z" fill="url(#petalGrad)" stroke="#9D174D" strokeWidth="1.8" />
      {/* Petal Top-Left */}
      <Path d="M 0 0 C -18 12 -34 4 -36 -8 C -32 -18 -14 -16 0 0 Z" fill="url(#petalGrad)" stroke="#9D174D" strokeWidth="1.8" />

      {/* Flower Center Core */}
      <Circle cx="0" cy="0" r="11" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
      <Circle cx="-3" cy="-3" r="2" fill="#CA8A04" />
      <Circle cx="3" cy="-3" r="2" fill="#CA8A04" />
      <Circle cx="0" cy="4" r="2" fill="#CA8A04" />
    </G>
  </Svg>
);

/**
 * 5. Cup: Warm ceramic chai/coffee mug with gentle steam.
 */
export const CupIllustration: React.FC<ObjectIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="cupGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#F59E0B" />
        <Stop offset="100%" stopColor="#D97706" />
      </LinearGradient>
    </Defs>

    {/* Cup Handle (Right) */}
    <Path
      d="M 60 42 C 78 42 78 64 60 64"
      stroke="#B45309"
      strokeWidth="6"
      strokeLinecap="round"
      fill="none"
    />

    {/* Cup Body */}
    <Path
      d="M 28 35 L 62 35 L 58 72 Q 45 78 32 72 Z"
      fill="url(#cupGrad)"
      stroke="#92400E"
      strokeWidth="2.5"
    />
    {/* Saucer Base */}
    <Ellipse cx="45" cy="78" rx="26" ry="6" fill="#FDE68A" stroke="#B45309" strokeWidth="2.2" />

    {/* Steam Spirals */}
    <Path d="M 38 28 Q 35 20 40 14" stroke="#D97706" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
    <Path d="M 48 28 Q 52 18 46 12" stroke="#D97706" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
  </Svg>
);

/**
 * 6. Umbrella: Cheerful sky-blue canopy monsoon umbrella with raindrops.
 */
export const UmbrellaIllustration: React.FC<ObjectIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="umbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#38BDF8" />
        <Stop offset="100%" stopColor="#0284C7" />
      </LinearGradient>
    </Defs>

    {/* Umbrella Canopy */}
    <Path
      d="M 18 52 C 18 26 82 26 82 52 C 72 48 68 48 58 52 C 48 48 42 48 32 52 C 24 48 20 48 18 52 Z"
      fill="url(#umbGrad)"
      stroke="#0369A1"
      strokeWidth="2.5"
    />
    {/* Canopy Ribs */}
    <Path d="M 50 26 Q 40 40 32 52" stroke="#BAE6FD" strokeWidth="1.8" fill="none" />
    <Path d="M 50 26 Q 60 40 68 52" stroke="#BAE6FD" strokeWidth="1.8" fill="none" />

    {/* Top Spire */}
    <Path d="M 50 26 L 50 20" stroke="#0369A1" strokeWidth="2.5" strokeLinecap="round" />

    {/* Shaft & J-Hook Handle */}
    <Path
      d="M 50 52 L 50 74 C 50 82 42 82 40 76"
      stroke="#78350F"
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="none"
    />

    {/* Soft Raindrops */}
    <Circle cx="22" cy="68" r="2.5" fill="#0284C7" />
    <Circle cx="76" cy="66" r="2.5" fill="#0284C7" />
  </Svg>
);

/**
 * 7. Bicycle: Classic Indian road bicycle.
 */
export const BicycleIllustration: React.FC<ObjectIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* Rear Wheel (Left) */}
    <Circle cx="30" cy="60" r="16" stroke="#166534" strokeWidth="3" fill="#FFFFFF" />
    <Circle cx="30" cy="60" r="3" fill="#166534" />

    {/* Front Wheel (Right) */}
    <Circle cx="70" cy="60" r="16" stroke="#166534" strokeWidth="3" fill="#FFFFFF" />
    <Circle cx="70" cy="60" r="3" fill="#166534" />

    {/* Frame Geometry */}
    <Path
      d="M 30 60 L 46 60 L 58 42 L 38 42 L 30 60 L 46 60 L 44 38 M 58 42 L 70 60 M 58 42 L 64 34 L 68 34"
      stroke="#15803D"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Seat */}
    <Path d="M 38 38 L 48 38" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
  </Svg>
);

/**
 * 8. House: Cozy village cottage house with terracotta roof & tree.
 */
export const HouseIllustration: React.FC<ObjectIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#EA580C" />
        <Stop offset="100%" stopColor="#C2410C" />
      </LinearGradient>
    </Defs>

    {/* Little Tree on side */}
    <G transform="translate(18, 42)">
      <Rect x="8" y="18" width="4" height="18" fill="#78350F" />
      <Circle cx="10" cy="12" r="12" fill="#16A34A" />
    </G>

    {/* House Body */}
    <Rect x="35" y="44" width="45" height="34" rx="4" fill="#FFFFFF" stroke="#9A3412" strokeWidth="2.5" />

    {/* Pitched Terracotta Roof */}
    <Path d="M 30 46 L 57.5 24 L 85 46 Z" fill="url(#roofGrad)" stroke="#7C2D12" strokeWidth="2.5" />

    {/* Wooden Door */}
    <Rect x="51" y="56" width="13" height="22" rx="2" fill="#78350F" />
    <Circle cx="61" cy="67" r="1.5" fill="#FDE047" />

    {/* Cozy Window */}
    <Rect x="38" y="52" width="10" height="10" rx="2" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
  </Svg>
);

/**
 * 9. Radio: Vintage wooden transistor radio.
 */
export const RadioIllustration: React.FC<ObjectIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="radioGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#D97706" />
        <Stop offset="100%" stopColor="#B45309" />
      </LinearGradient>
    </Defs>

    {/* Antenna */}
    <Path d="M 34 32 L 68 18" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" />

    {/* Radio Box */}
    <Rect x="20" y="32" width="60" height="44" rx="8" fill="url(#radioGrad)" stroke="#78350F" strokeWidth="2.5" />

    {/* Speaker Grille (Left) */}
    <Circle cx="38" cy="54" r="14" fill="#78350F" />
    <Circle cx="38" cy="54" r="10" fill="#451A03" />
    <Circle cx="38" cy="54" r="4" fill="#D97706" />

    {/* Tuning Dial Screen (Right) */}
    <Rect x="58" y="40" width="16" height="12" rx="2" fill="#FEF3C7" stroke="#78350F" strokeWidth="1.5" />
    <Path d="M 66 42 L 66 50" stroke="#EF4444" strokeWidth="2" />

    {/* Two Knobs */}
    <Circle cx="62" cy="62" r="4" fill="#451A03" />
    <Circle cx="72" cy="62" r="4" fill="#451A03" />
  </Svg>
);

/**
 * 10. Glasses: Classic round reading spectacles.
 */
export const GlassesIllustration: React.FC<ObjectIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* Left Rim */}
    <Circle cx="34" cy="50" r="15" fill="#FFFFFF" stroke="#4338CA" strokeWidth="3.5" />
    {/* Left Glare */}
    <Path d="M 28 42 Q 38 42 38 52" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />

    {/* Nose Bridge */}
    <Path d="M 49 48 Q 50 44 51 48" stroke="#4338CA" strokeWidth="3.5" strokeLinecap="round" fill="none" />

    {/* Right Rim */}
    <Circle cx="66" cy="50" r="15" fill="#FFFFFF" stroke="#4338CA" strokeWidth="3.5" />
    {/* Right Glare */}
    <Path d="M 60 42 Q 70 42 70 52" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />

    {/* Left & Right Temples (Arms) */}
    <Path d="M 19 48 L 14 44" stroke="#4338CA" strokeWidth="3.5" strokeLinecap="round" />
    <Path d="M 81 48 L 86 44" stroke="#4338CA" strokeWidth="3.5" strokeLinecap="round" />
  </Svg>
);
