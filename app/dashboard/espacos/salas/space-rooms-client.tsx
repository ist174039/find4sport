'use client'

import { useRef, useState } from 'react'
import { CalendarDays, Camera, Image as ImageIcon, Loader2, Plus, Trash2, Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createSpaceRoomAction, deleteSpaceRoomAction, updateSpaceRoomGalleryAction } from '@/app/actions/space-rooms'
import { useModal } from '@/components/providers/modal-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { RoomAvailabilityModal } from '@/components/dashboard/room-availability-modal'
import type { SpaceRoom } from '@/lib/types'

export function SpaceRoomsClient({
  initialRooms,
  spaceId,
  userId,
  subscriptionTier = 'free',
}: {
  initialRooms: SpaceRoom[]
  spaceId: string
  userId: string
  subscriptionTier?: string
}) {
  const { showAlert } = useModal()
  const [rooms, setRooms] = useState<SpaceRoom[]>(initialRooms)
  const [creating, setCreating] = useState(false)
  const [busyRoomId, setBusyRoomId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false)
  const [availabilityRoom, setAvailabilityRoom] = useState<SpaceRoom | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [capacity, setCapacity] = useState(1)
  const [price, setPrice] = useState(0)
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxPhotos = subscriptionTier === 'free' ? 5 : null

  const openAvailability = (room: SpaceRoom) => {
    setAvailabilityRoom(room)
    setIsAvailabilityModalOpen(true)
  }

  const handleAddRoom = async (event: React.FormEvent) => {
    event.preventDefault()
    setCreating(true)
    try {
      const room = await createSpaceRoomAction({
        spaceId,
        name,
        description,
        capacity: Number(capacity),
        pricePerHour: Number(price),
      })
      setRooms((previous) => [room, ...previous])
      setName('')
      setDescription('')
      setCapacity(1)
      setPrice(0)
      setIsDialogOpen(false)
      showAlert('Sala criada', 'A sala/campo já está disponível para configuração.', 'success')
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível criar a sala/campo.', 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (room: SpaceRoom) => {
    setBusyRoomId(room.id)
    try {
      await deleteSpaceRoomAction(room.id)
      setRooms((previous) => previous.filter((item) => item.id !== room.id))
      showAlert('Sala removida', `${room.name} foi removida.`, 'success')
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível remover a sala/campo.', 'error')
    } finally {
      setBusyRoomId(null)
    }
  }

  const persistGallery = async (room: SpaceRoom, nextUrls: string[]) => {
    await updateSpaceRoomGalleryAction(room.id, nextUrls)
    setRooms((previous) => previous.map((item) => item.id === room.id ? { ...item, gallery_urls: nextUrls } : item))
  }

  const handleAddPhotoUrl = async (room: SpaceRoom) => {
    const nextUrl = photoUrl.trim()
    if (!nextUrl) return
    if (!/^https:\/\//i.test(nextUrl)) {
      showAlert('URL inválido', 'Utilize um endereço HTTPS válido.', 'error')
      return
    }
    const current = room.gallery_urls || []
    if (maxPhotos !== null && current.length >= maxPhotos) {
      showAlert('Limite do plano', `O plano atual permite até ${maxPhotos} fotos por sala/campo.`, 'error')
      return
    }

    setBusyRoomId(room.id)
    try {
      await persistGallery(room, [...current, nextUrl])
      setPhotoUrl('')
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível adicionar a fotografia.', 'error')
    } finally {
      setBusyRoomId(null)
    }
  }

  const handleRemovePhoto = async (room: SpaceRoom, urlToRemove: string) => {
    setBusyRoomId(room.id)
    const nextUrls = (room.gallery_urls || []).filter((url) => url !== urlToRemove)
    try {
      await persistGallery(room, nextUrls)

      const marker = '/storage/v1/object/public/avatars/'
      const path = urlToRemove.split(marker)[1]
      if (path?.startsWith(`${userId}/rooms/`)) {
        const supabase = createClient()
        await supabase.storage.from('avatars').remove([path])
      }
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível remover a fotografia.', 'error')
    } finally {
      setBusyRoomId(null)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, room: SpaceRoom) => {
    const files = Array.from(event.target.files || [])
    if (!files.length) return

    const current = room.gallery_urls || []
    if (maxPhotos !== null && current.length + files.length > maxPhotos) {
      showAlert('Limite do plano', `Pode ter no máximo ${maxPhotos} fotos por sala/campo neste plano.`, 'error')
      event.target.value = ''
      return
    }

    setBusyRoomId(room.id)
    const supabase = createClient()
    const uploadedUrls: string[] = []

    try {
      for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          throw new Error('Apenas JPEG, PNG e WebP são permitidos.')
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Cada imagem pode ter no máximo 5 MB.')
        }

        const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `${userId}/rooms/${room.id}/${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { cacheControl: '3600', upsert: false })
        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        uploadedUrls.push(data.publicUrl)
      }

      await persistGallery(room, [...current, ...uploadedUrls])
      showAlert('Fotos carregadas', `${uploadedUrls.length} fotografia(s) adicionada(s).`, 'success')
    } catch (error) {
      for (const url of uploadedUrls) {
        const marker = '/storage/v1/object/public/avatars/'
        const path = url.split(marker)[1]
        if (path) await supabase.storage.from('avatars').remove([path])
      }
      showAlert('Erro no upload', error instanceof Error ? error.message : 'Não foi possível carregar as fotografias.', 'error')
    } finally {
      setBusyRoomId(null)
      event.target.value = ''
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={(event) => {
          const room = rooms.find((item) => item.id === editingRoomId)
          if (room) void handleFileUpload(event, room)
        }}
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold sm:text-xl">As suas Salas / Campos</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="min-h-11 w-full rounded-xl sm:w-auto"><Plus className="mr-2 h-4 w-4" />Adicionar Sala</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90dvh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl sm:max-w-lg">
            <DialogHeader><DialogTitle>Nova Sala / Sub-espaço</DialogTitle></DialogHeader>
            <form onSubmit={handleAddRoom} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="room-name">Nome da Sala</Label>
                <Input id="room-name" value={name} onChange={(event) => setName(event.target.value)} required className="h-11 text-base" placeholder="Ex: Campo 1, Sala de Dança" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room-description">Descrição</Label>
                <Textarea id="room-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ex: Campo de padel coberto..." rows={3} className="text-base" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="room-capacity">Capacidade</Label>
                  <Input id="room-capacity" inputMode="numeric" type="number" min="1" value={capacity} onChange={(event) => setCapacity(Number(event.target.value))} required className="h-11 text-base" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room-price">Preço por hora (€)</Label>
                  <Input id="room-price" inputMode="decimal" type="number" step="0.50" min="0" value={price} onChange={(event) => setPrice(Number(event.target.value))} required className="h-11 text-base" />
                </div>
              </div>
              <Button type="submit" className="min-h-11 w-full rounded-xl" disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{creating ? 'A criar...' : 'Criar Sala'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {rooms.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card px-5 py-10 text-center sm:p-12">
          <CalendarDays className="mx-auto mb-3 h-10 w-10 text-muted-foreground sm:h-12 sm:w-12" />
          <h3 className="text-base font-bold text-foreground sm:text-lg">Sem salas ou campos</h3>
          <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">Adicione os sub-espaços do recinto para permitir reservas individuais.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {rooms.map((room) => {
            const busy = busyRoomId === room.id
            const gallery = room.gallery_urls || []
            return (
              <Card key={room.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-lg">{room.name}</CardTitle>
                      <CardDescription className="mt-1 text-xs leading-relaxed sm:text-sm">Capacidade: {room.capacity} pessoas{room.description && <span className="mt-1 block">{room.description}</span>}</CardDescription>
                    </div>
                    <div className="grid grid-cols-[1fr_44px] gap-2 sm:flex">
                      <Button variant="outline" onClick={() => openAvailability(room)} className="min-h-11 rounded-xl"><CalendarDays className="mr-2 h-4 w-4" />Disponibilidade</Button>
                      <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl text-destructive" onClick={() => void handleDelete(room)} disabled={busy} aria-label={`Eliminar ${room.name}`}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 p-4 pt-1 sm:p-6 sm:pt-1">
                  <div className="border-b border-border pb-3 text-lg font-bold sm:text-xl">{room.price_per_hour > 0 ? `${room.price_per_hour}€ / hora` : 'Gratuito'}</div>

                  <div className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h4 className="flex items-center gap-2 text-sm font-semibold"><Camera className="h-4 w-4 text-primary" />Fotos ({gallery.length}{maxPhotos !== null ? `/${maxPhotos}` : ''})</h4>
                      <Button
                        variant="outline"
                        onClick={() => { setEditingRoomId(room.id); fileInputRef.current?.click() }}
                        disabled={busy || (maxPhotos !== null && gallery.length >= maxPhotos)}
                        className="min-h-11 w-full rounded-xl sm:w-auto"
                      >
                        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}Carregar fotos
                      </Button>
                    </div>

                    {gallery.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">
                        {gallery.map((url, index) => (
                          <div key={`${url}-${index}`} className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
                            <img src={url} alt={`${room.name} foto ${index + 1}`} className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => void handleRemovePhoto(room, url)}
                              disabled={busy}
                              className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-destructive shadow-sm backdrop-blur active:scale-95"
                              aria-label="Remover fotografia"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      <Input
                        type="url"
                        inputMode="url"
                        placeholder="Ou cole um URL HTTPS da foto"
                        value={editingRoomId === room.id ? photoUrl : ''}
                        onFocus={() => setEditingRoomId(room.id)}
                        onChange={(event) => { setEditingRoomId(room.id); setPhotoUrl(event.target.value) }}
                        className="h-11 text-base sm:text-sm"
                      />
                      <Button
                        variant="secondary"
                        onClick={() => void handleAddPhotoUrl(room)}
                        disabled={!photoUrl.trim() || editingRoomId !== room.id || busy}
                        className="min-h-11 rounded-xl"
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />Adicionar URL
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <RoomAvailabilityModal
        open={isAvailabilityModalOpen}
        onOpenChange={setIsAvailabilityModalOpen}
        roomId={availabilityRoom?.id || null}
        roomName={availabilityRoom?.name || ''}
      />
    </div>
  )
}
