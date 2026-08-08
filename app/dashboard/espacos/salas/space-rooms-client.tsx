'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { SpaceRoom } from '@/lib/types'
import { Plus, Trash2, CalendarDays, Camera, X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function SpaceRoomsClient({ initialRooms, spaceId }: { initialRooms: SpaceRoom[], spaceId: string }) {
  const [rooms, setRooms] = useState<SpaceRoom[]>(initialRooms)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // New room state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [capacity, setCapacity] = useState(1)
  const [price, setPrice] = useState(0)

  // Photo management state
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const [savingPhotos, setSavingPhotos] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const newRoom = {
      space_id: spaceId,
      name,
      description: description || null,
      capacity: Number(capacity),
      price_per_hour: Number(price),
      is_active: true,
      gallery_urls: []
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
      setDescription('')
      setCapacity(1)
      setPrice(0)
    } else {
      console.error(error)
      alert('Erro ao criar sala. Verifique os dados e tente novamente.')
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar esta sala/campo?')) return
    const { error } = await supabase.from('space_rooms').delete().eq('id', id)
    if (!error) {
      setRooms(rooms.filter(r => r.id !== id))
    }
  }

  // Photo management
  const handleAddPhotoUrl = async (roomId: string) => {
    if (!photoUrl.trim()) return
    setSavingPhotos(true)

    const room = rooms.find(r => r.id === roomId)
    if (!room) return

    const updatedUrls = [...(room.gallery_urls || []), photoUrl.trim()]

    const { error } = await supabase
      .from('space_rooms')
      .update({ gallery_urls: updatedUrls })
      .eq('id', roomId)

    if (!error) {
      setRooms(rooms.map(r => r.id === roomId ? { ...r, gallery_urls: updatedUrls } : r))
      setPhotoUrl('')
    }
    setSavingPhotos(false)
  }

  const handleRemovePhoto = async (roomId: string, urlToRemove: string) => {
    const room = rooms.find(r => r.id === roomId)
    if (!room) return

    const updatedUrls = (room.gallery_urls || []).filter(u => u !== urlToRemove)

    const { error } = await supabase
      .from('space_rooms')
      .update({ gallery_urls: updatedUrls })
      .eq('id', roomId)

    if (!error) {
      setRooms(rooms.map(r => r.id === roomId ? { ...r, gallery_urls: updatedUrls } : r))
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, roomId: string) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setSavingPhotos(true)
    const room = rooms.find(r => r.id === roomId)
    if (!room) return

    const newUrls: string[] = []

    for (const file of files) {
      const result = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (event) => resolve(event.target?.result as string)
        reader.readAsDataURL(file)
      })
      newUrls.push(result)
    }

    const updatedUrls = [...(room.gallery_urls || []), ...newUrls]

    const { error } = await supabase
      .from('space_rooms')
      .update({ gallery_urls: updatedUrls })
      .eq('id', roomId)

    if (!error) {
      setRooms(rooms.map(r => r.id === roomId ? { ...r, gallery_urls: updatedUrls } : r))
    }

    if (e.target) e.target.value = ''
    setSavingPhotos(false)
  }

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => editingRoomId && handleFileUpload(e, editingRoomId)}
        accept="image/*"
        multiple
        className="hidden"
      />

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">As suas Salas / Campos</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
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
              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Ex: Campo de padel coberto com piso sintético..."
                  rows={3}
                />
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

      <div className="grid grid-cols-1 gap-6">
        {rooms.length === 0 ? (
          <div className="bg-card border-2 border-dashed border-border rounded-2xl p-12 text-center">
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground">Sem salas ou campos</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Adicione as salas, campos ou sub-espaços do seu recinto para permitir reservas individuais.
            </p>
          </div>
        ) : (
          rooms.map(room => (
            <Card key={room.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{room.name}</CardTitle>
                    <CardDescription>
                      Capacidade: {room.capacity} pessoas
                      {room.description && <span className="block mt-1">{room.description}</span>}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Disponibilidade
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(room.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <div className="text-xl font-bold">
                    {room.price_per_hour > 0 ? `${room.price_per_hour}€ / hr` : 'Gratuito'}
                  </div>
                </div>

                {/* Photo Gallery Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Camera className="w-4 h-4 text-primary" />
                      Fotos da Sala ({(room.gallery_urls || []).length})
                    </h4>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => {
                          setEditingRoomId(room.id)
                          fileInputRef.current?.click()
                        }}
                        disabled={savingPhotos}
                      >
                        {savingPhotos && editingRoomId === room.id ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Carregar
                      </Button>
                    </div>
                  </div>

                  {/* Photo Grid */}
                  {(room.gallery_urls || []).length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {room.gallery_urls.map((url, idx) => (
                        <div key={idx} className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                          <img src={url} alt={`${room.name} foto ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => handleRemovePhoto(room.id, url)}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Photo by URL */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ou cole o URL da foto (https://...)"
                      value={editingRoomId === room.id ? photoUrl : ''}
                      onFocus={() => setEditingRoomId(room.id)}
                      onChange={e => {
                        setEditingRoomId(room.id)
                        setPhotoUrl(e.target.value)
                      }}
                      className="text-sm"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleAddPhotoUrl(room.id)}
                      disabled={!photoUrl.trim() || editingRoomId !== room.id || savingPhotos}
                    >
                      <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
