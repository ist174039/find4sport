'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { SpaceRoom } from '@/lib/types'
import { Plus, Trash2, CalendarDays } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function SpaceRoomsClient({ initialRooms, spaceId }: { initialRooms: SpaceRoom[], spaceId: string }) {
  const [rooms, setRooms] = useState<SpaceRoom[]>(initialRooms)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // New room state
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState(1)
  const [price, setPrice] = useState(0)

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const newRoom = {
      space_id: spaceId,
      name,
      capacity: Number(capacity),
      price_per_hour: Number(price),
      is_active: true
    }

    const { data, error } = await supabase
      .from('space_rooms')
      .insert(newRoom)
      .select()
      .single()

    if (!error && data) {
      setRooms([data, ...rooms])
      setIsDialogOpen(false)
      setName('')
      setCapacity(1)
      setPrice(0)
    } else {
      console.error(error)
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('space_rooms').delete().eq('id', id)
    if (!error) {
      setRooms(rooms.filter(r => r.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">As suas Salas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <Button><Plus className="h-4 w-4 mr-2" /> Adicionar Sala</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Sala / Sub-espaço</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRoom} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nome da Sala (ex: Campo 1, Sala de Dança)</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lotação / Capacidade</Label>
                  <Input type="number" min="1" value={capacity} onChange={e => setCapacity(parseInt(e.target.value))} required />
                </div>
                <div className="space-y-2">
                  <Label>Preço por hora (€)</Label>
                  <Input type="number" step="0.50" min="0" value={price} onChange={e => setPrice(parseFloat(e.target.value))} required />
                </div>
              </div>
              {Number(price) > 0 && (
                <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  * Serão deduzidas a taxa da FIND4SPORT (3.5%) e as do processador de pagamento (Stripe) a este valor final.
                </p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'A criar...' : 'Criar Sala'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.length === 0 ? (
          <p className="text-muted-foreground">Ainda não tem salas criadas.</p>
        ) : (
          rooms.map(room => (
            <Card key={room.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <CardDescription>Capacidade: {room.capacity} pessoas</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(room.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-xl font-bold">
                    {room.price_per_hour > 0 ? `${room.price_per_hour}€ / hr` : 'Gratuito'}
                  </div>
                  <Button variant="outline" size="sm">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Gerir Disponibilidade
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
