import { Globe, Lock, Plus, Search, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ComunidadesFilterModal } from '@/components/comunidades-filter-modal'

export default async function CommunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const categoryParam = typeof params.category === 'string' ? params.category : null
  const queryParam = typeof params.q === 'string' ? params.q.trim() : ''
  const sortParam = typeof params.sort === 'string' ? params.sort : 'newest'

  let query = supabase
    .from('communities')
    .select(`
      *,
      community_members (count)
    `)

  if (categoryParam) {
    query = query.ilike('sport_category', `%${categoryParam}%`)
  }

  if (queryParam) {
    query = query.or(`name.ilike.%${queryParam}%,description.ilike.%${queryParam}%,sport_category.ilike.%${queryParam}%`)
  }

  const { data: communities, error } = await query

  const safeCommunities = [...(communities || [])]
  safeCommunities.sort((a: any, b: any) => {
    if (sortParam === 'members') {
      return (b.community_members?.[0]?.count || 0) - (a.community_members?.[0]?.count || 0)
    }
    if (sortParam === 'name') {
      return (a.name || '').localeCompare(b.name || '')
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const buildHref = (updates: Record<string, string | null>) => {
    const hrefParams = new URLSearchParams(params as Record<string, string>)
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) hrefParams.delete(key)
      else hrefParams.set(key, value)
    })
    const queryString = hrefParams.toString()
    return queryString ? `/comunidades?${queryString}` : '/comunidades'
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="border-b border-border bg-muted/30 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
                Comunidades
              </h1>
              <p className="mt-2 text-muted-foreground text-lg max-w-2xl">
                Junta-te a grupos locais e encontra pessoas com a mesma paixão pelo desporto.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {safeCommunities.length} comunidades encontradas
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <ComunidadesFilterModal />
              <Link href="/comunidades/criar" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
                <Plus className="text-[18px]" />
                Criar
              </Link>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <form action="/comunidades" method="get" className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={queryParam}
                placeholder="Pesquisar por nome, descricao ou modalidade..."
                className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
              {categoryParam && <input type="hidden" name="category" value={categoryParam} />}
              {sortParam && <input type="hidden" name="sort" value={sortParam} />}
            </form>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-muted-foreground">Ordenar:</span>
              <Link href={buildHref({ sort: 'newest' })} className={`rounded-full border px-3 py-1.5 ${sortParam === 'newest' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:border-primary/50'}`}>Recentes</Link>
              <Link href={buildHref({ sort: 'members' })} className={`rounded-full border px-3 py-1.5 ${sortParam === 'members' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:border-primary/50'}`}>Mais membros</Link>
              <Link href={buildHref({ sort: 'name' })} className={`rounded-full border px-3 py-1.5 ${sortParam === 'name' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:border-primary/50'}`}>A-Z</Link>
            </div>
          </div>

          {(queryParam || categoryParam) && (
            <div className="mt-3">
              <Link href="/comunidades" className="inline-flex rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/50">
                Limpar filtros
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-8 sm:py-12 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeCommunities.map((community: any) => {
              const memberCount = community.community_members?.[0]?.count || 0

              return (
                <Link key={community.id} href={`/comunidades/${community.slug || community.id}`} className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/50 transition-all">
                  <div className="h-40 bg-muted relative">
                    <img 
                      src={community.cover_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop'} 
                      alt={community.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                    <div className="absolute bottom-3 left-4 text-white text-[10px] font-bold px-2 py-1 rounded bg-black/40 backdrop-blur-md uppercase tracking-wider">
                      {community.sport_category || 'Desporto'}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">{community.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                      {community.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between text-xs font-medium text-muted-foreground border-t border-border pt-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="text-[16px]" />
                        {memberCount} {memberCount === 1 ? 'membro' : 'membros'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {community.is_private ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                        {community.is_private ? 'Privada' : 'Pública'}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          
          {safeCommunities.length === 0 && (
            <div className="py-12 text-center border border-dashed border-border rounded-xl bg-muted/20">
              <Users className="text-4xl text-muted-foreground mb-3 h-5 w-5" />
              <p className="text-lg font-medium text-foreground">Ainda não existem comunidades.</p>
              <p className="text-sm text-muted-foreground mt-1">Seja o primeiro a criar um grupo!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
