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

export interface AnimalIllustrationProps {
  size?: number;
}

/**
 * 1. Dog: Friendly golden puppy with floppy ears.
 */
export const DogIllustration: React.FC<AnimalIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="dogGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FDBA74" />
        <Stop offset="100%" stopColor="#FB923C" />
      </LinearGradient>
      <LinearGradient id="earGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#EA580C" />
        <Stop offset="100%" stopColor="#C2410C" />
      </LinearGradient>
    </Defs>

    {/* Left Ear */}
    <Path d="M 24 35 C 10 38 12 65 22 62 C 28 60 30 45 28 35 Z" fill="url(#earGrad)" />

    {/* Right Ear */}
    <Path d="M 76 35 C 90 38 88 65 78 62 C 72 60 70 45 72 35 Z" fill="url(#earGrad)" />

    {/* Head */}
    <Circle cx="50" cy="48" r="26" fill="url(#dogGrad)" stroke="#C2410C" strokeWidth="2" />

    {/* Cheerful Eyes */}
    <Circle cx="40" cy="44" r="4.5" fill="#1E293B" />
    <Circle cx="38" cy="42" r="1.5" fill="#FFFFFF" />
    <Circle cx="60" cy="44" r="4.5" fill="#1E293B" />
    <Circle cx="58" cy="42" r="1.5" fill="#FFFFFF" />

    {/* Snout */}
    <Ellipse cx="50" cy="58" rx="12" ry="9" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.5" />
    {/* Nose */}
    <Path d="M 46 54 Q 50 52 54 54 Q 50 59 46 54 Z" fill="#7C2D12" />
    {/* Mouth */}
    <Path d="M 50 57 L 50 62 Q 46 65 42 63 M 50 62 Q 54 65 58 63" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" fill="none" />
    {/* Tongue */}
    <Path d="M 48 62 C 48 67 52 67 52 62 Z" fill="#EF4444" />
  </Svg>
);

/**
 * 2. Cat: Cute kitty with pointy ears & whiskers.
 */
export const CatIllustration: React.FC<AnimalIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="catGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FED7AA" />
        <Stop offset="100%" stopColor="#FDBA74" />
      </LinearGradient>
    </Defs>

    {/* Left Pointy Ear */}
    <Path d="M 28 42 L 20 18 L 42 30 Z" fill="#FB923C" stroke="#EA580C" strokeWidth="2" />
    <Path d="M 28 36 L 24 24 L 38 30 Z" fill="#FCA5A5" />

    {/* Right Pointy Ear */}
    <Path d="M 72 42 L 80 18 L 58 30 Z" fill="#FB923C" stroke="#EA580C" strokeWidth="2" />
    <Path d="M 72 36 L 76 24 L 62 30 Z" fill="#FCA5A5" />

    {/* Head */}
    <Circle cx="50" cy="50" r="26" fill="url(#catGrad)" stroke="#EA580C" strokeWidth="2" />

    {/* Eyes */}
    <Ellipse cx="38" cy="46" rx="4.5" ry="6" fill="#15803D" />
    <Ellipse cx="38" cy="46" rx="2" ry="5" fill="#1E293B" />
    <Circle cx="37" cy="43" r="1.5" fill="#FFFFFF" />

    <Ellipse cx="62" cy="46" rx="4.5" ry="6" fill="#15803D" />
    <Ellipse cx="62" cy="46" rx="2" ry="5" fill="#1E293B" />
    <Circle cx="61" cy="43" r="1.5" fill="#FFFFFF" />

    {/* Tiny Nose */}
    <Path d="M 47 54 L 53 54 L 50 58 Z" fill="#F43F5E" />

    {/* Smile */}
    <Path d="M 50 58 Q 44 63 40 60 M 50 58 Q 56 63 60 60" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" fill="none" />

    {/* Whiskers */}
    <Path d="M 24 52 L 36 54 M 22 58 L 35 58 M 24 64 L 36 62" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" />
    <Path d="M 76 52 L 64 54 M 78 58 L 65 58 M 76 64 L 64 62" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

/**
 * 3. Cow: Gentle dairy cow with patches and sweet horns.
 */
