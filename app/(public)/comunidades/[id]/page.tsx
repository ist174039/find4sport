import { Globe, Lock, MessageSquare, User, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PostCard from '@/components/post-card'
import { JoinCommunityBtn } from '@/components/join-community-btn'
import { CreateCommunityPostBox } from '@/components/create-community-post-box'
import { CommunityMembersList } from '@/components/community-members-list'
import { canCreatePostForRole, normalizePlatformRole } from '@/lib/auth/roles'

export default async function CommunityProfilePage(props: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const params = await props.params

  // Get current user to check membership
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch community details
  const { data: community, error } = await supabase
    .from('communities')
    .select(`
      *,
      community_members(count)
    `)
    .eq('id', params.id)
    .single()

  if (error || !community) {
    return notFound()
  }

  // Fetch posts for this community
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      professionals (id, full_name, avatar_url, public_slug),
      sport_spaces (id, name, slug),
      platform_users (id, full_name, avatar_url),
      likes:post_likes(count),
      comments:post_comments(count)
    `)
    .eq('community_id', community.id)
    .order('created_at', { ascending: false })

  // Fetch active members to show in sidebar
  const { data: members } = await supabase
    .from('community_members')
    .select('id, role, platform_users(id, full_name, avatar_url)')
    .eq('community_id', community.id)
    .order('joined_at', { ascending: false })

  const displayMembers = members || []
  const memberCount = displayMembers.length

  // Fetch current user membership separately to avoid relation errors
  let initialJoined = false
  let canPostInCommunity = false
  let currentUserName = ''
  let currentUserAvatar = ''

  if (user) {
    const { data: membership } = await supabase
      .from('community_members')
      .select('id')
      .eq('community_id', community.id)
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (membership) {
      initialJoined = true
    }

    const { data: profile } = await supabase
      .from('platform_users')
      .select('type, full_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle()
    
    if (profile) {
      currentUserName = profile.full_name || ''
      currentUserAvatar = profile.avatar_url || user?.user_metadata?.avatar_url || ''
      canPostInCommunity = canCreatePostForRole(normalizePlatformRole(profile.type || user.user_metadata?.type))
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Immersive Cover Section */}
      <section className="relative w-full h-[250px] md:h-[350px] bg-muted">
        <img 
          src={community.cover_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1920&auto=format&fit=crop'} 
          alt="Capa da Comunidade" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        
        {/* Cover Content Bottom Aligned */}
        <div className="absolute bottom-0 left-0 w-full px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end justify-between gap-6 relative">
            <div className="flex-1 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shrink-0">
                    <Users className="text-[36px]" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-md">
                      {community.name}
                    </h1>
                    <div className="flex items-center gap-4 text-white/90 text-sm mt-2">
                      <span className="bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[11px] border border-white/10">
                        {community.sport_category || 'Desporto'}
                      </span>
                      <span className="flex items-center gap-1 font-medium drop-shadow">
                        <User className="text-[18px]" />
                        {memberCount} membros
                      </span>
                      <span className="flex items-center gap-1 font-medium drop-shadow">
                        {community.is_private ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                        {community.is_private ? 'Privada' : 'Pública'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pb-1 w-full md:w-auto mt-4 md:mt-0">
                <JoinCommunityBtn 
                  communityId={community.id} 
                  isPrivate={community.is_private} 
                  initialJoined={initialJoined}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Feed/Main) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm mb-8">
              <h2 className="text-xl font-bold mb-4 text-foreground">Sobre a Comunidade</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {community.description || 'Nenhuma descrição fornecida.'}
              </p>
            </div>

            {/* Placeholder for Community Feed */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Publicações Recentes</h3>
            </div>
            
            {initialJoined && canPostInCommunity && (
              <CreateCommunityPostBox 
                communityId={community.id}
                currentUserName={currentUserName}
                currentUserAvatar={currentUserAvatar}
              />
            )}
            
            {posts && posts.length > 0 ? (
              posts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                <MessageSquare className="text-4xl mb-4 opacity-50 h-5 w-5" />
                <p className="text-lg font-medium text-foreground">Sem publicações ainda</p>
                <p className="text-sm mt-1">Sê o primeiro a partilhar algo com a comunidade!</p>
              </div>
            )}
          </div>

          {/* Right Column (Sidebar Rules/Members) */}
          <div className="space-y-6">
            <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-foreground">Regras da Comunidade</h3>
              <ol className="list-decimal list-inside space-y-3 text-sm text-muted-foreground">
                <li>Respeito mútuo entre todos os membros.</li>
                <li>Não é permitido spam ou publicidade não solicitada.</li>
                <li>Partilhar apenas conteúdo relacionado com desporto.</li>
              </ol>
            </div>

            <CommunityMembersList members={displayMembers} memberCount={memberCount} />
          </div>
          
        </div>
      </section>
    </div>
  )
}
