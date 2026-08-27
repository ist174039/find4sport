import 'server-only'

import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess, type SessionAccess } from '@/lib/auth/access'
import type { AccessRole } from '@/lib/auth/roles'
import { adminHasPermission, parseAdminType, type AdminPermission } from '@/lib/auth/admin-permissions'

export type AuthorizedSession = {
  user: User
  access: SessionAccess
}

export async function requireUser(): Promise<User> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Utilizador não autenticado')
  return user
}

export async function requireAccess(): Promise<AuthorizedSession> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Utilizador não autenticado')

  const access = await resolveSessionAccess(supabase, user)
  if (!access) throw new Error('Conta sem acesso à plataforma')
  return { user, access }
}

export async function requireRole(role: AccessRole): Promise<AuthorizedSession> {
  const session = await requireAccess()
  if (session.access.role !== role) throw new Error('Sem permissões para esta operação')
  return session
}

export async function requireAdmin() {
  const session = await requireAccess()
  if (!session.access.canAccessAdmin) throw new Error('Sem permissões de administrador')
  return { ...session, admin: createAdminClient() }
}

async function resolveAuthorizedAdmin() {
  const session = await requireAdmin()
  const { data: adminProfile, error } = await session.admin
    .from('admins')
    .select('id, admin_type')
    .eq('auth_user_id', session.user.id)
    .maybeSingle()
  const adminType = parseAdminType(adminProfile?.admin_type)
  if (error || !adminProfile?.id || !adminType) throw new Error('Perfil administrativo inválido')
  return { ...session, adminProfile: { id: adminProfile.id, adminType } }
}

export async function requireAdminPermission(permission: AdminPermission) {
  const session = await resolveAuthorizedAdmin()
  if (!adminHasPermission(session.adminProfile.adminType, permission)) {
    throw new Error('Sem permissões para esta operação administrativa')
  }
  return session
}

export async function requireGeneralAdmin() {
  return requireAdminPermission('admin.manage')
}

export async function requireProfessional() {
  const session = await requireAccess()
  if (session.access.role !== 'professional' || !session.access.canManageProfessionals) {
    throw new Error('Sem permissões de profissional')
  }
  return session
}

export async function requireVenueManager() {
  const session = await requireAccess()
  if (!session.access.canManageSpaces) {
    throw new Error('Sem permissões de gestor de espaço')
  }
  return session
}
