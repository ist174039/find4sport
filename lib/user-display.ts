import { parsePlatformRole } from '@/lib/auth/roles'

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
  const role = parsePlatformRole(type)
  if (role === 'professional') return 'Profissional'
  if (role === 'venue_manager') return 'Gestor de espaço'
  if (role === 'event_manager') return 'Gestor de eventos'
  return 'Atleta'
}

export function getUserDisplayName(input: UserDisplayInput): string {
  const role = parsePlatformRole(input.type)

  if (role === 'professional') {
    return input.professional_name || input.professional_full_name || input.full_name || 'Profissional'
  }

  if (role === 'venue_manager') {
    return input.space_name || input.full_name || 'Espaço'
  }

  if (role === 'event_manager') return input.full_name || 'Gestor de eventos'

  return input.full_name || 'Atleta'
}

export function getUserAvatarUrl(input: UserDisplayInput): string {
  const role = parsePlatformRole(input.type)

  if (role === 'professional') {
    return input.professional_avatar_url || input.avatar_url || ''
  }

  if (role === 'venue_manager') {
    return input.space_logo_url || input.avatar_url || ''
  }

  return input.avatar_url || ''
}
