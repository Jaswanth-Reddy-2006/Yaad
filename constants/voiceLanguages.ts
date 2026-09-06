import { VoiceLanguageConfig } from '../types/voice';

/**
 * 22 Officially Recognized Eighth Schedule Languages of India.
 * Centralized Single Source of Truth for Voice (TTS & STT).
 */
export const OFFICIAL_INDIAN_VOICE_LANGUAGES: VoiceLanguageConfig[] = [
  {
    id: 'as',
    code: 'as',
    displayName: 'Assamese',
    nativeName: 'অসমীয়া',
    ttsLocale: 'as-IN',
    sttLocale: 'as-IN',
    isOfficial22: true,
  },
  {
    id: 'bn',
    code: 'bn',
    displayName: 'Bengali',
    nativeName: 'বাংলা',
    ttsLocale: 'bn-IN',
    sttLocale: 'bn-IN',
    isOfficial22: true,
  },
  {
    id: 'brx',
    code: 'brx',
    displayName: 'Bodo',
    nativeName: 'बड़ो',
    ttsLocale: 'brx-IN',
    sttLocale: 'brx-IN',
    isOfficial22: true,
    notes: 'Sino-Tibetan language; device TTS voices are rarely pre-installed on default Android/iOS.',
  },
  {
    id: 'doi',
    code: 'doi',
    displayName: 'Dogri',
    nativeName: 'डोगरी',
    ttsLocale: 'doi-IN',
    sttLocale: 'doi-IN',
    isOfficial22: true,
    notes: 'Indo-Aryan language; limited native mobile TTS availability on standard OS distributions.',
  },
  {
    id: 'gu',
    code: 'gu',
    displayName: 'Gujarati',
    nativeName: 'ગુજરાતી',
    ttsLocale: 'gu-IN',
    sttLocale: 'gu-IN',
    isOfficial22: true,
  },
  {
    id: 'hi',
    code: 'hi',
    displayName: 'Hindi',
    nativeName: 'हिन्दी',
    ttsLocale: 'hi-IN',
    sttLocale: 'hi-IN',
    isOfficial22: true,
    uiDefault: true,
  },
  {
    id: 'kn',
    code: 'kn',
    displayName: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    ttsLocale: 'kn-IN',
    sttLocale: 'kn-IN',
    isOfficial22: true,
    uiDefault: true,
  },
  {
    id: 'ks',
    code: 'ks',
    displayName: 'Kashmiri',
    nativeName: 'कॉशुर / کٲشُر',
    ttsLocale: 'ks-IN',
    sttLocale: 'ks-IN',
    isOfficial22: true,
    notes: 'Dardic language; written in Perso-Arabic or Devanagari. Standard device TTS rare.',
  },
  {
    id: 'kok',
    code: 'kok',
    displayName: 'Konkani',
    nativeName: 'कोंकणी',
    ttsLocale: 'kok-IN',
    sttLocale: 'kok-IN',
    isOfficial22: true,
    notes: 'ISO 639-2/3 kok; limited native mobile TTS availability.',
  },
  {
    id: 'mai',
    code: 'mai',
    displayName: 'Maithili',
    nativeName: 'मैथिली',
    ttsLocale: 'mai-IN',
    sttLocale: 'mai-IN',
    isOfficial22: true,
    notes: 'Bihari language; limited native mobile TTS availability.',
  },
  {
    id: 'ml',
    code: 'ml',
    displayName: 'Malayalam',
    nativeName: 'മലയാളം',
    ttsLocale: 'ml-IN',
    sttLocale: 'ml-IN',
    isOfficial22: true,
  },
  {
    id: 'mni',
    code: 'mni',
    displayName: 'Manipuri',
    nativeName: 'মৈতৈলোন্ / মণিপুরী',
    ttsLocale: 'mni-IN',
    sttLocale: 'mni-IN',
    isOfficial22: true,
    notes: 'Meitei language (ISO 639-2 mni); limited native mobile TTS availability.',
  },
  {
    id: 'mr',
    code: 'mr',
    displayName: 'Marathi',
    nativeName: 'मराठी',
    ttsLocale: 'mr-IN',
    sttLocale: 'mr-IN',
    isOfficial22: true,
    uiDefault: true,
  },
  {
    id: 'ne',
    code: 'ne',
    displayName: 'Nepali',
    nativeName: 'नेपाली',
    ttsLocale: 'ne-IN',
    sttLocale: 'ne-IN',
    isOfficial22: true,
  },
  {
    id: 'or',
    code: 'or',
    displayName: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    ttsLocale: 'or-IN',
    sttLocale: 'or-IN',
    isOfficial22: true,
    notes: 'ISO 639-1 or; legacy engines sometimes map as od-IN or ori-IN.',
  },
  {
    id: 'pa',
    code: 'pa',
    displayName: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    ttsLocale: 'pa-IN',
    sttLocale: 'pa-IN',
    isOfficial22: true,
  },
  {
    id: 'sa',
    code: 'sa',
    displayName: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    ttsLocale: 'sa-IN',
    sttLocale: 'sa-IN',
    isOfficial22: true,
    notes: 'Classical language; limited default device TTS voice packages.',
  },
  {
    id: 'sat',
    code: 'sat',
    displayName: 'Santali',
    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
    ttsLocale: 'sat-IN',
    sttLocale: 'sat-IN',
    isOfficial22: true,
    notes: 'Austroasiatic language (Ol Chiki script); limited native mobile TTS support.',
  },
  {
    id: 'sd',
    code: 'sd',
    displayName: 'Sindhi',
    nativeName: 'سنڌي / सिन्धी',
    ttsLocale: 'sd-IN',
    sttLocale: 'sd-IN',
    isOfficial22: true,
    notes: 'Indo-Aryan language; limited native mobile TTS availability.',
  },
  {
    id: 'ta',
    code: 'ta',
    displayName: 'Tamil',
    nativeName: 'தமிழ்',
    ttsLocale: 'ta-IN',
    sttLocale: 'ta-IN',
    isOfficial22: true,
    uiDefault: true,
  },
  {
    id: 'te',
    code: 'te',
    displayName: 'Telugu',
    nativeName: 'తెలుగు',
    ttsLocale: 'te-IN',
    sttLocale: 'te-IN',
    isOfficial22: true,
    uiDefault: true,
  },
  {
    id: 'ur',
    code: 'ur',
    displayName: 'Urdu',
    nativeName: 'اردو',
    ttsLocale: 'ur-IN',
    sttLocale: 'ur-IN',
    isOfficial22: true,
  },
];

