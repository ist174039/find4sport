'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import type { PlatformRole } from '@/lib/auth/roles'
import { getDashboardNavigation, getDashboardPrimaryNavigation } from '@/lib/navigation/dashboard'

interface DashboardSidebarProps {
  role: PlatformRole
  professional: any | null
  space: any | null
  user?: any | null
  notificationCount?: number
}

export function DashboardSidebar({ role, professional, space, user, notificationCount = 0 }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const groups = getDashboardNavigation(role)
  const primary = getDashboardPrimaryNavigation(role)
  const immersive = pathname.startsWith('/dashboard/mensagens')

  const identity = role === 'venue_manager'
    ? { name: space?.name || 'Espaço', label: 'Gestor de Espaço', avatar: space?.logo_url || null, fallback: space?.name?.charAt(0) || 'E' }
    : role === 'professional'
      ? { name: professional?.full_name || professional?.professional_name || 'Profissional', label: 'Profissional', avatar: professional?.avatar_url || null, fallback: professional?.full_name?.charAt(0) || 'P' }
      : { name: user?.user_metadata?.full_name || 'Atleta', label: 'Atleta', avatar: user?.user_metadata?.avatar_url || null, fallback: user?.user_metadata?.full_name?.charAt(0) || 'A' }

  const isActive = (href: string) => href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-card">
      <div className={mobile ? 'shrink-0 border-b px-3 py-2.5' : 'shrink-0 border-b p-5'}>
        <Link href="/" onClick={() => mobile && setMobileOpen(false)} className="flex min-h-10 items-center gap-2.5 pr-8">
          <div className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-400 shadow-sm ${mobile ? 'h-8 w-8' : 'h-10 w-10'}`}><span className={`${mobile ? 'text-sm' : 'text-lg'} font-bold text-white`}>F4S</span></div>
          <span className={`${mobile ? 'text-base' : 'text-xl'} truncate font-bold tracking-tight text-foreground`}>FIND<span className="text-primary">4</span>SPORT</span>
        </Link>
      </div>

      <div className={mobile ? 'shrink-0 border-b px-3 py-2.5' : 'shrink-0 border-b p-4'}>
        <div className={`flex items-center gap-3 ${mobile ? 'min-h-10' : 'min-h-12'}`}>
          <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary ${mobile ? 'h-9 w-9' : 'h-11 w-11'}`}>{identity.avatar ? <img src={identity.avatar} alt="Perfil" className="h-full w-full object-cover" /> : identity.fallback}</div>
          <div className="min-w-0"><p className="truncate text-sm font-semibold">{identity.name}</p><p className="truncate text-xs text-muted-foreground">{identity.label}</p></div>
        </div>
      </div>

      <ScrollArea className={`min-h-0 flex-1 ${mobile ? 'py-2' : 'py-3'}`}>
        <nav className={`${mobile ? 'space-y-3' : 'space-y-4'} px-2 pb-2`}>
          {groups.map(group => <div key={group.label}>
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70">{group.label}</p>
            <div className="space-y-0.5">{group.items.map(item => {
              const active = isActive(item.href)
              return <Link key={item.href} href={item.href} onClick={() => mobile && setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 text-sm transition-colors ${mobile ? 'min-h-10 py-2' : 'min-h-11 py-2.5'} ${active ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted'}`}>
                <item.icon className={`${mobile ? 'h-4.5 w-4.5' : 'h-5 w-5'} shrink-0`}/><span className="min-w-0 flex-1 truncate">{item.name}</span>
                {item.badge === 'notifications' && notificationCount > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">{notificationCount > 9 ? '9+' : notificationCount}</span>}
              </Link>
            })}</div>
          </div>)}
        </nav>
      </ScrollArea>

      <div className={`shrink-0 border-t ${mobile ? 'space-y-1 p-2 pb-[max(.5rem,env(safe-area-inset-bottom))]' : 'space-y-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]'}`}>
        <Button asChild variant="outline" className={`${mobile ? 'min-h-10' : 'min-h-11'} w-full justify-start rounded-xl`}><Link href="/" onClick={() => mobile && setMobileOpen(false)}>Ver site</Link></Button>
        <form action="/auth/logout" method="POST"><Button variant="ghost" className={`${mobile ? 'min-h-10' : 'min-h-11'} w-full justify-start gap-3 rounded-xl`} type="submit"><LogOut className="h-5 w-5"/>Terminar sessão</Button></form>
      </div>
    </div>
  )

  return <>
    {!immersive && <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center border-b border-border/80 bg-background/95 px-3 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden"><Link href="/dashboard" className="flex min-h-11 items-center gap-2 rounded-xl px-1" aria-label="Painel Find4Sport"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-400 shadow-sm"><span className="text-sm font-bold text-white">F4S</span></div><span className="text-sm font-bold tracking-tight text-foreground">FIND<span className="text-primary">4</span>SPORT</span></Link></div>}

    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Navegação principal do painel"><div className="grid h-16 grid-cols-5 px-1">{primary.map(item => { const active=isActive(item.href); return <Link key={item.href} href={item.href} className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium ${active?'text-primary':'text-muted-foreground'}`}><item.icon className="h-5 w-5"/><span className="max-w-full truncate">{item.name}</span></Link>})}<button type="button" onClick={() => setMobileOpen(true)} className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium text-muted-foreground" aria-label="Abrir mais opções"><Menu className="h-5 w-5"/><span>Mais</span></button></div></nav>

    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetContent side="right" className="w-[min(84vw,300px)] gap-0 p-0 pt-[env(safe-area-inset-top)]"><SidebarContent mobile/></SheetContent></Sheet>
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r bg-card lg:flex"><SidebarContent/></aside>
  </>
}
