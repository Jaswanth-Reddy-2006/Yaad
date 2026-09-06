import React from 'react';
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

export interface AnimalIllustrationProps {
  size?: number;
}

/**
 * 1. Dog: Realistic Golden Retriever / Hound with warm layered fur shading, expressive eyes, and glossy snout.
 */
export const DogIllustration: React.FC<AnimalIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="dogFurGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FDBA74" />
        <Stop offset="50%" stopColor="#F59E0B" />
        <Stop offset="100%" stopColor="#D97706" />
      </LinearGradient>
      <LinearGradient id="dogEarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#D97706" />
        <Stop offset="100%" stopColor="#92400E" />
      </LinearGradient>
      <LinearGradient id="dogMuzzleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FEF3C7" />
        <Stop offset="100%" stopColor="#FDE68A" />
      </LinearGradient>
      <RadialGradient id="dogNoseGloss" cx="35%" cy="30%" r="60%">
        <Stop offset="0%" stopColor="#475569" />
        <Stop offset="100%" stopColor="#0F172A" />
      </RadialGradient>
    </Defs>

    {/* Fluffy Chest & Neck */}
    <Path d="M 32 65 C 24 85 76 85 68 65 Z" fill="#D97706" />
    <Path d="M 38 68 C 42 78 58 78 62 68 Z" fill="#FEF3C7" />

    {/* Left Floppy Ear with Fur Fringes */}
    <Path
      d="M 28 32 C 12 36 10 68 22 66 C 28 64 32 50 30 36 Z"
      fill="url(#dogEarGrad)"
      stroke="#78350F"
      strokeWidth="1.5"
    />

    {/* Right Floppy Ear */}
    <Path
      d="M 72 32 C 88 36 90 68 78 66 C 72 64 68 50 70 36 Z"
      fill="url(#dogEarGrad)"
      stroke="#78350F"
      strokeWidth="1.5"
    />

    {/* Contoured Head */}
    <Path
      d="M 30 38 C 30 22 70 22 70 38 C 76 48 74 62 68 66 C 60 70 40 70 32 66 C 26 62 24 48 30 38 Z"
      fill="url(#dogFurGrad)"
      stroke="#92400E"
      strokeWidth="1.8"
    />

    {/* Forehead Ridge Shading */}
    <Path d="M 46 26 C 50 34 50 42 46 48 M 54 26 C 50 34 50 42 54 48" stroke="#B45309" strokeWidth="1.2" fill="none" opacity="0.6" />

    {/* Realistic Muzzle & Chin */}
    <Path
      d="M 36 50 C 34 66 66 66 64 50 C 64 46 36 46 36 50 Z"
      fill="url(#dogMuzzleGrad)"
      stroke="#D97706"
      strokeWidth="1.5"
    />

    {/* Realistic Glossy Black Dog Nose with Nostrils */}
    <Path
      d="M 44 50 C 44 47 56 47 56 50 C 56 55 52 57 50 57 C 48 57 44 55 44 50 Z"
      fill="url(#dogNoseGloss)"
    />
    <Circle cx="47" cy="52" r="1.5" fill="#020617" />
    <Circle cx="53" cy="52" r="1.5" fill="#020617" />
    <Ellipse cx="47" cy="49" rx="1.5" ry="0.8" fill="#FFFFFF" opacity="0.6" />

    {/* Mouth & Whiskers */}
    <Path d="M 50 57 L 50 61 C 45 64 42 62 39 60 M 50 61 C 55 64 58 62 61 60" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <Circle cx="42" cy="56" r="0.8" fill="#78350F" />
    <Circle cx="40" cy="58" r="0.8" fill="#78350F" />
    <Circle cx="58" cy="56" r="0.8" fill="#78350F" />
    <Circle cx="60" cy="58" r="0.8" fill="#78350F" />

    {/* Expressive Realistic Eyes with Warm Amber Iris & Light Catch */}
    {/* Left Eye */}
    <Ellipse cx="38" cy="42" rx="4.5" ry="5" fill="#1E293B" />
    <Circle cx="38" cy="42" r="3.2" fill="#78350F" />
    <Circle cx="38" cy="42" r="2" fill="#020617" />
    <Circle cx="36.5" cy="40.5" r="1.2" fill="#FFFFFF" />
    <Path d="M 33 36 C 36 34 42 35 43 37" stroke="#78350F" strokeWidth="1.5" fill="none" strokeLinecap="round" />

    {/* Right Eye */}
    <Ellipse cx="62" cy="42" rx="4.5" ry="5" fill="#1E293B" />
    <Circle cx="62" cy="42" r="3.2" fill="#78350F" />
    <Circle cx="62" cy="42" r="2" fill="#020617" />
    <Circle cx="60.5" cy="40.5" r="1.2" fill="#FFFFFF" />
    <Path d="M 67 36 C 64 34 58 35 57 37" stroke="#78350F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </Svg>
);

