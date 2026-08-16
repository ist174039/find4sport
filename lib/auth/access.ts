import type { Database } from '@/lib/supabase-types'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { parsePlatformRole, type AccessRole } from '@/lib/auth/roles'

export type SessionAccess = {
  role: AccessRole
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
      role: 'admin' as const,
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
    role: 'admin' as const,
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
      canManageProfessionals: false,
      canManageSpaces: false,
    }
  }

  const { data: platformUser } = await supabase
    .from('platform_users')
    .select('id, type')
    .eq('id', user.id)
    .maybeSingle()

  if (!platformUser?.id) {
    return null
  }

  const role = parsePlatformRole(platformUser.type)
  if (!role) {
    return null
  }

  const [{ count: professionalCount }, { count: spaceCount }] = await Promise.all([
    supabase
      .from('professionals')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('sport_spaces')
      .select('id', { count: 'exact', head: true })
      .eq('owner_user_id', user.id),
  ])

  return {
    role,
    profileId: platformUser.id,
    canAccessDashboard: true,
    canAccessAdmin: false,
    canManageProfessionals: role === 'professional' || Boolean(professionalCount),
    canManageSpaces: role === 'venue_manager' || Boolean(spaceCount),
  }
}