export const CowIllustration: React.FC<AnimalIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="cowMuzzle" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FECDD3" />
        <Stop offset="100%" stopColor="#FDA4AF" />
      </LinearGradient>
    </Defs>

    {/* Horns */}
    <Path d="M 32 30 Q 24 16 20 20 Q 28 26 34 33 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
    <Path d="M 68 30 Q 76 16 80 20 Q 72 26 66 33 Z" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />

    {/* Ears */}
    <Ellipse cx="22" cy="40" rx="10" ry="5" transform="rotate(-20 22 40)" fill="#FFFFFF" stroke="#475569" strokeWidth="2" />
    <Ellipse cx="78" cy="40" rx="10" ry="5" transform="rotate(20 78 40)" fill="#1E293B" />

    {/* Head */}
    <Circle cx="50" cy="48" r="26" fill="#FFFFFF" stroke="#475569" strokeWidth="2.5" />

    {/* Black Patch over Eye */}
    <Path d="M 36 28 C 24 35 24 55 38 52 C 46 50 48 32 36 28 Z" fill="#1E293B" />

    {/* Eyes */}
    <Circle cx="36" cy="42" r="3.5" fill="#FFFFFF" />
    <Circle cx="36" cy="42" r="2" fill="#000000" />
    <Circle cx="64" cy="42" r="3.5" fill="#1E293B" />
    <Circle cx="63" cy="41" r="1" fill="#FFFFFF" />

    {/* Large Pink Muzzle */}
    <Ellipse cx="50" cy="62" rx="18" ry="12" fill="url(#cowMuzzle)" stroke="#FB7185" strokeWidth="2" />
    {/* Nostrils */}
    <Circle cx="43" cy="61" r="3" fill="#9F1239" />
    <Circle cx="57" cy="61" r="3" fill="#9F1239" />
    <Path d="M 46 67 Q 50 70 54 67" stroke="#9F1239" strokeWidth="2" strokeLinecap="round" fill="none" />
  </Svg>
);

/**
 * 4. Bird: Cheerful chirping songbird.
 */
export const BirdIllustration: React.FC<AnimalIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="birdGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#38BDF8" />
        <Stop offset="100%" stopColor="#0284C7" />
      </LinearGradient>
    </Defs>

    {/* Tail Feathers */}
    <Path d="M 22 55 L 8 46 L 14 62 Z" fill="#0369A1" />

    {/* Body */}
    <Circle cx="52" cy="50" r="24" fill="url(#birdGrad)" stroke="#0369A1" strokeWidth="2" />

    {/* Belly Highlight */}
    <Path d="M 44 40 C 44 68 70 68 70 50 Z" fill="#BAE6FD" opacity="0.6" />

    {/* Wing */}
    <Path d="M 32 50 C 32 38 52 46 48 64 C 36 64 32 56 32 50 Z" fill="#0284C7" stroke="#075985" strokeWidth="1.5" />

    {/* Eye */}
    <Circle cx="64" cy="42" r="5" fill="#FFFFFF" />
    <Circle cx="65" cy="42" r="2.8" fill="#0F172A" />
    <Circle cx="64" cy="40" r="1" fill="#FFFFFF" />

    {/* Golden Beak */}
    <Path d="M 72 44 L 88 48 L 72 54 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />

    {/* Cute Head Crest */}
    <Path d="M 52 26 Q 58 16 64 22" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" fill="none" />
  </Svg>
);

/**
 * 5. Duck: Friendly yellow duck with orange bill.
 */
export const DuckIllustration: React.FC<AnimalIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="duckGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FEF08A" />
        <Stop offset="100%" stopColor="#FACC15" />
      </LinearGradient>
    </Defs>

    {/* Body */}
    <Ellipse cx="45" cy="58" rx="26" ry="18" fill="url(#duckGrad)" stroke="#CA8A04" strokeWidth="2" />

    {/* Head */}
    <Circle cx="60" cy="40" r="16" fill="url(#duckGrad)" stroke="#CA8A04" strokeWidth="2" />

    {/* Eye */}
    <Circle cx="64" cy="36" r="3.5" fill="#1E293B" />
    <Circle cx="63" cy="35" r="1" fill="#FFFFFF" />

    {/* Big Orange Bill */}
    <Path d="M 70 38 Q 88 38 86 45 Q 74 48 70 44 Z" fill="#EA580C" stroke="#C2410C" strokeWidth="1.5" />

    {/* Wing */}
    <Path d="M 30 56 Q 50 50 46 66 Q 32 68 30 56 Z" fill="#EAB308" stroke="#A16207" strokeWidth="1.5" />
  </Svg>
);

/**
 * 6. Sheep: Fluffy white wool sheep with sweet face.
 */