/**
 * 2. Cat: Realistic Ginger/Tabby Cat with tufted ears, emerald-gold feline eyes, and whiskers.
 */
export const CatIllustration: React.FC<AnimalIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="catFur" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FB923C" />
        <Stop offset="50%" stopColor="#F97316" />
        <Stop offset="100%" stopColor="#EA580C" />
      </LinearGradient>
      <LinearGradient id="catEyeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#A3E635" />
        <Stop offset="100%" stopColor="#65A30D" />
      </LinearGradient>
    </Defs>

    {/* Left Pointed Ear with Inner Pink & Fluff */}
    <Path d="M 24 38 L 18 14 L 40 26 Z" fill="url(#catFur)" stroke="#C2410C" strokeWidth="1.8" />
    <Path d="M 26 34 L 22 20 L 36 28 Z" fill="#FCA5A5" />
    <Path d="M 28 32 L 25 24" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

    {/* Right Pointed Ear */}
    <Path d="M 76 38 L 82 14 L 60 26 Z" fill="url(#catFur)" stroke="#C2410C" strokeWidth="1.8" />
    <Path d="M 74 34 L 78 20 L 64 28 Z" fill="#FCA5A5" />
    <Path d="M 72 32 L 75 24" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

    {/* Head Silhouette with Fluffy Cheeks */}
    <Path
      d="M 32 30 C 40 24 60 24 68 30 C 78 34 84 50 78 64 C 70 74 30 74 22 64 C 16 50 22 34 32 30 Z"
      fill="url(#catFur)"
      stroke="#C2410C"
      strokeWidth="1.8"
    />

    {/* Tabby Forehead Stripes */}
    <Path d="M 50 26 L 50 36 M 44 28 L 47 36 M 56 28 L 53 36" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" />

    {/* Muzzle Pads */}
    <Ellipse cx="44" cy="60" rx="8" ry="6" fill="#FFF7ED" />
    <Ellipse cx="56" cy="60" rx="8" ry="6" fill="#FFF7ED" />

    {/* Pink Nose Pad */}
    <Path d="M 47 54 L 53 54 L 50 58 Z" fill="#F43F5E" />

    {/* Smile & Chin */}
    <Path d="M 50 58 L 50 61 Q 44 65 38 62 M 50 61 Q 56 65 62 62" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <Ellipse cx="50" cy="67" rx="4" ry="2.5" fill="#FED7AA" />

    {/* Long Realistic Whiskers */}
    <Path d="M 20 54 L 38 58 M 16 60 L 37 61 M 18 67 L 38 64" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
    <Path d="M 80 54 L 62 58 M 84 60 L 63 61 M 82 67 L 62 64" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />

    {/* Realistic Feline Almond Eyes */}
    {/* Left Eye */}
    <Path d="M 32 46 Q 39 39 46 46 Q 39 52 32 46 Z" fill="url(#catEyeGrad)" stroke="#14532D" strokeWidth="1.5" />
    <Ellipse cx="39" cy="46" rx="1.6" ry="4" fill="#020617" />
    <Circle cx="37.5" cy="44" r="1.2" fill="#FFFFFF" />

    {/* Right Eye */}
    <Path d="M 54 46 Q 61 39 68 46 Q 61 52 54 46 Z" fill="url(#catEyeGrad)" stroke="#14532D" strokeWidth="1.5" />
    <Ellipse cx="61" cy="46" rx="1.6" ry="4" fill="#020617" />
    <Circle cx="59.5" cy="44" r="1.2" fill="#FFFFFF" />
  </Svg>
);

