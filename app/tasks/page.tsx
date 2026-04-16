'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { getTasks, updateTask, deleteTask } from '@/lib/queries';
import TaskList from '@/components/TaskList';
import ShareButton from '@/components/ShareButton';
import BottomNav from '@/components/BottomNav';
import type { Task } from '@/lib/types';

export default function TasksPage() {
  const { user, loading, supabase, lang } = useApp();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    getTasks(supabase, user.id).then(setTasks).catch(console.error);
  }, [user, supabase]);

  const handleUpdate = async (id: string, updates: Partial<Task>) => {
    try {
      const updated = await updateTask(supabase, id, updates);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(supabase, id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
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
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">{t(lang, 'nav.tasks')}</h1>
          <ShareButton tasks={tasks.filter((t) => t.status !== 'completed')} />
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
