'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import type { PlatformRole } from '@/lib/auth/roles'
import {
  Calendar,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  LayoutDashboard,
  Star,
  Activity,
  User,
  Heart,
  CalendarCheck,
  Building2,
  DollarSign,
  Menu,
  Bell,
  Camera,
  UserRound,
} from 'lucide-react'

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
  const basePath = '/dashboard'

  let navItems = []

  if (role === 'venue_manager') {
    navItems = [
      { name: 'Visão Geral', href: basePath, icon: LayoutDashboard },
      { name: 'Agenda & Eventos', href: `${basePath}/agenda`, icon: Calendar },
      { name: 'Reservas', href: `${basePath}/reservas`, icon: CalendarCheck },
      { name: 'O Meu Espaço', href: `${basePath}/espaco`, icon: Building2 },
      { name: 'Salas / Campos', href: `${basePath}/espacos/salas`, icon: LayoutDashboard },
      { name: 'Galeria', href: `${basePath}/galeria`, icon: Camera },
      { name: 'Clientes', href: `${basePath}/clientes`, icon: Users },
      { name: 'Seguidores', href: `${basePath}/seguidores`, icon: UserRound },
      { name: 'Faturação', href: `${basePath}/faturacao`, icon: DollarSign },
      { name: 'Mensagens', href: `${basePath}/mensagens`, icon: MessageSquare },
      { name: 'Avaliações', href: `${basePath}/avaliacoes`, icon: Star },
      { name: 'Notificações', href: `${basePath}/notificacoes`, icon: Bell },
      { name: 'Definições', href: `${basePath}/definicoes`, icon: Settings },
    ]
  } else if (role === 'professional') {
    navItems = [
      { name: 'Visão Geral', href: basePath, icon: LayoutDashboard },
      { name: 'O Meu Perfil', href: `${basePath}/perfil`, icon: User },
      { name: 'Agenda & Eventos', href: `${basePath}/agenda`, icon: Calendar },
      { name: 'Clientes', href: `${basePath}/clientes`, icon: Users },
      { name: 'Seguidores', href: `${basePath}/seguidores`, icon: UserRound },
      { name: 'Serviços', href: `${basePath}/servicos`, icon: Activity },
      { name: 'Galeria', href: `${basePath}/galeria`, icon: Camera },
      { name: 'Faturação', href: `${basePath}/faturacao`, icon: DollarSign },
      { name: 'Mensagens', href: `${basePath}/mensagens`, icon: MessageSquare },
      { name: 'Avaliações', href: `${basePath}/avaliacoes`, icon: Star },
      { name: 'Notificações', href: `${basePath}/notificacoes`, icon: Bell },
      { name: 'Definições', href: `${basePath}/definicoes`, icon: Settings },
    ]
  } else {
    navItems = [
      { name: 'O Meu Painel', href: basePath, icon: LayoutDashboard },
      { name: 'Próximos Eventos', href: `${basePath}/eventos`, icon: CalendarCheck },
      { name: 'Mensagens', href: `${basePath}/mensagens`, icon: MessageSquare },
      { name: 'Favoritos', href: `${basePath}/favoritos`, icon: Heart },
      { name: 'A Seguir', href: `${basePath}/seguidores`, icon: UserRound },
      { name: 'O Meu Perfil', href: `${basePath}/perfil`, icon: User },
      { name: 'Notificações', href: `${basePath}/notificacoes`, icon: Bell },
      { name: 'Definições', href: `${basePath}/definicoes`, icon: Settings },
    ]
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col bg-card">
      <div className="border-b p-5">
        <Link href="/" onClick={() => mobile && setMobileOpen(false)} className="flex min-h-11 items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-400 shadow-sm">
            <span className="text-lg font-bold text-white">F4S</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            FIND<span className="text-primary">4</span>SPORT
          </span>
        </Link>
      </div>

      <div className="border-b p-4">
        {role === 'venue_manager' ? (
          <div className="flex min-h-12 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
              {space?.name?.charAt(0) || 'E'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{space?.name || 'Espaço'}</p>
              <p className="truncate text-xs text-muted-foreground">Gestor de Espaço</p>
            </div>
          </div>
        ) : role === 'professional' ? (
          <div className="flex min-h-12 items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-primary/10">
              {professional?.avatar_url ? (
                <img src={professional.avatar_url} alt="Perfil" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-bold text-primary">
                  {professional?.full_name?.charAt(0) || 'P'}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{professional?.full_name || 'Profissional'}</p>
              <p className="truncate text-xs text-muted-foreground">Profissional</p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-12 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary/10 font-bold text-secondary">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Perfil" className="h-full w-full object-cover" />
              ) : (
                user?.user_metadata?.full_name?.charAt(0) || 'A'
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.user_metadata?.full_name || 'Atleta'}</p>
              <p className="truncate text-xs text-muted-foreground">Atleta</p>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-1 px-2">
          {navItems.map((item: any) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => mobile && setMobileOpen(false)}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted'
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{item.name || item.title}</span>
                {item.name === 'Notificações' && notificationCount > 0 && (
                  <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="space-y-2 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button asChild variant="outline" className="min-h-11 w-full justify-start rounded-xl">
          <Link href="/" onClick={() => mobile && setMobileOpen(false)}>Ver site</Link>
        </Button>
        <form action="/auth/logout" method="POST">
          <Button variant="ghost" className="min-h-11 w-full justify-start gap-3 rounded-xl" type="submit">
            <LogOut className="h-5 w-5" />
            Terminar sessão
          </Button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border/80 bg-background/95 px-3 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden">
        <Link href="/dashboard" className="flex min-h-11 items-center gap-2 rounded-xl px-1" aria-label="Painel Find4Sport">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-400 shadow-sm">
            <span className="text-sm font-bold text-white">F4S</span>
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground sm:text-base">
            FIND<span className="text-primary">4</span>SPORT
          </span>
        </Link>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl" aria-label="Abrir menu">
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-[min(88vw,320px)] p-0 pt-[env(safe-area-inset-top)]">
            <SidebarContent mobile />
          </SheetContent>
        </Sheet>
      </div>

      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r bg-card lg:flex">
        <SidebarContent />
      </aside>
    </>
  )
}
