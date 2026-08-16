'use client'

import { useRef, useState } from 'react'
import { Camera, Eye, EyeOff, LayoutTemplate, Trash2, Upload, User } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  deleteGalleryPhotoAction,
  setGalleryFeaturedImageAction,
  toggleGalleryVisibilityAction,
  uploadGalleryPhotosAction,
} from '@/app/dashboard/galeria/actions'

interface Props {
  userId: string
  entity: { type: 'professional' | 'venue_manager'; data: any }
  maxPhotos: number | null
}

export function GaleriaManagerV2({ entity, maxPhotos }: Props) {
  const { showAlert, showConfirm } = useModal()
  const inputRef = useRef<HTMLInputElement>(null)
  const entityRef = { type: entity.type, id: entity.data.id } as const
  const [publicGallery, setPublicGallery] = useState<string[]>(entity.data.gallery_urls || [])
  const [privateGallery, setPrivateGallery] = useState<string[]>(entity.data.private_gallery_urls || [])
  const [cover, setCover] = useState(entity.data.cover_url || '')
  const [avatar, setAvatar] = useState(entity.type === 'venue_manager' ? entity.data.logo_url || '' : entity.data.avatar_url || '')
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'all' | 'public' | 'private'>('all')

  const total = publicGallery.length + privateGallery.length
  const limitReached = maxPhotos !== null && total >= maxPhotos

  async function uploadFiles(files: File[]) {
    if (!files.length) return
    if (maxPhotos !== null && total + files.length > maxPhotos) {
      showAlert('Limite do plano', `O seu plano permite no máximo ${maxPhotos} fotografias.`, 'error')
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))
      const result = await uploadGalleryPhotosAction(entityRef, formData)
      setPublicGallery(result.publicGallery)
      setPrivateGallery(result.privateGallery)
      showAlert('Galeria atualizada', `${files.length} fotografia(s) carregada(s) com sucesso.`, 'success')
    } catch (error) {
      showAlert('Erro ao carregar fotografias', error instanceof Error ? error.message : 'Erro inesperado.', 'error')
    } finally {
      setSaving(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function toggleVisibility(url: string, isPublic: boolean) {
    setSaving(true)
    try {
      const result = await toggleGalleryVisibilityAction(entityRef, url, !isPublic)
      setPublicGallery(result.publicGallery)
      setPrivateGallery(result.privateGallery)
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível atualizar a fotografia.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function removePhoto(url: string) {
    const confirmed = await showConfirm('Eliminar fotografia', 'Esta fotografia será removida da galeria. Continuar?', 'destructive')
    if (!confirmed) return
    setSaving(true)
    try {
      const result = await deleteGalleryPhotoAction(entityRef, url)
      setPublicGallery(result.publicGallery)
      setPrivateGallery(result.privateGallery)
      setCover(result.cover)
      setAvatar(result.avatar)
      showAlert('Fotografia eliminada', 'A fotografia foi removida com sucesso.', 'success')
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível eliminar a fotografia.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function selectCover(url: string) {
    const next = cover === url ? '' : url
    setSaving(true)
    try {
      const result = await setGalleryFeaturedImageAction(entityRef, next, 'cover')
      setCover(result.value)
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível atualizar a capa.', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function selectAvatar(url: string) {
    const next = avatar === url ? '' : url
    setSaving(true)
    try {
      const result = await setGalleryFeaturedImageAction(entityRef, next, 'avatar')
      setAvatar(result.value)
    } catch (error) {
      showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível atualizar a imagem principal.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const items = [
    ...publicGallery.map(url => ({ url, isPublic: true })),
    ...privateGallery.map(url => ({ url, isPublic: false })),
  ].filter(item => tab === 'all' || (tab === 'public' ? item.isPublic : !item.isPublic))

  return (
    <div className="space-y-5">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={e => void uploadFiles(Array.from(e.target.files || []))}
      />

      <Card>
        <CardHeader className="space-y-4 sm:flex sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5 text-primary" />Galeria</CardTitle>
            <CardDescription>{maxPhotos === null ? `${total} fotos · ilimitado` : `${total} de ${maxPhotos} fotos utilizadas`}</CardDescription>
          </div>
          <Button className="w-full sm:w-auto" onClick={() => inputRef.current?.click()} disabled={saving || limitReached}>
            <Upload className="mr-2 h-4 w-4" />{saving ? 'A guardar…' : 'Carregar fotos'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 sm:flex">
            <Button size="sm" variant={tab === 'all' ? 'default' : 'outline'} onClick={() => setTab('all')}>Todas</Button>
            <Button size="sm" variant={tab === 'public' ? 'default' : 'outline'} onClick={() => setTab('public')}>Públicas</Button>
            <Button size="sm" variant={tab === 'private' ? 'default' : 'outline'} onClick={() => setTab('private')}>Privadas</Button>
          </div>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Camera className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p className="font-medium text-foreground">A galeria está vazia.</p>
            <p className="mt-1 text-sm">Carregue fotografias para apresentar o seu perfil ou espaço.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map(item => (
            <Card key={`${item.isPublic}-${item.url}`} className="overflow-hidden">
              <div className="relative aspect-[4/3] bg-muted sm:aspect-square">
                <img src={item.url} alt="Fotografia da galeria" className="h-full w-full object-cover" />
                <div className="absolute left-2 top-2 flex flex-col gap-1">
                  {cover === item.url && <Badge>Capa</Badge>}
                  {avatar === item.url && <Badge variant="secondary">Principal</Badge>}
                  <Badge variant="outline" className="bg-background/90">{item.isPublic ? 'Pública' : 'Privada'}</Badge>
                </div>
              </div>
              <CardContent className="space-y-2 p-3">
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Button size="sm" variant="outline" disabled={saving} onClick={() => void toggleVisibility(item.url, item.isPublic)}>
                    {item.isPublic ? <EyeOff className="mr-1.5 h-3.5 w-3.5" /> : <Eye className="mr-1.5 h-3.5 w-3.5" />}
                    {item.isPublic ? 'Tornar privada' : 'Tornar pública'}
                  </Button>
                  <Button size="sm" variant="destructive" disabled={saving} aria-label="Eliminar fotografia" onClick={() => void removePhoto(item.url)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant={cover === item.url ? 'default' : 'outline'} disabled={saving} onClick={() => void selectCover(item.url)}>
                    <LayoutTemplate className="mr-1.5 h-3.5 w-3.5" />Capa
                  </Button>
                  <Button size="sm" variant={avatar === item.url ? 'default' : 'outline'} disabled={saving} onClick={() => void selectAvatar(item.url)}>
                    <User className="mr-1.5 h-3.5 w-3.5" />Principal
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
