"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Rss, Search, CalendarPlus, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileBottomBar({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname()

  const tabs = [
    { name: 'Feed', href: '/feed', icon: Rss },
    { name: 'Pesquisa', href: '/pesquisa', icon: Search },
    { name: 'Reservas', href: isLoggedIn ? '/dashboard/reservas' : '/auth/login', icon: CalendarPlus },
    { name: 'Mensagens', href: isLoggedIn ? '/dashboard/mensagens' : '/auth/login', icon: MessageSquare },
    { name: 'Perfil', href: isLoggedIn ? '/dashboard/perfil' : '/auth/login', icon: User },
  ]

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border/40 md:hidden flex items-center justify-around pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon
        // Match exact or startsWith depending on the route
        const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
        
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 text-xs transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{tab.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
