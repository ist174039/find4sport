import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Globe, Lock, Plus, ShieldCheck, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { resolveSessionAccess } from '@/lib/auth/access'
import { Button } from '@/components/ui/button'
import { DashboardEmptyState, DashboardPage, DashboardPageHeader, DashboardSection, DashboardStat, DashboardStatGrid } from '@/components/patterns/dashboard-page'

export default async function DashboardCommunitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/comunidades')

  const access = await resolveSessionAccess(supabase, user)
  if (!access?.canAccessDashboard) redirect('/auth/login?redirect=/dashboard/comunidades')
  if (access.role !== 'professional') redirect('/dashboard')

  const { data: memberships } = await supabase
    .from('community_members')
    .select('id, role, community:communities(id, slug, name, description, cover_url, is_private, sport_category, created_at, community_members(count), posts(count))')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .order('joined_at', { ascending: false })

  const communities = (memberships || []).map((item: any) => item.community).filter(Boolean)
  const communityIds = communities.map((community: any) => community.id)

  let pendingRequests = 0
  if (communityIds.length) {
    const { count } = await supabase
      .from('community_join_requests')
      .select('id', { count: 'exact', head: true })
      .in('community_id', communityIds)
      .eq('status', 'pending')
    pendingRequests = count || 0
  }

  const totalMembers = communities.reduce((sum: number, community: any) => sum + Number(community.community_members?.[0]?.count || 0), 0)
  const totalPosts = communities.reduce((sum: number, community: any) => sum + Number(community.posts?.[0]?.count || 0), 0)

  return (
    <DashboardPage>
      <DashboardPageHeader
        title="Comunidades"
        description="Gere as comunidades onde és administrador: conteúdo, membros, pedidos de adesão e presença pública."
        action={<Button asChild><Link href="/comunidades/criar"><Plus className="mr-2 h-4 w-4" />Criar comunidade</Link></Button>}
      />

      <DashboardStatGrid>
        <DashboardStat label="Comunidades" value={communities.length} icon={<Users className="h-5 w-5" />} />
        <DashboardStat label="Membros" value={totalMembers} icon={<Users className="h-5 w-5" />} />
        <DashboardStat label="Publicações" value={totalPosts} icon={<ShieldCheck className="h-5 w-5" />} />
        <DashboardStat label="Pedidos pendentes" value={pendingRequests} icon={<ShieldCheck className="h-5 w-5" />} />
      </DashboardStatGrid>

      <DashboardSection title="As minhas comunidades" description="Abre uma comunidade para gerir pedidos, feed, membros e informação pública.">
        {communities.length === 0 ? (
          <DashboardEmptyState
            icon={<Users className="h-10 w-10" />}
            title="Ainda não geres nenhuma comunidade"
            description="Cria uma comunidade para reunir atletas, partilhar conteúdo e construir uma rede em torno da tua modalidade."
            action={<Button asChild><Link href="/comunidades/criar">Criar primeira comunidade</Link></Button>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {communities.map((community: any) => {
              const memberCount = Number(community.community_members?.[0]?.count || 0)
              const postCount = Number(community.posts?.[0]?.count || 0)
              return (
                <article key={community.id} className="overflow-hidden rounded-2xl border border-border bg-background">
                  <div className="relative aspect-[16/7] bg-muted">
                    {community.cover_url ? <img src={community.cover_url} alt={community.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-primary/10 text-3xl font-bold text-primary">{community.name?.charAt(0)?.toUpperCase() || 'C'}</div>}
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur">
                      {community.is_private ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                      {community.is_private ? 'Privada' : 'Pública'}
                    </span>
                  </div>
                  <div className="p-4 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">{community.sport_category || 'Desporto'}</p>
                    <h2 className="mt-1 text-lg font-bold text-foreground">{community.name}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{community.description || 'Sem descrição.'}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>{memberCount} membros</span>
                      <span>{postCount} publicações</span>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <Button asChild variant="outline"><Link href={`/comunidades/${community.slug || community.id}`}>Abrir</Link></Button>
                      <Button asChild><Link href={`/dashboard/comunidades/${community.id}`}>Gerir</Link></Button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </DashboardSection>
    </DashboardPage>
  )
}
