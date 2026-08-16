'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createPostAction } from '@/app/actions/feed'
import { Loader2, PenLine, Send, Image as ImageIcon, X } from 'lucide-react'
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

  if (!canPublish) {
    return null
  }

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isSupportedMedia = file.type.startsWith('image/') || file.type.startsWith('video/')
    if (!isSupportedMedia) {
      showAlert('Erro', 'Apenas imagens e vídeos são permitidos.', 'error')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      showAlert('Erro', 'O ficheiro não pode exceder 10MB.', 'error')
      return
    }

    setMediaFile(file)
    setMediaPreview(URL.createObjectURL(file))
  }

  const clearMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !mediaFile) return
    if (content.trim().length > 5000) {
      showAlert('Erro', 'A publicação excede o limite de 5000 caracteres.', 'error')
      return
    }

    setLoading(true)
    try {
      let media_url = null
      let media_type = null

      if (mediaFile) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const fileExt = mediaFile.name.split('.').pop()
        const fileName = `${user.id}-post-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, mediaFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        media_url = publicUrl
        media_type = mediaFile.type.startsWith('video/') ? 'video' : 'image'
      }

      const result = await createPostAction(content, media_url, media_type)

      if (result?.error) {
        throw new Error(result.error)
      }

      setContent('')
      clearMedia()
    } catch (err: any) {
      showAlert('Erro', err.message || 'Erro ao publicar.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm backdrop-blur-sm md:p-5">
      <div className="mb-3 flex items-center justify-between border-b border-border/70 pb-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
          <PenLine className="h-3.5 w-3.5" />
          {currentUserType === 'venue_manager' ? 'Publicação do espaço' : 'Publicação oficial'}
        </div>
        <span className="text-[11px] font-medium text-muted-foreground">Qualidade visual recomendada: 1200x1200</span>
      </div>

      <div className="flex gap-4">
        <img
          src={currentUserAvatar || 'https://i.pravatar.cc/150'}
          alt={currentUserName}
          className="h-11 w-11 shrink-0 rounded-full border border-border object-cover"
        />
        <form onSubmit={handleSubmit} className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Partilha uma novidade com a tua audiência..."
            className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            rows={3}
            maxLength={5000}
          />
          <div className="text-right text-[11px] text-muted-foreground">
            {content.length}/5000
          </div>

          {mediaPreview && (
            <div className="relative mt-2 inline-block rounded-xl border border-border bg-muted/30 p-1">
              {mediaFile?.type.startsWith('video/') ? (
                <video src={mediaPreview} className="max-h-48 rounded-lg object-contain bg-black/5" controls />
              ) : (
                <img src={mediaPreview} alt="Preview" className="max-h-48 rounded-lg object-cover" />
              )}
              <button
                type="button"
                onClick={clearMedia}
                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-sm hover:bg-destructive/90"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Foto/Vídeo</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleMediaChange}
                  disabled={loading}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || (!content.trim() && !mediaFile)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Publicar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
