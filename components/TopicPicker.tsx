'use client';

import { useState } from 'react';
import { ChevronDown, FolderOpen, Plus } from 'lucide-react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { clsx } from 'clsx';
import type { Topic } from '@/lib/types';

interface TopicPickerProps {
  topics: Topic[];
  selectedId: string | null;
  onSelect: (topicId: string | null) => void;
  onCreateTopic: (name: string) => void;
}

export default function TopicPicker({ topics, selectedId, onSelect, onCreateTopic }: TopicPickerProps) {
  const { lang } = useApp();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const selected = topics.find((t) => t.id === selectedId);

  const handleCreate = () => {
    if (newName.trim()) {
      onCreateTopic(newName.trim());
      setNewName('');
      setCreating(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)]
                   hover:border-jarvis-300 transition-colors text-sm"
      >
        <FolderOpen size={16} className="text-[var(--muted)]" />
        <span>{selected?.name || t(lang, 'topic.general')}</span>
        <ChevronDown size={14} className={clsx('text-[var(--muted)] transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 start-0 z-50 w-56 bg-[var(--card)] border border-[var(--border)]
                          rounded-xl shadow-lg overflow-hidden">
            {/* General (no topic) */}
            <button
              onClick={() => { onSelect(null); setOpen(false); }}
              className={clsx(
                'w-full text-start px-4 py-2.5 text-sm hover:bg-[var(--background)] transition-colors',
                !selectedId && 'bg-jarvis-50 text-jarvis-600 font-medium'
              )}
            >
              {t(lang, 'topic.general')}
            </button>

            {/* Topic list */}
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => { onSelect(topic.id); setOpen(false); }}
                className={clsx(
                  'w-full text-start px-4 py-2.5 text-sm hover:bg-[var(--background)] transition-colors flex items-center gap-2',
                  selectedId === topic.id && 'bg-jarvis-50 text-jarvis-600 font-medium'
                )}
              >
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: topic.color }} />
                {topic.name}
              </button>
            ))}

            {/* Create new */}
            {creating ? (
              <div className="p-2 border-t border-[var(--border)]">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder={t(lang, 'topic.name')}
                  className="w-full px-3 py-1.5 text-sm rounded-lg bg-[var(--background)] border border-[var(--border)]
                             focus:outline-none focus:ring-2 focus:ring-jarvis-500"
                />
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="w-full text-start px-4 py-2.5 text-sm text-jarvis-500 hover:bg-[var(--background)]
                           transition-colors flex items-center gap-2 border-t border-[var(--border)]"
              >
                <Plus size={14} />
                {t(lang, 'topic.create')}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
