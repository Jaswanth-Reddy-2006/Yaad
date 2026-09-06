import { FLORES_TO_ISO, LANGUAGE_TAGS } from './tokenizer/languageCodes';
import { TranslationDirection } from './types';

/**
 * Maps short ISO/MitraCare 2-letter and 3-letter codes to FLORES-200 tags.
 */
export const SHORT_TO_FLORES: Record<string, string> = {
  en: 'eng_Latn',
  hi: 'hin_Deva',
  te: 'tel_Telu',
  ta: 'tam_Taml',
  kn: 'kan_Knda',
  bn: 'ben_Beng',
  gu: 'guj_Gujr',
  mr: 'mar_Deva',
  ml: 'mal_Mlym',
  pa: 'pan_Guru',
  or: 'ory_Orya',
  as: 'asm_Beng',
  ur: 'urd_Arab',
  sd: 'snd_Deva',
  ks: 'kas_Arab',
  kok: 'gom_Deva',
  mai: 'mai_Deva',
  ne: 'npi_Deva',
  doi: 'doi_Deva',
  brx: 'brx_Deva',
  mni: 'mni_Mtei',
  sat: 'sat_Olck',
  sa: 'san_Deva',
};

/**
 * Normalizes any language code (short or FLORES-200) to standard FLORES-200 tag.
 */
export function normalizeLanguageCode(code: string): string {
  if (!code) return 'hin_Deva';
  const trimmed = code.trim();
  if (LANGUAGE_TAGS.has(trimmed)) {
    return trimmed;
  }
  const lower = trimmed.toLowerCase();
  if (SHORT_TO_FLORES[lower]) {
    return SHORT_TO_FLORES[lower];
  }
  throw new Error(`Unsupported or unknown language code: "${code}"`);
}

/**
 * Determines translation direction from source and target FLORES codes.
 */
export function getTranslationDirection(
  srcFlores: string,
  tgtFlores: string
): { direction: TranslationDirection; isIdentity: boolean } {
  if (srcFlores === tgtFlores) {
    return { direction: 'indic-en', isIdentity: true };
  }

  if (srcFlores === 'eng_Latn') {
    return { direction: 'en-indic', isIdentity: false };
  } else if (tgtFlores === 'eng_Latn') {
    return { direction: 'indic-en', isIdentity: false };
  } else {
    // Indic -> Indic directly is not in single model architecture
    // Note: Pivot translation Indic -> English -> Indic can be performed if needed
    throw new Error(
      `Direct Indic -> Indic (${srcFlores} -> ${tgtFlores}) is not supported directly in single-step model. A pivot through English (Indic -> eng_Latn -> Indic) is required.`
    );
  }
}
