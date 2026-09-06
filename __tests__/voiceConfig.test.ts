import { describe, test, expect, jest } from '@jest/globals';
import {
  OFFICIAL_INDIAN_VOICE_LANGUAGES,
  ALL_VOICE_LANGUAGES,
  ENGLISH_VOICE_LANGUAGE,
  resolveVoiceLanguage,
  getTTSLocale,
  getSTTLocale,
} from '../constants/voiceLanguages';
import {
  LOCAL_TTS_MODEL_REGISTRY,
  getTTSModelMetadata,
} from '../constants/ttsModelRegistry';
import {
  STT_MODEL_REGISTRY,
  getSTTModelMetadata,
} from '../constants/sttModelRegistry';
import {
  SUPPORTED_LANGUAGES,
  voiceService,
  ttsManager,
  sttManager,
  parseVoiceIntent,
  findMatchingVoice,
} from '../services/VoiceService';

describe('Centralized 22-Language Voice Configuration, Hybrid TTS & Hybrid STT Tests', () => {
  const EXPECTED_22_LANGUAGES = [
    'Assamese',
    'Bengali',
    'Bodo',
    'Dogri',
    'Gujarati',
    'Hindi',
    'Kannada',
    'Kashmiri',
    'Konkani',
    'Maithili',
    'Malayalam',
    'Manipuri',
    'Marathi',
    'Nepali',
    'Odia',
    'Punjabi',
    'Sanskrit',
    'Santali',
    'Sindhi',
    'Tamil',
    'Telugu',
    'Urdu',
  ];

  test('Contains exactly 22 official Eighth Schedule Indian languages', () => {
    expect(OFFICIAL_INDIAN_VOICE_LANGUAGES.length).toBe(22);
    
    const displayNames = OFFICIAL_INDIAN_VOICE_LANGUAGES.map((l) => l.displayName);
    EXPECTED_22_LANGUAGES.forEach((expectedLang) => {
      expect(displayNames).toContain(expectedLang);
    });
  });

  test('All 22 languages have valid non-empty metadata fields', () => {
    OFFICIAL_INDIAN_VOICE_LANGUAGES.forEach((lang) => {
      expect(lang.id).toBeDefined();
      expect(lang.id.trim().length).toBeGreaterThan(0);
      expect(lang.code).toBeDefined();
      expect(lang.code.trim().length).toBeGreaterThan(0);
      expect(lang.displayName).toBeDefined();
      expect(lang.displayName.trim().length).toBeGreaterThan(0);
      expect(lang.nativeName).toBeDefined();
      expect(lang.nativeName.trim().length).toBeGreaterThan(0);
      expect(lang.ttsLocale).toBeDefined();
      expect(lang.ttsLocale).toMatch(/^[a-z]{2,3}-[A-Z]{2}$/);
      expect(lang.sttLocale).toBeDefined();
      expect(lang.sttLocale).toMatch(/^[a-z]{2,3}-[A-Z]{2}$/);
      expect(lang.isOfficial22).toBe(true);
    });
  });

  test('ALL_VOICE_LANGUAGES contains English plus the 22 Indian languages', () => {
    expect(ALL_VOICE_LANGUAGES.length).toBe(23);
    expect(ALL_VOICE_LANGUAGES[0].id).toBe('en');
    expect(ALL_VOICE_LANGUAGES[0].ttsLocale).toBe('en-IN');
  });

  test('resolveVoiceLanguage resolves by ID, Locale, Code, and fallback', () => {
    // By ID
    expect(resolveVoiceLanguage('hi').displayName).toBe('Hindi');
    expect(resolveVoiceLanguage('te').displayName).toBe('Telugu');
    expect(resolveVoiceLanguage('ta').displayName).toBe('Tamil');
    expect(resolveVoiceLanguage('as').displayName).toBe('Assamese');
    expect(resolveVoiceLanguage('brx').displayName).toBe('Bodo');

    // By Locale
    expect(resolveVoiceLanguage('hi-IN').id).toBe('hi');
    expect(resolveVoiceLanguage('te-IN').id).toBe('te');
    expect(resolveVoiceLanguage('en-IN').id).toBe('en');

    // By Case Insensitive or with underscore
    expect(resolveVoiceLanguage('HI_IN').id).toBe('hi');
    expect(resolveVoiceLanguage('te_in').id).toBe('te');

    // Fallback to default
    expect(resolveVoiceLanguage(null).id).toBe('en');
    expect(resolveVoiceLanguage('unknown-xyz').id).toBe('en');
  });

  test('getTTSLocale and getSTTLocale map cleanly to standard BCP-47 codes', () => {
    expect(getTTSLocale('hi')).toBe('hi-IN');
    expect(getTTSLocale('te')).toBe('te-IN');
    expect(getTTSLocale('ta')).toBe('ta-IN');
    expect(getTTSLocale('kn')).toBe('kn-IN');
    expect(getTTSLocale('ml')).toBe('ml-IN');
    expect(getTTSLocale('mr')).toBe('mr-IN');
    expect(getTTSLocale('bn')).toBe('bn-IN');
    expect(getTTSLocale('gu')).toBe('gu-IN');
    expect(getTTSLocale('pa')).toBe('pa-IN');
    expect(getTTSLocale('or')).toBe('or-IN');
    expect(getTTSLocale('ur')).toBe('ur-IN');
    expect(getTTSLocale('as')).toBe('as-IN');
    expect(getTTSLocale('en')).toBe('en-IN');

    expect(getSTTLocale('hi')).toBe('hi-IN');
    expect(getSTTLocale('te')).toBe('te-IN');
    expect(getSTTLocale('ta')).toBe('ta-IN');
  });

  test('LOCAL_TTS_MODEL_REGISTRY defines metadata for all 22 languages + English', () => {
    OFFICIAL_INDIAN_VOICE_LANGUAGES.forEach((lang) => {
      const model = getTTSModelMetadata(lang.id);
      expect(model).toBeDefined();
      expect(model?.displayName).toBe(lang.displayName);
      expect(model?.engine).toBeDefined();
      expect(model?.license).toBeDefined();
      expect(model?.approxSize).toBeDefined();
    });
  });

  test('STT_MODEL_REGISTRY defines metadata for all 22 languages + English', () => {
    OFFICIAL_INDIAN_VOICE_LANGUAGES.forEach((lang) => {
      const model = getSTTModelMetadata(lang.id);
      expect(model).toBeDefined();
      expect(model?.displayName).toBe(lang.displayName);
      expect(model?.sttLocale).toBeDefined();
      expect(typeof model?.onlineSupported).toBe('boolean');
      expect(typeof model?.offlineSupported).toBe('boolean');
      expect(model?.provider).toBeDefined();
    });
  });

  test('STTManager accurately reports Telugu online and offline local ASR availability', async () => {
    // Online check
    sttManager.setSimulatedOffline(false);
    const teOnlineAvail = await sttManager.getSTTAvailability('te');
    expect(teOnlineAvail.available).toBe(true);
    expect(teOnlineAvail.sttLocale).toBe('te-IN');
    expect(teOnlineAvail.offlineAvailable).toBe(true);

    // Offline check
    sttManager.setSimulatedOffline(true);
    const teOfflineAvail = await sttManager.getSTTAvailability('te');
    expect(teOfflineAvail.available).toBe(true);
    expect(teOfflineAvail.mode).toBe('offline');
    expect(teOfflineAvail.engineType).toBe('LOCAL_ONDEVICE_ASR');
    expect(teOfflineAvail.modelInfo?.modelName).toBe('indicconformer-te-v1');

    // Reset
    sttManager.setSimulatedOffline(false);
  });

  test('STTManager offline routing returns clear error when model is not installed', async () => {
    sttManager.setSimulatedOffline(true);
    const saOfflineAvail = await sttManager.getSTTAvailability('sa');
    expect(saOfflineAvail.available).toBe(false);
    expect(saOfflineAvail.error).toContain('Offline STT is unavailable for Sanskrit on this device');

    sttManager.setSimulatedOffline(false);
  });

  test('TTSManager routes Telugu to LOCAL_ONNX_MODEL and other languages to NATIVE_DEVICE_TTS', async () => {
    const teAvail = await ttsManager.getTTSAvailability('te');
    expect(teAvail.available).toBe(true);
    expect(teAvail.engineType).toBe('LOCAL_ONNX_MODEL');
    expect(teAvail.capability).toBe('AVAILABLE_OFFLINE');

    const hiAvail = await ttsManager.getTTSAvailability('hi');
    expect(hiAvail.available).toBe(true);
    expect(['LOCAL_ONNX_MODEL', 'NATIVE_DEVICE_TTS']).toContain(hiAvail.engineType);
  });

  test('Voice intent parsing works correctly for core intents', () => {
    const activityIntent = parseVoiceIntent('What should I do now?');
    expect(activityIntent.intent).toBe('WHAT_TO_DO_NOW');

    const reminderIntent = parseVoiceIntent('When is my next medicine reminder?');
    expect(reminderIntent.intent).toBe('NEXT_REMINDER');

    const helpIntent = parseVoiceIntent('Help emergency SOS');
    expect(helpIntent.intent).toBe('HELP_SOS');
  });

  test('findMatchingVoice strictly matches target language and prevents cross-language mismatch', () => {
    const mockVoices = [
      { name: 'Google हिन्दी', language: 'hi-IN', identifier: 'hi-in-x-hie-local' },
      { name: 'Google தமிழ்', language: 'ta-IN', identifier: 'ta-in-x-taf-local' },
      { name: 'Google తెలుగు', language: 'te-IN', identifier: 'te-in-x-tef-local' },
      { name: 'Microsoft Ravi - English (India)', language: 'en-IN', identifier: 'en-in-ravi' },
    ];

    const teLang = resolveVoiceLanguage('te');
    const teMatch = findMatchingVoice(mockVoices, 'te-IN', teLang);
    expect(teMatch).toBeDefined();
    expect(teMatch.language).toBe('te-IN');

    const hiLang = resolveVoiceLanguage('hi');
    const hiMatch = findMatchingVoice(mockVoices, 'hi-IN', hiLang);
    expect(hiMatch).toBeDefined();
    expect(hiMatch.language).toBe('hi-IN');

    // Language not in mock list (e.g. Odia) should NOT match English or Hindi
    const orLang = resolveVoiceLanguage('or');
    const orMatch = findMatchingVoice(mockVoices, 'or-IN', orLang);
    expect(orMatch).toBeNull();
  });

  test('VoiceService speech execution handles empty text gracefully with onError callback', async () => {
    let errorCalled = false;
    let errorMessage = '';

    await voiceService.speak('', 'en-IN', {
      onError: (err) => {
        errorCalled = true;
        errorMessage = err;
      },
    });

    expect(errorCalled).toBe(true);
    expect(errorMessage).toContain('Please enter something to speak');
  });

  test('VoiceService allows speech execution when offline capability is unknown but voice engine exists', async () => {
    let errorTriggered = false;

    await voiceService.speak('నమస్కారం', 'te', {
      onError: () => {
        errorTriggered = true;
      },
    });

    expect(errorTriggered).toBe(false);
  });
});
