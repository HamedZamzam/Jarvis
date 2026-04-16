'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { clsx } from 'clsx';
import TaskCard from './TaskCard';
import type { Task, TaskStatus } from '@/lib/types';

interface TaskListProps {
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  showFilters?: boolean;
}

type Filter = 'all' | TaskStatus;

export default function TaskList({ tasks, onUpdate, onDelete, showFilters = true }: TaskListProps) {
  const { lang } = useApp();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t(lang, 'task.all') },
    { key: 'pending', label: t(lang, 'task.pending') },
    { key: 'in_progress', label: t(lang, 'task.inProgress') },
    { key: 'completed', label: t(lang, 'task.completed') },
  ];

  return (
    <div>
      {showFilters && (
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={clsx(
                'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                filter === key
                  ? 'bg-jarvis-500 text-white'
                  : 'bg-[var(--card)] text-[var(--muted)] border border-[var(--border)] hover:border-jarvis-300'
              )}
            >
              {label} ({counts[key]})
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--muted)] text-sm">{t(lang, 'task.noTasks')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
