'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createPostAction } from '@/app/actions/feed'
import {  Loader2, PenLine, Send, Image as ImageIcon, Video, X  } from 'lucide-react'
import { useModal } from '@/components/providers/modal-provider'

export function CreatePostBox({
  currentUserType,
  currentUserName,
  currentUserAvatar
}: {
  currentUserType: string
  currentUserName: string
  currentUserAvatar: string
}) {
  const { showAlert } = useModal()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)

  if (currentUserType !== 'professional' && currentUserType !== 'espaco') {
    return null
  }

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
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
    <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
      <div className="flex gap-4">
        <img 
          src={currentUserAvatar || 'https://i.pravatar.cc/150'} 
          alt={currentUserName} 
          className="w-10 h-10 rounded-full object-cover shrink-0 border border-border" 
        />
        <form onSubmit={handleSubmit} className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Partilha uma novidade com a tua audiência..."
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
            rows={2}
          />
          
          {mediaPreview && (
            <div className="relative inline-block mt-2">
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
              <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <PenLine className="w-3.5 h-3.5" /> Oficial
              </div>
              
              <label className="cursor-pointer text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-medium">
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
              className="bg-primary text-primary-foreground px-5 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
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
