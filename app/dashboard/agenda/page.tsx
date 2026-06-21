'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, MapPin, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type AgendaItem = {
  id: string
  title: string
  start_date: string
  end_date: string | null
  address: string | null
  type: string
  status: string
  ref_id: string | null
}

export default function DashboardAgendaPage() {
  const router = useRouter()
  const [items, setItems] = useState<AgendaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const events = await supabase
        .from('events')
        .select('id, title, start_date, end_date, address, status, created_by')
        .eq('created_by', user.id)
        .order('start_date', { ascending: true })

      if (events.data) {
        const mapped: AgendaItem[] = events.data.map(e => ({
          id: e.id,
          title: e.title,
          start_date: e.start_date,
          end_date: e.end_date,
          address: e.address,
          type: 'event',
          status: e.status,
          ref_id: e.id,
        }))
        setItems(mapped)
      }
      setLoading(false)
    }
    load()
  }, [router])

  const now = new Date()
  const upcoming = items.filter(i => new Date(i.start_date) >= now)
  const past = items.filter(i => new Date(i.start_date) < now)

  if (loading) return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
        <p className="text-sm text-muted-foreground">Gerir a tua agenda de eventos.</p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Próximos ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Passados ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-3">
          {upcoming.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Calendar className="mx-auto mb-2 h-8 w-8" />
                <p>Nenhum evento próximo.</p>
              </CardContent>
            </Card>
          ) : (
            upcoming.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-center">
                    <span className="text-xs font-bold uppercase text-primary">
                      {new Date(item.start_date).toLocaleDateString('pt-PT', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {new Date(item.start_date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <Badge variant="outline" className={
                        item.status === 'approved' ? 'bg-green-100 text-green-700'
                          : item.status === 'pending' ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-500'
                      }>
                        {item.status === 'approved' ? 'Confirmado' : item.status === 'pending' ? 'Pendente' : item.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(item.start_date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {item.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {item.address}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/eventos/${item.ref_id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-3">
          {past.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Calendar className="mx-auto mb-2 h-8 w-8" />
                <p>Nenhum evento passado.</p>
              </CardContent>
            </Card>
          ) : (
            past.slice(0, 20).map((item) => (
              <Card key={item.id} className="opacity-70">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-muted text-center">
                    <span className="text-xs font-bold uppercase text-muted-foreground">
                      {new Date(item.start_date).toLocaleDateString('pt-PT', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-muted-foreground">
                      {new Date(item.start_date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.start_date).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
