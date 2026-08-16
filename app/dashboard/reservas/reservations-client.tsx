'use client'

import { useState } from 'react'
import { CalendarCheck, Check, Clock, Loader2, X } from 'lucide-react'
import { updateProviderReservationStatusAction, saveProfessionalAvailabilityAction } from '@/app/actions/reservations-management'
import { useModal } from '@/components/providers/modal-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const DAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

type Availability = { day_of_week: number; start_time: string; end_time: string; is_active: boolean }

export function ReservationsClient({
  role,
  initialReservations,
  initialAvailability,
}: {
  role: 'professional' | 'venue_manager'
  initialReservations: any[]
  initialAvailability: Availability[]
}) {
  const { showAlert } = useModal()
  const [reservations, setReservations] = useState(initialReservations)
  const [saving, setSaving] = useState(false)
  const [availability, setAvailability] = useState<Availability[]>(
    Array.from({ length: 7 }, (_, day) => {
      const current = initialAvailability.find((item) => item.day_of_week === day)
      return current
        ? { ...current, start_time: current.start_time.slice(0, 5), end_time: current.end_time.slice(0, 5) }
        : { day_of_week: day, start_time: '09:00', end_time: '18:00', is_active: false }
    }),
  )

  const changeStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    try {
      await updateProviderReservationStatusAction(id, status)
      setReservations((items) => items.map((item) => item.id === id ? { ...item, status } : item))
      showAlert('Reserva atualizada', status === 'confirmed' ? 'A reserva foi confirmada.' : 'A reserva foi cancelada.', 'success')
    } catch (error: any) {
      showAlert('Erro', error?.message || 'Não foi possível atualizar a reserva.', 'error')
    }
  }

  const saveAvailability = async () => {
    setSaving(true)
    try {
      await saveProfessionalAvailabilityAction(availability)
      showAlert('Disponibilidade guardada', 'O horário foi atualizado.', 'success')
    } catch (error: any) {
      showAlert('Erro', error?.message || 'Não foi possível guardar a disponibilidade.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
        <p className="mt-1 text-sm text-muted-foreground">Consulta e gere reservas associadas ao teu {role === 'professional' ? 'perfil profissional' : 'espaço'}.</p>
      </div>

      <Tabs defaultValue="reservations">
        <TabsList>
          <TabsTrigger value="reservations">Reservas</TabsTrigger>
          {role === 'professional' && <TabsTrigger value="availability">Disponibilidade</TabsTrigger>}
        </TabsList>

        <TabsContent value="reservations" className="mt-5 space-y-4">
          {reservations.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><CalendarCheck className="mx-auto mb-3 h-10 w-10 opacity-30" /><p className="font-semibold text-foreground">Sem reservas recebidas</p><p className="mt-1 text-sm">As novas reservas surgirão aqui.</p></CardContent></Card>
          ) : reservations.map((reservation) => (
            <Card key={reservation.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div><CardTitle className="text-lg">{reservation.service?.name || reservation.room?.name || 'Reserva'}</CardTitle><CardDescription>{reservation.user?.full_name || 'Cliente'}{reservation.user?.email ? ` · ${reservation.user.email}` : ''}</CardDescription></div>
                  <div className="sm:text-right"><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold uppercase">{reservation.status}</span><p className="mt-2 font-bold">{Number(reservation.amount || 0).toFixed(2)} €</p></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground"><span className="flex items-center gap-1"><CalendarCheck className="h-4 w-4" />{new Date(reservation.date).toLocaleDateString('pt-PT')}</span><span className="flex items-center gap-1"><Clock className="h-4 w-4" />{String(reservation.start_time).slice(0, 5)}–{String(reservation.end_time).slice(0, 5)}</span></div>
                {['pending', 'paid', 'confirmed'].includes(reservation.status) && <div className="flex gap-2">{reservation.status === 'pending' && <Button size="sm" onClick={() => changeStatus(reservation.id, 'confirmed')}><Check className="mr-1 h-4 w-4" />Confirmar</Button>}<Button size="sm" variant="outline" className="text-destructive" onClick={() => changeStatus(reservation.id, 'cancelled')}><X className="mr-1 h-4 w-4" />Cancelar</Button></div>}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {role === 'professional' && (
          <TabsContent value="availability" className="mt-5">
            <Card><CardHeader><CardTitle>Horário de trabalho</CardTitle><CardDescription>Define quando aceitas novas reservas.</CardDescription></CardHeader><CardContent className="space-y-3">
              {availability.map((item, index) => (
                <div key={item.day_of_week} className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[180px_1fr] sm:items-center">
                  <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={item.is_active} onChange={(e) => setAvailability((rows) => rows.map((row, i) => i === index ? { ...row, is_active: e.target.checked } : row))} />{DAYS[item.day_of_week]}</label>
                  {item.is_active ? <div className="flex items-center gap-2 sm:justify-end"><Label className="text-xs">Das</Label><Input type="time" value={item.start_time} className="w-28" onChange={(e) => setAvailability((rows) => rows.map((row, i) => i === index ? { ...row, start_time: e.target.value } : row))} /><Label className="text-xs">às</Label><Input type="time" value={item.end_time} className="w-28" onChange={(e) => setAvailability((rows) => rows.map((row, i) => i === index ? { ...row, end_time: e.target.value } : row))} /></div> : <p className="text-sm text-muted-foreground sm:text-right">Indisponível</p>}
                </div>
              ))}
              <div className="flex justify-end pt-3"><Button onClick={saveAvailability} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar disponibilidade</Button></div>
            </CardContent></Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
