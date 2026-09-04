import { Platform } from 'react-native';

export const COLORS = {
  // Brand & Primary Accents (Matched to Reference UI)
  primary: '#16A34A',        // Vibrant Friendly Green
  primaryLight: '#DCFCE7',   // Mint Soft Tint
  primaryDark: '#15803D',    // Deep Green

  // Secondary Accents
  gameBlue: '#2563EB',       // Play Game Blue
  gameBlueLight: '#EFF6FF',
  
  memoryPurple: '#7C3AED',   // Recall Memory Purple
  memoryPurpleLight: '#F3E8FF',
  secondary: '#7C3AED',      // Alias for purple secondary
  secondaryLight: '#F3E8FF',

  scheduleOrange: '#EA580C', // My Day Schedule Orange
  scheduleOrangeLight: '#FFF7ED',

  helpRed: '#EF4444',        // Help & Emergency Soft Red
  helpRedLight: '#FEF2F2',

  accent: '#0D9488',         // Calm Teal Accent
  accentLight: '#CCFBF1',

  // Backgrounds & Surfaces (Warm, Soft Off-White)
  background: '#FAFAFC',     // Calm warm background
  cardBackground: '#FFFFFF',
  surfaceVariant: '#F1F5F9',

  // Status Colors
  success: '#16A34A',        // Clear High-Contrast Green
  successLight: '#DCFCE7',
  warning: '#D97706',        // Amber
  warningLight: '#FEF3C7',
  danger: '#DC2626',         // High-Contrast Red
  dangerLight: '#FEE2E2',

  // Text Colors
  textPrimary: '#1E293B',    // Slate Navy
  textSecondary: '#475569',  // Medium Slate
  textMuted: '#64748B',
  textLight: '#FFFFFF',

  // High Contrast Palette
  hcBackground: '#000000',
  hcCardBackground: '#121212',
  hcTextPrimary: '#FFFFFF',
  hcTextSecondary: '#FFD700',
  hcBorder: '#FFFFFF',
  hcPrimary: '#FFFF00',
};

export const TYPOGRAPHY = {
  fontSizes: {
    xs: 14,
    sm: 16,
    base: 18,     // Base size for elderly readability
    lg: 22,
    xl: 26,
    xxl: 32,
    giant: 40,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    base: 26,
    lg: 32,
    xl: 36,
    xxl: 44,
  },
};

export const SPACING = {
  xs: 6,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  xxl: 40,
  full: 9999,
};

export const MIN_TOUCH_TARGET = 56;

export const SHADOWS = Platform.OS === 'web' ? {
  sm: { boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.04)' } as any,
  md: { boxShadow: '0px 4px 12px rgba(30, 41, 59, 0.06)' } as any,
  lg: { boxShadow: '0px 8px 20px rgba(30, 41, 59, 0.10)' } as any,
} : {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 20,
    elevation: 6,
  },
};
