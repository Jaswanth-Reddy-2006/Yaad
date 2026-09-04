import { create } from 'zustand';
import { VoicePreferences } from '../types';

interface VoiceState {
  preferences: VoicePreferences;
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

export const useVoiceStore = create<VoiceState>((set) => ({
  preferences: {
    enabled: false,
    language: 'en-IN',
    speechRate: 0.9,
    pitch: 1.0,
  },
  isSpeaking: false,
  isLoading: false,

  loadPreferences: async () => {},
  speak: async () => {},
  stop: async () => {},
  toggleVoice: async () => {},
  setLanguage: async () => {},
  setRate: async () => {},
  setPitch: async () => {},
}));
