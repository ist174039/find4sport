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

// Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface BookingWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service?: Service | null
  professionalId?: string | null
  spaceId?: string | null
}

export function BookingWizard({ open, onOpenChange, service, professionalId, spaceId }: BookingWizardProps) {
  const [step, setStep] = useState(1) // 1: Choose Room (if space), 2: Choose DateTime, 3: Checkout
  const [loading, setLoading] = useState(false)
  const [availability, setAvailability] = useState<any[]>([])
  const [rooms, setRooms] = useState<SpaceRoom[]>([])
  
  // Form State
  const [selectedRoom, setSelectedRoom] = useState<SpaceRoom | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (open) {
      setStep(spaceId ? 1 : 2) // If space, step 1 is Room selection
      setSelectedRoom(null)
      setSelectedDate('')
      setSelectedTime('')
      setErrorMsg('')
      
      if (spaceId) {
        loadRooms()
      } else if (professionalId) {
        loadProfessionalAvailability()
      }
    }
  }, [open, professionalId, spaceId])

  useEffect(() => {
    if (selectedRoom) {
      loadRoomAvailability(selectedRoom.id)
    }
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
    if (!selectedDate || !selectedTime) {
      setErrorMsg('Por favor, selecione uma data e hora válidas.')
      return false
    }

    const d = new Date(selectedDate)
    const dayOfWeek = d.getDay()
    const avail = availability.find(a => a.day_of_week === dayOfWeek)

    if (!avail) {
      setErrorMsg('Não há disponibilidade para este dia da semana.')
      return false
    }

    if (selectedTime < avail.start_time || selectedTime > avail.end_time) {
      setErrorMsg(`O horário deve ser entre ${avail.start_time.substring(0,5)} e ${avail.end_time.substring(0,5)}.`)
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
    } else if (step === 2) {
      if (validateDateTime()) {
        setStep(3)
      }
    }
  }

  const handleCheckout = async () => {
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
        // Direct insertion for free bookings
        const { error } = await supabase.from('reservations').insert({
          user_id: user.id,
          professional_id: professionalId || null,
          service_id: service?.id || null,
          space_id: spaceId || null,
          space_room_id: selectedRoom?.id || null,
          date: selectedDate,
          start_time: selectedTime,
          end_time: selectedTime, // Basic logic for end time
          status: 'confirmed',
          amount: 0,
          payment_status: 'paid'
        })
        if (error) throw error
        onOpenChange(false)
        alert('Reserva efetuada com sucesso!')
      } else {
        // Stripe checkout
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
            endTime: selectedTime,
            price: price
          }),
        })

        if (!response.ok) {
          const errData = await response.json()
          throw new Error(errData.error || 'Erro ao processar pagamento')
        }

        const { sessionId } = await response.json()
        const stripe = await stripePromise
        if (!stripe) throw new Error('Stripe failed to load')

        const { error } = await (stripe as any).redirectToCheckout({ sessionId })
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
    return `Reserva: ${service?.name}`
  }

  const priceToPay = spaceId ? selectedRoom?.price_per_hour : service?.price
  const isFree = !priceToPay || priceToPay <= 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {(step === 2 && spaceId) || step === 3 ? (
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setStep(step - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            ) : null}
            <DialogTitle>{getTitle()}</DialogTitle>
          </div>
          <DialogDescription>
            {step === 1 && spaceId && 'Selecione a sala ou campo que pretende reservar.'}
            {step === 2 && 'Selecione a data e hora desejada.'}
            {step === 3 && 'Reveja os dados e confirme a reserva.'}
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
            {errorMsg}
          </div>
        )}

        {step === 1 && spaceId && (
          <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto pr-1">
            {rooms.length === 0 ? (
              <p className="text-center text-muted-foreground">Este espaço não tem salas disponíveis.</p>
            ) : (
              rooms.map(room => (
                <div 
                  key={room.id}
                  onClick={() => { setSelectedRoom(room); setStep(2); }}
                  className="p-3 border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all flex flex-col gap-3 group"
                >
                  <div className="flex gap-4 items-center">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                      {room.gallery_urls && room.gallery_urls.length > 0 ? (
                        <img src={room.gallery_urls[0]} alt={room.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground font-semibold">Sem Foto</span>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{room.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Capacidade: {room.capacity}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1">{room.description || 'Nenhuma descrição'}</p>
                    </div>
                    {/* Price */}
                    <div className="font-semibold text-primary text-sm whitespace-nowrap">
                      {room.price_per_hour > 0 ? `${room.price_per_hour}€/h` : 'Grátis'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data da Reserva</Label>
              <div className="border rounded-md p-3 flex justify-center bg-background shadow-sm">
                <Calendar
                  mode="single"
                  selected={selectedDate ? new Date(selectedDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const offset = date.getTimezoneOffset()
                      const localDate = new Date(date.getTime() - (offset*60*1000))
                      setSelectedDate(localDate.toISOString().split('T')[0])
                      setSelectedTime('')
                      setErrorMsg('')
                    } else {
                      setSelectedDate('')
                    }
                  }}
                  disabled={(date) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    if (date < today) return true
                    
                    const dayOfWeek = date.getDay()
                    const avail = availability.find(a => a.day_of_week === dayOfWeek)
                    return !avail
                  }}
                  locale={pt}
                  className="p-0"
                />
              </div>
            </div>
            
            {selectedDate && (
              <div className="bg-muted p-3 rounded-lg border text-sm space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  Horários Disponíveis (Este Dia):
                </div>
                {availability.filter(a => a.day_of_week === new Date(selectedDate).getDay()).map((a, i) => (
                  <div key={i} className="text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Das {a.start_time.substring(0,5)} às {a.end_time.substring(0,5)}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => {
                    setSelectedTime(e.target.value)
                    setErrorMsg('')
                  }}
                  className="pl-9"
                  disabled={!selectedDate}
                />
              </div>
              {!selectedDate && (
                <p className="text-xs text-muted-foreground">Selecione uma data primeiro para escolher a hora.</p>
              )}
            </div>

            <Button className="w-full mt-4" onClick={handleNext}>
              Continuar
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 py-4">
            <div className="bg-muted p-4 rounded-xl space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{spaceId ? 'Sala' : 'Serviço'}:</span>
                <span className="font-semibold text-right">{spaceId ? selectedRoom?.name : service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data e Hora:</span>
                <span className="font-semibold text-right">
                  {new Date(selectedDate).toLocaleDateString('pt-PT')} às {selectedTime}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-muted-foreground font-semibold">Total a pagar:</span>
                <span className="font-bold text-lg text-primary">{isFree ? 'Gratuito' : `${Number(priceToPay).toFixed(2)} €`}</span>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleCheckout} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isFree ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              {isFree ? 'Confirmar Reserva' : 'Pagar e Confirmar Reserva'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
