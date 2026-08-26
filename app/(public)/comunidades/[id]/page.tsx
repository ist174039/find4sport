import type { ComponentProps } from 'react'
import { Globe, Lock, MapPin, MessageSquare, ShieldCheck, Users } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/post-card'
import { JoinCommunityBtn } from '@/components/join-community-btn'
import { CreateCommunityPostBox } from '@/components/create-community-post-box'
import { CommunityMembersList } from '@/components/community-members-list'
import { reviewCommunityJoinRequestAction } from '@/app/actions/community'
import { DetailSection, DetailStat, EntityDetailLayout, EntityHero, MobileActionBar } from '@/components/patterns/entity-detail'
import { DiscoveryPagination } from '@/components/patterns/discovery-pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const PAGE_SIZE = 20
const scopeLabel: Record<string, string> = { online: 'Online', local: 'Local', regional: 'Regional', national: 'Nacional' }

type Community = {
  id: string
  slug: string | null
  name: string
  description: string | null
  cover_url: string | null
  is_private: boolean | null
  posting_policy: string | null
  address: string | null
  location_scope: string | null
}

type Membership = { id: string; role: string | null }
type PendingRequest = { id: string; status: string }
type Profile = { type: string | null; full_name: string | null; avatar_url: string | null }
type Category = { id: string; name: string; slug: string }
type CategoryRow = { category: Category | null }
type CommunityPost = ComponentProps<typeof PostCard>['post']
type CommunityMember = ComponentProps<typeof CommunityMembersList>['members'][number]
type JoinRequest = {
  id: string
  user_id: string
  created_at: string
  platform_users: { full_name: string | null; avatar_url: string | null } | null
}

