'use client';

import { useState } from 'react';
import { Check, Clock, Edit2, Trash2, User, Calendar, ChevronDown } from 'lucide-react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { clsx } from 'clsx';
import type { Task, TaskStatus } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG: Record<TaskStatus, { color: string; icon: typeof Check; label: string }> = {
  pending: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'task.pending' },
  in_progress: { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'task.inProgress' },
  completed: { color: 'bg-green-100 text-green-700', icon: Check, label: 'task.completed' },
};

const STATUS_ORDER: TaskStatus[] = ['pending', 'in_progress', 'completed'];

export default function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const { lang } = useApp();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [assignee, setAssignee] = useState(task.assignee || '');
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const config = STATUS_CONFIG[task.status];

  const handleSave = () => {
    onUpdate(task.id, {
      title,
      assignee: assignee || null,
      due_date: dueDate || null,
    });
    setEditing(false);
  };

  const cycleStatus = () => {
    const currentIdx = STATUS_ORDER.indexOf(task.status);
    const nextStatus = STATUS_ORDER[(currentIdx + 1) % STATUS_ORDER.length];
    onUpdate(task.id, { status: nextStatus });
  };

  return (
    <div
      className={clsx(
        'rounded-xl border bg-[var(--card)] border-[var(--border)] p-4 transition-all',
        task.status === 'completed' && 'opacity-60'
      )}
    >
      {editing ? (
        // Edit mode
        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)]
                       focus:outline-none focus:ring-2 focus:ring-jarvis-500 text-sm"
            placeholder={t(lang, 'task.title')}
          />
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <User size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full ps-8 pe-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)]
                           focus:outline-none focus:ring-2 focus:ring-jarvis-500 text-sm"
                placeholder={t(lang, 'task.assignee')}
              />
            </div>
            <div className="flex-1 relative">
              <Calendar size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full ps-8 pe-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)]
                           focus:outline-none focus:ring-2 focus:ring-jarvis-500 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 text-sm rounded-lg text-[var(--muted)] hover:bg-[var(--background)]"
            >
              {t(lang, 'common.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm rounded-lg bg-jarvis-500 text-white hover:bg-jarvis-600"
            >
              {t(lang, 'common.save')}
            </button>
          </div>
        </div>
      ) : (
        // Display mode
        <div className="flex items-start gap-3">
          {/* Status button */}
          <button
            onClick={cycleStatus}
            className={clsx(
              'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5',
              task.status === 'completed'
                ? 'bg-green-500 text-white'
                : task.status === 'in_progress'
                  ? 'bg-blue-500 text-white'
                  : 'border-2 border-[var(--border)] hover:border-jarvis-500'
            )}
          >
            {task.status === 'completed' && <Check size={14} />}
            {task.status === 'in_progress' && <Clock size={12} />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className={clsx(
                'text-sm font-medium',
                task.status === 'completed' && 'line-through text-[var(--muted)]'
              )}
            >
              {task.title}
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              {task.assignee && (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)] bg-[var(--background)] px-2 py-0.5 rounded-full">
                  <User size={10} /> {task.assignee}
                </span>
              )}
              {task.due_date && (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)] bg-[var(--background)] px-2 py-0.5 rounded-full">
                  <Calendar size={10} /> {task.due_date}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-jarvis-500 hover:bg-jarvis-50"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-50"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