/**
 * 3. Cow: Realistic Dairy Holstein Cow with authentic black spots, curved horns, and soft muzzle.
 */
export const CowIllustration: React.FC<AnimalIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="cowMuzzleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FECDD3" />
        <Stop offset="100%" stopColor="#FDA4AF" />
      </LinearGradient>
      <LinearGradient id="hornGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#F8FAFC" />
        <Stop offset="100%" stopColor="#94A3B8" />
      </LinearGradient>
    </Defs>

    {/* Curved Bovine Horns */}
    <Path d="M 30 28 Q 20 12 16 16 Q 24 24 32 30 Z" fill="url(#hornGrad)" stroke="#64748B" strokeWidth="1.5" />
    <Path d="M 70 28 Q 80 12 84 16 Q 76 24 68 30 Z" fill="url(#hornGrad)" stroke="#64748B" strokeWidth="1.5" />

    {/* Big Horizontal Ears */}
    <Ellipse cx="20" cy="38" rx="12" ry="6" transform="rotate(-15 20 38)" fill="#FFFFFF" stroke="#475569" strokeWidth="1.8" />
    <Ellipse cx="20" cy="38" rx="8" ry="3.5" transform="rotate(-15 20 38)" fill="#FDA4AF" />
    <Ellipse cx="80" cy="38" rx="12" ry="6" transform="rotate(15 80 38)" fill="#1E293B" />

    {/* Head Base */}
    <Path
      d="M 28 32 C 34 24 66 24 72 32 C 78 42 76 60 70 68 C 62 76 38 76 30 68 C 24 60 22 42 28 32 Z"
      fill="#FFFFFF"
      stroke="#475569"
      strokeWidth="2"
    />

    {/* Authentic Black Holstein Spots */}
    <Path d="M 30 30 C 24 38 28 54 40 50 C 46 48 48 30 30 30 Z" fill="#1E293B" />
    <Path d="M 68 32 C 74 38 72 48 64 46 C 60 44 62 30 68 32 Z" fill="#1E293B" />

    {/* Forehead Hair Tuft */}
    <Path d="M 44 26 Q 50 20 56 26" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" />

    {/* Realistic Bovine Eyes with Eyelashes */}
    {/* Left Eye */}
    <Circle cx="36" cy="42" r="4.2" fill="#1E293B" />
    <Circle cx="36" cy="42" r="2.8" fill="#451A03" />
    <Circle cx="35" cy="40.5" r="1.2" fill="#FFFFFF" />

    {/* Right Eye */}
    <Circle cx="64" cy="42" r="4.2" fill="#1E293B" />
    <Circle cx="64" cy="42" r="2.8" fill="#451A03" />
    <Circle cx="63" cy="40.5" r="1.2" fill="#FFFFFF" />

    {/* Wide Soft Pink Muzzle */}
    <Ellipse cx="50" cy="65" rx="20" ry="14" fill="url(#cowMuzzleGrad)" stroke="#FB7185" strokeWidth="1.8" />
    {/* Deep Nostrils */}
    <Ellipse cx="42" cy="64" rx="3.5" ry="2.5" fill="#881337" />
    <Ellipse cx="58" cy="64" rx="3.5" ry="2.5" fill="#881337" />
    <Path d="M 44 71 Q 50 74 56 71" stroke="#9F1239" strokeWidth="2" strokeLinecap="round" fill="none" />
  </Svg>
);

/**
 * 4. Chicken / Rooster: Realistic Farm Rooster with rich russet feathers, crimson comb, and sharp beak.
 */
