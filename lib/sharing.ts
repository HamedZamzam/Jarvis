import { Task } from './types';

const STATUS_EMOJI: Record<string, string> = {
  pending: '🔴',
  in_progress: '🟡',
  completed: '✅',
};

export function formatTasksAsText(tasks: Task[], topicName?: string): string {
  const lines: string[] = [];

  if (topicName) {
    lines.push(`📋 ${topicName}`);
    lines.push('─'.repeat(30));
  }

  tasks.forEach((task, i) => {
    const status = STATUS_EMOJI[task.status] || '⬜';
    let line = `${status} ${i + 1}. ${task.title}`;
    if (task.assignee) line += ` → ${task.assignee}`;
    if (task.due_date) line += ` (Due: ${task.due_date})`;
    lines.push(line);
  });

  lines.push('');
  lines.push('— Sent from Jarvis');

  return lines.join('\n');
}

export function shareViaWhatsApp(tasks: Task[], topicName?: string) {
  const text = formatTasksAsText(tasks, topicName);
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

export async function copyToClipboard(tasks: Task[], topicName?: string): Promise<boolean> {
  const text = formatTasksAsText(tasks, topicName);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export async function shareNative(tasks: Task[], topicName?: string): Promise<boolean> {
  if (!navigator.share) return false;
  const text = formatTasksAsText(tasks, topicName);
  try {
    await navigator.share({ title: topicName || 'Jarvis Tasks', text });
    return true;
  } catch {
    return false;
  }
}
