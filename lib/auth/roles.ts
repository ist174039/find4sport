export const PLATFORM_ROLES = ['athlete', 'professional', 'venue_manager'] as const

export type PlatformRole = (typeof PLATFORM_ROLES)[number]
export type AccessRole = PlatformRole | 'admin'

export function isPlatformRole(value: unknown): value is PlatformRole {
  return typeof value === 'string' && PLATFORM_ROLES.includes(value as PlatformRole)
}

export function parsePlatformRole(value: unknown): PlatformRole | null {
  return isPlatformRole(value) ? value : null
}

export function normalizePlatformRole(value: unknown): PlatformRole {
  const role = parsePlatformRole(value)
  if (!role) {
    throw new Error(`Invalid platform role: ${String(value)}`)
  }
  return role
}

export function canCreatePostForRole(role: PlatformRole): boolean {
  return role === 'professional' || role === 'venue_manager'
}