export const ChickenIllustration: React.FC<AnimalIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="roosterPlumage" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#EA580C" />
        <Stop offset="50%" stopColor="#D97706" />
        <Stop offset="100%" stopColor="#B45309" />
      </LinearGradient>
      <LinearGradient id="roosterComb" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#EF4444" />
        <Stop offset="100%" stopColor="#B91C1C" />
      </LinearGradient>
    </Defs>

    {/* Feathery Body / Breast */}
    <Path
      d="M 30 52 C 26 76 74 76 70 52 C 68 44 32 44 30 52 Z"
      fill="url(#roosterPlumage)"
      stroke="#92400E"
      strokeWidth="1.8"
    />
    {/* Wing Feather Curves */}
    <Path d="M 36 56 Q 48 48 54 62 Q 40 68 36 56 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2" />

    {/* Neck & Head */}
    <Path
      d="M 42 42 C 42 30 58 30 58 42 Z"
      fill="#F59E0B"
    />
    <Circle cx="50" cy="38" r="14" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />

    {/* Crimson Crest / Comb on Head */}
    <Path
      d="M 42 26 C 44 14 50 18 52 14 C 55 18 60 14 62 26 Z"
      fill="url(#roosterComb)"
      stroke="#991B1B"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />

    {/* Red Wattles Hanging Below Beak */}
    <Ellipse cx="54" cy="50" rx="3.5" ry="7" fill="url(#roosterComb)" stroke="#991B1B" strokeWidth="1.2" />

    {/* Sharp Yellow Beak */}
    <Path d="M 58 36 L 76 41 L 58 46 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
    <Circle cx="60" cy="38" r="0.8" fill="#78350F" />

    {/* Avian Eye */}
    <Circle cx="48" cy="35" r="3.8" fill="#1E293B" />
    <Circle cx="48" cy="35" r="2.5" fill="#D97706" />
    <Circle cx="48" cy="35" r="1.5" fill="#000000" />
    <Circle cx="47" cy="34" r="0.8" fill="#FFFFFF" />
  </Svg>
);

/**
 * 5. Goat: Realistic Mountain/Farm Goat with ridged curved horns, rectangular pupils, and chin beard.
 */
export const GoatIllustration: React.FC<AnimalIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="goatCoat" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#F1F5F9" />
        <Stop offset="100%" stopColor="#CBD5E1" />
      </LinearGradient>
      <LinearGradient id="goatHorn" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#64748B" />
        <Stop offset="100%" stopColor="#334155" />
      </LinearGradient>
    </Defs>

    {/* Textured Ridged Curved Horns */}
    <Path d="M 38 28 Q 28 8 18 12 Q 30 20 36 32 Z" fill="url(#goatHorn)" stroke="#1E293B" strokeWidth="1.5" />
    <Path d="M 28 14 L 32 18 M 32 20 L 36 24" stroke="#94A3B8" strokeWidth="1.2" />

    <Path d="M 62 28 Q 72 8 82 12 Q 70 20 64 32 Z" fill="url(#goatHorn)" stroke="#1E293B" strokeWidth="1.5" />
    <Path d="M 72 14 L 68 18 M 68 20 L 64 24" stroke="#94A3B8" strokeWidth="1.2" />

    {/* Lateral Droopy Ears */}
    <Ellipse cx="24" cy="40" rx="12" ry="5" transform="rotate(20 24 40)" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
    <Ellipse cx="76" cy="40" rx="12" ry="5" transform="rotate(-20 76 40)" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />

    {/* Head */}
    <Path
      d="M 32 30 C 40 24 60 24 68 30 C 72 40 70 56 64 68 C 58 76 42 76 36 68 C 30 56 28 40 32 30 Z"
      fill="url(#goatCoat)"
      stroke="#64748B"
      strokeWidth="1.8"
    />

    {/* Chin Beard */}
    <Path d="M 44 74 C 44 88 56 88 56 74 Z" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />

    {/* Muzzle */}
    <Ellipse cx="50" cy="62" rx="12" ry="9" fill="#FFF7ED" stroke="#CBD5E1" strokeWidth="1.2" />
    <Ellipse cx="46" cy="61" rx="2" ry="1.5" fill="#475569" />
    <Ellipse cx="54" cy="61" rx="2" ry="1.5" fill="#475569" />
    <Path d="M 47 66 Q 50 68 53 66" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none" />

    {/* Realistic Goat Eyes with Rectangular Horizontal Pupil */}
    {/* Left Eye */}
    <Ellipse cx="38" cy="42" rx="4.5" ry="4" fill="#F59E0B" stroke="#78350F" strokeWidth="1.2" />
    <Rect x="35" y="41" width="6" height="2" rx="1" fill="#0F172A" />
    <Circle cx="36.5" cy="40.5" r="0.8" fill="#FFFFFF" />

    {/* Right Eye */}
    <Ellipse cx="62" cy="42" rx="4.5" ry="4" fill="#F59E0B" stroke="#78350F" strokeWidth="1.2" />
    <Rect x="59" y="41" width="6" height="2" rx="1" fill="#0F172A" />
    <Circle cx="60.5" cy="40.5" r="0.8" fill="#FFFFFF" />
  </Svg>
);

