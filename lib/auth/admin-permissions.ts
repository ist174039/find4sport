export type AdminType = 'general' | 'operacional'

export type AdminPermission =
  | 'admin.manage'
  | 'platform_users.manage'
  | 'professionals.manage'
  | 'spaces.manage'
  | 'events.manage'
  | 'communities.manage'
  | 'content.moderate'
  | 'reports.read'
  | 'finance.read'
  | 'finance.operate'
  | 'finance.configure'
  | 'platform.configure'
  | 'audit.read'

const GENERAL_PERMISSIONS: readonly AdminPermission[] = [
  'admin.manage',
  'platform_users.manage',
  'professionals.manage',
  'spaces.manage',
  'events.manage',
  'communities.manage',
  'content.moderate',
  'reports.read',
  'finance.read',
  'finance.operate',
  'finance.configure',
  'platform.configure',
  'audit.read',
]

const OPERATIONAL_PERMISSIONS: readonly AdminPermission[] = [
  'platform_users.manage',
  'professionals.manage',
  'spaces.manage',
  'events.manage',
  'communities.manage',
  'content.moderate',
  'reports.read',
]

export const ADMIN_PERMISSIONS: Record<AdminType, readonly AdminPermission[]> = {
  general: GENERAL_PERMISSIONS,
  operacional: OPERATIONAL_PERMISSIONS,
}

export function parseAdminType(value: unknown): AdminType | null {
  return value === 'general' || value === 'operacional' ? value : null
}

export function adminHasPermission(adminType: AdminType, permission: AdminPermission) {
  return ADMIN_PERMISSIONS[adminType].includes(permission)
}
