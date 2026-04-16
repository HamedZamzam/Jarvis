'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { getTopics, createTopic, deleteTopic, getTasks } from '@/lib/queries';
import { FolderOpen, Plus, Trash2, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import type { Topic, Task } from '@/lib/types';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function TopicsPage() {
  const { user, loading, supabase, lang } = useApp();
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [topicsData, tasksData] = await Promise.all([
        getTopics(supabase, user.id),
        getTasks(supabase, user.id),
      ]);
      setTopics(topicsData);

      // Count pending tasks per topic
      const counts: Record<string, number> = {};
      tasksData.forEach((task) => {
        if (task.topic_id && task.status !== 'completed') {
          counts[task.topic_id] = (counts[task.topic_id] || 0) + 1;
        }
      });
      setTaskCounts(counts);
    } catch (err) {
      console.error('Failed to load:', err);
    }
  };

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    try {
      const topic = await createTopic(supabase, user.id, newName.trim(), selectedColor);
      setTopics((prev) => [topic, ...prev]);
      setNewName('');
      setShowCreate(false);
    } catch (err) {
      console.error('Failed to create topic:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTopic(supabase, id);
      setTopics((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete topic:', err);
    }
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
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">{t(lang, 'topic.title')}</h1>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="p-2 rounded-lg text-jarvis-500 hover:bg-jarvis-50 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Create form */}
        {showCreate && (
          <div className="mb-4 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder={t(lang, 'topic.name')}
              className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)]
                         focus:outline-none focus:ring-2 focus:ring-jarvis-500 text-sm mb-3"
            />
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-[var(--muted)]">{t(lang, 'topic.color')}:</span>
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full transition-transform ${selectedColor === color ? 'scale-125 ring-2 ring-offset-2 ring-[var(--border)]' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreate(false)}
                className="px-3 py-1.5 text-sm rounded-lg text-[var(--muted)]"
              >
                {t(lang, 'common.cancel')}
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-1.5 text-sm rounded-lg bg-jarvis-500 text-white hover:bg-jarvis-600"
              >
                {t(lang, 'common.save')}
              </button>
            </div>
          </div>
        )}

        {/* Topic list */}
        {topics.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen size={48} className="text-[var(--muted)] mx-auto mb-3 opacity-40" />
            <p className="text-[var(--muted)] text-sm">{t(lang, 'topic.noTopics')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="flex items-center rounded-xl bg-[var(--card)] border border-[var(--border)] overflow-hidden"
              >
                <Link
                  href={`/topics/${topic.id}`}
                  className="flex-1 flex items-center gap-3 p-4 hover:bg-[var(--background)] transition-colors"
                >
                  <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: topic.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{topic.name}</p>
                    {taskCounts[topic.id] > 0 && (
                      <p className="text-xs text-[var(--muted)]">
                        {taskCounts[topic.id]} {t(lang, 'task.pending').toLowerCase()}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-[var(--muted)] rtl:rotate-180" />
                </Link>
                <button
                  onClick={() => handleDelete(topic.id)}
                  className="p-4 text-[var(--muted)] hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
