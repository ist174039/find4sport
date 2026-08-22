'use server'

import { requireAdmin } from '@/lib/auth/authorization'
import { isPlatformRole, type PlatformRole } from '@/lib/auth/roles'

function requirePlatformRole(value: unknown): PlatformRole {
  if (!isPlatformRole(value)) throw new Error('Tipo de perfil inválido')
  return value
}

export async function adminCreateProfessional(input: {
  full_name: string
  email: string
  professional_name?: string | null
  public_slug?: string | null
}) {
  const { admin } = await requireAdmin()

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: input.email,
    email_confirm: true,
    user_metadata: { full_name: input.full_name, type: 'professional' },
  })
  if (authError || !authData.user) return { error: authError?.message || 'Não foi possível criar a identidade do profissional' }

  const userId = authData.user.id
  const { error: profileError } = await admin.from('platform_users').update({ full_name: input.full_name, type: 'professional' }).eq('id', userId)
  if (profileError) {
    await admin.auth.admin.deleteUser(userId)
    return { error: profileError.message }
  }

  const { data, error } = await admin.from('professionals').insert({
    user_id: userId,
    full_name: input.full_name,
    email: input.email,
    professional_name: input.professional_name ?? input.full_name,
    public_slug: input.public_slug ?? null,
    is_verified: false,
    status: 'pending',
  }).select('*').single()

  if (error) {
    await admin.auth.admin.deleteUser(userId)
    return { error: error.message }
  }
  return { professional: data }
}

export async function adminUpdateProfessional(id: string, input: { status?: 'active' | 'pending' | 'suspended' | 'rejected'; is_verified?: boolean }) {
  const { admin } = await requireAdmin()
  const { data, error } = await admin.from('professionals').update(input).eq('id', id).select('*').single()
  if (error) return { error: error.message }
  return { professional: data }
}

export async function adminCreateUser(email: string, password: string, fullName: string, type: PlatformRole) {
  const { admin } = await requireAdmin()
  const role = requirePlatformRole(type)
  if (password.length < 8) return { error: 'A palavra-passe deve ter pelo menos 8 caracteres' }

  const { data, error } = await admin.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName.trim(), type: role },
  })
  if (error) return { error: error.message }
  return { user: data.user }
}