'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, CalendarDays, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'

type UserProfile = { id: string; avatar_url?: string | null } | null

export function MobileBottomBar({ userProfile }: { userProfile: UserProfile }) {
  const pathname = usePathname()
  const isLoggedIn = !!userProfile
  const tabs = [
    { name: 'Feed', href: '/feed', icon: Home },
    { name: 'Pesquisa', href: '/pesquisa', icon: Search },
    { name: 'Eventos', href: '/eventos', icon: CalendarDays },
    { name: 'Mensagens', href: isLoggedIn ? '/dashboard/mensagens' : '/auth/login?redirect=/dashboard/mensagens', icon: MessageCircle },
    { name: 'Perfil', href: isLoggedIn ? '/dashboard/perfil' : '/auth/login?redirect=/dashboard/perfil', icon: User, isAvatar: true },
  ]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden" aria-label="Navegação principal">
      <div className="grid h-16 grid-cols-5 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = pathname === tab.href || (!tab.href.startsWith('/auth/') && pathname.startsWith(tab.href))
          return (
            <Link key={tab.name} href={tab.href} aria-current={isActive ? 'page' : undefined} className={cn('flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium transition-colors', isActive ? 'text-primary' : 'text-muted-foreground active:text-foreground')}>
              {tab.isAvatar && userProfile?.avatar_url ? (
                <div className={cn('h-6 w-6 overflow-hidden rounded-full border-2', isActive ? 'border-primary' : 'border-transparent')}><img src={userProfile.avatar_url} alt="" className="h-full w-full object-cover" /></div>
              ) : <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />}
              <span className="max-w-full truncate">{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
