'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { requestNotificationPermission, subscribeToPush, savePushSubscription } from '@/lib/notifications';
import { Globe, Bell, LogOut, User } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

export default function SettingsPage() {
  const { user, loading, supabase, lang, setLang } = useApp();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleLanguageChange = (newLang: 'en' | 'ar') => {
    setLang(newLang);
  };

  const handleNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      const subscription = await subscribeToPush();
      if (subscription) {
        await savePushSubscription(subscription);
      }
      setNotificationsEnabled(true);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-jarvis-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 safe-top">
      <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-xl font-bold">{t(lang, 'settings.title')}</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Account */}
        <div className="rounded-xl bg-[var(--card)] border border-[var(--border)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <p className="text-xs font-medium text-[var(--muted)] uppercase">{t(lang, 'settings.account')}</p>
          </div>
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-jarvis-100 flex items-center justify-center">
              <User size={20} className="text-jarvis-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="rounded-xl bg-[var(--card)] border border-[var(--border)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <p className="text-xs font-medium text-[var(--muted)] uppercase">{t(lang, 'settings.language')}</p>
          </div>
          <div className="p-2 flex gap-2">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
                lang === 'en'
                  ? 'bg-jarvis-500 text-white'
                  : 'bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--border)]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange('ar')}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
                lang === 'ar'
                  ? 'bg-jarvis-500 text-white'
                  : 'bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--border)]'
              }`}
            >
              العربية
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl bg-[var(--card)] border border-[var(--border)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <p className="text-xs font-medium text-[var(--muted)] uppercase">{t(lang, 'settings.notifications')}</p>
          </div>
          <button
            onClick={handleNotifications}
            disabled={notificationsEnabled}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--background)] transition-colors"
          >
            <Bell size={18} className={notificationsEnabled ? 'text-green-500' : 'text-[var(--muted)]'} />
            <span className="text-sm flex-1 text-start">{t(lang, 'settings.enableNotifications')}</span>
            {notificationsEnabled && (
              <span className="text-xs text-green-500 font-medium">ON</span>
            )}
          </button>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full rounded-xl bg-[var(--card)] border border-[var(--border)] px-4 py-3
                     flex items-center gap-3 hover:bg-red-50 transition-colors text-red-500"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">{t(lang, 'settings.signOut')}</span>
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
