import { ChevronRight, FilePlus, ShieldCheck, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/post-card'
import { CreatePostBox } from '@/components/create-post-box'
import Link from 'next/link'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
      currentUserType = profile.type
      currentUserName = profile.full_name || ''
      currentUserAvatar = profile.avatar_url || ''
    }
  }
  
  // 1. Fetch Posts
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      professionals (id, full_name, avatar_url, public_slug),
      sport_spaces (id, name, slug),
      likes:post_likes(count),
      comments:post_comments(count)
    `)
    .order('created_at', { ascending: false })

  // 2. Fetch suggestions (2 professionals, 1 space)
  const { data: suggestedProfs } = await supabase
    .from('professionals')
    .select('id, full_name, avatar_url, public_slug')
    .limit(2)
    
  const { data: suggestedSpaces } = await supabase
    .from('sport_spaces')
    .select('id, name, logo_url, slug')
    .limit(1)

  // 3. Fetch Highlights / Stories (Top professionals)
  const { data: highlightProfs } = await supabase
    .from('professionals')
    .select('id, full_name, avatar_url, is_verified, public_slug')
    .limit(4)

  // 4. Fetch a Community for the right sidebar
  const { data: topCommunity } = await supabase
    .from('communities')
    .select(`
      id, 
      name, 
      sport_category,
      community_members(count)
    `)
    .limit(1)
    .single()

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
                  <button className="text-primary font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">Seguir</button>
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
                  <button className="text-primary font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">Seguir</button>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Topics */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h4 className="font-bold text-base mb-4 text-foreground">Em Destaque</h4>
            <div className="space-y-4">
              <Link className="block group" href="/pesquisa?q=Padel">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">#LigaPadel2024</p>
                <p className="text-xs text-muted-foreground mt-0.5">1.2k publicações esta semana</p>
              </Link>
              <Link className="block group" href="/pesquisa?q=Corrida">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">#MaratonaLisboa</p>
                <p className="text-xs text-muted-foreground mt-0.5">850 publicações</p>
              </Link>
              <Link className="block group" href="/pesquisa?q=Crossfit">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">#CrossfitOpen</p>
                <p className="text-xs text-muted-foreground mt-0.5">Publicações recentes</p>
              </Link>
            </div>
          </div>
        </aside>

        {/* Feed Center Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Stories/Momentos Section */}
          <section className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Destaques</h2>
              <Link href="/pesquisa" className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
                Ver todos <ChevronRight className="text-[16px]" />
              </Link>
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
          ) : (
            <div className="text-center p-12 bg-card rounded-2xl border border-border shadow-sm">
              <FilePlus className="text-[48px] text-muted-foreground mb-4" />
              <h3 className="font-bold text-lg text-foreground mb-2">Ainda não há publicações</h3>
              <p className="text-muted-foreground text-sm">Segue mais profissionais e espaços para veres as suas novidades aqui.</p>
            </div>
          )}
        </div>

        {/* Right Sidebar (Desktop only) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          
          {/* Community Badge */}
          {topCommunity && (
            <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group shadow-sm">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110"></div>
              <h4 className="font-bold text-base mb-4 text-foreground relative z-10">Comunidade em Destaque</h4>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Users className="text-[28px]" />
                </div>
                <div>
                  <Link href={`/comunidades/${topCommunity.id}`}>
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{topCommunity.name}</p>
                  </Link>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">{topCommunity.community_members?.[0]?.count || 0} membros ativos</p>
                </div>
              </div>
              <Link href={`/comunidades/${topCommunity.id}`} className="block w-full py-2.5 border-2 border-primary text-primary font-bold rounded-xl text-center text-sm hover:bg-primary hover:text-primary-foreground transition-all relative z-10">
                Ver Tópicos
              </Link>
            </div>
          )}

          {/* Promotion / Ad Space */}
          <div className="rounded-2xl overflow-hidden relative h-64 shadow-sm group border border-border">
            <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Promo" src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1920&auto=format&fit=crop" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-6 flex flex-col justify-end">
              <span className="bg-yellow-500 text-black text-[10px] px-2 py-0.5 rounded font-bold self-start mb-3 tracking-wider">DESTAQUE PROMO</span>
              <h5 className="text-white font-bold text-[18px] leading-tight mb-3">Treino Personalizado: 20% OFF esta semana</h5>
              <Link href="/pesquisa?type=profissionais" className="bg-white text-black px-5 py-2.5 rounded-xl text-sm font-bold w-max hover:bg-muted transition-colors">Saiba Mais</Link>
            </div>
          </div>
          
          <div className="pt-4 flex flex-wrap gap-x-4 gap-y-2">
            <Link className="text-muted-foreground text-xs hover:text-primary transition-colors font-medium" href="/privacidade">Privacidade</Link>
            <Link className="text-muted-foreground text-xs hover:text-primary transition-colors font-medium" href="/termos">Termos</Link>
            <Link className="text-muted-foreground text-xs hover:text-primary transition-colors font-medium" href="/contacto">Ajuda</Link>
            <p className="text-muted-foreground text-xs w-full mt-2 font-medium">© 2026 FIND4SPORT</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
