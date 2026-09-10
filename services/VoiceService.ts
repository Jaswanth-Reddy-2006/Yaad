import { Platform, AppState, AppStateStatus } from 'react-native';
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
  VoicePriority,
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
import { voiceQueueManager, VoiceQueueManager } from './voice/VoiceQueueManager';
import { voiceTranslator } from './voice/VoiceTranslator';
import { useAccessibilityStore } from '../store/useAccessibilityStore';

// Re-export voice types, constants, and managers for convenience
export * from '../types/voice';
export * from '../constants/voiceLanguages';
export * from '../constants/ttsModelRegistry';
export * from '../constants/sttModelRegistry';
export { ttsManager, TTSManager };
export { sttManager, STTManager };
export { voiceQueueManager, VoiceQueueManager };
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

export function parseVoiceIntent(query: string, languageCode: string = 'en'): VoiceIntentResult {
  const normalized = (query || '').toLowerCase().trim();
  const lang = (languageCode || 'en').toLowerCase().split('-')[0];

  if (
    normalized.includes('what should i do') ||
    normalized.includes('next activity') ||
    normalized.includes('play game') ||
    normalized.includes('start game') ||
    normalized.includes('game') ||
    normalized.includes('खेल') ||
    normalized.includes('क्या करूं')
  ) {
    return {
      intent: 'WHAT_TO_DO_NOW',
      spokenText: query,
      responsePrompt: lang === 'hi'
        ? 'अनुशंसित मेमोरी गतिविधि शुरू हो रही है। अपनी गति से चित्रों को मिलाएं।'
        : 'Opening your recommended memory activity now. Match the pictures at your own pace.',
    };
  }

  if (
    normalized.includes('reminder') ||
    normalized.includes('medicine') ||
    normalized.includes('water') ||
    normalized.includes('pill') ||
    normalized.includes('रिमाइंडर') ||
    normalized.includes('दवा') ||
    normalized.includes('पानी')
  ) {
    return {
      intent: 'NEXT_REMINDER',
      spokenText: query,
      responsePrompt: lang === 'hi'
        ? 'आपका अगला रिमाइंडर सुबह 9:00 बजे सुबह की दवा का है। कृपया पानी के साथ लें।'
        : 'Your next reminder is Morning Medicine at 9:00 AM. Please take it with a glass of water.',
    };
  }

  if (
    normalized.includes('plan') ||
    normalized.includes('today') ||
    normalized.includes('schedule') ||
    normalized.includes('योजना') ||
    normalized.includes('आज')
  ) {
    return {
      intent: 'TODAY_PLAN',
      spokenText: query,
      responsePrompt: lang === 'hi'
        ? 'आज सुबह 9:00 बजे दवा, 10:00 बजे मेमरी गेम और दोपहर 2:00 बजे पानी का रिमाइंडर है।'
        : 'Today you have morning medicine at 9:00 AM, a cognitive memory game at 10:00 AM, and hydration check at 2:00 PM.',
    };
  }

  if (
    normalized.includes('help') ||
    normalized.includes('sos') ||
    normalized.includes('emergency') ||
    normalized.includes('मदद') ||
    normalized.includes('सहायता')
  ) {
    return {
      intent: 'HELP_SOS',
      spokenText: query,
      responsePrompt: lang === 'hi'
        ? 'सहायता का अनुरोध प्राप्त हुआ। आपातकालीन पृष्ठ खोला जा रहा है।'
        : 'Help request received. Opening emergency assistance and notifying your caregiver.',
    };
  }

  if (
    normalized.includes('repeat') ||
    normalized.includes('say again') ||
    normalized.includes('फिर से')
  ) {
    return {
      intent: 'REPEAT',
      spokenText: query,
      responsePrompt: lang === 'hi'
        ? 'आपकी दैनिक दिनचर्या फिर से दोहराई जा रही है।'
        : 'Repeating your daily routine overview.',
    };
  }

  return {
    intent: 'UNKNOWN',
    spokenText: query,
    responsePrompt: lang === 'hi'
      ? 'मैं आपकी बात सुन रहा हूँ। आप पूछ सकते हैं "मुझे अब क्या करना चाहिए?", "अगला रिमाइंडर" या "मेरी मदद करें"।'
      : 'I am listening. You can ask "What should I do now?", "Next reminder", or "Help me".',
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

  private appStateSubscription: any = null;

  constructor() {
    if (typeof AppState !== 'undefined' && AppState.addEventListener) {
      this.appStateSubscription = AppState.addEventListener(
        'change',
        (nextAppState: AppStateStatus) => {
          if (nextAppState === 'background' || nextAppState === 'inactive') {
            console.log('[VoiceService] App entered background/inactive state. Pausing voice queue...');
            voiceQueueManager.stop(true);
          }
        }
      );
    }
  }

  /**
   * Cleanup listeners and audio resources.
   */
  public destroy(): void {
    if (this.appStateSubscription?.remove) {
      this.appStateSubscription.remove();
    }
    sttManager.destroy();
    voiceQueueManager.stop(true);
  }

  /**
   * Stop any active Text-to-Speech synthesis and clear queue.
   */
  public async stopSpeaking(): Promise<void> {
    await voiceQueueManager.stop(true);
  }

  /**
   * Speak out text using offline-first hybrid TTS queue with priority, duplicate debouncing,
   * and automatic localization from English to user's selected language.
   */
  public async speak(
    text: string,
    languageIdentifier?: string,
    callbacks?: VoiceTTSCallbacks,
    priority: VoicePriority = 'NORMAL',
    contentId?: string
  ): Promise<void> {
    // 1. Strictly resolve active language from useAccessibilityStore as single source of truth
    const activeLangCode = useAccessibilityStore.getState().currentLanguage || 'en';
    const resolvedVoiceLang = resolveVoiceLanguage(activeLangCode);
    const effectiveLang = resolvedVoiceLang.ttsLocale;

    // 2. Automatically translate English content into user's selected language using existing TranslationService
    const targetLangCode = activeLangCode;
    const localizedText = await voiceTranslator.translate(text, targetLangCode);

    await voiceQueueManager.enqueue(localizedText, effectiveLang, priority, contentId, callbacks);
  }

  public async processQueryAndSpeak(query: string, languageIdentifier?: string): Promise<VoiceIntentResult> {
    const activeLangCode = useAccessibilityStore.getState().currentLanguage || 'en';
    const resolvedVoiceLang = resolveVoiceLanguage(activeLangCode);
    const effectiveLang = resolvedVoiceLang.ttsLocale;

    const intentResult = parseVoiceIntent(query, effectiveLang);
    if (intentResult.intent !== 'UNKNOWN') {
      await this.speak(intentResult.responsePrompt, effectiveLang, undefined, 'HIGH', intentResult.intent);
      return intentResult;
    }

    // For unknown voice queries, seamlessly route through askMitraCare (local first -> Groq fallback)
    try {
      const { askMitraCare } = await import('../app/companion');
      const res = await askMitraCare(query, { useDatabaseContext: true });
      if (res && res.answer) {
        await this.speak(res.answer, effectiveLang, undefined, 'HIGH', res.intent);
        return {
          intent: (res.intent as any) || 'UNKNOWN',
          spokenText: query,
          responsePrompt: res.answer,
        };
      }
    } catch {
      // Graceful fallback to default response prompt
    }

    await this.speak(intentResult.responsePrompt, effectiveLang, undefined, 'HIGH', intentResult.intent);
    return intentResult;
  }

  public async stop(): Promise<void> {
    await this.stopSpeaking();
    await this.stopListening();
  }

  public isSpeaking(): boolean {
    return voiceQueueManager.isSpeaking();
  }
}

export const voiceService = new VoiceService();
