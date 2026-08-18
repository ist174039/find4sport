'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'
import { getRoomAvailabilityAction, saveRoomAvailabilityAction } from '@/app/actions/room-availability'

interface AvailabilityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomId: string | null
  roomName: string
}

type TimeSlot = {
  id?: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

const DAYS_OF_WEEK = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

export function RoomAvailabilityModal({ open, onOpenChange, roomId, roomName }: AvailabilityModalProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const { showAlert } = useModal()

  useEffect(() => {
    if (!open || !roomId) return
    let active = true
    void getRoomAvailabilityAction(roomId)
      .then(data => { if (active) setSlots((data || []).map(slot => ({ ...slot, start_time: String(slot.start_time).slice(0, 5), end_time: String(slot.end_time).slice(0, 5) }))) })
      .catch(error => { if (active) showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível carregar a disponibilidade.', 'error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [open, roomId, showAlert])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSlots([])
      setLoading(true)
    }
    onOpenChange(nextOpen)
  }

  const addSlot = (day: number) => setSlots(current => [...current, { day_of_week: day, start_time: '09:00', end_time: '18:00', is_active: true }])
  const updateSlot = (index: number, field: keyof TimeSlot, value: string | boolean | number) => setSlots(current => current.map((slot, i) => i === index ? { ...slot, [field]: value } : slot))
  const removeSlot = (index: number) => setSlots(current => current.filter((_, i) => i !== index))
  const setDayEnabled = (day: number, enabled: boolean) => setSlots(current => enabled ? (current.some(slot => slot.day_of_week === day) ? current : [...current, { day_of_week: day, start_time: '09:00', end_time: '18:00', is_active: true }]) : current.filter(slot => slot.day_of_week !== day))

  const handleSave = async () => {
    if (!roomId || saving) return
    setSaving(true)
    try {
      await saveRoomAvailabilityAction(roomId, slots.map(slot => ({ day_of_week: slot.day_of_week, start_time: slot.start_time, end_time: slot.end_time, is_active: slot.is_active })))
      showAlert('Disponibilidade guardada', 'Os períodos disponíveis foram atualizados.', 'success')
      handleOpenChange(false)
    } catch (error) {
      showAlert('Não foi possível guardar', error instanceof Error ? error.message : 'Erro inesperado.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90dvh] w-[calc(100vw-1rem)] max-w-xl flex-col overflow-hidden rounded-2xl p-0 sm:w-full">
        <DialogHeader className="border-b px-4 py-4 sm:px-6">
          <DialogTitle>Disponibilidade · {roomName}</DialogTitle>
          <DialogDescription>Define períodos reserváveis. Intervalos sobrepostos ou horas inválidas são bloqueados no servidor.</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {loading ? <div className="flex min-h-48 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /></div> : (
            <div className="space-y-3">
              {DAYS_OF_WEEK.map((dayName, dayIndex) => {
                const daySlots = slots.map((slot, index) => ({ slot, index })).filter(item => item.slot.day_of_week === dayIndex)
                const enabled = daySlots.length > 0
                return (
                  <section key={dayIndex} className="rounded-2xl border bg-muted/20 p-3 sm:p-4">
                    <div className="flex min-h-11 items-center justify-between gap-3">
                      <Label className="text-sm font-semibold sm:text-base">{dayName}</Label>
                      <div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{enabled ? 'Disponível' : 'Fechado'}</span><Switch checked={enabled} onCheckedChange={checked => setDayEnabled(dayIndex, checked)} /></div>
                    </div>
                    {enabled && <div className="mt-3 space-y-2">
                      {daySlots.map(({ slot, index }) => <div key={`${dayIndex}-${index}`} className="grid grid-cols-[1fr_1fr_44px] items-end gap-2 rounded-xl border bg-background p-2.5">
                        <label className="min-w-0 space-y-1"><span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Das</span><Input type="time" value={slot.start_time.slice(0, 5)} onChange={event => updateSlot(index, 'start_time', event.target.value)} className="min-h-11 w-full text-base" /></label>
                        <label className="min-w-0 space-y-1"><span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Até</span><Input type="time" value={slot.end_time.slice(0, 5)} onChange={event => updateSlot(index, 'end_time', event.target.value)} className="min-h-11 w-full text-base" /></label>
                        <Button type="button" variant="ghost" size="icon" className="h-11 w-11 text-destructive" onClick={() => removeSlot(index)} aria-label="Remover período"><Trash2 className="h-4 w-4" /></Button>
                      </div>)}
                      <Button type="button" variant="outline" className="min-h-11 w-full border-dashed" onClick={() => addSlot(dayIndex)}><Plus className="mr-2 h-4 w-4" />Adicionar período</Button>
                    </div>}
                  </section>
                )
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 border-t bg-background px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:flex sm:justify-end sm:px-6 sm:pb-4">
          <Button variant="outline" className="min-h-11" onClick={() => handleOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button className="min-h-11" onClick={handleSave} disabled={saving || loading}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
