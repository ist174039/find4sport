export type PlatformRole = 'athlete' | 'professional' | 'venue_manager' | 'admin'

export function normalizePlatformRole(value: unknown): PlatformRole {
  if (value === 'professional' || value === 'profissional') return 'professional'
  if (value === 'venue_manager' || value === 'espaco' || value === 'gestor_espaco') return 'venue_manager'
  if (value === 'admin') return 'admin'
  return 'athlete'
}

export function canCreatePostForRole(role: PlatformRole): boolean {
  return role === 'professional' || role === 'venue_manager' || role === 'admin'
}