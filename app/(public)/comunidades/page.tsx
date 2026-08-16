import Link from 'next/link'
import { Globe, Lock, Plus, Search, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { DiscoveryEmptyState, DiscoveryPage } from '@/components/patterns/discovery-page'
import { Button } from '@/components/ui/button'

export default async function CommunitiesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const supabase = await createClient()
  const params = await searchParams
  const categoryParam = typeof params.category === 'string' ? params.category : undefined
  const queryParam = typeof params.q === 'string' ? params.q.trim() : ''
  const sortParam = typeof params.sort === 'string' ? params.sort : 'newest'

  let query = supabase.from('communities').select('*, community_members(count)')
  if (categoryParam) query = query.ilike('sport_category', `%${categoryParam}%`)
  if (queryParam) query = query.or(`name.ilike.%${queryParam}%,description.ilike.%${queryParam}%,sport_category.ilike.%${queryParam}%`)
  const { data: communities } = await query

  const safeCommunities = [...(communities || [])]
  safeCommunities.sort((a: any, b: any) => {
    if (sortParam === 'members') return (b.community_members?.[0]?.count || 0) - (a.community_members?.[0]?.count || 0)
    if (sortParam === 'name') return (a.name || '').localeCompare(b.name || '')
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const categoryGroups = safeCommunities.reduce((acc: Record<string, number>, community: any) => {
    const label = (community.sport_category || 'Desporto').trim()
    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {})
  const topCategories = Object.entries(categoryGroups).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name]) => name)

  const buildHref = (updates: Record<string, string | null | undefined>) => {
    const hrefParams = new URLSearchParams()
    if (queryParam) hrefParams.set('q', queryParam)
    if (categoryParam) hrefParams.set('category', categoryParam)
    if (sortParam !== 'newest') hrefParams.set('sort', sortParam)
    Object.entries(updates).forEach(([key, value]) => value ? hrefParams.set(key, value) : hrefParams.delete(key))
    const queryString = hrefParams.toString()
    return queryString ? `/comunidades?${queryString}` : '/comunidades'
  }

  const search = (
    <form action="/comunidades" method="get" className="relative w-full max-w-3xl">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <input name="q" defaultValue={queryParam} placeholder="Pesquisar comunidades..." className="min-h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-base outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
      {categoryParam && <input type="hidden" name="category" value={categoryParam} />}
      {sortParam !== 'newest' && <input type="hidden" name="sort" value={sortParam} />}
    </form>
  )

  return (
    <DiscoveryPage
      title="Comunidades"
      description="Junta-te a grupos desportivos, partilha experiências e encontra pessoas com interesses em comum."
      countLabel={`${safeCommunities.length} ${safeCommunities.length === 1 ? 'comunidade encontrada' : 'comunidades encontradas'}`}
      search={search}
      action={<Button asChild className="min-h-11 w-full sm:w-auto"><Link href="/comunidades/criar"><Plus className="mr-2 h-4 w-4" />Criar comunidade</Link></Button>}
      categories={[
        { label: 'Todas', href: buildHref({ category: null }), active: !categoryParam },
        ...topCategories.map((name) => ({ label: name, href: buildHref({ category: name }), active: categoryParam?.toLowerCase() === name.toLowerCase() })),
      ]}
      sorts={[
        { label: 'Recentes', href: buildHref({ sort: 'newest' }), active: sortParam === 'newest' },
        { label: 'Mais membros', href: buildHref({ sort: 'members' }), active: sortParam === 'members' },
        { label: 'A–Z', href: buildHref({ sort: 'name' }), active: sortParam === 'name' },
      ]}
      clearHref={queryParam || categoryParam || sortParam !== 'newest' ? '/comunidades' : undefined}
    >
      {safeCommunities.length ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {safeCommunities.map((community: any) => {
            const memberCount = community.community_members?.[0]?.count || 0
            return (
              <Link key={community.id} href={`/comunidades/${community.slug || community.id}`} className="group flex min-h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40 hover:shadow-md">
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  {community.cover_url ? <img src={community.cover_url} alt={community.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /> : <div className="flex h-full items-center justify-center bg-primary/10 text-4xl font-bold text-primary">{community.name?.charAt(0)?.toUpperCase() || 'C'}</div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">{community.sport_category || 'Desporto'}</span>
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <h2 className="line-clamp-1 text-lg font-bold text-foreground group-hover:text-primary">{community.name}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{community.description || 'Comunidade desportiva na Find4Sport.'}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{memberCount} {memberCount === 1 ? 'membro' : 'membros'}</span>
                    <span className="flex items-center gap-1.5">{community.is_private ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}{community.is_private ? 'Privada' : 'Pública'}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : <DiscoveryEmptyState title="Nenhuma comunidade encontrada" description="Experimenta remover filtros ou cria uma nova comunidade." clearHref="/comunidades" />}
    </DiscoveryPage>
  )
}
