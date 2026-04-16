'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { getTasks, getTopics, createTopic, createEntry, bulkCreateTasks, updateTask, deleteTask } from '@/lib/queries';
import RecordButton from '@/components/RecordButton';
import TaskList from '@/components/TaskList';
import TopicPicker from '@/components/TopicPicker';
import ShareButton from '@/components/ShareButton';
import BottomNav from '@/components/BottomNav';
import type { Task, Topic, ExtractedTask } from '@/lib/types';

export default function HomePage() {
  const { user, loading, supabase, lang } = useApp();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  // Load data
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
      setTasks(tasksData);
      // Show last 10 tasks
      setRecentTasks(tasksData.slice(0, 10));
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  const handleTasksExtracted = useCallback(async (extracted: ExtractedTask[], transcript: string) => {
    if (!user) return;

    try {
      // Create entry
      const entry = await createEntry(
        supabase,
        user.id,
        selectedTopicId || '',
        transcript,
        lang
      );

      // Create tasks
      const taskRows = extracted.map((et) => ({
        user_id: user.id,
        entry_id: entry.id,
        topic_id: selectedTopicId || undefined,
        title: et.title,
        description: et.description,
        assignee: et.assignee,
        due_date: et.due_date,
      }));

      const newTasks = await bulkCreateTasks(supabase, taskRows);
      setTasks((prev) => [...newTasks, ...prev]);
      setRecentTasks((prev) => [...newTasks, ...prev].slice(0, 10));
    } catch (err) {
      console.error('Failed to save tasks:', err);
    }
  }, [user, supabase, selectedTopicId, lang]);

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updated = await updateTask(supabase, id, updates);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setRecentTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(supabase, id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setRecentTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleCreateTopic = async (name: string) => {
    if (!user) return;
    try {
      const topic = await createTopic(supabase, user.id, name);
      setTopics((prev) => [topic, ...prev]);
      setSelectedTopicId(topic.id);
    } catch (err) {
      console.error('Failed to create topic:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-jarvis-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const overdueCount = tasks.filter((t) => {
    if (!t.due_date || t.status === 'completed') return false;
    return new Date(t.due_date) < new Date(new Date().toDateString());
  }).length;

  return (
    <div className="min-h-screen pb-20 safe-top">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-jarvis-500">{t(lang, 'app.name')}</h1>
            <p className="text-xs text-[var(--muted)]">
              {pendingCount} {t(lang, 'task.pending')}
              {overdueCount > 0 && (
                <span className="text-red-500 ms-2">{overdueCount} {t(lang, 'common.overdue')}</span>
              )}
            </p>
          </div>
          <ShareButton tasks={tasks.filter((t) => t.status !== 'completed')} />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Topic Picker */}
        <div className="mb-6">
          <TopicPicker
            topics={topics}
            selectedId={selectedTopicId}
            onSelect={setSelectedTopicId}
            onCreateTopic={handleCreateTopic}
          />
        </div>

        {/* Record Button */}
        <div className="py-8">
          <RecordButton
            language={lang}
            onTasksExtracted={handleTasksExtracted}
          />
        </div>

        {/* Recent Tasks */}
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-3">
            {t(lang, 'nav.tasks')}
          </h2>
          <TaskList
            tasks={recentTasks}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            showFilters={false}
          />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
