'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Loader2, Calendar as CalendarIcon, Clock, CreditCard, CheckCircle2, ChevronLeft } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { pt } from 'date-fns/locale'
import { loadStripe } from '@stripe/stripe-js'
import type { Service, SpaceRoom } from '@/lib/types'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface BookingWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service?: Service | null
  professionalId?: string | null
  spaceId?: string | null
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN
  return hours * 60 + minutes
}

function addMinutesToTime(value: string, durationMinutes: number) {
  const start = timeToMinutes(value)
  if (!Number.isFinite(start)) return ''
  const total = start + durationMinutes
  if (total >= 24 * 60) return ''
  return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`
}

export function BookingWizard({ open, onOpenChange, service, professionalId, spaceId }: BookingWizardProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [availability, setAvailability] = useState<any[]>([])
  const [rooms, setRooms] = useState<SpaceRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<SpaceRoom | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const durationMinutes = spaceId ? 60 : Math.max(1, Number(service?.duration_minutes || 60))
  const computedEndTime = selectedTime ? addMinutesToTime(selectedTime, durationMinutes) : ''

  useEffect(() => {
    if (open) {
      setStep(spaceId ? 1 : 2)
      setSelectedRoom(null)
      setSelectedDate('')
      setSelectedTime('')
      setErrorMsg('')
      if (spaceId) loadRooms()
      else if (professionalId) loadProfessionalAvailability()
    }
  }, [open, professionalId, spaceId])

  useEffect(() => {
    if (selectedRoom) loadRoomAvailability(selectedRoom.id)
  }, [selectedRoom])

  async function loadRooms() {
    if (!spaceId) return
    const supabase = createClient()
    const { data } = await supabase.from('space_rooms').select('*').eq('space_id', spaceId).eq('is_active', true)
    if (data) setRooms(data)
  }

  async function loadProfessionalAvailability() {
    if (!professionalId) return
    const supabase = createClient()
    const { data } = await supabase.from('professional_availability').select('*').eq('professional_id', professionalId).eq('is_active', true)
    if (data) setAvailability(data)
  }

  async function loadRoomAvailability(roomId: string) {
    const supabase = createClient()
    const { data } = await supabase.from('space_room_availability').select('*').eq('room_id', roomId).eq('is_active', true)
    if (data) setAvailability(data)
  }

  const validateDateTime = () => {
    if (!selectedDate || !selectedTime || !computedEndTime) {
      setErrorMsg('Por favor, selecione uma data e hora válidas.')
      return false
    }

    const dayOfWeek = new Date(`${selectedDate}T12:00:00`).getDay()
    const avail = availability.find(a => a.day_of_week === dayOfWeek)
    if (!avail) {
      setErrorMsg('Não há disponibilidade para este dia da semana.')
      return false
    }

    const availabilityStart = String(avail.start_time).slice(0, 5)
    const availabilityEnd = String(avail.end_time).slice(0, 5)
    if (selectedTime < availabilityStart || computedEndTime > availabilityEnd) {
      setErrorMsg(`A reserva de ${durationMinutes} min deve ficar integralmente entre ${availabilityStart} e ${availabilityEnd}.`)
      return false
    }

    setErrorMsg('')
    return true
  }

  const handleNext = () => {
    if (step === 1 && spaceId) {
      if (!selectedRoom) {
        setErrorMsg('Por favor, selecione uma sala/campo.')
        return
      }
      setErrorMsg('')
      setStep(2)
    } else if (step === 2 && validateDateTime()) {
      setStep(3)
    }
  }

  const handleCheckout = async () => {
    if (!validateDateTime()) return
    setLoading(true)
    setErrorMsg('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth/login'
        return
      }

      const price = spaceId ? selectedRoom?.price_per_hour : service?.price
      const isFree = !price || price <= 0

      if (isFree) {
        const { error } = await supabase.from('reservations').insert({
          user_id: user.id,
          professional_id: professionalId || null,
          service_id: service?.id || null,
          space_id: spaceId || null,
          space_room_id: selectedRoom?.id || null,
          date: selectedDate,
          start_time: selectedTime,
          end_time: computedEndTime,
          status: 'confirmed',
          amount: 0,
          payment_status: 'paid',
        })
        if (error) throw error
        onOpenChange(false)
        window.location.href = '/dashboard'
      } else {
        const response = await fetch('/api/checkout_sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: service?.id || null,
            spaceId: spaceId || null,
            spaceRoomId: selectedRoom?.id || null,
            professionalId: professionalId || null,
            date: selectedDate,
            startTime: selectedTime,
            endTime: computedEndTime,
          }),
        })

        const payload = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(payload.error || 'Erro ao processar pagamento')

        const stripe = await stripePromise
        if (!stripe) throw new Error('Não foi possível iniciar o pagamento.')
        const { error } = await (stripe as any).redirectToCheckout({ sessionId: payload.sessionId })
        if (error) throw error
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Ocorreu um erro.')
      setLoading(false)
    }
  }

  const getTitle = () => {
    if (spaceId) return selectedRoom ? `Reserva: ${selectedRoom.name}` : 'Selecionar Sala/Campo'
    return `Reserva: ${service?.name || 'Serviço'}`
  }

  const priceToPay = spaceId ? selectedRoom?.price_per_hour : service?.price
  const isFree = !priceToPay || priceToPay <= 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {(step === 2 && spaceId) || step === 3 ? (
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            ) : null}
            <DialogTitle>{getTitle()}</DialogTitle>
          </div>
          <DialogDescription>
            {step === 1 && spaceId && 'Selecione a sala ou campo que pretende reservar.'}
            {step === 2 && `Selecione uma hora com ${durationMinutes} minutos livres.`}
            {step === 3 && 'Reveja os dados e confirme a reserva.'}
          </DialogDescription>
        </DialogHeader>

        {errorMsg && <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{errorMsg}</div>}

        {step === 1 && spaceId && (
          <div className="max-h-[400px] space-y-3 overflow-y-auto py-4 pr-1">
            {rooms.length === 0 ? (
              <p className="text-center text-muted-foreground">Este espaço não tem salas disponíveis.</p>
            ) : rooms.map(room => (
              <button
                type="button"
                key={room.id}
                onClick={() => { setSelectedRoom(room); setErrorMsg(''); setStep(2) }}
                className="flex w-full flex-col gap-3 rounded-xl border p-3 text-left transition-all hover:border-primary hover:bg-primary/5"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {room.gallery_urls?.length ? <img src={room.gallery_urls[0]} alt="" className="h-full w-full object-cover" /> : <span className="text-[10px] font-semibold text-muted-foreground">Sem foto</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-bold">{room.name}</h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">Capacidade: {room.capacity}</p>
                    <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">{room.description || 'Sem descrição'}</p>
                  </div>
                  <div className="whitespace-nowrap text-sm font-semibold text-primary">{room.price_per_hour > 0 ? `${room.price_per_hour}€/h` : 'Grátis'}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Data da reserva</Label>
              <div className="flex justify-center rounded-md border bg-background p-3 shadow-sm">
                <Calendar
                  mode="single"
                  selected={selectedDate ? new Date(`${selectedDate}T12:00:00`) : undefined}
                  onSelect={(date) => {
                    if (!date) return setSelectedDate('')
                    const yyyy = date.getFullYear()
                    const mm = String(date.getMonth() + 1).padStart(2, '0')
                    const dd = String(date.getDate()).padStart(2, '0')
                    setSelectedDate(`${yyyy}-${mm}-${dd}`)
                    setSelectedTime('')
                    setErrorMsg('')
                  }}
                  disabled={(date) => {
                    const today = new Date(); today.setHours(0, 0, 0, 0)
                    if (date < today) return true
                    return !availability.some(a => a.day_of_week === date.getDay())
                  }}
                  locale={pt}
                  className="p-0"
                />
              </div>
            </div>

            {selectedDate && (
              <div className="space-y-2 rounded-lg border bg-muted p-3 text-sm">
                <div className="flex items-center gap-2 font-semibold"><CalendarIcon className="h-4 w-4 text-primary" />Disponibilidade</div>
                {availability.filter(a => a.day_of_week === new Date(`${selectedDate}T12:00:00`).getDay()).map((a, i) => (
                  <div key={i} className="flex items-center gap-2 text-muted-foreground"><div className="h-1.5 w-1.5 rounded-full bg-primary" />Das {String(a.start_time).slice(0,5)} às {String(a.end_time).slice(0,5)}</div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="time">Hora de início</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input id="time" type="time" value={selectedTime} onChange={(e) => { setSelectedTime(e.target.value); setErrorMsg('') }} className="h-11 pl-9" disabled={!selectedDate} />
              </div>
              {selectedTime && computedEndTime && <p className="text-xs text-muted-foreground">Fim previsto: <strong>{computedEndTime}</strong></p>}
            </div>

            <Button className="min-h-11 w-full" onClick={handleNext}>Continuar</Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 py-4">
            <div className="space-y-3 rounded-xl bg-muted p-4 text-sm">
              <div className="flex justify-between gap-4"><span className="text-muted-foreground">{spaceId ? 'Sala' : 'Serviço'}:</span><span className="text-right font-semibold">{spaceId ? selectedRoom?.name : service?.name}</span></div>
              <div className="flex justify-between gap-4"><span className="text-muted-foreground">Data:</span><span className="text-right font-semibold">{new Date(`${selectedDate}T12:00:00`).toLocaleDateString('pt-PT')}</span></div>
              <div className="flex justify-between gap-4"><span className="text-muted-foreground">Horário:</span><span className="text-right font-semibold">{selectedTime}–{computedEndTime}</span></div>
              <div className="mt-2 flex justify-between border-t pt-2"><span className="font-semibold text-muted-foreground">Total:</span><span className="text-lg font-bold text-primary">{isFree ? 'Gratuito' : `${Number(priceToPay).toFixed(2)} €`}</span></div>
            </div>

            <Button className="min-h-11 w-full" size="lg" onClick={handleCheckout} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isFree ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <CreditCard className="mr-2 h-4 w-4" />}
              {isFree ? 'Confirmar reserva' : 'Pagar e confirmar'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
