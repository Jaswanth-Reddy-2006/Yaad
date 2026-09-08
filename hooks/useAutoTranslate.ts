import { useState, useEffect } from 'react';
import { useAccessibilityStore } from '../store/useAccessibilityStore';
import { containsIndicOrNonLatin } from '../services/voice/VoiceTranslator';
import { TranslationService } from '../services/TranslationService';

// In-memory session cache for translated phrases to prevent duplicate inference
const translationCache = new Map<string, string>();

/**
 * Hook to automatically translate English UI strings or translation keys into
 * the user's selected language using the existing TranslationService.
 */
export function useAutoTranslate(textOrKey: string): string {
  const { currentLanguage, t } = useAccessibilityStore();

  const getInitial = (): string => {
    if (!textOrKey) return '';
    if (currentLanguage === 'en') {
      return t(textOrKey) || textOrKey;
    }
    const cacheKey = `${currentLanguage}:${textOrKey}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }
    const val = t(textOrKey);
    if (val && val !== textOrKey && containsIndicOrNonLatin(val)) {
      return val;
    }
    return val || textOrKey;
  };

  const [translated, setTranslated] = useState<string>(getInitial);

  useEffect(() => {
    let isMounted = true;
    if (!textOrKey) {
      setTranslated('');
      return;
    }

    if (currentLanguage === 'en') {
      setTranslated(t(textOrKey) || textOrKey);
      return;
    }

    const cacheKey = `${currentLanguage}:${textOrKey}`;
    if (translationCache.has(cacheKey)) {
      setTranslated(translationCache.get(cacheKey)!);
      return;
    }

    const val = t(textOrKey);
    if (val && val !== textOrKey && containsIndicOrNonLatin(val)) {
      setTranslated(val);
      translationCache.set(cacheKey, val);
      return;
    }

    const sourceText = val || textOrKey;
    // Call the existing language translator
    TranslationService.translate(sourceText, 'en', currentLanguage)
      .then((result) => {
        if (isMounted && result && result.trim()) {
          translationCache.set(cacheKey, result);
          setTranslated(result);
        }
      })
      .catch((err) => {
        console.warn('[useAutoTranslate] TranslationService failed for:', textOrKey, err);
      });

    return () => {
      isMounted = false;
    };
  }, [textOrKey, currentLanguage, t]);

  return translated;
}
