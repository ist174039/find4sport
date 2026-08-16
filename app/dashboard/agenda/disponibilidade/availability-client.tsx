'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Save, Loader2 } from 'lucide-react'
import { saveProfessionalAvailabilityAction } from '@/app/actions/reservations-management'
import { useModal } from '@/components/providers/modal-provider'

type AvailabilitySlot = {
  id?: string
  professional_id?: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

const DAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

export function AvailabilityClient({ initialAvailability }: { initialAvailability: AvailabilitySlot[]; professionalId?: string; roomId?: string }) {
  const { showAlert } = useModal()
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(
    DAYS.map((_, day) => {
      const existing = initialAvailability.find(item => item.day_of_week === day)
      return existing
        ? { ...existing, start_time: String(existing.start_time).slice(0, 5), end_time: String(existing.end_time).slice(0, 5) }
        : { day_of_week: day, start_time: '09:00', end_time: '18:00', is_active: false }
    }),
  )
  const [loading, setLoading] = useState(false)

  const handleToggle = (day: number) => setAvailability(current => current.map(item => item.day_of_week === day ? { ...item, is_active: !item.is_active } : item))
  const handleChange = (day: number, field: 'start_time' | 'end_time', value: string) => setAvailability(current => current.map(item => item.day_of_week === day ? { ...item, [field]: value } : item))

  const handleSave = async () => {
    if (loading) return
    setLoading(true)
    try {
      await saveProfessionalAvailabilityAction(availability.map(item => ({ day_of_week: item.day_of_week, start_time: item.start_time.slice(0, 5), end_time: item.end_time.slice(0, 5), is_active: item.is_active })))
      showAlert('Disponibilidade guardada', 'O horário profissional foi atualizado.', 'success')
    } catch (error) {
      showAlert('Não foi possível guardar', error instanceof Error ? error.message : 'Erro inesperado.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden rounded-2xl">
      <CardContent className="space-y-2 p-3 sm:p-5">
        {DAYS.map((day, index) => {
          const slot = availability[index]
          return (
            <section key={day} className="rounded-xl border border-border p-3 sm:grid sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center sm:gap-4 sm:p-4">
              <div className="flex min-h-11 items-center gap-3">
                <Switch checked={slot.is_active} onCheckedChange={() => handleToggle(index)} />
                <Label className={slot.is_active ? 'font-semibold' : 'text-muted-foreground'}>{day}</Label>
              </div>
              {slot.is_active ? (
                <div className="mt-2 grid min-w-0 grid-cols-2 gap-3 sm:mt-0 sm:max-w-sm sm:justify-self-end">
                  <label className="min-w-0 space-y-1"><span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Das</span><Input type="time" value={slot.start_time.slice(0, 5)} onChange={event => handleChange(index, 'start_time', event.target.value)} className="min-h-11 w-full text-base" /></label>
                  <label className="min-w-0 space-y-1"><span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Até</span><Input type="time" value={slot.end_time.slice(0, 5)} onChange={event => handleChange(index, 'end_time', event.target.value)} className="min-h-11 w-full text-base" /></label>
                </div>
              ) : <p className="pb-1 text-sm text-muted-foreground sm:pb-0 sm:text-right">Indisponível</p>}
            </section>
          )
        })}
        <div className="pt-3 sm:flex sm:justify-end"><Button onClick={handleSave} disabled={loading} className="min-h-11 w-full sm:w-auto">{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}{loading ? 'A guardar…' : 'Guardar disponibilidade'}</Button></div>
      </CardContent>
    </Card>
  )
}
