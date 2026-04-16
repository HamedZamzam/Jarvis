import { createBrowserClient } from '@supabase/ssr';

// Browser client (for client components)
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing-key'
  );
}
