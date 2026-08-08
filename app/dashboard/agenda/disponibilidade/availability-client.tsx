'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { Save } from 'lucide-react'

type AvailabilitySlot = {
  id?: string
  professional_id?: string
  room_id?: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

const DAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

export function AvailabilityClient({ 
  initialAvailability, 
  professionalId,
  roomId
}: { 
  initialAvailability: AvailabilitySlot[], 
  professionalId?: string,
  roomId?: string
}) {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(
    DAYS.map((_, i) => {
      const existing = initialAvailability.find(a => a.day_of_week === i)
      return existing || {
        day_of_week: i,
        start_time: '09:00',
        end_time: '18:00',
        is_active: false
      }
    })
  )
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleToggle = (day: number) => {
    setAvailability(availability.map(a => 
      a.day_of_week === day ? { ...a, is_active: !a.is_active } : a
    ))
  }

  const handleChange = (day: number, field: 'start_time' | 'end_time', value: string) => {
    setAvailability(availability.map(a => 
      a.day_of_week === day ? { ...a, [field]: value } : a
    ))
  }

  const handleSave = async () => {
    setLoading(true)
    
    const table = professionalId ? 'professional_availability' : 'space_room_availability'
    const idField = professionalId ? 'professional_id' : 'room_id'
    const idValue = professionalId || roomId

    // Delete existing
    await supabase.from(table).delete().eq(idField, idValue)

    // Insert new
    const toInsert = availability
      .filter(a => a.is_active)
      .map(a => ({
        [idField as string]: idValue,
        day_of_week: a.day_of_week,
        start_time: a.start_time,
        end_time: a.end_time,
        is_active: true
      }))

    if (toInsert.length > 0) {
      await supabase.from(table).insert(toInsert)
    }

    setLoading(false)
    alert('Disponibilidade guardada com sucesso!')
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {DAYS.map((day, i) => {
          const slot = availability[i]
          return (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3 w-40">
                <Switch 
                  checked={slot.is_active} 
                  onCheckedChange={() => handleToggle(i)} 
                />
                <Label className={slot.is_active ? 'font-bold' : 'text-muted-foreground'}>
                  {day}
                </Label>
              </div>
              
              {slot.is_active ? (
                <div className="flex items-center gap-2">
                  <Input 
                    type="time" 
                    value={slot.start_time.substring(0,5)} 
                    onChange={e => handleChange(i, 'start_time', e.target.value)}
                    className="w-32"
                  />
                  <span className="text-muted-foreground">até</span>
                  <Input 
                    type="time" 
                    value={slot.end_time.substring(0,5)} 
                    onChange={e => handleChange(i, 'end_time', e.target.value)}
                    className="w-32"
                  />
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  Indisponível
                </div>
              )}
            </div>
          )
        })}

        <div className="pt-4 flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'A guardar...' : 'Guardar Alterações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
