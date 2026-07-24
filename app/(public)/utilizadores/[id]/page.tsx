import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { 
  User, MapPin, Calendar, Users, 
  Activity, Globe, ArrowLeft, Trophy
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch user basic profile
  const { data: profile } = await supabase
    .from('platform_users')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!profile) {
    return notFound()
  }

  // 2. Fetch communities the user belongs to
  const { data: memberData } = await supabase
    .from('community_members')
    .select(`
      *,
      community:communities(*)
    `)
    .eq('user_id', id)
    .order('joined_at', { ascending: false })

  const communities = (memberData || [])
    .map(m => m.community)
    .filter(Boolean)

  // 3. Fetch events the user is participating in
  const { data: participantData } = await supabase
    .from('event_participants')
    .select(`
      *,
      event:events(
        *,
        category:categories(*),
        space:sport_spaces(name, address)
      )
    `)
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const events = (participantData || [])
    .map(p => p.event)
    .filter(Boolean)

  const initials = (profile.full_name || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex flex-col min-h-screen bg-background pb-16 animate-in fade-in duration-500">
      {/* Top Banner / Cover */}
      <section className="relative w-full h-[200px] md:h-[280px] bg-gradient-to-r from-primary/20 via-primary/10 to-muted">
        <div className="absolute top-6 left-6 z-10">
          <Button asChild variant="secondary" size="sm" className="gap-2 backdrop-blur-md bg-background/80 shadow-sm">
            <Link href="/comunidades">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Link>
          </Button>
        </div>
      </section>

      {/* Main Profile Info Section */}
      <section className="px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              {/* Profile Avatar */}
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-card bg-muted overflow-hidden shrink-0 shadow-md relative -mt-16 md:-mt-20">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.full_name || 'Utilizador'} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-4xl">
                    {initials}
                  </div>
                )}
              </div>

              {/* User Identity Details */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {profile.full_name || 'Atleta'}
                  </h1>
                  <Badge variant="outline" className="capitalize text-xs font-semibold px-2.5 py-0.5">
                    {profile.type === 'professional' ? 'Profissional' : 'Membro / Atleta'}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs md:text-sm text-muted-foreground">
                  {profile.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary" />
                      {profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Membro desde {formatDate(profile.created_at, "MMMM 'de' yyyy")}
                  </span>
                  {profile.language && (
                    <span className="flex items-center gap-1.5 uppercase">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      {profile.language}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Summary Badges */}
            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-center">
              <div className="text-center px-4">
                <p className="text-2xl font-bold text-foreground">{communities.length}</p>
                <p className="text-xs text-muted-foreground">Comunidades</p>
              </div>
              <div className="h-8 w-px bg-border"></div>
              <div className="text-center px-4">
                <p className="text-2xl font-bold text-foreground">{events.length}</p>
                <p className="text-xs text-muted-foreground">Eventos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section: Communities & Events */}
      <section className="px-4 sm:px-6 lg:px-8 mt-8">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Section 1: Communities Joined */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Users className="h-5 w-5 text-indigo-500" />
                Comunidades que Pertence
                <Badge variant="secondary" className="ml-2 text-xs">
                  {communities.length}
                </Badge>
              </h2>
            </div>

            {communities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((comm: any) => (
                  <Link 
                    key={comm.id} 
                    href={`/comunidades/${comm.id}`}
                    className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/50 transition-all"
                  >
                    <div className="h-32 bg-muted relative">
                      <img 
                        src={comm.cover_url || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop'} 
                        alt={comm.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <span className="absolute bottom-3 left-3 text-white text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 backdrop-blur-md uppercase">
                        {comm.sport_category || 'Desporto'}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
                          {comm.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {comm.description || 'Sem descrição.'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-primary font-semibold">
                        <span>Ver Comunidade</span>
                        <span>→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center text-muted-foreground flex flex-col items-center">
                <Users className="h-10 w-10 mb-3 opacity-30 text-indigo-500" />
                <p className="font-semibold text-foreground">Este utilizador ainda não pertence a nenhuma comunidade.</p>
              </div>
            )}
          </div>

          {/* Section 2: Events Participating */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Activity className="h-5 w-5 text-teal-500" />
                Eventos em que vai Participar
                <Badge variant="secondary" className="ml-2 text-xs">
                  {events.length}
                </Badge>
              </h2>
            </div>

            {events.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((evt: any) => (
                  <div 
                    key={evt.id} 
                    className="flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-all group p-5 justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="outline" className="text-xs">
                          {evt.category?.name || 'Evento Desportivo'}
                        </Badge>
                        {evt.price_min ? (
                          <span className="text-xs font-bold text-primary">{evt.price_min}€</span>
                        ) : (
                          <Badge variant="success" className="text-[10px]">Grátis</Badge>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {evt.title}
                      </h3>

                      <div className="space-y-2 text-xs text-muted-foreground mb-4">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {formatDate(evt.start_date, "dd 'de' MMMM 'às' HH:mm")}
                        </p>
                        {evt.address && (
                          <p className="flex items-center gap-2 line-clamp-1">
                            <MapPin className="h-3.5 w-3.5 text-teal-500" />
                            {evt.address}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button asChild variant="secondary" size="sm" className="w-full mt-4">
                      <Link href={`/eventos/${evt.slug || evt.id}`}>
                        Ver Evento
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-dashed border-border rounded-2xl p-10 text-center text-muted-foreground flex flex-col items-center">
                <Trophy className="h-10 w-10 mb-3 opacity-30 text-teal-500" />
                <p className="font-semibold text-foreground">Este utilizador não tem inscrições ativas em eventos.</p>
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  )
}
