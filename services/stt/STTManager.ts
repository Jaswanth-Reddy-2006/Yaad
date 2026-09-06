import { Platform } from 'react-native';
import {
  STTMode,
  STTResult,
  STTOptions,
  VoiceSTTCallbacks,
  STTAvailability,
  VoiceLanguageConfig,
} from '../../types/voice';
import { resolveVoiceLanguage } from '../../constants/voiceLanguages';
import { STT_MODEL_REGISTRY, getSTTModelMetadata } from '../../constants/sttModelRegistry';
import { OnlineSTTProvider } from './OnlineSTTProvider';
import { LocalOfflineSTTProvider } from './LocalOfflineSTTProvider';

/**
 * Hybrid Speech-To-Text (STT) Manager.
 * 
 * Implements the required hybrid routing architecture:
 * 
 *                     MICROPHONE
 *                          ↓
 *                      STTManager
 *                     ↙          ↘
 *              INTERNET ON    INTERNET OFF
 *                   ↓               ↓
 *              Online STT       Local ASR (AI4Bharat / Sherpa-ONNX)
 *                   ↓               ↓
 *               TEXT RESULT ←───────┘
 *                          ↓
 *                     VoiceService
 *                          ↓
 *                     Teammate 2 LLM
 * 
 * Core Rules:
 * 1. Internet Available -> Route to OnlineSTTProvider. If online fails/network error -> Fallback to LocalOfflineSTTProvider.
 * 2. Internet Unavailable -> Route directly to LocalOfflineSTTProvider.
 * 3. Offline STT not available -> Return clear structured error: "Offline STT is unavailable for <language> on this device."
 * 4. Zero silent cross-language fallback: Spoken language is strictly preserved without cross-language substitution.
 */
export class STTManager {
  private onlineProvider: OnlineSTTProvider;
  private localProvider: LocalOfflineSTTProvider;
  private activeMode: STTMode = 'online';
  private isListeningFlag = false;
  private activeCallbacks: VoiceSTTCallbacks | null = null;
  private simulatedOffline = false;

  constructor() {
    this.onlineProvider = new OnlineSTTProvider();
    this.localProvider = new LocalOfflineSTTProvider();
  }

  /**
   * Determine current network connectivity status.
   */
  public isOnline(): boolean {
    if (this.simulatedOffline) return false;
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    return true;
  }

  /**
   * Developer / Test toggle to simulate offline mode.
   */
  public setSimulatedOffline(offline: boolean): void {
    this.simulatedOffline = offline;
    console.log(`[STTManager] Simulated offline state set to: ${offline}`);
  }

  /**
   * Check STT availability for the selected language considering online and offline engines.
   */
  public async getSTTAvailability(
    languageIdentifier: string = 'en-IN',
    options?: STTOptions
  ): Promise<STTAvailability> {
    const langConfig = resolveVoiceLanguage(languageIdentifier);
    const modelMeta = getSTTModelMetadata(langConfig.id);
    const online = this.isOnline();
    const preferredMode = options?.preferredMode || 'auto';

    const onlineAvail = await this.onlineProvider.getAvailability(languageIdentifier);
    const localAvail = await this.localProvider.getAvailability(languageIdentifier);

    if (preferredMode === 'offline' || !online) {
      if (localAvail.available) {
        return {
          available: true,
          languageId: langConfig.id,
          sttLocale: langConfig.sttLocale,
          mode: 'offline',
          engineType: 'LOCAL_ONDEVICE_ASR',
          onlineAvailable: onlineAvail.available,
          offlineAvailable: true,
          modelInfo: modelMeta,
        };
      }
      return {
        available: false,
        languageId: langConfig.id,
        sttLocale: langConfig.sttLocale,
        mode: 'offline',
        engineType: 'NONE',
        onlineAvailable: onlineAvail.available,
        offlineAvailable: false,
        modelInfo: modelMeta,
        error: `Offline STT is unavailable for ${langConfig.displayName} on this device.`,
      };
    }

    // Online or Auto mode with internet
    if (onlineAvail.available) {
      return {
        available: true,
        languageId: langConfig.id,
        sttLocale: langConfig.sttLocale,
        mode: 'online',
        engineType: 'ONLINE_NATIVE_STT',
        onlineAvailable: true,
        offlineAvailable: localAvail.available,
        modelInfo: modelMeta,
      };
    }

    if (localAvail.available) {
      return {
        available: true,
        languageId: langConfig.id,
        sttLocale: langConfig.sttLocale,
        mode: 'offline',
        engineType: 'LOCAL_ONDEVICE_ASR',
        onlineAvailable: false,
        offlineAvailable: true,
        modelInfo: modelMeta,
      };
    }

    return {
      available: false,
      languageId: langConfig.id,
      sttLocale: langConfig.sttLocale,
      mode: 'online',
      engineType: 'NONE',
      onlineAvailable: false,
      offlineAvailable: false,
      modelInfo: modelMeta,
      error: `STT is unavailable for ${langConfig.displayName}.`,
    };
  }

