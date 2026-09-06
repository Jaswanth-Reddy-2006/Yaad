import { Platform } from 'react-native';
import {
  STTResult,
  VoiceSTTCallbacks,
  VoiceLanguageConfig,
  STTAvailability,
} from '../../types/voice';
import { resolveVoiceLanguage } from '../../constants/voiceLanguages';
import { STT_MODEL_REGISTRY, getSTTModelMetadata } from '../../constants/sttModelRegistry';

/**
 * Online Native / Web Speech Recognition Provider.
 * 
 * Streams audio to native platform speech recognizers (Android SpeechRecognizer / iOS SFSpeechRecognizer)
 * or Web Speech API with real-time interim and final transcript streaming.
 */
export class OnlineSTTProvider {
  private isListeningFlag = false;
  private webRecognitionInstance: any = null;
  private activeCallbacks: VoiceSTTCallbacks | null = null;
  private accumulatedTranscript = '';
  private currentPartialTranscript = '';
  private manualStopRequested = false;
  private nativeSubscriptions: Array<{ remove: () => void }> = [];
  private activeLanguageConfig: VoiceLanguageConfig | null = null;

  /**
   * Check if online speech recognition is available for the given language.
   */
  public async getAvailability(languageIdentifier: string): Promise<STTAvailability> {
    const langConfig = resolveVoiceLanguage(languageIdentifier);
    const modelMeta = getSTTModelMetadata(langConfig.id);
    const isSupported = Boolean(modelMeta && modelMeta.onlineSupported);

    if (Platform.OS === 'web') {
      const hasWebSpeech =
        typeof window !== 'undefined' &&
        Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

      if (!hasWebSpeech) {
        return {
          available: false,
          languageId: langConfig.id,
          sttLocale: langConfig.sttLocale,
          onlineAvailable: false,
          offlineAvailable: false,
          mode: 'online',
          engineType: 'ONLINE_NATIVE_STT',
          modelInfo: modelMeta,
          error: 'Web Speech Recognition is not supported in this browser.',
        };
      }

      return {
        available: isSupported,
        languageId: langConfig.id,
        sttLocale: langConfig.sttLocale,
        onlineAvailable: isSupported,
        offlineAvailable: Boolean(modelMeta?.offlineSupported),
        mode: 'online',
        engineType: 'ONLINE_NATIVE_STT',
        modelInfo: modelMeta,
        warning: isSupported ? undefined : `Online STT is not supported for ${langConfig.displayName}.`,
      };
    }

    return {
      available: isSupported,
      languageId: langConfig.id,
      sttLocale: langConfig.sttLocale,
      onlineAvailable: isSupported,
      offlineAvailable: Boolean(modelMeta?.offlineSupported),
      mode: 'online',
      engineType: 'ONLINE_NATIVE_STT',
      modelInfo: modelMeta,
    };
  }

  /**
   * Starts online speech recognition.
   */
  public async startListening(
    langConfig: VoiceLanguageConfig,
    callbacks?: VoiceSTTCallbacks
  ): Promise<void> {
    this.activeLanguageConfig = langConfig;
    this.activeCallbacks = callbacks || null;
    this.accumulatedTranscript = '';
    this.currentPartialTranscript = '';
    this.manualStopRequested = false;

    if (Platform.OS === 'web') {
      this.startWebSpeechRecognition(langConfig);
    } else {
      await this.startNativeSpeechRecognition(langConfig);
    }
  }

  private startWebSpeechRecognition(langConfig: VoiceLanguageConfig): void {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.isListeningFlag = false;
      this.activeCallbacks?.onError?.('Speech recognition is not available on this browser.');
      this.activeCallbacks?.onStateChange?.(false);
      return;
    }

