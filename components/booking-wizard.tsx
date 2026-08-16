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
import { createFreeReservationAction } from '@/app/actions/booking'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface BookingWizardProps { open: boolean; onOpenChange: (open: boolean) => void; service?: Service | null; professionalId?: string | null; spaceId?: string | null }

function timeToMinutes(value: string) { const [hours, minutes] = value.split(':').map(Number); return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : NaN }
function addMinutesToTime(value: string, durationMinutes: number) { const start = timeToMinutes(value); if (!Number.isFinite(start)) return ''; const total = start + durationMinutes; if (total >= 1440) return ''; return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}` }

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

  useEffect(() => { if (!open) return; setStep(spaceId ? 1 : 2); setSelectedRoom(null); setSelectedDate(''); setSelectedTime(''); setErrorMsg(''); if (spaceId) void loadRooms(); else if (professionalId) void loadProfessionalAvailability() }, [open, professionalId, spaceId])
  useEffect(() => { if (selectedRoom) void loadRoomAvailability(selectedRoom.id) }, [selectedRoom])

  async function loadRooms() { if (!spaceId) return; const { data } = await createClient().from('space_rooms').select('*').eq('space_id', spaceId).eq('is_active', true); setRooms((data || []) as SpaceRoom[]) }
  async function loadProfessionalAvailability() { if (!professionalId) return; const { data } = await createClient().from('professional_availability').select('*').eq('professional_id', professionalId).eq('is_active', true); setAvailability(data || []) }
  async function loadRoomAvailability(roomId: string) { const { data } = await createClient().from('space_room_availability').select('*').eq('room_id', roomId).eq('is_active', true); setAvailability(data || []) }

  const validateDateTime = () => {
    if (!selectedDate || !selectedTime || !computedEndTime) { setErrorMsg('Seleciona uma data e hora válidas.'); return false }
    const dayOfWeek = new Date(`${selectedDate}T12:00:00`).getDay()
    const slots = availability.filter(a => a.day_of_week === dayOfWeek)
    if (!slots.length) { setErrorMsg('Não há disponibilidade para este dia.'); return false }
    const valid = slots.some(slot => selectedTime >= String(slot.start_time).slice(0,5) && computedEndTime <= String(slot.end_time).slice(0,5))
    if (!valid) { setErrorMsg(`A reserva de ${durationMinutes} min tem de ficar dentro de um período disponível.`); return false }
    setErrorMsg(''); return true
  }

  const handleNext = () => { if (step === 1 && spaceId) { if (!selectedRoom) return setErrorMsg('Seleciona uma sala/campo.'); setErrorMsg(''); setStep(2) } else if (step === 2 && validateDateTime()) setStep(3) }

  const handleCheckout = async () => {
    if (!validateDateTime()) return
    setLoading(true); setErrorMsg('')
    try {
      const { data: { user } } = await createClient().auth.getUser()
      if (!user) { window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`; return }
      const price = spaceId ? selectedRoom?.price_per_hour : service?.price
      const isFree = !price || price <= 0
      if (isFree) {
        await createFreeReservationAction({ serviceId: service?.id || null, professionalId: professionalId || null, spaceId: spaceId || null, spaceRoomId: selectedRoom?.id || null, date: selectedDate, startTime: selectedTime })
        onOpenChange(false)
        window.location.href = '/dashboard/agenda?booking=success'
        return
      }

      const response = await fetch('/api/checkout_sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serviceId: service?.id || null, spaceId: spaceId || null, spaceRoomId: selectedRoom?.id || null, professionalId: professionalId || null, date: selectedDate, startTime: selectedTime }) })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Não foi possível criar a reserva.')
      const stripe = await stripePromise
      if (!stripe) throw new Error('Não foi possível iniciar o pagamento.')
      const { error } = await (stripe as any).redirectToCheckout({ sessionId: payload.sessionId })
      if (error) throw error
    } catch (err: any) { console.error(err); setErrorMsg(err?.message || 'Não foi possível criar a reserva.'); setLoading(false) }
  }

  const getTitle = () => spaceId ? (selectedRoom ? `Reserva: ${selectedRoom.name}` : 'Selecionar sala/campo') : `Reserva: ${service?.name || 'Serviço'}`
  const priceToPay = spaceId ? selectedRoom?.price_per_hour : service?.price
  const isFree = !priceToPay || priceToPay <= 0

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-[425px]"><DialogHeader><div className="flex items-center gap-2">{((step===2&&spaceId)||step===3) && <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={()=>setStep(step-1)}><ChevronLeft className="h-4 w-4" /></Button>}<DialogTitle>{getTitle()}</DialogTitle></div><DialogDescription>{step===1&&spaceId?'Seleciona a sala ou campo.':step===2?`Seleciona uma hora com ${durationMinutes} minutos livres.`:'Revê os dados e confirma.'}</DialogDescription></DialogHeader>
    {errorMsg && <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{errorMsg}</div>}
    {step===1&&spaceId&&<div className="max-h-[400px] space-y-3 overflow-y-auto py-4">{rooms.length===0?<p className="text-center text-sm text-muted-foreground">Este espaço não tem salas disponíveis.</p>:rooms.map(room=><button type="button" key={room.id} onClick={()=>{setSelectedRoom(room);setErrorMsg('');setStep(2)}} className="flex w-full items-center gap-3 rounded-xl border p-3 text-left hover:border-primary"><div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">{room.gallery_urls?.length?<img src={room.gallery_urls[0]} alt="" className="h-full w-full object-cover"/>:null}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{room.name}</p><p className="text-xs text-muted-foreground">Capacidade: {room.capacity}</p></div><span className="shrink-0 text-sm font-semibold text-primary">{room.price_per_hour>0?`${room.price_per_hour}€/h`:'Grátis'}</span></button>)}</div>}
    {step===2&&<div className="space-y-4 py-4"><div className="space-y-2"><Label>Data</Label><div className="flex justify-center rounded-xl border p-3"><Calendar mode="single" selected={selectedDate?new Date(`${selectedDate}T12:00:00`):undefined} onSelect={date=>{if(!date){setSelectedDate('');return}; const yyyy=date.getFullYear(); const mm=String(date.getMonth()+1).padStart(2,'0'); const dd=String(date.getDate()).padStart(2,'0'); setSelectedDate(`${yyyy}-${mm}-${dd}`); setSelectedTime(''); setErrorMsg('')}} disabled={date=>{const today=new Date();today.setHours(0,0,0,0); return date<today || !availability.some(a=>a.day_of_week===date.getDay())}} locale={pt} className="p-0"/></div></div>{selectedDate&&<div className="rounded-xl border bg-muted/30 p-3 text-sm"><div className="mb-2 flex items-center gap-2 font-semibold"><CalendarIcon className="h-4 w-4 text-primary"/>Disponibilidade</div>{availability.filter(a=>a.day_of_week===new Date(`${selectedDate}T12:00:00`).getDay()).map((a,i)=><p key={i} className="text-muted-foreground">{String(a.start_time).slice(0,5)}–{String(a.end_time).slice(0,5)}</p>)}</div>}<div className="space-y-2"><Label htmlFor="time">Hora de início</Label><div className="relative"><Clock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground"/><Input id="time" type="time" value={selectedTime} onChange={e=>{setSelectedTime(e.target.value);setErrorMsg('')}} className="h-11 pl-9" disabled={!selectedDate}/></div>{selectedTime&&computedEndTime&&<p className="text-xs text-muted-foreground">Fim previsto: <strong>{computedEndTime}</strong></p>}</div><Button className="min-h-11 w-full" onClick={handleNext}>Continuar</Button></div>}
    {step===3&&<div className="space-y-5 py-4"><div className="space-y-3 rounded-xl bg-muted p-4 text-sm"><div className="flex justify-between gap-3"><span className="text-muted-foreground">{spaceId?'Sala':'Serviço'}</span><strong className="text-right">{spaceId?selectedRoom?.name:service?.name}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Data</span><strong>{new Date(`${selectedDate}T12:00:00`).toLocaleDateString('pt-PT')}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Horário</span><strong>{selectedTime}–{computedEndTime}</strong></div><div className="flex justify-between border-t pt-3"><span>Total</span><strong className="text-primary">{isFree?'Gratuito':`${Number(priceToPay).toFixed(2)} €`}</strong></div></div><Button className="min-h-11 w-full" size="lg" onClick={handleCheckout} disabled={loading}>{loading?<Loader2 className="mr-2 h-4 w-4 animate-spin"/>:isFree?<CheckCircle2 className="mr-2 h-4 w-4"/>:<CreditCard className="mr-2 h-4 w-4"/>}{isFree?'Confirmar reserva':'Pagar e confirmar'}</Button></div>}
  </DialogContent></Dialog>
}
