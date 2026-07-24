import type { Database } from '@/lib/supabase-types'
import type { SupabaseClient, User } from '@supabase/supabase-js'

export type PlatformRole = 'athlete' | 'professional' | 'venue_manager' | 'admin'

export type SessionAccess = {
  role: PlatformRole
  profileId: string | null
  canAccessDashboard: boolean
  canAccessAdmin: boolean
  canManageProfessionals: boolean
  canManageSpaces: boolean
}

type Supabase = SupabaseClient<Database>

function normalizeRole(value: unknown): PlatformRole {
  if (value === 'professional' || value === 'profissional') return 'professional'
  if (value === 'venue_manager' || value === 'espaco') return 'venue_manager'
  if (value === 'admin') return 'admin'
  return 'athlete'
}

export async function resolveSessionAccess(supabase: Supabase, user: User): Promise<SessionAccess | null> {
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('id, user_id, is_active, role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (adminUser) {
    return {
      role: 'admin',
      profileId: adminUser.id,
      canAccessDashboard: false,
      canAccessAdmin: true,
      canManageProfessionals: true,
      canManageSpaces: true,
    }
  }

  const { data: platformUser } = await supabase
    .from('platform_users')
    .select('id, type')
    .eq('id', user.id)
    .maybeSingle()

  const role = normalizeRole(platformUser?.type ?? user.user_metadata?.type)

  const { count: professionalCount } = await supabase
    .from('professionals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: spaceCount } = await supabase
    .from('sport_spaces')
    .select('id', { count: 'exact', head: true })
    .eq('owner_user_id', user.id)

  return {
    role,
    profileId: platformUser?.id ?? null,
    canAccessDashboard: role !== 'admin',
    canAccessAdmin: false,
    canManageProfessionals: role === 'professional' || role === 'admin' || Boolean(professionalCount),
    canManageSpaces: role === 'venue_manager' || role === 'admin' || Boolean(spaceCount),
  }
}
