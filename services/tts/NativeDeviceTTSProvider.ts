import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import {
  TTSAvailability,
  TTSCapabilityStatus,
  VoiceTTSCallbacks,
  VoiceLanguageConfig,
} from '../../types/voice';
import { resolveVoiceLanguage } from '../../constants/voiceLanguages';
import { getTTSModelMetadata } from '../../constants/ttsModelRegistry';

async function getBrowserVoicesAsync(): Promise<any[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) return voices;

  return new Promise((resolve) => {
    let resolved = false;
    const onVoicesChanged = () => {
      if (!resolved) {
        resolved = true;
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(window.speechSynthesis.getVoices());
      }
    };
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(window.speechSynthesis.getVoices());
      }
    }, 500);
  });
}

export function findMatchingNativeVoice(voices: any[], targetLocale: string, langConfig: VoiceLanguageConfig): any {
  if (!voices || voices.length === 0) return null;

  const targetNorm = targetLocale.toLowerCase().replace('_', '-');
  const targetCode = (langConfig.code || targetNorm.split('-')[0]).toLowerCase();
  const targetId = (langConfig.id || targetCode).toLowerCase();
  const targetRegion = (targetNorm.split('-')[1] || 'in').toLowerCase();
  const displayNameLower = (langConfig.displayName || '').toLowerCase();
  const nativeNameLower = (langConfig.nativeName || '').toLowerCase();

  // 1. Exact locale match (e.g. 'te-in' === 'te-in')
  let match = voices.find((v) => {
    const vLang = (v.lang || v.language || '').toLowerCase().replace('_', '-');
    return vLang === targetNorm;
  });
  if (match) return match;

  // 2. Exact language + Indian region match (e.g. 'te-in' or 'te_in')
  match = voices.find((v) => {
    const vLang = (v.lang || v.language || '').toLowerCase().replace('_', '-');
    const [vCode, vReg] = vLang.split('-');
    return (vCode === targetCode || vCode === targetId) && vReg === targetRegion;
  });
  if (match) return match;

  // 3. Language code prefix match (e.g. 'te' === 'te' or starts with 'te-')
  match = voices.find((v) => {
    const vLang = (v.lang || v.language || '').toLowerCase().replace('_', '-');
    const vCode = vLang.split('-')[0];
    return (
      vCode === targetCode ||
      vCode === targetId ||
      vLang === targetCode ||
      vLang.startsWith(`${targetCode}-`) ||
      vLang.startsWith(`${targetCode}_`) ||
      vLang === targetId ||
      vLang.startsWith(`${targetId}-`) ||
      vLang.startsWith(`${targetId}_`)
    );
  });
  if (match) return match;

  // 4. Voice Name or Identifier check
  match = voices.find((v) => {
    const name = (v.name || '').toLowerCase();
    const id = (v.identifier || '').toLowerCase();
    const vLang = (v.lang || v.language || '').toLowerCase().replace('_', '-');
    const vCode = vLang.split('-')[0];

    // Safety: prevent matching a voice that explicitly belongs to another language
    if (vCode && vCode !== targetCode && vCode !== targetId && vCode.length >= 2 && !id.includes(targetCode) && !name.includes(displayNameLower)) {
      return false;
    }

    return (
      name.includes(displayNameLower) ||
      id.includes(displayNameLower) ||
      id.includes(`${targetCode}-`) ||
      id.includes(`${targetCode}_`) ||
      name.includes(`${targetCode}-`) ||
      (nativeNameLower && (name.includes(nativeNameLower) || id.includes(nativeNameLower)))
    );
  });
  if (match) return match;

  return null;
}

export class NativeDeviceTTSProvider {
  public async isAvailable(languageIdentifier: string): Promise<boolean> {
    const res = await this.getAvailability(languageIdentifier);
    return res.available;
  }

