'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LanguageCode, INDIAN_LANGUAGES, isRTLLanguage, RTL_LANGUAGES } from '../i18n/languages';
import { getTranslation } from '../i18n/translations';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (path: string, fallback?: string) => string;
  isRTL: boolean;
  translateDynamic: (text: string, sourceLang?: LanguageCode, targetLang?: LanguageCode) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'mitracare-language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<LanguageCode>('en');
  const [isMounted, setIsMounted] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (savedLang && INDIAN_LANGUAGES.some(l => l.code === savedLang)) {
        setCurrentLanguageState(savedLang);
        applyDirectionAndLang(savedLang);
      } else {
        applyDirectionAndLang('en');
      }
    } catch (e) {
      applyDirectionAndLang('en');
    }
  }, []);

  const applyDirectionAndLang = (lang: LanguageCode) => {
    if (typeof document !== 'undefined') {
      const rtl = isRTLLanguage(lang);
      document.documentElement.dir = rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  };

  const setLanguage = useCallback((lang: LanguageCode) => {
    setCurrentLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Could not save language to localStorage:', e);
    }
    applyDirectionAndLang(lang);
  }, []);

  const t = useCallback((path: string, fallback?: string): string => {
    return getTranslation(currentLanguage, path, fallback);
  }, [currentLanguage]);

  const isRTL = isRTLLanguage(currentLanguage);

  const translateDynamic = useCallback(async (
    text: string,
    sourceLang: LanguageCode = 'en',
    targetLang: LanguageCode = currentLanguage
  ): Promise<string> => {
    if (!text || !text.trim() || sourceLang === targetLang) {
      return text;
    }

    const cacheKey = `mitracare-translation:${sourceLang}:${targetLang}:${text.trim()}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return cached;
    } catch (e) {
      // Ignore localStorage error
    }

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          source_language: sourceLang,
          target_language: targetLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const translated = data.translated_text || text;
        try {
          localStorage.setItem(cacheKey, translated);
        } catch (e) {
          // Ignore cache full error
        }
        return translated;
      }
    } catch (err) {
      console.warn('Dynamic translation API error:', err);
    }

    // Return original text fallback if translation fails
    return text;
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, isRTL, translateDynamic }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
