import type { ComponentProps } from 'react'
import { Globe, Lock, MapPin, MessageSquare, ShieldCheck, Users } from 'lucide-react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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
type CategoryRow = { category: Category[] }
type CommunityPost = ComponentProps<typeof PostCard>['post']
type CommunityMember = ComponentProps<typeof CommunityMembersList>['members'][number]
type JoinRequest = {
  id: string
  user_id: string
  created_at: string
  platform_users: Array<{ full_name: string | null; avatar_url: string | null }>
}

export default async function CommunityProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const { id: rawId } = await params
  const { page: pageRaw } = await searchParams
  const page = Math.max(1, Number.parseInt(pageRaw || '1', 10) || 1)
  const { data: { user } } = await supabase.auth.getUser()
  const isUuid = /^[0-9a-f-]{36}$/i.test(rawId)

  let community: Community | null = null
  if (isUuid) {
    community = (await admin.from('communities').select('*').eq('id', rawId).maybeSingle()).data as Community | null
  }
  if (!community) {
    community = (await admin.from('communities').select('*').eq('slug', rawId).maybeSingle()).data as Community | null
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
  const categories = ((categoryRows || []) as CategoryRow[]).flatMap(row => row.category)

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
    const { data } = await admin
      .from('community_join_requests')
      .select('id,user_id,created_at,platform_users:user_id(full_name,avatar_url)')
      .eq('community_id', community.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    joinRequests = (data || []) as JoinRequest[]
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
        meta={<><span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{memberCount} membros</span>{canViewPrivateContent && <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" />{postCount} publicações</span>}{categories[0]?.name && <span>{categories[0].name}</span>}{community.address && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{community.address}</span>}</>}
        actions={actions}
      />
      <EntityDetailLayout
        main={<>
          <DetailSection title="Sobre a comunidade">
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">{community.description || 'Esta comunidade ainda não tem descrição.'}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border bg-muted/20 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Regra de participação</p><p className="mt-1 text-sm font-medium">{policyLabel}</p></div>
              <div className="rounded-xl border bg-muted/20 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Âmbito</p><p className="mt-1 text-sm font-medium">{scopeLabel[community.location_scope || ''] || 'Online'}{community.address ? ` · ${community.address}` : ''}</p></div>
            </div>
          </DetailSection>
          {!canViewPrivateContent ? (
            <DetailSection><div className="py-6 text-center"><Lock className="mx-auto h-10 w-10 text-primary" /><h2 className="mt-4 text-xl font-bold">Conteúdo reservado a membros</h2><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Esta comunidade é privada. Envia um pedido de adesão para aceder ao feed e aos membros.</p><div className="mx-auto mt-5 max-w-xs">{actions}</div></div></DetailSection>
          ) : (
            <>
              <DetailSection title="Membros" icon={<Users className="h-5 w-5 text-primary" />}><CommunityMembersList members={members} memberCount={memberCount} /></DetailSection>
              <DetailSection title="Feed" icon={<MessageSquare className="h-5 w-5 text-primary" />}>
                {canPost ? <CreateCommunityPostBox communityId={community.id} currentUserName={profile?.full_name || ''} currentUserAvatar={profile?.avatar_url || user?.user_metadata?.avatar_url || ''} /> : isMember ? <div className="mb-4 rounded-xl border bg-muted/25 p-3 text-sm text-muted-foreground">A publicação nesta comunidade está limitada pela regra definida pela administração.</div> : null}
                {posts.length ? <><div className="space-y-4">{posts.map(post => <PostCard key={post.id} post={post} isAuthenticated={Boolean(user)} />)}</div><DiscoveryPagination page={page} pageSize={PAGE_SIZE} total={postCount} href={n => n === 1 ? path : `${path}?page=${n}`} /></> : <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Ainda não existem publicações.</div>}
              </DetailSection>
            </>
          )}
          {isCommunityAdmin && <DetailSection title="Pedidos de adesão" icon={<ShieldCheck className="h-5 w-5 text-primary" />}>{joinRequests.length === 0 ? <p className="text-sm text-muted-foreground">Sem pedidos pendentes.</p> : <div className="divide-y">{joinRequests.map(request => <div key={request.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold">{request.platform_users[0]?.full_name || 'Utilizador'}</p><p className="text-xs text-muted-foreground">Pedido em {new Date(request.created_at).toLocaleDateString('pt-PT')}</p></div><div className="grid grid-cols-2 gap-2"><form action={reviewCommunityJoinRequestAction.bind(null, request.id, 'reject')}><Button type="submit" variant="outline" className="min-h-11 w-full">Recusar</Button></form><form action={reviewCommunityJoinRequestAction.bind(null, request.id, 'approve')}><Button type="submit" className="min-h-11 w-full">Aprovar</Button></form></div></div>)}</div>}</DetailSection>}
        </>}
        aside={<DetailSection title="Resumo"><div className="grid grid-cols-2 gap-4"><DetailStat label="Membros" value={memberCount} /><DetailStat label="Privacidade" value={community.is_private ? 'Privada' : 'Pública'} />{canViewPrivateContent && <DetailStat label="Publicações" value={postCount} />}<DetailStat label="Âmbito" value={scopeLabel[community.location_scope || ''] || 'Online'} />{categories[0]?.name && <DetailStat label="Modalidade" value={categories[0].name} />}</div></DetailSection>}
      />
      <MobileActionBar>{actions}</MobileActionBar>
    </main>
  )
}
