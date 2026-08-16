export type PlatformRole = 'athlete' | 'professional' | 'venue_manager'
export type AccessRole = PlatformRole | 'admin'

export function parsePlatformRole(value: unknown): PlatformRole | null {
  if (value === 'athlete' || value === 'atleta' || value === 'user' || value === 'utilizador') return 'athlete'
  if (value === 'professional' || value === 'profissional') return 'professional'
  if (value === 'venue_manager' || value === 'sport_space' || value === 'espaco' || value === 'gestor_espaco') return 'venue_manager'
  return null
}

export function normalizePlatformRole(value: unknown): PlatformRole {
  return parsePlatformRole(value) ?? 'athlete'
}

export function canCreatePostForRole(role: PlatformRole): boolean {
  return role === 'professional' || role === 'venue_manager'
}
