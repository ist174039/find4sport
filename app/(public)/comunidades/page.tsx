import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CommunitiesPage() {
  const supabase = await createClient()

  const { data: communities, error } = await supabase
    .from('communities')
    .select(`
      *,
      community_members (count)
    `)
    .order('created_at', { ascending: false })

  const safeCommunities = communities || []

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="border-b border-border bg-muted/30 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
                Comunidades
              </h1>
              <p className="mt-2 text-muted-foreground text-lg max-w-2xl">
                Junta-te a grupos locais e encontra pessoas com a mesma paixão pelo desporto.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/pesquisa?type=comunidades" className="bg-secondary text-secondary-foreground px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-secondary/80 transition-colors border border-border shadow-sm">
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filtros
              </Link>
              <Link href="/comunidades/criar" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Criar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-8 sm:py-12 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeCommunities.map((community: any) => {
              const memberCount = community.community_members?.[0]?.count || 0

              return (
                <Link key={community.id} href={`/comunidades/${community.id}`} className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/50 transition-all">
                  <div className="h-40 bg-muted relative">
                    <img 
                      src={community.cover_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop'} 
                      alt={community.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                    <div className="absolute bottom-3 left-4 text-white text-[10px] font-bold px-2 py-1 rounded bg-black/40 backdrop-blur-md uppercase tracking-wider">
                      {community.sport_category || 'Desporto'}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">{community.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
                      {community.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between text-xs font-medium text-muted-foreground border-t border-border pt-4">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">groups</span>
                        {memberCount} {memberCount === 1 ? 'membro' : 'membros'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">
                          {community.is_private ? 'lock' : 'public'}
                        </span>
                        {community.is_private ? 'Privada' : 'Pública'}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          
          {safeCommunities.length === 0 && (
            <div className="py-12 text-center border border-dashed border-border rounded-xl bg-muted/20">
              <span className="material-symbols-outlined text-4xl text-muted-foreground mb-3">groups</span>
              <p className="text-lg font-medium text-foreground">Ainda não existem comunidades.</p>
              <p className="text-sm text-muted-foreground mt-1">Seja o primeiro a criar um grupo!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
