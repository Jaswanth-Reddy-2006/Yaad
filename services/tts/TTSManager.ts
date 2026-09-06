import {
  TTSAvailability,
  VoiceTTSCallbacks,
  VoiceLanguageConfig,
} from '../../types/voice';
import { resolveVoiceLanguage } from '../../constants/voiceLanguages';
import { LocalModelTTSProvider } from './LocalModelTTSProvider';
import { NativeDeviceTTSProvider } from './NativeDeviceTTSProvider';

/**
 * Hybrid TTS Manager.
 * 
 * Implements the required architecture:
 *                     VoiceService
 *                          |
 *                      TTS Manager
 *                          |
 *              +-----------+-----------+
 *              |                       |
 *        Local/Offline TTS       Native Device TTS
 *              |                       |
 *        ON-DEVICE MODEL          expo-speech
 *              |                       |
 *              +-----------+-----------+
 *                          |
 *                        Audio
 * 
 * Priority:
 * 1. Bundled / Local on-device TTS Model
 * 2. Installed Native Device TTS (expo-speech / OS Synthesizer)
 * 3. Clear unavailable error (Zero silent cross-language fallback)
 */
export class TTSManager {
  private localProvider: LocalModelTTSProvider;
  private nativeProvider: NativeDeviceTTSProvider;
  private isSpeakingFlag = false;
  private activeTTSCallbacks: VoiceTTSCallbacks | null = null;

  constructor() {
    this.localProvider = new LocalModelTTSProvider();
    this.nativeProvider = new NativeDeviceTTSProvider();
  }

  /**
   * Determine the best available TTS capability for the language.
   */
  public async getTTSAvailability(languageIdentifier: string = 'en-IN'): Promise<TTSAvailability> {
    const langConfig = resolveVoiceLanguage(languageIdentifier);

    // 1. Check Priority 1: On-device local TTS model
    const localAvail = await this.localProvider.getAvailability(languageIdentifier);
    if (localAvail.available && localAvail.capability === 'AVAILABLE_OFFLINE') {
      return localAvail;
    }

    // 2. Check Priority 2: Native device TTS
    const nativeAvail = await this.nativeProvider.getAvailability(languageIdentifier);
    if (nativeAvail.available) {
      return nativeAvail;
    }

    // 3. Fallback: Return clear unavailable state
    return {
      languageId: langConfig.id,
      available: false,
      capability: 'UNAVAILABLE',
      engineType: 'NONE',
      locale: langConfig.ttsLocale,
      offlineCapable: false,
      reason: `No local TTS model or native voice available for ${langConfig.displayName}.`,
      warning: `Speech voice for ${langConfig.displayName} is not available on this device.`,
    };
  }

  /**
   * Synthesize speech using the optimal offline-first engine path.
   */
  public async speak(
    text: string,
    languageIdentifier: string = 'en-IN',
    callbacks?: VoiceTTSCallbacks
  ): Promise<void> {
    if (!text || text.trim().length === 0) {
      console.warn('[TTSManager] Empty or whitespace text provided to speak().');
      callbacks?.onError?.('Please enter something to speak.');
      return;
    }

    this.activeTTSCallbacks = callbacks || null;
    const langConfig = resolveVoiceLanguage(languageIdentifier);

    const avail = await this.getTTSAvailability(languageIdentifier);
    if (!avail.available || avail.capability === 'UNAVAILABLE') {
      const errorMsg =
        avail.warning ||
        `Voice for ${langConfig.displayName} is not available on this device.`;
      console.warn(`[TTSManager] Voice unavailable for ${langConfig.displayName}: ${errorMsg}`);
      this.isSpeakingFlag = false;
      callbacks?.onError?.(errorMsg);
      return;
    }

    await this.stop();
    this.isSpeakingFlag = true;

    const wrappedCallbacks: VoiceTTSCallbacks = {
      onStart: () => {
        this.isSpeakingFlag = true;
        this.activeTTSCallbacks?.onStart?.();
      },
      onDone: () => {
        this.isSpeakingFlag = false;
        this.activeTTSCallbacks?.onDone?.();
      },
      onError: (err) => {
        this.isSpeakingFlag = false;
        this.activeTTSCallbacks?.onError?.(err);
      },
    };

    if (avail.engineType === 'LOCAL_ONNX_MODEL') {
      console.log(
        `[TTSManager] Routing to [LocalModelTTSProvider] for ${langConfig.displayName} (${langConfig.ttsLocale})`
      );
      await this.localProvider.speak(text, langConfig, wrappedCallbacks);
      return;
    }

    console.log(
      `[TTSManager] Routing to [NativeDeviceTTSProvider] for ${langConfig.displayName} (${langConfig.ttsLocale})`
    );
    await this.nativeProvider.speak(text, langConfig, avail.voiceIdentifier, wrappedCallbacks);
  }

  public async stop(): Promise<void> {
    try {
      await this.localProvider.stop();
      await this.nativeProvider.stop();
    } catch (err) {
      console.warn('[TTSManager] Error stopping speech:', err);
    } finally {
      this.isSpeakingFlag = false;
      this.activeTTSCallbacks?.onDone?.();
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeakingFlag;
  }
}

export const ttsManager = new TTSManager();
