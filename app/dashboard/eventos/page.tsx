'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Plus, MapPin, Users, Edit, ExternalLink, Clock } from 'lucide-react'

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
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user.id)
        .order('start_date', { ascending: false })

      setEvents(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meus Eventos</h1>
          <p className="text-sm text-muted-foreground">Gerencia os eventos que criaste.</p>
        </div>
        <Button asChild className="bg-teal-600 hover:bg-teal-700">
          <Link href="/dashboard/eventos/criar">
            <Plus className="mr-2 h-4 w-4" /> Criar Evento
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Nenhum evento criado</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Cria o teu primeiro evento e partilha com a comunidade.
            </p>
            <Button asChild className="mt-6 bg-teal-600 hover:bg-teal-700">
              <Link href="/dashboard/eventos/criar">
                <Plus className="mr-2 h-4 w-4" /> Criar Evento
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex gap-4 pt-6">
                {event.image_url && (
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg">
                    <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{event.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {event.description || 'Sem descrição'}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={statusColors[event.status] || 'bg-gray-100 text-gray-700'}
                    >
                      {event.status === 'pending' ? 'Pendente'
                        : event.status === 'approved' ? 'Aprovado'
                          : event.status === 'rejected' ? 'Rejeitado'
                            : event.status === 'cancelled' ? 'Cancelado' : event.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(event.start_date).toLocaleDateString('pt-PT')}
                    </span>
                    {event.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.address}
                      </span>
                    )}
                    {event.capacity && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {event.capacity} lugares
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    {event.status === 'approved' && (
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/eventos/${event.id}`}>
                          <ExternalLink className="mr-1 h-3.5 w-3.5" /> Ver
                        </Link>
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <Edit className="mr-1 h-3.5 w-3.5" /> Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
