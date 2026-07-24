import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Admin client — bypasses RLS using the service role key.
 * ONLY use this in admin/server-side contexts.
 * NEVER expose the service role key to the browser.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
