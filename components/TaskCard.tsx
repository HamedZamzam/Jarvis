'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Clock, Trash2, User, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { clsx } from 'clsx';
import type { Task, TaskStatus } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG: Record<TaskStatus, { color: string; dot: string; label: string }> = {
  pending: { color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'task.pending' },
  in_progress: { color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'task.inProgress' },
  completed: { color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500', label: 'task.completed' },
};

const STATUS_ORDER: TaskStatus[] = ['pending', 'in_progress', 'completed'];

export default function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const { lang } = useApp();
  const router = useRouter();
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [showFullText, setShowFullText] = useState(false);

  const config = STATUS_CONFIG[task.status];

  const setStatus = (e: React.MouseEvent, newStatus: TaskStatus) => {
    e.stopPropagation();
    onUpdate(task.id, { status: newStatus });
    setStatusMenuOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this task?')) {
      onDelete(task.id);
    }
  };

  const openDetail = () => {
    router.push(`/tasks/${task.id}`);
  };

  const isLongTitle = task.title.length > 100;
  const isLongDescription = (task.description || '').length > 150;

  return (
    <div
      onClick={openDetail}
      className={clsx(
        'rounded-xl border bg-[var(--card)] border-[var(--border)] p-4 transition-all cursor-pointer hover:border-jarvis-300',
        task.status === 'completed' && 'opacity-60'
      )}
    >
      {/* Top row: status badge + actions */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStatusMenuOpen(!statusMenuOpen);
            }}
            className={clsx(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium',
              config.color
            )}
          >
            <span className={clsx('w-1.5 h-1.5 rounded-full', config.dot)} />
            {t(lang, config.label)}
            <ChevronDown size={12} />
          </button>
          {statusMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setStatusMenuOpen(false);
                }}
              />
              <div className="absolute top-full mt-1 start-0 z-50 w-40 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden">
                {STATUS_ORDER.map((s) => (
                  <button
                    key={s}
                    onClick={(e) => setStatus(e, s)}
                    className={clsx(
                      'w-full text-start px-3 py-2 text-sm hover:bg-[var(--background)] flex items-center gap-2',
                      task.status === s && 'bg-[var(--background)] font-medium'
                    )}
                  >
                    <span className={clsx('w-2 h-2 rounded-full', STATUS_CONFIG[s].dot)} />
                    {t(lang, STATUS_CONFIG[s].label)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 size={14} />
          </button>
          <ChevronRight size={16} className="text-[var(--muted)] rtl:rotate-180" />
        </div>
      </div>

      {/* Title — full text, wraps naturally */}
      <p
        className={clsx(
          'text-sm font-medium whitespace-pre-wrap break-words',
          task.status === 'completed' && 'line-through text-[var(--muted)]',
          isLongTitle && !showFullText && 'line-clamp-3'
        )}
      >
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p
          className={clsx(
            'text-xs text-[var(--muted)] mt-2 whitespace-pre-wrap break-words',
            isLongDescription && !showFullText && 'line-clamp-3'
          )}
        >
          {task.description}
        </p>
      )}

      {/* Show more / less */}
      {(isLongTitle || isLongDescription) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowFullText(!showFullText);
          }}
          className="text-xs text-jarvis-500 mt-1.5 hover:underline"
        >
          {showFullText ? 'show less' : '... show more'}
        </button>
      )}

      {/* Tags */}
      {(task.assignee || task.due_date) && (
        <div className="flex flex-wrap gap-2 mt-3">
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
      )}
    </div>
  );
}
