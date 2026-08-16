import { Compass, FilePlus, Flame, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/post-card'
import { CreatePostBox } from '@/components/create-post-box'
import { FeedFilterModal } from '@/components/feed-filter-modal'
import { FollowButton } from '@/components/follow-button'
import Link from 'next/link'
import { canCreatePostForRole, normalizePlatformRole } from '@/lib/auth/roles'
import { PageContainer } from '@/components/patterns/page-shell'

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams
  const dateParam = typeof params.date === 'string' ? params.date : null
  const authorTypeParam = typeof params.authorType === 'string' ? params.authorType : null
  const categoryParam = typeof params.category === 'string' ? params.category : null
  const searchParam = typeof params.search === 'string' ? params.search : null
  const tabParam = typeof params.tab === 'string' ? params.tab : 'foryou'

  let currentUserType = 'user'
  let currentUserName = ''
  let currentUserAvatar = ''
  let canPublish = false

  if (user) {
    const { data: profile } = await supabase.from('platform_users').select('type, full_name, avatar_url').eq('id', user.id).single()
    if (profile) {
      const normalizedRole = normalizePlatformRole(profile.type)
      currentUserType = profile.type || 'user'
      currentUserName = profile.full_name || ''
      currentUserAvatar = profile.avatar_url || ''

      const [{ data: space }, { data: prof }] = await Promise.all([
        supabase.from('sport_spaces').select('id, name, logo_url').eq('owner_user_id', user.id).eq('is_verified', true).limit(1).maybeSingle(),
        supabase.from('professionals').select('id, full_name, avatar_url, is_verified').eq('user_id', user.id).eq('is_verified', true).maybeSingle(),
      ])

      if (space) {
        currentUserType = 'venue_manager'
        currentUserName = space.name || currentUserName
        currentUserAvatar = space.logo_url || currentUserAvatar
      } else if (prof) {
        currentUserType = 'professional'
        currentUserName = prof.full_name || currentUserName
        currentUserAvatar = prof.avatar_url || currentUserAvatar
      }

      canPublish = normalizedRole === 'admin' || (canCreatePostForRole(normalizedRole) && Boolean(space || prof))
    }
  }

  let followingIds: string[] = []
  if (user) {
    const { data: follows } = await supabase.from('user_follows').select('following_id').eq('follower_id', user.id)
    followingIds = (follows || []).map(f => f.following_id)
  }

  let followedProfRows: any[] = []
  let followedSpaceRows: any[] = []
  if (followingIds.length > 0) {
    const [{ data: profs }, { data: spaces }] = await Promise.all([
      supabase.from('professionals').select('id, user_id, full_name, avatar_url, public_slug, is_verified, rating_avg, review_count').in('user_id', followingIds).eq('is_verified', true).limit(20),
      supabase.from('sport_spaces').select('id, owner_user_id, name, logo_url, slug, is_verified, rating_avg, review_count').in('owner_user_id', followingIds).eq('is_verified', true).limit(20),
    ])
    followedProfRows = profs || []
    followedSpaceRows = spaces || []
  }

  let postsQuery = supabase.from('posts').select(`*, professionals (id, full_name, avatar_url, public_slug), sport_spaces (id, name, slug), likes:post_likes(count), comments:post_comments(count)`).is('community_id', null).order('created_at', { ascending: false }).limit(50)

  if (tabParam === 'following') {
    if (!user || followingIds.length === 0) {
      postsQuery = postsQuery.eq('id', '00000000-0000-0000-0000-000000000000')
    } else {
      const profIds = followedProfRows.map(p => p.id)
      const spaceIds = followedSpaceRows.map(s => s.id)
      const clauses = []
      if (profIds.length) clauses.push(`professional_id.in.(${profIds.join(',')})`)
      if (spaceIds.length) clauses.push(`sport_space_id.in.(${spaceIds.join(',')})`)
      postsQuery = clauses.length ? postsQuery.or(clauses.join(',')) : postsQuery.eq('id', '00000000-0000-0000-0000-000000000000')
    }
  }

  if (authorTypeParam === 'pro') postsQuery = postsQuery.not('professional_id', 'is', null)
  if (authorTypeParam === 'space') postsQuery = postsQuery.not('sport_space_id', 'is', null)
  if (dateParam === 'today') {
    const date = new Date(); date.setHours(0, 0, 0, 0); postsQuery = postsQuery.gte('created_at', date.toISOString())
  } else if (dateParam === 'week') postsQuery = postsQuery.gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
  else if (dateParam === 'month') postsQuery = postsQuery.gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())

  const keyword = categoryParam || searchParam
  if (keyword) postsQuery = postsQuery.ilike('content', `%${keyword}%`)
  const { data: posts } = await postsQuery

  let likedPostIds = new Set<string>()
  if (user && posts?.length) {
    const { data: likes } = await supabase.from('post_likes').select('post_id').eq('user_id', user.id).in('post_id', posts.map((p: any) => p.id))
    likedPostIds = new Set((likes || []).map((like: any) => like.post_id))
  }

  const { data: recentContent } = await supabase.from('posts').select('content').is('community_id', null).order('created_at', { ascending: false }).limit(250)
  const tagCounts: Record<string, number> = {}
  ;(recentContent || []).forEach((post: any) => {
    const matches = post.content?.match(/#[\wÀ-ÿ]+/g) || []
    matches.forEach((tag: string) => { tagCounts[tag] = (tagCounts[tag] || 0) + 1 })
  })
  const trendingTags = Object.entries(tagCounts).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count).slice(0, 5)

  const [{ data: suggestedProfsRaw }, { data: suggestedSpacesRaw }] = await Promise.all([
    supabase.from('professionals').select('id,user_id,full_name,avatar_url,public_slug,is_verified,rating_avg,review_count').eq('is_verified', true).eq('status', 'active').limit(20),
    supabase.from('sport_spaces').select('id,owner_user_id,name,logo_url,slug,is_verified,rating_avg,review_count').eq('is_verified', true).limit(20),
  ])

  const followedUserIds = new Set(followingIds)
  const score = (x: any) => Number(x.review_count || 0) * 2 + Number(x.rating_avg || 0)
  const suggestedProfs = (suggestedProfsRaw || []).filter((p: any) => p.user_id !== user?.id && !followedUserIds.has(p.user_id)).sort((a: any, b: any) => score(b) - score(a)).slice(0, 3)
  const suggestedSpaces = (suggestedSpacesRaw || []).filter((s: any) => s.owner_user_id && s.owner_user_id !== user?.id && !followedUserIds.has(s.owner_user_id)).sort((a: any, b: any) => score(b) - score(a)).slice(0, 2)

  return (
    <div className="min-h-screen bg-muted/15 py-4 sm:py-8">
      <PageContainer>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <main className="min-w-0 space-y-4 sm:space-y-5">
            <div className="sticky top-16 z-20 -mx-4 border-b border-border bg-background/95 px-4 py-2 backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border sm:p-2 sm:shadow-sm">
              <div className="flex items-center gap-2">
                <Link href="/feed?tab=foryou" className={`flex min-h-11 flex-1 items-center justify-center rounded-xl px-4 text-sm font-semibold transition sm:flex-none ${tabParam !== 'following' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>Para ti</Link>
                {user && <Link href="/feed?tab=following" className={`flex min-h-11 flex-1 items-center justify-center rounded-xl px-4 text-sm font-semibold transition sm:flex-none ${tabParam === 'following' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>A seguir</Link>}
                <div className="ml-auto"><FeedFilterModal /></div>
              </div>
            </div>

            {keyword && <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm"><span className="truncate">Filtro: <strong>{keyword}</strong></span><Link href="/feed" className="shrink-0 font-semibold text-primary">Limpar</Link></div>}

            <CreatePostBox currentUserType={currentUserType} currentUserName={currentUserName} currentUserAvatar={currentUserAvatar} canPublish={canPublish} />

            {posts?.length ? posts.map((post: any) => <PostCard key={post.id} post={post} isAuthenticated={Boolean(user)} initialIsLiked={likedPostIds.has(post.id)} />) : (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                {tabParam === 'following' ? <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" /> : <FilePlus className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />}
                <h2 className="font-semibold">{tabParam === 'following' ? 'Ainda não há conteúdo das contas que segues' : 'Ainda não há publicações'}</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{tabParam === 'following' ? 'Descobre profissionais e espaços e segue os que te interessam.' : 'Quando profissionais e espaços verificados publicarem, o conteúdo aparecerá aqui.'}</p>
                {tabParam === 'following' && <Link href="/pesquisa" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">Descobrir</Link>}
              </div>
            )}
          </main>

          <aside className="hidden space-y-4 lg:block">
            {(suggestedProfs.length > 0 || suggestedSpaces.length > 0) && (
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2"><Compass className="h-4 w-4 text-primary" /><h2 className="font-semibold">Sugestões</h2></div>
                <div className="space-y-4">
                  {suggestedProfs.map((prof: any) => <div key={prof.id} className="flex items-center justify-between gap-3"><Link href={`/profissionais/${prof.public_slug || prof.id}`} className="min-w-0"><p className="truncate text-sm font-medium">{prof.full_name}</p><p className="text-xs text-muted-foreground">Profissional</p></Link>{user && <FollowButton targetUserId={prof.user_id} initialIsFollowing={false} variant="outline" />}</div>)}
                  {suggestedSpaces.map((space: any) => <div key={space.id} className="flex items-center justify-between gap-3"><Link href={`/espacos/${space.slug || space.id}`} className="min-w-0"><p className="truncate text-sm font-medium">{space.name}</p><p className="text-xs text-muted-foreground">Espaço</p></Link>{user && <FollowButton targetUserId={space.owner_user_id} initialIsFollowing={false} variant="outline" />}</div>)}
                </div>
              </section>
            )}

            {trendingTags.length > 0 && (
              <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2"><Flame className="h-4 w-4 text-orange-500" /><h2 className="font-semibold">Tendências reais</h2></div>
                <div className="space-y-3">{trendingTags.map(({ tag, count }) => <Link key={tag} href={`/feed?category=${encodeURIComponent(tag.slice(1))}`} className="block rounded-lg p-1 hover:text-primary"><p className="text-sm font-medium">{tag}</p><p className="text-xs text-muted-foreground">{count} {count === 1 ? 'publicação' : 'publicações'}</p></Link>)}</div>
              </section>
            )}
          </aside>
        </div>
      </PageContainer>
    </div>
  )
}
