import { Compass, FilePlus, Flame, Users } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PostCard, { type PostCardPost } from '@/components/post-card'
import { CreatePostBox } from '@/components/create-post-box'
import { FeedFilterModal } from '@/components/feed-filter-modal'
import { FollowButton } from '@/components/follow-button'
import { canCreatePostForRole, normalizePlatformRole } from '@/lib/auth/roles'
import { PageContainer } from '@/components/patterns/page-shell'

type FollowedProfessional = { id: string; user_id: string; full_name: string | null; avatar_url: string | null; public_slug: string | null; is_verified: boolean | null; rating_avg: number | string | null; review_count: number | null }
type FollowedSpace = { id: string; owner_user_id: string | null; name: string; logo_url: string | null; slug: string | null; is_verified: boolean | null; rating_avg: number | string | null; review_count: number | null }
type LikeRow = { post_id: string }
type RecentContent = { content: string | null }
type RankedEntity = { rating_avg: number | string | null; review_count: number | null }

const score = (entity: RankedEntity) => Number(entity.review_count || 0) * 2 + Number(entity.rating_avg || 0)

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams
  const dateParam = typeof params.date === 'string' ? params.date : null
  const authorTypeParam = typeof params.authorType === 'string' ? params.authorType : null
  const categoryParam = typeof params.category === 'string' ? params.category : null
  const searchParam = typeof params.search === 'string' ? params.search : null
  const tabParam = typeof params.tab === 'string' ? params.tab : 'foryou'

  let currentUserType = 'user', currentUserName = '', currentUserAvatar = ''
  let canPublish = false
  if (user) {
    const { data: profile } = await supabase.from('platform_users').select('type,full_name,avatar_url').eq('id', user.id).single()
    if (profile) {
      const normalizedRole = normalizePlatformRole(profile.type)
      currentUserType = profile.type || 'user'
      currentUserName = profile.full_name || ''
      currentUserAvatar = profile.avatar_url || ''
      const [{ data: space }, { data: prof }] = await Promise.all([
        supabase.from('sport_spaces').select('id,name,logo_url').eq('owner_user_id', user.id).eq('is_verified', true).eq('status', 'active').limit(1).maybeSingle(),
        supabase.from('professionals').select('id,full_name,avatar_url,is_verified').eq('user_id', user.id).eq('is_verified', true).eq('status', 'active').maybeSingle(),
      ])
      if (space) { currentUserType = 'venue_manager'; currentUserName = space.name || currentUserName; currentUserAvatar = space.logo_url || currentUserAvatar }
      else if (prof) { currentUserType = 'professional'; currentUserName = prof.full_name || currentUserName; currentUserAvatar = prof.avatar_url || currentUserAvatar }
      canPublish = canCreatePostForRole(normalizedRole) && Boolean(space || prof)
    }
  }

  let followingIds: string[] = []
  if (user) {
    const { data: follows } = await supabase.from('user_follows').select('following_id').eq('follower_id', user.id)
    followingIds = (follows || []).map(follow => follow.following_id)
  }

  let followedProfRows: FollowedProfessional[] = []
  let followedSpaceRows: FollowedSpace[] = []
  if (followingIds.length) {
    const [{ data: profs }, { data: spaces }] = await Promise.all([
      supabase.from('professionals').select('id,user_id,full_name,avatar_url,public_slug,is_verified,rating_avg,review_count').in('user_id', followingIds).eq('is_verified', true).eq('status', 'active').limit(20),
      supabase.from('sport_spaces').select('id,owner_user_id,name,logo_url,slug,is_verified,rating_avg,review_count').in('owner_user_id', followingIds).eq('is_verified', true).eq('status', 'active').limit(20),
    ])
    followedProfRows = (profs || []) as FollowedProfessional[]
    followedSpaceRows = (spaces || []) as FollowedSpace[]
  }

  let postsQuery = supabase.from('posts').select(`*, professionals (id, full_name, professional_name, avatar_url, public_slug), sport_spaces (id, name, logo_url, slug), platform_users (id, full_name, avatar_url), likes:post_likes(count), comments:post_comments(count)`).is('community_id', null).order('created_at', { ascending: false }).limit(50)
  if (tabParam === 'following') {
    if (!user || !followingIds.length) postsQuery = postsQuery.eq('id', '00000000-0000-0000-0000-000000000000')
    else {
      const profIds = followedProfRows.map(professional => professional.id)
      const spaceIds = followedSpaceRows.map(space => space.id)
      const clauses: string[] = []
      if (profIds.length) clauses.push(`professional_id.in.(${profIds.join(',')})`)
      if (spaceIds.length) clauses.push(`sport_space_id.in.(${spaceIds.join(',')})`)
      postsQuery = clauses.length ? postsQuery.or(clauses.join(',')) : postsQuery.eq('id', '00000000-0000-0000-0000-000000000000')
    }
  }
  if (authorTypeParam === 'pro') postsQuery = postsQuery.not('professional_id', 'is', null)
  if (authorTypeParam === 'space') postsQuery = postsQuery.not('sport_space_id', 'is', null)
  if (dateParam === 'today') { const date = new Date(); date.setHours(0, 0, 0, 0); postsQuery = postsQuery.gte('created_at', date.toISOString()) }
  else if (dateParam === 'week') postsQuery = postsQuery.gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
  else if (dateParam === 'month') postsQuery = postsQuery.gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
  const keyword = categoryParam || searchParam
  if (keyword) postsQuery = postsQuery.ilike('content', `%${keyword}%`)
  const { data: postsRaw } = await postsQuery
  const posts = (postsRaw || []) as PostCardPost[]

  let likedPostIds = new Set<string>()
  if (user && posts.length) {
    const { data: likes } = await supabase.from('post_likes').select('post_id').eq('user_id', user.id).in('post_id', posts.map(post => post.id))
    likedPostIds = new Set(((likes || []) as LikeRow[]).map(like => like.post_id))
  }

  const { data: recentContentRaw } = await supabase.from('posts').select('content').is('community_id', null).order('created_at', { ascending: false }).limit(250)
  const tagCounts: Record<string, number> = {}
  for (const post of (recentContentRaw || []) as RecentContent[]) {
    const matches = post.content?.match(/#[\wÀ-ÿ]+/g) || []
    for (const tag of matches) tagCounts[tag] = (tagCounts[tag] || 0) + 1
  }
  const trendingTags = Object.entries(tagCounts).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count).slice(0, 5)

  const [{ data: suggestedProfsRaw }, { data: suggestedSpacesRaw }] = await Promise.all([
    supabase.from('professionals').select('id,user_id,full_name,avatar_url,public_slug,is_verified,rating_avg,review_count').eq('is_verified', true).eq('status', 'active').limit(20),
    supabase.from('sport_spaces').select('id,owner_user_id,name,logo_url,slug,is_verified,rating_avg,review_count').eq('is_verified', true).eq('status', 'active').limit(20),
  ])
  const suggestedProfCandidates = (suggestedProfsRaw || []) as FollowedProfessional[]
  const suggestedSpaceCandidates = (suggestedSpacesRaw || []) as FollowedSpace[]
  const followedUserIds = new Set(followingIds)
  const suggestedProfs = suggestedProfCandidates.filter(professional => professional.user_id !== user?.id && !followedUserIds.has(professional.user_id)).sort((a, b) => score(b) - score(a)).slice(0, 3)
  const suggestedSpaces = suggestedSpaceCandidates.filter((space): space is FollowedSpace & { owner_user_id: string } => Boolean(space.owner_user_id) && space.owner_user_id !== user?.id && !followedUserIds.has(space.owner_user_id as string)).sort((a, b) => score(b) - score(a)).slice(0, 2)

  return <div className="min-h-screen overflow-x-hidden bg-muted/15 py-2 sm:py-8"><PageContainer><div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
    <main className="min-w-0 space-y-3 sm:space-y-5"><div className="rounded-2xl border border-border bg-card p-1.5 shadow-sm"><div className="grid grid-cols-[1fr_1fr_auto] items-center gap-1"><Link href="/feed?tab=foryou" className={`flex min-h-11 items-center justify-center rounded-xl px-2 text-sm font-semibold transition ${tabParam !== 'following' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>Para ti</Link>{user ? <Link href="/feed?tab=following" className={`flex min-h-11 items-center justify-center rounded-xl px-2 text-sm font-semibold transition ${tabParam === 'following' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>A seguir</Link> : <div />}<FeedFilterModal /></div></div>
    {keyword && <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm"><span className="min-w-0 truncate">Filtro: <strong>{keyword}</strong></span><Link href="/feed" className="shrink-0 font-semibold text-primary">Limpar</Link></div>}
    <div className="min-w-0"><CreatePostBox currentUserType={currentUserType} currentUserName={currentUserName} currentUserAvatar={currentUserAvatar} canPublish={canPublish} /></div>
    {posts.length ? posts.map(post => <PostCard key={post.id} post={post} isAuthenticated={Boolean(user)} initialIsLiked={likedPostIds.has(post.id)} />) : <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center sm:p-10">{tabParam === 'following' ? <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" /> : <FilePlus className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />}<h2 className="font-semibold">{tabParam === 'following' ? 'Ainda não há conteúdo das contas que segues' : 'Ainda não há publicações'}</h2><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{tabParam === 'following' ? 'Descobre profissionais e espaços e segue os que te interessam.' : 'Quando profissionais e espaços verificados publicarem, o conteúdo aparecerá aqui.'}</p></div>}
    </main>
    <aside className="hidden space-y-4 lg:block">{(suggestedProfs.length || suggestedSpaces.length) ? <section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><Compass className="h-4 w-4 text-primary" /><h2 className="font-semibold">Sugestões</h2></div><div className="space-y-4">{suggestedProfs.map(professional => <div key={professional.id} className="flex items-center justify-between gap-3"><Link href={`/profissionais/${professional.public_slug || professional.id}`} className="min-w-0"><p className="truncate text-sm font-medium">{professional.full_name}</p><p className="text-xs text-muted-foreground">Profissional</p></Link>{user && <FollowButton targetUserId={professional.user_id} initialIsFollowing={false} variant="outline" />}</div>)}{suggestedSpaces.map(space => <div key={space.id} className="flex items-center justify-between gap-3"><Link href={`/espacos/${space.slug || space.id}`} className="min-w-0"><p className="truncate text-sm font-medium">{space.name}</p><p className="text-xs text-muted-foreground">Espaço</p></Link>{user && <FollowButton targetUserId={space.owner_user_id} initialIsFollowing={false} variant="outline" />}</div>)}</div></section> : null}{trendingTags.length > 0 && <section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><Flame className="h-4 w-4 text-orange-500" /><h2 className="font-semibold">Tendências reais</h2></div>{trendingTags.map(({ tag, count }) => <Link key={tag} href={`/feed?category=${encodeURIComponent(tag.slice(1))}`} className="block rounded-lg p-1 hover:text-primary"><p className="text-sm font-medium">{tag}</p><p className="text-xs text-muted-foreground">{count} {count === 1 ? 'publicação' : 'publicações'}</p></Link>)}</section>}</aside>
  </div></PageContainer></div>
}
