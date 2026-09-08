import { TRANSLATIONS, LanguageCode, getTranslation } from '../../constants/translations';

/**
 * Normalizes string for fuzzy dictionary lookup.
 */
function normalizeString(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'!’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a string contains non-Latin scripts (Devanagari, Bengali, Telugu, Tamil, Arabic, Gurmukhi, Gujarati, etc.)
 */
export function containsIndicOrNonLatin(str: string): boolean {
  // Unicode blocks for Indian scripts & Arabic
  return /[\u0900-\u0D7F\u0600-\u06FF\u1C50-\u1C7F]/.test(str);
}

class VoiceTranslator {
  private reverseEnglishMap: Map<string, string> = new Map();

  constructor() {
    this.buildReverseMap();
  }

  private buildReverseMap(): void {
    const enDict = TRANSLATIONS.en || {};
    for (const [key, value] of Object.entries(enDict)) {
      if (typeof value === 'string' && value.trim()) {
        const norm = normalizeString(value);
        if (norm && !this.reverseEnglishMap.has(norm)) {
          this.reverseEnglishMap.set(norm, key);
        }
      }
    }

    // Explicit manual mappings for common voice utterances in the app
    const manualMappings: Record<string, string> = {
      [normalizeString("welcome_yaad")]: 'welcome_yaad',
      [normalizeString("Hi, I'm Yaad. I'm your memory recall assistant who helps you improve your memory, remember things, and connect with your caregivers and family.")]: 'welcome_yaad',
      [normalizeString("Hi, I'm Yaad. I'm your memory recall assistant.")]: 'welcome_yaad',
      [normalizeString("Welcome to MitraCare. I am here to help you with your day.")]: 'welcome_yaad',
      [normalizeString("Your turn! Tap the tiles in order.")]: 'your_turn_tap_order',
      [normalizeString("Excellent! Well done!")]: 'match_enc_1',
      [normalizeString("Oops, try again!")]: 'oops_try_again',
      [normalizeString("That's right! Great job!")]: 'match_enc_2',
      [normalizeString("Not quite. Listen to the sound again and tap the right animal.")]: 'sound_wrong_animal',
      [normalizeString("Look at the ball! Watch it get covered.")]: 'watch_star_covered',
      [normalizeString("Look at the star! Watch it get covered.")]: 'watch_star_covered',
      [normalizeString("Follow the glass as it moves!")]: 'follow_glass_moving',
      [normalizeString("Where is the ball? Tap the glass to guess!")]: 'where_is_ball_guess',
      [normalizeString("Where is the star? Tap the glass to guess!")]: 'where_is_ball_guess',
      [normalizeString("You found the ball! Wonderful focus!")]: 'found_ball_great',
      [normalizeString("Not under this glass. Look where it was!")]: 'not_under_glass',
      [normalizeString("Look at the living room! Remember where each item is placed.")]: 'remember_object_placements',
      [normalizeString("Where was this item located? Tap the spot on the room picture.")]: 'where_item_located',
      [normalizeString("Where was this item located?")]: 'where_was_the_item',
      [normalizeString("Not here! Try another spot on the picture.")]: 'not_here_try_another',
      [normalizeString("Wrong picture, try again!")]: 'wrong_picture_try_again',
      [normalizeString("Watch closely! Count the sheep as they walk into the barn from the right.")]: 'sheep_walk_enter',
      [normalizeString("Look! Some sheep are leaving the barn to the left.")]: 'sheep_walk_leave',
      [normalizeString("How many sheep went into the barn? Tap your answer!")]: 'tap_how_many_sheep_left',
      [normalizeString("How many sheep are left inside the barn? Tap your answer!")]: 'how_many_sheep_left_inside',
      [normalizeString("That's okay, let's take another look or try again!")]: 'mismatch_gentle_1',
    };

    for (const [norm, key] of Object.entries(manualMappings)) {
      this.reverseEnglishMap.set(norm, key);
    }
  }

  /**
   * Translates an English voice string or translation key into the target language.
   * If the string is already translated into a non-Latin script, it is preserved.
   */
  public translateVoiceText(text: string, targetLanguageCode: string = 'en'): string {
    if (!text || typeof text !== 'string') return '';
    const lang = (targetLanguageCode || 'en').toLowerCase().split('-')[0] as LanguageCode;

    // If target is English, return original
    if (lang === 'en') {
      // If it's a key, return English translation of the key
      if (TRANSLATIONS.en[text]) {
        return TRANSLATIONS.en[text];
      }
      return text;
    }

    // If text already contains non-Latin scripts (e.g. Hindi, Telugu, Tamil, Bengali), it is already localized
    if (containsIndicOrNonLatin(text)) {
      return text;
    }

    // 1. Direct translation key match
    if (TRANSLATIONS[lang]?.[text] || TRANSLATIONS.en?.[text]) {
      return getTranslation(text, lang);
    }

    // 2. Exact or normalized English string reverse lookup
    const norm = normalizeString(text);
    const mappedKey = this.reverseEnglishMap.get(norm);
    if (mappedKey) {
      return getTranslation(mappedKey, lang);
    }

    // 3. Dynamic patterns check
    // "That's right! The {animal} made that sound."
    if (norm.includes("thats right") && norm.includes("made that sound")) {
      return getTranslation('sound_correct_animal', lang);
    }
    // "That's right! It is {object}."
    if (norm.includes("thats right") && norm.includes("it is")) {
      return `${getTranslation('match_enc_1', lang)}`;
    }
    // "Not quite. Look at the picture and try again!"
    if (norm.includes("not quite") || norm.includes("try again")) {
      return getTranslation('mismatch_gentle_1', lang);
    }
    // "Remember the routine sequence"
    if (norm.includes("remember the routine sequence")) {
      return getTranslation('memorize_routine_order', lang);
    }
    // "What is the 1st activity in the routine?"
    if (norm.includes("activity in the routine")) {
      return getTranslation('memorize_routine_order', lang);
    }
    // "Color Sequence. Watch the tiles light up..."
    if (norm.includes("color sequence") && norm.includes("light up")) {
      return `${getTranslation('color_sequence', lang)}. ${getTranslation('color_sequence_desc', lang)}`;
    }

    // Fallback: If no translation is found, return original English text
    return text;
  }

  /**
   * Translates text into target language using existing TranslationService.
   */
  public async translate(text: string, targetLanguageCode: string = 'en'): Promise<string> {
    if (!text || typeof text !== 'string') return '';
    const lang = (targetLanguageCode || 'en').toLowerCase().split('-')[0] as LanguageCode;
    if (lang === 'en') {
      if (TRANSLATIONS.en?.[text]) return TRANSLATIONS.en[text];
      return text;
    }

    if (containsIndicOrNonLatin(text)) {
      return text;
    }

    const quickResult = this.translateVoiceText(text, lang);
    if (quickResult && quickResult !== text && containsIndicOrNonLatin(quickResult)) {
      return quickResult;
    }

    // Use the existing offline language translator (TranslationService)
    try {
      const { TranslationService } = require('../TranslationService');
      const translated = await TranslationService.translate(text, 'en', lang);
      if (translated && translated.trim() && translated !== text) {
        return translated;
      }
    } catch (err) {
      console.warn('[VoiceTranslator] TranslationService error:', err);
    }

    return quickResult || text;
  }
}

export const voiceTranslator = new VoiceTranslator();
