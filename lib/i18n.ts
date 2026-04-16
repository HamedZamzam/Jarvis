import en from '@/messages/en.json';
import ar from '@/messages/ar.json';

export type Language = 'en' | 'ar';

const messages: Record<Language, typeof en> = { en, ar };

// Get a nested value from translations using dot notation
export function t(lang: Language, key: string): string {
  const keys = key.split('.');
  let result: unknown = messages[lang];
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = (result as Record<string, unknown>)[k];
    } else {
      return key; // fallback to key if not found
    }
  }
  return typeof result === 'string' ? result : key;
}

export function getDirection(lang: Language): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}
