'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from './supabase';
import { Language, getDirection } from './i18n';
import type { User } from '@supabase/supabase-js';

interface AppContextValue {
  user: User | null;
  loading: boolean;
  lang: Language;
  dir: 'ltr' | 'rtl';
  setLang: (lang: Language) => void;
  supabase: ReturnType<typeof createClient>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    // Load saved language
    const saved = localStorage.getItem('jarvis-lang') as Language | null;
    if (saved && (saved === 'en' || saved === 'ar')) {
      setLangState(saved);
      document.documentElement.dir = getDirection(saved);
      document.documentElement.lang = saved;
    }

    // Get initial user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('jarvis-lang', newLang);
    document.documentElement.dir = getDirection(newLang);
    document.documentElement.lang = newLang;
  };

  const dir = getDirection(lang);

  return (
    <AppContext.Provider value={{ user, loading, lang, dir, setLang, supabase }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
