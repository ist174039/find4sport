'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  Star,
  Shield,
  Settings,
  Menu,
  LogOut,
  FileText,
  Flag,
  BarChart,
  Database,
  Tags,
} from 'lucide-react'

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Profissionais',
    href: '/admin/profissionais',
    icon: Users,
  },
  {
    title: 'Espacos',
    href: '/admin/espacos',
    icon: Building2,
  },
  {
    title: 'Eventos',
    href: '/admin/eventos',
    icon: Calendar,
  },
  {
    title: 'Avaliacoes',
    href: '/admin/avaliacoes',
    icon: Star,
  },
  {
    title: 'Moderacao',
    href: '/admin/moderacao',
    icon: Flag,
  },
  {
    title: 'Utilizadores',
    href: '/admin/utilizadores',
    icon: Shield,
  },
  {
    title: 'Importacao',
    href: '/admin/importacao',
    icon: Database,
  },
  {
    title: 'Categorias',
    href: '/admin/categorias',
    icon: Tags,
  },
  {
    title: 'Relatorios',
    href: '/admin/relatorios',
    icon: BarChart,
  },
  {
    title: 'Audit Log',
    href: '/admin/audit',
    icon: FileText,
  },
  {
    title: 'Definicoes',
    href: '/admin/definicoes',
    icon: Settings,
  },
]

interface AdminSidebarProps {
  adminUser: {
    role: string
  }
}

export function AdminSidebar({ adminUser }: AdminSidebarProps) {
  const pathname = usePathname()

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-lg">FIND4SPORT</span>
            <Badge variant="secondary" className="ml-2 text-xs">
              Admin
            </Badge>
          </div>
        </Link>
      </div>

      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium">Administrador</p>
            <p className="text-xs text-muted-foreground capitalize">{adminUser.role}</p>
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

      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 border-r bg-card">
        <SidebarContent />
      </aside>
    </>
  )
}
