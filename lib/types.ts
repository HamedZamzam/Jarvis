export interface Topic {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Entry {
  id: string;
  topic_id: string;
  user_id: string;
  transcript: string;
  language: string;
  created_at: string;
}

export interface Task {
  id: string;
  entry_id: string | null;
  topic_id: string | null;
  user_id: string;
  title: string;
  description: string | null;
  assignee: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string | null;
  reminder_date: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface ExtractedTask {
  title: string;
  description?: string;
  assignee?: string;
  due_date?: string;
}

export interface Locale {
  dir: 'ltr' | 'rtl';
  lang: 'en' | 'ar';
}
