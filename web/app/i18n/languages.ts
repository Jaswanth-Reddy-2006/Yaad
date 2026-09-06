export type LanguageCode =
  | 'en' // English
  | 'as' // Assamese (অসমীয়া)
  | 'bn' // Bengali (বাংলা)
  | 'brx' // Bodo (बड़ो)
  | 'doi' // Dogri (डोगरी)
  | 'gu' // Gujarati (ગુજરાતી)
  | 'hi' // Hindi (हिन्दी)
  | 'kn' // Kannada (ಕನ್ನಡ)
  | 'ks' // Kashmiri (کٲشُر / कश्मीरी)
  | 'kok' // Konkani (कोंकणी)
  | 'mai' // Maithili (मैथिली)
  | 'ml' // Malayalam (മലയാളം)
  | 'mni' // Manipuri (মৈতৈলোন্)
  | 'mr' // Marathi (मराठी)
  | 'ne' // Nepali (नेपाली)
  | 'or' // Odia (ଓଡ଼ିଆ)
  | 'pa' // Punjabi (ਪੰਜਾਬੀ)
  | 'sa' // Sanskrit (संस्कृतम्)
  | 'sat' // Santali (ᱥᱟᱱᱛᱟᱲᱤ)
  | 'sd' // Sindhi (سنڌي)
  | 'ta' // Tamil (தமிழ்)
  | 'te' // Telugu (తెలుగు)
  | 'ur'; // Urdu (اردو)

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  script?: string;
  isRTL?: boolean;
}

export const RTL_LANGUAGES: LanguageCode[] = ['ur', 'sd', 'ks'];

export function isRTLLanguage(lang: LanguageCode): boolean {
  return RTL_LANGUAGES.includes(lang);
}

export const INDIAN_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', isRTL: false },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali-Assamese', isRTL: false },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', isRTL: false },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', script: 'Devanagari', isRTL: false },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', script: 'Devanagari', isRTL: false },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', isRTL: false },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', isRTL: false },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', isRTL: false },
  { code: 'ks', name: 'Kashmiri', nativeName: 'کٲشُر', script: 'Perso-Arabic / Devanagari', isRTL: true },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', script: 'Devanagari', isRTL: false },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', script: 'Devanagari', isRTL: false },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', isRTL: false },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', script: 'Meetei Mayek / Bengali', isRTL: false },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', isRTL: false },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', script: 'Devanagari', isRTL: false },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', isRTL: false },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', isRTL: false },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Devanagari', isRTL: false },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'Ol Chiki', isRTL: false },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', script: 'Perso-Arabic / Devanagari', isRTL: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', isRTL: false },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', isRTL: false },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'Perso-Arabic (Nastaliq)', isRTL: true },
];
