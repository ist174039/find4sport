"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'

type UserProfile = {
  id: string
  avatar_url?: string | null
} | null

export function MobileBottomBar({ userProfile }: { userProfile: UserProfile }) {
  const pathname = usePathname()
  const isLoggedIn = !!userProfile

  const tabs = [
    { name: 'Feed', href: '/feed', icon: Home, isCenter: false },
    { name: 'Pesquisa', href: '/pesquisa', icon: Search, isCenter: false },
    { name: 'Criar', href: isLoggedIn ? '/dashboard/reservas' : '/auth/login', icon: Plus, isCenter: true },
    { name: 'Mensagens', href: isLoggedIn ? '/dashboard/mensagens' : '/auth/login', icon: MessageCircle, isCenter: false },
    { name: 'Perfil', href: isLoggedIn ? '/dashboard/perfil' : '/auth/login', icon: User, isCenter: false, isAvatar: true },
  ]

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-14 sm:h-16 bg-background/95 backdrop-blur-md border-t border-border/40 md:hidden flex items-center justify-around pb-safe px-2">
      {tabs.map((tab) => {
        const Icon = tab.icon
        // Match exact or startsWith depending on the route
        const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
        
        if (tab.isCenter) {
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="flex items-center justify-center -mt-6 rounded-full w-14 h-14 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-transform"
            >
              <Icon className="h-6 w-6 stroke-[2.5]" />
            </Link>
          )
        }

        if (tab.isAvatar && userProfile?.avatar_url) {
           return (
            <Link
              key={tab.name}
              href={tab.href}
              className="flex items-center justify-center h-full w-12"
            >
              <div className={cn(
                "w-7 h-7 rounded-full overflow-hidden border-2 transition-all",
                isActive ? "border-foreground" : "border-transparent opacity-70"
              )}>
                <img src={userProfile.avatar_url} alt="Perfil" className="w-full h-full object-cover" />
              </div>
            </Link>
          )
        }

        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "flex flex-col items-center justify-center h-full w-12 transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon 
              className={cn("h-[26px] w-[26px] transition-all", isActive ? "stroke-[2.5]" : "stroke-[1.5]")} 
              fill={isActive ? "currentColor" : "none"} 
            />
          </Link>
        )
      })}
    </div>
  )
}
