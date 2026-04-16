'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { getTasks, getTopics, updateTask, deleteTask } from '@/lib/queries';
import { ArrowLeft } from 'lucide-react';
import TaskList from '@/components/TaskList';
import ShareButton from '@/components/ShareButton';
import BottomNav from '@/components/BottomNav';
import type { Task, Topic } from '@/lib/types';

export default function TopicDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading, supabase, lang } = useApp();
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;

    const load = async () => {
      try {
        const [topicsData, tasksData] = await Promise.all([
          getTopics(supabase, user.id),
          getTasks(supabase, user.id, { topicId: id }),
        ]);
        const found = topicsData.find((t) => t.id === id);
        setTopic(found || null);
        setTasks(tasksData);
      } catch (err) {
        console.error('Failed to load:', err);
      }
    };
    load();
  }, [user, supabase, id]);

  const handleUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updated = await updateTask(supabase, taskId, updates);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(supabase, taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
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
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 rounded-lg hover:bg-[var(--background)]">
            <ArrowLeft size={20} className="rtl:rotate-180" />
          </button>
          <div className="flex-1 flex items-center gap-2">
            {topic && (
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: topic.color }} />
            )}
            <h1 className="text-lg font-bold truncate">{topic?.name || '...'}</h1>
          </div>
          <ShareButton tasks={tasks.filter((t) => t.status !== 'completed')} topicName={topic?.name} />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <TaskList
          tasks={tasks}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </main>

      <BottomNav />
    </div>
  );
}
