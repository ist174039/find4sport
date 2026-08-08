import { Compass, FilePlus, Flame, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/post-card'
import { CreatePostBox } from '@/components/create-post-box'
import { FeedFilterModal } from '@/components/feed-filter-modal'
import { FollowButton } from '@/components/follow-button'
import Link from 'next/link'
import { canCreatePostForRole, normalizePlatformRole } from '@/lib/auth/roles'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
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
    const { data: profile } = await supabase
      .from('platform_users')
      .select('type, full_name, avatar_url')
      .eq('id', user.id)
      .single()

    if (profile) {
      const normalizedRole = normalizePlatformRole(profile.type)
      currentUserType = profile.type || 'user'
      currentUserName = profile.full_name || ''
      currentUserAvatar = profile.avatar_url || ''

      // Se não for admin, verificar se gere algum espaço para lhe dar permissões no feed
      const [{ data: space }, { data: prof }] = await Promise.all([
        supabase
          .from('sport_spaces')
          .select('id, name, logo_url')
          .eq('owner_user_id', user.id)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('professionals')
          .select('id, full_name, avatar_url')
          .eq('user_id', user.id)
          .maybeSingle(),
      ])
        
      if (space) {
        currentUserType = 'espaco'
        currentUserName = space.name || currentUserName
        currentUserAvatar = space.logo_url || currentUserAvatar
      } else if (prof) {
        currentUserType = 'professional'
        currentUserName = prof.full_name || currentUserName
        currentUserAvatar = prof.avatar_url || currentUserAvatar
      }

      if (normalizedRole === 'admin') {
        canPublish = true
      } else {
        canPublish = canCreatePostForRole(normalizedRole) && Boolean(space || prof)
        if (!canPublish && currentUserType === 'professional') {
          currentUserType = 'user'
        }
      }
    }
  }

  // 0. Fetch Following IDs if authenticated
  let followingIds: string[] = []
  if (user) {
    const { data: follows } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', user.id)
    
    if (follows) {
      followingIds = follows.map(f => f.following_id)
    }
  }

  // Resolve followed professionals/spaces once so we can reuse in feed, highlights and suggestions
  let followedProfRows: Array<{ id: string; user_id: string; full_name: string; avatar_url: string | null; public_slug: string | null; is_verified?: boolean | null }> = []
  let followedSpaceRows: Array<{ id: string; owner_user_id: string | null; name: string; logo_url: string | null; slug: string | null }> = []

  if (followingIds.length > 0) {
    const [{ data: profs }, { data: spaces }] = await Promise.all([
      supabase
        .from('professionals')
        .select('id, user_id, full_name, avatar_url, public_slug, is_verified')
        .in('user_id', followingIds)
        .limit(20),
      supabase
        .from('sport_spaces')
        .select('id, owner_user_id, name, logo_url, slug')
        .in('owner_user_id', followingIds)
        .limit(20),
    ])

    followedProfRows = profs || []
    followedSpaceRows = spaces || []
  }
  
  // 1. Fetch Posts with Filters
  let postsQuery = supabase
    .from('posts')
    .select(`
      *,
      professionals (id, full_name, avatar_url, public_slug),
      sport_spaces (id, name, slug),
      likes:post_likes(count),
      comments:post_comments(count)
    `)
    .is('community_id', null)
    .order('created_at', { ascending: false })

  if (tabParam === 'following' && user && followingIds.length > 0) {
    const profIds = followedProfRows.map(p => p.id)
    const spaceIds = followedSpaceRows.map(s => s.id)
    
    const orQueries = []
    if (profIds.length > 0) orQueries.push(`professional_id.in.(${profIds.join(',')})`)
    if (spaceIds.length > 0) orQueries.push(`sport_space_id.in.(${spaceIds.join(',')})`)
    
    if (orQueries.length > 0) {
      postsQuery = postsQuery.or(orQueries.join(','))
    } else {
      // Follows exist but none of the followed users are pros/spaces with posts
      postsQuery = postsQuery.eq('id', '00000000-0000-0000-0000-000000000000')
    }
  } else if (tabParam === 'following') {
    // If not logged in or doesn't follow anyone, show nothing on following tab
    postsQuery = postsQuery.eq('id', '00000000-0000-0000-0000-000000000000')
  }

  if (authorTypeParam === 'pro') {
    postsQuery = postsQuery.not('professional_id', 'is', null)
  } else if (authorTypeParam === 'space') {
    postsQuery = postsQuery.not('sport_space_id', 'is', null)
  }

  if (dateParam === 'today') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    postsQuery = postsQuery.gte('created_at', today.toISOString())
  } else if (dateParam === 'week') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    postsQuery = postsQuery.gte('created_at', weekAgo.toISOString())
  } else if (dateParam === 'month') {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    postsQuery = postsQuery.gte('created_at', monthAgo.toISOString())
  }

  const keyword = categoryParam || searchParam
  if (keyword) {
    postsQuery = postsQuery.ilike('content', `%${keyword}%`)
  }

  const { data: posts } = await postsQuery

  let likedPostIds = new Set<string>()
  if (user && posts && posts.length > 0) {
    const { data: likes } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', user.id)
      .in('post_id', posts.map((p: any) => p.id))

    likedPostIds = new Set((likes || []).map((like: any) => like.post_id))
  }

  // 2. Calculate Real Trending Tags for "Em Destaque"
  const { data: allPublicPosts } = await supabase
    .from('posts')
    .select('content')
    .is('community_id', null)

  const { data: categories } = await supabase
    .from('categories')
    .select('name')

  const tagCounts: Record<string, number> = {}

  // Extract #hashtags from post content
  if (allPublicPosts) {
    allPublicPosts.forEach((p: any) => {
      const matches = p.content?.match(/#[\wÀ-ÿ]+/g)
      if (matches) {
        matches.forEach((t: string) => {
          const tag = t.startsWith('#') ? t : `#${t}`
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })
  }

  // Count mentions of categories as fallback tags
  if (categories) {
    categories.forEach((c: any) => {
      const tagName = `#${c.name}`
      if (!tagCounts[tagName]) {
        let count = 0
        if (allPublicPosts) {
          allPublicPosts.forEach((p: any) => {
            if (p.content?.toLowerCase().includes(c.name.toLowerCase())) {
              count++
            }
          })
        }
        if (count > 0) {
          tagCounts[tagName] = count
        }
      }
    })
  }

  // Fallback defaults if database has few posts
  if (Object.keys(tagCounts).length === 0) {
    tagCounts['#desafio10k'] = 1
    tagCounts['#Padel'] = 1
    tagCounts['#Corrida'] = 1
  }

  const trendingTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)

  // 3. Fetch suggestion candidates
  const { data: suggestedProfsRaw } = await supabase
    .from('professionals')
    .select('id, user_id, full_name, avatar_url, public_slug, is_verified, rating_avg, review_count')
    .limit(24)
    
  const { data: suggestedSpacesRaw } = await supabase
    .from('sport_spaces')
    .select('id, owner_user_id, name, logo_url, slug, rating_avg, review_count')
    .limit(20)

  // 4. Fetch highlight candidates
  const { data: highlightCandidates } = await supabase
    .from('professionals')
    .select('id, user_id, full_name, avatar_url, is_verified, public_slug, review_count, rating_avg')
    .limit(24)

  const isFollowingTab = tabParam === 'following'
  const followedUserIds = new Set(followingIds)
  const selfUserId = user?.id || null

  const highlightProfs = (highlightCandidates || [])
    .filter((p: any) => {
      if (!isFollowingTab) return true
      return followedUserIds.has(p.user_id)
    })
    .sort((a: any, b: any) => {
      const scoreA = (a.review_count || 0) * 2 + (a.rating_avg || 0)
      const scoreB = (b.review_count || 0) * 2 + (b.rating_avg || 0)
      return scoreB - scoreA
    })
    .slice(0, 8)

  const suggestedProfs = (isFollowingTab ? followedProfRows : (suggestedProfsRaw || []))
    .filter((prof: any) => {
      if (selfUserId && prof.user_id === selfUserId) return false
      if (!isFollowingTab && followedUserIds.has(prof.user_id)) return false
      return true
    })
    .sort((a: any, b: any) => {
      const scoreA = (a.review_count || 0) * 2 + (a.rating_avg || 0)
      const scoreB = (b.review_count || 0) * 2 + (b.rating_avg || 0)
      return scoreB - scoreA
    })
    .slice(0, 3)

  const suggestedSpaces = (isFollowingTab ? followedSpaceRows : (suggestedSpacesRaw || []))
    .filter((space: any) => {
      if (selfUserId && space.owner_user_id === selfUserId) return false
      if (!isFollowingTab && space.owner_user_id && followedUserIds.has(space.owner_user_id)) return false
      return true
    })
    .sort((a: any, b: any) => {
      const scoreA = (a.review_count || 0) * 2 + (a.rating_avg || 0)
      const scoreB = (b.review_count || 0) * 2 + (b.rating_avg || 0)
      return scoreB - scoreA
    })
    .slice(0, 2)

  const suggestionsTitle = isFollowingTab ? 'Contas que segues' : 'Sugestões para ti'
  const highlightsTitle = isFollowingTab ? 'Destaques de quem segues' : 'Destaques para ti'

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_500px_at_50%_-220px,rgba(16,185,129,0.16),transparent)]">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-10 sm:px-6 lg:px-8 md:pt-10">
        <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur-sm md:p-8">
          <div className="pointer-events-none absolute -top-20 right-[-120px] h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-130px] left-[-80px] h-72 w-72 rounded-full bg-info/10 blur-3xl" />

          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Comunidade ativa em tempo real
              </div>
              <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl lg:text-4xl">Feed FIND4SPORT</h1>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                Descobre novidades de profissionais e espaços, acompanha tendências e liga-te à comunidade desportiva.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <div className="rounded-2xl border border-border/70 bg-background/70 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Publicações</p>
                <p className="text-base font-black text-foreground">{posts?.length || 0}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Destaques</p>
                <p className="text-base font-black text-foreground">{trendingTags.length}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
        
        {/* Left Sidebar / Info Section */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="rounded-2xl border border-primary/25 bg-linear-to-br from-primary/20 via-primary/10 to-card p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-4 text-primary">
              <ShieldCheck className="text-[28px]" />
              <h3 className="text-lg font-bold leading-tight">Publicações Seguras</h3>
            </div>
            <p className="text-sm text-foreground opacity-90 mb-4">
              Apenas profissionais e espaços verificados podem publicar conteúdo oficial no feed principal.
            </p>
            <div className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-background/75 px-2.5 py-1 text-[11px] font-semibold text-primary">
              <Compass className="h-3 w-3" />
              Curadoria ativa
            </div>
          </div>

          {/* Suggestion Card */}
          <div className="rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm backdrop-blur-sm">
            <h4 className="font-bold text-base mb-4 text-foreground">{suggestionsTitle}</h4>
            <div className="space-y-4">
              
              {/* Professionals */}
              {suggestedProfs.map((prof: any) => (
                <div key={prof.id} className="flex items-center justify-between group">
                  <Link href={`/profissionais/${prof.public_slug || prof.id}`} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border border-border">
                      <img className="w-full h-full object-cover group-hover:scale-110 transition-transform" src={prof.avatar_url || 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=640&auto=format&fit=crop'} alt={prof.full_name} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[120px]">{prof.full_name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Profissional</p>
                    </div>
                  </Link>
                  {user && (
                    <FollowButton 
                      targetUserId={prof.user_id} 
                      initialIsFollowing={followingIds.includes(prof.user_id)} 
                      variant="outline" 
                    />
                  )}
                </div>
              ))}

              {/* Spaces */}
              {suggestedSpaces.map((space: any) => (
                <div key={space.id} className="flex items-center justify-between group">
                  <Link href={`/espacos/${space.slug || space.id}`} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden border border-border">
                      <img className="w-full h-full object-cover group-hover:scale-110 transition-transform" src={space.logo_url || 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=200&auto=format&fit=crop'} alt={space.name} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[120px]">{space.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Espaço</p>
                    </div>
                  </Link>
                  {user && space.owner_user_id && (
                    <FollowButton 
                      targetUserId={space.owner_user_id} 
                      initialIsFollowing={followingIds.includes(space.owner_user_id)} 
                      variant="outline" 
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Real Dynamic Trending Topics */}
          <div className="rounded-2xl border border-border/70 bg-card/90 p-6 shadow-sm backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-bold text-base text-foreground">{highlightsTitle}</h4>
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <div className="space-y-4">
              {trendingTags.map(({ tag, count }) => {
                const tagSearch = tag.replace('#', '')
                const isSelected = keyword?.toLowerCase() === tagSearch.toLowerCase()

                return (
                  <Link 
                    key={tag} 
                    className="block group" 
                    href={isSelected ? '/feed' : `/feed?category=${encodeURIComponent(tagSearch)}`}
                  >
                    <p className={`text-sm font-semibold transition-colors ${isSelected ? 'text-primary font-bold' : 'text-foreground group-hover:text-primary'}`}>
                      {tag}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {count} {count === 1 ? 'publicação' : 'publicações'}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Feed Center Column (Wider layout) */}
        <div className="lg:col-span-9 space-y-6">

          {/* Feed Tabs */}
          <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card/90 p-2 shadow-sm backdrop-blur-sm">
            <Link 
              href="/feed?tab=foryou" 
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${tabParam !== 'following' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              Para Ti
            </Link>
            {user && (
              <Link 
                href="/feed?tab=following" 
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${tabParam === 'following' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                A Seguir
              </Link>
            )}
          </div>

          {/* Stories/Momentos Section */}
          <section className="relative rounded-2xl border border-border/70 bg-card/90 p-5 shadow-sm backdrop-blur-sm md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black tracking-tight text-foreground">{highlightsTitle}</h2>
              <FeedFilterModal />
            </div>
            
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {highlightProfs.map((prof: any) => (
                <Link key={prof.id} href={`/profissionais/${prof.public_slug || prof.id}`} className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className={`w-16 h-16 rounded-full p-[2px] border-2 ${prof.is_verified ? 'border-primary' : 'border-border'} group-hover:scale-105 transition-transform`}>
                    <div className="w-full h-full rounded-full border-2 border-background overflow-hidden bg-muted">
                      <img className="w-full h-full object-cover" alt={prof.full_name} src={prof.avatar_url || 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=640&auto=format&fit=crop'} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground truncate w-16 text-center group-hover:text-primary transition-colors">
                    {prof.full_name.split(' ')[0]}
                  </span>
                </Link>
              ))}
              {highlightProfs.length === 0 && (
                <div className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                  {isFollowingTab
                    ? 'Ainda não existem destaques das contas que segues.'
                    : 'Ainda não existem destaques para mostrar.'}
                </div>
              )}
            </div>
          </section>

          {/* Active Filter Banner */}
          {keyword && (
            <div className="flex items-center justify-between rounded-2xl border border-primary/30 bg-linear-to-r from-primary/15 via-primary/8 to-transparent p-4 text-primary text-sm font-semibold">
              <span>Publicações filtradas por: <strong>#{keyword}</strong></span>
              <Link href="/feed" className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90">
                Limpar Filtro
              </Link>
            </div>
          )}

          {/* Create Post Box */}
          <CreatePostBox 
            currentUserType={currentUserType}
            currentUserName={currentUserName}
            currentUserAvatar={currentUserAvatar}
            canPublish={canPublish}
          />

          {/* Posts Feed */}
          {posts && posts.length > 0 ? (
            posts.map((post: any) => (
              <PostCard
                key={post.id}
                post={post}
                isAuthenticated={Boolean(user)}
                initialIsLiked={likedPostIds.has(post.id)}
              />
            ))
          ) : tabParam === 'following' ? (
            <div className="rounded-2xl border border-border/70 bg-card/90 p-12 text-center shadow-sm backdrop-blur-sm">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-bold text-lg text-foreground mb-2">O teu feed está vazio</h3>
              <p className="text-muted-foreground text-sm mb-6">Começa a seguir profissionais e espaços para veres as suas publicações aqui.</p>
              <Link href="/profissionais" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
                Descobrir Profissionais
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/70 bg-card/90 p-12 text-center shadow-sm backdrop-blur-sm">
              <FilePlus className="text-[48px] text-muted-foreground mb-4" />
              <h3 className="font-bold text-lg text-foreground mb-2">Ainda não há publicações</h3>
              <p className="text-muted-foreground text-sm">Segue mais profissionais e espaços para veres as suas novidades aqui.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
