'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, MapPin, Users, Edit, ExternalLink, Activity } from 'lucide-react'

type Event = {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string | null
  address: string | null
  capacity: number | null
  status: string
  category_id: string | null
  image_url: string | null
  created_at: string
}

export default function DashboardEventosPage() {
  const router = useRouter()
  const [createdEvents, setCreatedEvents] = useState<Event[]>([])
  const [enrolledEvents, setEnrolledEvents] = useState<any[]>([])
  const [isProfessionalOrSpace, setIsProfessionalOrSpace] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: prof } = await supabase.from('professionals').select('id').eq('user_id', user.id).single()
      const { data: space } = await supabase.from('sport_spaces').select('id').eq('owner_user_id', user.id).single()
      
      const isCreator = !!prof || !!space
      setIsProfessionalOrSpace(isCreator)

      if (isCreator) {
        const { data } = await supabase
          .from('events')
          .select('*')
          .eq('created_by', user.id)
          .order('start_date', { ascending: false })
        setCreatedEvents(data || [])
      } else {
        const { data } = await supabase
          .from('event_participants')
          .select(`
            *,
            event:events(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        setEnrolledEvents(data || [])
      }

      setLoading(false)
    }
    load()
  }, [router])

  const statusColors: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground border-border',
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    published: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
    completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  }

  const getEventStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho'
      case 'pending': return 'Pendente'
      case 'published': return 'Publicado'
      case 'cancelled': return 'Cancelado'
      case 'completed': return 'Concluído'
      default: return 'Desconhecido'
    }
  }

  const enrollmentStatusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-600',
    confirmed: 'bg-emerald-500/10 text-emerald-600',
    cancelled: 'bg-red-500/10 text-red-600',
    attended: 'bg-primary/10 text-primary',
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="h-40 rounded-xl bg-card border border-border animate-pulse"></div>
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-xl bg-card border border-border animate-pulse"></div>)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section - Standard Homepage Layout */}
      <div className="flex justify-between items-end mb-10 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {isProfessionalOrSpace ? 'Gestão de Eventos' : 'A Minha Agenda'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isProfessionalOrSpace 
              ? 'Organiza os teus eventos desportivos, acompanha inscrições e gere o teu calendário.'
              : 'Os teus próximos jogos, aulas e desafios desportivos.'}
          </p>
        </div>
        {isProfessionalOrSpace && (
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-lg">
              <Link href="/dashboard/agenda">Gerir Agenda</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-lg">
              <Link href="/dashboard/reservas">Gerir Reservas</Link>
            </Button>
            <Button asChild className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Link href="/dashboard/eventos/criar">
                <Plus className="mr-2 h-4 w-4" /> Criar Evento
              </Link>
            </Button>
          </div>
        )}
      </div>

      {isProfessionalOrSpace ? (
        <div className="space-y-6">
          {createdEvents.length === 0 ? (
            <div className="bg-card border border-border p-12 rounded-xl flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Nenhum evento criado</h3>
              <p className="text-muted-foreground max-w-md mt-2 mb-6">
                Aumenta a tua visibilidade organizando aulas abertas ou jogos para a comunidade.
              </p>
              <Button asChild className="rounded-lg bg-primary hover:bg-primary/90">
                <Link href="/dashboard/eventos/criar"><Plus className="mr-2 h-4 w-4" /> Criar Evento</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {createdEvents.map((event) => (
                <div key={event.id} className="flex flex-col md:flex-row bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all group">
                  {event.image_url && (
                    <div className="h-48 md:h-auto md:w-64 shrink-0 overflow-hidden relative">
                      <img src={event.image_url} alt={event.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{event.title}</h3>
                        <Badge variant="outline" className={`rounded-lg px-2.5 py-0.5 uppercase text-[10px] font-bold tracking-wider ${statusColors[event.status] || 'bg-muted text-muted-foreground'}`}>
                          {getEventStatusLabel(event.status)}
                        </Badge>
                      </div>
                      <p className="line-clamp-2 text-sm text-muted-foreground mb-4">{event.description || 'Sem descrição'}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                        <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg text-foreground">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {new Date(event.start_date).toLocaleDateString('pt-PT')}
                        </span>
                        {event.address && (
                          <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg text-foreground">
                            <MapPin className="h-3.5 w-3.5 text-teal-500" />
                            {event.address}
                          </span>
                        )}
                        {event.capacity && (
                          <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg text-foreground">
                            <Users className="h-3.5 w-3.5 text-amber-500" />
                            {event.capacity} lugares
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-border flex gap-3">
                      <Button asChild variant="ghost" className="text-primary hover:text-primary/95 text-sm font-medium gap-1">
                        <Link href={`/eventos/${event.id}`}>
                          Ver Detalhes <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="rounded-lg border-border hover:bg-muted text-xs">
                        <Link href={`/dashboard/eventos/${event.id}/editar`}>
                          <Edit className="mr-1.5 h-3.5 w-3.5" /> Editar
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {enrolledEvents.length === 0 ? (
            <div className="bg-card border border-border p-12 rounded-xl flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Activity className="h-8 w-8 text-teal-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Agenda livre!</h3>
              <p className="text-muted-foreground max-w-md mt-2 mb-6">
                Ainda não te inscreveste em nenhum evento. Que tal começares hoje?
              </p>
              <Button asChild className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/eventos">Explorar Calendário</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {enrolledEvents.map((enrollment) => (
                <div key={enrollment.id} className="flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all group">
                  {enrollment.event?.image_url ? (
                    <div className="relative aspect-[4/3] bg-muted">
                      <img src={enrollment.event.image_url} alt={enrollment.event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="aspect-[4/3] bg-muted flex items-center justify-center border-b border-border">
                      <Calendar className="h-8 w-8 text-muted-foreground opacity-40" />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${enrollmentStatusColors[enrollment.status] || 'bg-muted text-muted-foreground'}`}>
                          {enrollment.status === 'confirmed' ? 'Confirmado' : enrollment.status === 'pending' ? 'Pendente' : 'Cancelado'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors line-clamp-1 mb-3">{enrollment.event?.title}</h3>
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" /> {new Date(enrollment.event?.start_date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                          <MapPin className="h-3.5 w-3.5 text-teal-500" /> {enrollment.event?.address || 'Localização não disponível'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-border">
                      <Button asChild variant="ghost" className="w-full text-primary hover:text-primary/95 text-sm font-medium gap-1">
                        <Link href={`/eventos/${enrollment.event?.id}`}>
                          Ver Detalhes <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
