'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { AppImage } from '@/components/ui/app-image'
import { Loader2, Calendar as CalendarIcon, Clock, CreditCard, CheckCircle2, ChevronLeft, PackageCheck } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { pt } from 'date-fns/locale'
import type { Service, SpaceRoom } from '@/lib/types'
import { createFreeReservationAction, createPackageReservationAction } from '@/app/actions/booking'

interface BookingWizardProps { open: boolean; onOpenChange: (open: boolean) => void; service?: Service | null; professionalId?: string | null; spaceId?: string | null }
type AvailabilitySlot = { day_of_week: number; start_time: string; end_time: string; is_active: boolean }
type PackageCredit = { id: string; sessions_remaining: number; expires_at: string | null; package_name: string }
type PackagePayload = { purchases?: unknown }
type CheckoutPayload = { url?: string; error?: string }

function timeToMinutes(value: string) { const [h, m] = value.split(':').map(Number); return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN }
function minutesToTime(total: number) { return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}` }
function addMinutesToTime(value: string, durationMinutes: number) { const start = timeToMinutes(value); if (!Number.isFinite(start)) return ''; const total = start + durationMinutes; return total >= 1440 ? '' : minutesToTime(total) }
function buildStartTimes(slots: AvailabilitySlot[], durationMinutes: number) {
  const values = new Set<string>()
  for (const slot of slots) {
    const from = timeToMinutes(String(slot.start_time).slice(0, 5))
    const to = timeToMinutes(String(slot.end_time).slice(0, 5))
    if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) continue
    for (let minute = from; minute + durationMinutes <= to; minute += 15) values.add(minutesToTime(minute))
  }
  return [...values].sort()
}
function isPackageCredit(value: unknown): value is PackageCredit { if (!value || typeof value !== 'object') return false; const row = value as Record<string, unknown>; return typeof row.id === 'string' && Number.isFinite(Number(row.sessions_remaining)) && (row.expires_at === null || typeof row.expires_at === 'string') && typeof row.package_name === 'string' }

export function BookingWizard({ open, onOpenChange, service, professionalId, spaceId }: BookingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(spaceId ? 1 : 2)
  const [loading, setLoading] = useState(false)
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [rooms, setRooms] = useState<SpaceRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<SpaceRoom | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [packageCredits, setPackageCredits] = useState<PackageCredit[]>([])
  const [usePackage, setUsePackage] = useState(false)
  const [selectedPackagePurchaseId, setSelectedPackagePurchaseId] = useState('')
  const durationMinutes = spaceId ? 60 : Math.max(1, Number(service?.duration_minutes || 60))
  const computedEndTime = selectedTime ? addMinutesToTime(selectedTime, durationMinutes) : ''
  const selectedDay = selectedDate ? new Date(`${selectedDate}T12:00:00`).getDay() : null
  const selectedDaySlots = selectedDay === null ? [] : availability.filter(slot => slot.day_of_week === selectedDay)
  const availableStartTimes = buildStartTimes(selectedDaySlots, durationMinutes)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    void (async () => {
      const supabase = createClient()
      if (spaceId) {
        const { data, error } = await supabase.from('space_rooms').select('*').eq('space_id', spaceId).eq('is_active', true).order('name')
        if (cancelled) return
        if (error) { setRooms([]); setErrorMsg('Não foi possível carregar as salas/campos deste espaço.'); return }
        setRooms((data || []) as SpaceRoom[])
        return
      }
      if (professionalId) {
        const availabilityPromise = supabase.from('professional_availability').select('day_of_week,start_time,end_time,is_active').eq('professional_id', professionalId).eq('is_active', true).order('day_of_week').order('start_time')
        const packagesPromise = service?.id ? fetch(`/api/services/${encodeURIComponent(service.id)}/package-credits`, { cache: 'no-store' }).then(response => response.ok ? response.json() as Promise<PackagePayload> : { purchases: [] }).catch(() => ({ purchases: [] })) : Promise.resolve<PackagePayload>({ purchases: [] })
        const [availabilityResult, packagePayload] = await Promise.all([availabilityPromise, packagesPromise])
        if (cancelled) return
        if (availabilityResult.error) { setAvailability([]); setErrorMsg('Não foi possível carregar a disponibilidade.') } else setAvailability((availabilityResult.data || []) as AvailabilitySlot[])
        const credits = Array.isArray(packagePayload.purchases) ? packagePayload.purchases.filter(isPackageCredit) : []
        setPackageCredits(credits)
        if (credits.length > 0) { setUsePackage(true); setSelectedPackagePurchaseId(credits[0].id) }
      }
    })()
    return () => { cancelled = true }
  }, [open, professionalId, service?.id, spaceId])

  useEffect(() => {
    if (!open || !selectedRoom) return
    let cancelled = false
    void (async () => {
      const { data, error } = await createClient().from('space_room_availability').select('day_of_week,start_time,end_time,is_active').eq('room_id', selectedRoom.id).eq('is_active', true).order('day_of_week').order('start_time')
      if (cancelled) return
      if (error) { setAvailability([]); setErrorMsg('Não foi possível carregar a disponibilidade desta sala/campo.'); return }
      setAvailability((data || []) as AvailabilitySlot[])
    })()
    return () => { cancelled = true }
  }, [open, selectedRoom])

  const resetWizard = () => { setStep(spaceId ? 1 : 2); setLoading(false); setAvailability([]); setRooms([]); setSelectedRoom(null); setSelectedDate(''); setSelectedTime(''); setErrorMsg(''); setPackageCredits([]); setUsePackage(false); setSelectedPackagePurchaseId('') }
  const handleOpenChange = (nextOpen: boolean) => { if (!nextOpen) resetWizard(); onOpenChange(nextOpen) }
  const validateDateTime = () => {
    if (!selectedDate || !selectedTime || !computedEndTime) { setErrorMsg('Seleciona uma data e hora válidas.'); return false }
    if (!selectedDaySlots.length) { setErrorMsg('Não há disponibilidade para este dia.'); return false }
    if (!availableStartTimes.includes(selectedTime)) { setErrorMsg('Este horário já não é válido. Escolhe um dos horários apresentados.'); return false }
    setErrorMsg(''); return true
  }
  const handleNext = () => { if (step === 1 && spaceId) { if (!selectedRoom) { setErrorMsg('Seleciona uma sala/campo.'); return } setErrorMsg(''); setStep(2) } else if (step === 2 && validateDateTime()) setStep(3) }

  const handleCheckout = async () => {
    if (!validateDateTime()) return
    setLoading(true); setErrorMsg('')
    try {
      if (!spaceId && service?.id && professionalId && usePackage && selectedPackagePurchaseId) { await createPackageReservationAction({ serviceId: service.id, professionalId, packagePurchaseId: selectedPackagePurchaseId, date: selectedDate, startTime: selectedTime }); router.push('/dashboard/agenda?booking=package'); return }
      const price = spaceId ? selectedRoom?.price_per_hour : service?.price
      const isFree = !price || Number(price) <= 0
      if (isFree) { await createFreeReservationAction({ serviceId: service?.id || null, professionalId: professionalId || null, spaceId: spaceId || null, spaceRoomId: selectedRoom?.id || null, date: selectedDate, startTime: selectedTime }); router.push('/dashboard/agenda?booking=success'); return }
      const response = await fetch('/api/checkout_sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serviceId: service?.id || null, spaceId: spaceId || null, spaceRoomId: selectedRoom?.id || null, professionalId: professionalId || null, date: selectedDate, startTime: selectedTime }) })
      const payload = await response.json().catch(() => ({})) as CheckoutPayload
      if (response.status === 401) { router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`); return }
      if (!response.ok || !payload.url) throw new Error(payload.error || 'Não foi possível iniciar o pagamento.')
      window.location.assign(payload.url)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível criar a reserva.'
      if (message.toLowerCase().includes('autenticação') || message.toLowerCase().includes('iniciar sessão')) router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      else { setErrorMsg(message); setLoading(false) }
    }
  }

  const getTitle = () => spaceId ? (selectedRoom ? `Reserva · ${selectedRoom.name}` : 'Escolher sala/campo') : `Reserva · ${service?.name || 'Serviço'}`
  const singlePrice = spaceId ? selectedRoom?.price_per_hour : service?.price
  const coveredByPackage = !spaceId && usePackage && Boolean(selectedPackagePurchaseId)
  const isFree = coveredByPackage || !singlePrice || Number(singlePrice) <= 0
  const canGoBack = (step === 2 && Boolean(spaceId)) || step === 3
  const selectedCredit = packageCredits.find(item => item.id === selectedPackagePurchaseId)

  return <Dialog open={open} onOpenChange={handleOpenChange}><DialogContent className="flex h-[100dvh] w-screen max-w-none flex-col overflow-hidden rounded-none p-0 sm:h-auto sm:max-h-[90dvh] sm:w-full sm:max-w-lg sm:rounded-3xl">
    <DialogHeader className="shrink-0 border-b bg-background px-4 py-4 sm:px-6"><div className="flex min-w-0 items-center gap-2">{canGoBack && <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 rounded-full" onClick={() => setStep(step - 1)} aria-label="Voltar"><ChevronLeft className="h-4 w-4" /></Button>}<div className="min-w-0"><DialogTitle className="truncate text-left">{getTitle()}</DialogTitle><DialogDescription className="mt-1 text-left">{step === 1 && spaceId ? 'Escolhe onde queres reservar.' : step === 2 ? `Escolhe uma data e um horário. Duração: ${durationMinutes} min.` : 'Confirma antes de continuar.'}</DialogDescription></div></div></DialogHeader>
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">{errorMsg && <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{errorMsg}</div>}
      {step === 1 && spaceId && <div className="space-y-3">{rooms.length === 0 ? <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Este espaço não tem salas/campos disponíveis.</div> : rooms.map(room => <button type="button" key={room.id} onClick={() => { setSelectedRoom(room); setAvailability([]); setSelectedDate(''); setSelectedTime(''); setErrorMsg(''); setStep(2) }} className="flex min-h-20 w-full items-center gap-3 rounded-2xl border p-3 text-left transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">{room.gallery_urls?.length ? <AppImage src={room.gallery_urls[0]} alt={room.name} fill sizes="64px" className="object-cover" /> : null}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{room.name}</p><p className="mt-1 text-xs text-muted-foreground">Capacidade: {room.capacity || '—'}</p></div><span className="shrink-0 text-sm font-semibold text-primary">{Number(room.price_per_hour || 0) > 0 ? `${Number(room.price_per_hour).toFixed(2)} €/h` : 'Grátis'}</span></button>)}</div>}
      {step === 2 && <div className="space-y-5"><div className="space-y-2"><Label>Data</Label><div className="flex justify-center rounded-2xl border p-3"><Calendar mode="single" selected={selectedDate ? new Date(`${selectedDate}T12:00:00`) : undefined} onSelect={date => { if (!date) { setSelectedDate(''); setSelectedTime(''); return } setSelectedDate(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`); setSelectedTime(''); setErrorMsg('') }} disabled={date => { const today = new Date(); today.setHours(0, 0, 0, 0); return date < today || !availability.some(slot => slot.day_of_week === date.getDay()) }} locale={pt} className="p-0" /></div></div>
        {selectedDate && <div className="space-y-3"><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/><Label>Horário de início</Label></div>{availableStartTimes.length ? <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{availableStartTimes.map(time => <button key={time} type="button" onClick={() => { setSelectedTime(time); setErrorMsg('') }} className={`min-h-11 rounded-xl border px-2 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selectedTime === time ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'}`}>{time}</button>)}</div> : <div className="rounded-2xl border border-dashed p-5 text-center text-sm text-muted-foreground">Não existem horários que comportem uma reserva de {durationMinutes} minutos neste dia.</div>}{selectedTime && computedEndTime && <div className="flex items-center gap-2 rounded-xl bg-primary/5 px-3 py-2 text-sm"><CalendarIcon className="h-4 w-4 text-primary"/><span>Reserva prevista: <strong>{selectedTime}–{computedEndTime}</strong></span></div>}<p className="text-xs leading-5 text-muted-foreground">A disponibilidade é confirmada novamente ao criar a reserva, para evitar conflitos com reservas feitas entretanto.</p></div>}
      </div>}
      {step === 3 && <div className="space-y-4">{packageCredits.length > 0 && !spaceId && <div className="rounded-2xl border p-3"><p className="mb-2 text-sm font-semibold">Como queres pagar?</p><button type="button" onClick={() => setUsePackage(true)} className={`flex min-h-14 w-full items-center justify-between rounded-xl border p-3 text-left ${usePackage ? 'border-primary bg-primary/5' : 'border-border'}`}><span className="flex items-center gap-2"><PackageCheck className="h-4 w-4 text-primary" /><span><span className="block text-sm font-medium">Usar pacote</span><span className="block text-xs text-muted-foreground">{selectedCredit?.package_name || packageCredits[0].package_name} · {selectedCredit?.sessions_remaining || packageCredits[0].sessions_remaining} restantes</span></span></span></button>{Number(singlePrice || 0) > 0 && <button type="button" onClick={() => setUsePackage(false)} className={`mt-2 flex min-h-12 w-full items-center justify-between rounded-xl border p-3 text-left ${!usePackage ? 'border-primary bg-primary/5' : 'border-border'}`}><span className="text-sm font-medium">Pagar sessão avulsa</span><strong>{Number(singlePrice).toFixed(2)} €</strong></button>}</div>}
        <div className="space-y-3 rounded-2xl border bg-muted/30 p-4 text-sm"><div className="flex justify-between gap-3"><span className="text-muted-foreground">{spaceId ? 'Sala/campo' : 'Serviço'}</span><strong className="text-right">{spaceId ? selectedRoom?.name : service?.name}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Data</span><strong>{new Date(`${selectedDate}T12:00:00`).toLocaleDateString('pt-PT')}</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Horário</span><strong>{selectedTime}–{computedEndTime}</strong></div><div className="flex justify-between border-t pt-3"><span>Total</span><strong className="text-primary">{coveredByPackage ? '1 crédito do pacote' : isFree ? 'Gratuito' : `${Number(singlePrice).toFixed(2)} €`}</strong></div></div></div>}
    </div>
    <div className="shrink-0 border-t bg-background px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-4">{step === 2 && <Button className="min-h-12 w-full rounded-xl" onClick={handleNext} disabled={!selectedDate || !selectedTime}>Continuar</Button>}{step === 3 && <Button className="min-h-12 w-full rounded-xl" size="lg" onClick={handleCheckout} disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : coveredByPackage ? <PackageCheck className="mr-2 h-4 w-4" /> : isFree ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <CreditCard className="mr-2 h-4 w-4" />}{loading ? 'A processar…' : coveredByPackage ? 'Usar 1 sessão do pacote' : isFree ? 'Confirmar reserva' : 'Pagar e confirmar'}</Button>}</div>
  </DialogContent></Dialog>
}
