'use client';

import { useState } from 'react';
import { Share2, MessageCircle, Copy, Check, ExternalLink } from 'lucide-react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { shareViaWhatsApp, copyToClipboard, shareNative } from '@/lib/sharing';
import type { Task } from '@/lib/types';

interface ShareButtonProps {
  tasks: Task[];
  topicName?: string;
}

export default function ShareButton({ tasks, topicName }: ShareButtonProps) {
  const { lang } = useApp();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (tasks.length === 0) return null;

  const handleCopy = async () => {
    const success = await copyToClipboard(tasks, topicName);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setOpen(false);
  };

  const handleWhatsApp = () => {
    shareViaWhatsApp(tasks, topicName);
    setOpen(false);
  };

  const handleNativeShare = async () => {
    await shareNative(tasks, topicName);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-[var(--muted)] hover:text-jarvis-500 hover:bg-jarvis-50 transition-colors"
      >
        <Share2 size={20} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 end-0 z-50 w-48 bg-[var(--card)] border border-[var(--border)]
                          rounded-xl shadow-lg overflow-hidden">
            <button
              onClick={handleWhatsApp}
              className="w-full text-start px-4 py-2.5 text-sm hover:bg-[var(--background)] transition-colors
                         flex items-center gap-2"
            >
              <MessageCircle size={16} className="text-green-500" />
              {t(lang, 'share.whatsapp')}
            </button>
            <button
              onClick={handleCopy}
              className="w-full text-start px-4 py-2.5 text-sm hover:bg-[var(--background)] transition-colors
                         flex items-center gap-2"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-[var(--muted)]" />}
              {copied ? t(lang, 'share.copied') : t(lang, 'share.copy')}
            </button>
            {'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full text-start px-4 py-2.5 text-sm hover:bg-[var(--background)] transition-colors
                           flex items-center gap-2"
              >
                <ExternalLink size={16} className="text-[var(--muted)]" />
                {t(lang, 'share.share')}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
