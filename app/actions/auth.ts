'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function adminCreateUser(email: string, password: string, fullName: string, type: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: 'Missing Supabase admin credentials' }
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Tenta criar o utilizador usando a API de Admin (que ignora o rate limit do cliente)
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, type }
  })

  if (error) {
    return { error: error.message }
  }

  return { user: data.user }
}
