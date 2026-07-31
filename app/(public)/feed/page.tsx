import { ChevronRight, FilePlus, ShieldCheck, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/post-card'
import { CreatePostBox } from '@/components/create-post-box'
import { FeedFilterModal } from '@/components/feed-filter-modal'
import { FollowButton } from '@/components/follow-button'
import Link from 'next/link'

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

  if (user) {
    const { data: profile } = await supabase
      .from('platform_users')
      .select('type, full_name, avatar_url')
      .eq('id', user.id)
      .single()

    if (profile) {
      currentUserType = profile.type || 'user'
      currentUserName = profile.full_name || ''
      currentUserAvatar = profile.avatar_url || ''

      // Se não for admin, verificar se gere algum espaço para lhe dar permissões no feed
      if (currentUserType !== 'admin') {
        const { data: space } = await supabase
          .from('sport_spaces')
          .select('id, name, logo_url')
          .eq('owner_user_id', user.id)
          .limit(1)
          .maybeSingle()
        
        if (space) {
          currentUserType = 'espaco'
          currentUserName = space.name || ''
          currentUserAvatar = space.logo_url || ''
        } else if (currentUserType === 'professional') {
          // Check professional profile
          const { data: prof } = await supabase
            .from('professionals')
            .select('full_name, avatar_url')
            .eq('user_id', user.id)
            .maybeSingle()
            
          if (prof) {
            currentUserName = prof.full_name || ''
            currentUserAvatar = prof.avatar_url || ''
          }
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
    // Get professional IDs for followed users
    const { data: followedProfs } = await supabase.from('professionals').select('id').in('user_id', followingIds)
    // Get space IDs for followed users
    const { data: followedSpaces } = await supabase.from('sport_spaces').select('id').in('owner_user_id', followingIds)
    
    const profIds = followedProfs?.map(p => p.id) || []
    const spaceIds = followedSpaces?.map(s => s.id) || []
    
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

  // 3. Fetch suggestions (2 professionals, 1 space)
  const { data: suggestedProfs } = await supabase
    .from('professionals')
    .select('id, user_id, full_name, avatar_url, public_slug')
    .limit(2)
    
  const { data: suggestedSpaces } = await supabase
    .from('sport_spaces')
    .select('id, owner_user_id, name, logo_url, slug')
    .limit(1)

  // 4. Fetch Highlights / Stories (Top professionals)
  const { data: highlightProfs } = await supabase
    .from('professionals')
    .select('id, full_name, avatar_url, is_verified, public_slug')
    .limit(4)

  return (
    <div className="bg-background min-h-screen">
      <div className="py-8 md:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar / Info Section */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="bg-primary/10 text-primary-foreground p-6 rounded-2xl shadow-sm border border-primary/20">
            <div className="flex items-start gap-3 mb-4 text-primary">
              <ShieldCheck className="text-[28px]" />
              <h3 className="text-lg font-bold leading-tight">Publicações Seguras</h3>
            </div>
            <p className="text-sm text-foreground opacity-90 mb-4">
              Apenas profissionais e espaços verificados podem publicar conteúdo oficial no feed principal.
            </p>
          </div>

          {/* Suggestion Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-base mb-4 text-foreground">Sugestões para seguir</h4>
            <div className="space-y-4">
              
              {/* Professionals */}
              {suggestedProfs?.map(prof => (
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
              {suggestedSpaces?.map(space => (
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
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-base mb-4 text-foreground">Em Destaque</h4>
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
          <div className="flex items-center gap-6 border-b border-border pb-px px-2">
            <Link 
              href="/feed?tab=foryou" 
              className={`pb-3 text-sm font-bold transition-colors relative ${tabParam !== 'following' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Para Ti
              {tabParam !== 'following' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
            </Link>
            {user && (
              <Link 
                href="/feed?tab=following" 
                className={`pb-3 text-sm font-bold transition-colors relative ${tabParam === 'following' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                A Seguir
                {tabParam === 'following' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full"></span>}
              </Link>
            )}
          </div>

          {/* Stories/Momentos Section */}
          <section className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Destaques</h2>
              <FeedFilterModal />
            </div>
            
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {highlightProfs?.map(prof => (
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
            </div>
          </section>

          {/* Active Filter Banner */}
          {keyword && (
            <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm font-semibold">
              <span>Publicações filtradas por: <strong>#{keyword}</strong></span>
              <Link href="/feed" className="hover:underline text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-bold">
                Limpar Filtro
              </Link>
            </div>
          )}

          {/* Create Post Box */}
          <CreatePostBox 
            currentUserType={currentUserType}
            currentUserName={currentUserName}
            currentUserAvatar={currentUserAvatar}
          />

          {/* Posts Feed */}
          {posts && posts.length > 0 ? (
            posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : tabParam === 'following' ? (
            <div className="text-center p-12 bg-card rounded-2xl border border-border shadow-sm">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-bold text-lg text-foreground mb-2">O teu feed está vazio</h3>
              <p className="text-muted-foreground text-sm mb-6">Começa a seguir profissionais e espaços para veres as suas publicações aqui.</p>
              <Link href="/profissionais" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
                Descobrir Profissionais
              </Link>
            </div>
          ) : (
            <div className="text-center p-12 bg-card rounded-2xl border border-border shadow-sm">
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
