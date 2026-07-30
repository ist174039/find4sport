'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, CalendarCheck, Clock, Check, X } from 'lucide-react'
import type { Reservation, ProfessionalAvailability } from '@/lib/types'

const DAYS_OF_WEEK = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

export default function ReservasPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [professionalId, setProfessionalId] = useState<string | null>(null)
  
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [availability, setAvailability] = useState<ProfessionalAvailability[]>([])
  
  // State for the availability form
  const [availForm, setAvailForm] = useState<{ day_of_week: number, start_time: string, end_time: string, is_active: boolean }[]>(
    Array.from({ length: 7 }, (_, i) => ({
      day_of_week: i,
      start_time: '09:00',
      end_time: '18:00',
      is_active: false
    }))
  )

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (professional) {
        setProfessionalId(professional.id)
        
        // Load reservations
        const { data: resData } = await supabase
          .from('reservations')
          .select('*, service:services(*), user:platform_users(full_name, email)')
          .eq('professional_id', professional.id)
          .order('date', { ascending: false })
          
        if (resData) setReservations(resData)

        // Load availability
        const { data: availData } = await supabase
          .from('professional_availability')
          .select('*')
          .eq('professional_id', professional.id)

        if (availData && availData.length > 0) {
          setAvailability(availData)
          // merge with form defaults
          setAvailForm(prev => prev.map(def => {
            const found = availData.find(a => a.day_of_week === def.day_of_week)
            if (found) {
              // Convert "09:00:00" to "09:00"
              return { 
                day_of_week: found.day_of_week, 
                start_time: found.start_time.substring(0, 5), 
                end_time: found.end_time.substring(0, 5), 
                is_active: found.is_active 
              }
            }
            return def
          }))
        }
      }
      setLoading(false)
    }

    loadData()
  }, [])

  const saveAvailability = async () => {
    if (!professionalId) return
    setSaving(true)
    const supabase = createClient()

    try {
      // Upsert the availability settings
      for (const item of availForm) {
        if (!item.is_active) {
          // If deactivated, we could delete or just set is_active = false
          await supabase.from('professional_availability')
            .upsert({
              professional_id: professionalId,
              day_of_week: item.day_of_week,
              start_time: item.start_time,
              end_time: item.end_time,
              is_active: false
            }, { onConflict: 'professional_id,day_of_week' })
        } else {
          await supabase.from('professional_availability')
            .upsert({
              professional_id: professionalId,
              day_of_week: item.day_of_week,
              start_time: item.start_time,
              end_time: item.end_time,
              is_active: true
            }, { onConflict: 'professional_id,day_of_week' })
        }
      }
      alert('Disponibilidade guardada com sucesso!')
    } catch (error) {
      console.error('Error saving availability:', error)
      alert('Erro ao guardar disponibilidade.')
    } finally {
      setSaving(false)
    }
  }

  const updateReservationStatus = async (id: string, newStatus: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('reservations').update({ status: newStatus }).eq('id', id)
    if (!error) {
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as any } : r))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!professionalId) {
    return (
      <div className="space-y-6 max-w-5xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Reservas</h1>
        <Card><CardContent className="pt-6">Precisa de criar um perfil profissional primeiro.</CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Reservas</h1>
        <p className="text-muted-foreground mt-2">
          Gira as reservas do seu espaço e horários disponíveis.
        </p>
      </div>

      <Tabs defaultValue="reservations" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="reservations">Minhas Reservas</TabsTrigger>
          <TabsTrigger value="availability">Disponibilidade / Calendário</TabsTrigger>
        </TabsList>

        <TabsContent value="reservations" className="space-y-4">
          {reservations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <CalendarCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                Ainda não tem nenhuma reserva recebida.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reservations.map((res) => (
                <Card key={res.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{res.service?.name || 'Serviço'}</CardTitle>
                        <CardDescription>
                          Cliente: {res.user?.full_name || 'Desconhecido'} ({(res.user as any)?.email})
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          res.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          res.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          res.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {res.status.toUpperCase()}
                        </span>
                        <div className="font-bold text-lg mt-1">{Number(res.amount).toFixed(2)} €</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm mb-4">
                      <div className="flex items-center gap-1">
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                        {new Date(res.date).toLocaleDateString('pt-PT')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {res.start_time.substring(0, 5)} - {res.end_time.substring(0, 5)}
                      </div>
                    </div>

                    {res.status === 'pending' || res.status === 'paid' ? (
                      <div className="flex gap-2">
                        {res.status === 'pending' && (
                          <Button size="sm" onClick={() => updateReservationStatus(res.id, 'confirmed')} className="gap-1 bg-emerald-600 hover:bg-emerald-700">
                            <Check className="h-4 w-4" /> Confirmar (Manual)
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => updateReservationStatus(res.id, 'cancelled')} className="gap-1 text-destructive hover:bg-destructive/10">
                          <X className="h-4 w-4" /> Cancelar
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <CardTitle>Horário de Trabalho</CardTitle>
              <CardDescription>
                Defina os dias e horas em que está disponível para receber reservas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availForm.map((item, index) => (
                  <div key={item.day_of_week} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 w-1/3">
                      <input 
                        type="checkbox" 
                        checked={item.is_active} 
                        onChange={(e) => {
                          const newForm = [...availForm];
                          newForm[index].is_active = e.target.checked;
                          setAvailForm(newForm);
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="font-medium text-sm">{DAYS_OF_WEEK[item.day_of_week]}</span>
                    </div>
                    
                    {item.is_active ? (
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground">Das</Label>
                          <Input 
                            type="time" 
                            value={item.start_time}
                            onChange={(e) => {
                              const newForm = [...availForm];
                              newForm[index].start_time = e.target.value;
                              setAvailForm(newForm);
                            }}
                            className="w-24 h-8"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground">às</Label>
                          <Input 
                            type="time" 
                            value={item.end_time}
                            onChange={(e) => {
                              const newForm = [...availForm];
                              newForm[index].end_time = e.target.value;
                              setAvailForm(newForm);
                            }}
                            className="w-24 h-8"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground italic flex-1 text-right pr-4">
                        Indisponível
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="pt-4 flex justify-end">
                  <Button onClick={saveAvailability} disabled={saving} className="min-w-[120px]">
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Guardar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
