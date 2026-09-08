import { TRANSLATIONS, LanguageCode, getTranslation } from '../../constants/translations';

export type VoiceCategory =
  | 'WELCOME'
  | 'MATCH_PRAISE'
  | 'MISMATCH_GENTLE'
  | 'PAIR_INSTRUCTION'
  | 'TRIPLET_INSTRUCTION'
  | 'HINT_PAIR'
  | 'HINT_TRIPLET'
  | 'COMPLETION_PAIR'
  | 'COMPLETION_TRIPLET';

const CATEGORY_KEYS: Record<VoiceCategory, string[]> = {
  WELCOME: [
    'welcome_yaad',
    'welcome_msg_1',
    'welcome_msg_2',
    'welcome_msg_3',
    'welcome_msg_4',
    'welcome_msg_5',
  ],
  MATCH_PRAISE: [
    'match_enc_1',
    'match_enc_2',
    'match_enc_3',
    'match_enc_4',
    'match_enc_5',
  ],
  MISMATCH_GENTLE: [
    'mismatch_gentle_1',
    'mismatch_gentle_2',
    'mismatch_gentle_3',
  ],
  PAIR_INSTRUCTION: [
    'pair_inst_1',
    'pair_inst_2',
    'pair_inst_3',
  ],
  TRIPLET_INSTRUCTION: [
    'triplet_inst_1',
    'triplet_inst_2',
    'triplet_inst_3',
  ],
  HINT_PAIR: ['hint_pair_1'],
  HINT_TRIPLET: ['hint_triplet_1'],
  COMPLETION_PAIR: ['completion_pair_1'],
  COMPLETION_TRIPLET: ['completion_triplet_1'],
};

export class VoiceContentResolver {
  private lastSelectedKeys: Map<VoiceCategory, string> = new Map();

  /**
   * Resolves text for a given translation key in specified language code (or fallback to English).
   */
  public getText(key: string, languageCode: string = 'en'): string {
    const lang = (languageCode || 'en').toLowerCase().split('-')[0] as LanguageCode;
    return getTranslation(key, lang);
  }

  /**
   * Selects a random key from a category pool, ensuring it doesn't repeat the immediately preceding selection if pool > 1.
   */
  public getRandomKey(category: VoiceCategory): string {
    const pool = CATEGORY_KEYS[category];
    if (!pool || pool.length === 0) return '';
    if (pool.length === 1) return pool[0];

    const lastKey = this.lastSelectedKeys.get(category);
    const available = pool.filter((k) => k !== lastKey);
    const randomIndex = Math.floor(Math.random() * available.length);
    const selectedKey = available[randomIndex];

    this.lastSelectedKeys.set(category, selectedKey);
    return selectedKey;
  }

  /**
   * Resolves a randomized, non-repeating localized text phrase for a category.
   */
  public getRandomPhrase(category: VoiceCategory, languageCode: string = 'en'): { key: string; text: string } {
    const key = this.getRandomKey(category);
    const text = this.getText(key, languageCode);
    return { key, text };
  }
}

export const voiceContentResolver = new VoiceContentResolver();