export default async function CommunityProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createClient()
  const admin = supabase
  const { id: rawId } = await params
  const { page: pageRaw } = await searchParams
  const page = Math.max(1, Number.parseInt(pageRaw || '1', 10) || 1)
  const { data: { user } } = await supabase.auth.getUser()
  const isUuid = /^[0-9a-f-]{36}$/i.test(rawId)

  let community: Community | null = null
  const publicFields = 'id,slug,name,description,cover_url,is_private,posting_policy,address,location_scope'
  if (isUuid) {
    community = (await admin.from('communities').select(publicFields).eq('id', rawId).maybeSingle()).data as Community | null
  }
  if (!community) {
    community = (await admin.from('communities').select(publicFields).eq('slug', rawId).maybeSingle()).data as Community | null
  }
  if (!community) notFound()

  let membership: Membership | null = null
  let pendingRequest: PendingRequest | null = null
  let profile: Profile | null = null

  if (user) {
    const [membershipResult, requestResult, profileResult] = await Promise.all([
      admin.from('community_members').select('id,role').eq('community_id', community.id).eq('user_id', user.id).maybeSingle(),
      admin.from('community_join_requests').select('id,status').eq('community_id', community.id).eq('user_id', user.id).eq('status', 'pending').maybeSingle(),
      admin.from('platform_users').select('type,full_name,avatar_url').eq('id', user.id).maybeSingle(),
    ])
    membership = membershipResult.data as Membership | null
    pendingRequest = requestResult.data as PendingRequest | null
    profile = profileResult.data as Profile | null
  }

  const isMember = Boolean(membership)
  const isCommunityAdmin = membership?.role === 'admin'
  const canViewPrivateContent = !community.is_private || isMember
  const postingPolicy = community.posting_policy || 'members'
  const canPost = isMember && (postingPolicy === 'members' || isCommunityAdmin)

  const [{ count: memberCountRaw }, { count: postCountRaw }, { data: categoryRows }] = await Promise.all([
    admin.from('community_members').select('id', { count: 'exact', head: true }).eq('community_id', community.id),
    admin.from('posts').select('id', { count: 'exact', head: true }).eq('community_id', community.id),
    admin.from('community_categories').select('category:categories(id,name,slug)').eq('community_id', community.id),
  ])

  const memberCount = memberCountRaw || 0
  const postCount = postCountRaw || 0
  const categories = ((categoryRows || []) as CategoryRow[]).flatMap(row => row.category ? [row.category] : [])

  let posts: CommunityPost[] = []
  let members: CommunityMember[] = []
  let joinRequests: JoinRequest[] = []

  if (canViewPrivateContent) {
    const [postsResult, membersResult] = await Promise.all([
      admin
        .from('posts')
        .select('*, professionals(id,full_name,avatar_url,public_slug,is_verified), sport_spaces(id,name,slug,logo_url), platform_users(id,full_name,avatar_url,type), likes:post_likes(count), comments:post_comments(count)')
        .eq('community_id', community.id)
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1),
      admin
        .from('community_members')
        .select('id,role,user_id,platform_users(id,full_name,avatar_url,type,professionals(public_slug,professional_name,full_name,avatar_url),sport_spaces(slug,name,logo_url))')
        .eq('community_id', community.id)
        .order('joined_at', { ascending: false })
        .limit(100),
    ])
    posts = (postsResult.data || []) as CommunityPost[]
    members = (membersResult.data || []) as CommunityMember[]
  }

  if (isCommunityAdmin) {
    const { data: requestRows, error: requestError } = await admin
      .from('community_join_requests')
      .select('id,user_id,created_at')
      .eq('community_id', community.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    if (requestError) throw requestError

    const userIds = [...new Set((requestRows || []).map(request => request.user_id).filter((id): id is string => Boolean(id)))]
    const profilesById = new Map<string, { full_name: string | null; avatar_url: string | null }>()
    if (userIds.length > 0) {
      const { data: requestProfiles, error: profilesError } = await admin
        .from('platform_users')
        .select('id,full_name,avatar_url')
        .in('id', userIds)
      if (profilesError) throw profilesError
      for (const requestProfile of requestProfiles || []) {
        profilesById.set(requestProfile.id, { full_name: requestProfile.full_name, avatar_url: requestProfile.avatar_url })
      }
    }

    joinRequests = (requestRows || []).map(request => ({
      id: request.id,
      user_id: request.user_id,
      created_at: request.created_at,
      platform_users: profilesById.get(request.user_id) || null,
    }))
  }

  const actions = (
    <JoinCommunityBtn
      communityId={community.id}
      isPrivate={Boolean(community.is_private)}
      initialJoined={isMember}
      initialPending={Boolean(pendingRequest)}
    />
  )
  const policyLabel = postingPolicy === 'members'
    ? 'Todos os membros podem publicar'
    : postingPolicy === 'reactions_only'
      ? 'Membros podem apenas reagir'
      : 'Só administradores publicam'
  const path = `/comunidades/${community.slug || community.id}`

  return (
    <main className="min-h-screen bg-background pb-20 sm:pb-0">
      <EntityHero
        coverUrl={community.cover_url}
        coverAlt={community.name}
        avatar={<div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-white bg-primary text-primary-foreground shadow-lg sm:h-24 sm:w-24"><Users className="h-10 w-10" /></div>}
        title={community.name}
        badges={<><Badge className="bg-white/15 text-white">Comunidade</Badge>{community.is_private ? <Badge variant="secondary"><Lock className="mr-1 h-3 w-3" />Privada</Badge> : <Badge variant="secondary"><Globe className="mr-1 h-3 w-3" />Pública</Badge>}</>}
        meta={<div className="flex flex-wrap gap-3 text-sm text-white/85">{community.address && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{community.address}</span>}<span>{scopeLabel[community.location_scope || ''] || community.location_scope}</span></div>}
        actions={actions}
      />
      <EntityDetailLayout
        main={<>
          <DetailSection title="Sobre"><p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{community.description || 'Esta comunidade ainda não tem descrição.'}</p></DetailSection>
          <DetailSection title="Modalidades">{categories.length ? <div className="flex flex-wrap gap-2">{categories.map(category => <Badge key={category.id} variant="secondary">{category.name}</Badge>)}</div> : <p className="text-sm text-muted-foreground">Sem modalidades associadas.</p>}</DetailSection>
          {canViewPrivateContent ? <>
            {canPost && user && <CreateCommunityPostBox communityId={community.id} currentUserName={profile?.full_name || user.email || 'Utilizador'} currentUserAvatar={profile?.avatar_url || ''} />}
            <DetailSection title="Publicações">{posts.length ? <div className="space-y-4">{posts.map(post => <PostCard key={post.id} post={post} />)}</div> : <p className="text-sm text-muted-foreground">Ainda não existem publicações.</p>}<DiscoveryPagination page={page} pageSize={PAGE_SIZE} total={postCount} href={nextPage => `${path}?page=${nextPage}`} /></DetailSection>
            <DetailSection title="Membros"><CommunityMembersList members={members} memberCount={memberCount} /></DetailSection>
            {isCommunityAdmin && joinRequests.length > 0 && <DetailSection title="Pedidos de adesão"><div className="space-y-3">{joinRequests.map(request => <form key={request.id} className="flex items-center justify-between gap-3 rounded-xl border p-3"><div><p className="font-medium">{request.platform_users?.full_name || 'Utilizador'}</p><p className="text-xs text-muted-foreground">{new Date(request.created_at).toLocaleDateString('pt-PT')}</p></div><div className="flex gap-2"><Button type="submit" size="sm" formAction={reviewCommunityJoinRequestAction.bind(null, request.id, 'approve')}>Aprovar</Button><Button type="submit" size="sm" variant="outline" formAction={reviewCommunityJoinRequestAction.bind(null, request.id, 'reject')}>Recusar</Button></div></form>)}</div></DetailSection>}
          </> : <DetailSection title="Conteúdo privado"><div className="rounded-xl border border-dashed p-8 text-center"><Lock className="mx-auto mb-3 h-7 w-7 text-muted-foreground" /><p className="font-medium">Adere à comunidade para veres publicações e membros.</p></div></DetailSection>}
        </>}
        aside={<><DetailSection title="Comunidade"><div className="grid grid-cols-2 gap-3"><DetailStat label="Membros" value={memberCount} /><DetailStat label="Publicações" value={postCount} /></div></DetailSection><DetailSection title="Regras"><div className="space-y-3 text-sm text-muted-foreground"><p className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />{policyLabel}</p>{community.is_private && <p className="flex gap-2"><Lock className="mt-0.5 h-4 w-4 text-primary" />Adesão sujeita a aprovação.</p>}</div></DetailSection><DetailSection title="Interação"><p className="flex gap-2 text-sm text-muted-foreground"><MessageSquare className="mt-0.5 h-4 w-4 text-primary" />Discussões e atividade da comunidade aparecem nesta página.</p></DetailSection></>}
      />
      <MobileActionBar>{actions}</MobileActionBar>
    </main>
  )
}
