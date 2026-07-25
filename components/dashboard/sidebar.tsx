'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
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
} from 'lucide-react'

interface DashboardSidebarProps {
  professional: any | null
  space: any | null
}

export function DashboardSidebar({ professional, space }: DashboardSidebarProps) {
  const pathname = usePathname()
  
  const basePath = '/dashboard'

  let navItems = []

  if (space) {
    navItems = [
      { name: 'Visão Geral', href: basePath, icon: LayoutDashboard },
      { name: 'Reservas', href: `${basePath}/reservas`, icon: CalendarCheck },
      { name: 'O Meu Espaço', href: `${basePath}/espaco`, icon: Building2 },
      { name: 'Galeria', href: `${basePath}/galeria`, icon: Camera },
      { name: 'Clientes', href: `${basePath}/clientes`, icon: Users },
      { name: 'Faturação', href: `${basePath}/faturacao`, icon: DollarSign },
      { name: 'Mensagens', href: `${basePath}/mensagens`, icon: MessageSquare },
      { name: 'Avaliações', href: `${basePath}/avaliacoes`, icon: Star },
      { name: 'Notificações', href: `${basePath}/notificacoes`, icon: Bell },
      { name: 'Definições', href: `${basePath}/definicoes`, icon: Settings },
    ]
  } else if (professional) {
    navItems = [
      { name: 'Visão Geral', href: basePath, icon: LayoutDashboard },
      { name: 'O Meu Perfil', href: `${basePath}/perfil`, icon: User },
      { name: 'Agenda & Eventos', href: `${basePath}/agenda`, icon: Calendar },
      { name: 'Clientes', href: `${basePath}/clientes`, icon: Users },
      { name: 'Serviços', href: `${basePath}/servicos`, icon: Activity },
      { name: 'Galeria', href: `${basePath}/galeria`, icon: Camera },
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
      { name: 'O Meu Perfil', href: `${basePath}/perfil`, icon: User },
      { name: 'Notificações', href: `${basePath}/notificacoes`, icon: Bell },
      { name: 'Definições', href: `${basePath}/definicoes`, icon: Settings },
    ]
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-400 shadow-sm">
            <span className="text-lg font-bold text-white">F4S</span>
          </div>
          <span className="hidden text-xl font-bold tracking-tight text-foreground sm:block">
            F<span className="text-primary">4</span>S
          </span>
        </Link>
      </div>

      <div className="p-4 border-b">
        {space ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {space.name?.charAt(0) || 'E'}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">{space.name}</p>
              <p className="text-xs text-muted-foreground truncate">Gestor de Espaço</p>
            </div>
          </div>
        ) : professional ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden">
              {professional.avatar_url ? (
                <img src={professional.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                  {professional.full_name?.charAt(0) || 'P'}
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">{professional.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">Profissional</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
              U
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">Utilizador</p>
              <p className="text-xs text-muted-foreground truncate">Atleta</p>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item: any) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                  ${
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <item.icon className="h-4 w-4" />
                {item.name || item.title}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t space-y-2">
        <Link href="/" className="block">
          <Button variant="outline" className="w-full justify-start gap-3">
            Ver site
          </Button>
        </Link>
        <form action="/auth/logout" method="POST">
          <Button variant="ghost" className="w-full justify-start gap-3" type="submit">
            <LogOut className="h-4 w-4" />
            Terminar sessao
          </Button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            }
          />
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 border-r bg-card">
        <SidebarContent />
      </aside>
    </>
  )
}
