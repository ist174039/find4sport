'use server'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { resolveSessionAccess } from '@/lib/auth/access'
import { isPlatformRole, type PlatformRole } from '@/lib/auth/roles'

async function requireAdminAccess() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Utilizador não autenticado')
  }

  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessAdmin) {
    throw new Error('Sem permissões de administrador')
  }
}

function requirePlatformRole(value: unknown): PlatformRole {
  if (!isPlatformRole(value)) {
    throw new Error('Tipo de perfil inválido')
  }
  return value
}

export async function adminCreateProfessional(input: {
  full_name: string
  email: string
  professional_name?: string | null
  public_slug?: string | null
}) {
  await requireAdminAccess()
  const supabaseAdmin = createAdminClient()

  // A platform profile must always belong to a real Supabase Auth identity because
  // platform_users.id is a foreign key to auth.users.id. Create the identity first
  // and let the database provisioning trigger create the initial athlete profile.
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    email_confirm: true,
    user_metadata: {
      full_name: input.full_name,
      type: 'professional',
    },
  })

  if (authError || !authData.user) {
    return { error: authError?.message || 'Não foi possível criar a identidade do profissional' }
  }

  const userId = authData.user.id

  const { error: profileError } = await supabaseAdmin
    .from('platform_users')
    .update({
      full_name: input.full_name,
      email: input.email,
      type: 'professional',
    })
    .eq('id', userId)

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId)
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
    await supabaseAdmin.auth.admin.deleteUser(userId)
    return { error: error.message }
  }

  return { professional: data }
}

export async function adminUpdateProfessional(id: string, input: {
  status?: 'active' | 'pending' | 'suspended' | 'rejected'
  is_verified?: boolean
}) {
  await requireAdminAccess()
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

export async function adminCreateUser(email: string, password: string, fullName: string, type: PlatformRole) {
  await requireAdminAccess()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { error: 'Missing Supabase admin credentials' }
  }

  const role = requirePlatformRole(type)

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, type: role }
  })

  if (error) {
    return { error: error.message }
  }

  return { user: data.user }
}