export const SheepIllustration: React.FC<AnimalIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* Fluffy Wool Cloud Clusters */}
    <G fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2.5">
      <Circle cx="30" cy="38" r="12" />
      <Circle cx="48" cy="28" r="13" />
      <Circle cx="68" cy="34" r="12" />
      <Circle cx="76" cy="52" r="12" />
      <Circle cx="68" cy="68" r="13" />
      <Circle cx="48" cy="72" r="13" />
      <Circle cx="28" cy="64" r="12" />
      <Circle cx="22" cy="48" r="11" />
    </G>

    {/* Droopy Ears */}
    <Ellipse cx="32" cy="46" rx="8" ry="4" transform="rotate(30 32 46)" fill="#FED7AA" stroke="#FB923C" strokeWidth="1.5" />
    <Ellipse cx="68" cy="46" rx="8" ry="4" transform="rotate(-30 68 46)" fill="#FED7AA" stroke="#FB923C" strokeWidth="1.5" />

    {/* Head */}
    <Ellipse cx="50" cy="52" rx="14" ry="17" fill="#FFEDD5" stroke="#FB923C" strokeWidth="2" />

    {/* Wool on Top of Head */}
    <Circle cx="45" cy="36" r="6" fill="#FFFFFF" />
    <Circle cx="55" cy="36" r="6" fill="#FFFFFF" />

    {/* Eyes */}
    <Circle cx="44" cy="50" r="3" fill="#1E293B" />
    <Circle cx="56" cy="50" r="3" fill="#1E293B" />

    {/* Nose & Smile */}
    <Path d="M 47 58 L 53 58 L 50 61 Z" fill="#F43F5E" />
    <Path d="M 50 61 Q 50 65 47 66 M 50 61 Q 50 65 53 66" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </Svg>
);

/**
 * 7. Lion: Cheerful brave lion with fluffy orange mane.
 */
export const LionIllustration: React.FC<AnimalIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="maneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#F97316" />
        <Stop offset="100%" stopColor="#EA580C" />
      </LinearGradient>
    </Defs>

    {/* Mane Sunburst / Rings */}
    <Circle cx="50" cy="50" r="34" fill="url(#maneGrad)" stroke="#C2410C" strokeWidth="2" />

    {/* Round Ears */}
    <Circle cx="32" cy="28" r="8" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
    <Circle cx="32" cy="28" r="4" fill="#FED7AA" />
    <Circle cx="68" cy="28" r="8" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
    <Circle cx="68" cy="28" r="4" fill="#FED7AA" />

    {/* Face */}
    <Circle cx="50" cy="52" r="22" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />

    {/* Eyes */}
    <Circle cx="42" cy="46" r="4" fill="#1E293B" />
    <Circle cx="41" cy="45" r="1.2" fill="#FFFFFF" />
    <Circle cx="58" cy="46" r="4" fill="#1E293B" />
    <Circle cx="57" cy="45" r="1.2" fill="#FFFFFF" />

    {/* Snout */}
    <Ellipse cx="50" cy="58" rx="10" ry="7" fill="#FEF3C7" />
    {/* Nose */}
    <Path d="M 46 54 L 54 54 L 50 58 Z" fill="#7C2D12" />
    {/* Mouth */}
    <Path d="M 50 58 Q 45 64 42 61 M 50 58 Q 55 64 58 61" stroke="#7C2D12" strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </Svg>
);

/**
 * 8. Elephant: Friendly gentle elephant with trunk & big ears.
 */
export const ElephantIllustration: React.FC<AnimalIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="eleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#94A3B8" />
        <Stop offset="100%" stopColor="#64748B" />
      </LinearGradient>
    </Defs>

    {/* Big Round Ears */}
    <Circle cx="24" cy="45" r="16" fill="url(#eleGrad)" stroke="#475569" strokeWidth="2" />
    <Circle cx="24" cy="45" r="10" fill="#CBD5E1" opacity="0.6" />

    <Circle cx="76" cy="45" r="16" fill="url(#eleGrad)" stroke="#475569" strokeWidth="2" />
    <Circle cx="76" cy="45" r="10" fill="#CBD5E1" opacity="0.6" />

    {/* Head */}
    <Circle cx="50" cy="48" r="24" fill="url(#eleGrad)" stroke="#475569" strokeWidth="2" />

    {/* Cheerful Eyes */}
    <Circle cx="39" cy="42" r="3.5" fill="#0F172A" />
    <Circle cx="38" cy="41" r="1" fill="#FFFFFF" />
    <Circle cx="61" cy="42" r="3.5" fill="#0F172A" />
    <Circle cx="60" cy="41" r="1" fill="#FFFFFF" />

    {/* Rosy Cheeks */}
    <Circle cx="34" cy="50" r="4" fill="#FDA4AF" opacity="0.6" />
    <Circle cx="66" cy="50" r="4" fill="#FDA4AF" opacity="0.6" />

    {/* Long Playful Trunk Upward */}
    <Path
      d="M 46 54 C 46 68 54 75 58 75 C 64 75 66 66 64 62 C 62 58 56 60 56 64"
      stroke="#475569"
      strokeWidth="6"
      strokeLinecap="round"
      fill="none"
    />
  </Svg>
);