/**
 * 6. Horse: Noble Chestnut Thoroughbred with flowing dark mane, white blaze, and flared nostrils.
 */
export const HorseIllustration: React.FC<AnimalIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="horseCoat" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#D97706" />
        <Stop offset="50%" stopColor="#B45309" />
        <Stop offset="100%" stopColor="#78350F" />
      </LinearGradient>
      <LinearGradient id="horseMane" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#451A03" />
        <Stop offset="100%" stopColor="#1E293B" />
      </LinearGradient>
    </Defs>

    {/* Dark Flowing Mane (Behind Neck) */}
    <Path
      d="M 32 16 Q 24 38 20 62 Q 32 54 36 38 Z"
      fill="url(#horseMane)"
      stroke="#0F172A"
      strokeWidth="1.5"
    />

    {/* Pricked Equine Ears */}
    <Path d="M 36 24 L 34 10 L 44 20 Z" fill="url(#horseCoat)" stroke="#451A03" strokeWidth="1.5" />
    <Path d="M 52 20 L 58 10 L 60 24 Z" fill="url(#horseCoat)" stroke="#451A03" strokeWidth="1.5" />

    {/* Muscular Head Profile */}
    <Path
      d="M 36 28 L 60 28 L 64 50 L 60 76 L 42 76 L 34 46 Z"
      fill="url(#horseCoat)"
      stroke="#451A03"
      strokeWidth="2"
      strokeLinejoin="round"
    />

    {/* White Forehead Blaze */}
    <Path d="M 48 30 L 53 30 L 52 56 L 47 56 Z" fill="#FFFFFF" opacity="0.95" />

    {/* Velvety Dark Muzzle & Flared Nostrils */}
    <Ellipse cx="51" cy="74" rx="11" ry="6" fill="#1E293B" />
    <Ellipse cx="45" cy="73" rx="2.5" ry="1.8" fill="#020617" />
    <Ellipse cx="57" cy="73" rx="2.5" ry="1.8" fill="#020617" />
    <Path d="M 47 77 Q 51 79 55 77" stroke="#020617" strokeWidth="1.2" strokeLinecap="round" fill="none" />

    {/* Realistic Equine Eye with Eyelid Fold */}
    <Ellipse cx="42" cy="42" rx="4.5" ry="4" fill="#020617" />
    <Circle cx="42" cy="42" r="3" fill="#451A03" />
    <Circle cx="41" cy="41" r="1.2" fill="#FFFFFF" />
    <Path d="M 37 38 Q 42 36 47 38" stroke="#451A03" strokeWidth="1.5" fill="none" />
  </Svg>
);

/**
 * 7. Elephant: Realistic Gentle Elephant with textured skin wrinkles, curved ivory tusks, and trunk.
 */
