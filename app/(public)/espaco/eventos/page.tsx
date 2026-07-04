'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowLeft, Calendar, Plus, ExternalLink } from 'lucide-react'
import type { Event, SportSpace } from '@/lib/types'

export default function SpaceEventsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<(Event & { space?: SportSpace })[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/espaco/login'); return }

        const { data: userSpaces } = await supabase.from('sport_spaces').select('id').eq('created_by', user.id)
        const spaceIds = (userSpaces || []).map(s => s.id)

        if (spaceIds.length > 0) {
          const { data: evts } = await supabase
            .from('events')
            .select('*, space:space_id(*)')
            .in('space_id', spaceIds)
            .order('start_date', { ascending: false })
          setEvents(evts || [])
        }
      } catch (err) {
        setError('Erro ao carregar eventos')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8"><Skeleton className="h-96 w-full" /></div>

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/espaco/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
      </Button>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Eventos do Espaço</h1>
        <Button asChild>
          <Link href="/criar-evento"><Plus className="mr-2 h-4 w-4" /> Criar Evento</Link>
        </Button>
      </div>

      {error && <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</div>}

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Sem eventos</h3>
            <p className="mb-6 text-sm text-muted-foreground">Crie o seu primeiro evento.</p>
            <Button asChild><Link href="/criar-evento">Criar Evento</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((evt) => (
            <Card key={evt.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{evt.title}</h3>
                    <Badge variant={evt.status === 'published' ? 'default' : evt.status === 'pending' ? 'secondary' : 'outline'}>
                      {evt.status === 'published' ? 'Publicado' : evt.status === 'pending' ? 'Pendente' : evt.status === 'draft' ? 'Rascunho' : evt.status === 'cancelled' ? 'Cancelado' : 'Concluído'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(evt.start_date).toLocaleDateString('pt-PT')}
                    {evt.address && ` — ${evt.address}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/eventos/${evt.slug || evt.id}`}><ExternalLink className="h-3 w-3" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
