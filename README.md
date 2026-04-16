# Jarvis — Voice to Tasks

Transform voice notes into structured, trackable tasks. Works on iPhone and Windows laptop — no app store needed.

## How It Works

1. Tap the microphone button and speak naturally
2. Jarvis transcribes your voice and extracts action items automatically  
3. Edit tasks, set assignees, due dates, and reminders
4. Share tasks via WhatsApp or copy to clipboard

## Setup Guide (Step by Step)

### Step 1: Create Free Accounts

You need 4 free accounts:

1. **GitHub** — [github.com](https://github.com) (to store the code)
2. **Vercel** — [vercel.com](https://vercel.com) (to host the app, free)
3. **Supabase** — [supabase.com](https://supabase.com) (database, free)
4. **OpenAI** — [platform.openai.com](https://platform.openai.com) (voice transcription, ~$0.006/min)
5. **Anthropic** — [console.anthropic.com](https://console.anthropic.com) (AI task extraction, pay-per-use)

### Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → Create a new project
2. Choose a name (e.g., "jarvis") and set a database password
3. Wait for the project to be created (takes about 1 minute)
4. Go to **SQL Editor** (left sidebar)
5. Click **New Query**
6. Open the file `supabase-schema.sql` from this project, copy ALL the text
7. Paste it in the SQL editor and click **Run**
8. Go to **Settings → API** and copy:
   - Project URL (looks like `https://xxxxx.supabase.co`)
   - `anon` public key (long string starting with `eyJ...`)

### Step 3: Get API Keys

**OpenAI:**
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy it (starts with `sk-`)

**Anthropic:**
1. Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Click "Create Key"
3. Copy it (starts with `sk-ant-`)

### Step 4: Deploy to Vercel

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → "Add New" → "Project"
3. Import your GitHub repository
4. In the **Environment Variables** section, add these:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |

5. Click **Deploy**
6. Wait for the build to complete (2-3 minutes)
7. Your app is live at `https://your-project.vercel.app`

### Step 5: Install on Your Phone

**iPhone:**
1. Open Safari and go to your Vercel URL
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **Add**
5. Now you have Jarvis as an app on your home screen!

**Android:**
1. Open Chrome and go to your Vercel URL
2. Tap the three dots menu
3. Tap **"Add to Home screen"** or **"Install app"**

## Features

- One-tap voice recording
- AI-powered task extraction  
- Task status tracking (Pending / In Progress / Done)
- Organize tasks by topic/folder
- Share via WhatsApp or clipboard
- Push notification reminders
- English and Arabic support (RTL)
- Works offline (cached pages)
- Installable as a phone app (PWA)

## Tech Stack

- Next.js 14 (React)
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- OpenAI Whisper (voice-to-text)
- Claude API (task extraction)
- Vercel (hosting)
