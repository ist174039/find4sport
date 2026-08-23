import { createBrowserClient } from '@supabase/ssr'
import type { CurrentDatabase } from '@/lib/supabase-current-types'

export function createClient() {
  return createBrowserClient<CurrentDatabase>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
