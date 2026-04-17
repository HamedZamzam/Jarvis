'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { getTask, getTopics, updateTask, deleteTask } from '@/lib/queries';
import { ArrowLeft, Trash2, Save, FolderOpen, User, Calendar, AlignLeft, Bell } from 'lucide-react';
import { clsx } from 'clsx';
import BottomNav from '@/components/BottomNav';
import type { Task, Topic, TaskStatus } from '@/lib/types';

const STATUS_CONFIG: Record<TaskStatus, { dot: string; label: string }> = {
  pending: { dot: 'bg-amber-500', label: 'task.pending' },
  in_progress: { dot: 'bg-blue-500', label: 'task.inProgress' },
  completed: { dot: 'bg-green-500', label: 'task.completed' },
};

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading, supabase, lang } = useApp();
  const router = useRouter();

  const [task, setTask] = useState<Task | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTask, setLoadingTask] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [topicId, setTopicId] = useState<string>('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !id) return;
    Promise.all([getTask(supabase, id), getTopics(supabase, user.id)])
      .then(([taskData, topicsData]) => {
        setTask(taskData);
        setTopics(topicsData);
        setTitle(taskData.title);
        setDescription(taskData.description || '');
        setAssignee(taskData.assignee || '');
        setDueDate(taskData.due_date || '');
        setReminderDate(taskData.reminder_date ? taskData.reminder_date.slice(0, 16) : '');
        setStatus(taskData.status);
        setTopicId(taskData.topic_id || '');
      })
      .catch((err) => console.error('Failed to load task:', err))
      .finally(() => setLoadingTask(false));
  }, [user, supabase, id]);

  const handleSave = async () => {
    if (!task) return;
    setSaving(true);
    try {
      const updates: Partial<Task> = {
        title,
        description: description || null,
        assignee: assignee || null,
        due_date: dueDate || null,
        reminder_date: reminderDate ? new Date(reminderDate).toISOString() : null,
        status,
      };
      // Use raw supabase update to also change topic_id (queries.ts updateTask doesn't include it)
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, topic_id: topicId || null, updated_at: new Date().toISOString() })
        .eq('id', task.id)
        .select()
        .single();
      if (error) throw error;
      setTask(data);
      router.back();
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(supabase, task.id);
      router.back();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (loading || loadingTask || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-jarvis-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted)]">Task not found</p>
      </div>
    );
  }

  const labelClass = 'flex items-center gap-2 text-xs font-medium text-[var(--muted)] uppercase mb-1.5';
  const inputClass =
    'w-full px-3 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-jarvis-500 text-sm';

  return (
    <div className="min-h-screen pb-20 safe-top bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[var(--background)]/90 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-[var(--card)]">
            <ArrowLeft size={20} className="rtl:rotate-180" />
          </button>
          <h1 className="flex-1 text-lg font-bold">{t(lang, 'task.title')}</h1>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-red-500 hover:bg-red-50"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-jarvis-500 text-white text-sm font-medium hover:bg-jarvis-600 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save size={14} />
            {saving ? t(lang, 'common.loading') : t(lang, 'common.save')}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-5">
        {/* Status */}
        <div>
          <label className={labelClass}>{t(lang, 'task.title')} Status</label>
          <div className="flex gap-2">
            {(['pending', 'in_progress', 'completed'] as TaskStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={clsx(
                  'flex-1 px-3 py-2.5 rounded-lg text-sm font-medium border-2 transition-all flex items-center justify-center gap-1.5',
                  status === s
                    ? 'border-jarvis-500 bg-jarvis-50 text-jarvis-700'
                    : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted)]'
                )}
              >
                <span className={clsx('w-2 h-2 rounded-full', STATUS_CONFIG[s].dot)} />
                {t(lang, STATUS_CONFIG[s].label)}
              </button>
            ))}
          </div>
        </div>

        {/* Title — large textarea, no character limit */}
        <div>
          <label className={labelClass}>{t(lang, 'task.title')}</label>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            rows={3}
            className={clsx(inputClass, 'resize-y min-h-[80px] text-base font-medium')}
            placeholder="What needs to be done?"
          />
          <p className="text-xs text-[var(--muted)] mt-1">{title.length} characters</p>
        </div>

        {/* Description / Notes — large textarea */}
        <div>
          <label className={labelClass}>
            <AlignLeft size={12} /> {t(lang, 'task.notes')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className={clsx(inputClass, 'resize-y min-h-[140px]')}
            placeholder="Additional details..."
          />
          <p className="text-xs text-[var(--muted)] mt-1">{description.length} characters</p>
        </div>

        {/* Topic / Group — move task between topics */}
        <div>
          <label className={labelClass}>
            <FolderOpen size={12} /> {t(lang, 'topic.title')}
          </label>
          <select
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            className={inputClass}
          >
            <option value="">— {t(lang, 'topic.general')} —</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee */}
        <div>
          <label className={labelClass}>
            <User size={12} /> {t(lang, 'task.assignee')}
          </label>
          <input
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className={inputClass}
            placeholder="Who is responsible?"
          />
        </div>

        {/* Due Date */}
        <div>
          <label className={labelClass}>
            <Calendar size={12} /> {t(lang, 'task.dueDate')}
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Reminder */}
        <div>
          <label className={labelClass}>
            <Bell size={12} /> {t(lang, 'task.reminder')}
          </label>
          <input
            type="datetime-local"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Metadata footer */}
        <div className="text-xs text-[var(--muted)] pt-2 border-t border-[var(--border)]">
          Created: {new Date(task.created_at).toLocaleString()}
          <br />
          Updated: {new Date(task.updated_at).toLocaleString()}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
