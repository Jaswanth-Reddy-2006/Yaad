/**
 * Language codes and script mappings for IndicTrans2.
 * Maps Flores-200 language-script codes to ISO 639 codes and Unicode script offsets.
 */

export const FLORES_TO_ISO: Record<string, string> = {
  asm_Beng: 'as',
  awa_Deva: 'hi',
  ben_Beng: 'bn',
  bho_Deva: 'hi',
  brx_Deva: 'hi',
  doi_Deva: 'hi',
  eng_Latn: 'en',
  gom_Deva: 'kK',
  gon_Deva: 'hi',
  guj_Gujr: 'gu',
  hin_Deva: 'hi',
  hne_Deva: 'hi',
  kan_Knda: 'kn',
  kas_Arab: 'ur',
  kas_Deva: 'hi',
  kha_Latn: 'en',
  lus_Latn: 'en',
  mag_Deva: 'hi',
  mai_Deva: 'hi',
  mal_Mlym: 'ml',
  mar_Deva: 'mr',
  mni_Beng: 'bn',
  mni_Mtei: 'hi',
  npi_Deva: 'ne',
  ory_Orya: 'or',
  pan_Guru: 'pa',
  san_Deva: 'hi',
  sat_Olck: 'or',
  snd_Arab: 'ur',
  snd_Deva: 'hi',
  tam_Taml: 'ta',
  tel_Telu: 'te',
  urd_Arab: 'ur',
  unr_Deva: 'hi',
};

export const SCRIPT_RANGES: Record<string, [number, number]> = {
  pa: [0x0a00, 0x0a7f], // Gurmukhi (Punjabi)
  gu: [0x0a80, 0x0aff], // Gujarati
  or: [0x0b00, 0x0b7f], // Oriya
  ta: [0x0b80, 0x0bff], // Tamil
  te: [0x0c00, 0x0c7f], // Telugu
  kn: [0x0c80, 0x0cff], // Kannada
  ml: [0x0d00, 0x0d7f], // Malayalam
  si: [0x0d80, 0x0dff], // Sinhala
  hi: [0x0900, 0x097f], // Devanagari (Hindi)
  mr: [0x0900, 0x097f], // Devanagari (Marathi)
  kK: [0x0900, 0x097f], // Devanagari (Konkani)
  sa: [0x0900, 0x097f], // Devanagari (Sanskrit)
  ne: [0x0900, 0x097f], // Devanagari (Nepali)
  sd: [0x0900, 0x097f], // Devanagari (Sindhi)
  bn: [0x0980, 0x09ff], // Bengali
  as: [0x0980, 0x09ff], // Assamese
};

export const COORDINATED_RANGE_START_INCLUSIVE = 0x00;
export const COORDINATED_RANGE_END_INCLUSIVE = 0x6f;

export const NON_TRANSLITERATE_SCRIPTS = new Set([
  'Arab',
  'Aran',
  'Olck',
  'Mtei',
  'Latn',
]);

export const LANGUAGE_TAGS = new Set(Object.keys(FLORES_TO_ISO));
