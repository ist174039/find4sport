import type { LucideIcon } from 'lucide-react'
import { Activity, CalendarDays, Home, MapPin, MessageCircle, Rss, Search, User, Users } from 'lucide-react'

export type PublicNavItem = {
  name: string
  href: string
  icon: LucideIcon
  requiresAuth?: boolean
  mobilePrimary?: boolean
}

export const publicPrimaryNavigation: PublicNavItem[] = [
  { name: 'Feed', href: '/feed', icon: Rss, mobilePrimary: true },
  { name: 'Profissionais', href: '/profissionais', icon: Users },
  { name: 'Espaços', href: '/espacos', icon: MapPin },
  { name: 'Eventos', href: '/eventos', icon: CalendarDays, mobilePrimary: true },
]

export const publicSecondaryNavigation: PublicNavItem[] = [
  { name: 'Comunidades', href: '/comunidades', icon: Users },
  { name: 'Modalidades', href: '/modalidades', icon: Activity },
]

export const mobilePrimaryNavigation: PublicNavItem[] = [
  { name: 'Feed', href: '/feed', icon: Home, mobilePrimary: true },
  { name: 'Pesquisa', href: '/pesquisa', icon: Search, mobilePrimary: true },
  { name: 'Eventos', href: '/eventos', icon: CalendarDays, mobilePrimary: true },
  { name: 'Mensagens', href: '/dashboard/mensagens', icon: MessageCircle, requiresAuth: true, mobilePrimary: true },
  { name: 'Perfil', href: '/dashboard/perfil', icon: User, requiresAuth: true, mobilePrimary: true },
]

export function resolvePublicHref(item: PublicNavItem, isLoggedIn: boolean) {
  if (!item.requiresAuth || isLoggedIn) return item.href
  return `/auth/login?redirect=${encodeURIComponent(item.href)}`
}
