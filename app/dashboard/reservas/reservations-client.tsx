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
  const [busyReservationId, setBusyReservationId] = useState<string | null>(null)
  const [availability, setAvailability] = useState<Availability[]>(
    Array.from({ length: 7 }, (_, day) => {
      const current = initialAvailability.find((item) => item.day_of_week === day)
      return current
        ? { ...current, start_time: current.start_time.slice(0, 5), end_time: current.end_time.slice(0, 5) }
        : { day_of_week: day, start_time: '09:00', end_time: '18:00', is_active: false }
    }),
  )

  const changeStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
    setBusyReservationId(id)
    try {
      await updateProviderReservationStatusAction(id, status)
      setReservations((items) => items.map((item) => item.id === id ? { ...item, status } : item))
      showAlert('Reserva atualizada', status === 'confirmed' ? 'A reserva foi confirmada.' : 'A reserva foi cancelada.', 'success')
    } catch (error: any) {
      showAlert('Erro', error?.message || 'Não foi possível atualizar a reserva.', 'error')
    } finally {
      setBusyReservationId(null)
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
    <div className="space-y-5 sm:space-y-6">
      <div className="border-b border-border pb-5 sm:pb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reservas</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Consulta e gere reservas associadas ao teu {role === 'professional' ? 'perfil profissional' : 'espaço'}.
        </p>
      </div>

      <Tabs defaultValue="reservations" className="w-full">
        <TabsList className="grid h-11 w-full grid-cols-2 sm:inline-grid sm:w-auto">
          <TabsTrigger value="reservations" className="min-h-10 px-3">Reservas</TabsTrigger>
          {role === 'professional' && <TabsTrigger value="availability" className="min-h-10 px-3">Disponibilidade</TabsTrigger>}
        </TabsList>

        <TabsContent value="reservations" className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
          {reservations.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground sm:py-12">
                <CalendarCheck className="mx-auto mb-3 h-10 w-10 opacity-30" />
                <p className="font-semibold text-foreground">Sem reservas recebidas</p>
                <p className="mt-1 text-sm">As novas reservas surgirão aqui.</p>
              </CardContent>
            </Card>
          ) : reservations.map((reservation) => {
            const isBusy = busyReservationId === reservation.id
            return (
              <Card key={reservation.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-3">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base sm:text-lg">{reservation.service?.name || reservation.room?.name || 'Reserva'}</CardTitle>
                      <CardDescription className="mt-1 break-words text-xs sm:text-sm">
                        {reservation.user?.full_name || 'Cliente'}{reservation.user?.email ? ` · ${reservation.user.email}` : ''}
                      </CardDescription>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase sm:text-xs">{reservation.status}</span>
                      <p className="font-bold sm:mt-2">{Number(reservation.amount || 0).toFixed(2)} €</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-1 sm:p-6 sm:pt-1">
                  <div className="mb-4 grid gap-2 text-sm text-muted-foreground sm:flex sm:flex-wrap sm:gap-4">
                    <span className="flex min-h-8 items-center gap-2"><CalendarCheck className="h-4 w-4 shrink-0" />{new Date(reservation.date).toLocaleDateString('pt-PT')}</span>
                    <span className="flex min-h-8 items-center gap-2"><Clock className="h-4 w-4 shrink-0" />{String(reservation.start_time).slice(0, 5)}–{String(reservation.end_time).slice(0, 5)}</span>
                  </div>

                  {['pending', 'paid', 'confirmed'].includes(reservation.status) && (
                    <div className="grid gap-2 sm:flex">
                      {reservation.status === 'pending' && (
                        <Button
                          onClick={() => changeStatus(reservation.id, 'confirmed')}
                          disabled={isBusy}
                          className="min-h-11 w-full rounded-xl sm:w-auto"
                        >
                          {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                          Confirmar
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="min-h-11 w-full rounded-xl text-destructive sm:w-auto"
                        onClick={() => changeStatus(reservation.id, 'cancelled')}
                        disabled={isBusy}
                      >
                        <X className="mr-2 h-4 w-4" />Cancelar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        {role === 'professional' && (
          <TabsContent value="availability" className="mt-4 sm:mt-5">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Horário de trabalho</CardTitle>
                <CardDescription>Define quando aceitas novas reservas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
                {availability.map((item, index) => (
                  <div key={item.day_of_week} className="rounded-xl border border-border p-3 sm:grid sm:grid-cols-[180px_1fr] sm:items-center sm:gap-3">
                    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={item.is_active}
                        onChange={(event) => setAvailability((rows) => rows.map((row, i) => i === index ? { ...row, is_active: event.target.checked } : row))}
                        className="h-5 w-5 shrink-0 accent-primary"
                      />
                      {DAYS[item.day_of_week]}
                    </label>

                    {item.is_active ? (
                      <div className="mt-2 grid grid-cols-2 gap-3 sm:mt-0 sm:flex sm:justify-end">
                        <div className="min-w-0 space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Das</Label>
                          <Input
                            type="time"
                            value={item.start_time}
                            className="h-11 w-full min-w-0 sm:w-32"
                            onChange={(event) => setAvailability((rows) => rows.map((row, i) => i === index ? { ...row, start_time: event.target.value } : row))}
                          />
                        </div>
                        <div className="min-w-0 space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Até</Label>
                          <Input
                            type="time"
                            value={item.end_time}
                            className="h-11 w-full min-w-0 sm:w-32"
                            onChange={(event) => setAvailability((rows) => rows.map((row, i) => i === index ? { ...row, end_time: event.target.value } : row))}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="pb-1 text-sm text-muted-foreground sm:pb-0 sm:text-right">Indisponível</p>
                    )}
                  </div>
                ))}

                <div className="pt-2 sm:flex sm:justify-end sm:pt-3">
                  <Button onClick={saveAvailability} disabled={saving} className="min-h-11 w-full rounded-xl sm:w-auto">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar disponibilidade
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
