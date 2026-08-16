export const PLATFORM_ROLES = ['athlete', 'professional', 'venue_manager'] as const

export type PlatformRole = (typeof PLATFORM_ROLES)[number]
export type AccessRole = PlatformRole | 'admin'

export function isPlatformRole(value: unknown): value is PlatformRole {
  return typeof value === 'string' && PLATFORM_ROLES.includes(value as PlatformRole)
}

/**
 * Temporary compatibility boundary for persisted legacy values.
 * New application code must only write canonical PlatformRole values.
 * Remove this function after the role-normalization migration has been applied.
 */
export function parsePersistedPlatformRole(value: unknown): PlatformRole | null {
  if (isPlatformRole(value)) return value

  switch (value) {
    case 'atleta':
    case 'user':
    case 'utilizador':
      return 'athlete'
    case 'profissional':
      return 'professional'
    case 'sport_space':
    case 'espaco':
    case 'gestor_espaco':
      return 'venue_manager'
    default:
      return null
  }
}

export function canCreatePostForRole(role: PlatformRole): boolean {
  return role === 'professional' || role === 'venue_manager'
}
