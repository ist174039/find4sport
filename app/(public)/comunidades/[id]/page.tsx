import { Globe, Lock, MessageSquare, ShieldCheck, Users } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/post-card'
import { JoinCommunityBtn } from '@/components/join-community-btn'
import { CreateCommunityPostBox } from '@/components/create-community-post-box'
import { CommunityMembersList } from '@/components/community-members-list'
import { canCreatePostForRole, normalizePlatformRole } from '@/lib/auth/roles'
import { reviewCommunityJoinRequestAction } from '@/app/actions/community'
import { DetailSection, DetailStat, EntityDetailLayout, EntityHero, MobileActionBar } from '@/components/patterns/entity-detail'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function CommunityProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id: rawId } = await params
  const { data: { user } } = await supabase.auth.getUser()
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawId)

  let community: any = null
  if (isUuid) community = (await supabase.from('communities').select('*').eq('id', rawId).maybeSingle()).data
  if (!community) community = (await supabase.from('communities').select('*').eq('slug', rawId).maybeSingle()).data
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
      supabase.from('posts').select('*, professionals(id, full_name, avatar_url, public_slug, is_verified), sport_spaces(id, name, slug, logo_url), platform_users(id, full_name, avatar_url, type), likes:post_likes(count), comments:post_comments(count)').eq('community_id', community.id).order('created_at', { ascending: false }),
      supabase.from('community_members').select('id, role, user_id, platform_users(id, full_name, avatar_url, type, professionals(public_slug, full_name, avatar_url), sport_spaces(slug, name, logo_url))').eq('community_id', community.id).order('joined_at', { ascending: false }),
    ])
    posts = postsResult.data || []
    members = membersResult.data || []
  }

  if (isCommunityAdmin) {
    const { data } = await supabase.from('community_join_requests').select('id, user_id, created_at, platform_users:user_id(full_name, avatar_url)').eq('community_id', community.id).eq('status', 'pending').order('created_at', { ascending: true })
    joinRequests = data || []
  }

  const memberCount = members.length || Number(community.members_count || 0)
  const actions = <JoinCommunityBtn communityId={community.id} isPrivate={Boolean(community.is_private)} initialJoined={isMember} initialPending={Boolean(pendingRequest)} />

  return (
    <main className="min-h-screen bg-background pb-20 sm:pb-0">
      <EntityHero
        coverUrl={community.cover_url}
        coverAlt={community.name}
        avatar={<div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-white bg-primary text-primary-foreground shadow-lg sm:h-24 sm:w-24"><Users className="h-10 w-10" /></div>}
        title={community.name}
        badges={<><Badge className="bg-white/15 text-white hover:bg-white/20">Comunidade</Badge>{community.is_private ? <Badge variant="secondary"><Lock className="mr-1 h-3 w-3" />Privada</Badge> : <Badge variant="secondary"><Globe className="mr-1 h-3 w-3" />Pública</Badge>}</>}
        meta={<><span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{memberCount} membros</span>{canViewPrivateContent && <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" />{posts.length} publicações</span>}{community.sport_category && <span>{community.sport_category}</span>}</>}
        actions={actions}
      />

      <EntityDetailLayout
        main={<>
          <DetailSection title="Sobre a comunidade"><p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">{community.description || 'Esta comunidade ainda não tem descrição.'}</p></DetailSection>

          {!canViewPrivateContent ? (
            <DetailSection><div className="py-6 text-center"><Lock className="mx-auto h-10 w-10 text-primary" /><h2 className="mt-4 text-xl font-bold">Conteúdo reservado a membros</h2><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Esta comunidade é privada. Envie um pedido de adesão para aceder ao feed e aos membros.</p><div className="mx-auto mt-5 max-w-xs">{actions}</div></div></DetailSection>
          ) : (
            <DetailSection title="Feed" icon={<MessageSquare className="h-5 w-5 text-primary" />}>
              {canPost && <CreateCommunityPostBox communityId={community.id} currentUserName={profile?.full_name || ''} currentUserAvatar={profile?.avatar_url || user?.user_metadata?.avatar_url || ''} />}
              {posts.length ? <div className="space-y-4">{posts.map((post: any) => <PostCard key={post.id} post={post} isAuthenticated={Boolean(user)} />)}</div> : <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Ainda não existem publicações.</div>}
            </DetailSection>
          )}

          {isCommunityAdmin && (
            <DetailSection title="Pedidos de adesão" icon={<ShieldCheck className="h-5 w-5 text-primary" />} description="Apenas administradores da comunidade veem esta secção.">
              {joinRequests.length === 0 ? <p className="text-sm text-muted-foreground">Sem pedidos pendentes.</p> : <div className="divide-y divide-border">{joinRequests.map((request: any) => <div key={request.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold">{request.platform_users?.full_name || 'Utilizador'}</p><p className="text-xs text-muted-foreground">Pedido em {new Date(request.created_at).toLocaleDateString('pt-PT')}</p></div><div className="grid grid-cols-2 gap-2"><form action={reviewCommunityJoinRequestAction.bind(null, request.id, 'reject')}><Button type="submit" variant="outline" className="min-h-11 w-full">Recusar</Button></form><form action={reviewCommunityJoinRequestAction.bind(null, request.id, 'approve')}><Button type="submit" className="min-h-11 w-full">Aprovar</Button></form></div></div>)}</div>}
            </DetailSection>
          )}
        </>}
        aside={<>
          <DetailSection title="Resumo"><div className="grid grid-cols-2 gap-4"><DetailStat label="Membros" value={memberCount} /><DetailStat label="Privacidade" value={community.is_private ? 'Privada' : 'Pública'} />{canViewPrivateContent && <DetailStat label="Publicações" value={posts.length} />}{community.sport_category && <DetailStat label="Tema" value={community.sport_category} />}</div></DetailSection>
          {canViewPrivateContent && <DetailSection title="Membros" icon={<Users className="h-5 w-5 text-primary" />}><CommunityMembersList members={members} /></DetailSection>}
        </>}
      />

      <MobileActionBar>{actions}</MobileActionBar>
    </main>
  )
}
