'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle, Plus, Trash2, Loader2, Check, Clock, Calendar as CalendarIcon,
} from 'lucide-react'

export default function AvailabilityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [spaces, setSpaces] = useState<{ id: string; name: string }[]>([])
  const [selectedSpace, setSelectedSpace] = useState<string>('')
  const [subEspacos, setSubEspacos] = useState<any[]>([])
  const [availabilities, setAvailabilities] = useState<any[]>([])
  const [selectedSub, setSelectedSub] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [newSlot, setNewSlot] = useState({ day_of_week: '0', start_time: '09:00', end_time: '18:00', sub_space_id: '' })

  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

  async function load() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: s } = await supabase.from('sport_spaces').select('id, name').eq('owner_user_id', user.id)
    setSpaces(s || [])
    if (s && s.length > 0) {
      setSelectedSpace(s[0].id)
      await loadSubs(s[0].id)
      await loadAvailability(s[0].id)
    }
    setLoading(false)
  }

  async function loadSubs(spaceId: string) {
    const supabase = createClient()
    const { data } = await supabase.from('sub_spaces').select('*').eq('space_id', spaceId)
    setSubEspacos(data || [])
  }

  async function loadAvailability(spaceId: string) {
    const supabase = createClient()
    const { data } = await supabase.from('space_availability').select('*').eq('space_id', spaceId).order('day_of_week').order('start_time')
    setAvailabilities(data || [])
  }

  useState(() => { load() })

  async function handleSpaceChange(id: string) {
    setSelectedSpace(id)
    setLoading(true)
    await loadSubs(id)
    await loadAvailability(id)
    setLoading(false)
  }

  async function addSlot() {
    setError(null)
    const supabase = createClient()
    const { error: insErr } = await supabase.from('space_availability').insert({
      space_id: selectedSpace,
      sub_space_id: newSlot.sub_space_id || null,
      day_of_week: parseInt(newSlot.day_of_week),
      start_time: newSlot.start_time,
      end_time: newSlot.end_time,
    })
    if (insErr) { setError('Erro ao adicionar horário') }
    else {
      setSuccess('Horário adicionado!')
      await loadAvailability(selectedSpace)
      setTimeout(() => setSuccess(null), 3000)
    }
  }

  async function deleteSlot(id: string) {
    const supabase = createClient()
    await supabase.from('space_availability').delete().eq('id', id)
    setAvailabilities((prev) => prev.filter((a) => a.id !== id))
  }

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8"><Skeleton className="h-96 w-full" /></div>

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Disponibilidade</h1>
      <p className="mb-8 text-muted-foreground">Defina os horários disponíveis para reservas</p>

      {error && <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4" />{error}</div>}
      {success && <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-sm text-green-600"><Check className="h-4 w-4" />{success}</div>}

      {spaces.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum espaço associado.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <Label>Espaço</Label>
            <select className="mt-1 flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm" value={selectedSpace} onChange={(e) => handleSpaceChange(e.target.value)}>
              {spaces.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Add slot form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="h-4 w-4" />
                Adicionar Horário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <Label>Dia da Semana</Label>
                  <select className="mt-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={newSlot.day_of_week} onChange={(e) => setNewSlot(p => ({...p, day_of_week: e.target.value}))}>
                    {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Início</Label>
                  <input type="time" className="mt-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={newSlot.start_time} onChange={(e) => setNewSlot(p => ({...p, start_time: e.target.value}))} />
                </div>
                <div>
                  <Label>Fim</Label>
                  <input type="time" className="mt-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={newSlot.end_time} onChange={(e) => setNewSlot(p => ({...p, end_time: e.target.value}))} />
                </div>
                {subEspacos.length > 0 && (
                  <div>
                    <Label>Subespaço (opcional)</Label>
                    <select className="mt-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={newSlot.sub_space_id} onChange={(e) => setNewSlot(p => ({...p, sub_space_id: e.target.value}))}>
                      <option value="">Todos</option>
                      {subEspacos.map((sub) => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                    </select>
                  </div>
                )}
                <Button onClick={addSlot} size="sm"><Plus className="mr-1 h-4 w-4" /> Adicionar</Button>
              </div>
            </CardContent>
          </Card>

          {/* Availability grouped by day */}
          {availabilities.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-12">
                <CalendarIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum horário definido. Adicione horários disponíveis.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Array.from({ length: 7 }).map((_, dayIdx) => {
                const daySlots = availabilities.filter((a) => a.day_of_week === dayIdx)
                if (daySlots.length === 0) return null
                return (
                  <Card key={dayIdx}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-semibold">{days[dayIdx]}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="space-y-2">
                        {daySlots.map((slot) => (
                          <div key={slot.id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-2">
                            <div className="flex items-center gap-3">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}</span>
                              {slot.sub_space_id && (
                                <Badge variant="secondary" className="text-xs">
                                  {subEspacos.find((s) => s.id === slot.sub_space_id)?.name || 'Subespaço'}
                                </Badge>
                              )}
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteSlot(slot.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
