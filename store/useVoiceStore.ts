import { create } from 'zustand';
import { VoicePreferences } from '../types';

interface VoiceState {
  preferences: VoicePreferences;
  isVoiceEnabled: boolean;
  ttsLanguage: string;
  isSpeaking: boolean;
  isLoading: boolean;
  loadPreferences: () => Promise<void>;
  speak: (text: string) => Promise<void>;
  stop: () => Promise<void>;
  toggleVoice: () => Promise<void>;
  setLanguage: (lang: string) => Promise<void>;
  setRate: (rate: number) => Promise<void>;
  setPitch: (pitch: number) => Promise<void>;
}

export const useVoiceStore = create<VoiceState>((set, get) => ({
  preferences: {
    enabled: true,
    language: 'en-IN',
    speechRate: 0.9,
    pitch: 1.0,
  },
  isVoiceEnabled: true,
  ttsLanguage: 'en-IN',
  isSpeaking: false,
  isLoading: false,

  loadPreferences: async () => {},
  speak: async () => {},
  stop: async () => {},
  toggleVoice: async () => {
    const current = get().isVoiceEnabled;
    set({
      isVoiceEnabled: !current,
      preferences: { ...get().preferences, enabled: !current },
    });
  },
  setLanguage: async (lang: string) => {
    set({
      ttsLanguage: lang,
      preferences: { ...get().preferences, language: lang },
    });
  },
  setRate: async () => {},
  setPitch: async () => {},
}));
