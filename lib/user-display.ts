import { normalizePlatformRole } from '@/lib/auth/roles'

type UserDisplayInput = {
  type?: string | null
  full_name?: string | null
  avatar_url?: string | null
  professional_name?: string | null
  professional_full_name?: string | null
  professional_avatar_url?: string | null
  space_name?: string | null
  space_logo_url?: string | null
}

export function getUserRoleLabel(type: string | null | undefined): string {
  const role = normalizePlatformRole(type)
  if (role === 'professional') return 'Profissional'
  if (role === 'venue_manager') return 'Espaço'
  if (role === 'admin') return 'Administrador'
  return 'Utilizador'
}

export function getUserDisplayName(input: UserDisplayInput): string {
  const role = normalizePlatformRole(input.type)

  if (role === 'professional') {
    return input.professional_name || input.professional_full_name || input.full_name || 'Profissional'
  }

  if (role === 'venue_manager') {
    return input.space_name || input.full_name || 'Espaço'
  }

  return input.full_name || 'Utilizador'
}

export function getUserAvatarUrl(input: UserDisplayInput): string {
  const role = normalizePlatformRole(input.type)

  if (role === 'professional') {
    return input.professional_avatar_url || input.avatar_url || ''
  }

  if (role === 'venue_manager') {
    return input.space_logo_url || input.avatar_url || ''
  }

  return input.avatar_url || ''
}
