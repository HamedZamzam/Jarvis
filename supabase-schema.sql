-- ============================================
-- Jarvis Voice-to-Tasks — Database Schema
-- Run this SQL in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → Paste → Run)
-- ============================================

-- Topics (folders for organizing tasks)
create table if not exists topics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text default '#3b82f6',
  created_at timestamptz default now()
);

-- Entries (recording sessions with transcripts)
create table if not exists entries (
  id uuid default gen_random_uuid() primary key,
  topic_id text default '',
  user_id uuid references auth.users(id) on delete cascade not null,
  transcript text not null default '',
  language text default 'en',
  created_at timestamptz default now()
);

-- Tasks (action points extracted from recordings)
create table if not exists tasks (
  id uuid default gen_random_uuid() primary key,
  entry_id text default null,
  topic_id text default null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  assignee text,
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  due_date date,
  reminder_date timestamptz,
  reminder_sent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contacts (saved people for quick assignee selection)
create table if not exists contacts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

-- Push notification subscriptions
create table if not exists push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

-- ============================================
-- Row Level Security (each user sees only their data)
-- ============================================

alter table topics enable row level security;
create policy "Users manage own topics" on topics
  for all using (auth.uid() = user_id);

alter table entries enable row level security;
create policy "Users manage own entries" on entries
  for all using (auth.uid() = user_id);

alter table tasks enable row level security;
create policy "Users manage own tasks" on tasks
  for all using (auth.uid() = user_id);

alter table contacts enable row level security;
create policy "Users manage own contacts" on contacts
  for all using (auth.uid() = user_id);

alter table push_subscriptions enable row level security;
create policy "Users manage own subscriptions" on push_subscriptions
  for all using (auth.uid() = user_id);

-- ============================================
-- Performance Indexes
-- ============================================

create index if not exists idx_tasks_user_status on tasks(user_id, status);
create index if not exists idx_tasks_user_due on tasks(user_id, due_date);
create index if not exists idx_tasks_reminder on tasks(reminder_date) where reminder_sent = false;
create index if not exists idx_entries_topic on entries(topic_id, created_at desc);
create index if not exists idx_topics_user on topics(user_id);
