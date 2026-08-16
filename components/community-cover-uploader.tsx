'use client'

import { useRef, useState } from 'react'
import { Camera, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { setCommunityCoverAction } from '@/app/dashboard/comunidades/actions'
import { Button } from '@/components/ui/button'
import { useModal } from '@/components/providers/modal-provider'

export function CommunityCoverUploader({ communityId, userId, initialUrl }: { communityId: string; userId: string; initialUrl?: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { showAlert } = useModal()
  const [url, setUrl] = useState(initialUrl || '')
  const [saving, setSaving] = useState(false)

  async function upload(file?: File) {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { showAlert('Imagem inválida', 'Use JPEG, PNG ou WebP.', 'error'); return }
    if (file.size > 5 * 1024 * 1024) { showAlert('Imagem demasiado grande', 'A imagem pode ter no máximo 5 MB.', 'error'); return }
    setSaving(true)
    const supabase = createClient()
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${userId}/communities/${communityId}/${crypto.randomUUID()}.${extension}`
    try {
      const { error } = await supabase.storage.from('avatars').upload(path, file, { contentType: file.type, upsert: false })
      if (error) throw error
      const result = await setCommunityCoverAction(communityId, path)
      setUrl(result.coverUrl)
      showAlert('Capa atualizada', 'A imagem da comunidade foi atualizada.', 'success')
    } catch (error) {
      await supabase.storage.from('avatars').remove([path]).catch(() => undefined)
      showAlert('Não foi possível carregar a imagem', error instanceof Error ? error.message : 'Erro inesperado.', 'error')
    } finally {
      setSaving(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return <div className="grid gap-3 sm:grid-cols-[180px_1fr] sm:items-center">
    <div className="aspect-[16/9] overflow-hidden rounded-xl border border-border bg-muted">{url ? <img src={url} alt="Capa da comunidade" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Camera className="h-8 w-8 text-muted-foreground" /></div>}</div>
    <div><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={event => void upload(event.target.files?.[0])} /><Button type="button" variant="outline" className="min-h-11 w-full sm:w-auto" disabled={saving} onClick={() => inputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />{saving ? 'A carregar…' : 'Alterar capa'}</Button><p className="mt-2 text-xs text-muted-foreground">JPEG, PNG ou WebP · máximo 5 MB.</p></div>
  </div>
}
