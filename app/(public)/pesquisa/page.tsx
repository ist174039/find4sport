import { ArrowRight, Building2, Calendar, MapPin, RotateCw, Search, Star, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PesquisaFiltros } from '@/components/pesquisa-filtros'
import { PesquisaMapWrapper } from '@/components/pesquisa-map-wrapper'
import { PesquisaLayout } from '@/components/pesquisa-layout'
import { Badge } from '@/components/ui/badge'

export interface UnifiedResultItem {
  id: string
  itemType: 'space' | 'professional' | 'event'
  title: string
  subtitle: string
  address: string
  rating_avg: number | null
  review_count: number | null
  is_verified: boolean
  image_url?: string | null
  link: string
  latitude?: number | null
  longitude?: number | null
}

export default async function PesquisaPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  
  const searchParams = props.searchParams ? await props.searchParams : {}
  const categoryParam = typeof searchParams.category === 'string' ? searchParams.category.trim() : ''
  const query = typeof searchParams.q === 'string' ? searchParams.q.trim() : categoryParam
  const typeParam = (typeof searchParams.type === 'string' ? searchParams.type : typeof searchParams.tipo === 'string' ? searchParams.tipo : 'todos').toLowerCase()
  const ratingParam = typeof searchParams.rating === 'string' ? parseFloat(searchParams.rating) : null

  let results: UnifiedResultItem[] = []

  // 1. Fetch Sport Spaces if type is 'espacos' or 'todos'
  if (typeParam === 'espacos' || typeParam === 'todos' || typeParam === 'all') {
    let spacesQuery = supabase.from('sport_spaces').select('*')

    if (query) {
      spacesQuery = spacesQuery.or(`name.ilike.%${query}%,address.ilike.%${query}%`)
    }

    if (ratingParam) {
      spacesQuery = spacesQuery.gte('rating_avg', ratingParam)
    }

    const { data: spacesData } = await spacesQuery.limit(30)

    if (spacesData) {
      const spaceItems: UnifiedResultItem[] = spacesData.map((space) => ({
        id: `space-${space.id}`,
        itemType: 'space',
        title: space.name,
        subtitle: space.description || 'Espaço Desportivo',
        address: space.address || 'Localização não definida',
        rating_avg: space.rating_avg,
        review_count: space.review_count,
        is_verified: !!space.is_verified,
        image_url: space.image_url || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=300',
        link: `/espacos/${space.slug || space.id}`,
        latitude: space.latitude,
        longitude: space.longitude,
      }))
      results = [...results, ...spaceItems]
    }
  }

  // 2. Fetch Professionals if type is 'profissionais' or 'todos'
  if (typeParam === 'profissionais' || typeParam === 'todos' || typeParam === 'all') {
    let proQuery = supabase.from('professionals').select('*')

    if (query) {
      proQuery = proQuery.or(`full_name.ilike.%${query}%,address.ilike.%${query}%,professional_name.ilike.%${query}%`)
    }

    if (ratingParam) {
      proQuery = proQuery.gte('rating_avg', ratingParam)
    }

    const { data: prosData } = await proQuery.limit(30)

    if (prosData) {
      const proItems: UnifiedResultItem[] = prosData.map((prof) => ({
        id: `pro-${prof.id}`,
        itemType: 'professional',
        title: prof.full_name || prof.professional_name || 'Profissional de Desporto',
        subtitle: prof.bio || 'Personal Trainer / Treinador',
        address: prof.address || 'Localização não disponível',
        rating_avg: prof.rating_avg,
        review_count: prof.review_count,
        is_verified: !!prof.is_verified,
        image_url: prof.avatar_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=256',
        link: `/profissionais/${prof.public_slug || prof.id}`,
        latitude: prof.latitude,
        longitude: prof.longitude,
      }))
      results = [...results, ...proItems]
    }
  }

  // 3. Fetch Events if type is 'eventos' or 'todos'
  if (typeParam === 'eventos' || typeParam === 'todos' || typeParam === 'all') {
    let eventQuery = supabase.from('events').select('*')

    if (query) {
      eventQuery = eventQuery.or(`title.ilike.%${query}%,address.ilike.%${query}%,description.ilike.%${query}%`)
    }

    const { data: eventsData } = await eventQuery.limit(30)

    if (eventsData) {
      const eventItems: UnifiedResultItem[] = eventsData.map((evt) => ({
        id: `event-${evt.id}`,
        itemType: 'event',
        title: evt.title,
        subtitle: evt.description || 'Evento Desportivo',
        address: evt.address || 'Localização não disponível',
        rating_avg: null,
        review_count: null,
        is_verified: true,
        image_url: evt.image_url || 'https://images.unsplash.com/photo-1517649763962-0c623266010b?q=80&w=600',
        link: `/eventos/${evt.id}`,
        latitude: evt.latitude || 38.7223,
        longitude: evt.longitude || -9.1393,
      }))
      results = [...results, ...eventItems]
    }
  }

  return (
    <PesquisaLayout 
      resultsPane={
        <>
          {/* Filters Header */}
          <PesquisaFiltros initialQuery={query} totalResults={results.length} />
          
          {/* Scrollable Results List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum resultado encontrado</h3>
              <p className="text-muted-foreground text-sm max-w-sm">Tente ajustar os seus filtros ou pesquisar por um termo diferente.</p>
              {query && (
                <Link href="/pesquisa" className="mt-6 text-primary hover:underline font-medium text-sm">
                  Limpar pesquisa
                </Link>
              )}
            </div>
          ) : (
            results.map((item) => (
              <Link 
                href={item.link} 
                key={item.id} 
                className="group flex flex-col sm:flex-row bg-card border border-border p-4 hover:shadow-md hover:border-primary/40 transition-all cursor-pointer rounded-xl gap-4"
              >
                <div className="relative shrink-0">
                  <img 
                    className="w-full sm:w-32 h-44 sm:h-32 rounded-lg object-cover" 
                    alt={item.title} 
                    src={item.image_url!} 
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <Badge 
                      variant={item.itemType === 'space' ? 'default' : item.itemType === 'event' ? 'outline' : 'secondary'} 
                      className={`text-[10px] shadow-sm ${item.itemType === 'event' ? 'bg-amber-500 text-white border-amber-600 font-bold' : ''}`}
                    >
                      {item.itemType === 'space' ? 'Espaço' : item.itemType === 'event' ? 'Evento' : 'Profissional'}
                    </Badge>
                    {item.is_verified && (
                      <Badge variant="success" className="text-[9px] shadow-sm">
                        Verificado
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1">
                        {item.title}
                      </h3>
                      {item.rating_avg !== null && item.rating_avg > 0 && (
                        <div className="flex items-center shrink-0 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded-md border border-amber-200/50 text-xs font-bold">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-1" />
                          <span>{item.rating_avg.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground text-xs line-clamp-2 mb-2">{item.subtitle}</p>
                    
                    <div className="flex items-center text-xs text-muted-foreground font-medium">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-primary shrink-0" /> 
                      <span className="truncate">{item.address}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                    <span className="font-medium text-primary text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                      Ver {item.itemType === 'space' ? 'Espaço' : item.itemType === 'event' ? 'Evento' : 'Perfil'} <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                    <button className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all px-3 py-1 rounded-lg font-medium text-xs shrink-0">
                      {item.itemType === 'space' ? 'Reservar Campo' : item.itemType === 'event' ? 'Ver Inscrições' : 'Contactar'}
                    </button>
                  </div>
                </div>
              </Link>
            ))
          )}
          </div>
        </>
      }
      mapPane={
        <PesquisaMapWrapper items={results} />
      }
    />
  )
}
