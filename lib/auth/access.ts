import type { Database } from '@/lib/supabase-types'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { normalizePlatformRole, type PlatformRole } from '@/lib/auth/roles'

export type SessionAccess = {
  role: PlatformRole
  profileId: string | null
  canAccessDashboard: boolean
  canAccessAdmin: boolean
  canManageProfessionals: boolean
  canManageSpaces: boolean
}

type Supabase = SupabaseClient<Database>

async function resolveAdminRecord(supabase: Supabase, user: User) {
  const unsafeSupabase = supabase as any

  const { data: modernAdmin } = await unsafeSupabase
    .from('admins')
    .select('id, auth_user_id, admin_type')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (modernAdmin) {
    return {
      id: modernAdmin.id as string,
      role: 'admin' as PlatformRole,
      adminLabel: (modernAdmin.admin_type as string) || 'general',
    }
  }

  const { data: legacyAdmin } = await supabase
    .from('admin_users')
    .select('id, user_id, is_active, role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (!legacyAdmin) return null

  return {
    id: legacyAdmin.id,
    role: 'admin' as PlatformRole,
    adminLabel: legacyAdmin.role || 'general',
  }
}

export async function resolveAdminSidebarUser(supabase: Supabase, user: User): Promise<{ role: string } | null> {
  const adminRecord = await resolveAdminRecord(supabase, user)
  if (!adminRecord) return null
  return { role: adminRecord.adminLabel }
}

export async function resolveSessionAccess(supabase: Supabase, user: User): Promise<SessionAccess | null> {
  const adminUser = await resolveAdminRecord(supabase, user)

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

  const role = normalizePlatformRole(platformUser?.type ?? user.user_metadata?.type)

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
