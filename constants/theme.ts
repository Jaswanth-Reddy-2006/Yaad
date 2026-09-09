import { Platform } from 'react-native';

export const COLORS = {
  // Brand & Healthcare Palette (Calm, Trustworthy, Modern)
  primary: '#16A34A',        // Primary green (healthy, stable, completed)
  primaryDark: '#12803A',    // Deep green
  primaryLight: '#DCFCE7',   // Soft green tint

  // Categorical & Semantic Accents
  gameBlue: '#2563EB',       // Blue = information / interactive
  gameBlueLight: '#EFF6FF',

  memoryPurple: '#7C3AED',   // Purple = cognitive activity
  memoryPurpleLight: '#F3E8FF',
  secondary: '#7C3AED',
  secondaryLight: '#F3E8FF',

  scheduleOrange: '#E98200', // Orange = attention / recommendation
  scheduleOrangeLight: '#FFFBEB',

  helpRed: '#EF4444',        // Red = urgent warning
  helpRedLight: '#FEF2F2',

  accent: '#0D9488',         // Teal
  accentLight: '#CCFBF1',

  // Backgrounds & Surfaces
  background: '#F7FAF8',     // Calm primary background
  cardBackground: '#FFFFFF', // Pure white card
  surfaceVariant: '#F1F5F3', // Muted background
  border: '#E2E8E5',         // Subtle healthcare border
  borderLight: '#EDF2F0',

  // Status Indicators
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#E98200',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',

  // Text Colors
  textPrimary: '#111827',    // Primary high-readability text
  textSecondary: '#64748B',  // Secondary calm slate text
  textMuted: '#94A3B8',      // Muted caption text
  textLight: '#FFFFFF',

  // High Contrast Palette for Accessibility
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
    base: 18,     // Base size for elderly & caregiver readability
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
    lg: 30,
    xl: 36,
    xxl: 42,
  },
};

// Strict Spacing System: 4, 8, 12, 16, 20, 24, 32, 40, 48
export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  giant: 48,
};

// Border Radius: Small controls (10-12), Buttons (12-14), Cards (18-24), Large containers (24-28), Nav (24+)
export const RADIUS = {
  xs: 8,
  sm: 12,        // Small controls
  md: 14,        // Buttons
  lg: 20,        // Cards
  xl: 24,        // Large containers & Bottom nav
  xxl: 28,
  full: 9999,
};

export const MIN_TOUCH_TARGET = 48;

// Soft Healthcare Shadows (0 4px 20px rgba(0, 0, 0, 0.04))
export const SHADOWS = Platform.OS === 'web' ? {
  sm: { boxShadow: '0px 2px 8px rgba(17, 24, 39, 0.03)' } as any,
  md: { boxShadow: '0px 4px 20px rgba(17, 24, 39, 0.04)' } as any,
  lg: { boxShadow: '0px 8px 24px rgba(17, 24, 39, 0.06)' } as any,
} : {
  sm: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  md: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  lg: {
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
};
