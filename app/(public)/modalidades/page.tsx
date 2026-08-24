import { Activity, ArrowRight, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { SuggestModalityModal } from '@/components/suggest-modality-modal'
import { groupSports } from '@/lib/sports-taxonomy'
import { ModalityIcon } from '@/components/modality-icon'

type ModalityCategory = {
  id: string
  name: string | null
  slug: string | null
  icon_key: string | null
}

export default async function ModalitiesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const supabase = await createClient()
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q.trim().toLowerCase() : ''

  const { data: categories } = await supabase
    .from('categories')
    .select('id,name,slug,icon_key')
    .eq('taxonomy_type', 'modality')
    .eq('is_active', true)
    .order('name')

  let safeCategories = (categories || []) as ModalityCategory[]
  if (query) safeCategories = safeCategories.filter(category => `${category.name || ''} ${category.slug || ''}`.toLowerCase().includes(query))
  const groups = groupSports(safeCategories)

  return (
    <main className="min-h-screen bg-background pb-20">
      <section className="border-b border-border bg-gradient-to-b from-primary/8 to-background py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl"><span className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Explorar desporto</span><h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Encontra a modalidade certa para ti</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">As modalidades estão organizadas por famílias para facilitar a descoberta de profissionais, espaços, eventos e comunidades.</p></div>
          <form action="/modalidades" method="get" className="relative mt-6 max-w-2xl"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" /><input name="q" defaultValue={query} placeholder="Ex.: padel, natação, boxe, yoga..." className="min-h-12 w-full rounded-2xl border border-border bg-background pl-12 pr-4 text-base shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" /></form>
          {groups.length > 1 && <nav aria-label="Famílias de modalidades" className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">{groups.map(group => <a key={group.id} href={`#${group.id}`} className="flex min-h-11 items-center justify-center rounded-xl border border-border bg-card px-3 text-center text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary">{group.name}</a>)}</nav>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {safeCategories.length === 0 ? <div className="rounded-2xl border border-dashed border-border p-10 text-center"><Activity className="mx-auto h-9 w-9 text-muted-foreground/40" /><h2 className="mt-3 font-semibold">Nenhuma modalidade encontrada</h2><p className="mt-1 text-sm text-muted-foreground">Tenta outra pesquisa ou sugere uma nova modalidade.</p></div> : groups.map(group => <section key={group.id} id={group.id} className="scroll-mt-24"><div className="mb-4"><h2 className="text-xl font-bold text-foreground sm:text-2xl">{group.name}</h2><p className="mt-1 text-sm text-muted-foreground">{group.description}</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{group.sports.map(category => <article key={category.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"><Link href={`/pesquisa?category=${encodeURIComponent(category.slug || category.name || '')}`} className="flex min-h-24 items-center gap-4 p-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-primary transition group-hover:bg-primary/10"><ModalityIcon iconKey={category.icon_key} className="h-7 w-7" /></div><div className="min-w-0 flex-1"><h3 className="truncate font-semibold text-foreground group-hover:text-primary">{category.name}</h3><p className="mt-1 text-xs text-muted-foreground">Ver tudo nesta modalidade</p></div><ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" /></Link><div className="grid grid-cols-3 border-t border-border bg-muted/15 text-[11px] font-semibold"><Link href={`/profissionais?category=${encodeURIComponent(category.slug || category.name || '')}`} className="min-h-10 px-2 py-3 text-center hover:bg-muted hover:text-primary">Profissionais</Link><Link href={`/espacos?category=${encodeURIComponent(category.slug || category.name || '')}`} className="min-h-10 border-x border-border px-2 py-3 text-center hover:bg-muted hover:text-primary">Espaços</Link><Link href={`/eventos?category=${encodeURIComponent(category.slug || category.name || '')}`} className="min-h-10 px-2 py-3 text-center hover:bg-muted hover:text-primary">Eventos</Link></div></article>)}</div></section>)}
        <section className="rounded-3xl border border-border bg-muted/25 p-6 text-center sm:p-10"><Activity className="mx-auto h-8 w-8 text-primary" /><h2 className="mt-3 text-2xl font-bold">Não encontras a tua modalidade?</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Sugere-a. A estrutura por famílias permite adicioná-la no local certo sem transformar a plataforma numa lista desorganizada.</p><div className="mt-5"><SuggestModalityModal /></div></section>
      </section>
    </main>
  )
}
