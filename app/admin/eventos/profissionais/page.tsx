'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Calendar, MapPin, User, Search, ExternalLink } from 'lucide-react'

type Event = {
  id: string
  title: string
  description: string | null
  start_date: string
  address: string | null
  capacity: number | null
  status: string
  created_at: string
  professional_name: string | null
  professional_email: string | null
}

export default function AdminEventosProfissionaisPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [filtered, setFiltered] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile?.role !== 'admin') { router.push('/'); return }

      const { data } = await supabase
        .from('events')
        .select(`
          id, title, description, start_date, address, capacity, status, created_at,
          professionals!events_created_by_fkey (full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (data) {
        const mapped = data.map((e: any) => ({
          ...e,
          professional_name: e.professionals?.full_name || null,
          professional_email: e.professionals?.email || null,
        }))
        setEvents(mapped)
        setFiltered(mapped)
      }
      setLoading(false)
    }
    load()
  }, [router])

  useEffect(() => {
    if (!search.trim()) { setFiltered(events); return }
    const term = search.toLowerCase()
    setFiltered(events.filter(e =>
      e.title.toLowerCase().includes(term) ||
      e.professional_name?.toLowerCase().includes(term) ||
      e.professional_email?.toLowerCase().includes(term)
    ))
  }, [search, events])

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Eventos de Profissionais</h1>
          <p className="text-sm text-muted-foreground">Todos os eventos criados por profissionais.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {search ? 'Nenhum evento corresponde à pesquisa.' : 'Nenhum evento encontrado.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((event) => (
            <Card key={event.id}>
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{event.title}</h3>
                    <Badge variant="outline" className={statusColors[event.status] || ''}>
                      {event.status === 'pending' ? 'Pendente'
                        : event.status === 'approved' ? 'Aprovado'
                          : event.status === 'rejected' ? 'Rejeitado'
                            : event.status === 'cancelled' ? 'Cancelado' : event.status}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
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
                    {event.professional_name && (
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {event.professional_name}
                      </span>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/eventos/${event.id}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
