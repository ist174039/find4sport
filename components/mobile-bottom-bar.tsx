'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { mobilePrimaryNavigation, resolvePublicHref } from '@/lib/navigation/public'

type UserProfile = { id: string; avatar_url?: string | null } | null

export function MobileBottomBar({ userProfile }: { userProfile: UserProfile }) {
  const pathname = usePathname()
  const isLoggedIn = !!userProfile

  if (pathname.startsWith('/dashboard/')) return null

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden" aria-label="Navegação principal">
      <div className="grid h-16 grid-cols-5 px-1">
        {mobilePrimaryNavigation.map((item) => {
          const href = resolvePublicHref(item, isLoggedIn)
          const Icon = item.icon
          const isActive = !href.startsWith('/auth/') && (pathname === item.href || pathname.startsWith(`${item.href}/`))
          const isProfile = item.name === 'Perfil'
          return (
            <Link key={item.name} href={href} aria-current={isActive ? 'page' : undefined} className={cn('flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium transition-colors', isActive ? 'text-primary' : 'text-muted-foreground active:text-foreground')}>
              {isProfile && userProfile?.avatar_url ? (
                <div className={cn('h-6 w-6 overflow-hidden rounded-full border-2', isActive ? 'border-primary' : 'border-transparent')}><img src={userProfile.avatar_url} alt="" className="h-full w-full object-cover" /></div>
              ) : <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />}
              <span className="max-w-full truncate">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
