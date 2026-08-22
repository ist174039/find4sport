import 'server-only'

import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveSessionAccess, type SessionAccess } from '@/lib/auth/access'
import type { AccessRole } from '@/lib/auth/roles'

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

export async function requireProfessional() {
  const session = await requireAccess()
  if (session.access.role !== 'professional' || !session.access.canManageProfessionals) {
    throw new Error('Sem permissões de profissional')
  }
  return session
}

export async function requireVenueManager() {
  const session = await requireAccess()
  if (session.access.role !== 'venue_manager' || !session.access.canManageSpaces) {
    throw new Error('Sem permissões de gestor de espaço')
  }
  return session
}
