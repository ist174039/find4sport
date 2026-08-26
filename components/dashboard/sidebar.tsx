'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { AppImage } from '@/components/ui/app-image'
import type { PlatformRole } from '@/lib/auth/roles'
import { getDashboardNavigation, getDashboardPrimaryNavigation } from '@/lib/navigation/dashboard'
import { createClient } from '@/lib/supabase/client'

type ProfessionalIdentity = { full_name?: string | null; professional_name?: string | null; avatar_url?: string | null }
type SpaceIdentity = { id: string; name?: string | null; logo_url?: string | null }
type DashboardUser = { id: string; user_metadata?: { full_name?: string | null; avatar_url?: string | null } | null }
type Identity = { name: string; label: string; avatar: string | null; fallback: string }
type NavigationGroups = ReturnType<typeof getDashboardNavigation>

interface DashboardSidebarProps { role: PlatformRole; professional: ProfessionalIdentity | null; spaces?: SpaceIdentity[]; user?: DashboardUser | null; notificationCount?: number }
interface SidebarContentProps { mobile?: boolean; identity: Identity; groups: NavigationGroups; unread: number; isActive: (href: string) => boolean; hrefFor: (href: string) => string; spaces: SpaceIdentity[]; selectedSpaceId: string; onSelectSpace: (id: string) => void; onNavigate: () => void }

function SidebarContent({ mobile = false, identity, groups, unread, isActive, hrefFor, spaces, selectedSpaceId, onSelectSpace, onNavigate }: SidebarContentProps) {
  return <div className="flex h-full min-h-0 flex-col overflow-hidden bg-card"><div className={mobile ? 'shrink-0 border-b px-3 py-2.5' : 'shrink-0 border-b p-5'}><Link href="/" onClick={onNavigate} className="flex min-h-11 items-center gap-2.5 pr-8"><div className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-400 ${mobile ? 'h-8 w-8' : 'h-10 w-10'}`}><span className="font-bold text-white">F4S</span></div><span className={`${mobile ? 'text-base' : 'text-xl'} truncate font-bold`}>FIND<span className="text-primary">4</span>SPORT</span></Link></div><div className={mobile ? 'shrink-0 border-b px-3 py-2.5' : 'shrink-0 border-b p-4'}><div className="flex min-h-11 items-center gap-3"><div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary ${mobile ? 'h-9 w-9' : 'h-11 w-11'}`}>{identity.avatar ? <AppImage src={identity.avatar} alt={identity.name} fill sizes={mobile ? '36px' : '44px'} className="object-cover" /> : identity.fallback}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{identity.name}</p><p className="truncate text-xs text-muted-foreground">{identity.label}</p></div></div>{spaces.length > 1 && <label className="mt-3 block"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Espaço em gestão</span><select value={selectedSpaceId} onChange={event => onSelectSpace(event.target.value)} className="min-h-10 w-full rounded-xl border bg-background px-3 text-sm font-medium">{spaces.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}</div><ScrollArea className="min-h-0 flex-1"><nav className={`${mobile ? 'space-y-3 py-2' : 'space-y-4 py-3'} px-2 pb-6`}>{groups.map(group => <div key={group.label}><p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70">{group.label}</p><div className="space-y-0.5">{group.items.map(item => { const active = isActive(item.href); return <Link key={item.href} href={hrefFor(item.href)} onClick={onNavigate} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${active ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><item.icon className="h-5 w-5 shrink-0" /><span className="min-w-0 flex-1 truncate">{item.name}</span>{item.badge === 'notifications' && unread > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">{unread > 9 ? '9+' : unread}</span>}</Link> })}</div></div>)}</nav></ScrollArea><div className={`shrink-0 border-t ${mobile ? 'space-y-1 p-2 pb-[max(.75rem,env(safe-area-inset-bottom))]' : 'space-y-2 p-4'}`}><Button asChild variant="outline" className="min-h-11 w-full justify-start rounded-xl"><Link href="/" onClick={onNavigate}>Ver site</Link></Button><form action="/auth/logout" method="POST"><Button variant="ghost" className="min-h-11 w-full justify-start gap-3 rounded-xl" type="submit"><LogOut className="h-5 w-5" />Terminar sessão</Button></form></div></div>
}

