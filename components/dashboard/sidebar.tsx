'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  User,
  Settings,
  Star,
  MessageSquare,
  Calendar,
  Heart,
  Bell,
  Menu,
  LogOut,
  Briefcase,
  MapPin,
  Users,
  Image,
  FileText,
  BarChart3,
  Trophy,
  Shield,
} from 'lucide-react'
import type { Professional } from '@/lib/types'

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Meu Perfil',
    href: '/dashboard/perfil',
    icon: User,
  },
  {
    title: 'Servicos',
    href: '/dashboard/servicos',
    icon: Briefcase,
  },
  {
    title: 'Galeria',
    href: '/profissional/galeria',
    icon: Image,
  },
  {
    title: 'Documentos',
    href: '/profissional/documentos',
    icon: FileText,
  },
  {
    title: 'Criar Evento',
    href: '/criar-evento',
    icon: Calendar,
  },
  {
    title: 'Avaliacoes',
    href: '/dashboard/avaliacoes',
    icon: Star,
  },
  {
    title: 'Mensagens',
    href: '/mensagens',
    icon: MessageSquare,
  },
  {
    title: 'Favoritos',
    href: '/favoritos',
    icon: Heart,
  },
  {
    title: 'Pedidos de Contacto',
    href: '/dashboard/contactos',
    icon: Users,
  },
  {
    title: 'Agenda',
    href: '/dashboard/agenda',
    icon: Calendar,
  },
  {
    title: 'Espacos Associados',
    href: '/dashboard/espacos',
    icon: MapPin,
  },
  {
    title: 'Estatisticas',
    href: '/profissional/estatisticas',
    icon: BarChart3,
  },
  {
    title: 'Gamificacao',
    href: '/dashboard/gamificacao',
    icon: Trophy,
  },
  {
    title: 'Pontuacao de Confianca',
    href: '/dashboard/trust-score',
    icon: Shield,
  },
  {
    title: 'Notificacoes',
    href: '/notificacoes',
    icon: Bell,
  },
  {
    title: 'Definicoes',
    href: '/definicoes',
    icon: Settings,
  },
]

interface DashboardSidebarProps {
  professional: Professional | null
}

export function DashboardSidebar({ professional }: DashboardSidebarProps) {
  const pathname = usePathname()

  const displayName = professional?.professional_name || professional?.full_name || 'Utilizador'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">F4S</span>
          </div>
          <span className="font-bold text-lg">FIND4SPORT</span>
        </Link>
      </div>

      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={professional?.avatar_url || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">
              {professional?.status === 'active' ? 'Perfil ativo' : 'Perfil pendente'}
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t">
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
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
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