export const ElephantIllustration: React.FC<AnimalIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="eleSkin" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#94A3B8" />
        <Stop offset="100%" stopColor="#475569" />
      </LinearGradient>
    </Defs>

    {/* Large Folded Ears */}
    <Circle cx="22" cy="44" r="18" fill="url(#eleSkin)" stroke="#334155" strokeWidth="2" />
    <Circle cx="22" cy="44" r="12" fill="#CBD5E1" opacity="0.4" />
    <Circle cx="78" cy="44" r="18" fill="url(#eleSkin)" stroke="#334155" strokeWidth="2" />
    <Circle cx="78" cy="44" r="12" fill="#CBD5E1" opacity="0.4" />

    {/* Domed Head */}
    <Circle cx="50" cy="46" r="26" fill="url(#eleSkin)" stroke="#334155" strokeWidth="2" />

    {/* Skin Crease Wrinkles */}
    <Path d="M 40 34 Q 50 32 60 34 M 42 38 Q 50 36 58 38" stroke="#334155" strokeWidth="1.5" fill="none" opacity="0.6" />

    {/* Ivory Tusks */}
    <Path d="M 38 60 Q 30 72 26 68 Q 36 58 40 56 Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.2" />
    <Path d="M 62 60 Q 70 72 74 68 Q 64 58 60 56 Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.2" />

    {/* Realistic Playful Trunk Upward */}
    <Path
      d="M 45 52 C 44 68 54 78 60 78 C 68 78 70 66 66 62 C 63 58 56 60 56 64"
      stroke="#475569"
      strokeWidth="7"
      strokeLinecap="round"
      fill="none"
    />
    <Path
      d="M 45 52 C 44 68 54 78 60 78 C 68 78 70 66 66 62"
      stroke="#64748B"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />

    {/* Wise Eyes with Eyelid Creases */}
    <Circle cx="36" cy="42" r="3.2" fill="#0F172A" />
    <Circle cx="35" cy="41" r="1" fill="#FFFFFF" />
    <Circle cx="64" cy="42" r="3.2" fill="#0F172A" />
    <Circle cx="63" cy="41" r="1" fill="#FFFFFF" />
  </Svg>
);

/**
 * 8. Lion: Realistic Regal Lion with magnificent dense golden-tawny mane and contoured muzzle.
 */
export const LionIllustration: React.FC<AnimalIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <RadialGradient id="lionManeRad" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="#F59E0B" />
        <Stop offset="70%" stopColor="#D97706" />
        <Stop offset="100%" stopColor="#78350F" />
      </RadialGradient>
      <LinearGradient id="lionFace" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FEF3C7" />
        <Stop offset="100%" stopColor="#FDE68A" />
      </LinearGradient>
    </Defs>

    {/* Majestic Dense Layered Mane */}
    <Circle cx="50" cy="50" r="36" fill="url(#lionManeRad)" stroke="#451A03" strokeWidth="2.5" />

    {/* Rounded Ears */}
    <Circle cx="30" cy="26" r="8" fill="#D97706" stroke="#78350F" strokeWidth="1.5" />
    <Circle cx="30" cy="26" r="4" fill="#FEF3C7" />
    <Circle cx="70" cy="26" r="8" fill="#D97706" stroke="#78350F" strokeWidth="1.5" />
    <Circle cx="70" cy="26" r="4" fill="#FEF3C7" />

    {/* Contoured Face Silhouette */}
    <Path
      d="M 32 36 C 40 28 60 28 68 36 C 74 46 72 64 66 70 C 58 76 42 76 34 70 C 28 64 26 46 32 36 Z"
      fill="url(#lionFace)"
      stroke="#B45309"
      strokeWidth="2"
    />

    {/* Muzzle & Nose */}
    <Ellipse cx="50" cy="60" rx="12" ry="8" fill="#FFFBEB" />
    <Path d="M 45 54 L 55 54 L 50 59 Z" fill="#78350F" />
    <Path d="M 50 59 L 50 63 Q 44 66 40 64 M 50 63 Q 56 66 60 64" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" fill="none" />

    {/* Whiskers */}
    <Circle cx="44" cy="61" r="0.8" fill="#78350F" />
    <Circle cx="42" cy="63" r="0.8" fill="#78350F" />
    <Circle cx="56" cy="61" r="0.8" fill="#78350F" />
    <Circle cx="58" cy="63" r="0.8" fill="#78350F" />

    {/* Amber Predatory Eyes with Eyelid Rim */}
    {/* Left Eye */}
    <Path d="M 36 44 Q 41 39 46 44" stroke="#451A03" strokeWidth="2" fill="none" />
    <Circle cx="41" cy="44" r="3.5" fill="#F59E0B" />
    <Circle cx="41" cy="44" r="2" fill="#020617" />
    <Circle cx="40" cy="43" r="0.8" fill="#FFFFFF" />

    {/* Right Eye */}
    <Path d="M 54 44 Q 59 39 64 44" stroke="#451A03" strokeWidth="2" fill="none" />
    <Circle cx="59" cy="44" r="3.5" fill="#F59E0B" />
    <Circle cx="59" cy="44" r="2" fill="#020617" />
    <Circle cx="58" cy="43" r="0.8" fill="#FFFFFF" />
  </Svg>
);