export function DashboardSidebar({ role, professional, spaces = [], user, notificationCount = 0 }: DashboardSidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unread, setUnread] = useState(notificationCount)
  const groups = getDashboardNavigation(role)
  const primary = getDashboardPrimaryNavigation(role)
  const immersive = pathname.startsWith('/dashboard/mensagens')
  const userId = user?.id
  const requestedSpaceId = searchParams.get('space') || ''
  const selectedSpace = spaces.find(item => item.id === requestedSpaceId) || spaces[0] || null
  const selectedSpaceId = selectedSpace?.id || ''
  const hrefFor = (href: string) => role === 'venue_manager' && selectedSpaceId ? `${href}?space=${encodeURIComponent(selectedSpaceId)}` : href
  const selectSpace = (id: string) => { const params = new URLSearchParams(searchParams.toString()); params.set('space', id); router.push(`${pathname}?${params.toString()}`); setMobileOpen(false) }

  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    let active = true
    const refresh = async () => { const { count } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', userId).is('read_at', null); if (active) setUnread(count || 0) }
    void refresh()
    const channel = supabase.channel(`dashboard-sidebar-notifications-${userId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => { void refresh() }).subscribe()
    return () => { active = false; void supabase.removeChannel(channel) }
  }, [userId])

  const identity: Identity = role === 'venue_manager'
    ? { name: selectedSpace?.name || 'Espaços', label: spaces.length > 1 ? `Gestor · ${spaces.length} espaços` : 'Gestor de espaço', avatar: selectedSpace?.logo_url || null, fallback: selectedSpace?.name?.charAt(0) || 'E' }
    : role === 'professional'
      ? { name: professional?.full_name || professional?.professional_name || 'Profissional', label: 'Profissional', avatar: professional?.avatar_url || null, fallback: professional?.full_name?.charAt(0) || professional?.professional_name?.charAt(0) || 'P' }
      : { name: user?.user_metadata?.full_name || 'Atleta', label: 'Atleta', avatar: user?.user_metadata?.avatar_url || null, fallback: user?.user_metadata?.full_name?.charAt(0) || 'A' }
  const isActive = (href: string) => href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
  const closeMobile = () => setMobileOpen(false)

  return <>{!immersive && <div className="fixed inset-x-0 top-0 z-40 flex h-16 items-center border-b bg-background/95 px-3 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden"><Link href={hrefFor('/dashboard')} className="flex min-h-11 items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-400"><span className="text-sm font-bold text-white">F4S</span></div><span className="text-sm font-bold">FIND<span className="text-primary">4</span>SPORT</span></Link></div>}<nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"><div className="grid h-16 grid-cols-5 px-1">{primary.map(item => { const active = isActive(item.href); return <Link key={item.href} href={hrefFor(item.href)} className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium ${active ? 'text-primary' : 'text-muted-foreground'}`}><item.icon className="h-5 w-5" /><span className="max-w-full truncate">{item.name}</span></Link> })}<button type="button" onClick={() => setMobileOpen(true)} className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium text-muted-foreground"><Menu className="h-5 w-5" /><span>Mais</span></button></div></nav><Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetContent side="right" className="flex h-[100dvh] max-h-[100dvh] w-[min(88vw,320px)] min-h-0 flex-col overflow-hidden gap-0 p-0 pt-[env(safe-area-inset-top)]"><SidebarContent mobile identity={identity} groups={groups} unread={unread} isActive={isActive} hrefFor={hrefFor} spaces={role === 'venue_manager' ? spaces : []} selectedSpaceId={selectedSpaceId} onSelectSpace={selectSpace} onNavigate={closeMobile} /></SheetContent></Sheet><aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r bg-card lg:flex"><SidebarContent identity={identity} groups={groups} unread={unread} isActive={isActive} hrefFor={hrefFor} spaces={role === 'venue_manager' ? spaces : []} selectedSpaceId={selectedSpaceId} onSelectSpace={selectSpace} onNavigate={() => undefined} /></aside></>
}
