import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webPush from 'web-push';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
  );
}

export async function GET(req: Request) {
  // Verify cron secret (Vercel cron sends this header)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // In development, allow without auth
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    // Find tasks with due reminders
    const now = new Date().toISOString();
    const { data: tasks, error } = await getSupabase()
      .from('tasks')
      .select('*')
      .lte('reminder_date', now)
      .eq('reminder_sent', false)
      .neq('status', 'completed');

    if (error) throw error;
    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    // Configure web-push
    if (process.env.VAPID_EMAIL && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webPush.setVapidDetails(
        process.env.VAPID_EMAIL,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    }

    let sentCount = 0;

    for (const task of tasks) {
      // Get user's push subscriptions
      const { data: subs } = await getSupabase()
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', task.user_id);

      if (subs) {
        for (const sub of subs) {
          try {
            await webPush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth },
              },
              JSON.stringify({
                title: 'Jarvis Reminder',
                body: task.title,
                url: '/tasks',
              })
            );
            sentCount++;
          } catch {
            // Subscription expired — remove it
            await getSupabase().from('push_subscriptions').delete().eq('id', sub.id);
          }
        }
      }

      // Mark reminder as sent
      await getSupabase()
        .from('tasks')
        .update({ reminder_sent: true })
        .eq('id', task.id);
    }

    return NextResponse.json({ sent: sentCount, tasks: tasks.length });
  } catch (error: unknown) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
