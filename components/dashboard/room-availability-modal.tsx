'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'

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

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
]

export function RoomAvailabilityModal({ open, onOpenChange, roomId, roomName }: AvailabilityModalProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const { showAlert } = useModal()

  useEffect(() => {
    if (open && roomId) {
      loadAvailability()
    } else {
      setSlots([])
    }
  }, [open, roomId])

  async function loadAvailability() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('space_room_availability')
      .select('*')
      .eq('room_id', roomId)
      .order('day_of_week', { ascending: true })
      
    if (error) {
      console.error(error)
      showAlert('Erro', 'Não foi possível carregar a disponibilidade.', 'error')
    } else {
      setSlots(data || [])
    }
    setLoading(false)
  }

  const addSlot = (day: number) => {
    setSlots([...slots, { day_of_week: day, start_time: '09:00', end_time: '18:00', is_active: true }])
  }

  const updateSlot = (index: number, field: keyof TimeSlot, value: any) => {
    const updated = [...slots]
    updated[index] = { ...updated[index], [field]: value }
    setSlots(updated)
  }

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!roomId) return
    setSaving(true)
    const supabase = createClient()
    
    try {
      // First, delete existing
      await supabase.from('space_room_availability').delete().eq('room_id', roomId)
      
      // Then insert new
      if (slots.length > 0) {
        const toInsert = slots.map(s => ({
          room_id: roomId,
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          is_active: s.is_active
        }))
        const { error } = await supabase.from('space_room_availability').insert(toInsert)
        if (error) throw error
      }
      
      showAlert('Sucesso', 'Horário de disponibilidade atualizado.', 'success')
      onOpenChange(false)
    } catch (err: any) {
      console.error(err)
      showAlert('Erro', err.message || 'Erro ao guardar disponibilidade.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Disponibilidade: {roomName}</DialogTitle>
          <DialogDescription>
            Defina os dias da semana e os horários em que esta sala ou campo está disponível para reservas.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
            {DAYS_OF_WEEK.map((dayName, dayIndex) => {
              const daySlots = slots.filter(s => s.day_of_week === dayIndex)
              const hasSlots = daySlots.length > 0

              return (
                <div key={dayIndex} className="bg-muted/30 p-4 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="font-semibold text-base">{dayName}</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{hasSlots ? 'Aberto' : 'Fechado'}</span>
                      <Switch 
                        checked={hasSlots}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            addSlot(dayIndex)
                          } else {
                            setSlots(slots.filter(s => s.day_of_week !== dayIndex))
                          }
                        }}
                      />
                    </div>
                  </div>

                  {hasSlots && (
                    <div className="space-y-3 mt-4">
                      {slots.map((slot, index) => {
                        if (slot.day_of_week !== dayIndex) return null
                        return (
                          <div key={index} className="flex items-center gap-3 bg-background p-2 px-3 rounded-lg border shadow-sm">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase text-muted-foreground font-semibold">Das</span>
                                <Input 
                                  type="time" 
                                  className="h-8" 
                                  value={slot.start_time.substring(0,5)}
                                  onChange={(e) => updateSlot(index, 'start_time', e.target.value)}
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase text-muted-foreground font-semibold">Às</span>
                                <Input 
                                  type="time" 
                                  className="h-8" 
                                  value={slot.end_time.substring(0,5)}
                                  onChange={(e) => updateSlot(index, 'end_time', e.target.value)}
                                />
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:bg-destructive/10 h-8 w-8 mt-4"
                              onClick={() => removeSlot(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )
                      })}
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2 border-dashed text-xs h-8"
                        onClick={() => addSlot(dayIndex)}
                      >
                        <Plus className="w-3 h-3 mr-1" /> Adicionar Período
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="pt-4 border-t flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Guardar Horários
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