/**
 * English (India) configuration - provided alongside the 22 Indian languages
 * to maintain complete backward compatibility and system defaults.
 */
export const ENGLISH_VOICE_LANGUAGE: VoiceLanguageConfig = {
  id: 'en',
  code: 'en',
  displayName: 'English',
  nativeName: 'English (India)',
  ttsLocale: 'en-IN',
  sttLocale: 'en-IN',
  isOfficial22: false,
  uiDefault: true,
};

/**
 * Complete list of supported voice languages in the application,
 * starting with English (India) followed by the 22 official languages of India.
 */
export const ALL_VOICE_LANGUAGES: VoiceLanguageConfig[] = [
  ENGLISH_VOICE_LANGUAGE,
  ...OFFICIAL_INDIAN_VOICE_LANGUAGES,
];

/**
 * Default fallback voice language configuration
 */
export const DEFAULT_VOICE_LANGUAGE: VoiceLanguageConfig = ENGLISH_VOICE_LANGUAGE;

/**
 * Resolve a VoiceLanguageConfig by id, code, ttsLocale, or sttLocale.
 */
export function resolveVoiceLanguage(identifier?: string | null): VoiceLanguageConfig {
  if (!identifier) return DEFAULT_VOICE_LANGUAGE;

  const normalized = identifier.toLowerCase().trim().replace('_', '-');

  // 1. Direct id match (e.g. 'hi', 'te', 'en')
  const byId = ALL_VOICE_LANGUAGES.find((lang) => lang.id.toLowerCase() === normalized);
  if (byId) return byId;

  // 2. Direct ttsLocale or sttLocale match (e.g. 'hi-in', 'te-in')
  const byLocale = ALL_VOICE_LANGUAGES.find(
    (lang) =>
      lang.ttsLocale.toLowerCase() === normalized ||
      lang.sttLocale.toLowerCase() === normalized
  );
  if (byLocale) return byLocale;

  // 3. Language code prefix match (e.g. 'hi-latn' -> 'hi')
  const baseCode = normalized.split('-')[0];
  const byCode = ALL_VOICE_LANGUAGES.find((lang) => lang.code.toLowerCase() === baseCode);
  if (byCode) return byCode;

  // 4. By Display Name match
  const byName = ALL_VOICE_LANGUAGES.find(
    (lang) => lang.displayName.toLowerCase() === normalized
  );
  if (byName) return byName;

  return DEFAULT_VOICE_LANGUAGE;
}

/**
 * Get the TTS BCP-47 locale for a given language id, code, or locale string.
 */
export function getTTSLocale(identifier?: string | null): string {
  return resolveVoiceLanguage(identifier).ttsLocale;
}

/**
 * Get the STT BCP-47 locale for a given language id, code, or locale string.
 */
export function getSTTLocale(identifier?: string | null): string {
  return resolveVoiceLanguage(identifier).sttLocale;
}
