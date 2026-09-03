import type { Database } from '@/lib/supabase-types'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { parsePlatformRole, type AccessRole } from '@/lib/auth/roles'
import { parseAdminType, type AdminType } from '@/lib/auth/admin-permissions'

export type SessionAccess = {
  role: AccessRole
  profileId: string | null
  adminType: AdminType | null
  canAccessDashboard: boolean
  canAccessAdmin: boolean
  canManageProfessionals: boolean
  canManageSpaces: boolean
  hasProfessionalProfile: boolean
  hasManagedSpace: boolean
  accountStatus: 'active' | 'suspended' | 'blocked'
  moderationReason: string | null
  suspendedUntil: string | null
  isRestricted: boolean
}

type Supabase = SupabaseClient<Database>

async function resolveAdminRecord(supabase: Supabase, user: User) {
  const { data: admin } = await supabase.from('admins').select('id, auth_user_id, admin_type').eq('auth_user_id', user.id).maybeSingle()
  if (!admin) return null
  const adminType = parseAdminType(admin.admin_type)
  if (!adminType) return null
  return { id: admin.id, role: 'admin' as const, adminType }
}

export async function resolveAdminSidebarUser(supabase: Supabase, user: User): Promise<{ role: string } | null> {
  const adminRecord = await resolveAdminRecord(supabase, user)
  if (!adminRecord) return null
  return { role: adminRecord.adminType }
}

export function getAccountStatus(user: User) {
  return String(user.app_metadata?.account_status || user.user_metadata?.account_status || '')
}

export async function resolveSessionAccess(supabase: Supabase, user: User): Promise<SessionAccess | null> {
  const adminUser = await resolveAdminRecord(supabase, user)
  if (adminUser) {
    return { role: 'admin', profileId: adminUser.id, adminType: adminUser.adminType, canAccessDashboard: false, canAccessAdmin: true, canManageProfessionals: false, canManageSpaces: false, hasProfessionalProfile: false, hasManagedSpace: false, accountStatus: 'active', moderationReason: null, suspendedUntil: null, isRestricted: false }
  }

  const accountStatus = getAccountStatus(user)
  if (accountStatus === 'deactivated' || accountStatus === 'deletion_requested') return null

  const { data: platformUser } = await supabase.from('platform_users').select('id, type, account_status, moderation_reason, suspended_until').eq('id', user.id).maybeSingle()
  if (!platformUser?.id) return null
  const role = parsePlatformRole(platformUser.type)
  if (!role) return null
  const dbStatus = platformUser.account_status === 'blocked' || platformUser.account_status === 'suspended' ? platformUser.account_status : 'active'
  const isRestricted = dbStatus !== 'active' && !(dbStatus === 'suspended' && platformUser.suspended_until && new Date(platformUser.suspended_until).getTime() <= Date.now())

  const [{ count: professionalCount }, { count: spaceCount }] = await Promise.all([
    supabase.from('professionals').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('sport_spaces').select('id', { count: 'exact', head: true }).eq('owner_user_id', user.id),
  ])

  const hasProfessionalProfile = Boolean(professionalCount)
  const hasManagedSpace = Boolean(spaceCount)
  return {
    role,
    profileId: platformUser.id,
    adminType: null,
    canAccessDashboard: !isRestricted,
    canAccessAdmin: false,
    canManageProfessionals: hasProfessionalProfile,
    canManageSpaces: hasManagedSpace,
    hasProfessionalProfile,
    hasManagedSpace,
    accountStatus: isRestricted ? dbStatus : 'active',
    moderationReason: isRestricted ? platformUser.moderation_reason : null,
    suspendedUntil: isRestricted ? platformUser.suspended_until : null,
    isRestricted,
  }
}
