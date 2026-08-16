'use client'

import { useRef, useState } from 'react'
import { CalendarDays, Camera, Image as ImageIcon, MoreVertical, Pencil, Plus, Power, Trash2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { RoomAvailabilityModal } from '@/components/dashboard/room-availability-modal'
import { useModal } from '@/components/providers/modal-provider'
import {
  addSpaceRoomPhotoUrlAction,
  createSpaceRoomAction,
  deleteSpaceRoomAction,
  removeSpaceRoomPhotoAction,
  toggleSpaceRoomAction,
  updateSpaceRoomAction,
  uploadSpaceRoomPhotosAction,
} from '@/app/actions/space-rooms'
import type { SpaceRoom } from '@/lib/types'

type RoomForm = { name: string; description: string; capacity: number; price: number }
const emptyForm: RoomForm = { name: '', description: '', capacity: 1, price: 0 }

export function SpaceRoomsClient({ initialRooms, spaceId, maxPhotos }: { initialRooms: SpaceRoom[]; spaceId: string; maxPhotos: number | null }) {
  const { showAlert, showConfirm } = useModal()
  const [rooms, setRooms] = useState<SpaceRoom[]>(initialRooms)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<RoomForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [availabilityRoom, setAvailabilityRoom] = useState<SpaceRoom | null>(null)
  const [photoRoomId, setPhotoRoomId] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function openCreate() { setEditingId(null); setForm(emptyForm); setDialogOpen(true) }
  function openEdit(room: SpaceRoom) {
    setEditingId(room.id)
    setForm({ name: room.name, description: room.description || '', capacity: room.capacity || 1, price: Number(room.price_per_hour || 0) })
    setDialogOpen(true)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      const input = { name: form.name, description: form.description, capacity: Number(form.capacity), pricePerHour: Number(form.price) }
      if (editingId) {
        const updated = await updateSpaceRoomAction(editingId, input)
        setRooms(prev => prev.map(room => room.id === editingId ? updated as SpaceRoom : room))
        showAlert('Sala atualizada', 'As alterações foram guardadas.', 'success')
      } else {
        const created = await createSpaceRoomAction({ spaceId, ...input })
        setRooms(prev => [created as SpaceRoom, ...prev])
        showAlert('Sala criada', 'A sala/campo está pronta para configurar disponibilidade.', 'success')
      }
      setDialogOpen(false)
    } catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível guardar.', 'error') }
    finally { setSaving(false) }
  }

  async function toggle(room: SpaceRoom) {
    const next = room.is_active === false
    setBusyId(room.id)
    try {
      const updated = await toggleSpaceRoomAction(room.id, next)
      setRooms(prev => prev.map(item => item.id === room.id ? updated as SpaceRoom : item))
      showAlert(next ? 'Sala ativada' : 'Sala desativada', next ? 'A sala voltou a aceitar configuração para reservas.' : 'A sala deixa de estar disponível para novas reservas.', 'success')
    } catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível alterar o estado.', 'error') }
    finally { setBusyId(null) }
  }

  async function remove(room: SpaceRoom) {
    const confirmed = await showConfirm('Eliminar sala/campo', `Eliminar definitivamente “${room.name}”? Se tiver histórico associado, desative-a em vez disso.`, { confirmLabel: 'Eliminar', destructive: true })
    if (!confirmed) return
    setBusyId(room.id)
    try { await deleteSpaceRoomAction(room.id); setRooms(prev => prev.filter(item => item.id !== room.id)); showAlert('Sala eliminada', 'A sala/campo foi removida.', 'success') }
    catch (error) { showAlert('Não foi possível eliminar', error instanceof Error ? error.message : 'Erro inesperado.', 'error') }
    finally { setBusyId(null) }
  }

  async function uploadFiles(files: File[], room: SpaceRoom) {
    if (!files.length) return
    setBusyId(room.id)
    try {
      const data = new FormData(); files.forEach(file => data.append('files', file))
      const result = await uploadSpaceRoomPhotosAction(room.id, data)
      setRooms(prev => prev.map(item => item.id === room.id ? { ...item, gallery_urls: result.galleryUrls } : item))
      showAlert('Fotos carregadas', `${files.length} fotografia(s) adicionada(s).`, 'success')
    } catch (error) { showAlert('Erro no upload', error instanceof Error ? error.message : 'Não foi possível carregar as fotografias.', 'error') }
    finally { setBusyId(null); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  async function addUrl(room: SpaceRoom) {
    setBusyId(room.id)
    try {
      const result = await addSpaceRoomPhotoUrlAction(room.id, photoUrl)
      setRooms(prev => prev.map(item => item.id === room.id ? { ...item, gallery_urls: result.galleryUrls } : item))
      setPhotoUrl('')
    } catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível adicionar a fotografia.', 'error') }
    finally { setBusyId(null) }
  }

  async function removePhoto(room: SpaceRoom, url: string) {
    setBusyId(room.id)
    try {
      const result = await removeSpaceRoomPhotoAction(room.id, url)
      setRooms(prev => prev.map(item => item.id === room.id ? { ...item, gallery_urls: result.galleryUrls } : item))
    } catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível remover a fotografia.', 'error') }
    finally { setBusyId(null) }
  }

  return (
    <div className="space-y-5">
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={event => { const room = rooms.find(item => item.id === photoRoomId); if (room) void uploadFiles(Array.from(event.target.files || []), room) }} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-semibold">Inventário reservável</h2><p className="text-sm text-muted-foreground">Cada sala/campo possui preço, capacidade, fotos e disponibilidade próprios.</p></div><Button onClick={openCreate} className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" />Adicionar sala/campo</Button></div>

      {rooms.length === 0 ? <div className="rounded-2xl border border-dashed bg-card p-10 text-center"><CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/35" /><h3 className="mt-3 font-semibold">Sem salas ou campos</h3><p className="mt-2 text-sm text-muted-foreground">Adicione o primeiro sub-espaço para configurar reservas.</p><Button onClick={openCreate} className="mt-5"><Plus className="mr-2 h-4 w-4" />Criar</Button></div> : (
        <div className="space-y-4">
          {rooms.map(room => {
            const active = room.is_active !== false
            const gallery = room.gallery_urls || []
            const busy = busyId === room.id
            return (
              <Card key={room.id} className={!active ? 'opacity-70' : ''}><CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{room.name}</h3><Badge variant={active ? 'success' : 'secondary'}>{active ? 'Ativa' : 'Inativa'}</Badge></div><p className="mt-1 text-sm text-muted-foreground">Capacidade: {room.capacity || 1} · {Number(room.price_per_hour || 0) > 0 ? `${Number(room.price_per_hour).toFixed(2)} €/hora` : 'Gratuito'}</p>{room.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{room.description}</p>}</div>
                  <DropdownMenu><DropdownMenuTrigger render={<Button variant="ghost" size="icon" disabled={busy} aria-label="Ações"><MoreVertical className="h-4 w-4" /></Button>} /><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => openEdit(room)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem><DropdownMenuItem onClick={() => void toggle(room)}><Power className="mr-2 h-4 w-4" />{active ? 'Desativar' : 'Ativar'}</DropdownMenuItem><DropdownMenuItem onClick={() => setAvailabilityRoom(room)}><CalendarDays className="mr-2 h-4 w-4" />Disponibilidade</DropdownMenuItem><DropdownMenuItem className="text-destructive" onClick={() => void remove(room)}><Trash2 className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
                </div>

                <div className="mt-4 border-t pt-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><h4 className="flex items-center gap-2 text-sm font-semibold"><Camera className="h-4 w-4 text-primary" />Fotos ({gallery.length}{maxPhotos !== null ? `/${maxPhotos}` : ''})</h4><Button variant="outline" size="sm" disabled={busy || (maxPhotos !== null && gallery.length >= maxPhotos)} onClick={() => { setPhotoRoomId(room.id); fileInputRef.current?.click() }}><Upload className="mr-2 h-4 w-4" />Carregar</Button></div>
                  {gallery.length > 0 && <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6">{gallery.map((url, index) => <div key={`${url}-${index}`} className="relative aspect-square overflow-hidden rounded-xl border bg-muted"><img src={url} alt={`${room.name} ${index + 1}`} className="h-full w-full object-cover" /><button type="button" onClick={() => void removePhoto(room, url)} disabled={busy} className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-destructive shadow-sm" aria-label="Remover foto"><X className="h-4 w-4" /></button></div>)}</div>}
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]"><Input type="url" placeholder="URL HTTPS opcional" value={photoRoomId === room.id ? photoUrl : ''} onFocus={() => setPhotoRoomId(room.id)} onChange={event => { setPhotoRoomId(room.id); setPhotoUrl(event.target.value) }} /><Button variant="secondary" disabled={busy || photoRoomId !== room.id || !photoUrl.trim()} onClick={() => void addUrl(room)}><ImageIcon className="mr-2 h-4 w-4" />Adicionar URL</Button></div>
                </div>
              </CardContent></Card>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{editingId ? 'Editar sala/campo' : 'Nova sala/campo'}</DialogTitle></DialogHeader><form onSubmit={submit} className="space-y-4"><div className="space-y-2"><Label htmlFor="room-name">Nome</Label><Input id="room-name" value={form.name} onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))} required maxLength={160} /></div><div className="space-y-2"><Label htmlFor="room-description">Descrição</Label><Textarea id="room-description" value={form.description} onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))} rows={3} maxLength={3000} /></div><div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label htmlFor="room-capacity">Capacidade</Label><Input id="room-capacity" type="number" min="1" value={form.capacity} onChange={event => setForm(prev => ({ ...prev, capacity: Number(event.target.value) }))} required /></div><div className="space-y-2"><Label htmlFor="room-price">€/hora</Label><Input id="room-price" type="number" min="0" step="0.01" value={form.price} onChange={event => setForm(prev => ({ ...prev, price: Number(event.target.value) }))} required /></div></div><Button type="submit" className="w-full" disabled={saving}>{saving ? 'A guardar…' : editingId ? 'Guardar alterações' : 'Criar sala/campo'}</Button></form></DialogContent></Dialog>

      <RoomAvailabilityModal open={Boolean(availabilityRoom)} onOpenChange={open => !open && setAvailabilityRoom(null)} roomId={availabilityRoom?.id || null} roomName={availabilityRoom?.name || ''} />
    </div>
  )
}
