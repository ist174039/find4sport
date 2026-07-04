'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Check, X, Calendar, MapPin, User, Loader2 } from 'lucide-react'

type PendingEvent = {
  id: string
  title: string
  description: string | null
  start_date: string
  address: string | null
  capacity: number | null
  created_by: string
  created_at: string
  professional_name: string | null
  professional_email: string | null
}

export default function AdminValidacaoEventosPage() {
  const router = useRouter()
  const [events, setEvents] = useState<PendingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadPending()
  }, [])

  async function loadPending() {
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
        id, title, description, start_date, address, capacity, created_by, created_at,
        professionals!events_created_by_fkey (full_name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (data) {
      setEvents(data.map((e: any) => ({
        ...e,
        professional_name: e.professionals?.full_name || null,
        professional_email: e.professionals?.email || null,
      })))
    }
    setLoading(false)
  }

  async function handleApprove(id: string) {
    setProcessing(id)
    const supabase = createClient()
    await supabase.from('events').update({ status: 'approved' }).eq('id', id)
    setEvents(events.filter(e => e.id !== id))
    setProcessing(null)
  }

  async function handleReject(id: string) {
    setProcessing(id)
    const supabase = createClient()
    await supabase.from('events').update({ status: 'rejected' }).eq('id', id)
    setEvents(events.filter(e => e.id !== id))
    setProcessing(null)
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Validação de Eventos</h1>
        <p className="text-sm text-muted-foreground">Aprova ou rejeita eventos criados por profissionais.</p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Check className="mb-4 h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold">Tudo em dia!</h3>
            <p className="text-sm text-muted-foreground">Não há eventos pendentes de validação.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{event.title}</h3>
                      <Badge variant="outline" className="bg-amber-100 text-amber-700">Pendente</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {event.description || 'Sem descrição'}
                    </p>
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
                      {event.professional_name && (
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {event.professional_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(event.id)}
                      disabled={processing === event.id}
                    >
                      {processing === event.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleReject(event.id)}
                      disabled={processing === event.id}
                    >
                      <X className="mr-1 h-4 w-4" /> Rejeitar
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
