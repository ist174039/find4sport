'use client'

import { useEffect, useState } from 'react'
import { createPostAction } from '@/app/actions/feed'
import { Image as ImageIcon, Loader2, PenLine, Send, X } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'

export function CreatePostBox({
  currentUserType,
  currentUserName,
  currentUserAvatar,
  canPublish = false,
}: {
  currentUserType: string
  currentUserName: string
  currentUserAvatar: string
  canPublish?: boolean
}) {
  const { showAlert } = useModal()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)

  useEffect(() => () => { if (mediaPreview) URL.revokeObjectURL(mediaPreview) }, [mediaPreview])

  if (!canPublish) return null

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
    if (!allowed.includes(file.type)) {
      showAlert('Formato não suportado', 'Use JPEG, PNG, WebP, MP4, WebM ou MOV.', 'error')
      e.target.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      showAlert('Ficheiro demasiado grande', 'O ficheiro não pode exceder 10 MB.', 'error')
      e.target.value = ''
      return
    }
    if (mediaPreview) URL.revokeObjectURL(mediaPreview)
    setMediaFile(file)
    setMediaPreview(URL.createObjectURL(file))
  }

  const clearMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview)
    setMediaFile(null)
    setMediaPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !mediaFile) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.set('content', content)
      if (mediaFile) formData.set('media', mediaFile)
      const result = await createPostAction(formData)
      if (result?.error) throw new Error(result.error)
      setContent('')
      clearMedia()
      showAlert('Publicado', 'A publicação já está disponível no feed.', 'success')
    } catch (err: any) {
      showAlert('Erro ao publicar', err.message || 'Não foi possível criar a publicação.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-border pb-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
          <PenLine className="h-3.5 w-3.5" />
          {currentUserType === 'venue_manager' ? 'Publicar como espaço' : 'Publicar como profissional'}
        </div>
        <span className="hidden text-[11px] text-muted-foreground sm:inline">Até 5000 caracteres · media até 10 MB</span>
      </div>

      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-bold text-primary">
          {currentUserAvatar ? <img src={currentUserAvatar} alt={currentUserName} className="h-full w-full object-cover" /> : (currentUserName?.charAt(0)?.toUpperCase() || 'F')}
        </div>
        <form onSubmit={handleSubmit} className="min-w-0 flex-1 space-y-3">
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Partilhe uma novidade..." className="min-h-24 w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" rows={3} maxLength={5000} disabled={loading} />

          {mediaPreview && (
            <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30">
              {mediaFile?.type.startsWith('video/') ? <video src={mediaPreview} className="max-h-72 w-full bg-black object-contain" controls /> : <img src={mediaPreview} alt="Pré-visualização" className="max-h-72 w-full object-contain" />}
              <button type="button" onClick={clearMedia} className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 shadow-sm" aria-label="Remover ficheiro"><X className="h-4 w-4" /></button>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary">
              <ImageIcon className="h-4 w-4" /><span>Foto/Vídeo</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleMediaChange} disabled={loading} />
            </label>
            <button type="submit" disabled={loading || (!content.trim() && !mediaFile)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Publicar
            </button>
          </div>
          <p className="text-right text-[11px] text-muted-foreground">{content.length}/5000</p>
        </form>
      </div>
    </div>
  )
}
