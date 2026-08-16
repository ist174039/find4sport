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
  { name: 'Eventos', href: '/eventos', icon: CalendarDays },
]

export const publicSecondaryNavigation: PublicNavItem[] = [
  { name: 'Comunidades', href: '/comunidades', icon: Users },
  { name: 'Modalidades', href: '/modalidades', icon: Activity },
]

export const mobileSecondaryNavigation: PublicNavItem[] = [
  { name: 'Profissionais', href: '/profissionais', icon: Users },
  { name: 'Espaços', href: '/espacos', icon: MapPin },
  { name: 'Eventos', href: '/eventos', icon: CalendarDays },
  ...publicSecondaryNavigation,
]

// Keep five stable destinations in the bottom bar. Discovery sections live in
// the right-side "Mais" drawer to avoid an overcrowded mobile navigation bar.
export const mobilePrimaryNavigation: PublicNavItem[] = [
  { name: 'Início', href: '/', icon: Home, mobilePrimary: true },
  { name: 'Feed', href: '/feed', icon: Rss, mobilePrimary: true },
  { name: 'Pesquisa', href: '/pesquisa', icon: Search, mobilePrimary: true },
  { name: 'Mensagens', href: '/dashboard/mensagens', icon: MessageCircle, requiresAuth: true, mobilePrimary: true },
  { name: 'Perfil', href: '/dashboard/perfil', icon: User, requiresAuth: true, mobilePrimary: true },
]

export function resolvePublicHref(item: PublicNavItem, isLoggedIn: boolean) {
  if (!item.requiresAuth || isLoggedIn) return item.href
  return `/auth/login?redirect=${encodeURIComponent(item.href)}`
}
