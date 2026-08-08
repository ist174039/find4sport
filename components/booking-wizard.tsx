'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Loader2, Calendar as CalendarIcon, Clock, CreditCard, CheckCircle2 } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { pt } from 'date-fns/locale'
import { loadStripe } from '@stripe/stripe-js'
import type { Service, ProfessionalAvailability } from '@/lib/types'

// Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface BookingWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: Service | null
  professionalId: string
}

export function BookingWizard({ open, onOpenChange, service, professionalId }: BookingWizardProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [availability, setAvailability] = useState<ProfessionalAvailability[]>([])
  
  // Form State
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (open && professionalId) {
      loadAvailability()
      setStep(1)
      setSelectedDate('')
      setSelectedTime('')
      setErrorMsg('')
    }
  }, [open, professionalId])

  async function loadAvailability() {
    const supabase = createClient()
    const { data } = await supabase
      .from('professional_availability')
      .select('*')
      .eq('professional_id', professionalId)
      .eq('is_active', true)
      
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
      setErrorMsg('O profissional não tem disponibilidade para este dia da semana.')
      return false
    }

    // Very basic time validation (can be expanded)
    if (selectedTime < avail.start_time || selectedTime > avail.end_time) {
      setErrorMsg(`O horário deve ser entre ${avail.start_time.substring(0,5)} e ${avail.end_time.substring(0,5)}.`)
      return false
    }

    setErrorMsg('')
    return true
  }

  const handleNext = () => {
    if (step === 1) {
      if (validateDateTime()) {
        setStep(2)
      }
    }
  }

  const handleCheckout = async () => {
    if (!service) return
    setLoading(true)
    setErrorMsg('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/auth/login'
        return
      }

      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          professionalId,
          date: selectedDate,
          startTime: selectedTime,
          endTime: selectedTime, // For simplicity, we just use same or calculate based on duration
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
      if (error) {
        throw error
      }

    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Ocorreu um erro no redirecionamento.')
      setLoading(false)
    }
  }

  if (!service) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reserva: {service.name}</DialogTitle>
          <DialogDescription>
            {step === 1 ? 'Selecione a data e hora desejada.' : 'Reveja os dados e proceda ao pagamento.'}
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
            {errorMsg}
          </div>
        )}

        {step === 1 && (
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
            
            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <Button className="w-full mt-4" onClick={handleNext}>
              Continuar
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 py-4">
            <div className="bg-muted p-4 rounded-xl space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Serviço:</span>
                <span className="font-semibold text-right">{service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data e Hora:</span>
                <span className="font-semibold text-right">
                  {new Date(selectedDate).toLocaleDateString('pt-PT')} às {selectedTime}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-muted-foreground font-semibold">Total a pagar:</span>
                <span className="font-bold text-lg text-primary">{Number(service.price).toFixed(2)} €</span>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleCheckout} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Pagar e Confirmar Reserva
            </Button>
            
            <Button variant="ghost" className="w-full" onClick={() => setStep(1)} disabled={loading}>
              Voltar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
