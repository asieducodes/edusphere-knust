/**
 * EduSphere — context/LanguageContext.tsx
 * -----------------------------------------------------------------------
 * Drives English/Français/Español across the whole app. t() takes a
 * dot-path into the active dictionary (e.g. t('groupDetails.joinGroup'))
 * plus optional {placeholder} values, and always falls back to the
 * English string if a key is somehow missing at runtime rather than
 * throwing — a translation gap should degrade to English, not crash.
 * -----------------------------------------------------------------------
 */

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import en, { TranslationDictionary } from '../i18n/en';
import fr from '../i18n/fr';
import es from '../i18n/es';
import { getStoredLanguage, setStoredLanguage } from '../services/preferencesStorage';

export type Language = 'en' | 'fr' | 'es';

const DICTIONARIES: Record<Language, TranslationDictionary> = { en, fr, es };

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
};

type TranslateOptions = Record<string, string | number>;

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (path: string, options?: TranslateOptions) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function isLanguage(value: string | null): value is Language {
  return value === 'en' || value === 'fr' || value === 'es';
}

function lookup(dict: TranslationDictionary, path: string): string | undefined {
  const value = path.split('.').reduce<unknown>((node, key) => {
    if (node && typeof node === 'object' && key in node) {
      return (node as Record<string, unknown>)[key];
    }
    return undefined;
  }, dict);
  return typeof value === 'string' ? value : undefined;
}

function interpolate(template: string, options?: TranslateOptions): string {
  if (!options) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = options[key];
    return value !== undefined ? String(value) : match;
  });
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    (async () => {
      const stored = await getStoredLanguage();
      if (isLanguage(stored)) setLanguageState(stored);
    })();
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    setStoredLanguage(next).catch(() => undefined);
  }, []);

  const t = useCallback(
    (path: string, options?: TranslateOptions) => {
      const dict = DICTIONARIES[language];
      const value = lookup(dict, path) ?? lookup(en, path) ?? path;
      return interpolate(value, options);
    },
    [language]
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
