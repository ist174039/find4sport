import { Globe, Lock, MessageSquare, ShieldCheck, User, Users } from 'lucide-react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/post-card'
import { JoinCommunityBtn } from '@/components/join-community-btn'
import { CreateCommunityPostBox } from '@/components/create-community-post-box'
import { CommunityMembersList } from '@/components/community-members-list'
import { canCreatePostForRole, normalizePlatformRole } from '@/lib/auth/roles'
import { reviewCommunityJoinRequestAction } from '@/app/actions/community'

export default async function CommunityProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id: rawId } = await params
  const { data: { user } } = await supabase.auth.getUser()
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)

  let community: any = null
  if (isUuid) {
    const result = await supabase.from('communities').select('*').eq('id', rawId).maybeSingle()
    community = result.data
  }
  if (!community) {
    const result = await supabase.from('communities').select('*').eq('slug', rawId).maybeSingle()
    community = result.data
  }
  if (!community) notFound()

  let membership: any = null
  let pendingRequest: any = null
  let profile: any = null

  if (user) {
    const [membershipResult, requestResult, profileResult] = await Promise.all([
      supabase.from('community_members').select('id, role').eq('community_id', community.id).eq('user_id', user.id).maybeSingle(),
      supabase.from('community_join_requests').select('id, status').eq('community_id', community.id).eq('user_id', user.id).eq('status', 'pending').maybeSingle(),
      supabase.from('platform_users').select('type, full_name, avatar_url').eq('id', user.id).maybeSingle(),
    ])
    membership = membershipResult.data
    pendingRequest = requestResult.data
    profile = profileResult.data
  }

  const isMember = Boolean(membership)
  const isCommunityAdmin = membership?.role === 'admin'
  const canViewPrivateContent = !community.is_private || isMember
  const canPost = isMember && canCreatePostForRole(normalizePlatformRole(profile?.type || user?.user_metadata?.type))

  let posts: any[] = []
  let members: any[] = []
  let joinRequests: any[] = []

  if (canViewPrivateContent) {
    const [postsResult, membersResult] = await Promise.all([
      supabase
        .from('posts')
        .select('*, professionals(id, full_name, avatar_url, public_slug, is_verified), sport_spaces(id, name, slug, logo_url), platform_users(id, full_name, avatar_url, type), likes:post_likes(count), comments:post_comments(count)')
        .eq('community_id', community.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('community_members')
        .select('id, role, user_id, platform_users(id, full_name, avatar_url, type, professionals(public_slug, full_name, avatar_url), sport_spaces(slug, name, logo_url))')
        .eq('community_id', community.id)
        .order('joined_at', { ascending: false }),
    ])
    posts = postsResult.data || []
    members = membersResult.data || []
  }

  if (isCommunityAdmin) {
    const { data } = await supabase
      .from('community_join_requests')
      .select('id, user_id, created_at, platform_users:user_id(full_name, avatar_url)')
      .eq('community_id', community.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    joinRequests = data || []
  }

  const memberCount = members.length || Number(community.members_count || 0)

  return (
    <div className="min-h-screen bg-background">
      <section className="relative h-[260px] overflow-hidden bg-muted md:h-[340px]">
        {community.cover_url ? <img src={community.cover_url} alt="Capa da comunidade" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-primary/50 via-primary/20 to-background" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-7xl flex-col gap-4 px-4 pb-7 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-primary text-primary-foreground shadow-lg"><Users className="h-10 w-10" /></div>
            <div>
              <h1 className="text-3xl font-bold text-white md:text-4xl">{community.name}</h1>
              <div className="mt-2 flex flex-wrap gap-3 text-xs font-medium text-white/90">
                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{memberCount} membros</span>
                {canViewPrivateContent && <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{posts.length} publicações</span>}
                <span className="flex items-center gap-1">{community.is_private ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}{community.is_private ? 'Privada' : 'Pública'}</span>
              </div>
            </div>
          </div>
          <JoinCommunityBtn communityId={community.id} isPrivate={Boolean(community.is_private)} initialJoined={isMember} initialPending={Boolean(pendingRequest)} />
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold">Sobre a comunidade</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{community.description || 'Nenhuma descrição fornecida.'}</p>
          </section>

          {!canViewPrivateContent ? (
            <section className="rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
              <Lock className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 text-xl font-bold">Conteúdo reservado a membros</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Esta comunidade é privada. Envia um pedido de adesão para aceder ao feed e à lista de membros.</p>
            </section>
          ) : (
            <section id="community-feed" className="space-y-4">
              {canPost && <CreateCommunityPostBox communityId={community.id} currentUserName={profile?.full_name || ''} currentUserAvatar={profile?.avatar_url || user?.user_metadata?.avatar_url || ''} />}
              {posts.length ? posts.map((post: any) => <PostCard key={post.id} post={post} isAuthenticated={Boolean(user)} />) : <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">Ainda não existem publicações nesta comunidade.</div>}
            </section>
          )}

          {isCommunityAdmin && (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /><h2 className="text-lg font-bold">Pedidos de adesão</h2><span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{joinRequests.length}</span></div>
              {joinRequests.length === 0 ? <p className="text-sm text-muted-foreground">Sem pedidos pendentes.</p> : <div className="divide-y divide-border">{joinRequests.map((request: any) => <div key={request.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold">{request.platform_users?.full_name || 'Utilizador'}</p><p className="text-xs text-muted-foreground">Pedido em {new Date(request.created_at).toLocaleDateString('pt-PT')}</p></div><div className="flex gap-2"><form action={reviewCommunityJoinRequestAction.bind(null, request.id, 'reject')}><button className="rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">Recusar</button></form><form action={reviewCommunityJoinRequestAction.bind(null, request.id, 'approve')}><button className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">Aprovar</button></form></div></div>)}</div>}
            </section>
          )}
        </div>

        <aside className="space-y-6">
          {canViewPrivateContent && <section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="mb-4 flex items-center gap-2 font-bold"><Users className="h-4 w-4 text-primary" />Membros</h2><CommunityMembersList members={members} /></section>}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><h2 className="font-bold">Regras</h2><p className="mt-2 text-sm text-muted-foreground">Respeita os restantes membros, evita spam e mantém as conversas relacionadas com o objetivo da comunidade.</p></section>
          <Link href="/comunidades" className="block text-center text-sm font-semibold text-primary hover:underline">Ver todas as comunidades</Link>
        </aside>
      </main>
    </div>
  )
}