/**
 * 9. Frog: Realistic Emerald Pond Frog with glossy golden-ringed eyes and throat sac.
 */
export const FrogIllustration: React.FC<AnimalIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="frogSkin" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#4ADE80" />
        <Stop offset="60%" stopColor="#22C55E" />
        <Stop offset="100%" stopColor="#15803D" />
      </LinearGradient>
      <RadialGradient id="frogEyeGold" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="#FDE047" />
        <Stop offset="70%" stopColor="#EAB308" />
        <Stop offset="100%" stopColor="#A16207" />
      </RadialGradient>
    </Defs>

    {/* Big Glossy Eyes on Top */}
    <Circle cx="32" cy="32" r="15" fill="url(#frogSkin)" stroke="#14532D" strokeWidth="2" />
    <Circle cx="68" cy="32" r="15" fill="url(#frogSkin)" stroke="#14532D" strokeWidth="2" />

    {/* Golden Iris */}
    <Circle cx="32" cy="32" r="10" fill="url(#frogEyeGold)" />
    <Circle cx="68" cy="32" r="10" fill="url(#frogEyeGold)" />

    {/* Horizontal Slit Pupils with Light Reflection */}
    <Ellipse cx="32" cy="32" rx="6" ry="2.5" fill="#020617" />
    <Circle cx="30" cy="30" r="1.5" fill="#FFFFFF" />
    <Ellipse cx="68" cy="32" rx="6" ry="2.5" fill="#020617" />
    <Circle cx="66" cy="30" r="1.5" fill="#FFFFFF" />

    {/* Moist Amphibian Head & Body */}
    <Ellipse cx="50" cy="58" rx="34" ry="24" fill="url(#frogSkin)" stroke="#14532D" strokeWidth="2" />

    {/* Pale Mint Throat / Belly */}
    <Ellipse cx="50" cy="65" rx="22" ry="14" fill="#DCFCE7" opacity="0.9" />

    {/* Natural Mottled Skin Spots */}
    <Circle cx="24" cy="50" r="3" fill="#15803D" opacity="0.6" />
    <Circle cx="76" cy="50" r="3" fill="#15803D" opacity="0.6" />
    <Circle cx="50" cy="44" r="2.5" fill="#15803D" opacity="0.5" />

    {/* Wide Amphibian Mouth */}
    <Path
      d="M 28 56 Q 50 74 72 56"
      stroke="#14532D"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Nostrils */}
    <Circle cx="45" cy="46" r="1.5" fill="#14532D" />
    <Circle cx="55" cy="46" r="1.5" fill="#14532D" />
  </Svg>
);

/**
 * 10. Bird: Realistic Songbird with layered plumage, flight feathers, and sharp beak.
 */
export const BirdIllustration: React.FC<AnimalIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Defs>
      <LinearGradient id="songbirdPlumage" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#38BDF8" />
        <Stop offset="50%" stopColor="#0284C7" />
        <Stop offset="100%" stopColor="#0369A1" />
      </LinearGradient>
      <LinearGradient id="songbirdBreast" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FDBA74" />
        <Stop offset="100%" stopColor="#EA580C" />
      </LinearGradient>
    </Defs>

    {/* Tail Feathers */}
    <Path d="M 22 62 L 8 72 L 18 56 Z" fill="#0369A1" stroke="#075985" strokeWidth="1.2" />

    {/* Body Silhouette */}
    <Path
      d="M 24 54 C 24 74 68 76 68 54 C 68 44 26 44 24 54 Z"
      fill="url(#songbirdBreast)"
      stroke="#C2410C"
      strokeWidth="1.5"
    />

    {/* Layered Wing with Flight Feather Lines */}
    <Path
      d="M 26 50 Q 52 42 46 64 Q 30 68 26 50 Z"
      fill="url(#songbirdPlumage)"
      stroke="#0369A1"
      strokeWidth="1.5"
    />
    <Path d="M 32 54 L 44 60 M 34 58 L 42 63" stroke="#BAE6FD" strokeWidth="1.2" strokeLinecap="round" />

    {/* Head */}
    <Circle cx="58" cy="38" r="15" fill="url(#songbirdPlumage)" stroke="#0369A1" strokeWidth="1.5" />

    {/* Sharp Slender Beak */}
    <Path d="M 68 36 L 86 41 L 68 46 Z" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />

    {/* Lifelike Avian Eye */}
    <Circle cx="56" cy="35" r="3.8" fill="#020617" />
    <Circle cx="56" cy="35" r="2.2" fill="#78350F" />
    <Circle cx="55" cy="34" r="0.8" fill="#FFFFFF" />
  </Svg>
);

