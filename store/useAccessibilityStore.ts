import { create } from 'zustand';
import { AccessibilityPreferences } from '../types';
import { settingsRepository } from '../repositories/SettingsRepository';
import { LanguageCode, getTranslation } from '../constants/translations';

interface AccessibilityState {
  preferences: AccessibilityPreferences;
  currentLanguage: LanguageCode;
  fontScaleMultiplier: number;
  numColumns: number; // 2 for Normal/Large, 1 for Extra Large
  cardWidthPercent: '48%' | '100%';
  isLoading: boolean;
  loadPreferences: () => Promise<void>;
  setTextSize: (textSize: 'NORMAL' | 'LARGE' | 'EXTRA_LARGE') => Promise<void>;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  toggleHighContrast: () => Promise<void>;
  toggleEasyRead: () => Promise<void>;
  toggleElderMode: () => Promise<void>;
}

const MULTIPLIERS: Record<string, number> = {
  NORMAL: 1.0,
  LARGE: 1.2,
  EXTRA_LARGE: 1.45,
};

export const useAccessibilityStore = create<AccessibilityState>((set, get) => ({
  preferences: {
    textSize: 'LARGE',
    highContrast: false,
    easyRead: true,
    elderMode: true,
  },
  currentLanguage: 'en',
  fontScaleMultiplier: 1.2,
  numColumns: 2,
  cardWidthPercent: '48%',
  isLoading: false,

  loadPreferences: async () => {
    set({ isLoading: true });
    try {
      const [prefs, savedLang] = await Promise.all([
        settingsRepository.getAccessibilityPreferences(),
        settingsRepository.getPreferredLanguage().catch(() => 'en' as LanguageCode),
      ]);
      const numCols = prefs.textSize === 'EXTRA_LARGE' ? 1 : 2;
      set({
        preferences: { ...prefs, elderMode: prefs.elderMode ?? true },
        currentLanguage: savedLang || 'en',
        fontScaleMultiplier: MULTIPLIERS[prefs.textSize] || 1.2,
        numColumns: numCols,
        cardWidthPercent: numCols === 1 ? '100%' : '48%',
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  setTextSize: async (textSize) => {
    const updated = await settingsRepository.updateAccessibilityPreferences({ textSize });
    const numCols = textSize === 'EXTRA_LARGE' ? 1 : 2;
    set({
      preferences: updated,
      fontScaleMultiplier: MULTIPLIERS[textSize] || 1.2,
      numColumns: numCols,
      cardWidthPercent: numCols === 1 ? '100%' : '48%',
    });
  },

  setLanguage: (lang: LanguageCode) => {
    set({ currentLanguage: lang });
    settingsRepository.updatePreferredLanguage(lang).catch(() => {});
  },

  t: (key: string) => {
    const lang = get().currentLanguage;
    return getTranslation(key, lang);
  },

  toggleHighContrast: async () => {
    const current = get().preferences.highContrast;
    const updated = await settingsRepository.updateAccessibilityPreferences({ highContrast: !current });
    set({ preferences: updated });
  },

  toggleEasyRead: async () => {
    const current = get().preferences.easyRead;
    const updated = await settingsRepository.updateAccessibilityPreferences({ easyRead: !current });
    set({ preferences: updated });
  },

  toggleElderMode: async () => {
    const current = get().preferences.elderMode;
    const updated = await settingsRepository.updateAccessibilityPreferences({ elderMode: !current });
    set({ preferences: updated });
  },
}));