    try {
      if (this.webRecognitionInstance) {
        try {
          this.webRecognitionInstance.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = langConfig.sttLocale;

      let currentCommitted = '';
      let currentPartial = '';

      recognition.onstart = () => {
        this.isListeningFlag = true;
        this.activeCallbacks?.onStateChange?.(true);
        this.activeCallbacks?.onModeChange?.('online');
      };

      recognition.onresult = (event: any) => {
        currentCommitted = '';
        currentPartial = '';
        for (let i = 0; i < event.results.length; ++i) {
          const resultItem = event.results[i];
          const phrase = resultItem[0]?.transcript?.trim() || '';
          if (phrase) {
            if (resultItem.isFinal) {
              if (currentCommitted && !currentCommitted.endsWith(' ')) currentCommitted += ' ';
              currentCommitted += phrase;
            } else {
              if (currentPartial && !currentPartial.endsWith(' ')) currentPartial += ' ';
              currentPartial += phrase;
            }
          }
        }

        let fullSessionText = this.accumulatedTranscript;
        if (currentCommitted) {
          if (fullSessionText && !fullSessionText.endsWith(' ')) fullSessionText += ' ';
          fullSessionText += currentCommitted;
        }
        let activeDisplayText = fullSessionText;
        if (currentPartial) {
          if (activeDisplayText && !activeDisplayText.endsWith(' ')) activeDisplayText += ' ';
          activeDisplayText += currentPartial;
        }

        activeDisplayText = activeDisplayText.trim();
        if (activeDisplayText) {
          const isFinal = Boolean(currentCommitted && !currentPartial);
          const sttResult: STTResult = {
            text: activeDisplayText,
            language: langConfig.id,
            confidence: 0.95,
            mode: 'online',
            provider: 'Web Speech API / Cloud Speech Engine',
            isFinal,
          };
          this.activeCallbacks?.onResult?.(activeDisplayText, isFinal, sttResult);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech' || event.error === 'aborted') return;
        console.warn('[OnlineSTT] Web Speech error:', event.error);
        this.isListeningFlag = false;
        this.activeCallbacks?.onError?.(`Speech recognition error: ${event.error || 'unknown'}`);
        this.activeCallbacks?.onStateChange?.(false);
      };

      recognition.onend = () => {
        if (currentCommitted) {
          if (this.accumulatedTranscript && !this.accumulatedTranscript.endsWith(' '))
            this.accumulatedTranscript += ' ';
          this.accumulatedTranscript += currentCommitted;
          this.accumulatedTranscript = this.accumulatedTranscript.trim();
        }
        if (this.isListeningFlag && !this.manualStopRequested) {
          try {
            recognition.start();
            return;
          } catch (err) {}
        }
        this.isListeningFlag = false;
        if (this.accumulatedTranscript) {
          const sttResult: STTResult = {
            text: this.accumulatedTranscript,
            language: langConfig.id,
            confidence: 0.95,
            mode: 'online',
            provider: 'Web Speech API / Cloud Speech Engine',
            isFinal: true,
          };
          this.activeCallbacks?.onResult?.(this.accumulatedTranscript, true, sttResult);
        }
        this.activeCallbacks?.onStateChange?.(false);
      };

      this.webRecognitionInstance = recognition;
      recognition.start();
    } catch (err: any) {
      this.isListeningFlag = false;
      this.activeCallbacks?.onError?.(err?.message || 'Failed to start online speech recognition.');
      this.activeCallbacks?.onStateChange?.(false);
    }
  }

  private cleanNativeSubscriptions(): void {
    this.nativeSubscriptions.forEach((sub) => {
      try {
        sub.remove();
      } catch {}
    });
    this.nativeSubscriptions = [];
  }

  private async startNativeSpeechRecognition(langConfig: VoiceLanguageConfig): Promise<void> {
    try {
      this.cleanNativeSubscriptions();
      let ExpoSpeechRecognitionModule: any = null;
      try {
        ExpoSpeechRecognitionModule = require('expo-speech-recognition').ExpoSpeechRecognitionModule;
      } catch {}

      if (ExpoSpeechRecognitionModule && typeof ExpoSpeechRecognitionModule.addListener === 'function') {
        this.nativeSubscriptions.push(
          ExpoSpeechRecognitionModule.addListener('start', () => {
            this.isListeningFlag = true;
            this.activeCallbacks?.onStateChange?.(true);
            this.activeCallbacks?.onModeChange?.('online');
          })
        );
        this.nativeSubscriptions.push(
          ExpoSpeechRecognitionModule.addListener('result', (event: any) => {
            const rawResult = event?.results?.[0]?.transcript?.trim() || '';
            const isFinal = Boolean(event?.isFinal);
            if (rawResult) {
              if (isFinal) {
                if (this.accumulatedTranscript && !this.accumulatedTranscript.endsWith(' '))
                  this.accumulatedTranscript += ' ';
                this.accumulatedTranscript = (this.accumulatedTranscript + rawResult).trim();
                this.currentPartialTranscript = '';
                const sttResult: STTResult = {
                  text: this.accumulatedTranscript,
                  language: langConfig.id,
                  confidence: 0.92,
                  mode: 'online',
                  provider: 'ExpoSpeechRecognition / OS SpeechRecognizer',
                  isFinal: true,
                };
                this.activeCallbacks?.onResult?.(this.accumulatedTranscript, true, sttResult);
              } else {
                this.currentPartialTranscript = rawResult;
                let display = this.accumulatedTranscript;
                if (this.currentPartialTranscript) {
                  if (display && !display.endsWith(' ')) display += ' ';
                  display += this.currentPartialTranscript;
                }
                const sttResult: STTResult = {
                  text: display.trim(),
                  language: langConfig.id,
                  confidence: 0.85,
                  mode: 'online',
                  provider: 'ExpoSpeechRecognition / OS SpeechRecognizer',
                  isFinal: false,
                };
                this.activeCallbacks?.onResult?.(display.trim(), false, sttResult);
              }
            }
          })
        );
        this.nativeSubscriptions.push(
          ExpoSpeechRecognitionModule.addListener('error', (event: any) => {
            this.isListeningFlag = false;
            this.activeCallbacks?.onStateChange?.(false);
            this.activeCallbacks?.onError?.(event?.message || 'Speech recognition error occurred.');
          })
        );
        this.nativeSubscriptions.push(
          ExpoSpeechRecognitionModule.addListener('end', () => {
            this.isListeningFlag = false;
            this.activeCallbacks?.onStateChange?.(false);
          })
        );
        ExpoSpeechRecognitionModule.start({
          lang: langConfig.sttLocale,
          interimResults: true,
          continuous: true,
        });
        return;
      }

      const Voice = require('@react-native-voice/voice').default;
      if (Voice) {
        Voice.onSpeechStart = () => {
          this.isListeningFlag = true;
          this.activeCallbacks?.onStateChange?.(true);
          this.activeCallbacks?.onModeChange?.('online');
        };
        Voice.onSpeechPartialResults = (e: any) => {
          const val = e?.value?.[0];
          if (val) {
            const sttResult: STTResult = {
              text: val,
              language: langConfig.id,
              confidence: 0.85,
              mode: 'online',
              provider: '@react-native-voice/voice',
              isFinal: false,
            };
            this.activeCallbacks?.onResult?.(val, false, sttResult);
          }
        };
        Voice.onSpeechResults = (e: any) => {
          const val = e?.value?.[0];
          if (val) {
            const sttResult: STTResult = {
              text: val,
              language: langConfig.id,
              confidence: 0.95,
              mode: 'online',
              provider: '@react-native-voice/voice',
              isFinal: true,
            };
            this.activeCallbacks?.onResult?.(val, true, sttResult);
          }
        };
        Voice.onSpeechEnd = () => {
          this.isListeningFlag = false;
          this.activeCallbacks?.onStateChange?.(false);
        };
        await Voice.start(langConfig.sttLocale);
      }
    } catch (err: any) {
      this.isListeningFlag = false;
      this.activeCallbacks?.onError?.(err?.message || 'Online speech recognition failed.');
      this.activeCallbacks?.onStateChange?.(false);
    }
  }

  public async stopListening(): Promise<string> {
    this.manualStopRequested = true;
    this.isListeningFlag = false;
    if (Platform.OS === 'web' && this.webRecognitionInstance) {
      try {
        this.webRecognitionInstance.stop();
      } catch {}
    } else {
      try {
        const { ExpoSpeechRecognitionModule } = require('expo-speech-recognition');
        ExpoSpeechRecognitionModule?.stop();
      } catch {}
      try {
        const Voice = require('@react-native-voice/voice').default;
        await Voice?.stop();
      } catch {}
    }
    return this.accumulatedTranscript;
  }

  public isListening(): boolean {
    return this.isListeningFlag;
  }

  public destroy(): void {
    this.cleanNativeSubscriptions();
    if (this.webRecognitionInstance) {
      try {
        this.webRecognitionInstance.abort();
      } catch {}
      this.webRecognitionInstance = null;
    }
  }
}
