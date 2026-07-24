'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'

export async function adminCreateProfessional(input: {
  full_name: string
  email: string
  professional_name?: string | null
  public_slug?: string | null
}) {
  const supabaseAdmin = createAdminClient()
  const userId = crypto.randomUUID()

  const { error: profileError } = await supabaseAdmin
    .from('platform_users')
    .insert({
      id: userId,
      full_name: input.full_name,
      type: 'professional',
    })

  if (profileError) {
    return { error: profileError.message }
  }

  const { data, error } = await supabaseAdmin
    .from('professionals')
    .insert({
      user_id: userId,
      full_name: input.full_name,
      email: input.email,
      professional_name: input.professional_name ?? input.full_name,
      public_slug: input.public_slug ?? null,
      is_verified: false,
      status: 'pending',
    })
    .select('*')
    .single()

  if (error) {
    await supabaseAdmin.from('platform_users').delete().eq('id', userId)
    return { error: error.message }
  }

  return { professional: data }
}

export async function adminUpdateProfessional(id: string, input: {
  status?: 'active' | 'pending' | 'suspended' | 'rejected'
  is_verified?: boolean
}) {
  const supabaseAdmin = createAdminClient()

  const { data, error } = await supabaseAdmin
    .from('professionals')
    .update(input)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    return { error: error.message }
  }

  return { professional: data }
}

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
