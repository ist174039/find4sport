import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PesquisaFiltros } from '@/components/pesquisa-filtros'
import { PesquisaMapWrapper } from '@/components/pesquisa-map-wrapper'

export default async function PesquisaPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  
  const searchParams = props.searchParams ? await props.searchParams : {}
  const query = typeof searchParams.q === 'string' ? searchParams.q : ''

  let dbQuery = supabase.from('professionals').select('*')
  
  if (query) {
    dbQuery = dbQuery.ilike('full_name', `%${query}%`)
  }

  // Handle rating filter
  const rating = typeof searchParams.rating === 'string' ? parseFloat(searchParams.rating) : null
  if (rating) {
    dbQuery = dbQuery.gte('rating_avg', rating)
  }

  const { data: professionals } = await dbQuery.limit(20)
  
  const safeProfessionals = professionals || []

  return (
    <main className="flex-1 flex flex-col md:flex-row overflow-hidden border-t border-border">
      
      {/* Results Pane */}
      <section className="w-full md:w-[600px] lg:w-[640px] flex flex-col bg-background border-r border-border h-[calc(100vh-64px)]">
        {/* Filters Header */}
        <PesquisaFiltros initialQuery={query} totalResults={safeProfessionals.length} />
        
        {/* Scrollable Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
          {safeProfessionals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <span className="material-symbols-outlined text-4xl text-muted-foreground mb-4">search_off</span>
              <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum resultado encontrado</h3>
              <p className="text-muted-foreground text-sm max-w-sm">Tente ajustar os seus filtros ou pesquisar por termos diferentes.</p>
              {query && (
                <Link href="/pesquisa" className="mt-6 text-primary hover:underline font-medium text-sm">
                  Limpar pesquisa
                </Link>
              )}
            </div>
          ) : (
            safeProfessionals.map((prof) => (
              <Link 
                href={`/profissionais/${prof.public_slug || prof.id}`} 
                key={prof.id} 
                className="group flex flex-col sm:flex-row bg-card border border-border p-4 hover:shadow-md hover:border-primary/40 transition-all cursor-pointer rounded-xl gap-4"
              >
                <div className="relative shrink-0">
                  <img 
                    className="w-full sm:w-32 h-48 sm:h-32 rounded-lg object-cover" 
                    alt={prof.full_name} 
                    src={prof.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=256&auto=format&fit=crop'} 
                  />
                  {prof.is_verified && (
                    <span className="absolute top-2 left-2 sm:-top-2 sm:-right-2 bg-emerald-100 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-200 shadow-sm">
                      VERIFICADO
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1">{prof.full_name}</h3>
                      {prof.rating_avg !== null && prof.rating_avg > 0 && (
                        <div className="flex items-center shrink-0 bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded-md border border-yellow-200/50">
                          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="ml-1 font-semibold text-xs">{prof.rating_avg.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2">{prof.bio || 'Profissional de Desporto'}</p>
                    
                    <div className="mt-3 flex items-center text-xs text-muted-foreground font-medium">
                      <span className="material-symbols-outlined text-[16px] mr-1">location_on</span> 
                      <span className="truncate">{prof.address || 'Localização não disponível'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                    <span className="font-medium text-primary text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Ver Perfil <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </span>
                    <button className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all px-4 py-1.5 rounded-lg font-medium text-sm shrink-0">
                      Reservar
                    </button>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
      
      {/* Map Pane */}
      <section className="hidden md:flex flex-1 relative bg-muted h-[calc(100vh-64px)] z-0">
        <PesquisaMapWrapper professionals={safeProfessionals} />
        
        {/* Redo Search in area button */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[400]">
          <button className="bg-background border border-border px-5 py-2.5 shadow-md flex items-center gap-2 font-medium text-sm hover:bg-muted text-foreground transition-all rounded-full">
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Pesquisar nesta zona
          </button>
        </div>
      </section>
    </main>
  )
}
