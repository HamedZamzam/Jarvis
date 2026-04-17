'use client';

import { useState } from 'react';
import { Check, Clock, Edit2, Trash2, User, Calendar, FileText, ChevronDown } from 'lucide-react';
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
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [assignee, setAssignee] = useState(task.assignee || '');
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [showFullText, setShowFullText] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const config = STATUS_CONFIG[task.status];

  const handleSave = () => {
    onUpdate(task.id, {
      title,
      description: description || null,
      assignee: assignee || null,
      due_date: dueDate || null,
    });
    setEditing(false);
  };

  const setStatus = (newStatus: TaskStatus) => {
    onUpdate(task.id, { status: newStatus });
    setStatusMenuOpen(false);
  };

  const isLongTitle = task.title.length > 100;
  const isLongDescription = (task.description || '').length > 150;

  return (
    <div
      className={clsx(
        'rounded-xl border bg-[var(--card)] border-[var(--border)] p-4 transition-all',
        task.status === 'completed' && 'opacity-60'
      )}
    >
      {editing ? (
        // Edit mode — full editor with description textarea
        <div className="space-y-3">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)]
                       focus:outline-none focus:ring-2 focus:ring-jarvis-500 text-sm resize-none"
            placeholder={t(lang, 'task.title')}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)]
                       focus:outline-none focus:ring-2 focus:ring-jarvis-500 text-sm resize-y"
            placeholder={t(lang, 'task.notes')}
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
        <div>
          {/* Top row: status badge + actions */}
          <div className="flex items-center justify-between mb-2 gap-2">
            <div className="relative">
              <button
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
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
                  <div className="fixed inset-0 z-40" onClick={() => setStatusMenuOpen(false)} />
                  <div className="absolute top-full mt-1 start-0 z-50 w-40 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden">
                    {STATUS_ORDER.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
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

            <div className="flex gap-1">
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

          {/* Description — full text */}
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
              onClick={() => setShowFullText(!showFullText)}
              className="text-xs text-jarvis-500 mt-1.5 hover:underline"
            >
              {showFullText ? t(lang, 'common.cancel') : '... show more'}
            </button>
          )}

          {/* Tags: assignee and due date */}
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
      )}
    </div>
  );
}