  public async getAvailability(languageIdentifier: string): Promise<TTSAvailability> {
    const langConfig = resolveVoiceLanguage(languageIdentifier);
    const targetLocale = langConfig.ttsLocale;
    const model = getTTSModelMetadata(langConfig.id);

    try {
      if (Platform.OS === 'web') {
        const hasWebSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;
        if (!hasWebSpeech) {
          return {
            languageId: langConfig.id,
            available: false,
            capability: 'UNAVAILABLE',
            engineType: 'NONE',
            locale: targetLocale,
            offlineCapable: false,
            reason: 'Web Speech Synthesis is not supported in this browser.',
            warning: 'Speech synthesis is not supported in this browser.',
            modelInfo: model,
          };
        }

        const voices = await getBrowserVoicesAsync();
        const match = findMatchingNativeVoice(voices, targetLocale, langConfig);

        if (match) {
          const isLocal = match.localService === true;
          const capability: TTSCapabilityStatus = isLocal
            ? 'AVAILABLE_OFFLINE'
            : 'AVAILABLE_BUT_OFFLINE_STATUS_UNKNOWN';

          return {
            languageId: langConfig.id,
            available: true,
            capability,
            engineType: 'NATIVE_DEVICE_TTS',
            locale: targetLocale,
            voiceName: match.name,
            offlineCapable: isLocal,
            reason: isLocal
              ? 'Native offline voice installed in system.'
              : 'Voice is available on platform synthesizer.',
            matchedVoice: match,
            modelInfo: model,
          };
        }

        return {
          languageId: langConfig.id,
          available: true,
          capability: 'AVAILABLE_BUT_OFFLINE_STATUS_UNKNOWN',
          engineType: 'NATIVE_DEVICE_TTS',
          locale: targetLocale,
          offlineCapable: false,
          reason: 'Language supported by browser native speech engine.',
          modelInfo: model,
        };
      }

      if (Speech.getAvailableVoicesAsync) {
        const nativeVoices = await Speech.getAvailableVoicesAsync();
        if (nativeVoices && nativeVoices.length > 0) {
          const match = findMatchingNativeVoice(nativeVoices, targetLocale, langConfig);
          if (match) {
            return {
              languageId: langConfig.id,
              available: true,
              capability: 'AVAILABLE_OFFLINE',
              engineType: 'NATIVE_DEVICE_TTS',
              locale: targetLocale,
              voiceName: match.name,
              voiceIdentifier: match.identifier,
              offlineCapable: true,
              reason: 'Native device voice installed in system TTS engine.',
              matchedVoice: match,
              modelInfo: model,
            };
          }
        }
      }

      return {
        languageId: langConfig.id,
        available: true,
        capability: 'AVAILABLE_BUT_OFFLINE_STATUS_UNKNOWN',
        engineType: 'NATIVE_DEVICE_TTS',
        locale: targetLocale,
        offlineCapable: false,
        reason: 'Native device TTS engine available on platform.',
        modelInfo: model,
      };
    } catch (err: any) {
      return {
        languageId: langConfig.id,
        available: true,
        capability: 'AVAILABLE_BUT_OFFLINE_STATUS_UNKNOWN',
        engineType: 'NATIVE_DEVICE_TTS',
        locale: targetLocale,
        offlineCapable: false,
        reason: 'Native voice engine available.',
        modelInfo: model,
      };
    }
  }

  public async speak(
    text: string,
    langConfig: VoiceLanguageConfig,
    voiceIdentifier?: string,
    callbacks?: VoiceTTSCallbacks
  ): Promise<void> {
    const ttsLocale = langConfig.ttsLocale;

    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = await getBrowserVoicesAsync();
        let matchedVoice = findMatchingNativeVoice(voices, ttsLocale, langConfig);

        // If host browser lacks specific voice pack, fallback to available Indian/system voice
        // so synthesis never fails or remains silent
        if (!matchedVoice && voices.length > 0) {
          matchedVoice =
            voices.find((v: any) => v.lang === 'hi-IN' || (v.lang && v.lang.startsWith('hi'))) ||
            voices.find((v: any) => v.lang === 'en-IN' || (v.lang && v.lang.startsWith('en'))) ||
            voices[0];
        }

        const utterance = new SpeechSynthesisUtterance(text.trim());
        utterance.rate = 0.88;
        utterance.pitch = 1.0;

        if (matchedVoice) {
          utterance.voice = matchedVoice;
          utterance.lang = matchedVoice.lang || ttsLocale;
        } else {
          utterance.lang = ttsLocale;
        }

        utterance.onstart = () => {
          callbacks?.onStart?.();
        };

        utterance.onend = () => {
          callbacks?.onDone?.();
        };

        utterance.onerror = (e) => {
          console.warn('[NativeTTS] Utterance error event:', e);
          callbacks?.onError?.('Native text-to-speech synthesis error.');
        };

        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();

        setTimeout(() => {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        }, 20);
        return;
      }

      const options: Speech.SpeechOptions = {
        language: ttsLocale,
        rate: 0.88,
        pitch: 1.0,
        onStart: () => {
          callbacks?.onStart?.();
        },
        onDone: () => {
          callbacks?.onDone?.();
        },
        onError: (err) => {
          callbacks?.onError?.('Native text-to-speech error occurred.');
        },
      };

      if (voiceIdentifier) {
        options.voice = voiceIdentifier;
      }

      Speech.speak(text.trim(), options);
    } catch (err: any) {
      callbacks?.onError?.(err?.message || 'Failed to start native text-to-speech.');
    }
  }

  public async stop(): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      } else {
        await Speech.stop();
      }
    } catch (err) {
      console.warn('[NativeTTS] Error stopping speech:', err);
    }
  }
}
