'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertCircle, ArrowLeft, CalendarCheck, Clock, Loader2, Check,
  Building2, ChevronLeft, ChevronRight,
} from 'lucide-react'
import type { SportSpace } from '@/lib/types'

export default function BookSpacePage() {
  const params = useParams()
  const router = useRouter()
  const [space, setSpace] = useState<SportSpace | null>(null)
  const [subEspacos, setSubEspacos] = useState<any[]>([])
  const [availabilities, setAvailabilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSub, setSelectedSub] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        const slug = params.slug as string

        const { data: spaceData } = await supabase.from('sport_spaces').select('*').eq('slug', slug).single()
        if (!spaceData) {
          const { data: byId } = await supabase.from('sport_spaces').select('*').eq('id', slug).single()
          if (!byId) { setLoading(false); return }
          setSpace(byId)
          await Promise.all([
            loadSubEspacos(supabase, byId.id),
            loadAvailability(supabase, byId.id),
          ])
        } else {
          setSpace(spaceData)
          await Promise.all([
            loadSubEspacos(supabase, spaceData.id),
            loadAvailability(supabase, spaceData.id),
          ])
        }
      } catch (err) {
        setError('Espaço não encontrado')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.slug])

  async function loadSubEspacos(supabase: any, spaceId: string) {
    const { data } = await supabase.from('sub_spaces').select('*').eq('space_id', spaceId)
    setSubEspacos(data || [])
  }

  async function loadAvailability(supabase: any, spaceId: string) {
    const { data } = await supabase.from('space_availability').select('*').eq('space_id', spaceId)
    setAvailabilities(data || [])
  }

  const today = new Date().toISOString().split('T')[0]
  const selectedDayOfWeek = selectedDate ? new Date(selectedDate + 'T12:00:00').getDay() : -1
  const availableSlots = availabilities.filter((a) => a.day_of_week === selectedDayOfWeek && (!selectedSub || !a.sub_space_id || a.sub_space_id === selectedSub))

  async function handleBook() {
    if (!space || !selectedDate || !selectedTime) return
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [startTime, endTime] = selectedTime.split('-')
      const { error: bookError } = await supabase.from('bookings').insert({
        space_id: space.id,
        sub_space_id: selectedSub || null,
        user_id: user.id,
        date: selectedDate,
        start_time: startTime.trim(),
        end_time: endTime.trim(),
        notes: notes || null,
        status: 'pending',
      })
      if (bookError) throw bookError
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reservar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="mx-auto max-w-2xl px-4 py-8"><Skeleton className="h-96 w-full" /></div>
  if (!space) return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
      <h2 className="mb-2 text-xl font-semibold">Espaço não encontrado</h2>
      <Button asChild><Link href="/espacos">Ver Espaços</Link></Button>
    </div>
  )

  if (success) return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
        <Check className="h-8 w-8 text-green-500" />
      </div>
      <h1 className="mb-2 text-2xl font-bold">Pedido Enviado!</h1>
      <p className="mb-6 text-muted-foreground">O seu pedido de reserva foi enviado. Aguarde confirmação do espaço.</p>
      <Button asChild><Link href="/mensagens">Ver Mensagens</Link></Button>
    </div>
  )

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href={`/espacos/${space.slug || space.id}`}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Reservar {space.name}</CardTitle>
          <CardDescription>Escolha a data, horário e subespaço pretendido</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</div>}

          {/* Subespaço */}
          {subEspacos.length > 0 && (
            <div className="space-y-2">
              <Label>Subespaço (opcional)</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <button
                  onClick={() => setSelectedSub('')}
                  className={`rounded-lg border p-3 text-left text-sm transition-colors ${!selectedSub ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
                >
                  <span className="font-medium">Espaço Inteiro</span>
                </button>
                {subEspacos.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSub(sub.id)}
                    className={`rounded-lg border p-3 text-left text-sm transition-colors ${selectedSub === sub.id ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
                  >
                    <span className="font-medium">{sub.name}</span>
                    {sub.price_per_hour && <p className="text-xs text-muted-foreground">{sub.price_per_hour}€/hora</p>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date */}
          <div className="space-y-2">
            <Label>Data *</Label>
            <input type="date" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" min={today} value={selectedDate} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime('') }} />
          </div>

          {/* Available times */}
          {selectedDate && (
            <div className="space-y-2">
              <Label>Horário *</Label>
              {availableSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem horários disponíveis para esta data.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {availableSlots.map((slot, i) => {
                    const timeKey = `${slot.start_time?.slice(0, 5)} - ${slot.end_time?.slice(0, 5)}`
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedTime(timeKey)}
                        className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm transition-colors ${selectedTime === timeKey ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
                      >
                        <Clock className="h-3 w-3" />
                        {timeKey}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notas (opcional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Alguma informação adicional para o espaço..." />
          </div>

          <Button onClick={handleBook} disabled={!selectedDate || !selectedTime || saving} className="w-full" size="lg">
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A processar...</> : <><CalendarCheck className="mr-2 h-4 w-4" /> Solicitar Reserva</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