/**
 * 11. Walking Sheep: Side-profile animated walking sheep with fluffy wool and trot legs.
 */
export const WalkingSheepIllustration: React.FC<{ size?: number; facing?: 'left' | 'right' }> = ({
  size = 64,
  facing = 'right',
}) => (
  <Svg
    width={size}
    height={size * 0.85}
    viewBox="0 0 100 85"
    style={{ transform: [{ scaleX: facing === 'left' ? -1 : 1 }] }}
  >
    {/* 4 Trot Walking Legs */}
    <G fill="#475569" stroke="#1E293B" strokeWidth="1.5">
      <Rect x="24" y="52" width="6" height="24" rx="3" fill="#64748B" />
      <Rect x="36" y="54" width="6" height="22" rx="3" fill="#475569" />
      <Rect x="60" y="54" width="6" height="22" rx="3" fill="#64748B" />
      <Rect x="72" y="52" width="6" height="24" rx="3" fill="#475569" />
    </G>

    {/* Fluffy Tail */}
    <Circle cx="16" cy="38" r="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />

    {/* Fluffy Wool Body Cloud */}
    <G fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2.5">
      <Circle cx="28" cy="36" r="14" />
      <Circle cx="42" cy="26" r="15" />
      <Circle cx="58" cy="28" r="15" />
      <Circle cx="70" cy="38" r="14" />
      <Circle cx="64" cy="50" r="14" />
      <Circle cx="48" cy="52" r="15" />
      <Circle cx="32" cy="48" r="14" />
      <Ellipse cx="48" cy="40" rx="26" ry="18" fill="#FFFFFF" stroke="none" />
    </G>

    {/* Head & Face */}
    <G transform="translate(62, 16)">
      <Ellipse cx="6" cy="10" rx="8" ry="4" transform="rotate(-25 6 10)" fill="#FED7AA" stroke="#FB923C" strokeWidth="1.5" />
      <Ellipse cx="16" cy="16" rx="12" ry="14" fill="#FFEDD5" stroke="#FB923C" strokeWidth="2" />
      <Circle cx="12" cy="6" r="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
      <Circle cx="18" cy="7" r="5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
      <Circle cx="20" cy="14" r="2.8" fill="#1E293B" />
      <Circle cx="21" cy="13" r="1" fill="#FFFFFF" />
      <Circle cx="25" cy="20" r="2" fill="#F43F5E" />
      <Path d="M 23 24 Q 25 26 27 24" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </G>
  </Svg>
);

/**
 * 12. Sheep: Fluffy front-facing wool sheep with sweet face.
 */
export const SheepIllustration: React.FC<AnimalIllustrationProps> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
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
    <Ellipse cx="32" cy="46" rx="8" ry="4" transform="rotate(30 32 46)" fill="#FED7AA" stroke="#FB923C" strokeWidth="1.5" />
    <Ellipse cx="68" cy="46" rx="8" ry="4" transform="rotate(-30 68 46)" fill="#FED7AA" stroke="#FB923C" strokeWidth="1.5" />
    <Ellipse cx="50" cy="52" rx="14" ry="17" fill="#FFEDD5" stroke="#FB923C" strokeWidth="2" />
    <Circle cx="45" cy="36" r="6" fill="#FFFFFF" />
    <Circle cx="55" cy="36" r="6" fill="#FFFFFF" />
    <Circle cx="44" cy="50" r="3" fill="#1E293B" />
    <Circle cx="56" cy="50" r="3" fill="#1E293B" />
    <Path d="M 47 58 L 53 58 L 50 61 Z" fill="#F43F5E" />
    <Path d="M 50 61 Q 50 65 47 66 M 50 61 Q 50 65 53 66" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </Svg>
);
