import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase-types-current'

export function createAdminClient(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const serviceRoleKey=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!serviceRoleKey)throw new Error('Supabase admin credentials are not configured');return createSupabaseClient<Database>(url,serviceRoleKey,{auth:{autoRefreshToken:false,persistSession:false}})}
