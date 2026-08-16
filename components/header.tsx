'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Bell, ChevronDown, Heart, LayoutDashboard, LogIn, LogOut, Menu, Search, Settings, User } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { mobileSecondaryNavigation, publicPrimaryNavigation, publicSecondaryNavigation } from '@/lib/navigation/public'

interface HeaderProps {
  user?: {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
  } | null
  notificationCount?: number
}

export function Header({ user, notificationCount = 0 }: HeaderProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/92 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-2.5" aria-label="FIND4SPORT - início">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-400 shadow-sm"><span className="text-sm font-bold text-white">F4S</span></div>
          <span className="hidden text-xl font-bold tracking-tight text-foreground sm:block">FIND<span className="text-primary">4</span>SPORT</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navegação principal">
          {publicPrimaryNavigation.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return <Link key={item.href} href={item.href} className={cn('flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors', active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')}><Icon className="h-4 w-4" />{item.name}</Link>
          })}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn('flex min-h-10 items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors', publicSecondaryNavigation.some(item => pathname === item.href || pathname.startsWith(`${item.href}/`)) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')}>
              Explorar <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {publicSecondaryNavigation.map((item) => <DropdownMenuItem key={item.href} render={<Link href={item.href} className="flex cursor-pointer items-center"><item.icon className="mr-2 h-4 w-4" />{item.name}</Link>} />)}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <div className="hidden sm:block"><ThemeToggle /></div>
          <Button variant="ghost" size="icon" asChild className="hidden sm:flex"><Link href="/pesquisa" aria-label="Pesquisar"><Search className="h-5 w-5" /></Link></Button>

          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild className="relative h-11 w-11"><Link href="/dashboard/notificacoes" aria-label="Notificações"><Bell className="h-5 w-5" />{notificationCount > 0 && <Badge variant="destructive" className="absolute right-0.5 top-0.5 h-5 min-w-5 rounded-full px-1 text-[10px]">{notificationCount > 9 ? '9+' : notificationCount}</Badge>}</Link></Button>
              <DropdownMenu>
                <DropdownMenuTrigger className="relative hidden h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-90 md:flex">
                  <Avatar className="h-9 w-9"><AvatarImage src={user.avatar_url || undefined} alt={user.full_name || user.email} /><AvatarFallback className="bg-primary font-bold text-primary-foreground">{user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <div className="p-2"><p className="truncate text-sm font-medium">{user.full_name || 'Utilizador'}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/dashboard" className="flex cursor-pointer items-center font-semibold text-primary"><LayoutDashboard className="mr-2 h-4 w-4" />Painel</Link>} />
                  <DropdownMenuItem render={<Link href="/dashboard/perfil" className="flex cursor-pointer items-center"><User className="mr-2 h-4 w-4" />O Meu Perfil</Link>} />
                  <DropdownMenuItem render={<Link href="/dashboard/favoritos" className="flex cursor-pointer items-center"><Heart className="mr-2 h-4 w-4" />Favoritos</Link>} />
                  <DropdownMenuItem render={<Link href="/dashboard/definicoes" className="flex cursor-pointer items-center"><Settings className="mr-2 h-4 w-4" />Definições</Link>} />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href="/auth/logout" prefetch={false} className="flex cursor-pointer items-center text-destructive"><LogOut className="mr-2 h-4 w-4" />Terminar sessão</Link>} />
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <><Button variant="ghost" asChild className="hidden sm:flex"><Link href="/auth/login"><LogIn className="mr-2 h-4 w-4" />Entrar</Link></Button><Button asChild size="sm" className="hidden sm:inline-flex"><Link href="/auth/registar">Registar</Link></Button></>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="h-11 w-11 md:hidden" aria-label="Mais opções"><Menu className="h-5 w-5" /></Button>} />
            <SheetContent side="right" className="w-[min(86vw,320px)] p-0">
              <SheetHeader className="border-b p-5 text-left"><SheetTitle>Mais</SheetTitle></SheetHeader>
              <div className="flex flex-col gap-1 p-3">
                <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Explorar</p>
                {mobileSecondaryNavigation.map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className={cn('flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors', pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
                    <item.icon className="h-5 w-5" />{item.name}
                  </Link>
                ))}

                <div className="my-2 border-t" />
                {user ? (
                  <>
                    <div className="mb-2 flex items-center gap-3 rounded-xl bg-muted/40 p-3"><Avatar className="h-10 w-10"><AvatarImage src={user.avatar_url || undefined} /><AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback></Avatar><div className="min-w-0"><p className="truncate text-sm font-semibold">{user.full_name || 'Utilizador'}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div></div>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-primary hover:bg-primary/10"><LayoutDashboard className="h-5 w-5" />Painel</Link>
                    <Link href="/dashboard/favoritos" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"><Heart className="h-5 w-5" />Favoritos</Link>
                    <Link href="/dashboard/definicoes" onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"><Settings className="h-5 w-5" />Definições</Link>
                    <Link href="/auth/logout" prefetch={false} onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-destructive hover:bg-destructive/10"><LogOut className="h-5 w-5" />Terminar sessão</Link>
                  </>
                ) : (
                  <div className="grid gap-2"><Button asChild variant="outline"><Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>Entrar</Link></Button><Button asChild><Link href="/auth/registar" onClick={() => setMobileMenuOpen(false)}>Criar conta</Link></Button></div>
                )}
                <div className="mt-3 border-t pt-3 sm:hidden"><ThemeToggle /></div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
