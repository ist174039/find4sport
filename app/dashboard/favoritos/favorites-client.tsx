'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight, CalendarDays, Heart, Loader2, LogOut, MapPin, Trash2, Users } from 'lucide-react'
import { removeFavoriteAction, leaveCommunityAction } from '@/app/actions/favorites'
import { useModal } from '@/components/providers/modal-provider'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

function FavoritesSection({ title, items, render }: { title: string; items: any[]; render: (item: any) => ReactNode }) {
  if (!items.length) return null
  return <section className="space-y-3 sm:space-y-4"><h2 className="text-lg font-bold">{title}</h2><div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">{items.map(render)}</div></section>
}

function RemoveButton({ id, busy, label, onClick, icon = 'trash' }: { id: string; busy: string | null; label: string; onClick: () => void; icon?: 'trash' | 'leave' }) {
  return <button type="button" disabled={busy === id} onClick={onClick} className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background/90 text-muted-foreground shadow-sm transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive active:scale-95 disabled:opacity-50" aria-label={label}>{busy === id ? <Loader2 className="h-4 w-4 animate-spin" /> : icon === 'leave' ? <LogOut className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}</button>
}

function CardLink({ href, label }: { href: string; label: string }) {
  return <Button asChild variant="outline" className="mt-4 min-h-11 w-full justify-between rounded-xl"><Link href={href}>{label}<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
}

export function FavoritesClient({ initial }: { initial: any }) {
  const { showAlert } = useModal()
  const [data, setData] = useState(initial)
  const [busy, setBusy] = useState<string | null>(null)

  const removeFavorite = async (id: string) => {
    setBusy(id)
    try {
      await removeFavoriteAction(id)
      setData((prev: any) => ({ ...prev, professionals: prev.professionals.filter((item: any) => item.id !== id), spaces: prev.spaces.filter((item: any) => item.id !== id), events: prev.events.filter((item: any) => item.id !== id) }))
      showAlert('Favorito removido', 'O item deixou de estar nos teus favoritos.', 'success')
    } catch (error: any) { showAlert('Erro', error?.message || 'Não foi possível remover o favorito.', 'error') } finally { setBusy(null) }
  }

  const leaveCommunity = async (memberId: string) => {
    setBusy(memberId)
    try {
      await leaveCommunityAction(memberId)
      setData((prev: any) => ({ ...prev, communities: prev.communities.filter((item: any) => item.memberId !== memberId) }))
      showAlert('Comunidade removida', 'Saíste da comunidade.', 'success')
    } catch (error: any) { showAlert('Não foi possível sair', error?.message || 'Tenta novamente.', 'error') } finally { setBusy(null) }
  }

  const total = data.professionals.length + data.spaces.length + data.events.length + data.communities.length
  if (!total) return <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center sm:p-12"><Heart className="mx-auto h-10 w-10 text-muted-foreground/40" /><h2 className="mt-4 text-lg font-bold">Ainda não guardaste nada</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Explora profissionais, espaços, eventos e comunidades.</p><Button asChild className="mt-5 min-h-11 w-full rounded-xl sm:w-auto"><Link href="/pesquisa">Explorar</Link></Button></div>

  return <div className="space-y-7 sm:space-y-8">
    <FavoritesSection title="Profissionais" items={data.professionals} render={(fav) => { const professional = fav.professional; return <article key={fav.id} className="relative rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"><RemoveButton id={fav.id} busy={busy} label="Remover profissional dos favoritos" onClick={() => void removeFavorite(fav.id)} /><h3 className="pr-14 font-bold leading-snug">{professional?.professional_name || professional?.full_name || 'Profissional'}</h3><p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /><span>{professional?.address || 'Localização não indicada'}</span></p><CardLink href={`/profissionais/${professional?.public_slug || professional?.id}`} label="Ver perfil" /></article> }} />
    <FavoritesSection title="Espaços" items={data.spaces} render={(fav) => { const space = fav.space; return <article key={fav.id} className="relative rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"><RemoveButton id={fav.id} busy={busy} label="Remover espaço dos favoritos" onClick={() => void removeFavorite(fav.id)} /><h3 className="pr-14 font-bold leading-snug">{space?.name || 'Espaço'}</h3><p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /><span>{space?.address || 'Localização não indicada'}</span></p><CardLink href={`/espacos/${space?.slug || space?.id}`} label="Ver espaço" /></article> }} />
    <FavoritesSection title="Eventos" items={data.events} render={(fav) => { const event = fav.event; return <article key={fav.id} className="relative rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"><RemoveButton id={fav.id} busy={busy} label="Remover evento dos favoritos" onClick={() => void removeFavorite(fav.id)} /><h3 className="pr-14 font-bold leading-snug">{event?.title || 'Evento'}</h3><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4 shrink-0" />{event?.start_date ? new Date(event.start_date).toLocaleDateString('pt-PT') : 'Data por definir'}</p><CardLink href={`/eventos/${event?.slug || event?.id}`} label="Ver evento" /></article> }} />
    <FavoritesSection title="Comunidades" items={data.communities} render={(item) => { const community = item.community; return <article key={item.memberId} className="relative rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"><RemoveButton id={item.memberId} busy={busy} label="Sair da comunidade" icon="leave" onClick={() => void leaveCommunity(item.memberId)} /><h3 className="pr-14 font-bold leading-snug">{community?.name || 'Comunidade'}</h3><p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Users className="h-4 w-4 shrink-0" />{community?.sport_category || 'Comunidade'}</p><CardLink href={`/comunidades/${community?.slug || community?.id}`} label="Abrir comunidade" /></article> }} />
  </div>
}