  /**
   * Requests microphone permissions across platforms.
   */
  public async requestMicrophonePermission(): Promise<{ granted: boolean; error?: string }> {
    try {
      if (Platform.OS === 'web') {
        if (
          typeof navigator !== 'undefined' &&
          navigator.mediaDevices &&
          navigator.mediaDevices.getUserMedia
        ) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
          return { granted: true };
        }
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) return { granted: true };
        return { granted: false, error: 'Speech recognition is not supported in this browser.' };
      }

      try {
        const { ExpoSpeechRecognitionModule } = require('expo-speech-recognition');
        if (ExpoSpeechRecognitionModule && ExpoSpeechRecognitionModule.requestPermissionsAsync) {
          const res = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
          if (res && res.granted) return { granted: true };
        }
      } catch (err) {
        console.warn('[STTManager] ExpoSpeechRecognition permission request error:', err);
      }

      if (Platform.OS === 'android') {
        const { PermissionsAndroid } = require('react-native');
        if (
          PermissionsAndroid &&
          PermissionsAndroid.PERMISSIONS &&
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        ) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'Microphone Permission',
              message: 'Yaad requires microphone access for voice input and speech recognition.',
              buttonPositive: 'Grant',
              buttonNegative: 'Deny',
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) return { granted: true };
          return { granted: false, error: 'Microphone permission is required.' };
        }
      }

      return { granted: true };
    } catch (err: any) {
      return { granted: false, error: err?.message || 'Microphone permission is required.' };
    }
  }

  /**
   * Starts speech recognition with automatic hybrid routing (Online vs Local Offline ASR).
   */
  public async startListening(
    languageIdentifier: string = 'en-IN',
    callbacks?: VoiceSTTCallbacks,
    options?: STTOptions
  ): Promise<void> {
    const langConfig = resolveVoiceLanguage(languageIdentifier);
    this.activeCallbacks = callbacks || null;

    // 1. Permission Check
    const perm = await this.requestMicrophonePermission();
    if (!perm.granted) {
      this.isListeningFlag = false;
      this.activeCallbacks?.onError?.(perm.error || 'Microphone permission is required.');
      this.activeCallbacks?.onStateChange?.(false);
      return;
    }

    const online = this.isOnline();
    const preferredMode = options?.preferredMode || 'auto';
    const modelMeta = getSTTModelMetadata(langConfig.id);

    console.log(
      `[STTManager] Starting STT: Language=${langConfig.displayName} (${langConfig.sttLocale}), Internet=${online ? 'ON' : 'OFF'}, PreferredMode=${preferredMode}`
    );

    // Decision Route 1: Offline Forced or Internet OFF
    if (preferredMode === 'offline' || !online) {
      if (!modelMeta || !modelMeta.offlineSupported || !modelMeta.isLocalInstalled) {
        const errorMsg = `Offline STT is unavailable for ${langConfig.displayName} on this device.`;
        console.warn(`[STTManager] Routing aborted: ${errorMsg}`);
        this.isListeningFlag = false;
        this.activeCallbacks?.onError?.(errorMsg);
        this.activeCallbacks?.onStateChange?.(false);
        return;
      }

      this.activeMode = 'offline';
      this.isListeningFlag = true;
      this.activeCallbacks?.onModeChange?.('offline');
      console.log(`[STTManager] Routing to [LocalOfflineSTTProvider] for ${langConfig.displayName}`);
      await this.localProvider.startListening(langConfig, callbacks);
      return;
    }

    // Decision Route 2: Online STT
    if (modelMeta && modelMeta.onlineSupported) {
      this.activeMode = 'online';
      this.isListeningFlag = true;
      this.activeCallbacks?.onModeChange?.('online');
      console.log(`[STTManager] Routing to [OnlineSTTProvider] for ${langConfig.displayName}`);

      // Wrapped callbacks with network error fallback to local ASR
      const wrappedCallbacks: VoiceSTTCallbacks = {
        onResult: (transcript, isFinal, resultInfo) => {
          this.activeCallbacks?.onResult?.(transcript, isFinal, resultInfo);
        },
        onError: async (errorMsg) => {
          // If online failed due to network / connectivity issues, attempt offline fallback
          if (
            (errorMsg.includes('network') || errorMsg.includes('offline') || errorMsg.includes('unavailable')) &&
            modelMeta.offlineSupported &&
            modelMeta.isLocalInstalled
          ) {
            console.log(
              `[STTManager] Online STT failed with "${errorMsg}". Falling back to [LocalOfflineSTTProvider] for ${langConfig.displayName}...`
            );
            this.activeMode = 'offline';
            this.activeCallbacks?.onModeChange?.('offline');
            await this.localProvider.startListening(langConfig, this.activeCallbacks || undefined);
            return;
          }
          this.isListeningFlag = false;
          this.activeCallbacks?.onError?.(errorMsg);
          this.activeCallbacks?.onStateChange?.(false);
        },
        onStateChange: (listening) => {
          this.isListeningFlag = listening;
          this.activeCallbacks?.onStateChange?.(listening);
        },
        onModeChange: (mode) => {
          this.activeMode = mode;
          this.activeCallbacks?.onModeChange?.(mode);
        },
      };

      await this.onlineProvider.startListening(langConfig, wrappedCallbacks);
      return;
    }

    // Decision Route 3: Language only supported via local ASR model
    if (modelMeta && modelMeta.offlineSupported && modelMeta.isLocalInstalled) {
      this.activeMode = 'offline';
      this.isListeningFlag = true;
      this.activeCallbacks?.onModeChange?.('offline');
      console.log(
        `[STTManager] Online STT unsupported for ${langConfig.displayName}. Routing directly to [LocalOfflineSTTProvider].`
      );
      await this.localProvider.startListening(langConfig, callbacks);
      return;
    }

    // Language not supported
    const errorMsg = `Speech recognition is unavailable for ${langConfig.displayName}.`;
    this.isListeningFlag = false;
    this.activeCallbacks?.onError?.(errorMsg);
    this.activeCallbacks?.onStateChange?.(false);
  }

  /**
   * Stop any active STT listening session.
   */
  public async stopListening(): Promise<string> {
    this.isListeningFlag = false;
    let transcript = '';
    try {
      if (this.activeMode === 'online') {
        transcript = await this.onlineProvider.stopListening();
      } else {
        transcript = await this.localProvider.stopListening();
      }
    } catch (err) {
      console.warn('[STTManager] Error stopping STT:', err);
    }
    return transcript;
  }

  public getActiveMode(): STTMode {
    return this.activeMode;
  }

  public isListening(): boolean {
    return this.isListeningFlag || this.onlineProvider.isListening() || this.localProvider.isListening();
  }

  public destroy(): void {
    this.isListeningFlag = false;
    this.onlineProvider.destroy();
    this.localProvider.destroy();
  }
}

export const sttManager = new STTManager();
