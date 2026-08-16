'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2, Trash2, Upload, Eye, EyeOff, User, LayoutTemplate } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useModal } from '@/components/providers/modal-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  userId: string
  entity: { type: 'professional' | 'venue_manager'; data: any }
  maxPhotos: number | null
}

export function GaleriaManagerV2({ userId, entity, maxPhotos }: Props) {
  const { showAlert } = useModal()
  const inputRef = useRef<HTMLInputElement>(null)
  const [publicGallery, setPublicGallery] = useState<string[]>(entity.data.gallery_urls || [])
  const [privateGallery, setPrivateGallery] = useState<string[]>(entity.data.private_gallery_urls || [])
  const [cover, setCover] = useState(entity.data.cover_url || '')
  const [avatar, setAvatar] = useState(entity.type === 'venue_manager' ? entity.data.logo_url || '' : entity.data.avatar_url || '')
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'all' | 'public' | 'private'>('all')

  const total = publicGallery.length + privateGallery.length
  const limitReached = maxPhotos !== null && total >= maxPhotos

  async function persist(pub: string[], priv: string[], nextCover = cover, nextAvatar = avatar) {
    const supabase = createClient()
    const table = entity.type === 'professional' ? 'professionals' : 'sport_spaces'
    const payload: any = { gallery_urls: pub, private_gallery_urls: priv, cover_url: nextCover }
    if (entity.type === 'professional') payload.avatar_url = nextAvatar
    else payload.logo_url = nextAvatar

    const { error } = await supabase.from(table).update(payload).eq('id', entity.data.id)
    if (error) throw error
    if (entity.type === 'professional') {
      await supabase.from('platform_users').update({ avatar_url: nextAvatar || null }).eq('id', userId)
    }
  }

  async function uploadFiles(files: File[]) {
    if (!files.length) return
    if (maxPhotos !== null && total + files.length > maxPhotos) {
      showAlert('Limite do plano', `O seu plano permite no máximo ${maxPhotos} fotografias.`, 'error')
      return
    }

    setSaving(true)
    const supabase = createClient()
    const uploadedUrls: string[] = []
    try {
      for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Apenas JPEG, PNG e WebP são permitidos.')
        if (file.size > 5 * 1024 * 1024) throw new Error('Cada imagem pode ter no máximo 5 MB.')
        const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `${userId}/gallery/${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { cacheControl: '3600', upsert: false })
        if (uploadError) throw uploadError
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        uploadedUrls.push(data.publicUrl)
      }

      const next = [...publicGallery, ...uploadedUrls]
      await persist(next, privateGallery)
      setPublicGallery(next)
      showAlert('Galeria atualizada', `${uploadedUrls.length} fotografia(s) carregada(s) com sucesso.`, 'success')
    } catch (error) {
      for (const url of uploadedUrls) {
        const marker = '/storage/v1/object/public/avatars/'
        const path = url.split(marker)[1]
        if (path) await supabase.storage.from('avatars').remove([path])
      }
      showAlert('Erro ao carregar fotografias', error instanceof Error ? error.message : 'Erro inesperado', 'error')
    } finally {
      setSaving(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function toggleVisibility(url: string, isPublic: boolean) {
    setSaving(true)
    try {
      const pub = isPublic ? publicGallery.filter(item => item !== url) : [...publicGallery, url]
      const priv = isPublic ? [...privateGallery, url] : privateGallery.filter(item => item !== url)
      await persist(pub, priv)
      setPublicGallery(pub); setPrivateGallery(priv)
    } catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível atualizar a fotografia.', 'error') }
    finally { setSaving(false) }
  }

  async function removePhoto(url: string) {
    setSaving(true)
    const supabase = createClient()
    try {
      const pub = publicGallery.filter(item => item !== url)
      const priv = privateGallery.filter(item => item !== url)
      const nextCover = cover === url ? '' : cover
      const nextAvatar = avatar === url ? '' : avatar
      await persist(pub, priv, nextCover, nextAvatar)
      setPublicGallery(pub); setPrivateGallery(priv); setCover(nextCover); setAvatar(nextAvatar)

      const marker = '/storage/v1/object/public/avatars/'
      const path = url.split(marker)[1]
      if (path?.startsWith(`${userId}/`)) await supabase.storage.from('avatars').remove([path])
    } catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível eliminar a fotografia.', 'error') }
    finally { setSaving(false) }
  }

  async function selectCover(url: string) {
    const next = cover === url ? '' : url
    setSaving(true)
    try { await persist(publicGallery, privateGallery, next, avatar); setCover(next) }
    catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível atualizar a capa.', 'error') }
    finally { setSaving(false) }
  }

  async function selectAvatar(url: string) {
    const next = avatar === url ? '' : url
    setSaving(true)
    try { await persist(publicGallery, privateGallery, cover, next); setAvatar(next) }
    catch (error) { showAlert('Erro', error instanceof Error ? error.message : 'Não foi possível atualizar a foto de perfil.', 'error') }
    finally { setSaving(false) }
  }

  const items = [
    ...publicGallery.map(url => ({ url, isPublic: true })),
    ...privateGallery.map(url => ({ url, isPublic: false })),
  ].filter(item => tab === 'all' || (tab === 'public' ? item.isPublic : !item.isPublic))

  return <div className="space-y-6">
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={e => void uploadFiles(Array.from(e.target.files || []))} />
    <Card><CardHeader><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="flex items-center gap-2"><Camera className="h-5 w-5 text-primary" />Galeria</CardTitle><CardDescription>{maxPhotos === null ? `${total} fotos · ilimitado` : `${total} de ${maxPhotos} fotos utilizadas`}</CardDescription></div><Button onClick={() => inputRef.current?.click()} disabled={saving || limitReached}><Upload className="mr-2 h-4 w-4" />{saving ? 'A guardar…' : 'Carregar fotos'}</Button></div></CardHeader><CardContent><div className="flex gap-2"><Button size="sm" variant={tab === 'all' ? 'default' : 'outline'} onClick={() => setTab('all')}>Todas</Button><Button size="sm" variant={tab === 'public' ? 'default' : 'outline'} onClick={() => setTab('public')}>Públicas</Button><Button size="sm" variant={tab === 'private' ? 'default' : 'outline'} onClick={() => setTab('private')}>Privadas</Button></div></CardContent></Card>

    {items.length === 0 ? <Card><CardContent className="py-12 text-center text-muted-foreground"><Camera className="mx-auto mb-3 h-10 w-10 opacity-30" /><p>A galeria está vazia.</p></CardContent></Card> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map(item => <Card key={`${item.isPublic}-${item.url}`} className="overflow-hidden"><div className="relative aspect-square bg-muted"><img src={item.url} alt="Fotografia da galeria" className="h-full w-full object-cover" />{cover === item.url && <Badge className="absolute left-2 top-2">Capa</Badge>}{avatar === item.url && <Badge className="absolute left-2 top-9" variant="secondary">Perfil</Badge>}</div><CardContent className="space-y-2 p-3"><div className="flex gap-2"><Button size="sm" variant="outline" className="flex-1" onClick={() => void toggleVisibility(item.url, item.isPublic)}>{item.isPublic ? <EyeOff className="mr-1 h-3 w-3" /> : <Eye className="mr-1 h-3 w-3" />}{item.isPublic ? 'Privada' : 'Pública'}</Button><Button size="sm" variant="destructive" onClick={() => void removePhoto(item.url)}><Trash2 className="h-3 w-3" /></Button></div><div className="grid grid-cols-2 gap-2"><Button size="sm" variant={cover === item.url ? 'default' : 'outline'} onClick={() => void selectCover(item.url)}><LayoutTemplate className="mr-1 h-3 w-3" />Capa</Button><Button size="sm" variant={avatar === item.url ? 'default' : 'outline'} onClick={() => void selectAvatar(item.url)}><User className="mr-1 h-3 w-3" />Perfil</Button></div></CardContent></Card>)}</div>}
  </div>
}
