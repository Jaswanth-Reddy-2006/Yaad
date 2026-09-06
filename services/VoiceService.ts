import { Platform } from 'react-native';
import {
  VoiceIntent,
  VoiceIntentResult,
  VoiceSTTCallbacks,
  VoiceTTSCallbacks,
  VoiceAvailabilityResult,
  TTSAvailability,
  TTSCapabilityStatus,
  STTLanguageAvailabilityResult,
  STTOptions,
  VoiceLanguageConfig,
} from '../types/voice';
import {
  ALL_VOICE_LANGUAGES,
  OFFICIAL_INDIAN_VOICE_LANGUAGES,
  ENGLISH_VOICE_LANGUAGE,
  DEFAULT_VOICE_LANGUAGE,
  resolveVoiceLanguage,
  getTTSLocale,
  getSTTLocale,
} from '../constants/voiceLanguages';
import { LOCAL_TTS_MODEL_REGISTRY, getTTSModelMetadata } from '../constants/ttsModelRegistry';
import { STT_MODEL_REGISTRY, getSTTModelMetadata } from '../constants/sttModelRegistry';
import { ttsManager, TTSManager } from './tts/TTSManager';
import { findMatchingNativeVoice } from './tts/NativeDeviceTTSProvider';
import { sttManager, STTManager } from './stt/STTManager';

// Re-export voice types, constants, and managers for convenience
export * from '../types/voice';
export * from '../constants/voiceLanguages';
export * from '../constants/ttsModelRegistry';
export * from '../constants/sttModelRegistry';
export { ttsManager, TTSManager };
export { sttManager, STTManager };
export { findMatchingNativeVoice as findMatchingVoice };

/**
 * Backward compatibility interface and constant for existing callers.
 */
