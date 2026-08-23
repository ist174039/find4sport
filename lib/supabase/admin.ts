import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { CurrentDatabase } from '@/lib/supabase-current-types'

/**
 * Service-role client. This bypasses RLS and therefore belongs exclusively in
 * trusted server code after explicit authorization checks.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) throw new Error('Supabase admin credentials are not configured')

  return createSupabaseClient<CurrentDatabase>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
