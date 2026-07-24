'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  CalendarCheck, Heart, MapPin, 
  ArrowRight, Search, Activity, Calendar, Star, Loader2, Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDate } from '@/lib/utils'

export function UserDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [stats, setStats] = useState({
    favoritesCount: 0,
    eventsCount: 0,
  })

  useEffect(() => {
    async function loadUserData() {
      if (!user?.id) return
      setLoading(true)
      const supabase = createClient()

      try {
        // 1a. Fetch user's real favorites from database
        const { data: favsData, count: favsCount, error: favError } = await supabase
          .from('favorites')
          .select(`
            *,
            professional:professionals(*),
            space:sport_spaces(*),
            event:events(*)
          `, { count: 'exact' })
          .eq('user_id', user.id)
          
        if (favError) setErrorMsg(prev => (prev ? prev + ' | ' : '') + 'Fav Error: ' + favError.message)

        // 1b. Fetch user's joined communities (counted as favorites)
        const { data: commData, count: commCount, error: commError } = await supabase
          .from('community_members')
          .select(`
            *,
            community:communities(*)
          `, { count: 'exact' })
          .eq('user_id', user.id)

        if (commError) setErrorMsg(prev => (prev ? prev + ' | ' : '') + 'Comm Error: ' + commError.message)

        const combinedFavs = [
          ...(favsData || []),
          ...(commData || []).map(c => ({
            id: c.id,
            community: c.community,
          }))
        ]

        setFavorites(combinedFavs.slice(0, 5))

        // 2. Fetch user's enrolled events (consistent with /dashboard/eventos)
        const { data: participantsData, count: eventsCount, error: evError } = await supabase
          .from('event_participants')
          .select(`
            *,
            event:events(
              *,
              category:categories(*),
              space:sport_spaces(name, address)
            )
          `, { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(4)
          
        if (evError) setErrorMsg(prev => (prev ? prev + ' | ' : '') + 'Events Error: ' + evError.message)

        const userEvents = (participantsData || []).map(p => p.event).filter(Boolean)
        setUpcomingEvents(userEvents)

        setStats({
          favoritesCount: (favsCount || 0) + (commCount || 0),
          eventsCount: eventsCount || 0,
        })
      } catch (err: any) {
        setErrorMsg(prev => (prev ? prev + ' | ' : '') + 'JS Error: ' + err.message)
        console.error('Error loading user dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user?.id])

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Atleta'

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            Pronto para treinar, {firstName}? 🏃‍♂️
          </h1>
          <p className="text-muted-foreground">Aqui tens o resumo da tua atividade e os próximos eventos na plataforma.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/pesquisa">
            <Button className="gap-2 shadow-sm">
              <Search className="h-4 w-4" />
              Descobrir Espaços & Pros
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Favoritos Guardados</p>
              <h3 className="text-3xl font-bold text-foreground">{loading ? '...' : stats.favoritesCount}</h3>
            </div>
            <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
              <Heart className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Próximos Eventos</p>
              <h3 className="text-3xl font-bold text-foreground">{loading ? '...' : stats.eventsCount}</h3>
            </div>
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <CalendarCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Estado da Conta</p>
              <h3 className="text-lg font-bold text-foreground">Utilizador Ativo</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Activity className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Real Upcoming Events */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              Próximos Eventos Disponíveis
            </h2>
            <Link href="/eventos">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Ver Todos <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center p-12 bg-card rounded-2xl border border-border">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingEvents.map((evt) => (
                <div key={evt.id} className="bg-card border border-border p-5 rounded-2xl hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <Badge variant="outline" className="text-xs">
                        {evt.category?.name || 'Evento'}
                      </Badge>
                      {evt.price_min ? (
                        <span className="text-xs font-bold text-primary">{evt.price_min}€</span>
                      ) : (
                        <Badge variant="success" className="text-[10px]">Grátis</Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-base text-foreground mb-2 line-clamp-1">{evt.title}</h3>
                    
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {formatDate(evt.start_date, "dd 'de' MMMM 'às' HH:mm")}
                      </p>
                      {evt.address && (
                        <p className="flex items-center gap-2 line-clamp-1">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {evt.address}
                        </p>
                      )}
                    </div>
                  </div>

                  <Link href={`/eventos/${evt.slug || evt.id}`} className="mt-5">
                    <Button variant="secondary" size="sm" className="w-full">
                      Ver Detalhes do Evento
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarCheck}
              title="Sem eventos próximos no momento"
              description="Explore todos os eventos e torneios organizados na plataforma."
              action={
                <Link href="/eventos">
                  <Button size="sm" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Explorar Eventos
                  </Button>
                </Link>
              }
            />
          )}
        </div>

        {/* Right Column: Real User Favorites */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500 fill-red-500" /> Os Meus Favoritos
              </h2>
            </div>
            
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : favorites.length > 0 ? (
              <div className="space-y-3">
                {favorites.map((fav) => {
                  const target = fav.professional || fav.space || fav.event || fav.community
                  const name = target?.name || target?.full_name || target?.title || 'Favorito'
                  const type = fav.professional ? 'Profissional' : fav.space ? 'Espaço' : fav.community ? 'Comunidade' : 'Evento'
                  const link = fav.professional 
                    ? `/profissionais/${target?.public_slug || target?.id}` 
                    : fav.space 
                    ? `/espacos/${target?.slug || target?.id}` 
                    : fav.community
                    ? `/comunidades/${target?.id}`
                    : `/eventos/${target?.slug || target?.id}`

                  return (
                    <Link key={fav.id} href={link}>
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted transition-colors cursor-pointer mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                          {name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate text-foreground">{name}</p>
                          <p className="text-xs text-muted-foreground truncate">{type}</p>
                        </div>
                        {target?.rating_avg && (
                          <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold shrink-0">
                            <Star className="h-3 w-3 fill-amber-500" />
                            {target.rating_avg}
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                icon={Heart}
                title="Sem favoritos salvos"
                description="Guarde espaços e profissionais favoritos para aceder facilmente."
                action={
                  <Link href="/pesquisa">
                    <Button variant="outline" size="sm">
                      Pesquisar
                    </Button>
                  </Link>
                }
              />
            )}
            
            <Link href="/dashboard/favoritos" className="block mt-4">
              <Button variant="outline" className="w-full justify-between text-xs">
                Gerir Todos os Favoritos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