export interface SupportedLanguage extends VoiceLanguageConfig {
  name: string;
  locale: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ALL_VOICE_LANGUAGES.map((lang) => ({
  ...lang,
  name: lang.displayName,
  locale: lang.ttsLocale,
}));

export function parseVoiceIntent(query: string): VoiceIntentResult {
  const normalized = (query || '').toLowerCase().trim();

  if (
    normalized.includes('what should i do') ||
    normalized.includes('next activity') ||
    normalized.includes('play game') ||
    normalized.includes('start game') ||
    normalized.includes('game')
  ) {
    return {
      intent: 'WHAT_TO_DO_NOW',
      spokenText: query,
      responsePrompt: 'Opening your recommended memory activity now. Match the pictures at your own pace.',
    };
  }

  if (
    normalized.includes('reminder') ||
    normalized.includes('medicine') ||
    normalized.includes('water') ||
    normalized.includes('pill')
  ) {
    return {
      intent: 'NEXT_REMINDER',
      spokenText: query,
      responsePrompt: 'Your next reminder is Morning Medicine at 9:00 AM. Please take it with a glass of water.',
    };
  }

  if (
    normalized.includes('plan') ||
    normalized.includes('today') ||
    normalized.includes('schedule')
  ) {
    return {
      intent: 'TODAY_PLAN',
      spokenText: query,
      responsePrompt: 'Today you have morning medicine at 9:00 AM, a cognitive memory game at 10:00 AM, and hydration check at 2:00 PM.',
    };
  }

  if (
    normalized.includes('help') ||
    normalized.includes('sos') ||
    normalized.includes('emergency')
  ) {
    return {
      intent: 'HELP_SOS',
      spokenText: query,
      responsePrompt: 'Help request received. Opening emergency assistance and notifying your caregiver.',
    };
  }

  if (normalized.includes('repeat') || normalized.includes('say again')) {
    return {
      intent: 'REPEAT',
      spokenText: query,
      responsePrompt: 'Repeating your daily routine overview.',
    };
  }

  return {
    intent: 'UNKNOWN',
    spokenText: query,
    responsePrompt: 'I am listening. You can ask "What should I do now?", "Next reminder", or "Help me".',
  };
}

export class VoiceService {
  /**
   * Retrieves the raw list of installed Text-To-Speech voices from the device / browser.
   */
  public async getAvailableVoices(): Promise<any[]> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          return window.speechSynthesis.getVoices();
        }
        return [];
      }
      const Speech = require('expo-speech');
      if (Speech.getAvailableVoicesAsync) {
        return await Speech.getAvailableVoicesAsync();
      }
      return [];
    } catch (err) {
      console.warn('[TTS] Failed to get available device voices:', err);
      return [];
    }
  }

  /**
   * Checks whether a TTS voice matching the language id or locale is available.
   */
  public async isTTSLanguageAvailable(languageIdentifier: string): Promise<boolean> {
    const result = await this.checkVoiceAvailability(languageIdentifier);
    return result.available;
  }

  /**
   * Comprehensive voice availability check verifying actual installed local models
   * and native device synthesizer capabilities.
   */
  public async checkVoiceAvailability(languageIdentifier: string = 'en-IN'): Promise<TTSAvailability> {
    return await ttsManager.getTTSAvailability(languageIdentifier);
  }

  /**
   * Inspects STT availability for the selected language using hybrid STT manager.
   */
  public async getSTTLanguageAvailability(
    languageIdentifier: string = 'en-IN',
    options?: STTOptions
  ): Promise<STTLanguageAvailabilityResult> {
    return await sttManager.getSTTAvailability(languageIdentifier, options);
  }

  /**
   * Requests microphone permissions cross-platform.
   */
  public async requestMicrophonePermission(): Promise<{ granted: boolean; error?: string }> {
    return await sttManager.requestMicrophonePermission();
  }

  /**
   * Backward-compatible general speech recognition availability checker.
   */
  public async checkSpeechRecognitionAvailability(): Promise<{ available: boolean; error?: string; services?: string[] }> {
    const avail = await sttManager.getSTTAvailability('en-IN');
    return {
      available: avail.available,
      error: avail.error,
      services: avail.services,
    };
  }

  /**
   * Start speech recognition for the given language identifier (e.g. 'hi', 'te', 'en-IN').
   * Automatically routes between Online and Local Offline ASR.
   */
  public async startListening(
    languageIdentifier: string = 'en-IN',
    callbacks?: VoiceSTTCallbacks,
    options?: STTOptions
  ): Promise<void> {
    await sttManager.startListening(languageIdentifier, callbacks, options);
  }

  /**
   * Stop active speech recognition.
   */
  public async stopListening(): Promise<string> {
    return await sttManager.stopListening();
  }

  /**
   * Check if speech recognition is actively listening.
   */
  public isListening(): boolean {
    return sttManager.isListening();
  }

  /**
   * Cleanup listeners and audio resources.
   */
  public destroy(): void {
    sttManager.destroy();
  }

  /**
   * Stop any active Text-to-Speech synthesis.
   */
  public async stopSpeaking(): Promise<void> {
    await ttsManager.stop();
  }

  /**
   * Speak out text using offline-first hybrid TTS (Local Model -> Native Device TTS).
   */
  public async speak(
    text: string,
    languageIdentifier: string = 'en-IN',
    callbacks?: VoiceTTSCallbacks
  ): Promise<void> {
    await ttsManager.speak(text, languageIdentifier, callbacks);
  }

  public async processQueryAndSpeak(query: string, languageIdentifier?: string): Promise<VoiceIntentResult> {
    const intentResult = parseVoiceIntent(query);
    await this.speak(intentResult.responsePrompt, languageIdentifier);
    return intentResult;
  }

  public async stop(): Promise<void> {
    await this.stopSpeaking();
    await this.stopListening();
  }

  public isSpeaking(): boolean {
    return ttsManager.isSpeaking();
  }
}

export const voiceService = new VoiceService();
