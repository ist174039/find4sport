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
  hasProfessionalProfile: boolean
  hasManagedSpace: boolean
}

type Supabase = SupabaseClient<Database>

async function resolveAdminRecord(supabase: Supabase, user: User) {
  const unsafeSupabase = supabase as any

  const { data: admin } = await unsafeSupabase
    .from('admins')
    .select('id, auth_user_id, admin_type')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!admin) return null

  return {
    id: admin.id as string,
    role: 'admin' as const,
    adminLabel: (admin.admin_type as string) || 'general',
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
      hasProfessionalProfile: false,
      hasManagedSpace: false,
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

  const hasProfessionalProfile = Boolean(professionalCount)
  const hasManagedSpace = Boolean(spaceCount)

  return {
    role,
    profileId: platformUser.id,
    canAccessDashboard: true,
    canAccessAdmin: false,
    canManageProfessionals: role === 'professional' && hasProfessionalProfile,
    canManageSpaces: role === 'venue_manager' && hasManagedSpace,
    hasProfessionalProfile,
    hasManagedSpace,
  }
}
