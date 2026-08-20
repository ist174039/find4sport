import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Globe, Lock, Plus, Search, ShieldCheck, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'
import { ServerPagination } from '@/components/patterns/server-pagination'

const PAGE_SIZE = 20

function pageHref(page: number, q: string, privacy: string) {
  const params = new URLSearchParams()
  if (page > 1) params.set('page', String(page))
  if (q) params.set('q', q)
  if (privacy !== 'all') params.set('privacy', privacy)
  return `/dashboard/comunidades${params.toString() ? `?${params}` : ''}`
}

export default async function DashboardCommunitiesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/comunidades')

  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessDashboard) redirect('/auth/login?redirect=/dashboard/comunidades')
  if (access.role !== 'professional') redirect('/dashboard')

  const params = await searchParams
  const page = Math.max(1, Number(Array.isArray(params.page) ? params.page[0] : params.page) || 1)
  const q = String(Array.isArray(params.q) ? params.q[0] : params.q || '').trim().toLowerCase()
  const rawPrivacy = String(Array.isArray(params.privacy) ? params.privacy[0] : params.privacy || 'all')
  const privacy = rawPrivacy === 'public' || rawPrivacy === 'private' ? rawPrivacy : 'all'

  const { data: memberships, error } = await supabase
    .from('community_members')
    .select('id, role, community:communities(id, slug, name, description, cover_url, is_private, sport_category, created_at, community_members(count), posts(count))')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .order('joined_at', { ascending: false })
  if (error) throw new Error(`Não foi possível carregar comunidades: ${error.message}`)

  const communities = (memberships || []).map((item: any) => item.community).filter(Boolean)
  const communityIds = communities.map((community: any) => community.id)
  let pendingRequests = 0
  if (communityIds.length) {
    const { count } = await supabase.from('community_join_requests').select('id', { count: 'exact', head: true }).in('community_id', communityIds).eq('status', 'pending')
    pendingRequests = count || 0
  }

  const totalMembers = communities.reduce((sum: number, community: any) => sum + Number(community.community_members?.[0]?.count || 0), 0)
  const totalPosts = communities.reduce((sum: number, community: any) => sum + Number(community.posts?.[0]?.count || 0), 0)
  const filtered = communities.filter((community: any) => {
    if (privacy === 'public' && community.is_private) return false
    if (privacy === 'private' && !community.is_private) return false
    if (!q) return true
    return `${community.name || ''} ${community.description || ''} ${community.sport_category || ''}`.toLowerCase().includes(q)
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const visible = filtered.slice(start, safePage * PAGE_SIZE)

  return (
    <DashboardPage>
      <DashboardPageHeader title="Comunidades" description="Gere as comunidades onde és administrador: conteúdo, membros, pedidos de adesão e presença pública." action={<Button asChild><Link href="/comunidades/criar"><Plus className="mr-2 h-4 w-4" />Criar comunidade</Link></Button>} />
      <DashboardStatGrid>
        <DashboardStat label="Comunidades" value={communities.length} icon={<Users className="h-5 w-5" />} />
        <DashboardStat label="Membros" value={totalMembers} icon={<Users className="h-5 w-5" />} />
        <DashboardStat label="Publicações" value={totalPosts} icon={<ShieldCheck className="h-5 w-5" />} />
        <DashboardStat label="Pedidos pendentes" value={pendingRequests} icon={<ShieldCheck className="h-5 w-5" />} />
      </DashboardStatGrid>

      <DashboardSection title="As minhas comunidades" description="Pesquisa, filtro de privacidade e paginação das comunidades administradas.">
        <form method="get" className="mb-4 grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_190px_auto]">
          <label className="relative min-w-0"><span className="sr-only">Pesquisar comunidades</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input name="q" defaultValue={q} placeholder="Nome, descrição ou modalidade" className="min-h-11 w-full pl-10" /></label>
          <label className="min-w-0"><span className="sr-only">Filtrar comunidades por privacidade</span><select name="privacy" defaultValue={privacy} className="min-h-11 w-full rounded-lg border border-input bg-background px-3"><option value="all">Todas</option><option value="public">Públicas</option><option value="private">Privadas</option></select></label>
          <Button type="submit" className="min-h-11">Filtrar</Button>
        </form>

        {visible.length === 0 ? <DashboardEmptyState icon={<Users className="h-10 w-10" />} title={communities.length ? 'Sem resultados' : 'Ainda não geres nenhuma comunidade'} description={communities.length ? 'Ajusta os filtros para encontrar a comunidade.' : 'Cria uma comunidade para reunir atletas, partilhar conteúdo e construir uma rede em torno da tua modalidade.'} action={!communities.length ? <Button asChild><Link href="/comunidades/criar">Criar primeira comunidade</Link></Button> : undefined} /> : (
          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            {visible.map((community: any) => {
              const memberCount = Number(community.community_members?.[0]?.count || 0)
              const postCount = Number(community.posts?.[0]?.count || 0)
              return <article key={community.id} className="min-w-0 overflow-hidden rounded-2xl border border-border bg-background"><div className="relative aspect-[16/7] bg-muted">{community.cover_url ? <img src={community.cover_url} alt={community.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-primary/10 text-3xl font-bold text-primary">{community.name?.charAt(0)?.toUpperCase() || 'C'}</div>}<span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">{community.is_private ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}{community.is_private ? 'Privada' : 'Pública'}</span></div><div className="min-w-0 p-4 sm:p-5"><p className="truncate text-xs font-semibold uppercase tracking-wide text-primary">{community.sport_category || 'Desporto'}</p><h2 className="mt-1 break-words text-lg font-bold">{community.name}</h2><p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-muted-foreground">{community.description || 'Sem descrição.'}</p><div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground"><span>{memberCount} membros</span><span>{postCount} publicações</span></div><div className="mt-5 grid grid-cols-2 gap-2"><Button asChild variant="outline" className="min-h-11"><Link href={`/comunidades/${community.slug || community.id}`}>Abrir</Link></Button><Button asChild className="min-h-11"><Link href={`/dashboard/comunidades/${community.id}`}>Gerir</Link></Button></div></div></article>
            })}
          </div>
        )}

        <ServerPagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          startItem={filtered.length > 0 ? start + 1 : 0}
          endItem={Math.min(start + PAGE_SIZE, filtered.length)}
          previousHref={pageHref(Math.max(1, safePage - 1), q, privacy)}
          nextHref={pageHref(Math.min(totalPages, safePage + 1), q, privacy)}
          label="comunidades"
        />
      </DashboardSection>
    </DashboardPage>
  )
}
