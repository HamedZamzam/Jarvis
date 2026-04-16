'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createClient } from './supabase';
import { Language, getDirection } from './i18n';
import type { User, SupabaseClient } from '@supabase/supabase-js';

interface AppContextValue {
  user: User | null;
  loading: boolean;
  lang: Language;
  dir: 'ltr' | 'rtl';
  setLang: (lang: Language) => void;
  supabase: SupabaseClient;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLangState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  // Only run client-side effects after mount
  useEffect(() => {
    setMounted(true);

    // Load saved language
    try {
      const saved = localStorage.getItem('jarvis-lang') as Language | null;
      if (saved === 'en' || saved === 'ar') {
        setLangState(saved);
        document.documentElement.dir = getDirection(saved);
        document.documentElement.lang = saved;
      }
    } catch {}

    // Get initial user
    supabase.auth.getUser()
      .then(({ data }) => {
        setUser(data.user);
      })
      .catch(() => {})
      .finally(() => {
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
    if (mounted && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, [mounted]);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('jarvis-lang', newLang);
      document.documentElement.dir = getDirection(newLang);
      document.documentElement.lang = newLang;
    } catch {}
  }, []);

  const dir = getDirection(lang);

  // Don't render children until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

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
