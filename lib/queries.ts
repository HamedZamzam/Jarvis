import { SupabaseClient } from '@supabase/supabase-js';
import { Task, Topic, Entry, Contact, TaskStatus } from './types';

// ── Topics ──────────────────────────────────────────────

export async function getTopics(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Topic[];
}

export async function createTopic(supabase: SupabaseClient, userId: string, name: string, color = '#3b82f6') {
  const { data, error } = await supabase
    .from('topics')
    .insert({ user_id: userId, name, color })
    .select()
    .single();
  if (error) throw error;
  return data as Topic;
}

export async function deleteTopic(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('topics').delete().eq('id', id);
  if (error) throw error;
}

// ── Entries ─────────────────────────────────────────────

export async function getEntries(supabase: SupabaseClient, topicId: string) {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Entry[];
}

export async function createEntry(
  supabase: SupabaseClient,
  userId: string,
  topicId: string,
  transcript: string,
  language = 'en'
) {
  const { data, error } = await supabase
    .from('entries')
    .insert({ user_id: userId, topic_id: topicId, transcript, language })
    .select()
    .single();
  if (error) throw error;
  return data as Entry;
}

// ── Tasks ───────────────────────────────────────────────

export async function getTasks(
  supabase: SupabaseClient,
  userId: string,
  filters?: { status?: TaskStatus; topicId?: string }
) {
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.topicId) query = query.eq('topic_id', filters.topicId);

  const { data, error } = await query;
  if (error) throw error;
  return data as Task[];
}

export async function getTask(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Task;
}

export async function createTask(
  supabase: SupabaseClient,
  task: {
    user_id: string;
    entry_id?: string;
    topic_id?: string;
    title: string;
    description?: string;
    assignee?: string;
    due_date?: string;
  }
) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...task, status: 'pending' })
    .select()
    .single();
  if (error) throw error;
  return data as Task;
}

export async function updateTask(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Pick<Task, 'title' | 'description' | 'assignee' | 'status' | 'due_date' | 'reminder_date'>>
) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Task;
}

export async function deleteTask(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function bulkCreateTasks(
  supabase: SupabaseClient,
  tasks: Array<{
    user_id: string;
    entry_id?: string;
    topic_id?: string;
    title: string;
    description?: string;
    assignee?: string;
    due_date?: string;
  }>
) {
  const rows = tasks.map((t) => ({ ...t, status: 'pending' as const }));
  const { data, error } = await supabase.from('tasks').insert(rows).select();
  if (error) throw error;
  return data as Task[];
}

// ── Contacts ────────────────────────────────────────────

export async function getContacts(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId)
    .order('name');
  if (error) throw error;
  return data as Contact[];
}

export async function createContact(supabase: SupabaseClient, userId: string, name: string) {
  const { data, error } = await supabase
    .from('contacts')
    .insert({ user_id: userId, name })
    .select()
    .single();
  if (error) throw error;
  return data as Contact;
}
