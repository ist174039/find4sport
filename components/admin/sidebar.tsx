'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard, Users, Building2, Calendar, Star, Shield, Settings, Menu, LogOut,
  FileText, Flag, BarChart, Database, Tags, CreditCard, FileEdit, Layers3,
} from 'lucide-react'

const navigationGroups = [
  {
    label: 'Operação',
    items: [
      { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { title: 'Profissionais', href: '/admin/profissionais', icon: Users },
      { title: 'Espaços', href: '/admin/espacos', icon: Building2 },
      { title: 'Eventos', href: '/admin/eventos', icon: Calendar },
      { title: 'Utilizadores', href: '/admin/utilizadores', icon: Shield },
    ],
  },
  {
    label: 'Confiança & Conteúdo',
    items: [
      { title: 'Moderação', href: '/admin/moderacao', icon: Flag },
      { title: 'Avaliações', href: '/admin/avaliacoes', icon: Star },
      { title: 'Reivindicações', href: '/admin/reivindicacoes', icon: Shield },
      { title: 'Categorias', href: '/admin/categorias', icon: Tags },
      { title: 'Páginas (CMS)', href: '/admin/paginas', icon: FileEdit },
    ],
  },
  {
    label: 'Negócio',
    items: [
      { title: 'Faturação', href: '/admin/faturacao', icon: CreditCard },
      { title: 'Planos', href: '/admin/planos', icon: Layers3 },
      { title: 'Relatórios', href: '/admin/relatorios', icon: BarChart },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { title: 'Importação', href: '/admin/importacao', icon: Database },
      { title: 'Audit Log', href: '/admin/audit', icon: FileText },
      { title: 'Definições', href: '/admin/definicoes', icon: Settings },
    ],
  },
]

interface AdminSidebarProps { adminUser: { role: string } }

export function AdminSidebar({ adminUser }: AdminSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isActive = (href: string) => href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col bg-card">
      <div className="border-b p-5">
        <Link href="/admin" onClick={() => mobile && setMobileOpen(false)} className="flex min-h-11 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-400 shadow-sm"><span className="text-lg font-bold text-white">F4S</span></div>
          <span className="text-lg font-bold tracking-tight text-foreground">FIND<span className="text-primary">4</span>SPORT</span>
          <Badge variant="secondary" className="ml-auto px-1.5 py-0 text-[10px] font-bold uppercase tracking-wider">Admin</Badge>
        </Link>
      </div>

      <div className="border-b p-4">
        <div className="flex min-h-12 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><Shield className="h-5 w-5 text-primary" /></div>
          <div className="min-w-0"><p className="truncate font-medium">Administrador</p><p className="truncate text-xs capitalize text-muted-foreground">{adminUser.role}</p></div>
        </div>
      </div>

      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-4 px-2">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/70">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => mobile && setMobileOpen(false)} className={cn('flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors', isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                    <item.icon className="h-5 w-5 shrink-0" /><span className="truncate">{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="space-y-2 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button asChild variant="outline" className="min-h-11 w-full justify-start rounded-xl"><Link href="/" onClick={() => mobile && setMobileOpen(false)}>Ver site</Link></Button>
        <form action="/auth/logout" method="POST"><Button variant="ghost" className="min-h-11 w-full justify-start gap-3 rounded-xl" type="submit"><LogOut className="h-5 w-5" />Terminar sessão</Button></form>
      </div>
    </div>
  )

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-border/80 bg-background/95 px-3 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden">
        <Link href="/admin" className="flex min-h-11 items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-400"><span className="text-sm font-bold text-white">F4S</span></div><span className="text-sm font-bold">Admin</span></Link>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger render={<Button variant="outline" size="icon" className="h-11 w-11 rounded-xl" aria-label="Abrir menu de administração"><Menu className="h-5 w-5" /></Button>} />
          <SheetContent side="left" className="w-[min(90vw,320px)] p-0 pt-[env(safe-area-inset-top)]"><SidebarContent mobile /></SheetContent>
        </Sheet>
      </div>
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r bg-card lg:flex"><SidebarContent /></aside>
    </>
  )
}
