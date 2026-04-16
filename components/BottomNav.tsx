'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CheckSquare, FolderOpen, Settings, Mic } from 'lucide-react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { clsx } from 'clsx';

const navItems = [
  { href: '/', icon: Home, labelKey: 'nav.home' },
  { href: '/tasks', icon: CheckSquare, labelKey: 'nav.tasks' },
  { href: '/topics', icon: FolderOpen, labelKey: 'nav.topics' },
  { href: '/settings', icon: Settings, labelKey: 'nav.settings' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { lang } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--card)] border-t border-[var(--border)] safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex flex-col items-center justify-center w-16 h-full text-xs transition-colors',
                active ? 'text-jarvis-500' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
              <span className="mt-1">{t(lang, labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
