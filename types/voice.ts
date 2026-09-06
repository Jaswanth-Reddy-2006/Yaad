export type TTSCapabilityStatus =
  | 'AVAILABLE_OFFLINE'
  | 'AVAILABLE_BUT_OFFLINE_STATUS_UNKNOWN'
  | 'UNAVAILABLE';

export type TTSEngineType = 'LOCAL_ONNX_MODEL' | 'NATIVE_DEVICE_TTS' | 'NONE';

export type TTSModelStatus =
  | 'LOCAL_MODEL_AVAILABLE'
  | 'NATIVE_OFFLINE_AVAILABLE'
  | 'AVAILABLE_BUT_OFFLINE_UNKNOWN'
  | 'UNAVAILABLE';

export interface TTSModelMetadata {
  languageId: string;
  displayName: string;
  modelName: string;
  engine: string;
  license: string;
  approxSize: string;
  status: TTSModelStatus;
  offlineStatus: 'BUNDLED_OFFLINE' | 'ONE_TIME_DOWNLOAD' | 'NATIVE_SYSTEM' | 'UNAVAILABLE';
  isLocalInstalled: boolean;
  notes?: string;
}

export type STTMode = 'online' | 'offline';

export type STTEngineType = 'ONLINE_NATIVE_STT' | 'LOCAL_ONDEVICE_ASR' | 'NONE';

export type STTModelStatus =
  | 'LOCAL_MODEL_AVAILABLE'
  | 'ONLINE_ONLY'
  | 'ONE_TIME_DOWNLOAD'
  | 'UNAVAILABLE';

export interface STTModelMetadata {
  languageId: string;
  displayName: string;
  sttLocale: string;
  onlineSupported: boolean;
  offlineSupported: boolean;
  provider: string;
  modelName?: string;
  engine?: string;
  license?: string;
  approxSize?: string;
  isLocalInstalled?: boolean;
  notes?: string;
}

export interface STTResult {
  text: string;
  language: string;
  confidence?: number;
  mode: STTMode;
  provider?: string;
  isFinal: boolean;
}

export interface STTOptions {
  preferredMode?: 'auto' | 'online' | 'offline';
}

export interface VoiceLanguageConfig {
  /** Unique identifier for the language, e.g. 'hi', 'te', 'as', 'brx' */
  id: string;
  /** ISO 639-1 or ISO 639-2/3 language code */
  code: string;
  /** English display name, e.g. 'Hindi', 'Telugu', 'Assamese' */
  displayName: string;
  /** Native script name, e.g. 'हिन्दी', 'తెలుగు', 'অসমীয়া' */
  nativeName: string;
  /** BCP-47 locale identifier for Text-To-Speech (TTS), e.g. 'hi-IN' */
  ttsLocale: string;
  /** BCP-47 locale identifier for Speech-To-Text (STT), e.g. 'hi-IN' */
  sttLocale: string;
  /** Whether this is one of the 22 Eighth Schedule official languages of India */
  isOfficial22: boolean;
  /** Whether this language is highlighted in primary UI defaults */
  uiDefault?: boolean;
  /** Any notes or special handling requirements for the language/locale */
  notes?: string;
}

export interface TTSAvailability {
  languageId: string;
  available: boolean;
  capability: TTSCapabilityStatus;
  engineType?: TTSEngineType;
  voiceName?: string;
  voiceIdentifier?: string;
  locale?: string;
  offlineCapable?: boolean;
  reason?: string;
  warning?: string;
  matchedVoice?: any;
  modelInfo?: TTSModelMetadata;
}

export type VoiceAvailabilityResult = TTSAvailability;

export interface STTLanguageAvailabilityResult {
  available: boolean;
  languageId?: string;
  sttLocale: string;
  mode?: STTMode;
  engineType?: STTEngineType;
  onlineAvailable?: boolean;
  offlineAvailable?: boolean;
  services?: string[];
  modelInfo?: STTModelMetadata;
  error?: string;
  warning?: string;
}

export type STTAvailability = STTLanguageAvailabilityResult;

export type VoiceIntent =
  | 'WHAT_TO_DO_NOW'
  | 'NEXT_REMINDER'
  | 'TODAY_PLAN'
  | 'HELP_SOS'
  | 'REPEAT'
  | 'UNKNOWN';

export interface VoiceIntentResult {
  intent: VoiceIntent;
  spokenText: string;
  responsePrompt: string;
}

export interface VoiceSTTCallbacks {
  onResult: (transcript: string, isFinal: boolean, resultInfo?: STTResult) => void;
  onError: (error: string) => void;
  onStateChange?: (isListening: boolean) => void;
  onModeChange?: (mode: STTMode) => void;
}

export interface VoiceTTSCallbacks {
  onStart?: () => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}
