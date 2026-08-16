'use client'

import Link from 'next/link'
import { ArrowRight, CalendarDays, Heart, LogOut, MapPin, Trash2, Users } from 'lucide-react'
import { removeFavoriteAction, leaveCommunityAction } from '@/app/actions/favorites'
import { useModal } from '@/components/providers/modal-provider'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function FavoritesClient({ initial }: { initial: any }) {
  const { showAlert } = useModal()
  const [data, setData] = useState(initial)
  const [busy, setBusy] = useState<string | null>(null)

  const removeFavorite = async (id: string) => {
    setBusy(id)
    try {
      await removeFavoriteAction(id)
      setData((prev: any) => ({
        ...prev,
        professionals: prev.professionals.filter((x: any) => x.id !== id),
        spaces: prev.spaces.filter((x: any) => x.id !== id),
        events: prev.events.filter((x: any) => x.id !== id),
      }))
      showAlert('Favorito removido', 'O item deixou de estar nos teus favoritos.', 'success')
    } catch (error: any) {
      showAlert('Erro', error?.message || 'Não foi possível remover o favorito.', 'error')
    } finally {
      setBusy(null)
    }
  }

  const leaveCommunity = async (memberId: string) => {
    setBusy(memberId)
    try {
      await leaveCommunityAction(memberId)
      setData((prev: any) => ({ ...prev, communities: prev.communities.filter((x: any) => x.memberId !== memberId) }))
      showAlert('Comunidade removida', 'Saíste da comunidade.', 'success')
    } catch (error: any) {
      showAlert('Não foi possível sair', error?.message || 'Tenta novamente.', 'error')
    } finally {
      setBusy(null)
    }
  }

  const total = data.professionals.length + data.spaces.length + data.events.length + data.communities.length
  if (!total) {
    return <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center"><Heart className="mx-auto h-10 w-10 text-muted-foreground/40" /><h2 className="mt-4 text-lg font-bold">Ainda não guardaste nada</h2><p className="mt-1 text-sm text-muted-foreground">Explora profissionais, espaços, eventos e comunidades.</p><Button asChild className="mt-5"><Link href="/pesquisa">Explorar</Link></Button></div>
  }

  const Section = ({ title, items, render }: { title: string; items: any[]; render: (item: any) => React.ReactNode }) => items.length ? <section className="space-y-4"><h2 className="text-lg font-bold">{title}</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map(render)}</div></section> : null

  return <div className="space-y-8">
    <Section title="Profissionais" items={data.professionals} render={(fav) => { const p = fav.professional; return <article key={fav.id} className="relative rounded-2xl border border-border bg-card p-5 shadow-sm"><button disabled={busy === fav.id} onClick={() => removeFavorite(fav.id)} className="absolute right-3 top-3 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button><h3 className="pr-10 font-bold">{p?.professional_name || p?.full_name || 'Profissional'}</h3><p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{p?.address || 'Localização não indicada'}</p><Button asChild variant="ghost" className="mt-4 px-0 text-primary"><Link href={`/profissionais/${p?.public_slug || p?.id}`}>Ver perfil <ArrowRight className="ml-1 h-4 w-4" /></Link></Button></article> }} />
    <Section title="Espaços" items={data.spaces} render={(fav) => { const s = fav.space; return <article key={fav.id} className="relative rounded-2xl border border-border bg-card p-5 shadow-sm"><button disabled={busy === fav.id} onClick={() => removeFavorite(fav.id)} className="absolute right-3 top-3 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button><h3 className="pr-10 font-bold">{s?.name || 'Espaço'}</h3><p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{s?.address || 'Localização não indicada'}</p><Button asChild variant="ghost" className="mt-4 px-0 text-primary"><Link href={`/espacos/${s?.slug || s?.id}`}>Ver espaço <ArrowRight className="ml-1 h-4 w-4" /></Link></Button></article> }} />
    <Section title="Eventos" items={data.events} render={(fav) => { const e = fav.event; return <article key={fav.id} className="relative rounded-2xl border border-border bg-card p-5 shadow-sm"><button disabled={busy === fav.id} onClick={() => removeFavorite(fav.id)} className="absolute right-3 top-3 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button><h3 className="pr-10 font-bold">{e?.title || 'Evento'}</h3><p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4" />{e?.start_date ? new Date(e.start_date).toLocaleDateString('pt-PT') : 'Data por definir'}</p><Button asChild variant="ghost" className="mt-4 px-0 text-primary"><Link href={`/eventos/${e?.slug || e?.id}`}>Ver evento <ArrowRight className="ml-1 h-4 w-4" /></Link></Button></article> }} />
    <Section title="Comunidades" items={data.communities} render={(item) => { const c = item.community; return <article key={item.memberId} className="relative rounded-2xl border border-border bg-card p-5 shadow-sm"><button disabled={busy === item.memberId} onClick={() => leaveCommunity(item.memberId)} className="absolute right-3 top-3 rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><LogOut className="h-4 w-4" /></button><h3 className="pr-10 font-bold">{c?.name || 'Comunidade'}</h3><p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><Users className="h-4 w-4" />{c?.sport_category || 'Comunidade'}</p><Button asChild variant="ghost" className="mt-4 px-0 text-primary"><Link href={`/comunidades/${c?.slug || c?.id}`}>Abrir comunidade <ArrowRight className="ml-1 h-4 w-4" /></Link></Button></article> }} />
  </div>
}
